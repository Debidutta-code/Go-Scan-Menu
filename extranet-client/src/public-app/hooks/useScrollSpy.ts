import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (ids: string[], offset: number = 0) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);
  const intersectingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    const root = document.querySelector('.public-main');

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingIds.current.add(entry.target.id);
          } else {
            intersectingIds.current.delete(entry.target.id);
          }
        });

        // Find the first ID in the ordered 'ids' array that is currently intersecting
        const firstIntersectingId = ids.find((id) => intersectingIds.current.has(id));
        if (firstIntersectingId) {
          setActiveId(firstIntersectingId);
        }
      },
      {
        root: root,
        rootMargin: `-${offset}px 0px -70% 0px`,
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ids, offset]);

  return activeId;
};
