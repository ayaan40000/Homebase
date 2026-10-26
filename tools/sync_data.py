#!/usr/bin/env python3
"""Copy the canonical home-watch listings JSON into this repo as data/listings.json.

Field-for-field copy, no transforms — transforms belong to the Rust scorer.
Also runs the pre-push privacy scan (hard gate): any phone-number pattern,
email address, or personal string hit stops the sync with a non-zero exit.

Usage: python3 tools/sync_data.py [source_json] [dest_json]
Defaults: source = the goal's canonical listings file on the VM,
          dest   = data/listings.json relative to the repo root.
"""
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = Path.home() / (
    "workspace/goals/houston-home-watch-250k-300k-sfh/hidden_files/"
    "listings-for-sortable-page.json"
)

PHONE_RE = re.compile(r"(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PERSONAL_TERMS = ["1020 Brand", "Brand Lane", "Silverbrooke"]


def privacy_scan(text: str) -> list[str]:
    hits = []
    hits += [f"phone-like: {m.group(0)}" for m in PHONE_RE.finditer(text)]
    hits += [f"email-like: {m.group(0)}" for m in EMAIL_RE.finditer(text)]
    hits += [f"personal term: {t}" for t in PERSONAL_TERMS if t in text]
    return hits


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else REPO / "data" / "listings.json"
    if not source.exists():
        print(f"source not found: {source}", file=sys.stderr)
        return 1
    data = json.loads(source.read_text())
    if "listings" not in data or not isinstance(data["listings"], list):
        print("source has no listings array", file=sys.stderr)
        return 1
    text = json.dumps(data, indent=1)
    hits = privacy_scan(text)
    if hits:
        print("PRIVACY SCAN FAILED — sync stopped:", file=sys.stderr)
        for h in hits:
            print(f"  {h}", file=sys.stderr)
        return 2
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(text)
    print(f"synced {len(data['listings'])} listings -> {dest} (privacy scan clean)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
