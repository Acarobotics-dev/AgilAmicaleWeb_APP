import { useEffect, useState } from "react";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}


// Combine class names with Tailwind merge support
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
