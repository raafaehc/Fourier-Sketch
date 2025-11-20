import { useEffect, useState } from 'react';

export function useResizeObserver<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [rect, setRect] = useState<DOMRectReadOnly>();

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      const entry = entries[0];
      setRect(entry.contentRect);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return { ref: setNode, rect } as const;
}
