
import os
import json
import math
import requests
from pathlib import Path
from datetime import date, datetime, timedelta


SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
SERPAPI_URL = "https://serpapi.com/search.json"


# =========================
# CONFIGURACIÓN DE BÚSQUEDAS
# =========================

SEARCHES = [
    {
        "key": "cuc_ssa_short",
        "title": "Cúcuta → Salvador | 6–8 oct ida | 12–13 oct vuelta",
        "type": "round_trip",
        "origin": "CUC",
        "destination": "SSA",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-12",
        "return_end": "2026-10-13",
    },
    {
        "key": "cuc_ssa_long",
        "title": "Cúcuta → Salvador | 6–8 oct ida | 22–26 oct vuelta",
        "type": "round_trip",
        "origin": "CUC",
        "destination": "SSA",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-22",
        "return_end": "2026-10-26",
    },
    {
        "key": "bog_ssa_short",
        "title": "Bogotá → Salvador | 6–8 oct ida | 12–13 oct vuelta",
        "type": "round_trip",
        "origin": "BOG",
        "destination": "SSA",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-12",
        "return_end": "2026-10-13",
    },
    {
        "key": "bog_ssa_long",
        "title": "Bogotá → Salvador | 6–8 oct ida | 22–26 oct vuelta",
        "type": "round_trip",
        "origin": "BOG",
        "destination": "SSA",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-22",
        "return_end": "2026-10-26",
    },
    {
        "key": "cuc_sao_ssa_strategy",
        "title": "Estrategia vía São Paulo | Cúcuta → São Paulo + vuelo a Salvador en la mitad",
        "type": "split_strategy",
        "outer_origin": "CUC",
        "outer_destination": "SAO",
        "outer_depart_start": "2026-10-06",
        "outer_depart_end": "2026-10-08",
        "outer_return_start": "2026-10-22",
        "outer_return_end": "2026-10-26",
        "inner_origin": "SAO",
        "inner_destination": "SSA",
        "inner_trip_min_days": 2,
        "inner_trip_max_days": 4,
        "midpoint_slack_days": 1,
    },
    {
        "key": "bog_rio_ssa_strategy",
        "title": "Estrategia vía Río | Bogotá → Río + vuelo a Salvador en la mitad",
        "type": "split_strategy",
        "outer_origin": "BOG",
        "outer_destination": "RIO",
        "outer_depart_start": "2026-10-06",
        "outer_depart_end": "2026-10-08",
        "outer_return_start": "2026-10-22",
        "outer_return_end": "2026-10-26",
        "inner_origin": "RIO",
        "inner_destination": "SSA",
        "inner_trip_min_days": 2,
        "inner_trip_max_days": 4,
        "midpoint_slack_days": 1,
    },
]


# =========================
# UTILIDADES
# =========================

def daterange(start_str, end_str):
    start = date.fromisoformat(start_str)
    end = date.fromisoformat(end_str)
    days = []
    current = start
    while current <= end:
        days.append(current)
        current += timedelta(days=1)
    return days


