// CharacterSelector.tsx
import React from "react";
import useGame from "../hooks/useGame";

export default function CharacterSelector() {
  const { setSelectedCharacter } = useGame();

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
  };

  return (
    <div className="character-selector text-center">
      <h2 className="mb-4 text-xl font-bold">Select Your Character</h2>
      <div className="flex justify-center">
        <div className="mx-4">
          <img
            src="/trump.png" // Ensure the path to the image is correct
            alt="Trump"
            className="w-24 h-36 cursor-pointer"
            onClick={() => handleCharacterSelect("TRUMP")}
          />
          <button
            onClick={() => handleCharacterSelect("TRUMP")}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Trump
          </button>
        </div>
        <div className="mx-4">
          <img
            src="/jimping.png" // Ensure the path to the image is correct
            alt="Xi Jinping"
            className="w-24 h-36 cursor-pointer"
            onClick={() => handleCharacterSelect("JINPING")}
          />
          <button
            onClick={() => handleCharacterSelect("JINPING")}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Xi Jinping
          </button>
        </div>
      </div>
    </div>
  );
}
