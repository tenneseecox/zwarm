"use client";
import React, { memo, useMemo } from "react";

// --- Configuration for Emojis ---
const NUM_EMOJIS = 30; // Number of emojis to render
const AVAILABLE_EMOJIS = [
  "🐝", "🧑‍💻", "🎨", "🔍", "🤖", "🌱", "🧠", "💡", "🛠️", "🚀",
  "✨", "🧩", "🌐", "🔗", "🤝", "📈", "📡", "🔬", "🧪", "🌌",
  "🌠", "🛰️", "🧬", "⚡", "🎯", "🏆", "💡", "📈", "🤝", "🌍"
];

// --- Types ---
interface EmojiConfig {
  id: string;
  emoji: string;
  left: string; // e.g., '10vw'
  animationDuration: string; // e.g., '15s'
  animationDelay: string; // e.g., '2s'
  fontSize: string; // e.g., '2rem'
  opacity: number; // Max opacity during animation
}

// --- Keyframes Component ---
// Injects the CSS @keyframes rule into the document head.
// This animation makes emojis float upwards, drift horizontally, and rotate subtly.
const SwarmKeyframes = () => (
  <style jsx global>{`
    @keyframes floatUpAndDrift {
      0% {
        transform: translateY(0vh) translateX(0px) rotate(0deg);
        opacity: 0;
      }
      10%, 20% { /* Fade in period */
        opacity: var(--emoji-max-opacity, 0.12); /* Use CSS variable for max opacity */
      }
      /* Add some gentle horizontal drift and rotation throughout */
      25% {
        transform: translateY(-25vh) translateX(calc(var(--emoji-drift-x) * 0.5)) rotate(calc(var(--emoji-rotate-z) * 0.25));
      }
      50% {
        transform: translateY(-50vh) translateX(var(--emoji-drift-x)) rotate(calc(var(--emoji-rotate-z) * 0.5));
      }
      75% {
        transform: translateY(-75vh) translateX(calc(var(--emoji-drift-x) * 0.5)) rotate(calc(var(--emoji-rotate-z) * 0.75));
      }
      90% { /* Start fade out */
        opacity: var(--emoji-max-opacity, 0.12);
      }
      100% {
        transform: translateY(-105vh) translateX(0px) rotate(var(--emoji-rotate-z)); /* Ensure it goes well off-screen */
        opacity: 0;
      }
    }
  `}</style>
);

// --- Individual Emoji Component ---
// Directly use EmojiConfig for props type
const SwarmEmoji: React.FC<EmojiConfig> = ({
  emoji,
  left,
  animationDuration,
  animationDelay,
  fontSize,
  opacity,
}) => {
  // CSS variables for per-emoji animation customization
  const emojiSpecificStyles = {
    '--emoji-max-opacity': opacity,
    '--emoji-drift-x': `${Math.random() * 40 - 20}px`, // Random horizontal drift amount (-20px to 20px)
    '--emoji-rotate-z': `${Math.random() * 60 - 30}deg`, // Random rotation amount (-30deg to 30deg)
  } as React.CSSProperties;

  const animationStyle: React.CSSProperties = {
    ...emojiSpecificStyles,
    position: 'absolute',
    top: '105vh', // Start below the viewport
    left,
    fontSize,
    filter: 'blur(0.5px)', // Keep the blur for a softer background effect
    animationName: 'floatUpAndDrift',
    animationDuration,
    animationDelay,
    animationTimingFunction: 'linear', // For a smoother, continuous upward movement
    animationIterationCount: 'infinite',
    willChange: "transform, opacity", // Hint for browser optimization
    opacity: 0, // Initial opacity, animation will take over
  };

  return (
    <span style={animationStyle} role="presentation">
      {emoji}
    </span>
  );
};

const MemoizedSwarmEmoji = memo(SwarmEmoji);

// --- Main Background Component ---
export function SwarmBackground() {
  // Generate emoji configurations once using useMemo
  const emojiConfigs = useMemo(() => {
    const configs: EmojiConfig[] = [];
    for (let i = 0; i < NUM_EMOJIS; i++) {
      configs.push({
        id: `swarm-emoji-${i}-${Date.now()}`, // Unique key
        emoji: AVAILABLE_EMOJIS[Math.floor(Math.random() * AVAILABLE_EMOJIS.length)],
        left: `${Math.random() * 95}vw`, // Random horizontal position (0-95vw)
        animationDuration: `${10 + Math.random() * 15}s`, // Duration between 10s and 25s
        animationDelay: `${Math.random() * 5}s`, // Delays up to 5s
        fontSize: `${1.5 + Math.random() * 1.5}rem`, // Sizes between 1.5rem (24px) and 3rem (48px)
        opacity: 0.05 + Math.random() * 0.1, // Max opacity between 0.05 and 0.15
      });
    }
    return configs;
  }, []);

  return (
    <>
      <SwarmKeyframes /> {/* Inject keyframes globally */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
        role="presentation"
      >
        {emojiConfigs.map((config) => (
          <MemoizedSwarmEmoji key={config.id} {...config} />
        ))}
      </div>
    </>
  );
}
