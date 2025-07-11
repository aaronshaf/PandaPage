import React, { useState, useEffect, useRef, useCallback } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  showOutline: boolean;
  result: string | null;
  extractHeadings: (markdown: string) => Heading[];
  extractHeadingsFromDocument?: (document: any) => Heading[];
  removeFrontmatter: (markdown: string) => string;
  viewMode: "read" | "print";
  showPrimaryNav: boolean;
  parsedDocument?: any;
}

export const Outline: React.FC<OutlineProps> = ({
  showOutline,
  result,
  extractHeadings,
  extractHeadingsFromDocument,
  removeFrontmatter,
  viewMode,
  showPrimaryNav,
  parsedDocument,
}) => {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const outlineRef = useRef<HTMLDivElement>(null);

  // Prefer extracting headings from parsed document structure
  const headings =
    parsedDocument && extractHeadingsFromDocument
      ? extractHeadingsFromDocument(parsedDocument)
      : result
        ? extractHeadings(removeFrontmatter(result))
        : [];

  // Set up intersection observer for active section highlighting
  useEffect(() => {
    if (!showOutline || headings.length <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.textContent || "")
          .filter((text) => text.length > 0);

        if (visibleHeadings.length > 0) {
          // Find the first visible heading in our headings list
          const firstVisible = headings.find((h) => visibleHeadings.includes(h.text));
          if (firstVisible) {
            setActiveHeading(firstVisible.text);
          }
        }
      },
      {
        rootMargin: `-${showPrimaryNav ? "112px" : "56px"} 0px -50% 0px`,
        threshold: 0.1,
      }
    );

    // Observe all headings in the document
    const scrollContainer = document.querySelector(".document-scroll-container");
    if (scrollContainer) {
      const contentSelector = viewMode === "print" ? ".print-view" : ".rendered-markdown";
      const content = scrollContainer.querySelector(contentSelector);
      if (content) {
        const headingElements = content.querySelectorAll("h1, h2, h3, h4, h5, h6");
        headingElements.forEach((heading) => observer.observe(heading));
      }
    }

    return () => observer.disconnect();
  }, [showOutline, headings, viewMode, showPrimaryNav]);

  const handleHeadingClick = useCallback((heading: Heading) => {
    // Signal that this is programmatic scrolling to prevent page indicator
    if ((window as any).signalProgrammaticScroll) {
      (window as any).signalProgrammaticScroll();
    }

    // Find the scrollable document container
    const scrollContainer = document.querySelector(".document-scroll-container") as HTMLElement;
    if (!scrollContainer) return;

    // Navigate to heading in current view
    if (viewMode === "print") {
      // Find the heading in print view
      const printContent = scrollContainer.querySelector(".print-view");
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
              behavior: "smooth",
            });
            break;
          }
        }
      }
    } else {
      // Find the heading in read view
      const readContent = scrollContainer.querySelector(".rendered-markdown");
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
              behavior: "smooth",
            });
            break;
          }
        }
      }
    }
  }, [viewMode, showPrimaryNav]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (headings.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, headings.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setFocusedIndex(headings.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < headings.length) {
          handleHeadingClick(headings[focusedIndex]);
        }
        break;
    }
  }, [headings, focusedIndex, handleHeadingClick]);

  // Auto-focus the first item when keyboard navigation starts
  useEffect(() => {
    if (focusedIndex >= 0 && outlineRef.current) {
      const focusedButton = outlineRef.current.querySelector(
        `[data-testid="outline-item-${focusedIndex}"]`
      ) as HTMLButtonElement;
      if (focusedButton) {
        focusedButton.focus();
      }
    }
  }, [focusedIndex]);

  if (!showOutline || headings.length <= 1) {
    return null;
  }

  return (
    <aside
      ref={outlineRef}
      data-testid="document-outline"
      aria-label="Document outline"
      className="w-80 bg-white border-r border-gray-200 sticky top-0 overflow-y-auto"
      style={{
        height: `calc(100vh - ${showPrimaryNav ? "7rem" : "3.5rem"})`,
      }}
      onKeyDown={handleKeyDown}
    >
      <nav className="p-4 pt-16" aria-label="Document sections">
        <h3 className="text-sm font-medium text-gray-900 mb-3" data-testid="outline-heading">
          Document Outline
        </h3>
        {headings.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No headings found</p>
        ) : (
          <div 
            className="space-y-1" 
            role="tree" 
            data-testid="outline-list"
            aria-label="Document sections"
          >
            {headings.map((heading, index) => {
              const isActive = activeHeading === heading.text;
              const isFocused = focusedIndex === index;
              
              return (
                <button
                  key={index}
                  data-testid={`outline-item-${index}`}
                  data-heading-level={heading.level}
                  onClick={() => handleHeadingClick(heading)}
                  role="treeitem"
                  aria-level={heading.level}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={isFocused ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  className={`
                    w-full text-left px-2 py-1 text-sm rounded transition-all duration-200 
                    relative group hover:bg-blue-50 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:ring-offset-1
                    ${isActive 
                      ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500" 
                      : heading.level === 1
                        ? "font-medium text-gray-900 hover:text-blue-700"
                        : heading.level === 2
                          ? "font-normal text-gray-800 hover:text-blue-700"
                          : "font-normal text-gray-700 hover:text-blue-700"
                    }
                  `}
                  style={{
                    paddingLeft: `${Math.max(0.5, (heading.level - 1) * 0.75)}rem`,
                  }}
                >
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  <span className="block truncate">{heading.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
};