def midpoint_date(start_date, end_date):
    return start_date + timedelta(days=(end_date - start_date).days // 2)


def format_cop(value):
    if value is None:
        return "—"
    return f"COP {int(round(value)):,.0f}".replace(",", ".")


def minutes_to_text(minutes):
    if minutes is None:
        return "—"
    h = minutes // 60
    m = minutes % 60
    return f"{h}h {m:02d}m"


def score_option(opt):
    price = opt.get("price_value")
    duration = opt.get("duration_minutes")
    stops = opt.get("stops_value")

    if price is None:
        price = 10**12
    if duration is None:
        duration = 10**6
    if stops is None:
        stops = 99

    return price + duration * 1.5 + stops * 8000


def ensure_env():
    if not SERPAPI_API_KEY:
        raise RuntimeError("Falta la variable de entorno SERPAPI_API_KEY")


# =========================
# CONSULTA A SERPAPI
# =========================

def google_flights_search(origin, destination, outbound_date, return_date):
    params = {
        "engine": "google_flights",
        "api_key": SERPAPI_API_KEY,
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": outbound_date,
        "return_date": return_date,
        "type": 1,          # ida y vuelta
        "currency": "COP",
        "hl": "es",
        "gl": "co",
        "deep_search": "true",
        "sort_by": 2,       # precio
        "no_cache": "true",
    }

    resp = requests.get(SERPAPI_URL, params=params, timeout=90)
    resp.raise_for_status()
    return resp.json()


def extract_options(data, label_prefix, depart_date, return_date):
    options = []

    all_blocks = []
    if isinstance(data.get("best_flights"), list):
        all_blocks.extend(data["best_flights"])
    if isinstance(data.get("other_flights"), list):
        all_blocks.extend(data["other_flights"])

    for idx, block in enumerate(all_blocks, start=1):
        price = block.get("price")
        total_duration = block.get("total_duration")
        layovers = block.get("layovers", [])
        flights = block.get("flights", [])

        segments = []
        airlines = []

        for seg in flights:
            carrier = seg.get("airline", "—")
            airlines.append(carrier)

            dep_airport = seg.get("departure_airport", {}) or {}
            arr_airport = seg.get("arrival_airport", {}) or {}

            segments.append({
                "carrier": carrier,
                "flight_number": seg.get("flight_number"),
                "origin": dep_airport.get("id", "—"),
                "origin_name": dep_airport.get("name"),
                "departure_local": dep_airport.get("time", "—"),
                "destination": arr_airport.get("id", "—"),
                "destination_name": arr_airport.get("name"),
                "arrival_local": arr_airport.get("time", "—"),
            })

        stop_count = len(layovers) if isinstance(layovers, list) else None
        if stop_count == 0:
            stop_text = "Directo"
        elif stop_count == 1:
            stop_text = "1 parada"
        elif stop_count is None:
            stop_text = "—"
        else:
            stop_text = f"{stop_count} paradas"

        options.append({
            "label": f"{label_prefix} #{idx}",
            "total_price_cop": format_cop(price),
            "price_value": price,
            "outbound_date": depart_date,
            "return_date": return_date,
            "total_duration": minutes_to_text(total_duration),
            "duration_minutes": total_duration,
            "stops": stop_text,
            "stops_value": stop_count,
            "airlines": ", ".join(sorted(set(airlines))) if airlines else "—",
            "segments": segments,
        })

    return options


# =========================
# BÚSQUEDAS SIMPLES
# =========================

def run_round_trip_search(search_cfg):
    all_options = []

    depart_dates = daterange(search_cfg["depart_start"], search_cfg["depart_end"])
    return_dates = daterange(search_cfg["return_start"], search_cfg["return_end"])

    for dep in depart_dates:
        for ret in return_dates:
            if ret <= dep:
                continue

            try:
                raw = google_flights_search(
                    search_cfg["origin"],
                    search_cfg["destination"],
                    dep.isoformat(),
                    ret.isoformat(),
                )
                extracted = extract_options(
                    raw,
                    label_prefix=f"{dep.isoformat()} → {ret.isoformat()}",
                    depart_date=dep.isoformat(),
                    return_date=ret.isoformat(),
                )
                all_options.extend(extracted)
            except Exception as e:
                print(f"[WARN] Error en {search_cfg['title']} | {dep} -> {ret}: {e}")

    all_options.sort(key=score_option)
    return {
        "title": search_cfg["title"],
        "description": "Mejores opciones encontradas con Google Flights.",
        "options": all_options[:5],
    }


# =========================
# ESTRATEGIAS PARTIDAS
# =========================

def run_split_strategy_search(search_cfg):
    combined_options = []

    outer_depart_dates = daterange(search_cfg["outer_depart_start"], search_cfg["outer_depart_end"])
    outer_return_dates = daterange(search_cfg["outer_return_start"], search_cfg["outer_return_end"])

    for outer_dep in outer_depart_dates:
        for outer_ret in outer_return_dates:
            if outer_ret <= outer_dep:
                continue

            midpoint = midpoint_date(outer_dep, outer_ret)

            inner_depart_candidates = [
                midpoint + timedelta(days=delta)
                for delta in range(-search_cfg["midpoint_slack_days"], search_cfg["midpoint_slack_days"] + 1)
            ]

            inner_ranges = []
            for inner_dep in inner_depart_candidates:
                for days_inside in range(search_cfg["inner_trip_min_days"], search_cfg["inner_trip_max_days"] + 1):
                    inner_ret = inner_dep + timedelta(days=days_inside)
                    if outer_dep < inner_dep < inner_ret < outer_ret:
                        inner_ranges.append((inner_dep, inner_ret))

            # outer
            outer_results = []
            try:
                outer_raw = google_flights_search(
                    search_cfg["outer_origin"],
                    search_cfg["outer_destination"],
                    outer_dep.isoformat(),
                    outer_ret.isoformat(),
                )
                outer_results = extract_options(
                    outer_raw,
                    label_prefix="Tramo exterior",
                    depart_date=outer_dep.isoformat(),
                    return_date=outer_ret.isoformat(),
                )[:3]
            except Exception as e:
                print(f"[WARN] Error outer {search_cfg['title']} | {outer_dep} -> {outer_ret}: {e}")
                continue

            # inner
            for inner_dep, inner_ret in inner_ranges:
                try:
                    inner_raw = google_flights_search(
                        search_cfg["inner_origin"],
                        search_cfg["inner_destination"],
                        inner_dep.isoformat(),
                        inner_ret.isoformat(),
                    )
                    inner_results = extract_options(
                        inner_raw,
                        label_prefix="Tramo interior",
                        depart_date=inner_dep.isoformat(),
                        return_date=inner_ret.isoformat(),
                    )[:3]
                except Exception as e:
                    print(f"[WARN] Error inner {search_cfg['title']} | {inner_dep} -> {inner_ret}: {e}")
                    continue

                for outer_opt in outer_results:
                    for inner_opt in inner_results:
                        price_total = None
                        if outer_opt["price_value"] is not None and inner_opt["price_value"] is not None:
                            price_total = outer_opt["price_value"] + inner_opt["price_value"]

                        duration_total = None
                        if outer_opt["duration_minutes"] is not None and inner_opt["duration_minutes"] is not None:
                            duration_total = outer_opt["duration_minutes"] + inner_opt["duration_minutes"]

                        stops_total = None
                        if outer_opt["stops_value"] is not None and inner_opt["stops_value"] is not None:
                            stops_total = outer_opt["stops_value"] + inner_opt["stops_value"]

                        if stops_total == 0:
                            stops_text = "Directo"
                        elif stops_total == 1:
                            stops_text = "1 parada"
                        elif stops_total is None:
                            stops_text = "—"
                        else:
                            stops_text = f"{stops_total} paradas"

                        airlines = sorted(set(
                            [x.strip() for x in outer_opt["airlines"].split(",") if x.strip()] +
                            [x.strip() for x in inner_opt["airlines"].split(",") if x.strip()]
                        ))

                        combined_options.append({
                            "label": f"Exterior {outer_dep.isoformat()}→{outer_ret.isoformat()} + interior {inner_dep.isoformat()}→{inner_ret.isoformat()}",
                            "total_price_cop": format_cop(price_total),
                            "price_value": price_total,
                            "outbound_date": outer_dep.isoformat(),
                            "return_date": outer_ret.isoformat(),
                            "total_duration": minutes_to_text(duration_total),
                            "duration_minutes": duration_total,
                            "stops": stops_text,
                            "stops_value": stops_total,
                            "airlines": ", ".join(airlines) if airlines else "—",
                            "segments": outer_opt["segments"] + inner_opt["segments"],
                        })

    combined_options.sort(key=score_option)
    return {
        "title": search_cfg["title"],
        "description": "Combinación exterior + tramo interior, evaluada con Google Flights.",
        "options": combined_options[:5],
    }


# =========================
# SALIDA JSON
# =========================

def build_json_output():
    sections = []

    for cfg in SEARCHES:
        print(f"[INFO] Procesando: {cfg['title']}")
        if cfg["type"] == "round_trip":
            section = run_round_trip_search(cfg)
        elif cfg["type"] == "split_strategy":
            section = run_split_strategy_search(cfg)
        else:
            continue

        sections.append(section)

    # comentario manual sobre bus
    sections.append({
        "title": "Comentario manual | São Paulo → Salvador en bus",
        "description": (
            "Esta parte no se consulta automáticamente. "
            "Puede añadirse una estimativa manual de costo, tiempo total y logística."
        ),
        "options": [
            {
                "label": "Estimativa manual",
                "total_price_cop": "Revisar manualmente",
                "price_value": None,
                "outbound_date": "—",
                "return_date": "—",
                "total_duration": "Trayecto largo, revisar operador y terminal",
                "duration_minutes": None,
                "stops": "No aplica",
                "stops_value": None,
                "airlines": "Bus interurbano",
                "segments": [],
            }
        ],
    })

    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "sections": sections,
    }


def main():
    ensure_env()

    output = build_json_output()

    output_path = Path("data/travel-options.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"[OK] Archivo actualizado: {output_path}")


if __name__ == "__main__":
    main()
