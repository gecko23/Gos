
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';
import {AppDefinition} from '../types';

interface IconProps {
  app: AppDefinition;
  onInteract: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  app,
  onInteract,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  className = ""
}) => {
  const isImage = app.icon.startsWith('http') || app.icon.startsWith('data:');

  return (
    <div
      className={`w-28 h-32 flex flex-col items-center justify-start text-center m-2 p-2 cursor-pointer select-none rounded-lg transition-all hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      onClick={onInteract}
      onKeyDown={(e) => e.key === 'Enter' && onInteract()}
      tabIndex={0}
      role="button"
      aria-label={`Open ${app.name}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="text-6xl mb-2 drop-shadow-sm pointer-events-none flex items-center justify-center w-16 h-16">
        {isImage ? (
          <img src={app.icon} alt={app.name} className="w-full h-full object-contain drop-shadow-md" />
        ) : (
          app.icon
        )}
      </div>
      <div className="text-sm text-gray-800 font-semibold break-words max-w-full leading-tight pointer-events-none">
        {app.name}
      </div>
    </div>
  );
};
