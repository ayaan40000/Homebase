#!/usr/bin/env python3
"""Copy the canonical home-watch listings JSON into this repo as data/listings.json.

Field-for-field copy, no transforms — transforms belong to the Rust scorer.
Also runs the pre-push privacy scan (hard gate): any phone-number pattern,
email address, or personal string hit stops the sync with a non-zero exit.

Phase 1 (2026-11-08): before overwriting, the previous data/listings.json
is kept at data/listings.json.prev, and after the copy a mechanical delta
(make_delta.compute_delta) is written to data/delta.json plus a copy in
the goal's hidden_files/delta-latest.json. tools/check_consistency.py
must pass before any push.

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

# Allowlisted phone numbers (digits only). Exactly one entry: the home
# inspector's published BUSINESS number (Liju Varghese, Calv's Inspection
# Services LLC), which sits in the listings disclaimer. Ayaan's decision,
# 2026-10-28: "Keep the phone number and allow it in the scan."
# Every other phone-like pattern still hard-stops the sync.
ALLOWED_PHONES = {"8328129675"}


def privacy_scan(text: str) -> list[str]:
    hits = []
    for m in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", m.group(0))
        if digits in ALLOWED_PHONES:
            continue
        hits.append(f"phone-like: {m.group(0)}")
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
    prev = None
    if dest.exists():
        prev = json.loads(dest.read_text())
        dest.with_suffix(".json.prev").write_text(dest.read_text())
    dest.write_text(text)
    print(f"synced {len(data['listings'])} listings -> {dest} (privacy scan clean)")
    # Phase 1: mechanical run delta vs the previous published payload.
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from make_delta import compute_delta
    delta = compute_delta(prev or {"listings": []}, data, data.get("generated", ""))
    delta_text = json.dumps(delta, indent=1)
    (dest.parent / "delta.json").write_text(delta_text)
    goal_copy = Path.home() / (
        "workspace/goals/houston-home-watch-250k-300k-sfh/hidden_files/delta-latest.json")
    try:
        goal_copy.write_text(delta_text)
    except OSError:
        pass
    print(f"delta: prev {delta['previousCount']} + {len(delta['added'])} new "
          f"- {len(delta['removed'])} removed = {delta['currentCount']}; "
          f"{len(delta['priceChanged'])} price-changed, "
          f"{len(delta['statusChanged'])} status-changed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
