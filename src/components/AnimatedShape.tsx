
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedShapeProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square' | 'triangle';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: string;
  zIndex?: string;
}

const AnimatedShape: React.FC<AnimatedShapeProps> = ({
  className,
  color = 'bg-bookeasy-orange/30',
  size = 'md',
  shape = 'circle',
  top,
  left,
  right,
  bottom,
  delay = '0s',
  zIndex = 'z-0',
}) => {
  const sizeClass = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
  }[size];

  const shapeClass = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    triangle: 'triangle',
  }[shape];

  const positionStyle = {
    top: top || 'auto',
    left: left || 'auto',
    right: right || 'auto',
    bottom: bottom || 'auto',
    animationDelay: delay,
  };

  return (
    <div
      className={cn(
        'absolute blur-xl opacity-60',
        sizeClass,
        shapeClass,
        color,
        zIndex,
        'animate-float',
        className
      )}
      style={positionStyle}
    />
  );
};

export default AnimatedShape;
