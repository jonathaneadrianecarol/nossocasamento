# scripts/update_travel_data.py

import os
import json
import requests
from pathlib import Path
from datetime import date, datetime, timedelta


SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
SERPAPI_URL = "https://serpapi.com/search.json"

# Límite de seguridad para no agotar créditos por accidente.
# Ajusta este valor cuando quieras volver a probar.
MAX_REQUESTS = 25
REQUEST_COUNT = 0


# =========================
# CONFIGURACIÓN DE BÚSQUEDAS
# =========================

SEARCHES = [
    {
        "key": "cuc_ssa_short",
        "title": "Desde Cúcuta: opción de viaje corto en octubre",
        "description_public": "Escenario orientativo con salida entre el 6 y el 8 de octubre, y regreso entre el 12 y el 13 de octubre.",
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
        "title": "Desde Cúcuta: opción de viaje más largo en octubre",
        "description_public": "Escenario orientativo con salida entre el 6 y el 8 de octubre, y regreso entre el 22 y el 26 de octubre.",
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
        "title": "Desde Bogotá: opción de viaje corto en octubre",
        "description_public": "Escenario orientativo con salida entre el 6 y el 8 de octubre, y regreso entre el 12 y el 13 de octubre.",
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
        "title": "Desde Bogotá: opción de viaje más largo en octubre",
        "description_public": "Escenario orientativo con salida entre el 6 y el 8 de octubre, y regreso entre el 22 y el 26 de octubre.",
        "type": "round_trip",
        "origin": "BOG",
        "destination": "SSA",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-22",
        "return_end": "2026-10-26",
    },
    {
        "key": "cuc_rio_long",
        "title": "Desde Cúcuta: referencia de viaje hacia Río de Janeiro en octubre",
        "description_public": "Escenario orientativo con salida entre el 6 y el 8 de octubre, y regreso entre el 22 y el 26 de octubre. Puede servir como referencia para quienes quieran evaluar una parada en Río antes de seguir hacia Salvador.",
        "type": "round_trip",
        "origin": "CUC",
        "destination": "RIO",
        "depart_start": "2026-10-06",
        "depart_end": "2026-10-08",
        "return_start": "2026-10-22",
        "return_end": "2026-10-26",
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


def normalize_airlines(value):
    if not value:
        return ""
    parts = [x.strip() for x in value.split(",") if x.strip()]
    return ", ".join(sorted(set(parts)))


def make_soft_signature(opt):
    return (
        opt.get("outbound_date"),
        opt.get("return_date"),
        opt.get("price_value"),
        opt.get("stops_value"),
        normalize_airlines(opt.get("airlines"))
    )


def deduplicate_options(options, max_duration_diff=45):
    grouped = {}

    for opt in options:
        sig = make_soft_signature(opt)

        if sig not in grouped:
            grouped[sig] = opt
            continue

        current = grouped[sig]
        current_duration = current.get("duration_minutes")
        new_duration = opt.get("duration_minutes")

        if current_duration is None or new_duration is None:
            continue

        if abs(new_duration - current_duration) <= max_duration_diff:
            if new_duration < current_duration:
                grouped[sig] = opt
        else:
            extended_sig = sig + (new_duration,)
            if extended_sig not in grouped:
                grouped[extended_sig] = opt

    deduped = list(grouped.values())
    deduped.sort(key=score_option)
    return deduped


def relabel_options(options):
    for idx, opt in enumerate(options, start=1):
        opt["label"] = f"Opción {idx}"
    return options


# =========================
# CONSULTA A SERPAPI
# =========================

def google_flights_search(origin, destination, outbound_date, return_date):
    global REQUEST_COUNT

    REQUEST_COUNT += 1
    if REQUEST_COUNT > MAX_REQUESTS:
        raise RuntimeError(
            f"Se alcanzó el límite de seguridad de búsquedas ({MAX_REQUESTS}). "
            "Ajusta MAX_REQUESTS si quieres ampliar la corrida."
        )

    params = {
        "engine": "google_flights",
        "api_key": SERPAPI_API_KEY,
        "departure_id": origin,
        "arrival_id": destination,
        "outbound_date": outbound_date,
        "return_date": return_date,
        "type": 1,
        "currency": "COP",
        "hl": "es",
        "gl": "co",
        "deep_search": "true",
        "sort_by": 2,
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
                print(f"[WARN] Error en {search_cfg['title']} | {dep} -> {ret}: {e}", flush=True)

    all_options = deduplicate_options(all_options)
    all_options = relabel_options(all_options)

    return {
        "title": search_cfg["title"],
        "description": search_cfg.get("description_public", "Mejores opciones encontradas con Google Flights."),
        "options": all_options[:4],
    }


# =========================
# SALIDA JSON
# =========================

def build_json_output():
    sections = []

    for cfg in SEARCHES:
        print(f"[INFO] Procesando: {cfg['title']}", flush=True)
        if cfg["type"] == "round_trip":
            section = run_round_trip_search(cfg)
        else:
            continue

        sections.append(section)

    sections.append({
        "title": "Estrategia con posibilidad de pasar por São Paulo",
        "description": "Esta parte se mantiene como referencia manual. La idea es evaluar si conviene combinar el viaje con una parada en São Paulo y luego continuar hacia Salvador con un tramo interno dentro de Brasil.",
        "options": []
    })

    sections.append({
        "title": "Estrategia con posibilidad de pasar por Río de Janeiro",
        "description": "Esta parte se mantiene como referencia manual. La idea es evaluar si conviene combinar el viaje con una parada en Río y luego continuar hacia Salvador con un tramo interno dentro de Brasil.",
        "options": []
    })

    
    
    
    
    
    sections.append({
        "title": "Comentario manual | São Paulo a Salvador en bus",
        "description": (
            "Esta parte no se consulta automáticamente. "
            "Puede añadirse una estimativa manual de costo, tiempo total y logística."
        ),
        "options": [
            {
                "label": "Estimativa manual",
                "total_price_cop": "R$ 380 a R$ 940 aprox.",
              "price_value": null,
              "outbound_date": "—",
              "return_date": "—",
              "total_duration": "Aproximadamente 34 a 42 horas",
              "duration_minutes": null,
              "stops": "Puede variar según la ruta",
              "stops_value": null,
              "airlines": "Gontijo, Viação Catedral, Arte Transportes",
                "segments": []
            }
        ]
    })

    {
  "title": "Comentario manual | São Paulo → Rio de Janeiro en bus",
  "description": "Referencia manual para quienes quieran considerar un trayecto terrestre dentro de Brasil. Los valores y tiempos son aproximados y pueden cambiar según la empresa, la terminal y la fecha.",
  "options": [
    {
      "label": "Referencia aproximada",
      "total_price_cop": "R$ 60 a R$ 320 aprox.",
      "price_value": null,
      "outbound_date": "—",
      "return_date": "—",
      "total_duration": "Aproximadamente 6 a 7 horas",
      "duration_minutes": null,
      "stops": "Generalmente viaje directo",
      "stops_value": null,
      "airlines": "1001, Águia Branca, FlixBus, Itapemirim",
      "segments": [
        {
          "carrier": "Trayecto terrestre",
          "flight_number": null,
          "origin": "São Paulo",
          "origin_name": "Rodoviária do Tietê / Barra Funda",
          "departure_local": "Horario variable",
          "destination": "Rio de Janeiro",
          "destination_name": "Terminal Rodoviário Novo Rio",
          "arrival_local": "Horario variable"
        }
      ]
    }
  ]
}

    
    return {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "sections": sections
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

    print(f"[OK] Archivo actualizado: {output_path}", flush=True)


if __name__ == "__main__":
    main()
