import { memo } from "react";

const emojis = [
  { emoji: "🐝", left: "8vw", top: "80vh", delay: "0s", variant: "fast" },
  { emoji: "🧑‍💻", left: "22vw", top: "90vh", delay: "2s", variant: "normal" },
  { emoji: "🎨", left: "40vw", top: "85vh", delay: "4s", variant: "slow" },
  { emoji: "🔍", left: "60vw", top: "95vh", delay: "1.5s", variant: "normal" },
  { emoji: "🤖", left: "80vw", top: "88vh", delay: "3.2s", variant: "fast" },
  { emoji: "🌱", left: "70vw", top: "92vh", delay: "5.1s", variant: "slow" },
  { emoji: "🧠", left: "15vw", top: "97vh", delay: "6.2s", variant: "normal" },
] as const;

type AnimationVariant = "normal" | "slow" | "fast";

function getAnimationClass(variant: AnimationVariant): string {
  switch (variant) {
    case "slow":
      return "animate-float-slow";
    case "fast":
      return "animate-float-fast";
    default:
      return "animate-float";
  }
}

function SwarmEmoji({
  emoji,
  left,
  top,
  delay,
  variant = "normal",
}: (typeof emojis)[number]) {
  return (
    <span
      className={`absolute text-4xl opacity-[0.08] blur-[0.5px] ${getAnimationClass(
        variant
      )}`}
      style={{
        left,
        top,
        animationDelay: delay,
        willChange: "transform",
      }}
      role="presentation"
    >
      {emoji}
    </span>
  );
}

const MemoizedSwarmEmoji = memo(SwarmEmoji);

export function SwarmBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {emojis.map((item, index) => (
        <MemoizedSwarmEmoji key={`swarm-emoji-${index}`} {...item} />
      ))}
    </div>
  );
}
