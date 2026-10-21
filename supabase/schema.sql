-- ==============================================================================
-- Formula 1 Apex High-Relational Enterprise Engine Schema
-- Multi-Table Schema with Deep Foreign Key Hierarchies, Partitions & Indexes
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REGULATION ERAS
CREATE TABLE IF NOT EXISTS regulation_eras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    era_name VARCHAR(100) NOT NULL UNIQUE,
    start_year INT NOT NULL,
    end_year INT,
    engine_formula VARCHAR(150) NOT NULL,
    aero_regulations TEXT NOT NULL,
    chassis_weight_min_kg INT NOT NULL,
    fuel_flow_limit_spec VARCHAR(150) NOT NULL,
    budget_cap_millions NUMERIC(5, 1),
    key_changes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENGINE SUPPLIERS (POWER UNIT MANUFACTURERS)
CREATE TABLE IF NOT EXISTS engine_manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100),
    mgu_k_spec VARCHAR(100),
    mgu_h_included BOOLEAN DEFAULT FALSE,
    sustainable_fuel_spec VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TEAMS (CONSTRUCTORS)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engine_manufacturer_id UUID REFERENCES engine_manufacturers(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    full_team_name VARCHAR(150) NOT NULL,
    base_city VARCHAR(100),
    country VARCHAR(100),
    team_principal VARCHAR(100),
    technical_director VARCHAR(100),
    power_unit VARCHAR(100),
    championship_titles INT DEFAULT 0,
    color_hex VARCHAR(7) DEFAULT '#E10600',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAR CHASSIS & TECHNICAL SPECIFICATIONS
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    regulation_era_id UUID REFERENCES regulation_eras(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL,
    season_year INT NOT NULL,
    power_hp INT NOT NULL,
    engine_supplier VARCHAR(100) NOT NULL,
    downforce_efficiency_ratio NUMERIC(4, 2),
    weight_kg INT NOT NULL,
    wins INT DEFAULT 0,
    podiums INT DEFAULT 0,
    poles INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, season_year, model_name)
);

-- 5. DRIVERS
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    driver_number INT NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    country VARCHAR(100),
    podiums INT DEFAULT 0,
    career_wins INT DEFAULT 0,
    championship_points INT DEFAULT 0,
    position INT DEFAULT 0,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CIRCUITS & TRACK CHARACTERISTICS
CREATE TABLE IF NOT EXISTS circuits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    lap_length_km NUMERIC(5, 3) NOT NULL,
    race_laps INT NOT NULL,
    lap_record VARCHAR(20),
    lap_record_holder VARCHAR(100),
    lap_record_year INT,
    first_grand_prix_year INT,
    corners_count INT,
    drs_zones INT,
    average_speed_kmh NUMERIC(5, 1) DEFAULT 220.0,
    tyre_abrasion_index INT DEFAULT 3,
    downforce_level VARCHAR(20) DEFAULT 'High',
    elevation_change_m NUMERIC(5, 1) DEFAULT 25.0,
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. GRAND PRIX RACE EVENTS
CREATE TABLE IF NOT EXISTS grand_prix_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    season_year INT NOT NULL,
    round_number INT NOT NULL,
    official_event_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    sprint_format BOOLEAN DEFAULT FALSE,
    weather_state VARCHAR(50) DEFAULT 'Dry',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_year, round_number)
);

-- 8. RACE SESSIONS (FP1, FP2, FP3, QUALIFYING, SPRINT, RACE)
CREATE TABLE IF NOT EXISTS race_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    session_type VARCHAR(30) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    track_temp_celsius NUMERIC(4, 1),
    air_temp_celsius NUMERIC(4, 1),
    humidity_pct NUMERIC(4, 1),
    rain_probability_pct NUMERIC(4, 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, session_type)
);

-- 9. HISTORICAL RACE RESULTS
CREATE TABLE IF NOT EXISTS race_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    season_year INT NOT NULL,
    winner_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    winner_car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    pole_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fastest_lap_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fastest_lap_time VARCHAR(20),
    total_race_time VARCHAR(30),
    safety_cars_count INT DEFAULT 0,
    virtual_safety_cars_count INT DEFAULT 0,
    rain_conditions BOOLEAN DEFAULT FALSE,
    dnf_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(circuit_id, season_year)
);

-- 10. TYRE COMPOUNDS
CREATE TABLE IF NOT EXISTS tyre_compounds (
    id VARCHAR(10) PRIMARY KEY,
    compound_name VARCHAR(50) NOT NULL,
    compound_type VARCHAR(20) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    grip_index NUMERIC(3, 2) NOT NULL,
    durability_laps INT NOT NULL
);

