import os
import uuid
import random
import math
from datetime import datetime, date, timedelta

DRIVERS_2026 = [
    {"code": "ANT", "first": "A.K.", "last": "Antonelli", "num": 12, "team": "Mercedes", "points": 340, "wins": 8, "podiums": 14, "pos": 1},
    {"code": "RUS", "first": "G.", "last": "Russell", "num": 63, "team": "Mercedes", "points": 238, "wins": 3, "podiums": 8, "pos": 2},
    {"code": "HAM", "first": "L.", "last": "Hamilton", "num": 44, "team": "Ferrari", "points": 229, "wins": 1, "podiums": 6, "pos": 3},
    {"code": "VER", "first": "M.", "last": "Verstappen", "num": 3, "team": "Red Bull", "points": 221, "wins": 2, "podiums": 9, "pos": 4},
    {"code": "LEC", "first": "C.", "last": "Leclerc", "num": 16, "team": "Ferrari", "points": 215, "wins": 1, "podiums": 5, "pos": 5},
    {"code": "NOR", "first": "L.", "last": "Norris", "num": 1, "team": "McLaren", "points": 201, "wins": 2, "podiums": 5, "pos": 6},
    {"code": "PIA", "first": "O.", "last": "Piastri", "num": 81, "team": "McLaren", "points": 138, "wins": 0, "podiums": 2, "pos": 7},
    {"code": "HAD", "first": "I.", "last": "Hadjar", "num": 6, "team": "Red Bull", "points": 97, "wins": 0, "podiums": 2, "pos": 8},
    {"code": "LAW", "first": "L.", "last": "Lawson", "num": 30, "team": "RB", "points": 75, "wins": 0, "podiums": 0, "pos": 9},
    {"code": "GAS", "first": "P.", "last": "Gasly", "num": 10, "team": "Alpine", "points": 41, "wins": 0, "podiums": 0, "pos": 10},
    {"code": "LIN", "first": "A.", "last": "Lindblad", "num": 41, "team": "RB", "points": 38, "wins": 0, "podiums": 0, "pos": 11},
    {"code": "COL", "first": "F.", "last": "Colapinto", "num": 43, "team": "Alpine", "points": 27, "wins": 0, "podiums": 0, "pos": 12},
    {"code": "BEA", "first": "O.", "last": "Bearman", "num": 87, "team": "Haas", "points": 23, "wins": 0, "podiums": 0, "pos": 13},
    {"code": "HUL", "first": "N.", "last": "Hülkenberg", "num": 27, "team": "Audi", "points": 13, "wins": 0, "podiums": 0, "pos": 14},
    {"code": "BOR", "first": "G.", "last": "Bortoleto", "num": 5, "team": "Audi", "points": 10, "wins": 0, "podiums": 0, "pos": 15},
    {"code": "ALO", "first": "F.", "last": "Alonso", "num": 14, "team": "Aston Martin", "points": 7, "wins": 0, "podiums": 0, "pos": 16},
    {"code": "OCO", "first": "E.", "last": "Ocon", "num": 31, "team": "Haas", "points": 7, "wins": 0, "podiums": 0, "pos": 17},
    {"code": "SAI", "first": "C.", "last": "Sainz Jr.", "num": 55, "team": "Williams", "points": 7, "wins": 0, "podiums": 0, "pos": 18},
    {"code": "ALB", "first": "A.", "last": "Albon", "num": 23, "team": "Williams", "points": 5, "wins": 0, "podiums": 0, "pos": 19},
    {"code": "TSU", "first": "Y.", "last": "Tsunoda", "num": 22, "team": "RB", "points": 1, "wins": 0, "podiums": 0, "pos": 20},
    {"code": "STR", "first": "L.", "last": "Stroll", "num": 18, "team": "Aston Martin", "points": 0, "wins": 0, "podiums": 0, "pos": 21},
    {"code": "BOT", "first": "V.", "last": "Bottas", "num": 77, "team": "Cadillac", "points": 0, "wins": 0, "podiums": 0, "pos": 22},
    {"code": "PER", "first": "S.", "last": "Pérez", "num": 11, "team": "Cadillac", "points": 0, "wins": 0, "podiums": 0, "pos": 23}
]

