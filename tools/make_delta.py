#!/usr/bin/env python3
"""Mechanically diff two listings payloads and emit data/delta.json.

Compares the previous published data/listings.json with the new one and
records: added, removed, price-changed (with $ and %), status-changed.
Keyed by listing URL. No prose, no reconstruction — pure set/field diff.

Usage: python3 tools/make_delta.py [prev_json] [new_json] [out_json] [extra_copy]
Defaults: prev = data/listings.json.prev (written by sync_data.py before
          it overwrites data/listings.json), new = data/listings.json,
          out  = data/delta.json, extra copy = the goal's
          hidden_files/delta-latest.json.
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
GOAL_HIDDEN = Path.home() / (
    "workspace/goals/houston-home-watch-250k-300k-sfh/hidden_files"
)


def compute_delta(prev: dict, new: dict, generated: str) -> dict:
    prev_by = {l["url"]: l for l in prev.get("listings", [])}
    new_by = {l["url"]: l for l in new.get("listings", [])}
    added = [
        {"address": l["address"], "url": url, "price": l["price"]}
        for url, l in new_by.items() if url not in prev_by
    ]
    removed = [
        {"address": l["address"], "url": url, "price": l["price"]}
        for url, l in prev_by.items() if url not in new_by
    ]
    price_changed, status_changed = [], []
    for url, l in new_by.items():
        p = prev_by.get(url)
        if p is None:
            continue
        if p["price"] != l["price"]:
            price_changed.append({
                "address": l["address"], "url": url,
                "from": p["price"], "to": l["price"],
                "change": l["price"] - p["price"],
                "pct": round((l["price"] - p["price"]) / p["price"] * 100, 2),
            })
        # status is only comparable when both sides carry the field
        if p.get("status") is not None and l.get("status") is not None \
                and p["status"] != l["status"]:
            status_changed.append({
                "address": l["address"], "url": url,
                "from": p["status"], "to": l["status"],
            })
    return {
        "generated": generated,
        "previousCount": len(prev_by),
        "currentCount": len(new_by),
        "added": added,
        "removed": removed,
        "priceChanged": price_changed,
        "statusChanged": status_changed,
    }


def main() -> int:
    prev_path = Path(sys.argv[1]) if len(sys.argv) > 1 else REPO / "data" / "listings.json.prev"
    new_path = Path(sys.argv[2]) if len(sys.argv) > 2 else REPO / "data" / "listings.json"
    out_path = Path(sys.argv[3]) if len(sys.argv) > 3 else REPO / "data" / "delta.json"
    extra = Path(sys.argv[4]) if len(sys.argv) > 4 else GOAL_HIDDEN / "delta-latest.json"
    if not prev_path.exists() or not new_path.exists():
        print("prev or new listings file missing", file=sys.stderr)
        return 1
    prev = json.loads(prev_path.read_text())
    new = json.loads(new_path.read_text())
    delta = compute_delta(prev, new, new.get("generated", ""))
    text = json.dumps(delta, indent=1)
    out_path.write_text(text)
    try:
        extra.write_text(text)
    except OSError:
        pass
    print(f"delta: prev {delta['previousCount']} + {len(delta['added'])} new "
          f"- {len(delta['removed'])} removed = {delta['currentCount']}; "
          f"{len(delta['priceChanged'])} price-changed, "
          f"{len(delta['statusChanged'])} status-changed -> {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
