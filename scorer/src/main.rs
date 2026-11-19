//! HomeBase scorer v1 — implements hidden_files/homebase-scoring-model.md.
//! Reads data/listings.json (canonical schema) + scorer/weights.json,
//! writes data/scored.json in the schema the React app consumes.
//! Usage: homebase-scorer [--in PATH] [--out PATH] [--weights PATH]

use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::process::ExitCode;

#[derive(Debug, Deserialize)]
struct AreaConfig {
    school_access_0_10: f64,
    highway_access: f64,
    grocer_access: f64,
    total_tax_rate_pct: f64,
    school_tax_rate_pct: f64,
    school_district_for_tax: String,
    area_deal_score_book: f64,
    commute_annual_usd: String,
    median_rent_usd_mo: f64,
}

#[derive(Debug, Deserialize)]
struct Weights {
    anchor_price_usd: f64,
    anchor_31pct_usd: f64,
    down_payment_usd: f64,
    income_usd: f64,
    mortgage_rate_pct: f64,
    mortgage_term_months: f64,
    insurance_monthly_usd: f64,
    homestead_exemption_usd: f64,
    areas: BTreeMap<String, AreaConfig>,
}

fn clamp100(x: f64) -> f64 {
    x.clamp(0.0, 100.0)
}

fn round1(x: f64) -> f64 {
    (x * 10.0).round() / 10.0
}

fn round2(x: f64) -> f64 {
    (x * 100.0).round() / 100.0
}

fn get_f(v: &Value, key: &str) -> Option<f64> {
    v.get(key).and_then(|x| x.as_f64())
}

/// 2813 -> "2,813" (for note text).
fn fmt_int(x: f64) -> String {
    let s = format!("{}", x.round() as i64);
    let (neg, digits) = match s.strip_prefix('-') {
        Some(rest) => (true, rest.to_string()),
        None => (false, s),
    };
    let mut out = String::new();
    for (i, c) in digits.chars().enumerate() {
        if i > 0 && (digits.len() - i) % 3 == 0 {
            out.push(',');
        }
        out.push(c);
    }
    if neg {
        format!("-{out}")
    } else {
        out
    }
}

/// 259900 -> "$259,900" (for note text).
fn fmt_money(x: f64) -> String {
    format!("${}", fmt_int(x))
}

fn momentum(flags: &[String], dom: Option<f64>) -> f64 {
    let cut = flags.iter().any(|f| f == "price-cut");
    let stale = flags.iter().any(|f| f == "stale");
    if cut && (stale || dom.map_or(false, |d| d >= 45.0)) {
        100.0
    } else if cut {
        85.0
    } else if stale || dom.map_or(false, |d| d >= 45.0) {
        80.0
    } else if let Some(d) = dom {
        if d >= 30.0 {
            60.0
        } else if d >= 7.0 {
            40.0
        } else {
            20.0
        }
    } else {
        50.0
    }
}

/// Parse "$39/mo" style HOA strings. Returns (monthly_usd, unknown).
fn parse_hoa(hoa: &str) -> (f64, bool) {
    let digits: String = hoa
        .chars()
        .filter(|c| c.is_ascii_digit() || *c == '.')
        .collect();
    match digits.parse::<f64>() {
        Ok(n) if hoa.contains('$') => {
            if hoa.contains("/yr") || hoa.contains("year") {
                (n / 12.0, false)
            } else {
                (n, false)
            }
        }
        _ => (0.0, true),
    }
}

