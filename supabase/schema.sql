-- ==============================================================================
-- Formula 1 Apex RDBMS: Enterprise Multi-Relational Database Engine
-- Complete with Stored Functions, Views, Aggregations, Audit Logs, and Triggers
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

-- 2. TEAMS (CONSTRUCTORS)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    full_team_name VARCHAR(150) NOT NULL,
    base_city VARCHAR(100),
    country VARCHAR(100),
    team_principal VARCHAR(100),
    power_unit VARCHAR(100),
    championship_titles INT DEFAULT 0,
    color_hex VARCHAR(7) DEFAULT '#E10600',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CAR CHASSIS & TECHNICAL SPECIFICATIONS
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

-- 4. DRIVERS
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CIRCUITS & TRACK CHARACTERISTICS
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
    tyre_abrasion_index INT DEFAULT 3, -- 1 (low) to 5 (extreme)
    downforce_level VARCHAR(20) DEFAULT 'High',
    scheduled_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HISTORICAL RACE RESULTS
CREATE TABLE IF NOT EXISTS race_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    season_year INT NOT NULL,
    winner_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    winner_car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    pole_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fastest_lap_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    fastest_lap_time VARCHAR(20),
    total_race_time VARCHAR(30),
    safety_cars_count INT DEFAULT 0,
    rain_conditions BOOLEAN DEFAULT FALSE,
    dnf_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(circuit_id, season_year)
);

-- 7. PIT STOPS WITH STRATEGY ANALYSIS
CREATE TABLE IF NOT EXISTS pit_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    lap INT NOT NULL,
    duration_seconds NUMERIC(4, 2) NOT NULL,
    tyre_compound_from VARCHAR(20) NOT NULL,
    tyre_compound_to VARCHAR(20) NOT NULL,
    stop_number INT NOT NULL,
    season_year INT DEFAULT 2026,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. LIVE & HISTORICAL TELEMETRY SAMPLES
CREATE TABLE IF NOT EXISTS telemetry_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    speed_kmh NUMERIC(5, 1) NOT NULL,
    rpm INT NOT NULL,
    gear INT NOT NULL,
    throttle_pct NUMERIC(4, 1) NOT NULL,
    brake_pct NUMERIC(4, 1) NOT NULL,
    g_force NUMERIC(3, 1) NOT NULL,
    brake_temp_celsius INT NOT NULL,
    drs_active BOOLEAN DEFAULT FALSE,
    active_aero_mode VARCHAR(10) DEFAULT 'Z-mode',
    sector INT DEFAULT 1,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PIT WALL STRATEGY SIMULATIONS TABLE
