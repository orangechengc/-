const service = "https://orangechengc-contest-questions.zhuzhuyb.chatgpt.site";
const el = id => document.getElementById(id);
const form = el("qa-form");
const search = el("qa-search");
const feedback = el("qa-feedback");
const withdraw = el("qa-withdraw");
const more = el("qa-more");
const retry = el("qa-retry");
el("qa-admin").href = service + "/admin";

let receipt = "";
try { receipt = sessionStorage.getItem("last-question") || ""; } catch {}
withdraw.hidden = !receipt;
function remember(value) {
  receipt = value;
  withdraw.hidden = !value;
  try {
    if (value) sessionStorage.setItem("last-question", value);
    else sessionStorage.removeItem("last-question");
  } catch {}
}
function textElement(tag, content, cls) {
  const node = document.createElement(tag);
  node.textContent = content;
  if (cls) node.className = cls;
  return node;
}
function button(label, cls="qa-secondary") {
  const element = textElement("button",label,cls);
  element.type = "button";
  return element;
}
function questionItem(row) {
  const item = document.createElement("article");
  item.className = "qa-item";
  const author = row.editorial ? "橙橙成整理" : "访客";
  const header = textElement("div",author + " · " + row.created.slice(0,10),"qa-byline");
  item.append(header, textElement("p",row.question,"qa-message"));
  if (row.answer) {
    const owner = textElement("div","","qa-answer");
    owner.append(textElement("b","橙橙成答复"),textElement("p",row.answer));
    if (row.source) {
      const link = textElement("a",row.source.title);
      link.href = row.source.url;
      owner.append(link);
    }
    item.append(owner);
  }
  const panel = document.createElement("details");
  panel.className = "qa-thread";
  const summary = document.createElement("summary");
  const updateSummary = () => { summary.textContent = row.replyCount ? "查看与回复（" + row.replyCount + "）" : "回复这条留言"; };
  updateSummary();
  const feed = document.createElement("div");
  const next = button("查看更多回复");
  const status = textElement("p","","meta");
  status.setAttribute("role","status");
  const replyForm = document.createElement("form");
  replyForm.className = "qa-reply-form";
  const label = textElement("label","你的回复");
  const field = document.createElement("textarea");
  field.required = true;
  field.maxLength = 600;
  field.rows = 2;
  label.append(field);
  const post = button("公开回复","qa-primary");
  post.type = "submit";
  replyForm.append(label,post);
  panel.append(summary,feed,next,replyForm,status);
  item.append(panel);

  let before, requestId=0, draft="", token="";
  const keyFor = id => "qa-reply-receipt-" + id;
  const session = (key,value) => {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else if (value !== undefined) sessionStorage.setItem(key,value);
      else return sessionStorage.getItem(key);
    } catch {}
  };
  const owned = new Map();
  function replyItem(reply) {
    const entry = textElement("div","","qa-answer");
    entry.append(textElement("b","访客回复"),textElement("p",reply.body),textElement("small",reply.created.slice(0,10)));
    const key = keyFor(reply.id);
    const receipt = owned.get(reply.id) || session(key);
    if (receipt) {
      const undo = button("撤回我的回复");
      undo.onclick = async () => {
        undo.disabled = true;
        try {
          await send("/api/withdraw-reply",new URLSearchParams({receipt}));
          session(key,null);
          owned.delete(reply.id);
          entry.remove();
          row.replyCount = Math.max(0,row.replyCount-1);
          updateSummary();
          status.textContent = "回复已撤回。";
        } catch (error) { status.textContent = error.message; undo.disabled=false; }
      };
      entry.append(undo);
    }
    return entry;
  }
  async function readReplies(reset) {
    const version = ++requestId;
    if (reset) { before = undefined; feed.replaceChildren(); }
    next.hidden = true;
    const params = new URLSearchParams({thread:row.id});
    if (before) params.set("before",before);
    try {
      const response = await fetch(service+"/api/replies?"+params,{credentials:"omit"});
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (version !== requestId) return;
      for (const reply of data.items) feed.append(replyItem(reply));
      before = data.items.at(-1)?.id || before;
      next.textContent = "查看更多回复";
      next.hidden = !data.more;
    } catch {
      if (version !== requestId) return;
      status.textContent = "暂时无法加载回复。";
      next.textContent = "重试加载回复";
      next.hidden=false;
    }
  }
  next.hidden=true;
  next.onclick=()=>readReplies(false);
  panel.ontoggle=()=>{ if(panel.open) readReplies(true); };
  replyForm.onsubmit=async event=>{
    event.preventDefault();
    const body = field.value.trim();
    if (!body || post.disabled) return;
    if (body !== draft) { draft = body; token=crypto.randomUUID(); }
    post.disabled = true;
    field.readOnly = true;
    try {
      const result = await send("/api/replies",new URLSearchParams({thread:row.id,body,receipt:token}));
      owned.set(result.id, token);
      session(keyFor(result.id),token);
      row.replyCount++;
      updateSummary();
      draft="";
      field.value="";
      status.textContent="回复已公开。";
      await readReplies(true);
    } catch (error) { status.textContent=error.status ? error.message : "未能确认发表结果，请重试。"; }
    finally { post.disabled=false; field.readOnly=false; }
  };
  return item;
}
let sequence = 0, nextPage = 1, timer;
async function loadPage(reset) {
  const seq = ++sequence;
  const list = el("qa-list");
  const status = el("qa-status");
  if (reset) { nextPage = 1; list.replaceChildren(); }
  more.hidden = retry.hidden = true;
  status.textContent = "正在加载留言…";
  try {
    const params = new URLSearchParams({q:search.value.trim(),page:String(nextPage)});
    const response = await fetch(service + "/api/comments?" + params, {credentials:"omit"});
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (seq !== sequence) return;
    for (const row of data.items) list.append(questionItem(row));
    nextPage++;
    more.hidden = !data.more;
    status.textContent = list.children.length ? "展开留言即可查看或发表回复。" :
      (search.value.trim() ? "没有找到匹配的留言或回复。" : "还没有公开留言，欢迎发表第一条。");
  } catch {
    if (seq !== sequence) return;
    status.textContent = "暂时无法加载讨论。";
    retry.hidden = false;
  }
}
export function showQuestions() {
  clearTimeout(timer);
  loadPage(true);
}
search.addEventListener("input", () => {
  sequence++;
  clearTimeout(timer);
  more.hidden = retry.hidden = true;
  timer = setTimeout(() => loadPage(true), 250);
});
more.onclick = retry.onclick = () => loadPage(false);

