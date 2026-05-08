// src/app/(users)/dashboard/hooks/useWidgetGrid.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { DashboardWidgets, Widget, LAYOUT_STORAGE_KEY } from '../types';

const sanitizeLayout = (data: Record<string, any>): DashboardWidgets | null => {
  if (!data || !data.local || !data.session) return null;
  return {
    local: { id: 'local', x: Number(data.local.x) || 0, y: Number(data.local.y) || 0, w: Number(data.local.w) || 3, h: Number(data.local.h) || 3, fontIdx: Number(data.local.fontIdx) || 0 },
    session: { id: 'session', x: Number(data.session.x) || 0, y: Number(data.session.y) || 3, w: Number(data.session.w) || 3, h: Number(data.session.h) || 3, fontIdx: Number(data.session.fontIdx) || 0 }
  };
};

export function useWidgetGrid(isPro: boolean, supabase: SupabaseClient) {
  const [widgets, setWidgets] = useState<DashboardWidgets>({
    local: { id: 'local', x: 0, y: 0, w: 3, h: 3, fontIdx: 0 },
    session: { id: 'session', x: 0, y: 3, w: 3, h: 3, fontIdx: 0 }
  });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  
  const gridRef = useRef<HTMLDivElement | null>(null);
  const widgetsRef = useRef<DashboardWidgets>(widgets);
  const rafRef = useRef<number | null>(null);

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

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, id: 'local' | 'session') => {
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
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setDraggingId(id));
  }, [isPro]);

  const handleDragEnd = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setDraggingId(null));
  }, []);

  const handleDropOnGrid = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setDraggingId(null);
    const id = e.dataTransfer.getData('widgetId') as 'local' | 'session';
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
      if (checkOverlap(proposedWidget, prev[id === 'local' ? 'session' : 'local'])) return prev; 
      return { ...prev, [id]: proposedWidget };
    });
  }, [checkOverlap]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, id: 'local' | 'session') => {
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const newW = Math.max(1, Math.min(7 - startWidget.x, startWidget.w + Math.round((moveEvent.clientX - startX) / cellW)));
        const newH = Math.max(1, Math.min(7 - startWidget.y, startWidget.h + Math.round((moveEvent.clientY - startY) / cellH)));
        
        setWidgets(prev => {
          if (prev[id].w === newW && prev[id].h === newH) return prev;
          const proposedWidget = { ...prev[id], w: newW, h: newH };
          if (checkOverlap(proposedWidget, prev[id === 'local' ? 'session' : 'local'])) return prev; 
          return { ...prev, [id]: proposedWidget };
        });
      });
    };

    const onPointerUpOrCancel = (upEvent: PointerEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
    handleToggleSessionFont
  };
}