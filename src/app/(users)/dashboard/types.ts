import { SupabaseClient, User } from '@supabase/supabase-js';
import React from 'react';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

export interface Setup {
  id: string;
  symbol: string;
  direction: string;
  playbook?: string;
  notes?: string;
  imageUrl?: string;
  isToday: boolean;
  addedToTodayAt: number | null;
}

export interface Widget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontIdx: number;
}

export interface DashboardWidgets {
  local: Widget;
  session: Widget;
}

export interface WeekProgressDay {
  day: string;
  status: 'perfect' | 'imperfect' | 'missed' | 'pending' | 'current';
  isPast: boolean;
  isToday: boolean;
}

export interface ClockWidgetProps {
  fontIdx: number;
  isPro: boolean;
  onToggleFont: (e: React.MouseEvent) => void;
}

export interface SessionClockWidgetProps extends ClockWidgetProps {
  timeOffsetRef: React.MutableRefObject<number>;
  onOverlapChange: (overlap: boolean) => void;
}

export interface DashboardGridProps {
  widgets: DashboardWidgets;
  isPro: boolean;
  isSessionOverlap: boolean;
  draggingId: string | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
  timeOffsetRef: React.MutableRefObject<number>;
  handleDragStart: (e: React.DragEvent, id: 'local' | 'session') => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDropOnGrid: (e: React.DragEvent) => void;
  handleResizePointerDown: (e: React.PointerEvent, id: 'local' | 'session') => void;
  handleToggleLocalFont: (e: React.MouseEvent) => void;
  handleToggleSessionFont: (e: React.MouseEvent) => void;
  setIsSessionOverlap: (overlap: boolean) => void;
}

export interface RoutineTrackerProps {
  isPro: boolean;
  vaultSetupCount: number;
  isVaultLocked: boolean;
  isPrepWindow: boolean;
  pushesToday: number;
  pastDays: WeekProgressDay[];
  tradesTakenToday: number;
  isWeekendNow: boolean;
  pendingReconciliationsCount: number;
}

export interface ActiveFocusWorkspaceProps {
  isTodayFocusExpanded: boolean;
  setIsTodayFocusExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  todaySetups: Setup[];
  activeSetup: Setup | undefined;
  activeTodayId: string | null;
  setActiveTodayId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsMobileNotesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayDirection: (dir: string | null | undefined) => string;
  handlePeekStart: () => void;
  handlePeekEnd: () => void;
  chartScale: number;
  setChartScale: React.Dispatch<React.SetStateAction<number>>;
  transformRef: React.RefObject<ReactZoomPanPinchRef | null>;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LAYOUT_STORAGE_KEY = 'operator_desk_playground_layout_v5';

export const DEMO_SETUPS: Setup[] = [
  {
    id: 'demo-1', symbol: 'BTCUSD', direction: 'LONG', playbook: 'Liquidity Sweep',
    notes: '<p><b>Macro:</b> Bullish market structure. Price swept Asian session lows.</p><p><b>Trigger:</b> Waiting for 15m CHoCH.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    isToday: true, addedToTodayAt: Date.now() - 100000
  },
  {
    id: 'demo-2', symbol: 'EURUSD', direction: 'SHORT', playbook: 'Trend Continuation',
    notes: '<p>Standard premium supply mitigation. DXY is strong.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    isToday: true, addedToTodayAt: Date.now() - 200000
  }
];