async function send(path, params) {
  const response = await fetch(service + path, {method:"POST", body:params, credentials:"omit"});
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.error || "提交失败，请稍后重试。");
    error.status = response.status;
    throw error;
  }
  return response.json();
}
let draftKey = "", draftReceipt = "";
form.addEventListener("submit", async event => {
  event.preventDefault();
  const submit = form.querySelector("button[type=submit]");
  if (submit.disabled) return;
  const params = new URLSearchParams(new FormData(form));
  params.set("question",params.get("question").trim());
  if (!params.get("question")) { feedback.textContent = "请填写留言内容。"; return; }
  const key = params.toString();
  if (draftKey !== key) { draftKey = key; draftReceipt = crypto.randomUUID(); }
  params.set("receipt",draftReceipt);
  submit.disabled = withdraw.disabled = true;
  feedback.textContent = "正在提交…";
  try {
    await send("/api/comments",params);
    remember(draftReceipt);
    draftKey = "";
    form.reset();
    feedback.textContent = "留言已公开，大家现在可以回复了。";
    search.value = "";
    await loadPage(true);
  } catch (error) {
    feedback.textContent = error.status ? error.message : "未能确认提交结果，请重试。";
  } finally { submit.disabled = withdraw.disabled = false; }
});
withdraw.addEventListener("click",async () => {
  const submit = form.querySelector("button[type=submit]");
  withdraw.disabled = submit.disabled = true;
  try {
    await send("/api/withdraw",new URLSearchParams({receipt}));
    remember("");
    feedback.textContent = "留言已撤回。";
    await loadPage(true);
  } catch (error) {

    feedback.textContent = error.status ? error.message : "未能确认撤回结果，请重试。";
  } finally { withdraw.disabled = submit.disabled = false; }
});
