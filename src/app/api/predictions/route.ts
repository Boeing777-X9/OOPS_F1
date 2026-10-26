import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface TopDriverPrediction
{
  name: string;
  code: string;
  team: string;
  grid: number;
  probPct: number;
}

interface PredictionPayload
{
  circuit: "monaco" | "silverstone" | "monza" | "cota";
  predictedWinner: string;
  winnerTeam: string;
  winProbabilityPct: number;
  runnerUp?: string;
  runnerUpProbPct?: number;
  topDrivers?: TopDriverPrediction[];
  fastestLapDriver: string;
  safetyCarProbabilityPct: number;
  keyStrategicFactor: string;
  recommendedCompoundSequence: string;
  pitStopsExpected: number;
  trainingDataset?: string;
  poleConversionRate20Yr?: string;
}

import { runLiveMLInference, QualiMode } from "@/lib/f1InferenceModel";

export async function GET(request: Request)
{
  const { searchParams } = new URL(request.url);
  const track = (searchParams.get("track") || "monaco").toLowerCase() as "monaco" | "silverstone" | "monza" | "cota";
  const rain = searchParams.get("rain") === "true";
  const modeParam = searchParams.get("mode") as QualiMode | null;
  const qualiMode: QualiMode = (modeParam === "without_quali" || modeParam === "manual_quali")
    ? modeParam
    : "official_quali";
  const poleDriver = searchParams.get("pole");
  const customGridParam = searchParams.get("customGrid");

  // Parse custom grid if provided
  let customGrid: Record<string, number> | undefined = undefined;
  if (customGridParam)
  {
    try
    {
      if (customGridParam.startsWith("{"))
      {
        customGrid = JSON.parse(customGridParam);
      }
      else
      {
        customGrid = {};
        customGridParam.split(",").forEach
        (
          (pair, index) =>
          {
            const [code, posStr] = pair.split(":");
            if (code)
            {
              customGrid![code.trim().toUpperCase()] = posStr ? parseInt(posStr, 10) : (index + 1);
            }
          }
        );
      }
    }
    catch (err)
    {
      console.warn("Failed to parse customGrid parameter:", err);
    }
  }
  else if (poleDriver)
  {
    customGrid = { [poleDriver.toUpperCase()]: 1 };
  }

  // Live Machine Learning inference execution
  const prediction = runLiveMLInference(track, qualiMode, customGrid, rain);

  try
  {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))
    {
      const { data, error } = await supabase
        .from("circuits")
        .select("*")
        .ilike("name", `%${track}%`)
        .single();

      if (!error && data)
      {
        return NextResponse.json
        (
          {
            source: "supabase-analytics",
            circuitDetails: data,
            prediction
          }
        );
      }
    }

    return NextResponse.json
    (
      {
        source: "rdbms-simulation-engine",
        prediction
      }
    );
  }
  catch (error)
  {
    return NextResponse.json
    (
      { error: "Prediction calculation error", prediction },
      { status: 500 }
    );
  }
}
