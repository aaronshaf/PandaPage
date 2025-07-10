interface PageTrackingOptions {
  viewMode: 'read' | 'print';
  setCurrentPage: (page: number) => void;
  setScrollProgress: (progress: number) => void;
  setShowPageIndicator: (show: boolean) => void;
  setScrollbarHeight: (height: number) => void;
  setScrollbarOffset: (offset: number) => void;
  isProgrammaticScroll: boolean;
  setIsProgrammaticScroll: (value: boolean) => void;
}

export function setupPageTracking(options: PageTrackingOptions): () => void {
  const {
    viewMode,
    setCurrentPage,
    setScrollProgress,
    setShowPageIndicator,
    setScrollbarHeight,
    setScrollbarOffset,
    isProgrammaticScroll,
    setIsProgrammaticScroll
  } = options;

  if (viewMode !== 'print') return () => {};

  let animationFrameId: number;
  let isScrolling = false;

  const setupScrollTracking = () => {
    // Find the scrollable container (the document content area)
    const scrollContainer = document.querySelector('.document-scroll-container');
    if (!scrollContainer) {
      console.warn('No .document-scroll-container found for page tracking');
      return;
    }

    // Calculate scrollbar dimensions for better indicator positioning
    const updateScrollbarDimensions = () => {
      const container = scrollContainer as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const totalScrollHeight = container.scrollHeight;
      const visibleHeight = container.clientHeight;
      
      if (totalScrollHeight > visibleHeight) {
        // Calculate scrollbar height as a proportion of visible area
        const scrollbarRatio = visibleHeight / totalScrollHeight;
        const calculatedScrollbarHeight = containerRect.height * scrollbarRatio;
        setScrollbarHeight(calculatedScrollbarHeight);
        
        // Calculate offset from top of viewport to container
        setScrollbarOffset(containerRect.top);
      } else {
        setScrollbarHeight(0);
        setScrollbarOffset(0);
      }
    };

    const handleScrollRaf = () => {
      const container = scrollContainer as HTMLElement;
      const pages = container.querySelectorAll('.print-page');
      let currentVisiblePage = 1;
      
      // Debug logging for large documents
      if (pages.length === 0) {
        console.warn('No .print-page elements found for page tracking');
        return;
      }
      
      // More robust page detection
      const containerRect = container.getBoundingClientRect();
      const containerMiddle = containerRect.top + containerRect.height / 2;
      let closestDistance = Infinity;
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page) continue;
        const rect = page.getBoundingClientRect();
        
        // Calculate distance from page center to container center
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - containerMiddle);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          currentVisiblePage = i + 1;
        }
      }
      
      setCurrentPage(currentVisiblePage);
      
      // Update scroll progress for page indicator positioning
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);
      
      // Update scrollbar dimensions
      updateScrollbarDimensions();
      
      // Show page indicator temporarily when manually scrolling (but not programmatic scroll)
      const shouldShowIndicator = !isProgrammaticScroll && pages.length > 1;
      setShowPageIndicator(shouldShowIndicator);
      
      if (shouldShowIndicator) {
        clearTimeout((window as any).pageIndicatorTimeout);
        (window as any).pageIndicatorTimeout = window.setTimeout(() => {
          setShowPageIndicator(false);
        }, 2000);
      }
      
      // Reset programmatic scroll flag after a short delay
      if (isProgrammaticScroll) {
        setTimeout(() => {
          setIsProgrammaticScroll(false);
        }, 100);
      }
      
      isScrolling = false;
    };

    const handleScroll = (event: Event) => {
      if (!isScrolling) {
        isScrolling = true;
        animationFrameId = requestAnimationFrame(handleScrollRaf);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollbarDimensions);
    
    // Initial setup - mark as programmatic to avoid showing page indicator
    setIsProgrammaticScroll(true);
    updateScrollbarDimensions();
    handleScrollRaf();
    // Reset programmatic flag after initial setup
    setTimeout(() => setIsProgrammaticScroll(false), 100);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollbarDimensions);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      clearTimeout((window as any).pageIndicatorTimeout);
    };
  };

  // Small delay to ensure DOM elements are rendered
  const timeoutId = setTimeout(setupScrollTracking, 100);
  
  return () => {
    clearTimeout(timeoutId);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

export function calculatePrintScale(): number {
  if (typeof window === 'undefined') return 1;
  
  const containerWidth = window.innerWidth - 320; // Account for potential sidebar
  const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
  const maxScale = Math.min(containerWidth / pageWidth, 1.2); // Max 120%
  return Math.max(0.4, maxScale * 0.83); // Use 83% of available width for 100% default scale, min 40%
}

export function checkMobile(): boolean {
  return window.innerWidth < 640;
}

export function calculatePageIndicatorTop(options: {
  scrollProgress: number;
  scrollbarHeight: number;
  scrollbarOffset: number;
  navHeight: number;
}): string {
  const { scrollProgress, scrollbarHeight, scrollbarOffset, navHeight } = options;
  
  if (typeof window === 'undefined') return `${navHeight + 20}px`;
  
  // Use scrollbar dimensions for precise positioning
  if (scrollbarHeight > 0) {
    // Position relative to the scroll container area
    const containerTop = scrollbarOffset;
    const containerHeight = scrollbarHeight * (1 / Math.max(0.1, scrollProgress + 0.1)); // Approximate total height
    const usableHeight = Math.max(containerHeight - 80, 100); // Leave room for indicator itself
    
    // Center the indicator within the scrollbar thumb area
    const scrollbarThumbPosition = containerTop + (scrollProgress * usableHeight);
    const calculatedTop = Math.max(
      navHeight + 10, 
      Math.min(
        scrollbarThumbPosition, 
        window.innerHeight - 80
      )
    );
    
    return `${calculatedTop}px`;
  } else {
    // Fallback to old calculation
    const viewportHeight = window.innerHeight;
    const indicatorHeight = 60;
    const padding = 20;
    const availableSpace = viewportHeight - navHeight - indicatorHeight - (padding * 2);
    const travelSpace = Math.max(0, availableSpace);
    const calculatedTop = navHeight + padding + (scrollProgress * travelSpace);
    
    return `${calculatedTop}px`;
  }
}