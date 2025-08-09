import { motion } from "framer-motion";

export default function StarsBackground() {
  // Generate star positions and delays
  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() > 0.5 ? 2 : 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="stars">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
