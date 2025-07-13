import type { Image } from "@browser-document-viewer/parser";

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function createLazyImage(image: Image, doc: Document): HTMLElement {
  const figure = doc.createElement("figure");
  figure.className = "image-figure mb-4";
  figure.setAttribute("role", "img");

  const img = doc.createElement("img");
  img.className = "max-w-full h-auto";

  // Create placeholder for lazy loading
  const placeholderSrc =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIgc3Ryb2tlPSIjZTFlNWU5Ii8+PHRleHQgeD0iMTAwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Loading...</vdGV4dD48L3N2Zz4=";

  if (image.data) {
    const base64 = arrayBufferToBase64(image.data);
    const realSrc = `data:${image.mimeType};base64,${base64}`;

    // Enable lazy loading for better performance
    img.src = placeholderSrc;
    img.setAttribute("data-src", realSrc);
    img.loading = "lazy";
    img.className += " lazy-image";

    // Add intersection observer for better lazy loading control
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyImg = entry.target as HTMLImageElement;
              const src = lazyImg.getAttribute("data-src");
              if (src) {
                lazyImg.src = src;
                lazyImg.removeAttribute("data-src");
                lazyImg.classList.remove("lazy-image");
                observer.unobserve(lazyImg);
              }
            }
          });
        },
        {
          rootMargin: "100px", // Start loading 100px before the image comes into view
        },
      );

      // Observe the image after a short delay to allow DOM insertion
      setTimeout(() => observer.observe(img), 100);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = realSrc;
    }
  }

  if (image.alt) {
    img.alt = image.alt;
    figure.setAttribute("aria-label", image.alt);
  } else {
    img.alt = "Document image";
    figure.setAttribute("aria-label", "Document image");
  }

  // Use CSS dimensions for proper high-DPI display support
  if (image.width) {
    img.style.width = `${image.width}px`;
  }

  if (image.height) {
    img.style.height = `${image.height}px`;
  }

  figure.appendChild(img);

  // Don't automatically create captions from alt text
  // Alt text is for accessibility, not captions
  // If a caption is needed, it should be explicitly provided in the document

  return figure;
}
