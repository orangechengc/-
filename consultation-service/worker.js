const HOME = "https://orangechengc.github.io/-/#questions";
const ORIGIN = new URL(HOME).origin;
const SIZE = 20;
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const json = (value, status = 200) => Response.json(value, {status, headers:{
  "Access-Control-Allow-Origin":ORIGIN, "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"
}});
function pageNumber(url) {
  const n = Number(url.searchParams.get("page"));
  return Number.isSafeInteger(n) && n > 0 && n < 100000 ? n : 1;
}
function input(value, limit) {
  return typeof value === "string" && value.trim().length <= limit ? value.trim() : null;
}
async function form(request) {
  if (!(request.headers.get("content-type") || "").startsWith("application/x-www-form-urlencoded")) return null;
  // Read a bounded body even when Content-Length is absent.
  const reader = request.body?.getReader();
  if (!reader) return null;
  let bytes = 0, body = "";
  const decoder = new TextDecoder();
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 40000) { await reader.cancel(); return null; }
    body += decoder.decode(value, {stream:true});
  }
  return new URLSearchParams(body + decoder.decode());
}
async function publicApi(request, url, env) {
  const db = env.DB;
  if (request.method === "GET" && url.pathname === "/api/questions") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
    const offset = (pageNumber(url) - 1) * SIZE;
    const {results} = await db.prepare(
      "SELECT id, topic, question, answer, updated FROM questions WHERE state='published' AND instr(lower(topic || ' ' || question || ' ' || answer),lower(?)) > 0 ORDER BY updated DESC,id DESC LIMIT ? OFFSET ?"
    ).bind(q, SIZE + 1, offset).all();
    return json({items:results.slice(0,SIZE), more:results.length>SIZE});
  }
  if (request.method !== "POST" || !["/api/questions","/api/withdraw"].includes(url.pathname)) return json({error:"接口不存在。"},404);
  if (request.headers.get("Origin") !== ORIGIN) return json({error:"请从赛历页面提交。"},403);
  const data = await form(request);
  const receipt = data?.get("receipt") || "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(receipt)) return json({error:"请求格式无效，请刷新重试。"},400);
  if (url.pathname === "/api/withdraw") {
    const result = await db.prepare("DELETE FROM questions WHERE receipt=? AND state='pending'").bind(receipt).run();
    return result.meta.changes ? json({ok:true}) : json({error:"问题已处理或已撤回。"},409);
  }
  const question = input(data.get("question"),600);
  const topic = input(data.get("topic") || "",100);
  if (!question || question.length < 4 || topic === null || data.get("website")) return json({error:"请填写 4–600 字的问题，比赛名称最多 100 字。"},400);
  const client = request.headers.get("CF-Connecting-IP") || "shared";
  const hash = await crypto.subtle.digest("SHA-256",new TextEncoder().encode([env.RATE_SALT,new Date().toISOString().slice(0,13),client].join("|")));
  const bucket = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,"0")).join("");
  const result = await db.prepare("INSERT INTO questions(receipt,topic,question,bucket) SELECT ?,?,?,? WHERE (SELECT count(*) FROM questions WHERE bucket=?) < ? ON CONFLICT(receipt) DO NOTHING")
    .bind(receipt,topic,question,bucket,bucket,client === "shared" ? 120 : 8).run();
  if (!result.meta.changes) {
    const previous = await db.prepare("SELECT question,topic FROM questions WHERE receipt=?").bind(receipt).first();
    if (!previous) return json({error:"本小时提交次数较多，请稍后再试。"},429);
    if (previous.question !== question || previous.topic !== topic) return json({error:"这次提问已提交，请刷新后另提新问题。"},409);
  }
  return json({ok:true},201);
}

function html(content, status=200) {
  const body = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>橙橙成 · 问答管理</title><style>body{max-width:48rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 system-ui;color:#293826;background:#fcfbf7}a{color:#326041}article{padding:1rem 1.25rem;margin:1rem 0;border:1px solid #deded4;border-radius:12px;background:white}p{white-space:pre-wrap;overflow-wrap:anywhere}textarea{box-sizing:border-box;width:100%;font:inherit;padding:.6rem}button{font:inherit;padding:.4rem .8rem;margin:.4rem .5rem 0 0;cursor:pointer}small{color:#586450}nav{display:flex;gap:1rem;flex-wrap:wrap}</style><main>'+content+'</main></html>';
  return new Response(body,{status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"}});
}
async function moderate(request,url,env) {
  const email = request.headers.get("oai-authenticated-user-email");
  if (!email || !request.headers.get("oai-authenticated-user-id")) {
    return html('<h1>问答管理</h1><a href="/signin-with-chatgpt?return_to=%2Fadmin">用站主的 ChatGPT 账号登录</a>',401);
  }
  if (!env.MODERATOR_EMAIL || email.toLowerCase() !== env.MODERATOR_EMAIL.toLowerCase()) return html("此页仅供站主管理。",403);
  if (request.method === "POST") {
    if (request.headers.get("Origin") !== url.origin) return html("提交来源无效。",403);
    const data = await form(request);
    const id = Number(data?.get("id"));
    const answer = input(data?.get("answer"),3000);
    const action = data?.get("action");
    if (!Number.isSafeInteger(id) || id<1 || !["publish","archive"].includes(action) || (action==="publish" && !answer)) return html("请填写 1–3000 字的答复。",400);
    const state = action === "publish" ? "published" : "archived";
    const change = await env.DB.prepare("UPDATE questions SET answer=?,state=?,updated=CURRENT_TIMESTAMP WHERE id=?").bind(answer||"",state,id).run();
    if (!change.meta.changes) return html("这条提问已被撤回。",404);
    return Response.redirect(url.origin+"/admin?state="+state,303);
  }
  if (request.method !== "GET") return html("请求方式无效。",405);
  const state = ["published","archived"].includes(url.searchParams.get("state")) ? url.searchParams.get("state") : "pending";
  const page = pageNumber(url);
  const {results} = await env.DB.prepare("SELECT id,topic,question,answer,created FROM questions WHERE state=? ORDER BY id DESC LIMIT ? OFFSET ?")
    .bind(state,SIZE+1,(page-1)*SIZE).all();
  const cards = results.slice(0,SIZE).map(row => '<article><small>#'+row.id+' · '+escape(row.created)+' UTC</small><h3>'+escape(row.topic||"比赛咨询")+'</h3><p>'+escape(row.question)+'</p><form method="post" action="/admin"><input type="hidden" name="id" value="'+row.id+'"><label>橙橙成的答复<textarea name="answer" rows="4" maxlength="3000" required>'+escape(row.answer)+'</textarea></label><button name="action" value="publish">公开问题与答复</button><button name="action" value="archive" formnovalidate>收起并归档</button></form></article>').join("");
  const link = (n,label) => '<a href="?state='+state+'&amp;page='+n+'">'+label+'</a>';
  return html('<a href="'+HOME+'">返回赛历</a><h1>问答管理</h1><nav><a href="?state=pending">待答</a><a href="?state=published">已公开</a><a href="?state=archived">已归档</a></nav>'+ (cards||'<p>此列表暂无提问。</p>') +'<nav>'+(page>1?link(page-1,"上一页"):"")+(results.length>SIZE?link(page+1,"下一页"):"")+'</nav>');
}
export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/admin") return await moderate(request,url,env);
      if (url.pathname.startsWith("/api/")) return await publicApi(request,url,env);
      return Response.redirect(HOME,302);
    } catch {
      return json({error:"服务暂时不可用，请稍后重试。"},503);
    }
  }
};
