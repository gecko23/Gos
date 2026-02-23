
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Settings, 
  Bell, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  Search,
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Post {
  id: string;
  title: string;
  time: string;
  status: 'Published' | 'Scheduled' | 'Draft';
  date: Date;
  type?: 'video' | 'article' | 'social';
}

const INITIAL_POSTS: Post[] = [
  { id: '1', title: 'Reasons', time: '9:00 AM', status: 'Published', date: new Date(2026, 1, 9) },
  { id: '2', title: 'meta description tips', time: '2:42 PM', status: 'Published', date: new Date(2026, 1, 10) },
  { id: '3', title: 'why have houseplants in...', time: '9:00 AM', status: 'Published', date: new Date(2026, 1, 13) },
  { id: '4', title: 'Why I love San Francisco', time: '9:00 AM', status: 'Published', date: new Date(2026, 1, 14) },
  { id: '5', title: 'why I love SEO', time: '9:00 AM', status: 'Scheduled', date: new Date(2026, 1, 15) },
  { id: '6', title: 'Is Running Man Bad', time: '3:00 AM', status: 'Scheduled', date: new Date(2026, 1, 16), type: 'video' },
  { id: '7', title: 'How to Create a Custom...', time: '7:55 AM', status: 'Scheduled', date: new Date(2026, 1, 17) },
  { id: '8', title: 'How to Use AI to Create a...', time: '7:55 AM', status: 'Scheduled', date: new Date(2026, 1, 18) },
  { id: '9', title: 'How to Safely Test WordPres...', time: '3:00 AM', status: 'Scheduled', date: new Date(2026, 1, 19) },
  { id: '10', title: 'How to Use AI to Create Feature...', time: '3:00 AM', status: 'Scheduled', date: new Date(2026, 1, 20) },
  { id: '11', title: 'How to Use AI to Rewrite Old Bl...', time: '7:55 AM', status: 'Scheduled', date: new Date(2026, 1, 21) },
];

export const ContentPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<{title: string, description: string}[]>([]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return date.getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return date.getDay();
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  }, [currentDate, firstDayOfMonth, daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateContent = async () => {
    if (!keywords.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 5 creative content ideas (title and a brief description) based on these keywords: "${keywords}". Return as a JSON array of objects with "title" and "description" fields.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (text) {
        const ideas = JSON.parse(text);
        setGeneratedIdeas(ideas);
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addPost = (title: string) => {
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time: '10:00 AM',
      status: 'Scheduled',
      date: new Date(2026, 1, 22), // Default to some date
    };
    setPosts([...posts, newPost]);
    setIsGeneratorOpen(false);
    setGeneratedIdeas([]);
    setKeywords('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0F] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex flex-col items-center py-8 px-6 border-b border-white/5">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Content Planner</h1>
        <p className="text-gray-400 text-sm">Automate and schedule posts for SmartWP.</p>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10">
            Integration Settings
          </button>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-blue-600" />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Notifications</span>
          </label>
        </div>

        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="px-6 font-medium min-w-[120px] text-center">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
          >
            <Sparkles size={16} className="text-purple-400" />
            Automation
            <Settings size={14} className="text-gray-500" />
          </button>
          <button 
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-[#0D0D0F] py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, idx) => {
            const dayPosts = day ? posts.filter(p => p.date.getDate() === day.getDate() && p.date.getMonth() === day.getMonth()) : [];
            const isToday = day && day.getDate() === 14 && day.getMonth() === 1; // Mocking Feb 14 as today

            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[160px] bg-[#0D0D0F] p-2 border-t border-white/5 relative group transition-colors hover:bg-white/[0.02]",
                  isToday && "ring-1 ring-blue-500/50 bg-blue-500/[0.02]"
                )}
              >
                {day && (
                  <span className={cn(
                    "text-xs font-medium mb-2 inline-block px-2 py-1 rounded-md",
                    isToday ? "bg-blue-600 text-white" : "text-gray-500"
                  )}>
                    {day.getDate()}
                  </span>
                )}

                <div className="space-y-2">
                  {dayPosts.map(post => (
                    <div 
                      key={post.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-white/20 transition-all cursor-pointer group/card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          post.status === 'Published' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                        )}>
                          {post.status === 'Published' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {post.status}
                        </div>
                        <button className="opacity-0 group-hover/card:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all">
                          <MoreHorizontal size={14} className="text-gray-400" />
                        </button>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 mb-3">{post.time}</p>
                      
                      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-medium transition-colors border border-white/5">
                        {post.status === 'Published' ? 'View Post' : 'Edit Post'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generator Modal */}
      <AnimatePresence>
        {isGeneratorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGeneratorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#151518] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="text-purple-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">AI Content Generator</h2>
                    <p className="text-xs text-gray-400">Generate post ideas from keywords</p>
                  </div>
                </div>
                <button onClick={() => setIsGeneratorOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Keywords</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g. SEO, Content Marketing, AI Tools"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                      <button 
                        onClick={generateContent}
                        disabled={isGenerating || !keywords.trim()}
                        className="absolute right-2 top-1.5 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg transition-colors"
                      >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {generatedIdeas.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <label className="block text-sm font-medium text-gray-400">Generated Ideas</label>
                      <div className="max-h-[300px] overflow-auto space-y-2 pr-2 custom-scrollbar">
                        {generatedIdeas.map((idea, idx) => (
                          <div 
                            key={idx}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-all group cursor-pointer"
                            onClick={() => addPost(idea.title)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white mb-1">{idea.title}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{idea.description}</p>
                              </div>
                              <Plus size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                <button 
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateContent}
                  disabled={isGenerating || !keywords.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate Ideas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
