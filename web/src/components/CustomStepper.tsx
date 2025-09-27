import React from "react";

type CustomStepperProps = {
  value: number;
  onChange: (index: number) => void;
  steps: { label: string }[];
};

export const CustomStepper: React.FC<CustomStepperProps> = ({ value, onChange, steps }) => {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {steps.map((s, idx) => {
        const active = idx === value;
        return (
          <button
            key={s.label + idx}
            onClick={() => onChange(idx)}
            aria-current={active ? "step" : undefined}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
              background: active ? "#eff6ff" : "white",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: active ? 700 : 500 }}>{s.label}</div>
          </button>
        );
      })}
    </div>
  );
};