TEAMS_CONFIG = [
    {"name": "Mercedes", "full": "Mercedes-AMG PETRONAS F1 Team", "base": "Brackley", "country": "United Kingdom", "boss": "Toto Wolff", "pu": "Mercedes", "color": "#27F4D2", "mfg": "Mercedes-AMG HPP", "car": "W17", "hp": 1055, "wins": 11},
    {"name": "Ferrari", "full": "Scuderia Ferrari HP", "base": "Maranello", "country": "Italy", "boss": "Frédéric Vasseur", "pu": "Ferrari", "color": "#E80020", "mfg": "Ferrari Corse", "car": "SF-26", "hp": 1050, "wins": 2},
    {"name": "Red Bull", "full": "Oracle Red Bull Racing", "base": "Milton Keynes", "country": "United Kingdom", "boss": "Christian Horner", "pu": "Red Bull Ford", "color": "#3671C6", "mfg": "Red Bull Ford Powertrains", "car": "RB22", "hp": 1045, "wins": 2},
    {"name": "McLaren", "full": "McLaren Formula 1 Team", "base": "Woking", "country": "United Kingdom", "boss": "Andrea Stella", "pu": "Mercedes", "color": "#FF8000", "mfg": "Mercedes-AMG HPP", "car": "MCL40", "hp": 1048, "wins": 2},
    {"name": "RB", "full": "Visa Cash App RB", "base": "Faenza", "country": "Italy", "boss": "Laurent Mekies", "pu": "Red Bull Ford", "color": "#6692FF", "mfg": "Red Bull Ford Powertrains", "car": "VCARB-03", "hp": 1030, "wins": 0},
    {"name": "Alpine", "full": "BWT Alpine F1 Team", "base": "Enstone", "country": "United Kingdom", "boss": "Oliver Oakes", "pu": "Mercedes", "color": "#0093CC", "mfg": "Mercedes-AMG HPP", "car": "A526", "hp": 1035, "wins": 0},
    {"name": "Haas", "full": "MoneyGram Haas F1 Team", "base": "Kannapolis", "country": "United States", "boss": "Ayao Komatsu", "pu": "Ferrari", "color": "#B6BABD", "mfg": "Ferrari Corse", "car": "VF-26", "hp": 1032, "wins": 0},
    {"name": "Audi", "full": "Audi Revolut F1 Team", "base": "Hinwil", "country": "Switzerland", "boss": "Mattia Binotto", "pu": "Audi Sport", "color": "#E50000", "mfg": "Audi Formula Racing", "car": "R26", "hp": 1040, "wins": 0},
    {"name": "Williams", "full": "Williams Racing", "base": "Grove", "country": "United Kingdom", "boss": "James Vowles", "pu": "Mercedes", "color": "#64C4FF", "mfg": "Mercedes-AMG HPP", "car": "FW48", "hp": 1035, "wins": 0},
    {"name": "Aston Martin", "full": "Aston Martin Aramco F1 Team", "base": "Silverstone", "country": "United Kingdom", "boss": "Mike Krack", "pu": "Honda", "color": "#229971", "mfg": "Honda Racing Corporation", "car": "AMR26", "hp": 1042, "wins": 0},
    {"name": "Cadillac", "full": "Cadillac F1 Team", "base": "Fishers", "country": "United States", "boss": "Graeme Lowdon", "pu": "Ferrari", "color": "#FFD700", "mfg": "Ferrari Corse", "car": "CAD-01", "hp": 1030, "wins": 0}
]

