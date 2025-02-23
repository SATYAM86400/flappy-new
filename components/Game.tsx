import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FlappyBird from "./FlappyBird";
import Footer from "./Footer";
import Background from "./Background";
import useGame from "../hooks/useGame";
import Pipes from "./Pipes";
import useElementSize from "../hooks/useElementSize";
import dynamic from "next/dynamic";
import { useWalletContext } from "../context/walletContext";
import _ from "lodash";
import CharacterSelector from "./CharacterSelector";
import Leaderboard from "./Leaderboard";
import Lifelines from "./Lifelines";
import TransactionLoader from "./TransactionLoader"; // Loading overlay component

// Dynamically import WalletSetup with SSR disabled
const WalletSetup = dynamic(() => import("./WalletSetup"), { ssr: false });

export default function Game() {
  const {
    handleWindowClick,
    startGame,
    isReady,
    rounds,
    gameOver,
    score,
    selectedCharacter,
    restartGame,
    createGameOnChain,
    submitScoreOnChain,
  } = useGame();
  const [ref, window] = useElementSize();
  const { connected, account } = useWalletContext();
  const [gameStarted, setGameStarted] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Function to create a game on the blockchain (triggered by the Start Game button)
  const createGameTransaction = async () => {
    if (!connected || !account) {
      alert("Please connect your wallet before starting the game.");
      return;
    }
    setTransactionPending(true);
    setTransactionError(null);
    try {
      await createGameOnChain();
      setGameStarted(true);
    } catch (error) {
      console.error("Error creating game:", error);
      setTransactionError("Failed to create game on the blockchain.");
      alert("Failed to create game on the blockchain.");
    } finally {
      setTransactionPending(false);
    }
  };

  // Function to submit the score (triggered once when gameOver becomes true)
  const submitScoreTransaction = async (score: number) => {
    if (!connected || !account) {
      alert("Please connect your wallet before submitting your score.");
      return;
    }
    setTransactionPending(true);
    try {
      await submitScoreOnChain(score);
      alert(`Your score of ${score} has been submitted.`);
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score on the blockchain.");
    } finally {
      setTransactionPending(false);
    }
  };

  // When window dimensions are available and gameStarted is true, start the game.
  useEffect(() => {
    if (window.width > 0 && window.height > 0 && gameStarted) {
      startGame(window);
    }
  }, [window, gameStarted]);

  // When gameOver becomes true, submit the score once.
  useEffect(() => {
    if (gameOver && score !== null) {
      submitScoreTransaction(score);
    }
  }, [gameOver]);

  const handleGameClick = () => {
    if (!gameStarted) return;
    handleWindowClick();
  };

  const handleRestart = () => {
    restartGame();
    setGameStarted(false);
  };

  return (
    <motion.main
      layout
      className="m-auto overflow-hidden flex flex-col max-w-[480px] border-8 border-zinc-200 rounded-xl bg-[#ded895] relative max-h-[800px] w-full h-full"
    >
      {/* Loading overlay */}
      {transactionPending && (
        <TransactionLoader message="Processing blockchain transaction. Please wait..." />
      )}

      <Background />

      <div className="absolute top-1 right-2 z-20">
        <WalletSetup />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Leaderboard />
      </div>

      {gameStarted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Lifelines />
        </div>
      )}

      {!connected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-red-600">
          Please connect your wallet to start the game.
        </div>
      )}

      {!selectedCharacter && connected && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <CharacterSelector />
        </div>
      )}

      {selectedCharacter && !gameStarted && connected && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={createGameTransaction}
            disabled={transactionPending}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: transactionPending ? "#ddd" : "#0070f3",
              color: "#fff",
              borderRadius: "5px",
              cursor: transactionPending ? "not-allowed" : "pointer",
            }}
          >
            {transactionPending ? "Starting..." : "Start Game"}
          </button>
          {transactionError && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {transactionError}
            </div>
          )}
        </div>
      )}

      {gameStarted && (
        <motion.div
          ref={ref}
          key={_.last(rounds)?.key || "initial"}
          onTap={handleGameClick}
          className="h-[calc(100%-7rem)] z-10 flex relative overflow-hidden cursor-pointer"
        >
          {isReady ? (
            <>
              <Pipes />
              <FlappyBird />
            </>
          ) : (
            <div>Game is not ready.</div>
          )}
        </motion.div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={handleRestart}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Restart Game
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </motion.main>
  );
}
