// Lifelines.tsx
import React from "react";
import useGame from "../hooks/useGame";

export default function Lifelines() {
  const { lifelines } = useGame();

  return (
    <div className="lifelines text-white bg-gray-800 p-2 rounded">
      <h3>Lifelines: {lifelines}</h3>
    </div>
  );
}
