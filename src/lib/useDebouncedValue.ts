import { useEffect, useState } from 'react';

/** 입력값이 delay ms 동안 바뀌지 않으면 갱신. 주소 검색처럼 타이핑마다 API를 부르지 않게 할 때 사용 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
