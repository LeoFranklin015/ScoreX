import React from "react";

export const LabelizedJSON: React.FC<{ label: string; value: any }> = ({
  label,
  value,
}) => (
  <div style={{ textAlign: "left", width: "100%" }}>
    <strong>{label}:</strong>
    <pre
      style={{
        background: "#f4f4f4",
        padding: 8,
        borderRadius: 4,
        overflowX: "auto",
      }}
    >
      {JSON.stringify(
        value,
        (key, val) => (typeof val === "bigint" ? val.toString() : val),
        2
      )}
    </pre>
  </div>
);
