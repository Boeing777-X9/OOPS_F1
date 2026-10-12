import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { HeadToHeadComparison } from "@/types/f1";

const FALLBACK_HEAD_TO_HEAD: { [key: string]: HeadToHeadComparison } = {
  VER: {
    driver_code: "VER",
    driver_name: "Max Verstappen",
    team_name: "Oracle Red Bull Racing",
    championship_points: 392,
    career_wins: 63,
    podiums: 111,
    avg_speed_kmh: 334.8,
    best_pitstop_seconds: 1.95,
    win_ratio_pct: 31.2
  },
  NOR: {
    driver_code: "NOR",
    driver_name: "Lando Norris",
    team_name: "McLaren Formula 1 Team",
    championship_points: 331,
    career_wins: 4,
    podiums: 26,
    avg_speed_kmh: 333.2,
    best_pitstop_seconds: 1.98,
    win_ratio_pct: 3.2
  },
  LEC: {
    driver_code: "LEC",
    driver_name: "Charles Leclerc",
    team_name: "Scuderia Ferrari HP",
    championship_points: 307,
    career_wins: 8,
    podiums: 42,
    avg_speed_kmh: 332.9,
    best_pitstop_seconds: 2.15,
    win_ratio_pct: 5.6
  },
  HAM: {
    driver_code: "HAM",
    driver_name: "Lewis Hamilton",
    team_name: "Scuderia Ferrari HP",
    championship_points: 240,
    career_wins: 105,
    podiums: 201,
    avg_speed_kmh: 333.5,
    best_pitstop_seconds: 2.10,
    win_ratio_pct: 30.5
  }
};

export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const driverA = searchParams.get("driverA") || "VER";
  const driverB = searchParams.get("driverB") || "NOR";

  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase.rpc
      (
        "get_driver_head_to_head",
        {
          driver_a_code: driverA,
          driver_b_code: driverB
        }
      );

      if (!error && data && data.length > 0)
      {
        return NextResponse.json
        (
          {
            source: "supabase-stored-proc",
            data
          }
        );
      }
    }

    const resultA = FALLBACK_HEAD_TO_HEAD[driverA] || FALLBACK_HEAD_TO_HEAD["VER"];
    const resultB = FALLBACK_HEAD_TO_HEAD[driverB] || FALLBACK_HEAD_TO_HEAD["NOR"];

    return NextResponse.json
    (
      {
        source: "mock-cache",
        driverA: resultA,
        driverB: resultB
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Head to head analytics failed" },
      { status: 500 }
    );
  }
}
