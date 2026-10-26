import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Circuit } from "@/types/f1";

const FALLBACK_CIRCUITS: Circuit[] = [
  {
    id: "c1",
    name: "Circuit de Monaco",
    location: "Monte Carlo",
    country: "Monaco",
    lap_length_km: 3.337,
    race_laps: 78,
    lap_record: "1:12.909",
    lap_record_holder: "Lewis Hamilton",
    scheduled_date: "2026-05-24",
    status: "Upcoming"
  },
  {
    id: "c2",
    name: "Silverstone Circuit",
    location: "Silverstone",
    country: "United Kingdom",
    lap_length_km: 5.891,
    race_laps: 52,
    lap_record: "1:27.097",
    lap_record_holder: "Max Verstappen",
    scheduled_date: "2026-07-05",
    status: "Scheduled"
  },
  {
    id: "c3",
    name: "Autodromo Nazionale Monza",
    location: "Monza",
    country: "Italy",
    lap_length_km: 5.793,
    race_laps: 53,
    lap_record: "1:21.046",
    lap_record_holder: "Rubens Barrichello",
    scheduled_date: "2026-09-06",
    status: "Scheduled"
  },
  {
    id: "c4",
    name: "Circuit of the Americas",
    location: "Austin, Texas",
    country: "United States",
    lap_length_km: 5.513,
    race_laps: 56,
    lap_record: "1:36.169",
    lap_record_holder: "Charles Leclerc",
    scheduled_date: "2026-10-18",
    status: "Scheduled"
  }
];

export async function GET()
{
  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase
        .from("circuits")
        .select("*")
        .order("scheduled_date", { ascending: true });

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
        count: FALLBACK_CIRCUITS.length,
        data: FALLBACK_CIRCUITS
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Failed to fetch circuits calendar", data: FALLBACK_CIRCUITS },
      { status: 500 }
    );
  }
}