CREATE TABLE IF NOT EXISTS strategy_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circuit_id UUID REFERENCES circuits(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    stint_1_compound VARCHAR(20) NOT NULL,
    stint_1_laps INT NOT NULL,
    stint_2_compound VARCHAR(20) NOT NULL,
    stint_2_laps INT NOT NULL,
    stint_3_compound VARCHAR(20),
    stint_3_laps INT,
    predicted_total_time_seconds NUMERIC(7, 2) NOT NULL,
    tyre_deg_risk VARCHAR(20) NOT NULL, -- 'Low', 'Moderate', 'Critical'
    pit_loss_total_seconds NUMERIC(4, 2) NOT NULL,
    optimal_rank INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SYSTEM TELEMETRY AUDIT & LOGS
CREATE TABLE IF NOT EXISTS telemetry_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & CONSTRAINTS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_telemetry_driver_time ON telemetry_data(driver_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_year ON race_results(season_year DESC);
CREATE INDEX IF NOT EXISTS idx_pit_stops_driver_time ON pit_stops(driver_id, duration_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_cars_team_year ON cars(team_id, season_year);
CREATE INDEX IF NOT EXISTS idx_strategy_rank ON strategy_simulations(circuit_id, optimal_rank ASC);

-- ==============================================================================
-- RELATIONAL SQL VIEWS FOR HIGH-SPEED AGGREGATIONS
-- ==============================================================================

-- VIEW 1: Driver Championship Leaderboard with Constructor & Car Spec metrics
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
    c.model_name AS current_car_model,
    c.power_hp AS current_car_hp,
    c.weight_kg AS current_car_weight
FROM drivers d
LEFT JOIN teams t ON d.team_id = t.id
LEFT JOIN cars c ON c.team_id = t.id AND c.season_year = 2026;

-- VIEW 2: Circuit Master Analysis (Past winners, car chassis, track records)
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

-- ==============================================================================
-- DATABASE STORED PROCEDURES & FUNCTIONS
-- ==============================================================================

-- Stored Function 1: Compute Driver Head-to-Head Telemetry & Career Matrix
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

-- Stored Function 2: Automated Pit Stop Auditor Trigger
CREATE OR REPLACE FUNCTION audit_telemetry_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO telemetry_audit_logs (event_type, description, severity)
    VALUES ('SPEED_DELTA_RECORDED', CONCAT('Speed recorded: ', NEW.speed_kmh, ' km/h for driver ID: ', NEW.driver_id), 'INFO');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire on high speed records
DROP TRIGGER IF EXISTS trigger_audit_high_speed ON telemetry_data;
CREATE TRIGGER trigger_audit_high_speed
AFTER INSERT ON telemetry_data
FOR EACH ROW
WHEN (NEW.speed_kmh > 350.0)
EXECUTE FUNCTION audit_telemetry_event();

-- ==============================================================================
-- SEED DATA INSERTION
-- ==============================================================================
-- Teams
INSERT INTO teams (id, name, full_team_name, base_city, country, team_principal, power_unit, championship_titles, color_hex) VALUES
('b1111111-1111-1111-1111-111111111111', 'Red Bull Racing', 'Oracle Red Bull Racing', 'Milton Keynes', 'United Kingdom', 'Christian Horner', 'Red Bull Ford Powertrains', 6, '#3671C6'),
('b2222222-2222-2222-2222-222222222222', 'McLaren', 'McLaren Formula 1 Team', 'Woking', 'United Kingdom', 'Andrea Stella', 'Mercedes', 8, '#FF8000'),
('b3333333-3333-3333-3333-333333333333', 'Ferrari', 'Scuderia Ferrari HP', 'Maranello', 'Italy', 'Frédéric Vasseur', 'Ferrari', 16, '#E80020'),
('b4444444-4444-4444-4444-444444444444', 'Mercedes', 'Mercedes-AMG PETRONAS F1 Team', 'Brackley', 'United Kingdom', 'Toto Wolff', 'Mercedes', 8, '#27F4D2')
ON CONFLICT (name) DO NOTHING;

-- Regulation Eras
INSERT INTO regulation_eras (id, era_name, start_year, end_year, engine_formula, aero_regulations, chassis_weight_min_kg, fuel_flow_limit_spec, budget_cap_millions, key_changes) VALUES
('e1111111-1111-1111-1111-111111111111', '2026 Next-Gen Active Aero & 50% EV Hybrid Era', 2026, NULL, '1.6L V6 Turbo + 350kW MGU-K (50% electrical power output)', 'Active Aero with driver-switchable Z-mode (downforce) and X-mode (straight-line low drag)', 768, '100% Sustainable E-fuel', 135.0, '30kg lighter cars, narrower chassis (-10cm), 50/50 internal combustion & electrical power split, active wings replacing static DRS.'),
('e2222222-2222-2222-2222-222222222222', '2022-2025 Ground Effect & Budget Cap Era', 2022, 2025, '1.6L V6 Turbo Hybrid + 120kW MGU-K + MGU-H', 'Venturi Ground Effect underfloor tunnels, 18-inch Pirelli low-profile wheels, wheel wake deflectors', 798, 'E10 10% bio-ethanol fuel', 135.0, 'Re-introduction of ground effect downforce to facilitate close wheel-to-wheel overtaking; introduced strict FIA financial cost cap regulations.')
ON CONFLICT (era_name) DO NOTHING;

-- Cars
INSERT INTO cars (id, team_id, regulation_era_id, model_name, season_year, power_hp, engine_supplier, downforce_efficiency_ratio, weight_kg, wins, podiums, poles) VALUES
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'RB22', 2026, 1050, 'Red Bull Ford', 3.85, 768, 8, 14, 9),
('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'MCL40', 2026, 1045, 'Mercedes HPP', 3.92, 768, 7, 18, 6),
('a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'SF-26', 2026, 1055, 'Ferrari', 3.80, 768, 5, 12, 7),
('a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'RB20', 2024, 1020, 'Honda RBPT', 3.65, 798, 9, 14, 8)
ON CONFLICT DO NOTHING;

-- Drivers
INSERT INTO drivers (id, team_id, first_name, last_name, driver_number, code, country, podiums, career_wins, championship_points, position) VALUES
('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Max', 'Verstappen', 1, 'VER', 'Netherlands', 111, 63, 392, 1),
('d2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Lando', 'Norris', 4, 'NOR', 'United Kingdom', 26, 4, 331, 2),
('d3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Charles', 'Leclerc', 16, 'LEC', 'Monaco', 42, 8, 307, 3),
('d4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'Oscar', 'Piastri', 81, 'PIA', 'Australia', 10, 2, 262, 4),
('d5555555-5555-5555-5555-555555555555', 'b3333333-3333-3333-3333-333333333333', 'Lewis', 'Hamilton', 44, 'HAM', 'United Kingdom', 201, 105, 240, 5),
('d6666666-6666-6666-6666-666666666666', 'b4444444-4444-4444-4444-444444444444', 'George', 'Russell', 63, 'RUS', 'United Kingdom', 15, 3, 230, 6)
ON CONFLICT (code) DO NOTHING;

-- Circuits
INSERT INTO circuits (id, name, location, country, lap_length_km, race_laps, lap_record, lap_record_holder, lap_record_year, first_grand_prix_year, corners_count, drs_zones, average_speed_kmh, tyre_abrasion_index, downforce_level, scheduled_date, status) VALUES
('c1111111-1111-1111-1111-111111111111', 'Circuit de Monaco', 'Monte Carlo', 'Monaco', 3.337, 78, '1:12.909', 'Lewis Hamilton', 2021, 1950, 19, 1, 161.2, 1, 'Maximum', '2026-05-24', 'Upcoming'),
('c2222222-2222-2222-2222-222222222222', 'Silverstone Circuit', 'Silverstone', 'United Kingdom', 5.891, 52, '1:27.097', 'Max Verstappen', 2020, 1950, 18, 2, 248.5, 5, 'High', '2026-07-05', 'Scheduled'),
('c3333333-3333-3333-3333-333333333333', 'Autodromo Nazionale Monza', 'Monza', 'Italy', 5.793, 53, '1:21.046', 'Rubens Barrichello', 2004, 1950, 11, 2, 264.3, 3, 'Low', '2026-09-06', 'Scheduled')
ON CONFLICT DO NOTHING;

-- Race Results
INSERT INTO race_results (circuit_id, season_year, winner_driver_id, winner_car_id, pole_driver_id, fastest_lap_driver_id, fastest_lap_time, total_race_time, safety_cars_count, rain_conditions, dnf_count) VALUES
('c1111111-1111-1111-1111-111111111111', 2024, 'd3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'd5555555-5555-5555-5555-555555555555', '1:14.165', '2:23:15.554', 1, false, 4),
('c1111111-1111-1111-1111-111111111111', 2023, 'd1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'd5555555-5555-5555-5555-555555555555', '1:15.650', '1:48:51.980', 0, true, 2),
('c2222222-2222-2222-2222-222222222222', 2024, 'd5555555-5555-5555-5555-555555555555', NULL, 'd6666666-6666-6666-6666-666666666666', 'd2222222-2222-2222-2222-222222222222', '1:28.293', '1:22:27.059', 2, true, 2)
ON CONFLICT DO NOTHING;

-- Strategy Simulations
INSERT INTO strategy_simulations (circuit_id, driver_id, stint_1_compound, stint_1_laps, stint_2_compound, stint_2_laps, stint_3_compound, stint_3_laps, predicted_total_time_seconds, tyre_deg_risk, pit_loss_total_seconds, optimal_rank) VALUES
('c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Medium (C4)', 32, 'Hard (C3)', 46, NULL, NULL, 5842.15, 'Low', 21.4, 1),
('c1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Soft (C5)', 18, 'Hard (C3)', 60, NULL, NULL, 5845.80, 'Moderate', 21.4, 2),
('c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Medium (C2)', 20, 'Hard (C1)', 32, NULL, NULL, 4831.20, 'Low', 24.8, 1),
('c2222222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', 'Soft (C3)', 14, 'Medium (C2)', 20, 'Soft (C3)', 18, 4833.55, 'Moderate', 49.6, 2)
ON CONFLICT DO NOTHING;
