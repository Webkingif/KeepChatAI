import React from 'react';

interface KeepChatLogoProps {
  size?: number;
  variant?: 'icon' | 'full';
  className?: string;
  showText?: boolean;
}

export const KeepChatLogo: React.FC<KeepChatLogoProps> = ({
  size = 36,
  variant = 'icon',
  className = '',
  showText = variant === 'full',
}) => {
  // If variant === 'full', we compute height to accommodate typography comfortably
  const isFull = variant === 'full' || showText;
  const viewBoxWidth = isFull ? 240 : 200;
  const viewBoxHeight = isFull ? 250 : 200;
  const displayWidth = size;
  const displayHeight = isFull ? Math.round(size * 1.05) : size;

  return (
    <img
      src="/favicon.svg"
      alt="KeepChat logo"
      width={displayWidth}
      height={displayHeight}
      className={`shrink-0 ${className}`}
    />
  );
};
