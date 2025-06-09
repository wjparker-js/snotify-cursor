import { useState, useEffect } from 'react';

export function useMobileResponsive() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 700);
    }

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, windowWidth };
} 