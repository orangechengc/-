const HOME = "https://orangechengc.github.io/-/#questions";
const ORIGIN = new URL(HOME).origin;
const SIZE = 20;
const studentQuestions = [
  {
    key: "graduation",
    question: "老大，我本科没做过项目，大一高数还挂过一次。要是到毕业连个竞赛奖都没有，我还能考研吗？",
    answer: "可以。考研统考的一般报考条件里，没有要求本科生必须做过项目、拿过竞赛奖。挂过一门课也不会自动取消报考资格。你眼下最值得弄清楚的是：这门课补考或重修过了没有，会不会影响你在录取当年按学校规定的时间拿到毕业证。如果毕业进度没问题，就安心准备目标专业的考试。别因为成绩单上有一个红过的数字，就急着报三个比赛去补偿它。",
    source: {title: "教育部《2027年全国硕士研究生招生工作管理规定》", url: "https://yz.chsi.com.cn/kyzx/jybzc/202609/20260924/2293971511.html"}
  },
  {
    key: "university",
    question: "双非本科真的能考 985 吗？我都没敢跟室友说我想报哪所，怕最后没考上，人家笑我想得太多。",
    answer: "能报。符合学校和专业的报考条件，普通本科出身也可以报考 985。你可以先把这个目标留给自己，不用现在就说服谁。找出目标学院的招生目录、统考名额和往年复试办法，再挑一套你能找到的专业课样题做一做。做到哪儿开始吃力、那几章能不能补，这些信息比室友的一句“太难了”更值得拿来做决定。",
    source: {title: "中国人民大学硕士研究生招生简章", url: "https://yz.chsi.com.cn/zsgs/zsjz/detail.action?schCode=10002&zsgsId=3551120189"}
  },
  {
    key: "interview",
    question: "我最怕复试老师问：‘那你本科四年做过什么？’我脑子里只有上课、考试、交作业。这句话到底怎么接啊？",
    answer: "你先翻翻电脑里交过的作业。有没有哪一次实验结果不对，你查了半天才找到原因？哪一份小组报告里，有一页数据是你自己整理、自己得出结论的？挑一件，把原文件打开，试着讲清楚“我要解决什么、我做了哪一步、结果怎样”。“课程实验里我把单位弄混了，后来用原始数据重新验算了一遍”，就已经是一段可以接着聊的经历。课程作业大大方方说是课程作业，细节讲得清楚就好。"
  },
  {
    key: "first-contest",
    question: "大三了才第一次点进竞赛网站。招募帖都写‘有经验优先’，那我这种第一次的人，到底要去哪儿攒第一次经验啊？",
    answer: "这句话确实容易让人连私聊都不敢点。你可以挑一个真感兴趣的队伍，问得具体一点：“我是第一次参赛，会用 Excel 整理数据。你们现在有没有一小块任务，我可以先拿几行样例试做，周五前给你们看？” 对方能判断需不需要你，你也能知道自己做不做得来。如果暂时没人组你，就拿往届公开题做出那一页样例。下次再联系队伍，你手上已经有东西能给别人看了。"
  },
  {
    key: "study-hours",
    question: "室友考研从早上七点学到晚上十点。我下午还有实验课，晚上回来只能学两个小时。每次看她的打卡时长，我都觉得今天又输了。",
    answer: "你下午做实验的那几个小时，也是实打实要上的课。给自己的两小时定一个做完能检查的任务，比如今晚弄懂三道错题，明晚把答案合上再做一遍。周末看一眼，上周还不会的题现在能独立做出几道。如果确实进度慢了，你也能看出该调整哪一科。单看室友座位上的那盏灯，你很难知道自己的数学到底进步了多少。"
  },
  {
    key: "english",
    question: "英语四级考了三次还没过。我想考研，但每次一打开英语真题，就觉得四级都过不了的人看这个是不是有点好笑。",
    answer: "你当然可以打开那套题。今晚甚至可以只做一篇阅读，不用先掐表。做完挑两道错题，看看自己是卡在单词、长句，还是文章看懂了却选错了。三种情况要补的东西完全不同。比起盯着以前那张成绩单，弄清楚“我今天这两题为什么错”，会让你明天坐下来时知道该翻哪一页。"
  },
  {
    key: "career",
    question: "家里一直说读研才有出路，可我连自己喜不喜欢这个专业都不知道。我是真的想读研，还是单纯害怕出去找工作？",
    answer: "两种心情可以同时有，你也不用今晚就把自己想明白。找一个在读的学长姐，别只问“读研值不值”，可以问“你上周具体在做什么，哪件事最耗时间？”再找一个你可能会投的岗位，看看它要求你每天做些什么。听到具体生活以后，你可能会发现，自己很想试试某个研究方向，也可能发现自己更期待去做一份工作。两种发现都值得认真对待。"
  },
  {
    key: "budget",
    question: "家里供我上学已经挺吃力了。别人都报考研班，我连几千块的课都舍不得买，又怕省了这笔钱，最后没考上会怪自己。",
    answer: "几千块对你和家里都是一笔真金白银，犹豫很正常。可以先拿手上的教材、图书馆资料和一道往年题，完整学一章。学完再问自己：我现在缺的是听懂这一章、有人批改答案，还是有人帮我定进度？如果卡在一道题，先拿着自己的解题过程去问任课老师。等你能说清楚自己需要买哪种帮助，再决定花多少钱，心里会踏实一些。"
  },
  {
    key: "teacher",
    question: "我不敢去问老师有没有项目。上学期这门课我才考了七十多分，老师估计连我是谁都不知道。我发消息会不会特别尴尬？",
    answer: "可以从一次课后请教开始。比如：“老师，我上学期上过您的课，最近把最后一次作业重新做了一遍，换了个方法，结果差得挺多。我把两次结果放在这一页了，您方便的时候能帮我看看，我应该从哪里查起吗？”前提是你真的动手试过。这样老师打开消息就知道怎么帮你，你也能借这次交流感受一下，自己愿不愿意在这个方向上再多花点时间。"
  },
  {
    key: "progress",
    question: "老大，有时候我觉得自己也没闲着，每天都在上课、背单词、看经验帖。可一学期过去，别人拿奖的拿奖，上岸的上岸。我连跟爸妈说一句‘我最近做成了什么’都说不出来。",
    answer: "看到别人发结果的时候，确实很容易突然对自己的生活失去把握。你可以先给这周留一件能收尾的小事，最好是你一直想解决的：把挂科那门课最怕的一章重新做一遍，或者把做了一半的课程作品跑通，拿给一个同学用。周日给爸妈打电话时，你就能讲一句很具体的话：“上次那个我一直算不出来的题，今天终于能自己讲明白了。” 这句话很普通，但它说的是你这一周真实发生的事。"
  }
];
const editorialPrefix = "editor:student-questions:";
const editorialSources = new Map(studentQuestions.filter(entry => entry.source).map(entry => [editorialPrefix + entry.key, entry.source]));
let collectionPublished = false;

