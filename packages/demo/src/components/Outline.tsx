interface Heading {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  result: string | null;
  extractHeadings: (markdown: string) => Heading[];
  removeFrontmatter: (markdown: string) => string;
  viewMode: 'read' | 'print';
  showPrimaryNav: boolean;
}

export const Outline: React.FC<OutlineProps> = ({
  showOutline,
  setShowOutline,
  result,
  extractHeadings,
  removeFrontmatter,
  viewMode,
  showPrimaryNav
}) => {
  if (!showOutline || !result || extractHeadings(removeFrontmatter(result)).length <= 1) {
    return null;
  }

  const headings = extractHeadings(removeFrontmatter(result));

  const handleHeadingClick = (heading: Heading) => {
    // Signal that this is programmatic scrolling to prevent page indicator
    if ((window as any).signalProgrammaticScroll) {
      (window as any).signalProgrammaticScroll();
    }

    // Find the scrollable document container
    const scrollContainer = document.querySelector('.document-scroll-container') as HTMLElement;
    if (!scrollContainer) return;

    // Navigate to heading in current view
    if (viewMode === 'print') {
      // Find the heading in print view
      const printContent = scrollContainer.querySelector('.print-view');
      if (printContent) {
        const headingElements = printContent.querySelectorAll(`h${heading.level}`);
        for (const h of headingElements) {
          if (h.textContent?.includes(heading.text)) {
            // Calculate position relative to scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = h.getBoundingClientRect();
            const navHeight = showPrimaryNav ? 112 : 56;
            
            // Calculate scroll position
            const relativeTop = elementRect.top - containerRect.top;
            const targetScrollTop = scrollContainer.scrollTop + relativeTop - navHeight - 20;
            
            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
            break;
          }
        }
      }
    } else {
      // Find the heading in read view
      const readContent = scrollContainer.querySelector('.rendered-markdown');
      if (readContent) {
        const headingElements = readContent.querySelectorAll(`h${heading.level}`);
        for (const h of headingElements) {
          if (h.textContent?.includes(heading.text)) {
            // Calculate position relative to scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = h.getBoundingClientRect();
            const navHeight = showPrimaryNav ? 112 : 56;
            
            // Calculate scroll position
            const relativeTop = elementRect.top - containerRect.top;
            const targetScrollTop = scrollContainer.scrollTop + relativeTop - navHeight - 20;
            
            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
            break;
          }
        }
      }
    }
  };

  return (
    <aside 
      data-testid="document-outline"
      aria-label="Document outline"
      className="w-80 bg-white border-r border-gray-200 sticky top-0 overflow-y-auto" 
      style={{ 
        height: `calc(100vh - ${showPrimaryNav ? '7rem' : '3.5rem'})` 
      }}
    >
      <nav className="p-4" aria-label="Document sections">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900" data-testid="outline-heading">Document Outline</h3>
          <button
            data-testid="outline-close-button"
            onClick={() => setShowOutline(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close outline"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {headings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No headings found</p>
        ) : (
          <div className="space-y-1" role="list" data-testid="outline-list">
            {headings.map((heading, index) => (
              <button
                key={index}
                data-testid={`outline-item-${index}`}
                data-heading-level={heading.level}
                onClick={() => handleHeadingClick(heading)}
                className={`w-full text-left px-2 py-1 text-sm rounded transition-colors hover:bg-gray-100 ${
                  heading.level === 1 ? 'font-medium text-gray-900' :
                  heading.level === 2 ? 'font-normal text-gray-800 ml-3' :
                  'font-normal text-gray-700 ml-6'
                }`}
                style={{ 
                  paddingLeft: `${Math.max(0.5, (heading.level - 1) * 0.75)}rem` 
                }}
              >
                {heading.text}
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
};