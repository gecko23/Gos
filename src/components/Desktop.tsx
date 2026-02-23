
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect, useMemo } from 'react';
import { AppDefinition, DesktopLayout, WindowState } from '../types';
import { APP_DEFINITIONS_CONFIG } from '../constants';
import { Icon } from './Icon';

interface DesktopProps {
  onAppOpen: (app: AppDefinition, defaultWindowState?: WindowState) => void;
  layout?: DesktopLayout;
}

const ClockWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="absolute top-4 right-4 bg-black/20 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm z-10 pointer-events-none select-none">
            <p className="text-4xl font-semibold tracking-wider">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-right text-sm">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>
    );
};

export const Desktop: React.FC<DesktopProps> = ({ onAppOpen, layout = 'categorized' }) => {
    // Local state to manage the order of apps for GRID layout
    const [customOrder, setCustomOrder] = useState<AppDefinition[]>(() => {
        const saved = localStorage.getItem('desktop_icons_order');
        if (saved) {
            try {
                const order = JSON.parse(saved);
                const appMap = new Map(APP_DEFINITIONS_CONFIG.map(a => [a.id, a]));
                const restored = order
                    .map((id: string) => appMap.get(id))
                    .filter((a: any) => !!a);
                
                const restoredIds = new Set(restored.map((a: any) => a.id));
                const missing = APP_DEFINITIONS_CONFIG.filter(a => !restoredIds.has(a.id));
                
                return [...restored, ...missing];
            } catch (e) {
                return [...APP_DEFINITIONS_CONFIG];
            }
        }
        return [...APP_DEFINITIONS_CONFIG];
    });

    const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

    // Save order whenever it changes (only relevant for grid layout mostly)
    useEffect(() => {
        localStorage.setItem('desktop_icons_order', JSON.stringify(customOrder.map(a => a.id)));
    }, [customOrder]);

    const handleDragStart = (appId: string) => {
        setDraggedAppId(appId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); 
    };

    const handleDrop = (targetAppId: string) => {
        if (!draggedAppId || draggedAppId === targetAppId) return;
        
        // Only allow reordering in GRID layout for now to keep things simple
        if (layout !== 'grid') return;

        const draggedIndex = customOrder.findIndex(a => a.id === draggedAppId);
        const targetIndex = customOrder.findIndex(a => a.id === targetAppId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newApps = [...customOrder];
        const [removed] = newApps.splice(draggedIndex, 1);
        newApps.splice(targetIndex, 0, removed);

        setCustomOrder(newApps);
        setDraggedAppId(null);
    };

    // Derived view state based on layout prop
    const renderContent = useMemo(() => {
        if (layout === 'alphabetical') {
            const sortedApps = [...APP_DEFINITIONS_CONFIG].sort((a, b) => a.name.localeCompare(b.name));
            return (
                <div className="flex flex-wrap content-start animate-in fade-in duration-300">
                    {sortedApps.map(app => (
                        <Icon 
                            key={app.id} 
                            app={app} 
                            onInteract={() => onAppOpen(app, app.defaultWindowState)}
                            // No drag in alphabetical mode
                        />
                    ))}
                </div>
            );
        }

        if (layout === 'grid') {
            return (
                <div className="flex flex-wrap content-start animate-in fade-in duration-300">
                    {customOrder.map(app => (
                        <Icon 
                            key={app.id} 
                            app={app} 
                            onInteract={() => onAppOpen(app, app.defaultWindowState)}
                            draggable
                            onDragStart={() => handleDragStart(app.id)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(app.id)}
                            className={draggedAppId === app.id ? 'opacity-40 scale-95' : 'opacity-100'}
                        />
                    ))}
                </div>
            );
        }

        // Default: Categorized
        // Uses APP_DEFINITIONS_CONFIG source order but groups them
        const categories = ['System', 'Productivity', 'Media', 'Web', 'Utilities'];
        
        const categorizedApps = categories.map(category => ({
            title: category,
            apps: APP_DEFINITIONS_CONFIG.filter(app => app.category === category)
        }));
        
        // Items without category or strictly not in the list above
        const uncategorizedApps = APP_DEFINITIONS_CONFIG.filter(app => !app.category || !categories.includes(app.category));

        return (
            <div className="flex flex-col animate-in fade-in duration-300">
                {categorizedApps.map(group => (
                    group.apps.length > 0 && (
                        <div key={group.title} className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700/80 px-4 mb-2 select-none uppercase tracking-widest text-[10px] text-shadow-sm border-b border-gray-400/20 pb-1 mx-2 w-fit">
                                {group.title}
                            </h2>
                            <div className="flex flex-wrap content-start min-h-[100px]">
                                {group.apps.map(app => (
                                    <Icon 
                                        key={app.id} 
                                        app={app} 
                                        onInteract={() => onAppOpen(app, app.defaultWindowState)}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ))}
                {uncategorizedApps.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700/80 px-4 mb-2 select-none uppercase tracking-widest text-[10px] text-shadow-sm border-b border-gray-400/20 pb-1 mx-2 w-fit">
                            Other
                        </h2>
                        <div className="flex flex-wrap content-start min-h-[100px]">
                            {uncategorizedApps.map(app => (
                                <Icon 
                                    key={app.id} 
                                    app={app} 
                                    onInteract={() => onAppOpen(app, app.defaultWindowState)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }, [layout, customOrder, draggedAppId, onAppOpen]);

    return (
        <div className="w-full h-full relative p-4 overflow-y-auto custom-scrollbar">
            <ClockWidget />
            {renderContent}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};
