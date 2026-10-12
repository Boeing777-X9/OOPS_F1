import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { TelemetrySample } from "@/types/f1";

export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const driverCode = searchParams.get("driver") || "VER";

  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase
        .from("telemetry_data")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0)
      {
        return NextResponse.json
        (
          {
            source: "supabase",
            driver: driverCode,
            telemetry: data
          }
        );
      }
    }

    const simulatedTelemetry: TelemetrySample = {
      speed_kmh: Math.round((330 + Math.random() * 26) * 10) / 10,
      rpm: Math.round(11200 + Math.random() * 800),
      gear: 8,
      throttle_pct: 100,
      brake_pct: 0,
      g_force: Math.round((4.8 + Math.random() * 0.8) * 10) / 10,
      brake_temp_celsius: Math.round(820 + Math.random() * 45),
      drs_active: true,
      active_aero_mode: "X-mode",
      sector: 2,
      recorded_at: new Date().toISOString()
    };

    return NextResponse.json
    (
      {
        source: "live-telemetry-engine",
        driver: driverCode,
        telemetry: simulatedTelemetry
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Telemetry pipeline error" },
      { status: 500 }
    );
  }
}
