
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useState} from 'react';
import { DesktopLayout } from '../types';

interface ParametersPanelProps {
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  onClosePanel: () => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  isDeepThinkingEnabled?: boolean;
  onSetDeepThinking?: (enabled: boolean) => void;
  desktopLayout?: DesktopLayout;
  onSetDesktopLayout?: (layout: DesktopLayout) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  currentLength,
  onUpdateHistoryLength,
  onClosePanel,
  isStatefulnessEnabled,
  onSetStatefulness,
  isDeepThinkingEnabled = false,
  onSetDeepThinking,
  desktopLayout = 'categorized',
  onSetDesktopLayout
}) => {
  // Local state for pending changes
  const [localHistoryLengthInput, setLocalHistoryLengthInput] =
    useState<string>(currentLength.toString());
  const [localStatefulnessChecked, setLocalStatefulnessChecked] =
    useState<boolean>(isStatefulnessEnabled);
  const [localDeepThinkingChecked, setLocalDeepThinkingChecked] = useState<boolean>(isDeepThinkingEnabled);
  const [localDesktopLayout, setLocalDesktopLayout] = useState<DesktopLayout>(desktopLayout);

  // Update local state if props change (e.g., panel re-opened)
  useEffect(() => {
    setLocalHistoryLengthInput(currentLength.toString());
  }, [currentLength]);

  useEffect(() => {
    setLocalStatefulnessChecked(isStatefulnessEnabled);
  }, [isStatefulnessEnabled]);

  useEffect(() => {
    setLocalDeepThinkingChecked(isDeepThinkingEnabled);
  }, [isDeepThinkingEnabled]);

  useEffect(() => {
    setLocalDesktopLayout(desktopLayout);
  }, [desktopLayout]);

  const handleHistoryLengthInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalHistoryLengthInput(event.target.value);
  };

  const handleStatefulnessCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalStatefulnessChecked(event.target.checked);
  };

  const handleDeepThinkingCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalDeepThinkingChecked(event.target.checked);
  };

  const handleApplyParameters = () => {
    // Apply history length
    const newLength = parseInt(localHistoryLengthInput, 10);
    if (!isNaN(newLength) && newLength >= 0 && newLength <= 10) {
      onUpdateHistoryLength(newLength);
    } else {
      alert('Please enter a number between 0 and 10 for history length.');
      setLocalHistoryLengthInput(currentLength.toString()); // Revert local input to original prop on error
      return; // Do not proceed to close if there's an error
    }

    // Apply statefulness if it has changed
    if (localStatefulnessChecked !== isStatefulnessEnabled) {
      onSetStatefulness(localStatefulnessChecked);
    }

    // Apply deep thinking
    if (onSetDeepThinking && localDeepThinkingChecked !== isDeepThinkingEnabled) {
        onSetDeepThinking(localDeepThinkingChecked);
    }

    // Apply desktop layout
    if (onSetDesktopLayout && localDesktopLayout !== desktopLayout) {
        onSetDesktopLayout(localDesktopLayout);
    }

    onClosePanel(); // Close the panel after applying settings
  };

  const handleClose = () => {
    // Reset local state to reflect original props before closing
    setLocalHistoryLengthInput(currentLength.toString());
    setLocalStatefulnessChecked(isStatefulnessEnabled);
    setLocalDeepThinkingChecked(isDeepThinkingEnabled);
    setLocalDesktopLayout(desktopLayout);
    onClosePanel();
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col items-start pt-8 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2 w-full">System Parameters</h2>

      {/* Interaction History Row */}
      <div className="w-full max-w-md mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider mb-3">AI Context & Reasoning</h3>
        <div className="llm-row items-center">
          <label
            htmlFor="maxHistoryLengthInput"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0 font-medium"
            style={{minWidth: '150px'}}>
            Max History Length:
          </label>
          <input
            type="number"
            id="maxHistoryLengthInput"
            value={localHistoryLengthInput}
            onChange={handleHistoryLengthInputChange}
            min="0"
            max="10"
            className="llm-input flex-grow !m-0"
            aria-describedby="historyLengthHelpText"
          />
        </div>
        
        <div className="llm-row items-center mt-3">
          <label
            htmlFor="statefulnessCheckbox"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0 font-medium"
            style={{minWidth: '150px'}}>
            Enable Statefulness:
          </label>
          <input
            type="checkbox"
            id="statefulnessCheckbox"
            checked={localStatefulnessChecked}
            onChange={handleStatefulnessCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div className="llm-row items-center mt-3 p-2 bg-purple-50 rounded-md border border-purple-100">
          <label
            htmlFor="deepThinkingCheckbox"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0 font-bold text-purple-700"
            style={{minWidth: '150px'}}>
            ✨ Deep Thinking:
          </label>
          <input
            type="checkbox"
            id="deepThinkingCheckbox"
            checked={localDeepThinkingChecked}
            onChange={handleDeepThinkingCheckboxChange}
            className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
          />
        </div>
        <p className="text-[10px] text-purple-400 mt-2 italic">Uses Gemini 3 Pro with max thinking budget for complex tasks.</p>
      </div>

      {/* Desktop Environment Row */}
      {onSetDesktopLayout && (
          <div className="w-full max-w-md mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-bold text-sm text-gray-600 uppercase tracking-wider mb-3">Icon Layout</h3>
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                        type="radio" 
                        name="desktopLayout" 
                        value="categorized" 
                        checked={localDesktopLayout === 'categorized'}
                        onChange={() => setLocalDesktopLayout('categorized')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">Categorized (Default)</span>
                        <span className="text-xs text-gray-500">Group apps by their function</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                        type="radio" 
                        name="desktopLayout" 
                        value="alphabetical" 
                        checked={localDesktopLayout === 'alphabetical'}
                        onChange={() => setLocalDesktopLayout('alphabetical')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">Alphabetical List</span>
                        <span className="text-xs text-gray-500">Sort all apps A-Z</span>
                    </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                    <input 
                        type="radio" 
                        name="desktopLayout" 
                        value="grid" 
                        checked={localDesktopLayout === 'grid'}
                        onChange={() => setLocalDesktopLayout('grid')}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">Free Grid</span>
                        <span className="text-xs text-gray-500">Drag and drop icons freely</span>
                    </div>
                </label>
            </div>
          </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-6 border-t border-gray-200 w-full max-w-md flex justify-start gap-3">
        <button
          onClick={handleApplyParameters}
          className="llm-button !m-0"
          aria-label="Apply all parameter settings and close">
          Apply Changes
        </button>
        <button
          onClick={handleClose}
          className="llm-button bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 !m-0"
          aria-label="Close parameters panel without applying current changes">
          Cancel
        </button>
      </div>
    </div>
  );
};
