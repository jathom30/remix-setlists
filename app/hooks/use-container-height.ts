import { useEffect, useRef, useState } from "react";

export const useContainerHeight = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [top, setTop] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTop(entry.target.getBoundingClientRect().top);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return { containerRef, top };
};
