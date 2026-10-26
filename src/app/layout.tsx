import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formula 1 Grand Prix Predictor | Official Race Forecast & Telemetry",
  description: "Official Formula 1 Grand Prix race winner predictor, pit strategy analytics, and driver telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
})
{
  return (
    <html
      lang="en"
      className="dark h-full bg-[#0B0B0E] text-zinc-100 antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0B0B0E] text-zinc-100 selection:bg-[#E10600] selection:text-white">
        {children}
      </body>
    </html>
  );
}