async function publishStudentQuestions(db) {
  if (collectionPublished) return;
  // All ten rows are inserted atomically. Look up the marker even when archived.
  const marker = await db.prepare("SELECT 1 FROM questions WHERE receipt=?")
    .bind(editorialPrefix + studentQuestions[0].key).first();
  if (!marker) {
    await db.prepare(`
      INSERT INTO questions (receipt, question, answer, state, bucket)
      SELECT ? || json_extract(value,'$.key'), json_extract(value,'$.question'),
        json_extract(value,'$.answer'), 'published', 'editorial'
      FROM json_each(?) WHERE true ORDER BY key DESC
      ON CONFLICT(receipt) DO NOTHING
    `).bind(editorialPrefix,JSON.stringify(studentQuestions)).run();
  }
  collectionPublished = true;
}
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
function page(items) {
  return json({items:items.slice(0, SIZE), more:items.length > SIZE});
}
async function readDiscussion(db, url) {
  if (url.pathname === "/api/replies") {
    const thread = Number(url.searchParams.get("thread"));
    const before = Number(url.searchParams.get("before") || Number.MAX_SAFE_INTEGER);
    const rows = await db.prepare(`
      SELECT r.id, r.body, r.created FROM replies r
      JOIN questions q ON q.id=r.question_id AND q.state='published'
      WHERE r.question_id=? AND r.id<? ORDER BY r.id DESC LIMIT ?
    `).bind(thread, before, SIZE+1).all();
    return page(rows.results);
  }
  const term = (url.searchParams.get("q") || "").trim().slice(0,120);
  const offset = (pageNumber(url)-1)*SIZE;
  if (url.pathname === "/api/questions") {
    // Older pages promise that questions stay private until the owner replies.
    const rows = await db.prepare("SELECT id,topic,question,answer,updated FROM questions WHERE state='published' AND answer<>'' AND instr(lower(topic||' '||question||' '||answer),lower(?))>0 ORDER BY updated DESC,id DESC LIMIT ? OFFSET ?")
      .bind(term,SIZE+1,offset).all();
    return page(rows.results);
  }
  await publishStudentQuestions(db);
  const rows = await db.prepare(`
    SELECT q.id, q.topic, q.question, q.answer, q.created, q.updated,
      CASE WHEN q.bucket='editorial' THEN q.receipt END AS editorialKey,
      (SELECT count(*) FROM replies r WHERE r.question_id=q.id) AS replyCount
    FROM questions q WHERE q.state='published' AND (
      instr(lower(q.topic||' '||q.question||' '||q.answer),lower(?))>0 OR
      EXISTS (SELECT 1 FROM replies r WHERE r.question_id=q.id AND instr(lower(r.body),lower(?))>0)
    ) ORDER BY q.id DESC LIMIT ? OFFSET ?
  `).bind(term,term,SIZE+1,offset).all();
  return page(rows.results.map(({editorialKey, ...row}) => ({
    ...row, editorial: Boolean(editorialKey), source: editorialSources.get(editorialKey)
  })));
}

