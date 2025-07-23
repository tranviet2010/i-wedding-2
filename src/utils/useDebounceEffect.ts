import { useEffect } from 'react';

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined);
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}
