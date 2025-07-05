interface Heading {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  showOutline: boolean;
  result: string | null;
  extractHeadings: (markdown: string) => Heading[];
  removeFrontmatter: (markdown: string) => string;
  viewMode: 'read' | 'print';
  showPrimaryNav: boolean;
}

export const Outline: React.FC<OutlineProps> = ({
  showOutline,
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
    <div 
      className="w-64 bg-white border-r border-gray-200 sticky top-0 overflow-y-auto" 
      style={{ 
        height: `calc(100vh - ${showPrimaryNav ? '7rem' : '3.5rem'})` 
      }}
    >
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Document Outline</h3>
        {headings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No headings found</p>
        ) : (
          <div className="space-y-1">
            {headings.map((heading, index) => (
              <button
                key={index}
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
      </div>
    </div>
  );
};