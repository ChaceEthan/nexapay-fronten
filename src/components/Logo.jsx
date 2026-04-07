// @ts-nocheck
import React from "react";

export default function Logo({ size = 64 }) {
  return (
    <div style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle cx="32" cy="32" r="32" fill="url(#gradient)" />

        {/* Inner stylized N */}
        <path
          d="M20 44V20L44 44V20"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient
            id="gradient"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06d4a7ff" /> {/* Cyan */}
            <stop offset="1" stopColor="#3B82F6" /> {/* Blue */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}