import { useEffect, useState } from 'react';
import type { GameScreen } from '@/store/gameStore';

export function ScreenTransition({ screen, children }: { screen: GameScreen; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [displayScreen, setDisplayScreen] = useState(screen);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setDisplayScreen(screen);
      setVisible(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [screen]);

  if (displayScreen !== screen && !visible) return null;

  return (
    <div
      className="absolute inset-0 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
