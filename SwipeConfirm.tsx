import { useEffect, useRef, useState } from 'react';

interface SwipeConfirmProps {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SwipeConfirm = ({ label, onConfirm, onCancel }: SwipeConfirmProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const beginDrag = () => setDragging(true);

  const updateFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const pct = (x / rect.width) * 100;
    setProgress(pct);
  };

  const endDrag = () => {
    setDragging(false);
    if (progress > 90) {
      setProgress(0);
      onConfirm();
    } else {
      setProgress(0);
    }
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const clientX = e instanceof TouchEvent ? e.touches[0].clientX : (e as MouseEvent).clientX;
      updateFromClientX(clientX);
    };
    const onUp = () => endDrag();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, progress]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm alert"
    >
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm text-center">
        <p className="mb-4 font-semibold">{label}</p>
        <div ref={trackRef} className="relative bg-muted h-12 rounded-full overflow-hidden select-none">
          <div className="absolute inset-y-0 left-0 bg-primary/40" style={{ width: `${progress}%` }} />
          <button
            onMouseDown={beginDrag}
            onTouchStart={beginDrag}
            className="absolute top-1 left-1 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md"
            style={{ left: `calc(${progress}% - 20px)` }}
            aria-label="Slide to confirm"
          >
            ▶
          </button>
          <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Swipe to confirm
          </span>
        </div>
        <div className="flex justify-between mt-4">
          <button className="text-sm text-muted-foreground underline" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};