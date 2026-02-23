import React from 'react';
import { AppDefinition, WindowState } from '../types';
import { APP_DEFINITIONS_CONFIG } from '../constants';
import { Icon } from './Icon';

interface AppStoreProps {
  onAppOpen: (app: AppDefinition, defaultWindowState?: WindowState) => void;
}

export const AppStore: React.FC<AppStoreProps> = ({ onAppOpen }) => {
  return (
    <div className="p-4 w-full h-full overflow-y-auto custom-scrollbar">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">App Store</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {APP_DEFINITIONS_CONFIG.map(app => (
          <div key={app.id} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <Icon app={app} onInteract={() => onAppOpen(app, 'normal')} />
            <h2 className="mt-2 text-lg font-semibold text-gray-900">{app.name}</h2>
            <p className="text-sm text-gray-500">{app.category}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={() => onAppOpen(app, 'normal')}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
