import { useState, useEffect, useRef } from 'react';

export const useScrollSpy = (ids: string[], offset: number = 0) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    const root = document.querySelector('.public-main');

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId((currentId) => {
              if (currentId !== entry.target.id) {
                return entry.target.id;
              }
              return currentId;
            });
          }
        });
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
