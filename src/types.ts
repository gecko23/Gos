
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {FunctionCall} from '@google/genai';

export type WindowState = 'normal' | 'maximized' | 'split-left' | 'split-right';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  category?: 'System' | 'Productivity' | 'Media' | 'Utilities' | 'Web';
  defaultWindowState?: WindowState;
}

export type DesktopLayout = 'categorized' | 'alphabetical' | 'grid';

export interface InteractionData {
  id: string;
  type: string;
  value?: string;
  elementType: string;
  elementText: string;
  appContext: string | null;
  isDirectUrlNavigation?: boolean; // Added for direct URL navigation in web browser
}

export interface AppInstance {
  definition: AppDefinition;
  content: string;
  history: InteractionData[];
  future: InteractionData[]; // Added for forward navigation
  path: string[];
  isLoading: boolean;
  error: string | null;
  // Multitasking properties
  position: { x: number; y: number };
  zIndex: number;
  isMinimized: boolean;
  windowState: WindowState;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface ConversationalResponse {
  text: string;
  sources: GroundingChunk[];
  functionCalls?: FunctionCall[];
}
