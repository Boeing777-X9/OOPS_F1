import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { PitStop } from "@/types/f1";

const FALLBACK_PITSTOPS: PitStop[] = [
  {
    id: "p1",
    driver_id: "d1",
    circuit_id: "c1",
    lap: 22,
    duration_seconds: 2.12,
    tyre_compound_from: "Soft (C5)",
    tyre_compound_to: "Hard (C3)",
    stop_number: 1,
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
    id: "p2",
    driver_id: "d2",
    circuit_id: "c1",
    lap: 24,
    duration_seconds: 1.98,
    tyre_compound_from: "Medium (C4)",
    tyre_compound_to: "Hard (C3)",
    stop_number: 1,
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
    id: "p3",
    driver_id: "d3",
    circuit_id: "c1",
    lap: 19,
    duration_seconds: 2.34,
    tyre_compound_from: "Soft (C5)",
    tyre_compound_to: "Medium (C4)",
    stop_number: 1,
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
        .from("pit_stops")
        .select("*, driver:drivers(*, team:teams(*)), circuit:circuits(*)")
        .order("duration_seconds", { ascending: true });

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
        count: FALLBACK_PITSTOPS.length,
        data: FALLBACK_PITSTOPS
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Failed to fetch pit stops", data: FALLBACK_PITSTOPS },
      { status: 500 }
    );
  }
}
