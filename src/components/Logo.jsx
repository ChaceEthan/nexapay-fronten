import React from "react";

export default function Logo({ size = 60 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        fontWeight: "bold",
        color: "white",
        fontSize: size / 3,
        userSelect: "none",
      }}
    >
      N
    </div>
  );
}