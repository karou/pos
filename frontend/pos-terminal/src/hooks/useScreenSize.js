import { useState, useEffect } from 'react';

/**
 * Screen size breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

/**
 * Custom hook to detect screen size and breakpoints
 * @returns {Object} Screen size information
 */
const useScreenSize = () => {
  // Initialize with window dimensions or reasonable defaults for SSR
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  // Function to update screen size
  const updateScreenSize = () => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  
  // Add event listener for resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('resize', updateScreenSize);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);
  
  // Determine current breakpoint
  const getBreakpoint = () => {
    const { width } = screenSize;
    
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS.xxl) return 'xl';
    return 'xxl';
  };
  
  // Helper functions to check current breakpoint
  const isXs = () => getBreakpoint() === 'xs';
  const isSm = () => getBreakpoint() === 'sm';
  const isMd = () => getBreakpoint() === 'md';
  const isLg = () => getBreakpoint() === 'lg';
  const isXl = () => getBreakpoint() === 'xl';
  const isXxl = () => getBreakpoint() === 'xxl';
  
  // Check if screen is at least a certain breakpoint
  const isAtLeast = (breakpoint) => {
    const currentWidth = screenSize.width;
    return currentWidth >= BREAKPOINTS[breakpoint];
  };
  
  // Check if screen is at most a certain breakpoint
  const isAtMost = (breakpoint) => {
    const currentWidth = screenSize.width;
    return currentWidth < BREAKPOINTS[breakpoint === 'xs' ? 'sm' : breakpoint];
  };
  
  // Check if mobile screen (xs or sm)
  const isMobile = () => isAtMost('md');
  
  // Check if tablet screen (md)
  const isTablet = () => getBreakpoint() === 'md';
  
  // Check if desktop screen (lg or above)
  const isDesktop = () => isAtLeast('lg');
  
  return {
    width: screenSize.width,
    height: screenSize.height,
    breakpoint: getBreakpoint(),
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isAtLeast,
    isAtMost,
    isMobile,
    isTablet,
    isDesktop
  };
};

export default useScreenSize;