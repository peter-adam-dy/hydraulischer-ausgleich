import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ data, onSave, delay = 800, enabled = true }: UseAutoSaveOptions<T>) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const initialRef = useRef(true);

  dataRef.current = data;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(dataRef.current);
      setLastSaved(new Date());
    } catch {
      // Save failed — silently ignore
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    // Skip the initial render (don't save on mount)
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, delay, enabled]);

  return { saving, lastSaved };
}
