// useGame.tsx
import _ from "lodash";
import React from "react";
import { AptosClient, Types } from "aptos";
import { useImmer } from "use-immer";
import { TargetAndTransition } from "framer-motion";
import { WritableDraft } from "immer/dist/internal";
import { v4 } from "uuid";
import { useWalletContext } from "../context/walletContext";

const HEIGHT = 64;
const WIDTH = 92;
const FRAMES = ["0px", "92px", "184px", "0px"];
const defaultState = {
  bird: {
    position: { x: 0, y: 0 },
    size: { width: WIDTH, height: HEIGHT },
    animate: {},
    frame: FRAMES[0],
    frameIndex: 0,
    initial: {
      x: 0,
      y: 0,
    },
    isFlying: true,
    fall: { distance: 15, delay: 100 },
    fly: { distance: 75 },
    flap: {
      delay: 100,
    },
  },
  pipes: Array(4)
    .fill("")
    .map((_, index) => ({
      top: {
        key: "top" + index,
        position: { x: 0, y: 0 },
        initial: {
          x: 0,
          y: 0,
        },
        size: { width: 0, height: 0 },
      },
      bottom: {
        key: "bottom" + index,
        position: { x: 0, y: 0 },
        initial: {
          x: 0,
          y: 0,
        },
        size: { width: 0, height: 0 },
      },
    })),
  pipe: {
    width: 0,
    height: 0,
    extension: 0,
    tolerance: 25,
    distance: 10,
    delay: 75,
  },
  rounds: [],
  isStarted: false,
  isReady: false,
  gameWindow: { // Renamed from 'window' to 'gameWindow'
    width: 0,
    height: 0,
  },
  multiplier: {
    distance: 1.1,
    step: 5,
  },
  gameOver: false,
  score: 0,
};

type Size = {
  width: number;
  height: number;
};

type Coordinates = {
  x: number;
  y: number;
};

export type PipeType = {
  position: Coordinates;
  initial: Coordinates;
  size: Size;
  key?: string;
};

export type PipesType = {
  top: PipeType;
  bottom: PipeType;
};

interface GameContext extends GameState {
  getNextFrame: () => void;
  fly: () => void;
  fall: () => void;
  handleWindowClick: () => void;
  movePipes: () => void;
  startGame: (gameWindow: Size) => void; // Updated parameter name
  resetGame: () => void;
}

interface GameState {
  bird: {
    position: Coordinates;
    size: Size;
    animate: TargetAndTransition;
    frame: string;
    frameIndex: number;
    initial: Coordinates;
    isFlying: boolean;
    fall: {
      distance: number;
      delay: number;
    };
    fly: {
      distance: number;
    };
    flap: {
      delay: number;
    };
  };
  pipes: PipesType[];
  pipe: {
    width: number;
    height: number;
    extension: number;
    delay: number;
    distance: number;
    tolerance: number;
  };
  rounds: {
    score: number;
    datetime: string;
    key: string;
  }[];
  isStarted: boolean;
  isReady: boolean;
  gameWindow: Size; // Updated variable name
  multiplier: {
    step: number;
    distance: number;
  };
  gameOver: boolean;
  score: number;
}

type StateDraft = WritableDraft<GameState>;
const GameContext = React.createContext<GameContext | null>(null);

// Initialize Aptos Client with the correct network URL
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1"); // Use appropriate network

// Function to create a game on the Aptos blockchain using window.aptos
export const createGameOnChain = async () => {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      throw new Error("Aptos wallet is not connected");
    }

    // Construct the payload for the Move entry function `create_game`
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function:
        "0xe7d3a8337a3bf682022da10fdfca180727436c7787b11d1166a1e78d050bdf38::flappy_game::create_game",
      type_arguments: [], // No type arguments for the function
      arguments: [], // No arguments are needed for `create_game`
    };

    // Call signAndSubmitTransaction with the correct format
    const response = await window.aptos.signAndSubmitTransaction(payload);
    console.log("Game creation transaction submitted:", response.hash);

    // Wait for transaction confirmation
    const transaction = await client.waitForTransactionWithResult(response.hash);
    console.log("Game creation confirmed:", transaction);
    return transaction;
  } catch (error) {
    console.error("Failed to create game on blockchain:", error);
    throw error;
  }
};

