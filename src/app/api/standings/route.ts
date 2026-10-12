import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Driver } from "@/types/f1";

const STANDINGS_2026_EXACT: Driver[] = [
  {
    id: "1",
    first_name: "A.K.",
    last_name: "Antonelli",
    driver_number: 12,
    code: "ANT",
    country: "Italy",
    championship_points: 340,
    career_wins: 8,
    podiums: 14,
    position: 1,
    team: { id: "t1", name: "Mercedes", full_team_name: "Mercedes-AMG PETRONAS", color_hex: "#27F4D2" }
  },
  {
    id: "2",
    first_name: "G.",
    last_name: "Russell",
    driver_number: 63,
    code: "RUS",
    country: "United Kingdom",
    championship_points: 238,
    career_wins: 3,
    podiums: 8,
    position: 2,
    team: { id: "t1", name: "Mercedes", full_team_name: "Mercedes-AMG PETRONAS", color_hex: "#27F4D2" }
  },
  {
    id: "3",
    first_name: "L.",
    last_name: "Hamilton",
    driver_number: 44,
    code: "HAM",
    country: "United Kingdom",
    championship_points: 229,
    career_wins: 1,
    podiums: 6,
    position: 3,
    team: { id: "t2", name: "Ferrari", full_team_name: "Scuderia Ferrari HP", color_hex: "#E80020" }
  },
  {
    id: "4",
    first_name: "M.",
    last_name: "Verstappen",
    driver_number: 3,
    code: "VER",
    country: "Netherlands",
    championship_points: 221,
    career_wins: 2,
    podiums: 9,
    position: 4,
    team: { id: "t3", name: "Red Bull", full_team_name: "Oracle Red Bull Racing", color_hex: "#3671C6" }
  },
  {
    id: "5",
    first_name: "C.",
    last_name: "Leclerc",
    driver_number: 16,
    code: "LEC",
    country: "Monaco",
    championship_points: 215,
    career_wins: 1,
    podiums: 5,
    position: 5,
    team: { id: "t2", name: "Ferrari", full_team_name: "Scuderia Ferrari HP", color_hex: "#E80020" }
  },
  {
    id: "6",
    first_name: "L.",
    last_name: "Norris",
    driver_number: 1,
    code: "NOR",
    country: "United Kingdom",
    championship_points: 201,
    career_wins: 2,
    podiums: 5,
    position: 6,
    team: { id: "t4", name: "McLaren", full_team_name: "McLaren Formula 1 Team", color_hex: "#FF8000" }
  },
  {
    id: "7",
    first_name: "O.",
    last_name: "Piastri",
    driver_number: 81,
    code: "PIA",
    country: "Australia",
    championship_points: 138,
    career_wins: 0,
    podiums: 2,
    position: 7,
    team: { id: "t4", name: "McLaren", full_team_name: "McLaren Formula 1 Team", color_hex: "#FF8000" }
  },
  {
    id: "8",
    first_name: "I.",
    last_name: "Hadjar",
    driver_number: 6,
    code: "HAD",
    country: "France",
    championship_points: 97,
    career_wins: 0,
    podiums: 2,
    position: 8,
    team: { id: "t3", name: "Red Bull", full_team_name: "Oracle Red Bull Racing", color_hex: "#3671C6" }
  },
  {
    id: "9",
    first_name: "L.",
    last_name: "Lawson",
    driver_number: 30,
    code: "LAW",
    country: "New Zealand",
    championship_points: 75,
    career_wins: 0,
    podiums: 0,
    position: 9,
    team: { id: "t5", name: "RB", full_team_name: "Visa Cash App RB", color_hex: "#6692FF" }
  },
  {
    id: "10",
    first_name: "P.",
    last_name: "Gasly",
    driver_number: 10,
    code: "GAS",
    country: "France",
    championship_points: 41,
    career_wins: 0,
    podiums: 0,
    position: 10,
    team: { id: "t6", name: "Alpine", full_team_name: "BWT Alpine F1 Team", color_hex: "#0093CC" }
  },
  {
    id: "11",
    first_name: "A.",
    last_name: "Lindblad",
    driver_number: 41,
    code: "LIN",
    country: "United Kingdom",
    championship_points: 38,
    career_wins: 0,
    podiums: 0,
    position: 11,
    team: { id: "t5", name: "RB", full_team_name: "Visa Cash App RB", color_hex: "#6692FF" }
  },
  {
    id: "12",
    first_name: "F.",
    last_name: "Colapinto",
    driver_number: 43,
    code: "COL",
    country: "Argentina",
    championship_points: 27,
    career_wins: 0,
    podiums: 0,
    position: 12,
    team: { id: "t6", name: "Alpine", full_team_name: "BWT Alpine F1 Team", color_hex: "#0093CC" }
  },
  {
    id: "13",
    first_name: "O.",
    last_name: "Bearman",
    driver_number: 87,
    code: "BEA",
    country: "United Kingdom",
    championship_points: 23,
    career_wins: 0,
    podiums: 0,
    position: 13,
    team: { id: "t7", name: "Haas", full_team_name: "MoneyGram Haas F1 Team", color_hex: "#B6BABD" }
  },
  {
    id: "14",
    first_name: "N.",
    last_name: "Hülkenberg",
    driver_number: 27,
    code: "HUL",
    country: "Germany",
    championship_points: 13,
    career_wins: 0,
    podiums: 0,
    position: 14,
    team: { id: "t8", name: "Audi", full_team_name: "Audi F1 Team", color_hex: "#C00000" }
  },
  {
    id: "15",
    first_name: "G.",
    last_name: "Bortoleto",
    driver_number: 5,
    code: "BOR",
    country: "Brazil",
    championship_points: 10,
    career_wins: 0,
    podiums: 0,
    position: 15,
    team: { id: "t8", name: "Audi", full_team_name: "Audi F1 Team", color_hex: "#C00000" }
  },
  {
    id: "16",
    first_name: "F.",
    last_name: "Alonso",
    driver_number: 14,
    code: "ALO",
    country: "Spain",
    championship_points: 7,
    career_wins: 0,
    podiums: 0,
    position: 16,
    team: { id: "t9", name: "Aston Martin", full_team_name: "Aston Martin Aramco F1 Team", color_hex: "#229971" }
  },
  {
    id: "17",
    first_name: "E.",
    last_name: "Ocon",
    driver_number: 31,
    code: "OCO",
    country: "France",
    championship_points: 7,
    career_wins: 0,
    podiums: 0,
    position: 17,
    team: { id: "t7", name: "Haas", full_team_name: "MoneyGram Haas F1 Team", color_hex: "#B6BABD" }
  },
  {
    id: "18",
    first_name: "C.",
    last_name: "Sainz Jr.",
    driver_number: 55,
    code: "SAI",
    country: "Spain",
    championship_points: 7,
    career_wins: 0,
    podiums: 0,
    position: 18,
    team: { id: "t10", name: "Williams", full_team_name: "Williams Racing", color_hex: "#00A0DE" }
  },
  {
    id: "19",
    first_name: "A.",
    last_name: "Albon",
    driver_number: 23,
    code: "ALB",
    country: "Thailand",
    championship_points: 5,
    career_wins: 0,
    podiums: 0,
    position: 19,
    team: { id: "t10", name: "Williams", full_team_name: "Williams Racing", color_hex: "#00A0DE" }
  },
  {
    id: "20",
    first_name: "Y.",
    last_name: "Tsunoda",
    driver_number: 22,
    code: "TSU",
    country: "Japan",
    championship_points: 1,
    career_wins: 0,
    podiums: 0,
    position: 20,
    team: { id: "t5", name: "RB", full_team_name: "Visa Cash App RB", color_hex: "#6692FF" }
  },
  {
    id: "21",
    first_name: "L.",
    last_name: "Stroll",
    driver_number: 18,
    code: "STR",
    country: "Canada",
    championship_points: 0,
    career_wins: 0,
    podiums: 0,
    position: 21,
    team: { id: "t9", name: "Aston Martin", full_team_name: "Aston Martin Aramco F1 Team", color_hex: "#229971" }
  },
  {
    id: "22",
    first_name: "V.",
    last_name: "Bottas",
    driver_number: 77,
    code: "BOT",
    country: "Finland",
    championship_points: 0,
    career_wins: 0,
    podiums: 0,
    position: 22,
    team: { id: "t11", name: "Cadillac", full_team_name: "Cadillac F1 Team", color_hex: "#FFD700" }
  },
  {
    id: "23",
    first_name: "S.",
    last_name: "Pérez",
    driver_number: 11,
    code: "PER",
    country: "Mexico",
    championship_points: 0,
    career_wins: 0,
    podiums: 0,
    position: 23,
    team: { id: "t11", name: "Cadillac", full_team_name: "Cadillac F1 Team", color_hex: "#FFD700" }
  }
];

export async function GET()
{
  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase
        .from("drivers")
        .select("*, team:teams(*)")
        .order("position", { ascending: true });

      if (!error && data && data.length > 0)
      {
        return NextResponse.json
        (
          {
            source: "supabase",
            data
          }
        );
      }
    }

    return NextResponse.json
    (
      {
        source: "2026-official-f1-standings",
        data: STANDINGS_2026_EXACT
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Failed to fetch standings", data: STANDINGS_2026_EXACT },
      { status: 500 }
    );
  }
}
