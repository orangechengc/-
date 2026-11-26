"""Update Devpost listings and GitHub search results as one complete snapshot."""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DATA = Path(__file__).resolve().parents[1] / "web" / "data"


def fetch(url, *, github=False):
    headers = {"Accept": "application/json", "User-Agent": "CompetitionCalendar-sync"}
    if github and os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers=headers), timeout=25) as response:
                return json.load(response)
        except HTTPError as exc:
            if exc.code not in {403, 429, 500, 502, 503, 504} or attempt == 2:
                raise
            delay = max(3, min(65, int(exc.headers.get("Retry-After", "60"))))
        except (URLError, TimeoutError):
            if attempt == 2:
                raise
            delay = 3 * (attempt + 1)
        time.sleep(delay)


def devpost():
    events = {}
    for page in (1, 2):
        query = urlencode({"page": page, "status[]": ["open", "upcoming"]}, doseq=True)
        payload = fetch("https://devpost.com/api/hackathons?" + query)
        for event in payload["hackathons"]:
            url = event["url"]
            events[url] = {
                "name": event["title"], "url": url,
                "org": event.get("organization_name") or "",
                "location": (event.get("displayed_location") or {}).get("location") or "",
                "dates": event.get("submission_period_dates") or "",
                "state": event.get("open_state") or "",
            }
        if not payload["hackathons"]:
            break
    return list(events.values())


def repositories(contests):
    results = {}
    interval = 2.2 if os.environ.get("GITHUB_TOKEN") else 6.5
    for index, contest in enumerate(contests):
        if index:
            time.sleep(interval)
        query = urlencode({"q": contest["keyword"] or contest["name"], "per_page": 5,
                           "sort": "stars", "order": "desc"})
        payload = fetch("https://api.github.com/search/repositories?" + query, github=True)
        results[contest["id"]] = [
            {"name": repo["full_name"], "url": repo["html_url"], "stars": repo["stargazers_count"]}
            for repo in payload["items"]
        ]
    return results


def main():
    catalog = json.loads((DATA / "catalog.json").read_text(encoding="utf-8"))
    events = devpost()
    repos = repositories(catalog["contests"])
    snapshot = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "hackathons": events, "repos": repos}
    with NamedTemporaryFile(mode="w", encoding="utf-8", dir=DATA, delete=False) as out:
        tmp = Path(out.name)
        try:
            json.dump(snapshot, out, ensure_ascii=False, indent=2)
            out.write("\n")
        except BaseException:
            tmp.unlink(missing_ok=True)
            raise
    tmp.replace(DATA / "activity.json")
    print(f"更新了 {len(events)} 场黑客松和 {len(repos)} 项竞赛的仓库搜索结果。")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError) as exc:
        sys.exit(f"同步失败，保留原数据。{exc}")
