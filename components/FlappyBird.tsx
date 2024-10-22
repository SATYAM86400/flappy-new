// FlappyBird.tsx
import { motion } from "framer-motion";
import useGame from "../hooks/useGame";
import useInterval from "../hooks/useInterval";

export function Bird() {
  const {
    bird: {
      size: { height, width },
      frame,
      isFlying,
      flap: { delay },
    },
    getNextFrame,
    selectedCharacter,
  } = useGame();
  useInterval(() => getNextFrame(), isFlying ? delay : null);

  // Determine the sprite image based on selectedCharacter
  const characterImage =
    selectedCharacter === "TRUMP" ? "trump.png" : "kamala.png";

  return (
    <div
      style={{
        backgroundImage: `url(${characterImage})`,
        height,
        width,
        backgroundPosition: frame,
        backgroundSize: "auto 100%",
        zIndex: 100,
      }}
    />
  );
}

export default function FlappyBird() {
  const {
    isStarted,
    bird: {
      fall: { delay },
      position,
      animate,
    },
    fall,
  } = useGame();
  useInterval(() => fall(), isStarted ? delay : null);
  return (
    <motion.div
      className={`m-auto absolute z-40 ${
        !isStarted && "animate-pulse"
      } w-20 h-10`}
      style={{
        ...position,
      }}
      animate={{
        ...position,
        ...animate,
      }}
      transition={{
        ease: "linear",
        duration: 0.25,
      }}
    >
      <Bird />
    </motion.div>
  );
}
