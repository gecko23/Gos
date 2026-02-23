
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useEffect } from 'react';
import { generateRoutine } from '../services/geminiService';

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string;
    category: 'Work' | 'Personal' | 'Important' | 'Other';
    description?: string;
}

const CATEGORY_COLORS = {
    'Work': 'bg-blue-500/10 text-blue-600 border-blue-200',
    'Personal': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    'Important': 'bg-rose-500/10 text-rose-600 border-rose-200',
    'Other': 'bg-slate-500/10 text-slate-600 border-slate-200'
};

const CATEGORY_DOTS = {
    'Work': 'bg-blue-500',
    'Personal': 'bg-emerald-500',
    'Important': 'bg-rose-500',
    'Other': 'bg-slate-500'
};

export const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        try {
            const saved = localStorage.getItem('calendar_events');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventCategory, setNewEventCategory] = useState<'Work' | 'Personal' | 'Important' | 'Other'>('Work');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }, [events]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    const formatDateStr = (date: Date) => date.toISOString().split('T')[0];

    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const calendarGrid = generateCalendarGrid();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const eventsForSelectedDate = events
        .filter(e => e.date === selectedDate)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(formatDateStr(now));
    };

    // Add handleDayClick helper to fix the compilation error
    const handleDayClick = (date: Date) => {
        setSelectedDate(formatDateStr(date));
    };

    const handleAddEvent = () => {
        if (!newEventTitle.trim()) return;
        const newEvent: CalendarEvent = {
            id: Math.random().toString(36).substr(2, 9),
            title: newEventTitle,
            date: selectedDate,
            time: newEventTime,
            category: newEventCategory
        };
        setEvents([...events, newEvent]);
        setNewEventTitle('');
        setNewEventTime('');
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsLoading(true);
        try {
            const routine = await generateRoutine(aiPrompt);
            const generatedEvents = routine.map(r => ({
                id: Math.random().toString(36).substr(2, 9),
                title: r.task,
                date: selectedDate,
                time: r.time || undefined,
                category: mapCategory(r.category)
            }));
            setEvents(prev => [...prev, ...generatedEvents]);
            setAiPrompt('');
            setIsAiModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Failed to generate schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    const mapCategory = (aiCat: string): 'Work' | 'Personal' | 'Important' | 'Other' => {
        const lower = aiCat.toLowerCase();
        if (lower.includes('work') || lower.includes('job') || lower.includes('meeting')) return 'Work';
        if (lower.includes('personal') || lower.includes('home') || lower.includes('health')) return 'Personal';
        if (lower.includes('urgent') || lower.includes('important')) return 'Important';
        return 'Other';
    };

    return (
        <div className="flex h-full w-full bg-white font-sans text-gray-800 overflow-hidden">
            {/* Sidebar / Daily View */}
            <div className="w-80 border-r border-gray-100 bg-gray-50/50 backdrop-blur-sm flex flex-col flex-shrink-0 animate-in slide-in-from-left duration-500">
                <div className="p-8 pb-6">
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none">
                        {new Date(selectedDate).getDate()}
                    </h2>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-2">
                        {new Date(selectedDate).toLocaleString(undefined, { weekday: 'long' })}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        {new Date(selectedDate).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex-grow overflow-y-auto px-6 py-2 space-y-4">
                    {eventsForSelectedDate.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30 grayscale text-center">
                            <span className="text-5xl mb-4">🍃</span>
                            <p className="text-xs font-black uppercase tracking-widest">Free as a bird</p>
                            <p className="text-[10px] mt-1">Nothing scheduled for today</p>
                        </div>
                    ) : (
                        eventsForSelectedDate.map(event => (
                            <div key={event.id} className={`p-4 rounded-2xl border-l-4 transition-all hover:shadow-md group relative bg-white border border-gray-100 shadow-sm ${CATEGORY_COLORS[event.category].split(' ')[2]}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-gray-800 line-clamp-2">{event.title}</span>
                                    <button onClick={() => handleDeleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {event.time || 'All Day'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOTS[event.category]}`}></div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{event.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 pt-2 bg-gray-50/80 border-t border-gray-100 space-y-3">
                    <button 
                        onClick={() => setIsEventModalOpen(true)}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                    >
                        + New Event
                    </button>
                    <button 
                        onClick={() => setIsAiModalOpen(true)}
                        className="w-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                        <span>✨ AI Schedule</span>
                    </button>
                </div>
            </div>

            {/* Main Calendar View */}
            <div className="flex-grow flex flex-col bg-white overflow-hidden animate-in fade-in duration-700">
                <div className="flex items-center justify-between px-12 py-8">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">
                            {currentMonthName} <span className="text-blue-600 ml-1">{currentYear}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button onClick={handleToday} className="px-5 text-xs font-black uppercase tracking-[0.2em] text-gray-600 hover:text-blue-600 transition-colors">Today</button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-y border-gray-100 bg-gray-50/30">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="flex-grow grid grid-cols-7 auto-rows-fr">
                    {calendarGrid.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="bg-gray-50/20 border-b border-r border-gray-50/50"></div>;
                        
                        const dateStr = formatDateStr(date);
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === formatDateStr(new Date());
                        const dayEvents = events.filter(e => e.date === dateStr);

                        return (
                            <div 
                                key={dateStr}
                                onClick={() => handleDayClick(date)}
                                className={`
                                    border-b border-r border-gray-100 p-3 relative cursor-pointer group transition-all
                                    ${isSelected ? 'bg-blue-50/40 ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-gray-50/80'}
                                    ${isToday && !isSelected ? 'bg-amber-50/30' : ''}
                                `}
                            >
                                <div className={`
                                    text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg mb-2 transition-colors
                                    ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 group-hover:text-gray-800'}
                                    ${isSelected && !isToday ? 'text-blue-600' : ''}
                                `}>
                                    {date.getDate()}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    {dayEvents.slice(0, 3).map(ev => (
                                        <div key={ev.id} className={`text-[9px] font-bold truncate px-2 py-1 rounded-lg border border-transparent shadow-sm ${CATEGORY_COLORS[ev.category].split(' ').slice(0, 2).join(' ')}`}>
                                            {ev.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 pl-1 py-1">
                                            + {dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase">New <span className="text-blue-600">Event</span></h3>
                            <button onClick={() => setIsEventModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    value={newEventTitle} 
                                    onChange={e => setNewEventTitle(e.target.value)} 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    placeholder="Brief description..."
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time</label>
                                    <input 
                                        type="time" 
                                        value={newEventTime} 
                                        onChange={e => setNewEventTime(e.target.value)} 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                    <select 
                                        value={newEventCategory} 
                                        onChange={e => setNewEventCategory(e.target.value as any)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Work">Work</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Important">Important</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsEventModalOpen(false)} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Discard</button>
                                <button onClick={handleAddEvent} disabled={!newEventTitle.trim()} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generator Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300 border-t-8 border-indigo-600">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">✨</span>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">AI <span className="text-indigo-600">Planner</span></h3>
                            </div>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                            Describe your vision for <span className="text-indigo-600 font-black">{new Date(selectedDate).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}</span>. Gemini will craft a perfectly structured schedule for you.
                        </p>
                        <textarea 
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            placeholder="e.g. A focused work marathon with 90-min deep work blocks, a long lunch break, and a team catch-up at 4pm."
                            className="w-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] mb-6 transition-all"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAiModalOpen(false)} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Cancel</button>
                            <button 
                                onClick={handleAiGenerate} 
                                disabled={!aiPrompt.trim() || isLoading} 
                                className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Planning...
                                    </>
                                ) : 'Generate Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
