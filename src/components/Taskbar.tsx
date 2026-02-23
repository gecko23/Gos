
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useState, useRef, useEffect} from 'react';
import {AppDefinition} from '../types';

interface TaskbarProps {
  openApps: AppDefinition[];
  activeAppId: string | null;
  onSwitchApp: (appId: string) => void;
  onCloseApp: (appId: string) => void;
  onToggleStartMenu: () => void;
  onToggleVoiceAssistant: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  appId: string;
}

const TaskbarApp: React.FC<{
  app: AppDefinition;
  isActive: boolean;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}> = ({app, isActive, onClick, onContextMenu}) => {
  const isImage = app.icon.startsWith('http') || app.icon.startsWith('data:');
  
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        h-full px-3 flex items-center gap-2 max-w-40
        transition-colors duration-150
        ${
          isActive
            ? 'bg-white/20'
            : 'bg-transparent hover:bg-white/10 active:bg-white/5'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${app.name} application`}>
      <span className="text-xl flex items-center justify-center w-6 h-6">
        {isImage ? (
           <img src={app.icon} alt="" className="w-full h-full object-contain" />
        ) : (
           app.icon
        )}
      </span>
      <span className="text-sm text-white truncate">{app.name}</span>
    </button>
  );
};

export const Taskbar: React.FC<TaskbarProps> = ({
  openApps,
  activeAppId,
  onSwitchApp,
  onCloseApp,
  onToggleStartMenu,
  onToggleVoiceAssistant,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContextMenu = (event: React.MouseEvent, appId: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      appId: appId,
    });
  };

  const handleCloseFromMenu = () => {
    if (contextMenu) {
      onCloseApp(contextMenu.appId);
      setContextMenu(null);
    }
  };

  return (
    <footer
      className="w-full h-12 bg-gray-800/70 backdrop-blur-sm flex-shrink-0 flex items-center px-2 z-50 select-none"
      role="toolbar"
      aria-label="Taskbar">
      <button
        onClick={onToggleStartMenu}
        className="h-10 w-10 flex items-center justify-center rounded-md text-2xl transition-colors duration-150 bg-transparent hover:bg-white/20 active:bg-white/10"
        aria-label="Open Start Menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
          <circle cx="5" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      </button>

      <button
        onClick={onToggleVoiceAssistant}
        className="h-10 w-10 flex items-center justify-center rounded-md text-2xl transition-colors duration-150 bg-transparent hover:bg-white/20 active:bg-white/10"
        aria-label="Open Voice Assistant">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      </button>

      <div className="h-full flex items-center ml-2 space-x-1">
        {openApps.map((app) => (
          <TaskbarApp
            key={app.id}
            app={app}
            isActive={app.id === activeAppId}
            onClick={() => onSwitchApp(app.id)}
            onContextMenu={(e) => handleContextMenu(e, app.id)}
          />
        ))}
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            transform: 'translateY(-100%)', // Position menu above the cursor
          }}
          className="fixed bg-white rounded-md shadow-lg py-1 z-50 w-32 border border-gray-200"
          role="menu">
          <button
            onClick={handleCloseFromMenu}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem">
            Close
          </button>
        </div>
      )}
    </footer>
  );
};
