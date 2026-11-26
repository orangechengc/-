# 赛历 · 高校竞赛指南

浏览复旦竞赛目录和黑客松活动。支持按类别或报名时间查看、按院系和名称搜索，以及查看竞赛官网、经验分享搜索与 GitHub 开源项目。

## 本地预览

在项目根目录运行下列命令，然后打开 <http://localhost:8770>。

```sh
python3 -m http.server 8770 --bind 127.0.0.1 --directory web
```

## 数据维护

- `web/data/catalog.json` 保存竞赛名称、目录类别、推荐院系、往年报名月份、检索词与常设活动入口。初始事实数据整理自 [XinQijj 的复旦竞赛目录](https://github.com/XinQijj/ContestAggregation)，包含 94 项竞赛。可直接修改此文件维护自己的目录。
- 报名时间依据往年的月份估算，跨年报名窗口也会显示。请以主办方当年的通知和学院公布的认定规则为准。
- `web/data/activity.json` 保存最近一次完整同步的活动数据。初始快照来自同一参考项目。后续由本仓库的 Python 脚本独立查询 GitHub 和 Devpost。
- 运行 `python3 scripts/sync.py` 可手动更新活动数据。GitHub Actions 自动提供 `GITHUB_TOKEN`。任一来源请求失败会保留现有快照。

## GitHub Pages

在公开仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，并将代码提交到 `main`。推送会发布 `web/`。如需手动同步并发布，在 **Actions → 更新并发布赛历 → Run workflow** 运行工作流。

工作流配置在 `.github/workflows/pages.yml`，定于北京时间每天 04:17 更新。同步任务需要向 `main` 写入数据的权限。已发布网址会显示在成功运行的 `publish` 任务下方。
