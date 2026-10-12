export interface RegulationEra
{
  id: string;
  era_name: string;
  start_year: number;
  end_year?: number | null;
  engine_formula: string;
  aero_regulations: string;
  chassis_weight_min_kg: number;
  fuel_flow_limit_spec: string;
  budget_cap_millions?: number;
  key_changes: string;
}

export interface Team
{
  id: string;
  name: string;
  full_team_name: string;
  base_city?: string;
  country?: string;
  team_principal?: string;
  power_unit?: string;
  championship_titles?: number;
  color_hex: string;
}

export interface Car
{
  id: string;
  team_id: string;
  regulation_era_id?: string;
  model_name: string;
  season_year: number;
  power_hp: number;
  engine_supplier: string;
  downforce_efficiency_ratio?: number;
  weight_kg: number;
  wins?: number;
  podiums?: number;
  poles?: number;
  team?: Team;
  regulation_era?: RegulationEra;
}

export interface Driver
{
  id: string;
  team_id?: string;
  first_name: string;
  last_name: string;
  driver_number: number;
  code: string;
  country: string;
  podiums?: number;
  career_wins?: number;
  championship_points: number;
  position: number;
  team?: Team;
}

export interface Circuit
{
  id: string;
  name: string;
  location: string;
  country: string;
  lap_length_km: number;
  race_laps: number;
  lap_record?: string;
  lap_record_holder?: string;
  lap_record_year?: number;
  first_grand_prix_year?: number;
  corners_count?: number;
  drs_zones?: number;
  average_speed_kmh?: number;
  tyre_abrasion_index?: number;
  downforce_level?: string;
  scheduled_date: string;
  status: "Upcoming" | "Live" | "Scheduled" | "Completed";
}

export interface RaceResult
{
  id: string;
  circuit_id: string;
  season_year: number;
  winner_driver_id?: string;
  winner_car_id?: string;
  pole_driver_id?: string;
  fastest_lap_driver_id?: string;
  fastest_lap_time?: string;
  total_race_time?: string;
  safety_cars_count?: number;
  rain_conditions?: boolean;
  dnf_count?: number;
  circuit?: Circuit;
  winner_driver?: Driver;
  winner_car?: Car;
}

export interface PitStop
{
  id: string;
  driver_id: string;
  circuit_id: string;
  lap: number;
  duration_seconds: number;
  tyre_compound_from: string;
  tyre_compound_to: string;
  stop_number: number;
  season_year?: number;
  driver?: Driver;
  circuit?: Circuit;
}

export interface StrategySimulation
{
  id: string;
  circuit_id: string;
  driver_id: string;
  stint_1_compound: string;
  stint_1_laps: number;
  stint_2_compound: string;
  stint_2_laps: number;
  stint_3_compound?: string | null;
  stint_3_laps?: number | null;
  predicted_total_time_seconds: number;
  tyre_deg_risk: "Low" | "Moderate" | "Critical";
  pit_loss_total_seconds: number;
  optimal_rank: number;
  circuit?: Circuit;
  driver?: Driver;
}

export interface HeadToHeadComparison
{
  driver_code: string;
  driver_name: string;
  team_name: string;
  championship_points: number;
  career_wins: number;
  podiums: number;
  avg_speed_kmh: number;
  best_pitstop_seconds: number;
  win_ratio_pct: number;
}

export interface TelemetrySample
{
  id?: string;
  driver_id?: string;
  circuit_id?: string;
  car_id?: string;
  speed_kmh: number;
  rpm: number;
  gear: number;
  throttle_pct: number;
  brake_pct: number;
  g_force: number;
  brake_temp_celsius: number;
  drs_active: boolean;
  active_aero_mode?: "X-mode" | "Z-mode";
  sector: number;
  recorded_at: string;
}
