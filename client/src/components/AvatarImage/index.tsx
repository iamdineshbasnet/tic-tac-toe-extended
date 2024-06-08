import React from 'react';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

interface AvatarImageProps {
  seed: string;
  onUse: (svg: string) => void;
}

const AvatarImage: React.FC<AvatarImageProps> =  ({ seed, onUse  }) => {
  const avatar = createAvatar(bottts, {
    seed,
    radius: 10,
    backgroundType: ['gradientLinear'],
    backgroundRotation: [0, 360, 10, 20, 350, 330],
    backgroundColor: ['b6e3f4', 'ffdfbf', 'd1d4f9', 'c0aede', 'ffd5dc'],
  });
  const svg = avatar.toString();
  return <div dangerouslySetInnerHTML={{ __html: svg }} onClick={() => onUse(svg)} />;
};

export default AvatarImage;
