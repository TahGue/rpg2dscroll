import { useCallback, useEffect, useRef, useState } from 'react';
import { getMapPosition } from '@malik/shared';

const MIN_SCALE = 0.75;
const MAX_SCALE = 2.8;

export interface MapViewport {
  scale: number;
  panX: number;
  panY: number;
}

export function useMapViewport(focusNodeId: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<MapViewport>({ scale: 1, panX: 0, panY: 0 });
  const dragRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomBy = useCallback((delta: number, anchorX?: number, anchorY?: number) => {
    setViewport((v) => {
      const nextScale = clampScale(v.scale + delta);
      if (!containerRef.current || nextScale === v.scale) return v;

      const rect = containerRef.current.getBoundingClientRect();
      const ax = anchorX ?? rect.width / 2;
      const ay = anchorY ?? rect.height / 2;
      const ratio = nextScale / v.scale;
      return {
        scale: nextScale,
        panX: ax - (ax - v.panX) * ratio,
        panY: ay - (ay - v.panY) * ratio,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setViewport({ scale: 1, panX: 0, panY: 0 });
  }, []);

  const focusNode = useCallback((nodeId: string, scale = 1.45) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos = getMapPosition(nodeId);
    const px = (pos.x / 100) * rect.width;
    const py = (pos.y / 100) * rect.height;
    const s = clampScale(scale);
    setViewport({
      scale: s,
      panX: rect.width / 2 - px * s,
      panY: rect.height / 2 - py * s,
    });
  }, []);

  useEffect(() => {
    if (focusNodeId) focusNode(focusNodeId);
  }, [focusNodeId, focusNode]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const anchorX = e.clientX - rect.left;
      const anchorY = e.clientY - rect.top;
      zoomBy(e.deltaY > 0 ? -0.12 : 0.12, anchorX, anchorY);
    },
    [zoomBy],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    setViewport((v) => ({ ...v, panX: v.panX + dx, panY: v.panY + dy }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  return {
    containerRef,
    viewport,
    zoomIn: () => zoomBy(0.2),
    zoomOut: () => zoomBy(-0.2),
    reset,
    focusNode,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp },
  };
}
