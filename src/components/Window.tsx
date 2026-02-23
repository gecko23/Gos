
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useRef, useEffect } from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  isActive: boolean;
  appId: string;
  zIndex: number;
  position: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
  onMaximize: () => void;
  onSplitScreenLeft: () => void;
  onSplitScreenRight: () => void;
  windowState: 'normal' | 'maximized' | 'split-left' | 'split-right';
  onToggleParameters: () => void;
  isParametersPanelOpen?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

const MenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({children, onClick, className}) => (
  <span
    className={`menu-item cursor-pointer hover:text-blue-600 ${className}`}
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onClick?.(); }
    }}
    tabIndex={0}
    role="button">
    {children}
  </span>
);

const WindowButton: React.FC<{
  color: string;
  onClick?: () => void;
  ariaLabel: string;
}> = ({color, onClick, ariaLabel}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={`w-3.5 h-3.5 rounded-full ${color} transition-opacity opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-default shadow-inner`}
    aria-label={ariaLabel}
    disabled={!onClick}
  />
);

const NavButton: React.FC<{
  direction: 'back' | 'forward';
  onClick?: () => void;
  disabled: boolean;
}> = ({direction, onClick, disabled}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    disabled={disabled}
    className={`
      p-1 rounded-md transition-colors
      ${disabled ? 'text-gray-300 cursor-default' : 'text-gray-600 hover:bg-gray-200 cursor-pointer'}
    `}
    aria-label={direction === 'back' ? 'Go Back' : 'Go Forward'}
  >
    {direction === 'back' ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    )}
  </button>
);

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  isActive,
  zIndex,
  position,
  onDrag,
  onToggleParameters,
  isParametersPanelOpen,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  onMaximize,
  onSplitScreenLeft,
  onSplitScreenRight,
  windowState,
}) => {
  const dragRef = useRef<{ startX: number; startY: number; windowX: number; windowY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus();
    if ((e.target as HTMLElement).closest('.window-controls') || (e.target as HTMLElement).closest('.menu-bar')) return;
    
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      windowX: position.x,
      windowY: position.y
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    onDrag(dragRef.current.windowX + deltaX, dragRef.current.windowY + deltaY);
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className={`absolute border border-black/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans backdrop-blur-md transition-shadow duration-200 ${isActive ? 'ring-2 ring-blue-500/20 shadow-blue-900/10' : 'opacity-95'} ${isActive ? 'bg-gray-50/85' : 'bg-gray-100/75'}
        ${windowState === 'maximized' ? 'w-full h-full top-0 left-0 rounded-none' : ''}
        ${windowState === 'split-left' ? 'w-1/2 h-full top-0 left-0 rounded-none' : ''}
        ${windowState === 'split-right' ? 'w-1/2 h-full top-0 right-0 rounded-none' : ''}
      `}
      style={{ 
        left: position.x, 
        top: position.y, 
        zIndex: zIndex,

      }}
      onMouseDown={windowState === 'normal' ? onFocus : undefined}
    >
      {/* Title Bar */}
      <div 
        className={`h-10 border-b border-black/5 px-3 flex items-center select-none ${windowState === 'normal' ? 'cursor-grab active:cursor-grabbing' : ''} flex-shrink-0 transition-colors ${isActive ? 'bg-gray-200/80' : 'bg-gray-300/40'}`}
        onMouseDown={windowState === 'normal' ? handleMouseDown : undefined}
      >
        <div className="flex items-center gap-2 w-24 window-controls">
          <WindowButton
            color="bg-red-500"
            onClick={onClose}
            ariaLabel="Close window"
          />
          <WindowButton 
            color="bg-yellow-400" 
            onClick={onMinimize}
            ariaLabel="Minimize window" 
          />
          <WindowButton 
            color="bg-green-500" 
            onClick={onMaximize}
            ariaLabel="Maximize window" 
          />
        </div>
        <div className="flex-grow text-center">
          <span className={`font-semibold text-sm transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
        </div>
        <div className="w-24"></div>
      </div>

      {/* Menu Bar */}
      <div className="bg-white/60 py-1.5 px-4 border-b border-black/10 select-none flex gap-4 flex-shrink-0 text-sm text-gray-700 items-center h-9 menu-bar">
        {/* Navigation Controls */}
        {!isParametersPanelOpen && (
           <div className="flex items-center gap-1 mr-2 border-r border-gray-300 pr-3">
             <NavButton direction="back" onClick={onBack} disabled={!canGoBack} />
             <NavButton direction="forward" onClick={onForward} disabled={!canGoForward} />
           </div>
        )}

        {!isParametersPanelOpen && (
          <MenuItem onClick={onToggleParameters}>
            <u>P</u>arameters
          </MenuItem>
        )}
        <MenuItem onClick={onClose} className="ml-auto text-gray-400 hover:text-red-500">
          Quit
        </MenuItem>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-hidden bg-white/40">
        {children}
      </div>
    </div>
  );
};