// Function to submit score to the Aptos blockchain using window.aptos
export const submitScoreOnChain = async (score: number) => {
  try {
    if (typeof window === "undefined" || !window.aptos) {
      throw new Error("Aptos wallet is not connected");
    }

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function:
        "0xe7d3a8337a3bf682022da10fdfca180727436c7787b11d1166a1e78d050bdf38::flappy_game::submit_score",
      type_arguments: [],
      arguments: [score.toString()], // Send the score as a string
    };

    const response = await window.aptos.signAndSubmitTransaction(payload);
    console.log("Score submission transaction submitted:", response.hash);

    await client.waitForTransactionWithResult(response.hash);
    console.log("Score submission confirmed");
  } catch (error) {
    console.error("Failed to submit score on blockchain:", error);
    throw error;
  }
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useImmer<GameState>(defaultState);
  const { connected } = useWalletContext(); // Use Wallet context

  // Main Functions
  const startGame = (gameWindow: Size) => { // Updated parameter name
    if (!connected) {
      console.error("Wallet not connected");
      return;
    }

    if (gameWindow.width === 0 || gameWindow.height === 0) {
      console.error("Window dimensions not set");
      return;
    }

    setState((draft) => {
      console.log("Starting game with window dimensions:", gameWindow.width, gameWindow.height);
      draft.gameWindow = gameWindow;
      draft.isReady = true;
      draft.isStarted = true;
      draft.gameOver = false;
      draft.score = 0;
      draft.rounds.push({
        score: 0,
        datetime: new Date().toISOString(),
        key: v4(),
      });
      setBirdCenter(draft);
      createPipes(draft);
      return draft;
    });
  };

  const resetGame = () => {
    setState((draft) => {
      Object.assign(draft, defaultState);
    });
  };

  const increaseScore = (draft: StateDraft) => {
    draft.rounds[draft.rounds.length - 1].score += 1;
    draft.score += 1; // Increment the score in the state
  };

  const multiplySpeed = (draft: StateDraft) => {
    const round = _.last(draft.rounds);
    if (round && round.score % draft.multiplier.step === 0) {
      draft.pipe.distance = draft.pipe.distance * draft.multiplier.distance;
    }
  };

  const generatePipeExtension = (index: number, draft: StateDraft) => {
    const odd = _.random(0, 1) === 1;
    const randomNumber = _.random(odd ? 0.5 : 0, odd ? 1 : 0, true);
    const extension = randomNumber * draft.pipe.extension;
    return {
      height: draft.pipe.height + extension,
      y: draft.gameWindow.height - draft.pipe.height + extension,
    };
  };

  const createPipes = (draft: StateDraft) => {
    const gameWindow = draft.gameWindow;
    draft.pipe.width = gameWindow.width / draft.pipes.length;
    draft.pipe.height = (1 / 3) * gameWindow.height;
    draft.pipe.distance = defaultState.pipe.distance;
    draft.pipe.extension = (0.5 / 3) * gameWindow.height;
    draft.pipes.forEach((pipe, index) => {
      const { height, y } = generatePipeExtension(index, draft);
      var x = (index * 2 + 1) * draft.pipe.width + gameWindow.width;
      pipe.top.initial = {
        x,
        y: 0,
      };
      pipe.top.size = {
        height,
        width: draft.pipe.width,
      };
      pipe.bottom.initial = {
        x,
        y,
      };
      pipe.bottom.size = {
        height,
        width: draft.pipe.width,
      };
      pipe.top.position = pipe.top.initial;
      pipe.bottom.position = pipe.bottom.initial;
    });
  };

  const movePipes = () => {
    setState((draft) => {
      draft.pipes.forEach((pipe, index) => {
        if (pipe.top.position.x + pipe.top.size.width * 2 <= 0) {
          const { height, y } = generatePipeExtension(index, draft);
          pipe.top.position.x = draft.pipe.width * 2 + draft.gameWindow.width;
          pipe.bottom.position.x = draft.pipe.width * 2 + draft.gameWindow.width;
          pipe.top.size.height = height;
          pipe.bottom.size.height = height;
          pipe.bottom.position.y = y;
          pipe.top.key = v4();
          pipe.bottom.key = v4();
          increaseScore(draft);
          multiplySpeed(draft);
        }
        pipe.top.position.x -= draft.pipe.distance;
        pipe.bottom.position.x -= draft.pipe.distance;
      });

      return draft;
    });
  };

  const handleWindowClick = () => {
    if (!connected) {
      console.error("Wallet not connected");
      return;
    }

    if (state.isStarted) {
      fly();
    }
  };

  const setBirdCenter = (draft: StateDraft) => {
    console.log("Window dimensions:", draft.gameWindow.width, draft.gameWindow.height);
    draft.bird.position.x = draft.gameWindow.width / 2 - draft.bird.size.width / 2;
    draft.bird.position.y =
      draft.gameWindow.height / 2 - draft.bird.size.height / 2;
    draft.bird.initial.x = draft.bird.position.x;
    draft.bird.initial.y = draft.bird.position.y;
    console.log("Bird position:", draft.bird.position.x, draft.bird.position.y);
  };

  const getNextFrame = () =>
    setState((draft) => {
      var next = (draft.bird.frameIndex + 1) % FRAMES.length;
      draft.bird.frame = FRAMES[next];
      draft.bird.frameIndex = next;
      return draft;
    });

  const checkImpact = (draft: StateDraft) => {
    const groundImpact =
      draft.bird.position.y + draft.bird.size.height >=
      draft.gameWindow.height + draft.pipe.tolerance;
    const impactablePipes = draft.pipes.filter((pipe) => {
      return (
        pipe.top.position.x <
          draft.bird.position.x -
            draft.pipe.tolerance +
            draft.bird.size.width &&
        pipe.top.position.x + pipe.top.size.width >
          draft.bird.position.x + draft.pipe.tolerance
      );
    });
    const pipeImpact = impactablePipes.some((pipe) => {
      const topPipe = pipe.top.position.y + pipe.top.size.height;
      const bottomPipe = pipe.bottom.position.y;
      const birdTop = draft.bird.position.y + draft.pipe.tolerance;
      const birdBottom =
        draft.bird.position.y + draft.bird.size.height - draft.pipe.tolerance;
      return birdTop < topPipe || birdBottom > bottomPipe;
    });
    if (groundImpact || pipeImpact) {
      draft.bird.isFlying = false;
      draft.isStarted = false;
      draft.bird.animate.rotate = [0, 540];
      draft.gameOver = true; // Set gameOver to true
    } else {
      draft.bird.animate.rotate = [0, 0];
    }
  };

  const fly = () => {
    setState((draft) => {
      draft.bird.isFlying = true;
      draft.bird.position.y -= draft.bird.fly.distance;
      checkImpact(draft);
      return draft;
    });
  };

  const fall = () => {
    setState((draft) => {
      draft.bird.isFlying = true;
      draft.bird.position.y += draft.bird.fall.distance;
      checkImpact(draft);
      return draft;
    });
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        getNextFrame,
        fall,
        fly,
        handleWindowClick,
        movePipes,
        startGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default function useGame() {
  const context = React.useContext(GameContext);
  if (context === null) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