-- 11. PIT STOPS WITH STRATEGY ANALYSIS
CREATE TABLE IF NOT EXISTS pit_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE SET NULL,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    lap INT NOT NULL,
    duration_seconds NUMERIC(4, 2) NOT NULL,
    tyre_compound_from VARCHAR(10) REFERENCES tyre_compounds(id),
    tyre_compound_to VARCHAR(10) REFERENCES tyre_compounds(id),
    stop_number INT NOT NULL,
    stationary_time_seconds NUMERIC(4, 2),
    season_year INT DEFAULT 2026,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. RACE LAPS WITH SECTOR METRICS
CREATE TABLE IF NOT EXISTS race_laps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    lap_number INT NOT NULL,
    position INT NOT NULL,
    lap_time_seconds NUMERIC(6, 3) NOT NULL,
    sector_1_seconds NUMERIC(5, 3) NOT NULL,
    sector_2_seconds NUMERIC(5, 3) NOT NULL,
    sector_3_seconds NUMERIC(5, 3) NOT NULL,
    speed_trap_kmh NUMERIC(5, 1) NOT NULL,
    tyre_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    tyre_age_laps INT NOT NULL,
    pit_in BOOLEAN DEFAULT FALSE,
    pit_out BOOLEAN DEFAULT FALSE,
    flag_condition VARCHAR(20) DEFAULT 'Green',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, driver_id, lap_number)
);

-- 13. HIGH DENSITY SENSOR TELEMETRY SAMPLES (LAKHS OF ROWS)
CREATE TABLE IF NOT EXISTS telemetry_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    lap_number INT NOT NULL,
    distance_along_track_m NUMERIC(6, 1) NOT NULL,
    speed_kmh NUMERIC(5, 1) NOT NULL,
    rpm INT NOT NULL,
    gear INT NOT NULL,
    throttle_pct NUMERIC(4, 1) NOT NULL,
    brake_pct NUMERIC(4, 1) NOT NULL,
    g_force_lateral NUMERIC(3, 1) NOT NULL,
    g_force_longitudinal NUMERIC(3, 1) NOT NULL,
    brake_temp_celsius INT NOT NULL,
    tyre_surface_temp_fl_celsius INT NOT NULL,
    tyre_surface_temp_fr_celsius INT NOT NULL,
    tyre_surface_temp_rl_celsius INT NOT NULL,
    tyre_surface_temp_rr_celsius INT NOT NULL,
    drs_active BOOLEAN DEFAULT FALSE,
    active_aero_mode VARCHAR(10) DEFAULT 'Z-mode',
    sector INT DEFAULT 1,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PIT WALL STRATEGY SIMULATIONS
CREATE TABLE IF NOT EXISTS strategy_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    stint_1_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    stint_1_laps INT NOT NULL,
    stint_2_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    stint_2_laps INT NOT NULL,
    stint_3_compound VARCHAR(10) REFERENCES tyre_compounds(id),
    stint_3_laps INT,
    predicted_total_time_seconds NUMERIC(7, 2) NOT NULL,
    tyre_deg_risk VARCHAR(20) NOT NULL,
    pit_loss_total_seconds NUMERIC(4, 2) NOT NULL,
    optimal_rank INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. WEATHER & TRACK METEOROLOGY SAMPLES
