import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { RegulationEra } from "@/types/f1";

const FALLBACK_REGULATIONS: RegulationEra[] = [
  {
    id: "e1",
    era_name: "2026 Next-Gen Active Aero & 50% EV Hybrid Era",
    start_year: 2026,
    end_year: null,
    engine_formula: "1.6L V6 Turbo + 350kW MGU-K (50% electrical power output)",
    aero_regulations: "Driver-switchable active aero wings: Z-mode (cornering downforce) & X-mode (straight-line low drag).",
    chassis_weight_min_kg: 768,
    fuel_flow_limit_spec: "100% Advanced drop-in sustainable e-fuel",
    budget_cap_millions: 135.0,
    key_changes: "Narrower chassis (-10cm), 30kg overall weight reduction, triple electrical recovery with MGU-H abolished, and dynamic active wing flap systems replacing static DRS."
  },
  {
    id: "e2",
    era_name: "2022-2025 Ground Effect & Financial Fair Play Era",
    start_year: 2022,
    end_year: 2025,
    engine_formula: "1.6L V6 Turbo Hybrid + 120kW MGU-K + MGU-H",
    aero_regulations: "Venturi tunnel 3D shaped underfloor ground effect with simplified front/rear wings and wheel wake deflectors.",
    chassis_weight_min_kg: 798,
    fuel_flow_limit_spec: "E10 Fuel (10% second-generation bio-ethanol)",
    budget_cap_millions: 135.0,
    key_changes: "Shift from complex bargeboards to ground effect Venturi tunnels, 18-inch low profile tyres, and the initial introduction of the FIA financial cost cap."
  }
];

export async function GET()
{
  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase
        .from("regulation_eras")
        .select("*")
        .order("start_year", { ascending: false });

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
        count: FALLBACK_REGULATIONS.length,
        data: FALLBACK_REGULATIONS
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Failed to fetch regulation eras", data: FALLBACK_REGULATIONS },
      { status: 500 }
    );
  }
}
