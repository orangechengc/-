const get = id => document.getElementById(id);
const make = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
};

function external(label, href) {
  let url;
  try { url = new URL(href); } catch { return null; }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  const link = make("a", label);
  link.href = url.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

const now = new Date();
const month = now.getMonth() + 1;
const distance = start => (start - month + 12) % 12;
function windowOpen([start, end]) {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}
function monthText([start, end]) {
  return start === end ? start + " 月" : start + "–" + end + " 月";
}
function drawCalendar() {
  const calendar = get("calendar");
  calendar.append(make("b", now.getFullYear() + " / " + String(month).padStart(2, "0")));
  const days = make("div", undefined, "days");
  for (const day of "一二三四五六日") days.append(make("span", day));
  const offset = (new Date(now.getFullYear(), month - 1, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) days.append(make("span"));
  const length = new Date(now.getFullYear(), month, 0).getDate();
  for (let d = 1; d <= length; d++) days.append(make("span", d, d === now.getDate() ? "today" : ""));
  calendar.append(days);
}

let catalog, activity;
function openDetail(c) {
  const pane = get("body");
  const title = make("h2", c.name);
  title.id = "detail-name";
  pane.replaceChildren(make("span", (c.tier === 1 ? "一类" : "二类") + " · " + c.id, "tag"), title,
    make("p", c.dept), make("p", "往年报名约在 " + monthText(c.reg) + "。请以当年官方通知为准。", "meta"));
  const official = external("访问竞赛官网", c.url);
  if (official) pane.append(official);
  pane.append(make("h3", "查找参赛经验"));
  const links = make("div", undefined, "detail-links");
  const term = encodeURIComponent(c.keyword || c.name);
  for (const [site, base] of [
    ["哔哩哔哩", "https://search.bilibili.com/all?keyword="], ["知乎", "https://www.zhihu.com/search?type=content&q="],
    ["GitHub", "https://github.com/search?type=repositories&q="], ["CSDN", "https://so.csdn.net/so/search?q="],
    ["YouTube", "https://www.youtube.com/results?search_query="]
  ]) links.append(external(site, base + term));
  pane.append(links, make("h3", "相关开源仓库"));
  const items = make("ul");
  for (const repo of activity.repos[c.id] || []) {
    const link = external(repo.name, repo.url);
    if (!link) continue;
    const item = make("li");
    item.append(link, " · ★ " + repo.stars);
    items.append(item);
  }
  pane.append(items.children.length ? items : make("p", "本次同步暂无匹配仓库。", "meta"));
  get("detail").showModal();
}
function contestCard(c) {
  const open = windowOpen(c.reg);
  const card = make("button", undefined, "card");
  card.type = "button";
  card.append(make("span", open ? "预计报名中" : "约 " + c.reg[0] + " 月开放", "tag" + (open ? " open" : "")),
    make("strong", c.name), make("span", c.dept, "meta"),
    make("span", c.id + " · " + monthText(c.reg) + (c.robot ? " · 机器人学院" + c.robot : ""), "meta foot"));
  card.addEventListener("click", () => openDetail(c));
  return card;
}
function activityCard(h) {
  const card = external("", h.url);
  if (!card) return null;
  card.className = "card";
  const label = h.state ? ({open: "报名中", upcoming: "即将开始"}[h.state] || h.state) : "活动入口";
  card.append(make("span", label, "tag" + (h.state === "open" ? " open" : "")),
    make("strong", h.name), make("span", h.org || h.location || "Devpost", "meta"));
  if (h.dates) card.append(make("span", h.dates, "meta foot"));
  return card;
}
function group(title, records, cardFor) {
  if (!records.length) return;
  const section = make("section", undefined, "group");
  const heading = make("h2", title);
  heading.append(make("small", records.length + " 项"));
  const grid = make("div", undefined, "grid");
  records.forEach(item => { const card = cardFor(item); if (card) grid.append(card); });
  section.append(heading, grid);
  get("results").append(section);
}
function view() {
  return ["timeline", "hackathons"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "catalog";
}
function draw() {
  if (!catalog || !activity) return;
  const route = view();
  const hackathons = route === "hackathons";
  document.querySelectorAll("[data-view]").forEach(a => {
    if (a.dataset.view === route) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  get("tier-control").hidden = get("robot-control").hidden = hackathons;
  get("query").placeholder = hackathons ? "搜索活动或主办方" : "搜索比赛、院系或编号";
  const q = get("query").value.trim().toLowerCase();
  const matches = text => text.toLowerCase().includes(q);
  get("results").replaceChildren();
  let count;
  if (hackathons) {
    const filter = h => matches([h.name,h.org,h.location].join(" "));
    const live = activity.hackathons.filter(filter);
    const orgs = catalog.organizers.filter(filter);
    count = live.length + orgs.length;
    group("近期黑客松", live, activityCard);
    group("常设活动入口", orgs, activityCard);
  } else {
    const cs = catalog.contests.filter(c => matches([c.name,c.id,c.dept].join(" ")) &&
      (!get("tier").value || c.tier === Number(get("tier").value)) && (!get("robot").checked || c.robot));
    count = cs.length;
    if (route === "catalog") {
      group("一类竞赛", cs.filter(c => c.tier === 1), contestCard);
      group("二类竞赛", cs.filter(c => c.tier === 2), contestCard);
    } else {
      group("预计报名中", cs.filter(c => windowOpen(c.reg)).sort((a,b) => distance(a.reg[1]) - distance(b.reg[1])), contestCard);
      for (let i = 1; i < 12; i++) {
        const m = (month - 1 + i) % 12 + 1;
        group(m + " 月开放", cs.filter(c => c.reg[0] === m && !windowOpen(c.reg)), contestCard);
      }
    }
  }
  const date = new Date(activity.updated).toLocaleDateString("zh-CN");
  get("status").textContent = (count ? "共 " + count + " 项" : "没有匹配项，请调整关键词或筛选条件") + " · 活动数据更新于 " + date;
}
async function readData(path) {
  const response = await fetch("./data/" + path, {cache:"no-cache"});
  if (!response.ok) throw new Error(path);
  return response.json();
}
async function start() {
  drawCalendar();
  try {
    [catalog,activity] = await Promise.all([readData("catalog.json"), readData("activity.json")]);
    for (const [n, label] of [[catalog.contests.length, "项竞赛"], [activity.hackathons.length, "场近期黑客松"]]) {
      const total = make("span");
      total.append(make("strong", n), label);
      get("totals").append(total);
    }
    draw();
  } catch {
    get("status").textContent = "目录加载失败，请检查网络后刷新。";
  }
}
get("query").addEventListener("input", draw);
for (const id of ["tier","robot"]) get(id).addEventListener("change", draw);
window.addEventListener("hashchange", () => { get("query").value = ""; draw(); });
get("close").addEventListener("click", () => get("detail").close());
get("detail").addEventListener("click", e => {
  if (e.target !== get("detail")) return;
  const r = e.target.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
});
start();
