// src/app/(users)/dashboard/hooks/useWidgetGrid.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardWidgets, Widget, WidgetId, LAYOUT_STORAGE_KEY } from '../types';

const sanitizeLayout = (data: Record<string, unknown>): DashboardWidgets | null => {
  if (!data || !data.local || !data.session) return null;
  const l = data.local as Widget;
  const s = data.session as Widget;
  return {
    local: { id: 'local', x: Number(l.x) || 0, y: Number(l.y) || 0, w: Number(l.w) || 3, h: Number(l.h) || 3, fontIdx: Number(l.fontIdx) || 0 },
    session: { id: 'session', x: Number(s.x) || 0, y: Number(s.y) || 3, w: Number(s.w) || 3, h: Number(s.h) || 3, fontIdx: Number(s.fontIdx) || 0 }
  };
};

export function useWidgetGrid(isPro: boolean, supabase: SupabaseClient) {
  const [widgets, setWidgets] = useState<DashboardWidgets>({
    local: { id: 'local', x: 0, y: 0, w: 3, h: 3, fontIdx: 0 },
    session: { id: 'session', x: 0, y: 3, w: 3, h: 3, fontIdx: 0 }
  });
  
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  
  const gridRef = useRef<HTMLDivElement | null>(null);
  const widgetsRef = useRef<DashboardWidgets>(widgets);
  const rafDragRef = useRef<number | null>(null);
  const rafResizeRef = useRef<number | null>(null);

  useEffect(() => { widgetsRef.current = widgets; }, [widgets]);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.desk_layout) {
          const sanitized = sanitizeLayout(user.user_metadata.desk_layout);
          if (sanitized) { setWidgets(sanitized); setLayoutLoaded(true); return; }
        }
      } catch (e) {}

      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        try { 
          const parsed = JSON.parse(savedLayout); 
          const sanitized = sanitizeLayout(parsed); 
          if (sanitized) setWidgets(sanitized); 
        } catch (e) {}
      }
      setLayoutLoaded(true);
    };
    loadLayout();
  }, [supabase]);

  useEffect(() => {
    if (!layoutLoaded || !isPro) return;
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(widgets));
    const timeoutId = setTimeout(async () => {
      try { 
        const { data: { user } } = await supabase.auth.getUser(); 
        if (user) await supabase.auth.updateUser({ data: { desk_layout: widgets } });
      } catch (e) {}
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [widgets, layoutLoaded, isPro, supabase]);

  const checkOverlap = useCallback((rect1: Omit<Widget, 'id' | 'fontIdx'>, rect2: Omit<Widget, 'id' | 'fontIdx'>) => {
    return (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, id: WidgetId) => {
    if (!isPro) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('widgetId', id);
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const activeWidget = widgetsRef.current[id];
    const cellW = rect.width / activeWidget.w;
    const cellH = rect.height / activeWidget.h;
    const offsetX = Math.floor((e.clientX - rect.left) / cellW);
    const offsetY = Math.floor((e.clientY - rect.top) / cellH);
    e.dataTransfer.setData('offsetX', offsetX.toString());
    e.dataTransfer.setData('offsetY', offsetY.toString());
    
    if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    rafDragRef.current = requestAnimationFrame(() => setDraggingId(id));
  }, [isPro]);

  const handleDragEnd = useCallback(() => {
    if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    rafDragRef.current = requestAnimationFrame(() => setDraggingId(null));
  }, []);

  const handleDropOnGrid = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setDraggingId(null);
    const id = e.dataTransfer.getData('widgetId') as WidgetId;
    if (!id || !gridRef.current) return;

    const offsetX = parseInt(e.dataTransfer.getData('offsetX') || '0', 10);
    const offsetY = parseInt(e.dataTransfer.getData('offsetY') || '0', 10);
    const gridRect = gridRef.current.getBoundingClientRect();
    const dropCellX = Math.floor((e.clientX - gridRect.left) / (gridRect.width / 7));
    const dropCellY = Math.floor((e.clientY - gridRect.top) / (gridRect.height / 7));

    setWidgets(prev => {
      const finalX = dropCellX - offsetX; 
      const finalY = dropCellY - offsetY;
      const safeX = Math.max(0, Math.min(finalX, 7 - prev[id].w)); 
      const safeY = Math.max(0, Math.min(finalY, 7 - prev[id].h));
      const proposedWidget = { ...prev[id], x: safeX, y: safeY };
      const siblingId = id === 'local' ? 'session' : 'local';
      
      if (checkOverlap(proposedWidget, prev[siblingId])) return prev; 
      
      if (prev[id].x === proposedWidget.x && prev[id].y === proposedWidget.y) return prev;
      return { ...prev, [id]: proposedWidget };
    });
  }, [checkOverlap]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, id: WidgetId) => {
    if (!isPro) return;
    e.preventDefault(); 
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId); 

    const startX = e.clientX; 
    const startY = e.clientY;
    if (!gridRef.current) return;
    const { width, height } = gridRef.current.getBoundingClientRect();
    const cellW = width / 7; 
    const cellH = height / 7;
    const startWidget = { ...widgetsRef.current[id] };

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (rafResizeRef.current) cancelAnimationFrame(rafResizeRef.current);
      rafResizeRef.current = requestAnimationFrame(() => {
        const newW = Math.max(1, Math.min(7 - startWidget.x, startWidget.w + Math.round((moveEvent.clientX - startX) / cellW)));
        const newH = Math.max(1, Math.min(7 - startWidget.y, startWidget.h + Math.round((moveEvent.clientY - startY) / cellH)));
        
        setWidgets(prev => {
          if (prev[id].w === newW && prev[id].h === newH) return prev;
          const proposedWidget = { ...prev[id], w: newW, h: newH };
          const siblingId = id === 'local' ? 'session' : 'local';
          if (checkOverlap(proposedWidget, prev[siblingId])) return prev; 
          return { ...prev, [id]: proposedWidget };
        });
      });
    };

    const onPointerUpOrCancel = (upEvent: PointerEvent) => {
      if (rafResizeRef.current) cancelAnimationFrame(rafResizeRef.current);
      if (target.hasPointerCapture(upEvent.pointerId)) {
        target.releasePointerCapture(upEvent.pointerId);
      }
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', onPointerUpOrCancel);
      target.removeEventListener('pointercancel', onPointerUpOrCancel);
    };

    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUpOrCancel);
    target.addEventListener('pointercancel', onPointerUpOrCancel);
  }, [isPro, checkOverlap]);

  const handleToggleLocalFont = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isPro) return;
    e.stopPropagation();
    setWidgets(prev => ({ ...prev, local: { ...prev.local, fontIdx: (prev.local.fontIdx + 1) % 4 } }));
  }, [isPro]);

  const handleToggleSessionFont = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isPro) return;
    e.stopPropagation();
    setWidgets(prev => ({ ...prev, session: { ...prev.session, fontIdx: (prev.session.fontIdx + 1) % 4 } }));
  }, [isPro]);

  return {
    widgets,
    draggingId,
    gridRef,
    layoutLoaded,
    handleDragStart,
    handleDragEnd,
    handleDropOnGrid,
    handleResizePointerDown,
    handleToggleLocalFont,
    handleToggleSessionFont,
    setWidgets
  };
}
