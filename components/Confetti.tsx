import React, { useEffect, useRef } from 'react';

// Beautiful, high-quality, fully transparent custom-designed vector cat illustrations
const CAT_SVGS = [
  // 1. Ginger Calico Cat (Orange/yellow base with pink ears and blush)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="65" rx="30" ry="25" fill="#fdb872" />
    <ellipse cx="50" cy="70" rx="18" ry="12" fill="#ffffff" />
    <path d="M 72 60 Q 84 45 80 35 Q 75 35 75 45 Q 75 55 68 64" fill="none" stroke="#fdb872" stroke-width="8" stroke-linecap="round" />
    <circle cx="50" cy="40" r="21" fill="#fdb872" />
    <polygon points="32,29 28,10 42,22" fill="#fdb872" />
    <polygon points="33,26 30,14 39,21" fill="#fda4af" />
    <polygon points="68,29 72,10 58,22" fill="#fdb872" />
    <polygon points="67,26 70,14 61,21" fill="#fda4af" />
    <circle cx="42" cy="40" r="2.5" fill="#1e293b" />
    <circle cx="58" cy="40" r="2.5" fill="#1e293b" />
    <circle cx="43" cy="39" r="0.8" fill="#ffffff" />
    <circle cx="59" cy="39" r="0.8" fill="#ffffff" />
    <circle cx="37" cy="45" r="3" fill="#fecdd3" opacity="0.9" />
    <circle cx="63" cy="45" r="3" fill="#fecdd3" opacity="0.9" />
    <polygon points="49,42 51,42 50,43.5" fill="#fda4af" />
    <path d="M 47 45 Q 50 48 53 45" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" />
  </svg>`,

  // 2. Black Cat (Dark with glowing golden eyes and rosy cheeks)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="65" rx="28" ry="24" fill="#334155" />
    <ellipse cx="50" cy="70" rx="16" ry="10" fill="#475569" />
    <path d="M 70 62 Q 83 48 80 38 Q 75 36 75 46 Q 74 54 68 64" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round" />
    <circle cx="50" cy="40" r="21" fill="#1e293b" />
    <polygon points="32,29 28,10 42,22" fill="#1e293b" />
    <polygon points="33,26 30,14 39,21" fill="#fda4af" />
    <polygon points="68,29 72,10 58,22" fill="#1e293b" />
    <polygon points="67,26 70,14 61,21" fill="#fda4af" />
    <circle cx="42" cy="40" r="3.5" fill="#fde047" />
    <circle cx="58" cy="40" r="3.5" fill="#fde047" />
    <circle cx="42" cy="40" r="1.8" fill="#1e293b" />
    <circle cx="58" cy="40" r="1.8" fill="#1e293b" />
    <circle cx="43.5" cy="38.5" r="0.8" fill="#ffffff" />
    <circle cx="59.5" cy="38.5" r="0.8" fill="#ffffff" />
    <circle cx="36" cy="45" r="2.5" fill="#fda4af" opacity="0.7" />
    <circle cx="64" cy="45" r="2.5" fill="#fda4af" opacity="0.7" />
    <polygon points="49,43 51,43 50,44.5" fill="#fda4af" />
    <path d="M 47 45 Q 50 48 53 45" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" />
  </svg>`,

  // 3. Grey Cat (Muted slate blue British Shorthair style)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="65" rx="30" ry="25" fill="#94a3b8" />
    <ellipse cx="50" cy="70" rx="17" ry="11" fill="#cbd5e1" />
    <path d="M 72 60 Q 84 45 80 35 Q 75 35 75 45 Q 75 55 68 64" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
    <circle cx="50" cy="40" r="21" fill="#94a3b8" />
    <polygon points="32,29 28,10 42,22" fill="#94a3b8" />
    <polygon points="33,26 30,14 39,21" fill="#fda4af" />
    <polygon points="68,29 72,10 58,22" fill="#94a3b8" />
    <polygon points="67,26 70,14 61,21" fill="#fda4af" />
    <circle cx="41" cy="40" r="3" fill="#f97316" />
    <circle cx="59" cy="40" r="3" fill="#f97316" />
    <circle cx="41" cy="40" r="1.5" fill="#1e293b" />
    <circle cx="59" cy="40" r="1.5" fill="#1e293b" />
    <circle cx="42" cy="39" r="0.8" fill="#ffffff" />
    <circle cx="60" cy="39" r="0.8" fill="#ffffff" />
    <circle cx="35" cy="45" r="3" fill="#fda4af" opacity="0.7" />
    <circle cx="65" cy="45" r="3" fill="#fda4af" opacity="0.7" />
    <polygon points="49,43 51,43 50,44.5" fill="#fda4af" />
    <path d="M 47 45 Q 50 48 53 45" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round" />
  </svg>`,

  // 4. Siamese Cat (Cream body, dark ears and paws, glowing cyan eyes)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="65" rx="29" ry="24" fill="#f1f5f9" />
    <ellipse cx="38" cy="85" rx="6" ry="4" fill="#475569" />
    <ellipse cx="62" cy="85" rx="6" ry="4" fill="#475569" />
    <path d="M 71 61 Q 83 48 80 38 Q 75 36 75 46 Q 74 54 68 64" fill="none" stroke="#475569" stroke-width="7" stroke-linecap="round" />
    <circle cx="50" cy="40" r="21" fill="#e2e8f0" />
    <polygon points="32,29 28,10 42,22" fill="#475569" />
    <polygon points="33,26 30,14 39,21" fill="#fda4af" />
    <polygon points="68,29 72,10 58,22" fill="#475569" />
    <polygon points="67,26 70,14 61,21" fill="#fda4af" />
    <ellipse cx="50" cy="43" rx="14" ry="11" fill="#475569" />
    <circle cx="42" cy="39" r="3" fill="#06b6d4" />
    <circle cx="58" cy="39" r="3" fill="#06b6d4" />
    <circle cx="42" cy="39" r="1.5" fill="#1e293b" />
    <circle cx="58" cy="39" r="1.5" fill="#1e293b" />
    <circle cx="43.2" cy="37.8" r="0.8" fill="#ffffff" />
    <circle cx="59.2" cy="37.8" r="0.8" fill="#ffffff" />
    <circle cx="35" cy="45" r="2.5" fill="#f43f5e" opacity="0.4" />
    <circle cx="65" cy="45" r="2.5" fill="#f43f5e" opacity="0.4" />
    <polygon points="49,43 51,43 50,44.5" fill="#fda4af" />
    <path d="M 48 45 Q 50 47 52 45" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" />
  </svg>`,

  // 5. White Cat (Pure white fluffy cat with happy sleeping eyes)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="65" rx="30" ry="25" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" />
    <ellipse cx="50" cy="70" rx="15" ry="10" fill="#fff1f2" />
    <path d="M 72 60 Q 82 45 78 35 Q 73 35 73 45 Q 73 55 68 64" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    <circle cx="50" cy="40" r="21" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" />
    <polygon points="32,29 28,10 42,22" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" />
    <polygon points="33,26 30,14 39,21" fill="#fda4af" />
    <polygon points="68,29 72,10 58,22" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" />
    <polygon points="67,26 70,14 61,21" fill="#fda4af" />
    <path d="M 39 41 Q 42 38 45 41" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 55 41 Q 58 38 61 41" fill="none" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="36" cy="45" r="3.5" fill="#fda4af" opacity="0.9" />
    <circle cx="64" cy="45" r="3.5" fill="#fda4af" opacity="0.9" />
    <polygon points="49,43 51,43 50,44.5" fill="#fda4af" />
    <path d="M 47 45 Q 50 49 53 45" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-linecap="round" />
  </svg>`
];

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full window
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Load cats into Image objects instantly via data-URIs
    const loadedCount = { value: 0 };
    const loadedImages = CAT_SVGS.map((svgString) => {
      const img = new Image();
      img.onload = () => {
        loadedCount.value++;
      };
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
      return img;
    });

    const particleCount = 65; // Balanced for lovely density without lagging
    
    // Initialize particles
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -0.5 - 50, // Start high
      vx: Math.random() * 3 - 1.5,   
      vy: Math.random() * 1.8 + 1.4, // Fair slow fall for graceful cats
      size: Math.random() * 16 + 32, // Large cozy sizes (32px to 48px)
      imageIndex: Math.floor(Math.random() * CAT_SVGS.length),
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 2.5 - 1.25
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const img = loadedImages[p.imageIndex];
        // Draw once vector is loaded or as standard safe render
        if (img && (img.complete || loadedCount.value > 0)) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }

        // Wrap around the bottom
        if (p.y > canvas.height + 40) {
           p.y = -50;
           p.x = Math.random() * canvas.width;
           p.vy = Math.random() * 1.8 + 1.4;
           p.vx = Math.random() * 3 - 1.5;
           p.imageIndex = Math.floor(Math.random() * CAT_SVGS.length);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[100] pointer-events-none" 
    />
  );
};

export default Confetti;