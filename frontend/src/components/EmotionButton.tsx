import { motion } from "framer-motion";
import type { Mood } from "../types";

interface EmotionButtonProps {
  emoji: string;
  label: Mood;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

export default function EmotionButton({
  emoji,
  label,
  color,
  onClick,
  isSelected,
}: EmotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      animate={isSelected ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 ${
        isSelected
          ? "ring-4 ring-white shadow-2xl"
          : "shadow-lg hover:shadow-xl"
      }`}
      style={{ backgroundColor: color }}
    >
      <motion.span className="text-3xl mb-0.5">{emoji}</motion.span>
      <span className="text-xs font-bold text-white drop-shadow-md lowercase tracking-wide">
        {label}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-xs">✨</span>
        </motion.div>
      )}
    </motion.button>
  );
}
