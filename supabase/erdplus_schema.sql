-- ==============================================================================
-- ERDPlus / QuickDBD Clean Relational Schema for Formula 1 Apex RDBMS
-- Optimized for visual diagramming: entities, primary keys (PK), foreign keys (FK)
-- ==============================================================================

-- 1. REGULATION ERAS
CREATE TABLE regulation_eras (
    id UUID PRIMARY KEY,
    era_name VARCHAR(100),
    start_year INT,
    end_year INT,
    engine_formula VARCHAR(150),
    aero_regulations TEXT,
    chassis_weight_min_kg INT,
    fuel_flow_limit_spec VARCHAR(150),
    budget_cap_millions NUMERIC(5, 1),
    key_changes TEXT
);

-- 2. ENGINE MANUFACTURERS
CREATE TABLE engine_manufacturers (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    country VARCHAR(100),
    headquarters VARCHAR(100),
    mgu_k_spec VARCHAR(100),
    mgu_h_included BOOLEAN,
    sustainable_fuel_spec VARCHAR(100)
);

-- 3. TEAMS
CREATE TABLE teams (
    id UUID PRIMARY KEY,
    engine_manufacturer_id UUID REFERENCES engine_manufacturers(id),
    name VARCHAR(100),
    full_team_name VARCHAR(150),
    base_city VARCHAR(100),
    country VARCHAR(100),
    team_principal VARCHAR(100),
    power_unit VARCHAR(100),
    championship_titles INT,
    color_hex VARCHAR(7)
);

-- 4. CARS
CREATE TABLE cars (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    regulation_era_id UUID REFERENCES regulation_eras(id),
    model_name VARCHAR(100),
    season_year INT,
    power_hp INT,
    engine_supplier VARCHAR(100),
    downforce_efficiency_ratio NUMERIC(4, 2),
    weight_kg INT,
    wins INT,
    podiums INT,
    poles INT
);

-- 5. DRIVERS
CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    driver_number INT,
    code VARCHAR(3),
    country VARCHAR(100),
    podiums INT,
    career_wins INT,
    championship_points INT,
    position INT
);

-- 6. CIRCUITS
CREATE TABLE circuits (
    id UUID PRIMARY KEY,
    name VARCHAR(150),
    location VARCHAR(150),
    country VARCHAR(100),
    lap_length_km NUMERIC(5, 3),
    race_laps INT,
    lap_record VARCHAR(20),
    lap_record_holder VARCHAR(100),
    lap_record_year INT,
    corners_count INT,
    drs_zones INT,
    average_speed_kmh NUMERIC(5, 1),
    tyre_abrasion_index INT,
    downforce_level VARCHAR(20)
);

-- 7. GRAND PRIX EVENTS
CREATE TABLE grand_prix_events (
    id UUID PRIMARY KEY,
    circuit_id UUID REFERENCES circuits(id),
    season_year INT,
    round_number INT,
    official_event_name VARCHAR(200),
    event_date DATE,
    sprint_format BOOLEAN,
    weather_state VARCHAR(50)
);

-- 8. RACE RESULTS
CREATE TABLE race_results (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES grand_prix_events(id),
    circuit_id UUID REFERENCES circuits(id),
    season_year INT,
    winner_driver_id UUID REFERENCES drivers(id),
    winner_car_id UUID REFERENCES cars(id),
    pole_driver_id UUID REFERENCES drivers(id),
    fastest_lap_driver_id UUID REFERENCES drivers(id),
    fastest_lap_time VARCHAR(20),
    total_race_time VARCHAR(30),
    safety_cars_count INT
);

-- 9. TYRE COMPOUNDS
CREATE TABLE tyre_compounds (
    id VARCHAR(10) PRIMARY KEY,
    compound_name VARCHAR(50),
    compound_type VARCHAR(20),
    color_hex VARCHAR(7),
    grip_index NUMERIC(3, 2),
    durability_laps INT
);

-- 10. PIT STOPS
CREATE TABLE pit_stops (
    id UUID PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id),
    circuit_id UUID REFERENCES circuits(id),
    event_id UUID REFERENCES grand_prix_events(id),
    car_id UUID REFERENCES cars(id),
    lap INT,
    duration_seconds NUMERIC(4, 2),
    tyre_compound_from VARCHAR(10) REFERENCES tyre_compounds(id),
    tyre_compound_to VARCHAR(10) REFERENCES tyre_compounds(id),
    stop_number INT,
    stationary_time_seconds NUMERIC(4, 2)
);

-- 11. RACE LAPS
CREATE TABLE race_laps (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES grand_prix_events(id),
    driver_id UUID REFERENCES drivers(id),
    car_id UUID REFERENCES cars(id),
    lap_number INT,
    position INT,
    lap_time_seconds NUMERIC(6, 3),
    sector_1_seconds NUMERIC(5, 3),
    sector_2_seconds NUMERIC(5, 3),
    sector_3_seconds NUMERIC(5, 3),
    speed_trap_kmh NUMERIC(5, 1),
    tyre_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    tyre_age_laps INT
);

-- 12. TELEMETRY DATA
CREATE TABLE telemetry_data (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES grand_prix_events(id),
    driver_id UUID REFERENCES drivers(id),
    circuit_id UUID REFERENCES circuits(id),
    car_id UUID REFERENCES cars(id),
    lap_number INT,
    distance_along_track_m NUMERIC(6, 1),
    speed_kmh NUMERIC(5, 1),
    rpm INT,
    gear INT,
    throttle_pct NUMERIC(4, 1),
    brake_pct NUMERIC(4, 1),
    g_force_lateral NUMERIC(3, 1),
    g_force_longitudinal NUMERIC(3, 1),
    brake_temp_celsius INT,
    drs_active BOOLEAN,
    active_aero_mode VARCHAR(10),
    recorded_at TIMESTAMP WITH TIME ZONE
);

-- 13. STRATEGY SIMULATIONS
CREATE TABLE strategy_simulations (
    id UUID PRIMARY KEY,
    circuit_id UUID REFERENCES circuits(id),
    driver_id UUID REFERENCES drivers(id),
    stint_1_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    stint_1_laps INT,
    stint_2_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    stint_2_laps INT,
    predicted_total_time_seconds NUMERIC(7, 2),
    tyre_deg_risk VARCHAR(20),
    optimal_rank INT
);

-- 14. TRACK WEATHER SAMPLES
CREATE TABLE track_weather_samples (
    id UUID PRIMARY KEY,
    circuit_id UUID REFERENCES circuits(id),
    sample_time TIMESTAMP WITH TIME ZONE,
    air_temp_celsius NUMERIC(4, 1),
    track_temp_celsius NUMERIC(4, 1),
    humidity_pct NUMERIC(4, 1),
    wind_speed_kmh NUMERIC(4, 1),
    rainfall_rate_mm_h NUMERIC(4, 2)
);
