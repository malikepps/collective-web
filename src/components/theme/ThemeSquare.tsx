import React from 'react';
import { DirectSVG, SVGIconStyle } from '@/lib/components/icons';

interface ThemeSquareProps {
  id: string;
  primaryColor: string; // Hex color string (e.g., "616161")
  isSelected: boolean;
  onClick: (themeId: string) => void;
}

const ThemeSquare: React.FC<ThemeSquareProps> = ({ 
  id,
  primaryColor,
  isSelected,
  onClick 
}) => {
  const bgColor = `#${primaryColor}`;

  return (
    <button
      onClick={() => onClick(id)}
      className={`relative aspect-square w-full ios-rounded-sm overflow-hidden transition-all duration-200 ease-in-out ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-black' : 'ring-0'}`}
      style={{ backgroundColor: bgColor }}
      aria-label={`Theme ${id}`}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <DirectSVG 
            icon="check"
            size={32} // Adjust size as needed
            style={SVGIconStyle.SOLID}
            primaryColor="ffffff"
          />
        </div>
      )}
    </button>
  );
};

export default ThemeSquare; 