import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { RaceResult } from "@/types/f1";

const FALLBACK_HISTORICAL_RESULTS: RaceResult[] = [
  {
    id: "r1",
    circuit_id: "c1",
    season_year: 2024,
    fastest_lap_time: "1:14.165",
    total_race_time: "2:23:15.554",
    safety_cars_count: 1,
    rain_conditions: false,
    dnf_count: 4,
    circuit: {
      id: "c1",
      name: "Circuit de Monaco",
      location: "Monte Carlo",
      country: "Monaco",
      lap_length_km: 3.337,
      race_laps: 78,
      scheduled_date: "2026-05-24",
      status: "Upcoming"
    },
    winner_driver: {
      id: "d3",
      first_name: "Charles",
      last_name: "Leclerc",
      driver_number: 16,
      code: "LEC",
      country: "Monaco",
      championship_points: 307,
      position: 3,
      team: { id: "t3", name: "Ferrari", full_team_name: "Scuderia Ferrari HP", color_hex: "#E80020" }
    },
    winner_car: {
      id: "a3",
      team_id: "t3",
      model_name: "SF-24",
      season_year: 2024,
      power_hp: 1030,
      engine_supplier: "Ferrari",
      weight_kg: 798
    }
  },
  {
    id: "r2",
    circuit_id: "c1",
    season_year: 2023,
    fastest_lap_time: "1:15.650",
    total_race_time: "1:48:51.980",
    safety_cars_count: 0,
    rain_conditions: true,
    dnf_count: 2,
    circuit: {
      id: "c1",
      name: "Circuit de Monaco",
      location: "Monte Carlo",
      country: "Monaco",
      lap_length_km: 3.337,
      race_laps: 78,
      scheduled_date: "2026-05-24",
      status: "Upcoming"
    },
    winner_driver: {
      id: "d1",
      first_name: "Max",
      last_name: "Verstappen",
      driver_number: 1,
      code: "VER",
      country: "Netherlands",
      championship_points: 392,
      position: 1,
      team: { id: "t1", name: "Red Bull Racing", full_team_name: "Oracle Red Bull Racing", color_hex: "#3671C6" }
    },
    winner_car: {
      id: "a4",
      team_id: "t1",
      model_name: "RB19",
      season_year: 2023,
      power_hp: 1025,
      engine_supplier: "Honda RBPT",
      weight_kg: 798
    }
  },
  {
    id: "r3",
    circuit_id: "c2",
    season_year: 2024,
    fastest_lap_time: "1:28.293",
    total_race_time: "1:22:27.059",
    safety_cars_count: 2,
    rain_conditions: true,
    dnf_count: 2,
    circuit: {
      id: "c2",
      name: "Silverstone Circuit",
      location: "Silverstone",
      country: "United Kingdom",
      lap_length_km: 5.891,
      race_laps: 52,
      scheduled_date: "2026-07-05",
      status: "Scheduled"
    },
    winner_driver: {
      id: "d5",
      first_name: "Lewis",
      last_name: "Hamilton",
      driver_number: 44,
      code: "HAM",
      country: "United Kingdom",
      championship_points: 240,
      position: 5,
      team: { id: "t4", name: "Mercedes", full_team_name: "Mercedes-AMG PETRONAS", color_hex: "#27F4D2" }
    },
    winner_car: {
      id: "a5",
      team_id: "t4",
      model_name: "W15",
      season_year: 2024,
      power_hp: 1020,
      engine_supplier: "Mercedes",
      weight_kg: 798
    }
  }
];

export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const circuitId = searchParams.get("circuitId");

  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      let query = supabase
        .from("race_results")
        .select(`
          *,
          circuit:circuits(*),
          winner_driver:drivers(*, team:teams(*)),
          winner_car:cars(*)
        `)
        .order("season_year", { ascending: false });

      if (circuitId)
      {
        query = query.eq("circuit_id", circuitId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0)
      {
        return NextResponse.json
        (
          {
            source: "supabase",
            count: data.length,
            data
          }
        );
      }
    }

    return NextResponse.json
    (
      {
        source: "mock-cache",
        count: FALLBACK_HISTORICAL_RESULTS.length,
        data: FALLBACK_HISTORICAL_RESULTS
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Failed to fetch historical race results", data: FALLBACK_HISTORICAL_RESULTS },
      { status: 500 }
    );
  }
}
