import React from 'react';
import { getIconComponent } from '../utils/iconHelper';

interface ProviderIconProps {
  icon: string;
  svg?: string;
  size?: number;
  className?: string;
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({
  icon,
  svg,
  size = 32,
  className = 'text-white',
}) => {
  if (svg) {
    const svgWithSize = svg
      .replace('<svg', `<svg width="${size}" height="${size}" style="display:block"`)
      .replace(/fill="[^"]*"/g, `fill="currentColor"`);

    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: svgWithSize }}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  const IconComponent = getIconComponent(icon);
  return <IconComponent size={size} className={className} />;
};
