// Leaderboard.tsx
import React from "react";
import useGame from "../hooks/useGame";

export default function Leaderboard() {
  const { leaderboard } = useGame();

  return (
    <div className="leaderboard text-white bg-gray-800 p-2 rounded">
      <h2 className="text-lg font-bold mb-2">Leaderboard</h2>
      <p>Trump: {leaderboard.TRUMP}</p>
      <p>Kamala: {leaderboard.KAMALA}</p>
    </div>
  );
}