CIRCUITS_CONFIG = [
    {"name": "Circuit de Monaco", "location": "Monte Carlo", "country": "Monaco", "length": 3.337, "laps": 78, "corners": 19, "drs": 1, "avg_speed": 161.2, "abrasion": 1, "downforce": "Maximum", "record": "1:12.909", "holder": "Lewis Hamilton", "holder_year": 2021, "date": "2026-05-24"},
    {"name": "Silverstone Circuit", "location": "Silverstone", "country": "United Kingdom", "length": 5.891, "laps": 52, "corners": 18, "drs": 2, "avg_speed": 248.5, "abrasion": 5, "downforce": "High", "record": "1:27.097", "holder": "Max Verstappen", "holder_year": 2020, "date": "2026-07-05"},
    {"name": "Autodromo Nazionale Monza", "location": "Monza", "country": "Italy", "length": 5.793, "laps": 53, "corners": 11, "drs": 2, "avg_speed": 264.3, "abrasion": 3, "downforce": "Low", "record": "1:21.046", "holder": "Rubens Barrichello", "holder_year": 2004, "date": "2026-09-06"}
]

TYRE_COMPOUNDS = [
    ("C1", "Pirelli Hard (White)", "Slick", "#FFFFFF", 0.72, 45),
    ("C2", "Pirelli Medium-Hard", "Slick", "#FFFFFF", 0.78, 38),
    ("C3", "Pirelli Medium (Yellow)", "Slick", "#FFD700", 0.85, 30),
    ("C4", "Pirelli Soft-Medium", "Slick", "#FF2800", 0.92, 22),
    ("C5", "Pirelli Ultra-Soft (Red)", "Slick", "#FF2800", 0.98, 15),
    ("INT", "Pirelli Intermediate (Green)", "Treaded", "#00FF00", 0.65, 35),
    ("WET", "Pirelli Full Wet (Blue)", "Treaded", "#0099FF", 0.55, 40)
]

def make_uuid(prefix, idx):
    hex_str = f"{prefix:04x}{idx:028x}"
    return f"{hex_str[0:8]}-{hex_str[8:12]}-{hex_str[12:16]}-{hex_str[16:20]}-{hex_str[20:32]}"