fn main() -> ExitCode {
    let args: Vec<String> = env::args().collect();
    let mut in_path = "data/listings.json".to_string();
    let mut out_path = "data/scored.json".to_string();
    let mut weights_path = "scorer/weights.json".to_string();
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--in" => {
                i += 1;
                in_path = args.get(i).cloned().unwrap_or(in_path);
            }
            "--out" => {
                i += 1;
                out_path = args.get(i).cloned().unwrap_or(out_path);
            }
            "--weights" => {
                i += 1;
                weights_path = args.get(i).cloned().unwrap_or(weights_path);
            }
            other => {
                eprintln!("unknown argument: {other}");
                return ExitCode::FAILURE;
            }
        }
        i += 1;
    }

    let weights_raw = match fs::read_to_string(&weights_path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("cannot read weights {weights_path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let w: Weights = match serde_json::from_str(&weights_raw) {
        Ok(w) => w,
        Err(e) => {
            eprintln!("weights parse error: {e}");
            return ExitCode::FAILURE;
        }
    };

    let raw = match fs::read_to_string(&in_path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("cannot read input {in_path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let mut root: Value = match serde_json::from_str(&raw) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("input parse error: {e}");
            return ExitCode::FAILURE;
        }
    };
    let listings = match root.get("listings").and_then(|v| v.as_array()) {
        Some(l) => l.clone(),
        None => {
            eprintln!("input has no listings array");
            return ExitCode::FAILURE;
        }
    };

    let monthly_rate = w.mortgage_rate_pct / 100.0 / 12.0;
    let n = w.mortgage_term_months;
    let pow = (1.0 + monthly_rate).powf(n);

    let mut scored: Vec<Value> = Vec::with_capacity(listings.len());
    for listing in &listings {
        let area = listing
            .get("area")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let cfg = match w.areas.get(&area) {
            Some(c) => c,
            None => {
                eprintln!("no area config for area '{area}'");
                return ExitCode::FAILURE;
            }
        };
        let price = get_f(listing, "price").unwrap_or(0.0);
        let sqft = get_f(listing, "sqft");
        let dom = get_f(listing, "dom");
        let flood = get_f(listing, "flood");
        let flags: Vec<String> = listing
            .get("flags")
            .and_then(|v| v.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|f| f.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        // ppsf: source value where carried, else price / sqft rounded.
        let ppsf = get_f(listing, "ppsf").or_else(|| match sqft {
            Some(s) if s > 0.0 => Some((price / s).round()),
            _ => None,
        });

        // Deal components (model §2)
        let value = ppsf.map_or(50.0, |p| clamp100((185.0 - p) / 55.0 * 100.0));
        let carrying = clamp100((3.20 - cfg.total_tax_rate_pct) / 1.50 * 100.0);
        let flood_wind = flood.map_or(50.0, |f| clamp100((10.0 - f) / 10.0 * 100.0));
        let mom = momentum(&flags, dom);
        let schools_rescaled = cfg.school_access_0_10 * 10.0;
        let liquidity = dom.map_or(50.0, |d| clamp100((92.0 - d) / 61.0 * 100.0));
        let deal = 0.25 * value
            + 0.25 * carrying
            + 0.20 * flood_wind
            + 0.10 * mom
            + 0.10 * schools_rescaled
            + 0.10 * liquidity;
        let composite = 0.60 * deal
            + 0.15 * schools_rescaled
            + 0.15 * cfg.highway_access
            + 0.10 * cfg.grocer_access;

        let mut estimated_components: Vec<String> = vec![
            "carrying_cost (area total tax rate, not per-listing)".into(),
            "grocer_access (area-level proxy, v1)".into(),
            "highway_access (area-level proxy, v1)".into(),
            "school_access (area-level proxy)".into(),
            "schools (area School Access proxy, rescaled)".into(),
        ];
        if flood.is_none() {
            estimated_components.push("flood_wind (no Flood Factor in source; 50 neutral)".into());
        }
        if dom.is_none() {
            estimated_components.push("liquidity (DOM not in source; 50 neutral)".into());
            estimated_components.push("momentum (DOM not in source; 50 neutral)".into());
        }

        // Ratios (model §6)
        let loan = price - w.down_payment_usd;
        let pi = loan * monthly_rate * pow / (pow - 1.0);
        let annual_tax =
            price * cfg.total_tax_rate_pct / 100.0 - w.homestead_exemption_usd * cfg.school_tax_rate_pct / 100.0;
        let hoa_str = listing
            .get("hoa")
            .and_then(|v| v.as_str())
            .unwrap_or("—");
        let (hoa_monthly, hoa_unknown) = parse_hoa(hoa_str);
        let piti = pi + annual_tax / 12.0 + w.insurance_monthly_usd + hoa_monthly;
        let front_end = piti / (w.income_usd / 12.0) * 100.0;
        let rent = cfg.median_rent_usd_mo;

        // Book Match (owner-ordered 2026-11-18) — how closely this listing
        // matches The Houston Book Edition 2's recommended buy. Four
        // components, 100 points: size fit 40, $/sqft value tier (Ch 16) 25,
        // price band 15, tax 20. Full definition: docs/SCORING.md §10 and
        // the goal's GOAL.md. A missing size also removes $/sqft (it is
        // derived from size); the remaining components are then pro-rated
        // to 100 and the result is flagged estimated. Tax uses the area
        // total rate from weights.json — no per-listing rate exists in the
        // source, and none is invented.
        let size_pts: Option<f64> = sqft.map(|s| {
            if s > 3700.0 {
                32.0
            } else if s >= 2800.0 {
                40.0
            } else if s >= 2350.0 {
                28.0
            } else if s >= 1600.0 {
                16.0
            } else {
                6.0
            }
        });
        let value_pts: Option<f64> = ppsf.map(|p| {
            if p <= 105.0 {
                25.0
            } else if p <= 135.0 {
                19.0
            } else if p <= 175.0 {
                12.0
            } else {
                5.0
            }
        });
        let price_pts: f64 = if price <= 275_000.0 { 15.0 } else { 9.0 };
        let tax_rate = cfg.total_tax_rate_pct;
        let tax_pts: f64 = if tax_rate <= 2.29 {
            20.0
        } else if tax_rate < 3.00 {
            12.0
        } else if tax_rate < 3.50 {
            6.0
        } else {
            2.0
        };
        let mut bm_earned = price_pts + tax_pts;
        let mut bm_possible = 35.0;
        if let Some(sp) = size_pts {
            bm_earned += sp;
            bm_possible += 40.0;
        }
        if let Some(vp) = value_pts {
            bm_earned += vp;
            bm_possible += 25.0;
        }
        let book_estimated = size_pts.is_none() || value_pts.is_none();
        let book_score = (bm_earned / bm_possible * 100.0).round();
        let book_band = if book_score >= 80.0 {
            "Strong Book match"
        } else if book_score >= 60.0 {
            "Good"
        } else if book_score >= 40.0 {
            "Partial"
        } else {
            "Off-Book"
        };
        let size_flag: Option<&str> = sqft.and_then(|s| {
            if s < 1600.0 {
                Some("small")
            } else if s >= 2800.0 {
                Some("large")
            } else {
                None
            }
        });

        // Point-wise note: one bullet per criterion, generated from this
        // listing's own numbers. Factual and number-led; no sales language.
        let size_note = match sqft {
            None => "Size: not listed — cannot be scored against the Book's ranges; \
                     Book Match is estimated from the other criteria."
                .to_string(),
            Some(s) if s > 3700.0 => format!(
                "Size: {} sq ft — differs. Above the Book's recommended range \
                 (2,800–3,700 sq ft); maintenance scales with size. Flagged Large.",
                fmt_int(s)
            ),
            Some(s) if s >= 2800.0 => format!(
                "Size: {} sq ft — matches. Inside the Book's recommended range \
                 (2,800–3,700 sq ft). Flagged Large (Book-size).",
                fmt_int(s)
            ),
            Some(s) if s >= 2350.0 => format!(
                "Size: {} sq ft — partial. Below the Book's recommended range \
                 (2,800–3,700 sq ft), above its new-build range (1,600–2,350 sq ft).",
                fmt_int(s)
            ),
            Some(s) if s >= 1600.0 => format!(
                "Size: {} sq ft — differs. Book recommends 2,800–3,700 sq ft; \
                 this is in its new-build range (1,600–2,350 sq ft).",
                fmt_int(s)
            ),
            Some(s) => format!(
                "Size: {} sq ft — differs. Below even the Book's new-build range \
                 (1,600–2,350 sq ft); flagged Small.",
                fmt_int(s)
            ),
        };
        let value_note = match ppsf {
            None => "Value: $/sqft not available (no size in the source) — \
                     cannot be scored."
                .to_string(),
            Some(p) if p <= 105.0 => format!(
                "Value: ${}/sqft — matches. The Book's best-value tier ($82–105/sqft).",
                fmt_int(p)
            ),
            Some(p) if p <= 135.0 => format!(
                "Value: ${}/sqft — partial. The Book's 'good value' tier \
                 ($106–135/sqft); best value is $82–105.",
                fmt_int(p)
            ),
            Some(p) if p <= 175.0 => format!(
                "Value: ${}/sqft — partial. The Book's 'market' tier \
                 ($136–175/sqft); best value is $82–105.",
                fmt_int(p)
            ),
            Some(p) => format!(
                "Value: ${}/sqft — differs. The Book's 'premium' tier \
                 ($176–226/sqft); best value is $82–105.",
                fmt_int(p)
            ),
        };
        let price_note = if price <= 275_000.0 {
            format!(
                "Price: {} — matches. Inside the Book's honest band \
                 ($250,000–$275,000 at the 28% rule on $100K income).",
                fmt_money(price)
            )
        } else {
            format!(
                "Price: {} — partial. Above the Book's honest band \
                 ($250,000–$275,000) but under its 28% ceiling ($301,000).",
                fmt_money(price)
            )
        };
        let tax_note = if tax_rate <= 2.29 {
            format!(
                "Tax: {tax_rate:.2}% total (area rate) — matches. Inside the \
                 Book's watch-area range (1.73–2.29%)."
            )
        } else if tax_rate < 3.00 {
            format!(
                "Tax: {tax_rate:.2}% total (area rate) — partial. Above the \
                 Book's watch-area range (1.73–2.29%); new-MUD communities run 2.2–3.7%."
            )
        } else if tax_rate < 3.50 {
            format!(
                "Tax: {tax_rate:.2}% total (area rate) — differs. Above the \
                 Book's watch-area range (1.73–2.29%)."
            )
        } else {
            format!(
                "Tax: {tax_rate:.2}% total (area rate) — differs. Well above \
                 the Book's watch-area range (1.73–2.29%)."
            )
        };

        let mut obj: Map<String, Value> = match listing.as_object() {
            Some(m) => m.clone(),
            None => {
                eprintln!("listing is not an object");
                return ExitCode::FAILURE;
            }
        };
        if let Some(p) = ppsf {
            obj.insert("ppsf".into(), json!(p));
        }
        obj.insert(
            "bookMatch".into(),
            json!({
                "score": book_score,
                "band": book_band,
                "estimated": book_estimated,
                "sizeFlag": size_flag,
                "components": {
                    "size_fit": size_pts,
                    "value": value_pts,
                    "price_band": price_pts,
                    "tax": tax_pts
                },
                "notes": [size_note, value_note, price_note, tax_note]
            }),
        );
        obj.insert(
            "scores".into(),
            json!({
                "deal_score": round1(deal),
                "composite_home_score": round1(composite),
                "components_0_100": {
                    "value": round1(value),
                    "carrying_cost": round1(carrying),
                    "flood_wind": round1(flood_wind),
                    "momentum": round1(mom),
                    "schools_in_deal": round1(schools_rescaled),
                    "liquidity": round1(liquidity),
                    "school_access_rescaled": round1(schools_rescaled),
                    "highway_access": cfg.highway_access,
                    "grocer_access": cfg.grocer_access
                },
                "school_access_0_10": cfg.school_access_0_10,
                "area_deal_score_book": cfg.area_deal_score_book,
                "commute_annual_cost_book": cfg.commute_annual_usd,
                "estimated": true,
                "estimated_components": estimated_components
            }),
        );
        obj.insert(
            "ratios".into(),
            json!({
                "ppsf": ppsf,
                "price_vs_anchor_pct": round2(price / w.anchor_price_usd * 100.0),
                "price_vs_anchor_delta_pct": round2(price / w.anchor_price_usd * 100.0 - 100.0),
                "price_vs_31pct_anchor_pct": round2(price / w.anchor_31pct_usd * 100.0),
                "loan_usd": round2(loan),
                "mortgage_rate_pct_assumed": w.mortgage_rate_pct,
                "principal_interest_monthly_usd": round2(pi),
                "annual_tax_usd": round2(annual_tax),
                "tax_monthly_usd": round2(annual_tax / 12.0),
                "total_tax_rate_pct_area": cfg.total_tax_rate_pct,
                "school_tax_rate_pct": cfg.school_tax_rate_pct,
                "school_district_for_tax": cfg.school_district_for_tax,
                "insurance_monthly_usd_estimate": w.insurance_monthly_usd,
                "hoa_monthly_usd_counted": round2(hoa_monthly),
                "hoa_unknown_in_source": hoa_unknown,
                "est_monthly_piti_usd": round2(piti),
                "front_end_ratio_pct": round2(front_end),
                "assumed_area_median_rent_usd_mo": rent,
                "rent_ratio_pct": round2(rent / price * 100.0),
                "gross_rent_yield_pct": round2(rent * 12.0 / price * 100.0),
                "estimated": true,
                "estimated_components": [
                    "annual_tax (area total rate + district school rate, corrected formula; not per-listing tax)",
                    "insurance ($200/mo book estimate)",
                    "rent_ratio (area median rent ASSUMPTION, see model doc)",
                    "hoa (not shown in source; counted as $0, so PITI is a lower bound)"
                ]
            }),
        );
        scored.push(Value::Object(obj));
    }

    // Top 5 by composite desc, tie-break lower price then lower DOM (null last); flips excluded.
    let mut ranked: Vec<&Value> = scored
        .iter()
        .filter(|l| {
            !l.get("flags")
                .and_then(|f| f.as_array())
                .map_or(false, |a| a.iter().any(|x| x.as_str() == Some("flip")))
        })
        .collect();
    ranked.sort_by(|a, b| {
        let ca = a
            .pointer("/scores/composite_home_score")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        let cb = b
            .pointer("/scores/composite_home_score")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);
        cb.partial_cmp(&ca)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| {
                get_f(a, "price")
                    .unwrap_or(0.0)
                    .partial_cmp(&get_f(b, "price").unwrap_or(0.0))
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .then_with(|| {
                let da = get_f(a, "dom").unwrap_or(f64::MAX);
                let db = get_f(b, "dom").unwrap_or(f64::MAX);
                da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
            })
    });
    let top5: Vec<Value> = ranked
        .iter()
        .take(5)
        .enumerate()
        .map(|(idx, l)| {
            json!({
                "rank": idx + 1,
                "address": l.get("address"),
                "area": l.get("area"),
                "price": l.get("price"),
                "url": l.get("url"),
                "composite_home_score": l.pointer("/scores/composite_home_score"),
                "deal_score": l.pointer("/scores/deal_score")
            })
        })
        .collect();

    if let Some(obj) = root.as_object_mut() {
        obj.insert("listings".into(), Value::Array(scored));
        obj.insert(
            "scoring_model".into(),
            json!({
                "version": "HomeBase Scoring v1 (2026-10-25)",
                "composite_formula": "Composite = 0.60*DealScore + 0.15*(SchoolAccess_0_10*10) + 0.15*HighwayAccess + 0.10*GrocerAccess",
                "deal_formula": "Deal = 0.25*Value + 0.25*CarryingCost + 0.20*FloodWind + 0.10*Momentum + 0.10*Schools + 0.10*Liquidity; all components 0-100, clamped",
                "book_match": "Book Match (2026-11-18): size fit 40 + $/sqft value tier 25 + price band 15 + tax 20 = 100, per The Houston Book Edition 2; bands 80+ Strong Book match, 60+ Good, 40+ Partial, under 40 Off-Book; size flags Small under 1,600 sqft, Large 2,800+ sqft; see docs/SCORING.md §10",
                "anchor_price_usd": w.anchor_price_usd,
                "down_payment_usd": w.down_payment_usd,
                "income_usd": w.income_usd,
                "mortgage": "7.32%, 30-year fixed",
                "scorer": "Rust homebase-scorer 1.0.0"
            }),
        );
        obj.insert("top5".into(), Value::Array(top5));
    }

    match fs::write(&out_path, serde_json::to_string_pretty(&root).unwrap()) {
        Ok(_) => {
            println!("scored {} listings -> {}", listings.len(), out_path);
            ExitCode::SUCCESS
        }
        Err(e) => {
            eprintln!("cannot write {out_path}: {e}");
            ExitCode::FAILURE
        }
    }
}