CREATE TABLE IF NOT EXISTS track_weather_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    sample_time TIMESTAMP WITH TIME ZONE NOT NULL,
    air_temp_celsius NUMERIC(4, 1) NOT NULL,
    track_temp_celsius NUMERIC(4, 1) NOT NULL,
    humidity_pct NUMERIC(4, 1) NOT NULL,
    wind_speed_kmh NUMERIC(4, 1) NOT NULL,
    wind_direction_deg INT NOT NULL,
    rainfall_rate_mm_h NUMERIC(4, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. SYSTEM AUDIT & RACE CONTROL INCIDENTS
CREATE TABLE IF NOT EXISTS race_control_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES grand_prix_events(id) ON DELETE CASCADE,
    lap_number INT NOT NULL,
    involved_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL,
    investigation_status VARCHAR(50) NOT NULL,
    penalty_awarded VARCHAR(100),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. SYSTEM TELEMETRY AUDIT & LOGS
CREATE TABLE IF NOT EXISTS telemetry_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS FOR LAKHS OF ROWS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_telemetry_driver_event_lap ON telemetry_data(driver_id, event_id, lap_number);
CREATE INDEX IF NOT EXISTS idx_telemetry_distance ON telemetry_data(circuit_id, distance_along_track_m);
CREATE INDEX IF NOT EXISTS idx_race_laps_event_driver ON race_laps(event_id, driver_id, lap_number);
CREATE INDEX IF NOT EXISTS idx_race_laps_laptime ON race_laps(event_id, lap_time_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_pit_stops_driver_time ON pit_stops(driver_id, duration_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_weather_event_time ON track_weather_samples(event_id, sample_time);
CREATE INDEX IF NOT EXISTS idx_cars_team_year ON cars(team_id, season_year);
CREATE INDEX IF NOT EXISTS idx_strategy_rank ON strategy_simulations(circuit_id, optimal_rank ASC);
CREATE INDEX IF NOT EXISTS idx_race_results_year ON race_results(season_year DESC);

-- ==============================================================================
-- RELATIONAL SQL VIEWS FOR FAST REAL-TIME AGGREGATION
-- ==============================================================================

CREATE OR REPLACE VIEW view_driver_standings_complete AS
SELECT 
    d.id AS driver_id,
    d.first_name,
    d.last_name,
    d.code,
    d.driver_number,
    d.position,
    d.championship_points,
    d.career_wins,
    d.podiums,
    t.id AS team_id,
    t.name AS team_name,
    t.power_unit,
    t.color_hex,
    em.name AS engine_manufacturer,
    c.model_name AS current_car_model,
    c.power_hp AS current_car_hp,
    c.weight_kg AS current_car_weight
FROM drivers d
LEFT JOIN teams t ON d.team_id = t.id
LEFT JOIN engine_manufacturers em ON t.engine_manufacturer_id = em.id
LEFT JOIN cars c ON c.team_id = t.id AND c.season_year = 2026;

CREATE OR REPLACE VIEW view_circuit_grand_prix_analytics AS
SELECT 
    circ.id AS circuit_id,
    circ.name AS circuit_name,
    circ.location,
    circ.country,
    circ.lap_length_km,
    circ.race_laps,
    circ.lap_record,
    circ.lap_record_holder,
    circ.lap_record_year,
    circ.tyre_abrasion_index,
    circ.downforce_level,
    r.season_year AS last_race_year,
    w.code AS last_winner_code,
    w.last_name AS last_winner_name,
    car.model_name AS winning_car_chassis,
    car.power_hp AS winning_car_hp
FROM circuits circ
LEFT JOIN race_results r ON circ.id = r.circuit_id AND r.season_year = 2024
LEFT JOIN drivers w ON r.winner_driver_id = w.id
LEFT JOIN cars car ON r.winner_car_id = car.id;

CREATE OR REPLACE VIEW view_driver_telemetry_lap_aggregates AS
SELECT 
    t.event_id,
    t.driver_id,
    t.lap_number,
    COUNT(t.id) AS telemetry_sample_points,
    ROUND(AVG(t.speed_kmh), 2) AS avg_speed_kmh,
    MAX(t.speed_kmh) AS top_speed_kmh,
    MAX(t.g_force_lateral) AS peak_lateral_g,
    MAX(t.brake_temp_celsius) AS max_brake_temp_celsius,
    ROUND(AVG(t.throttle_pct), 1) AS mean_throttle_pct
FROM telemetry_data t
GROUP BY t.event_id, t.driver_id, t.lap_number;

-- ==============================================================================
-- DATABASE STORED PROCEDURES & FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_driver_head_to_head(driver_a_code VARCHAR(3), driver_b_code VARCHAR(3))
RETURNS TABLE (
    driver_code VARCHAR(3),
    driver_name TEXT,
    team_name VARCHAR(100),
    championship_points INT,
    career_wins INT,
    podiums INT,
    avg_speed_kmh NUMERIC,
    best_pitstop_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.code,
        CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
        t.name AS team_name,
        d.championship_points,
        d.career_wins,
        d.podiums,
        COALESCE(ROUND(AVG(tel.speed_kmh), 1), 332.5) AS avg_speed_kmh,
        COALESCE(MIN(ps.duration_seconds), 2.10) AS best_pitstop_seconds
    FROM drivers d
    LEFT JOIN teams t ON d.team_id = t.id
    LEFT JOIN telemetry_data tel ON tel.driver_id = d.id
    LEFT JOIN pit_stops ps ON ps.driver_id = d.id
    WHERE d.code IN (driver_a_code, driver_b_code)
    GROUP BY d.id, d.code, d.first_name, d.last_name, t.name, d.championship_points, d.career_wins, d.podiums;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit_telemetry_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO telemetry_audit_logs (event_type, description, severity)
    VALUES ('SPEED_DELTA_RECORDED', CONCAT('Speed recorded: ', NEW.speed_kmh, ' km/h for driver ID: ', NEW.driver_id), 'INFO');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_high_speed ON telemetry_data;
CREATE TRIGGER trigger_audit_high_speed
AFTER INSERT ON telemetry_data
FOR EACH ROW
WHEN (NEW.speed_kmh > 355.0)
EXECUTE FUNCTION audit_telemetry_event();
