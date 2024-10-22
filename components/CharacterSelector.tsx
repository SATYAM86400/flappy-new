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
            className="w-24 h-24 cursor-pointer"
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
            src="/kamala.png" // Ensure the path to the image is correct
            alt="Kamala"
            className="w-24 h-24 cursor-pointer"
            onClick={() => handleCharacterSelect("KAMALA")}
          />
          <button
            onClick={() => handleCharacterSelect("KAMALA")}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Kamala
          </button>
        </div>
      </div>
    </div>
  );
}
