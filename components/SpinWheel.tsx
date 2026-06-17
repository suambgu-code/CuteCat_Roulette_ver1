import React, { useEffect, useRef, useState } from 'react';
import { Restaurant } from '../types';
import { PawPrint } from 'lucide-react';

interface SpinWheelProps {
  items: Restaurant[];
  onSpinEnd: (winner: Restaurant) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  onEditItem?: (index: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ items, onSpinEnd, isSpinning, setIsSpinning, onEditItem }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Safe default if items is empty
  const wheelItems = items.length > 0 ? items : [{ id: '0', name: '沒有選項', source: 'generic' } as Restaurant];
  const numSegments = wheelItems.length;
  const segmentAngle = 360 / numSegments;
  
  // Pastel Macaron Palette (Soft & Cute)
  const colors = [
    '#fecaca', // Red-200 (Strawberry)
    '#fed7aa', // Orange-200 (Peach)
    '#fef08a', // Yellow-200 (Lemon)
    '#bbf7d0', // Green-200 (Mint)
    '#bae6fd', // Sky-200 (Cloud)
    '#ddd6fe', // Violet-200 (Lavender)
    '#fbcfe8', // Pink-200 (Rose)
    '#e2e8f0', // Slate-200 (Silver)
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1. Pre-determine the winner index randomly
    const newWinnerIndex = Math.floor(Math.random() * numSegments);
    const winner = wheelItems[newWinnerIndex];
    
    // 2. Calculate the target rotation
    const centerAngle = (newWinnerIndex + 0.5) * segmentAngle;
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.8;
    const targetAngle = (360 - centerAngle + jitter + 360) % 360; 
    
    const currentRotMod = rotation % 360;
    let rotationDiff = targetAngle - currentRotMod;
    
    if (rotationDiff < 0) {
        rotationDiff += 360;
    }
    
    const extraSpins = 5 * 360;
    const totalRotation = rotation + extraSpins + rotationDiff;

    setRotation(totalRotation);

    // 5. Wait for animation and announce winner
    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(winner);
    }, 4000); 
  };

  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-square flex items-center justify-center">
      {/* Pointer - A cute little triangle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-8 h-10 drop-shadow-sm filter">
         <svg viewBox="0 0 24 24" fill="currentColor" className="text-rose-400">
             <path d="M12 22L7 4H17L12 22Z" />
         </svg>
      </div>

      {/* Wheel Container */}
      <div 
        ref={wheelRef}
        className="w-full h-full rounded-full border-[8px] border-white shadow-xl shadow-rose-200 overflow-hidden relative transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
        style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '4s' : '0s'
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {wheelItems.map((item, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                const midAngle = startAngle + segmentAngle / 2;
                
                const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
                
                const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                
                const pathData = `M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`;

                const fontSize = numSegments > 12 ? "2.5" : numSegments > 8 ? "3" : "4";
                const color = colors[index % colors.length];

                return (
                    <g 
                        key={item.id} 
                        className={`cursor-pointer transition-opacity duration-200 select-none ${isSpinning ? 'pointer-events-none' : 'hover:opacity-90'}`}
                        onClick={() => {
                            if (!isSpinning && onEditItem) {
                                onEditItem(index);
                            }
                        }}
                    >
                        <path d={pathData} fill={color} stroke="white" strokeWidth="1.5" />
                        <text 
                           x="92" 
                           y="50" 
                           fill="#475569" // Slate-600
                           fontSize={fontSize}
                           fontWeight="bold"
                           textAnchor="end"
                           dominantBaseline="central"
                           transform={`rotate(${midAngle}, 50, 50)`}
                           style={{ cursor: isSpinning ? 'default' : 'pointer' }}
                        >
                            {item.name.length > 10 ? item.name.substring(0, 9) + '..' : item.name}
                        </text>
                    </g>
                );
            })}
        </svg>
      </div>

      {/* Center Button - Cute Paw */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-16 h-16 rounded-full bg-white border-4 border-rose-200 text-rose-400 font-bold shadow-lg shadow-rose-100/50 active:scale-95 transition-transform flex items-center justify-center text-lg hover:bg-rose-50 group"
        >
            {isSpinning ? (
                <span className="animate-spin text-2xl">🍬</span>
            ) : (
                <PawPrint className="w-8 h-8 fill-rose-300 group-hover:fill-rose-400 transition-colors" />
            )}
        </button>
      </div>
    </div>
  );
};

export default SpinWheel;