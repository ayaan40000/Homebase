#!/usr/bin/env python3
"""Publish guard for HomeBase (Phase 1, 2026-11-08).

FAILS (exit 1, plain messages) when any of these do not reconcile:
  1. canonical listing count != repo data/listings.json count
     (URL sets are compared too, so a same-count swap also fails);
  2. any src/data/top5.json entry is missing from data/listings.json;
  3. data/delta.json does not reconcile:
     previousCount + added - removed == currentCount == repo count.

Run it after sync_data.py and BEFORE any push, on every publish path
(Sunday scan and Wednesday refresh alike). A red guard means: do not push.

Usage: python3 tools/check_consistency.py [canonical] [listings] [top5] [delta]
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_CANON = Path.home() / (
    "workspace/goals/houston-home-watch-250k-300k-sfh/hidden_files/"
    "listings-for-sortable-page.json"
)


def load(p: Path):
    return json.loads(p.read_text())


def main() -> int:
    canon_p = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CANON
    list_p = Path(sys.argv[2]) if len(sys.argv) > 2 else REPO / "data" / "listings.json"
    top5_p = Path(sys.argv[3]) if len(sys.argv) > 3 else REPO / "src" / "data" / "top5.json"
    delta_p = Path(sys.argv[4]) if len(sys.argv) > 4 else REPO / "data" / "delta.json"
    problems = []
    for p in (canon_p, list_p, top5_p, delta_p):
        if not p.exists():
            print(f"FAIL: missing file: {p}")
            return 1
    canon = load(canon_p)["listings"]
    repo = load(list_p)["listings"]
    top5 = load(top5_p)["top5"]
    delta = load(delta_p)

    if len(canon) != len(repo):
        problems.append(
            f"count mismatch: canonical has {len(canon)} listings, "
            f"repo data/listings.json has {len(repo)}")
    canon_urls = {l["url"] for l in canon}
    repo_urls = {l["url"] for l in repo}
    if canon_urls != repo_urls:
        only_c = sorted(canon_urls - repo_urls)
        only_r = sorted(repo_urls - canon_urls)
        problems.append(
            f"URL sets differ: {len(only_c)} only in canonical, "
            f"{len(only_r)} only in repo (e.g. {only_c[:1] or only_r[:1]})")

    repo_addrs = {l["address"] for l in repo}
    for pick in top5:
        if pick["address"] not in repo_addrs:
            problems.append(f"top5 entry not in listings.json: {pick['address']}")

    added = len(delta.get("added", []))
    removed = len(delta.get("removed", []))
    reconciled = delta.get("previousCount", -1) + added - removed
    if reconciled != delta.get("currentCount"):
        problems.append(
            f"delta does not reconcile: previous {delta.get('previousCount')} "
            f"+ {added} added - {removed} removed = {reconciled}, "
            f"but delta currentCount says {delta.get('currentCount')}")
    if delta.get("currentCount") != len(repo):
        problems.append(
            f"delta currentCount {delta.get('currentCount')} != "
            f"repo listings count {len(repo)}")

    if problems:
        for p in problems:
            print(f"FAIL: {p}")
        return 1
    print(f"OK: {len(repo)} listings; canonical == repo; top5 all present; "
          f"delta reconciles ({delta['previousCount']} + {added} - {removed} "
          f"= {delta['currentCount']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
