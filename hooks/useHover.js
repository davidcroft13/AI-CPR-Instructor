import { useState } from 'react';
import { Platform } from 'react-native';

/**
 * Simple hover hook for React Native Web.
 * Returns [isHovered, hoverProps] where hoverProps
 * can be spread onto any pressable component.
 * On native platforms this gracefully no-ops.
 */
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);

  if (Platform.OS !== 'web') {
    return [false, {}];
  }

  return [
    isHovered,
    {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  ];
};


