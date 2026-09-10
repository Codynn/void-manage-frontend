import { forwardRef, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";

export interface ContractLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_CONTRACT_LAYOUT: ContractLayout = {
  x: 5,
  y: 8,
  width: 90,
  height: 80,
};

// Fixed authoring canvas size (matches public/letterhead.svg viewBox, A4 at 96dpi).
// The canvas is always laid out at this exact pixel size, then uniformly scaled
// with a CSS transform to fit whatever container it's rendered in - this keeps
// font sizes and positions looking identical everywhere (edit preview, view
// dialogs, intern page), instead of drifting with the container's raw width.
const DESIGN_WIDTH = 794;
const DESIGN_HEIGHT = 1123;

interface Props {
  layout: ContractLayout;
  editableLayout?: boolean;
  onLayoutChange?: (layout: ContractLayout) => void;
  children: React.ReactNode;
  // Renders a tiled "NOT VERIFIED" watermark over the whole page - baked into
  // the live DOM (not just exports) so a screenshot of an unapproved contract
  // always carries it too.
  watermark?: boolean;
}

const Watermark = () => (
  <div className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden">
    <div className="absolute left-1/2 top-1/2 flex w-[1400px] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] flex-wrap justify-center gap-x-10 gap-y-10">
      {Array.from({ length: 48 }).map((_, i) => (
        <span key={i} className="whitespace-nowrap text-2xl font-bold text-red-500/25">
          NOT VERIFIED
        </span>
      ))}
    </div>
  </div>
);

const setRef = <T,>(ref: React.ForwardedRef<T> | undefined, value: T | null) => {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.MutableRefObject<T | null>).current = value;
};

// A4 letterhead canvas. Positions `children` on top of the letterhead using
// percentage-based layout, optionally draggable/resizable when editableLayout is set.
const LetterheadCanvas = forwardRef<HTMLDivElement, Props>(
  ({ layout, editableLayout, onLayoutChange, children, watermark }, forwardedRef) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const node = wrapperRef.current;
      if (!node) return;

      const updateScale = () => setScale(node.clientWidth / DESIGN_WIDTH);

      updateScale();
      const observer = new ResizeObserver(updateScale);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const contentBox = (
      <div className="h-full w-full overflow-visible border-2 border-dashed border-primary/40 bg-white/70">
        {children}
      </div>
    );

    return (
      <div
        ref={wrapperRef}
        className="relative mx-auto w-full max-w-[794px] overflow-visible"
        style={{ aspectRatio: `${DESIGN_WIDTH} / ${DESIGN_HEIGHT}` }}
      >
        <div
          ref={(node) => setRef(forwardedRef, node)}
          className="absolute left-0 top-0 origin-top-left overflow-visible border bg-white shadow-sm"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <img
            src="/letterhead.svg"
            alt="Void Nepal letterhead"
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            draggable={false}
          />

          {editableLayout ? (
            <Rnd
              scale={scale || 1}
              bounds="parent"
              size={{
                width: (layout.width / 100) * DESIGN_WIDTH,
                height: (layout.height / 100) * DESIGN_HEIGHT,
              }}
              position={{
                x: (layout.x / 100) * DESIGN_WIDTH,
                y: (layout.y / 100) * DESIGN_HEIGHT,
              }}
              onDragStop={(_e, d) => {
                onLayoutChange?.({
                  ...layout,
                  x: (d.x / DESIGN_WIDTH) * 100,
                  y: (d.y / DESIGN_HEIGHT) * 100,
                });
              }}
              onResizeStop={(_e, _dir, ref, _delta, position) => {
                onLayoutChange?.({
                  x: (position.x / DESIGN_WIDTH) * 100,
                  y: (position.y / DESIGN_HEIGHT) * 100,
                  width: (ref.offsetWidth / DESIGN_WIDTH) * 100,
                  height: (ref.offsetHeight / DESIGN_HEIGHT) * 100,
                });
              }}
            >
              {contentBox}
            </Rnd>
          ) : (
            <div
              className="absolute overflow-visible"
              style={{
                left: `${layout.x}%`,
                top: `${layout.y}%`,
                width: `${layout.width}%`,
                minHeight: `${layout.height}%`,
              }}
            >
              {children}
            </div>
          )}

          {watermark && <Watermark />}
        </div>
      </div>
    );
  }
);

LetterheadCanvas.displayName = "LetterheadCanvas";

export default LetterheadCanvas;
