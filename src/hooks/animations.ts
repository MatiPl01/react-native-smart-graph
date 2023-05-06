import { useEffect, useReducer } from 'react';

// TODO - replace this later with an implementation running on the UI thread (not in JS)
export const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  autostart = false
) => {
  let lastUpdateTime = Date.now();
  let animationFrameRef: number;

  useEffect(() => {
    setActive(autostart);

    return () => {
      setActive(false);
    };
  }, [autostart]);

  const animate = () => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;
    callback(deltaTime);
    animationFrameRef = requestAnimationFrame(animate);
  };

  const setActive = (value: boolean): boolean => {
    if (value) {
      animationFrameRef = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameRef);
    }
    return value;
  };

  const reducer = (_: boolean, value: boolean) => setActive(value);

  const [isActive, dispatch] = useReducer(reducer, autostart, active => active);

  return [isActive, dispatch] as const;
};
