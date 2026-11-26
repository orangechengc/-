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
function questionItem(row) {
  const item = document.createElement("details");
  item.className = "qa-item";
  const summary = document.createElement("summary");
  if (row.topic) summary.append(textElement("span",row.topic,"qa-topic"));
  summary.append(textElement("strong",row.question));
  const answer = document.createElement("div");
  answer.className = "qa-answer";
  answer.append(textElement("b","橙橙成答复"), textElement("p",row.answer), textElement("small",row.updated.slice(0,10)));
  item.append(summary,answer);
  return item;
}
let sequence = 0, nextPage = 1, timer;
async function loadPage(reset) {
  const seq = ++sequence;
  const list = el("qa-list");
  const status = el("qa-status");
  if (reset) { nextPage = 1; list.replaceChildren(); }
  more.hidden = retry.hidden = true;
  status.textContent = "正在加载问答…";
  try {
    const params = new URLSearchParams({q:search.value.trim(),page:String(nextPage)});
    const response = await fetch(service + "/api/questions?" + params, {credentials:"omit"});
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (seq !== sequence) return;
    for (const row of data.items) list.append(questionItem(row));
    nextPage++;
    more.hidden = !data.more;
    status.textContent = list.children.length ? "点击问题查看橙橙成的答复。" :
      (search.value.trim() ? "没有找到相关答复，可以换个关键词或直接提问。" : "目前还没有公开答复。你可以提交第一个问题。");
  } catch {
    if (seq !== sequence) return;
    status.textContent = "暂时无法加载问答。";
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
}
let draftKey = "", draftReceipt = "";
form.addEventListener("submit", async event => {
  event.preventDefault();
  const submit = form.querySelector("button[type=submit]");
  if (submit.disabled) return;
  const params = new URLSearchParams(new FormData(form));
  params.set("question",params.get("question").trim());
  if (params.get("question").length < 4) { feedback.textContent = "请至少填写 4 个字。"; return; }
  const key = params.toString();
  if (draftKey !== key) { draftKey = key; draftReceipt = crypto.randomUUID(); }
  params.set("receipt",draftReceipt);
  submit.disabled = withdraw.disabled = true;
  feedback.textContent = "正在提交…";
  try {
    await send("/api/questions",params);
    remember(draftReceipt);
    draftKey = "";
    form.reset();
    feedback.textContent = "已收到。橙橙成回复后，可在「已回复的问题」里查到。";
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
    feedback.textContent = "上次提问已撤回。";
  } catch (error) {
    if (error.status === 409) remember("");
    feedback.textContent = error.status ? error.message : "未能确认撤回结果，请重试。";
  } finally { withdraw.disabled = submit.disabled = false; }
});
