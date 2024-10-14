// Game.tsx
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
import { createGameOnChain, submitScoreOnChain } from "../hooks/useGame";

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
  } = useGame();
  const [ref, window] = useElementSize();
  const { connected, account } = useWalletContext();
  const [gameStarted, setGameStarted] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState(null);

  // Function to create a game on the blockchain
  const createGameTransaction = async () => {
    console.log("createGameTransaction called");
    if (!connected || !account) {
      alert("Please connect your wallet before starting the game.");
      return;
    }

    setTransactionPending(true);
    setTransactionError(null);

    try {
      console.log("Creating game on blockchain...");
      const transaction = await createGameOnChain();
      console.log("Transaction result:", transaction);
      if (transaction) {
        setGameStarted(true);
      } else {
        throw new Error("Transaction failed.");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game on the blockchain.");
      setTransactionError("Failed to create game on the blockchain.");
    } finally {
      setTransactionPending(false);
    }
  };

  // Function to submit the score to the blockchain
  const submitScoreTransaction = async (score) => {
    if (!connected || !account) {
      alert("Please connect your wallet before submitting your score.");
      return;
    }

    setTransactionPending(true);
    try {
      console.log("Submitting score to blockchain...");
      const transaction = await submitScoreOnChain(score);
      console.log("Score submission result:", transaction);
      alert(`Your score of ${score} has been submitted.`);
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score on the blockchain.");
    } finally {
      setTransactionPending(false);
    }
  };

  // Start the game when window dimensions are available and the game has started
  useEffect(() => {
    console.log("useEffect - Start Game Check");
    if (window.width > 0 && window.height > 0 && gameStarted) {
      console.log("Starting game with window dimensions:", window);
      startGame(window);
    }
  }, [window, gameStarted]);

  // Submit the score when the game is over
  useEffect(() => {
    if (gameOver && score !== null) {
      submitScoreTransaction(score);
    }
  }, [gameOver]);

  const handleGameClick = () => {
    if (!gameStarted) return;
    handleWindowClick();
  };

  return (
    <motion.main
      layout
      className="m-auto overflow-hidden flex flex-col max-w-[480px] border-8 border-zinc-200 rounded-xl bg-[#ded895] relative max-h-[800px] w-full h-full"
    >
      {/* Background of the game */}
      <Background />

      {/* Wallet connection UI */}
      <div className="absolute top-4 right-4 z-20">
        <WalletSetup />
      </div>

      {!connected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-red-600">
          Please connect your wallet to start the game.
        </div>
      )}

      {/* Start Game Button (only if game isn't started yet) */}
      {!gameStarted && connected && (
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

          {/* Show error message if the transaction fails */}
          {transactionError && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {transactionError}
            </div>
          )}
        </div>
      )}

      {/* Game Area */}
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

      {/* Footer with score */}
      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </motion.main>
  );
}
