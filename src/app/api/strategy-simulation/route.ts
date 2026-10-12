import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { StrategySimulation } from "@/types/f1";

const FALLBACK_STRATEGIES: StrategySimulation[] = [
  {
    id: "s1",
    circuit_id: "c1",
    driver_id: "d1",
    stint_1_compound: "Medium (C4)",
    stint_1_laps: 32,
    stint_2_compound: "Hard (C3)",
    stint_2_laps: 46,
    predicted_total_time_seconds: 5842.15,
    tyre_deg_risk: "Low",
    pit_loss_total_seconds: 21.4,
    optimal_rank: 1,
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
    driver: {
      id: "d1",
      first_name: "Max",
      last_name: "Verstappen",
      driver_number: 1,
      code: "VER",
      country: "Netherlands",
      championship_points: 392,
      position: 1,
      team: { id: "t1", name: "Red Bull Racing", full_team_name: "Oracle Red Bull Racing", color_hex: "#3671C6" }
    }
  },
  {
    id: "s2",
    circuit_id: "c1",
    driver_id: "d2",
    stint_1_compound: "Soft (C5)",
    stint_1_laps: 18,
    stint_2_compound: "Hard (C3)",
    stint_2_laps: 60,
    predicted_total_time_seconds: 5845.8,
    tyre_deg_risk: "Moderate",
    pit_loss_total_seconds: 21.4,
    optimal_rank: 2,
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
    driver: {
      id: "d2",
      first_name: "Lando",
      last_name: "Norris",
      driver_number: 4,
      code: "NOR",
      country: "United Kingdom",
      championship_points: 331,
      position: 2,
      team: { id: "t2", name: "McLaren", full_team_name: "McLaren Formula 1 Team", color_hex: "#FF8000" }
    }
  },
  {
    id: "s3",
    circuit_id: "c2",
    driver_id: "d3",
    stint_1_compound: "Soft (C3)",
    stint_1_laps: 14,
    stint_2_compound: "Medium (C2)",
    stint_2_laps: 20,
    stint_3_compound: "Soft (C3)",
    stint_3_laps: 18,
    predicted_total_time_seconds: 4833.55,
    tyre_deg_risk: "Moderate",
    pit_loss_total_seconds: 49.6,
    optimal_rank: 2,
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
    driver: {
      id: "d3",
      first_name: "Charles",
      last_name: "Leclerc",
      driver_number: 16,
      code: "LEC",
      country: "Monaco",
      championship_points: 307,
      position: 3,
      team: { id: "t3", name: "Ferrari", full_team_name: "Scuderia Ferrari HP", color_hex: "#E80020" }
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
        .from("strategy_simulations")
        .select(`
          *,
          circuit:circuits(*),
          driver:drivers(*, team:teams(*))
        `)
        .order("optimal_rank", { ascending: true });

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
        count: FALLBACK_STRATEGIES.length,
        data: FALLBACK_STRATEGIES
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Strategy simulation compute failure", data: FALLBACK_STRATEGIES },
      { status: 500 }
    );
  }
}
