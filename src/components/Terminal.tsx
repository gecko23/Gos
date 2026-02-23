/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useState, useEffect, useRef} from 'react';
import {InteractionData} from '../types';

interface TerminalProps {
  content: string;
  onInteract: (data: InteractionData) => void;
  appContext: string;
  isLoading: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  content,
  onInteract,
  appContext,
  isLoading,
}) => {
  const [command, setCommand] = useState('');
  const endOfContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfContentRef.current?.scrollIntoView();
  }, [content]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    const interactionData: InteractionData = {
      id: 'terminal_command',
      type: 'command_input',
      value: trimmedCommand,
      elementType: 'input',
      elementText: trimmedCommand.substring(0, 75),
      appContext,
    };

    onInteract(interactionData);
    setCommand('');
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="w-full h-full bg-gray-900 text-white font-mono p-4 overflow-y-auto text-sm"
      onClick={handleContainerClick}>
      <pre className="whitespace-pre-wrap">{content}</pre>
      {isLoading && content.length > 0 && (
        <span className="blinking-cursor">_</span>
      )}
      <div ref={endOfContentRef} />
      <form onSubmit={handleFormSubmit} className="flex items-center mt-2">
        <span className="text-green-400 mr-2 flex-shrink-0">
          user@gemini-os:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="flex-grow bg-transparent border-none outline-none text-white font-mono"
          autoFocus
          disabled={isLoading}
          aria-label="Terminal command input"
        />
      </form>
    </div>
  );
};
