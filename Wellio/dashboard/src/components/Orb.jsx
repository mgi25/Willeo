import { motion } from "framer-motion";

export default function Orb({ isListening, isSpeaking }) {
  return (
    <div className="flex justify-center items-center h-32 w-32">
      <motion.div
        className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"
        animate={{
          scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.4, 1] : [1, 1],
          opacity: isListening || isSpeaking ? [0.9, 1, 0.9] : 0.6,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: "100px", height: "100px" }}
      ></motion.div>
    </div>
  );
}