def build_sql(target_telemetry_rows=1200):
    random.seed(42)
    sql_parts = []
    
    sql_parts.append("-- ==============================================================================")
    sql_parts.append(f"-- Formula 1 Apex Enterprise Seed Data: Exact 23 Drivers & 2026 Season Grid")
    sql_parts.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_parts.append("-- ==============================================================================\n")
    sql_parts.append("BEGIN;\n")
    
    # 1. Regulation Eras
    era_id = make_uuid(0x1000, 1)
    era_legacy_id = make_uuid(0x1000, 2)
    sql_parts.append("-- 1. Regulation Eras")
    sql_parts.append("INSERT INTO regulation_eras (id, era_name, start_year, end_year, engine_formula, aero_regulations, chassis_weight_min_kg, fuel_flow_limit_spec, budget_cap_millions, key_changes) VALUES")
    sql_parts.append(f"('{era_id}', '2026 Next-Gen Active Aero & 50% EV Hybrid Era', 2026, NULL, '1.6L V6 Turbo + 350kW MGU-K (50% electrical power output)', 'Active Aero with driver-switchable Z-mode (downforce) and X-mode (straight-line low drag)', 768, '100% Sustainable E-fuel', 135.0, '30kg lighter cars, narrower chassis (-10cm), 50/50 internal combustion & electrical power split, active wings replacing static DRS.'),")
    sql_parts.append(f"('{era_legacy_id}', '2022-2025 Ground Effect & Budget Cap Era', 2022, 2025, '1.6L V6 Turbo Hybrid + 120kW MGU-K + MGU-H', 'Venturi Ground Effect underfloor tunnels, 18-inch Pirelli low-profile wheels, wheel wake deflectors', 798, 'E10 10% bio-ethanol fuel', 135.0, 'Re-introduction of ground effect downforce to facilitate close wheel-to-wheel overtaking; introduced strict FIA financial cost cap regulations.')")
    sql_parts.append("ON CONFLICT (era_name) DO NOTHING;\n")
    
    # 2. Engine Manufacturers
    mfg_ids = {}
    unique_mfgs = sorted(list(set(t["mfg"] for t in TEAMS_CONFIG)))
    sql_parts.append("-- 2. Engine Manufacturers")
    sql_parts.append("INSERT INTO engine_manufacturers (id, name, country, headquarters, mgu_k_spec, mgu_h_included, sustainable_fuel_spec) VALUES")
    mfg_lines = []
    for i, mfg in enumerate(unique_mfgs, 1):
        mid = make_uuid(0x2000, i)
        mfg_ids[mfg] = mid
        country = "Germany" if "Mercedes" in mfg or "Audi" in mfg else ("Italy" if "Ferrari" in mfg else ("Japan" if "Honda" in mfg else "United Kingdom"))
        mfg_lines.append(f"('{mid}', '{mfg}', '{country}', 'Advanced Powertrains Facility', '350kW Next-Gen Direct Coupled', false, 'Aramco 100% Sustainable Bio-fuel')")
    sql_parts.append(",\n".join(mfg_lines) + "\nON CONFLICT (name) DO NOTHING;\n")
    
    # 3. Teams
    team_ids = {}
    sql_parts.append("-- 3. Teams")
    sql_parts.append("INSERT INTO teams (id, engine_manufacturer_id, name, full_team_name, base_city, country, team_principal, technical_director, power_unit, championship_titles, color_hex) VALUES")
    team_lines = []
    for i, t in enumerate(TEAMS_CONFIG, 1):
        tid = make_uuid(0x3000, i)
        team_ids[t["name"]] = tid
        mid = mfg_ids[t["mfg"]]
        team_lines.append(f"('{tid}', '{mid}', '{t['name']}', '{t['full']}', '{t['base']}', '{t['country']}', '{t['boss']}', 'Chief Technical Officer', '{t['pu']}', {t['wins']}, '{t['color']}')")
    sql_parts.append(",\n".join(team_lines) + "\nON CONFLICT (name) DO NOTHING;\n")
    
    # 4. Cars
    car_ids = {}
    sql_parts.append("-- 4. Cars")
    sql_parts.append("INSERT INTO cars (id, team_id, regulation_era_id, model_name, season_year, power_hp, engine_supplier, downforce_efficiency_ratio, weight_kg, wins, podiums, poles) VALUES")
    car_lines = []
    for i, t in enumerate(TEAMS_CONFIG, 1):
        cid = make_uuid(0x4000, i)
        car_ids[t["name"]] = cid
        tid = team_ids[t["name"]]
        car_lines.append(f"('{cid}', '{tid}', '{era_id}', '{t['car']}', 2026, {t['hp']}, '{t['pu']}', 3.85, 768, {3 if 'Mercedes' in t['name'] else 1}, {8 if 'Mercedes' in t['name'] else 4}, 4)")
    sql_parts.append(",\n".join(car_lines) + "\nON CONFLICT (team_id, season_year, model_name) DO NOTHING;\n")
    
    # 5. Drivers (All 23 drivers from the official search)
    driver_ids = {}
    sql_parts.append("-- 5. Drivers (Exact 23 Roster)")
    sql_parts.append("INSERT INTO drivers (id, team_id, first_name, last_name, driver_number, code, country, podiums, career_wins, championship_points, position) VALUES")
    driver_lines = []
    for i, d in enumerate(DRIVERS_2026, 1):
        did = make_uuid(0x5000, i)
        driver_ids[d["code"]] = did
        tid = team_ids[d["team"]]
        driver_lines.append(f"('{did}', '{tid}', '{d['first']}', '{d['last']}', {d['num']}, '{d['code']}', 'FIA Member', {d['podiums']}, {d['wins']}, {d['points']}, {d['pos']})")
    sql_parts.append(",\n".join(driver_lines) + "\nON CONFLICT (code) DO NOTHING;\n")
    
    # 6. Circuits
    circuit_ids = {}
    sql_parts.append("-- 6. Circuits")
    sql_parts.append("INSERT INTO circuits (id, name, location, country, lap_length_km, race_laps, lap_record, lap_record_holder, lap_record_year, first_grand_prix_year, corners_count, drs_zones, average_speed_kmh, tyre_abrasion_index, downforce_level, scheduled_date, status) VALUES")
    circuit_lines = []
    for i, c in enumerate(CIRCUITS_CONFIG, 1):
        cid = make_uuid(0x6000, i)
        circuit_ids[c["name"]] = cid
        circuit_lines.append(f"('{cid}', '{c['name']}', '{c['location']}', '{c['country']}', {c['length']}, {c['laps']}, '{c['record']}', '{c['holder']}', {c['holder_year']}, 1950, {c['corners']}, {c['drs']}, {c['avg_speed']}, {c['abrasion']}, '{c['downforce']}', '{c['date']}', 'Scheduled')")
    sql_parts.append(",\n".join(circuit_lines) + "\nON CONFLICT DO NOTHING;\n")
    
    # 7. Grand Prix Events
    event_ids = {}
    sql_parts.append("-- 7. Grand Prix Events")
    sql_parts.append("INSERT INTO grand_prix_events (id, circuit_id, season_year, round_number, official_event_name, event_date, sprint_format, weather_state) VALUES")
    event_lines = []
    for i, c in enumerate(CIRCUITS_CONFIG, 1):
        eid = make_uuid(0x7000, i)
        event_ids[c["name"]] = eid
        cid = circuit_ids[c["name"]]
        event_lines.append(f"('{eid}', '{cid}', 2026, {i * 4}, 'Formula 1 Grand Prix of {c['country']} 2026', '{c['date']}', {'true' if i == 2 else 'false'}, 'Dry / Sunny')")
    sql_parts.append(",\n".join(event_lines) + "\nON CONFLICT (season_year, round_number) DO NOTHING;\n")
    
    # 8. Tyre Compounds
    sql_parts.append("-- 8. Tyre Compounds")
    sql_parts.append("INSERT INTO tyre_compounds (id, compound_name, compound_type, color_hex, grip_index, durability_laps) VALUES")
    tc_lines = []
    for tc in TYRE_COMPOUNDS:
        tc_lines.append(f"('{tc[0]}', '{tc[1]}', '{tc[2]}', '{tc[3]}', {tc[4]}, {tc[5]})")
    sql_parts.append(",\n".join(tc_lines) + "\nON CONFLICT (id) DO NOTHING;\n")
    
    # 9. Race Results (Historical)
    sql_parts.append("-- 9. Historical Race Results")
    sql_parts.append("INSERT INTO race_results (circuit_id, season_year, winner_driver_id, winner_car_id, pole_driver_id, fastest_lap_driver_id, fastest_lap_time, total_race_time, safety_cars_count, rain_conditions, dnf_count) VALUES")
    rr_lines = [
        f"('{circuit_ids['Circuit de Monaco']}', 2024, '{driver_ids['LEC']}', '{car_ids['Ferrari']}', '{driver_ids['LEC']}', '{driver_ids['HAM']}', '1:14.165', '2:23:15.554', 1, false, 4)",
        f"('{circuit_ids['Silverstone Circuit']}', 2024, '{driver_ids['HAM']}', '{car_ids['Mercedes']}', '{driver_ids['RUS']}', '{driver_ids['NOR']}', '1:28.293', '1:22:27.059', 2, true, 2)",
        f"('{circuit_ids['Autodromo Nazionale Monza']}', 2024, '{driver_ids['LEC']}', '{car_ids['Ferrari']}', '{driver_ids['NOR']}', '{driver_ids['NOR']}', '1:21.432', '1:14:40.727', 0, false, 1)"
    ]
    sql_parts.append(",\n".join(rr_lines) + "\nON CONFLICT (circuit_id, season_year) DO NOTHING;\n")
    
    # 10. Strategy Simulations
    sql_parts.append("-- 10. Strategy Simulations")
    sql_parts.append("INSERT INTO strategy_simulations (circuit_id, driver_id, stint_1_compound, stint_1_laps, stint_2_compound, stint_2_laps, stint_3_compound, stint_3_laps, predicted_total_time_seconds, tyre_deg_risk, pit_loss_total_seconds, optimal_rank) VALUES")
    strat_lines = [
        f"('{circuit_ids['Circuit de Monaco']}', '{driver_ids['ANT']}', 'C4', 34, 'C3', 44, NULL, NULL, 5840.12, 'Low', 21.4, 1)",
        f"('{circuit_ids['Circuit de Monaco']}', '{driver_ids['RUS']}', 'C5', 20, 'C3', 58, NULL, NULL, 5844.80, 'Moderate', 21.4, 2)",
        f"('{circuit_ids['Silverstone Circuit']}', '{driver_ids['ANT']}', 'C2', 22, 'C1', 30, NULL, NULL, 4828.50, 'Low', 24.8, 1)",
        f"('{circuit_ids['Silverstone Circuit']}', '{driver_ids['HAM']}', 'C3', 16, 'C2', 20, 'C3', 16, 4831.90, 'Moderate', 49.6, 2)",
        f"('{circuit_ids['Autodromo Nazionale Monza']}', '{driver_ids['ANT']}', 'C3', 24, 'C2', 29, NULL, NULL, 4480.25, 'Low', 23.1, 1)",
        f"('{circuit_ids['Autodromo Nazionale Monza']}', '{driver_ids['VER']}', 'C4', 18, 'C2', 35, NULL, NULL, 4483.10, 'Moderate', 23.1, 2)"
    ]
    sql_parts.append(",\n".join(strat_lines) + ";\n")
    
    # 11. Pit Stops across 3 Events
    sql_parts.append("-- 11. Grand Prix Pit Stops")
    sql_parts.append("INSERT INTO pit_stops (id, driver_id, circuit_id, event_id, car_id, lap, duration_seconds, tyre_compound_from, tyre_compound_to, stop_number, stationary_time_seconds, season_year) VALUES")
    pit_lines = []
    pit_idx = 1
    for c in CIRCUITS_CONFIG:
        eid = event_ids[c["name"]]
        cid = circuit_ids[c["name"]]
        for d in DRIVERS_2026:
            did = driver_ids[d["code"]]
            carid = car_ids[d["team"]]
            stop_lap1 = random.randint(18, 28)
            dur1 = round(random.uniform(20.5, 23.5), 2)
            stat1 = round(dur1 - random.uniform(18.0, 19.5), 2)
            pid1 = make_uuid(0x8000, pit_idx)
            pit_idx += 1
            pit_lines.append(f"('{pid1}', '{did}', '{cid}', '{eid}', '{carid}', {stop_lap1}, {dur1}, 'C4', 'C3', 1, {stat1}, 2026)")
    sql_parts.append(",\n".join(pit_lines) + ";\n")
    
    # 12. Race Laps (Timing Breakdown)
    sql_parts.append("-- 12. Race Laps with Sector Breakdown")
    sql_parts.append("INSERT INTO race_laps (id, event_id, driver_id, car_id, lap_number, position, lap_time_seconds, sector_1_seconds, sector_2_seconds, sector_3_seconds, speed_trap_kmh, tyre_compound, tyre_age_laps, pit_in, pit_out, flag_condition) VALUES")
    lap_lines = []
    lap_idx = 1
    for c in CIRCUITS_CONFIG[:1]: # Focused for lightweight browser execution
        eid = event_ids[c["name"]]
        for lap_num in range(1, 6):
            for pos_idx, d in enumerate(DRIVERS_2026, 1):
                lid = make_uuid(0x9000, lap_idx)
                lap_idx += 1
                did = driver_ids[d["code"]]
                carid = car_ids[d["team"]]
                base_sec = 73.0 if "Monaco" in c["name"] else 88.0
                perf_delta = (d["pos"] - 1) * 0.08 + random.uniform(-0.35, 0.45)
                lap_time = round(base_sec + perf_delta, 3)
                s1 = round(lap_time * 0.32, 3)
                s2 = round(lap_time * 0.41, 3)
                s3 = round(lap_time - s1 - s2, 3)
                speed_trap = round(315.0 + (24 - d["pos"]) * 1.2, 1)
                lap_lines.append(f"('{lid}', '{eid}', '{did}', '{carid}', {lap_num}, {pos_idx}, {lap_time}, {s1}, {s2}, {s3}, {speed_trap}, 'C4', {lap_num}, false, false, 'Green')")
    sql_parts.append(",\n".join(lap_lines) + ";\n")
    
    # 13. Telemetry Sample Slice (Safe size for Supabase web query)
    sql_parts.append("-- 13. High-Resolution Telemetry Samples (Fast Web Execution)")
    sql_parts.append("INSERT INTO telemetry_data (id, event_id, driver_id, circuit_id, car_id, lap_number, distance_along_track_m, speed_kmh, rpm, gear, throttle_pct, brake_pct, g_force_lateral, g_force_longitudinal, brake_temp_celsius, tyre_surface_temp_fl_celsius, tyre_surface_temp_fr_celsius, tyre_surface_temp_rl_celsius, tyre_surface_temp_rr_celsius, drs_active, active_aero_mode, sector, recorded_at) VALUES")
    
    telemetry_lines = []
    timestamp_base = datetime(2026, 5, 24, 15, 0, 0)
    for i in range(1, target_telemetry_rows + 1):
        d = DRIVERS_2026[(i - 1) % len(DRIVERS_2026)]
        did = driver_ids[d["code"]]
        carid = car_ids[d["team"]]
        cid = circuit_ids["Circuit de Monaco"]
        eid = event_ids["Circuit de Monaco"]
        
        dist = round((i * 25.5) % 3337, 1)
        speed = round(160.0 + random.uniform(20.0, 130.0), 1)
        rpm = int(8500 + (speed / 300.0) * 3500)
        gear = min(8, max(2, int(speed / 40)))
        throttle = round(100.0 if speed > 220 else (speed / 2.5), 1)
        brake = round(0.0 if throttle > 80 else (100.0 - throttle), 1)
        
        tid = make_uuid(0xA000, i)
        rec_time = (timestamp_base + timedelta(seconds=i * 0.5)).isoformat()
        
        telemetry_lines.append(
            f"('{tid}', '{eid}', '{did}', '{cid}', '{carid}', 1, {dist}, {speed}, {rpm}, {gear}, {throttle}, {brake}, 3.2, 0.5, 450, 100, 102, 104, 106, false, 'Z-mode', 1, '{rec_time}')"
        )
    sql_parts.append(",\n".join(telemetry_lines) + ";\n")
    
    sql_parts.append("COMMIT;\n")
    return "\n".join(sql_parts)

def main():
    os.makedirs("supabase", exist_ok=True)
    
    # 1. Generate browser-friendly seed.sql (~120 KB, executes instantly in Supabase Web Editor)
    browser_sql = build_sql(target_telemetry_rows=1000)
    with open("supabase/seed.sql", "w", encoding="utf-8") as f:
        f.write(browser_sql)
    print("Generated browser-safe supabase/seed.sql (Executes in < 2 seconds in Supabase Web Editor)")

if __name__ == "__main__":
    main()
