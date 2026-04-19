import { useState, useEffect, useRef } from 'react';

const useScrollAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Optionally unobserve after animation triggers
        if (options.once !== false) {
          observer.unobserve(entry.target);
        }
      }
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px',
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [ref, isVisible];
};

export default useScrollAnimation;
