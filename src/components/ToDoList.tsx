
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect } from 'react';
import { generateRoutine, RoutineTask } from '../services/geminiService';

interface TodoItem extends RoutineTask {
    id: string;
    completed: boolean;
}

export const ToDoList: React.FC = () => {
    // Initialize state from localStorage if available
    const [tasks, setTasks] = useState<TodoItem[]>(() => {
        try {
            const saved = localStorage.getItem('todo_list_tasks');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load tasks from local storage", e);
        }
        return [
            { id: '1', task: 'Check emails', time: '9:00 AM', category: 'Work', completed: false },
            { id: '2', task: 'Team Standup', time: '10:00 AM', category: 'Work', completed: false },
            { id: '3', task: 'Lunch Break', time: '12:30 PM', category: 'Wellness', completed: false },
        ];
    });

    const [newTaskText, setNewTaskText] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
    
    // Drag and drop state
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    // Persist tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('todo_list_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (!newTaskText.trim()) return;
        const newItem: TodoItem = {
            id: Math.random().toString(36).substr(2, 9),
            task: newTaskText,
            category: 'Personal',
            completed: false,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setTasks([...tasks, newItem]);
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsLoading(true);
        try {
            const routine = await generateRoutine(aiPrompt);
            const newTasks = routine.map(r => ({
                id: Math.random().toString(36).substr(2, 9),
                completed: false,
                ...r
            }));
            setTasks([...tasks, ...newTasks]);
            setAiPrompt('');
            setIsAiMode(false);
        } catch (e) {
            console.error(e);
            alert("Failed to generate routine. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set a custom drag image or style here if needed
        // e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault(); // Necessary to allow dropping
        
        if (!draggedItemId || draggedItemId === targetId) return;
        if (filter !== 'All') return; // Disable reordering when filtered

        const draggedIndex = tasks.findIndex(t => t.id === draggedItemId);
        const targetIndex = tasks.findIndex(t => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Swap items in the array
        const newTasks = [...tasks];
        const [draggedItem] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, draggedItem);
        
        setTasks(newTasks);
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'Active') return !t.completed;
        if (filter === 'Completed') return t.completed;
        return true;
    });

    const progress = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
        : 0;

    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-800 relative overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-blue-600">✅</span> My Day
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-blue-600">{progress}%</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Completed</div>
                </div>
            </header>

            {/* AI Assistant Banner */}
            {!isAiMode && (
                 <div className="px-6 pt-6">
                    <button 
                        onClick={() => setIsAiMode(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg text-xl group-hover:scale-110 transition-transform">✨</div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Need help planning?</p>
                                <p className="text-xs text-white/80">Generate a custom routine with AI</p>
                            </div>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Try Now →</span>
                    </button>
                 </div>
            )}

            {/* AI Input Area */}
            {isAiMode && (
                <div className="px-6 pt-6">
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">Magic Routine Generator</label>
                             <button onClick={() => setIsAiMode(false)} className="text-purple-400 hover:text-purple-700">✕</button>
                        </div>
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., 'Plan a productive Saturday with cleaning, gym, and reading' or 'Work from home schedule 9-5'"
                            className="w-full p-3 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm min-h-[80px]"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end mt-2">
                            <button 
                                onClick={handleAiGenerate}
                                disabled={isLoading || !aiPrompt.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Planning...
                                    </>
                                ) : (
                                    'Generate Routine'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Input */}
            <div className="p-6 pb-2">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add a new task..."
                        className="flex-grow bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        onClick={addTask}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xl font-bold"
                    >
                        +
                    </button>
                </div>
                
                {/* Filters */}
                <div className="flex gap-4 mt-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                    {['All', 'Active', 'Completed'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`pb-2 transition-colors ${filter === f ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-gray-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-sm font-medium">No tasks found.</p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div 
                            key={task.id} 
                            draggable={filter === 'All'}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragOver={(e) => handleDragOver(e, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`
                                group flex items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm transition-all 
                                ${task.completed ? 'opacity-60 bg-gray-50' : ''}
                                ${filter === 'All' ? 'cursor-move hover:shadow-md' : ''}
                                ${draggedItemId === task.id ? 'opacity-40 border-blue-400 border-dashed bg-blue-50' : ''}
                            `}
                        >
                             {/* Drag Handle (Visual only, whole item is draggable) */}
                             {filter === 'All' && (
                                <div className="mr-3 text-gray-300 group-hover:text-gray-500 cursor-move">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/></svg>
                                </div>
                            )}

                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0 ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'}`}
                            >
                                {task.completed && <span className="text-xs font-bold">✓</span>}
                            </button>
                            
                            <div className="flex-grow min-w-0">
                                <p className={`text-sm font-medium truncate transition-all ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.task}
                                </p>
                                <div className="flex gap-2 text-xs mt-0.5">
                                    {task.time && (
                                        <span className="text-gray-500 flex items-center gap-1">
                                            ⏰ {task.time}
                                        </span>
                                    )}
                                    <span className="text-blue-500 bg-blue-50 px-1.5 rounded font-medium">
                                        {task.category}
                                    </span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 transition-all"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
