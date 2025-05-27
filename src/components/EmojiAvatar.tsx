import { UserCircle } from 'lucide-react';

interface EmojiAvatarProps {
  emoji: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmojiAvatar({ emoji, size = 'md', className = '' }: EmojiAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl md:text-6xl',
  };

  return (
    <div 
      className={`
        bg-yellow-500 
        rounded-full 
        flex 
        items-center 
        justify-center 
        shadow-zwarm-glow 
        border-2 
        border-yellow-100
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {emoji || <UserCircle className="h-1/2 w-1/2 text-yellow-100" />}
    </div>
  );
}
