"use client";

import React from "react";
import { motion } from "framer-motion";

interface F1LogoProps
{
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
}

export const F1Logo: React.FC<F1LogoProps> = ({
  className = "",
  size = "md",
  showGlow = false,
}) =>
{
  const sizeMap = {
    sm: "h-6 sm:h-7",
    md: "h-9 sm:h-11",
    lg: "h-14 sm:h-16",
    xl: "h-20 sm:h-24",
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {showGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-2 bg-[#E10600]/25 rounded-full blur-xl pointer-events-none"
        />
      )}

      <svg
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} w-auto block select-none`}
      >
        {/* Right slanted 1 block */}
        <path
          d="M89.9999375,30 L119.999937,0 L101.943687,0 L71.9443125,30 L89.9999375,30 Z"
          fill="#E10600"
        />

        {/* Middle F horizontal cross-wing */}
        <path
          d="M85.6986875,13.065 L49.3818125,13.065 C38.3136875,13.065 36.3768125,13.651875 31.6361875,18.3925 C27.2024375,22.82625 20.0005625,30 20.0005625,30 L35.7324375,30 L39.4855625,26.246875 C41.9530625,23.779375 43.2255625,23.52375 48.4068125,23.52375 L75.2405625,23.52375 L85.6986875,13.065 Z"
          fill="#E10600"
        />

        {/* Top sweeping curve and main F body */}
        <path
          d="M31.1518125,16.253125 C27.8774375,19.3425 20.7530625,26.263125 16.9130625,30 L-6.25e-05,30 C-6.25e-05,30 13.5524375,16.486875 21.0849375,9.0725 C28.8455625,1.685 32.7143125,0 46.9486875,0 L98.7643125,0 L87.5449375,11.21875 L48.0011875,11.21875 C37.9993125,11.21875 35.7518125,11.911875 31.1518125,16.253125 Z"
          fill="#E10600"
        />
      </svg>
    </div>
  );
};