async function publicApi(request, url, env) {
  const db = env.DB;
  const path = url.pathname;
  const collections = ["/api/questions", "/api/comments", "/api/replies"];
  if (request.method === "GET" && collections.includes(path)) return readDiscussion(db,url);
  if (request.method !== "POST" || ![...collections,"/api/withdraw","/api/withdraw-reply"].includes(path)) return json({error:"接口不存在。"},404);
  if (request.headers.get("Origin") !== ORIGIN) return json({error:"请从赛历页面提交。"},403);
  const data = await form(request);
  const receipt = data?.get("receipt") || "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(receipt)) return json({error:"请求格式无效，请刷新重试。"},400);
  if (path === "/api/withdraw-reply") {
    const result = await db.prepare("DELETE FROM replies WHERE receipt=?").bind(receipt).run();
    return result.meta.changes ? json({ok:true}) : json({error:"回复已撤回或不存在。"},404);
  }
  if (path === "/api/withdraw") {
    const result = await db.prepare(`
      DELETE FROM questions WHERE receipt=? AND state IN ('pending','published') AND answer=''
      AND NOT EXISTS (SELECT 1 FROM replies WHERE question_id=questions.id)
    `).bind(receipt).run();
    return result.meta.changes ? json({ok:true}) : json({error:"留言已有回复、已归档或已撤回。"},409);
  }
  const isReply = path === "/api/replies";
  const body = input(data.get(isReply ? "body" : "question"),600);
  const topic = input(data.get("topic") || "",100);
  const thread = Number(data.get("thread"));
  if (!body || topic===null || data.get("website") || (isReply && (!Number.isSafeInteger(thread) || thread<1))) {
    return json({error:"请填写 1–600 字的内容，比赛名称最多 100 字。"},400);
  }
  const client = request.headers.get("CF-Connecting-IP") || "shared";
  const hour = new Date().toISOString().slice(0,13);
  const hash = await crypto.subtle.digest("SHA-256",new TextEncoder().encode([env.RATE_SALT,hour,client].join("|")));
  const bucket = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2,"0")).join("");
  const quota = "(SELECT count(*) FROM questions WHERE bucket=?) + (SELECT count(*) FROM replies WHERE bucket=?) < ?";
  const limits = [bucket,bucket,client === "shared" ? 120 : 20];
  let existing;
  if (isReply) {
    const result = await db.prepare(`INSERT INTO replies(question_id,receipt,body,bucket)
      SELECT id,?,?,? FROM questions WHERE id=? AND state='published' AND ${quota}
      ON CONFLICT(receipt) DO NOTHING RETURNING id`).bind(receipt,body,bucket,thread,...limits).first();
    if (result) return json({ok:true,id:result.id},201);
    if (!await db.prepare("SELECT id FROM questions WHERE id=? AND state='published'").bind(thread).first()) return json({error:"这条留言已不可见。"},404);
    existing = await db.prepare("SELECT id FROM replies WHERE receipt=? AND question_id=? AND body=?").bind(receipt,thread,body).first();
  } else {
    const state = path === "/api/comments" ? "published" : "pending";
    const result = await db.prepare(`INSERT INTO questions(receipt,topic,question,bucket,state)
      SELECT ?,?,?,?,? WHERE ${quota} ON CONFLICT(receipt) DO NOTHING RETURNING id`)
      .bind(receipt,topic,body,bucket,state,...limits).first();
    if (result) return json({ok:true,id:result.id},201);
    existing = await db.prepare("SELECT id FROM questions WHERE receipt=? AND topic=? AND question=?").bind(receipt,topic,body).first();
  }
  return existing ? json({ok:true,id:existing.id},201) : json({error:"提交次数较多，请稍后再试。"},429);
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
