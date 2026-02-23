
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState } from 'react';
import { editMedia, animateImage } from '../services/geminiService';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  date: string;
  dimensions?: string;
  duration?: string;
  fileSize?: string;
}

const DEFAULT_ITEMS: MediaItem[] = [
  {
    id: 'v1',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/640px-Big_buck_bunny_poster_big.jpg',
    title: 'Big Buck Bunny',
    date: '2023-11-02',
    duration: '9:56',
    fileSize: '158 MB'
  },
  {
    id: 'i1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop',
    title: 'Mountain Sunset',
    date: '2023-10-15',
    dimensions: '3840 x 2160',
    fileSize: '4.2 MB'
  },
  {
    id: 'i2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
    title: 'Yosemite Valley',
    date: '2023-09-28',
    dimensions: '4096 x 2304',
    fileSize: '5.1 MB'
  },
  {
    id: 'v2',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Elephants_Dream_poster_source.jpg/640px-Elephants_Dream_poster_source.jpg',
    title: 'Elephants Dream',
    date: '2023-08-12',
    duration: '10:53',
    fileSize: '124 MB'
  },
  {
    id: 'i3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=400&auto=format&fit=crop',
    title: 'Autumn Cabin',
    date: '2023-10-30',
    dimensions: '2560 x 1440',
    fileSize: '2.8 MB'
  },
  {
    id: 'v3',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/640px-Sintel_poster.jpg',
    title: 'Sintel',
    date: '2023-05-20',
    duration: '14:48',
    fileSize: '210 MB'
  }
];

type FilterType = 'all' | 'image' | 'video';

const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data url prefix
            resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const Gallery: React.FC = () => {
    const [items, setItems] = useState<MediaItem[]>(DEFAULT_ITEMS);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState<'modify' | 'animate'>('modify');
    const [editPrompt, setEditPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
    const [veoKeyNeeded, setVeoKeyNeeded] = useState(false);

    const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!selectedMedia) return;
        const currentIndex = filteredItems.findIndex(item => item.id === selectedMedia.id);
        const nextIndex = (currentIndex + 1) % filteredItems.length;
        setSelectedMedia(filteredItems[nextIndex]);
        resetEditor();
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!selectedMedia) return;
        const currentIndex = filteredItems.findIndex(item => item.id === selectedMedia.id);
        const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setSelectedMedia(filteredItems[prevIndex]);
        resetEditor();
    };
    
    const resetEditor = () => {
        setIsEditing(false);
        setEditMode('modify');
        setEditPrompt('');
        setGeneratedMediaUrl(null);
        setIsGenerating(false);
        setVeoKeyNeeded(false);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newItem: MediaItem = {
                id: Math.random().toString(36).substr(2, 9),
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: URL.createObjectURL(file),
                thumbnail: URL.createObjectURL(file), // simplified
                title: file.name,
                date: new Date().toISOString().split('T')[0],
                dimensions: file.type.startsWith('image') ? 'Detecting...' : undefined,
                fileSize: formatBytes(file.size),
            };
            
            // If it's an image, try to get actual dimensions
            if (file.type.startsWith('image')) {
                const img = new Image();
                img.onload = () => {
                    newItem.dimensions = `${img.width} x ${img.height}`;
                    setItems(prev => [newItem, ...prev]);
                };
                img.src = URL.createObjectURL(file);
            } else {
                setItems(prev => [newItem, ...prev]);
            }
        }
    };

    const handleEditGenerate = async () => {
        if (!selectedMedia || !editPrompt.trim()) return;
        
        // Check for Veo Key if animating
        if (editMode === 'animate' && (window as any).aistudio) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                 setVeoKeyNeeded(true);
                 return;
             }
        }

        setIsGenerating(true);
        setGeneratedMediaUrl(null);
        setVeoKeyNeeded(false);

        try {
            let base64 = '';
            // Handle Data URLs directly
            if (selectedMedia.url.startsWith('data:')) {
                 base64 = selectedMedia.url.split(',')[1];
            } else if (selectedMedia.url.startsWith('blob:')) {
                // Handle Blob URLs (local uploads)
                 base64 = await getBase64FromUrl(selectedMedia.url);
            } else {
                 // Handle External URLs
                 try {
                    base64 = await getBase64FromUrl(selectedMedia.url);
                 } catch (e) {
                     alert("Security restriction: Cannot edit this specific stock image directly. Please download it and upload it, or upload your own image to test the editor.");
                     setIsGenerating(false);
                     return;
                 }
            }
            
            if (editMode === 'modify') {
                const result = await editMedia(base64, 'image/jpeg', editPrompt);
                setGeneratedMediaUrl(result);
            } else {
                const result = await animateImage(base64, 'image/jpeg', editPrompt);
                setGeneratedMediaUrl(result);
            }
            
        } catch (e: any) {
            console.error(e);
            alert("Failed: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleConnectVeo = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setVeoKeyNeeded(false);
        }
    };

    const saveGeneratedMedia = () => {
        if (!generatedMediaUrl || !selectedMedia) return;
        const isVideo = editMode === 'animate';
        const newItem: MediaItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: isVideo ? 'video' : 'image',
            url: generatedMediaUrl,
            thumbnail: isVideo ? selectedMedia.thumbnail : generatedMediaUrl, // Use original thumbnail for video for now
            title: selectedMedia.title + (isVideo ? ' (Animated)' : ' (Edited)'),
            date: new Date().toISOString().split('T')[0],
            dimensions: isVideo ? '1280 x 720' : 'AI Edited',
            duration: isVideo ? '5s' : undefined,
            fileSize: 'AI Generated'
        };
        setItems(prev => [newItem, ...prev]);
        setSelectedMedia(newItem);
        resetEditor();
    };

    return (
        <div className="h-full w-full bg-white flex flex-col font-sans">
            {/* Header / Toolbar */}
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📷</span>
                    <h1 className="text-lg font-semibold text-gray-800">Gallery</h1>
                    <span className="text-sm text-gray-500 ml-2 border-l border-gray-300 pl-3">
                        {filteredItems.length} items
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                     <label className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <span>📤 Upload</span>
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} />
                    </label>

                    <div className="flex bg-gray-200 rounded-lg p-1">
                        {(['all', 'image', 'video'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                                    filter === f 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {f === 'all' ? 'All' : f + 's'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedMedia(item)}
                            className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                        >
                            {item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                                <img 
                                    src={item.thumbnail} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            )}
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                                <p className="text-white font-medium text-sm truncate">{item.title}</p>
                                <p className="text-gray-300 text-xs">{item.date}</p>
                            </div>

                            {/* Type Indicator */}
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
                                {item.type === 'video' ? (
                                    <>
                                        <span>▶</span>
                                        <span>{item.duration || 'Video'}</span>
                                    </>
                                ) : (
                                    <span>{item.dimensions?.split(' ')[0] || 'IMG'}</span>
                                )}
                            </div>
                            
                            {/* Center Play Button for Video */}
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50">
                                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {filteredItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <span className="text-6xl mb-4">📂</span>
                        <p className="text-lg font-medium">No media found in this category</p>
                    </div>
                )}
            </div>

            {/* Lightbox / Modal Viewer */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
                    onClick={() => { setSelectedMedia(null); resetEditor(); }}
                >
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white/80 z-50 bg-gradient-to-b from-black/60 to-transparent">
                         <div className="flex flex-col">
                             <h2 className="font-semibold text-lg leading-tight">{selectedMedia.title}</h2>
                             <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                 <span>{selectedMedia.date}</span>
                                 <span>•</span>
                                 <span className="bg-white/10 px-1.5 rounded">{selectedMedia.fileSize || 'Unknown Size'}</span>
                                 <span>•</span>
                                 <span className="text-blue-400 font-bold">
                                     {selectedMedia.type === 'image' ? selectedMedia.dimensions || 'Image' : `Duration: ${selectedMedia.duration || 'N/A'}`}
                                 </span>
                             </div>
                         </div>
                         <div className="flex gap-4 items-center">
                             {selectedMedia.type === 'image' && !isEditing && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30"
                                 >
                                    ✨ AI Edit
                                 </button>
                             )}
                             <button className="hover:text-white transition-colors" onClick={(e) => {e.stopPropagation(); setSelectedMedia(null); resetEditor();}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                             </button>
                         </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full h-full flex relative">
                        {/* Image/Video View */}
                        <div className={`flex-grow flex items-center justify-center p-4 sm:p-12 transition-all duration-300 ${isEditing ? 'mr-80' : ''}`} onClick={(e) => e.stopPropagation()}>
                            
                            {/* Navigation Buttons (Hidden when editing) */}
                            {!isEditing && (
                                <>
                                    <button 
                                        onClick={handlePrev}
                                        className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all z-40"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                    <button 
                                        onClick={handleNext}
                                        className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all z-40"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                </>
                            )}

                            {selectedMedia.type === 'image' ? (
                                <div className="relative max-w-full max-h-full flex gap-4">
                                     <img 
                                        src={selectedMedia.url} 
                                        alt={selectedMedia.title}
                                        className={`max-w-full max-h-[85vh] object-contain shadow-2xl transition-all duration-500 ${generatedMediaUrl && editMode === 'modify' ? 'opacity-50 blur-sm scale-95' : ''}`}
                                    />
                                    {generatedMediaUrl && editMode === 'modify' && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <img 
                                                src={generatedMediaUrl} 
                                                alt="Edited"
                                                className="max-w-full max-h-[85vh] object-contain shadow-2xl border-4 border-purple-500 rounded-lg animate-in fade-in zoom-in duration-300"
                                            />
                                            <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">EDITED</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden border border-white/10">
                                    <video 
                                        src={selectedMedia.url} 
                                        controls 
                                        autoPlay 
                                        className="w-full h-full"
                                        poster={selectedMedia.thumbnail}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                        </div>

                        {/* Editor Sidebar */}
                        {isEditing && (
                            <div 
                                className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-50" 
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        ✨ AI Studio
                                    </h3>
                                    <button onClick={resetEditor} className="text-gray-400 hover:text-white">✕</button>
                                </div>

                                <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
                                    <button 
                                        onClick={() => { setEditMode('modify'); setGeneratedMediaUrl(null); }}
                                        className={`flex-1 py-2 rounded text-sm font-bold transition-all ${editMode === 'modify' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Modify Image
                                    </button>
                                    <button 
                                        onClick={() => { setEditMode('animate'); setGeneratedMediaUrl(null); }}
                                        className={`flex-1 py-2 rounded text-sm font-bold transition-all ${editMode === 'animate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Animate (Video)
                                    </button>
                                </div>

                                <div className="flex-grow space-y-6">
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                                            {editMode === 'modify' ? 'Edit Instruction' : 'Animation Prompt'}
                                        </label>
                                        <textarea 
                                            value={editPrompt}
                                            onChange={(e) => setEditPrompt(e.target.value)}
                                            placeholder={editMode === 'modify' ? "e.g. Add snow, make it sunset..." : "e.g. A cinematic pan, flowing water..."}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                                        />
                                    </div>
                                    
                                    {veoKeyNeeded ? (
                                        <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg">
                                            <p className="text-blue-200 text-xs mb-3">Video generation requires a paid API key via Veo.</p>
                                            <button 
                                                onClick={handleConnectVeo}
                                                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 text-xs"
                                            >
                                                Connect Account
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleEditGenerate}
                                            disabled={!editPrompt.trim() || isGenerating}
                                            className={`w-full text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${editMode === 'modify' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    {editMode === 'modify' ? 'Editing...' : 'Generating Video...'}
                                                </>
                                            ) : (
                                                editMode === 'modify' ? 'Generate Edit' : 'Generate Video'
                                            )}
                                        </button>
                                    )}

                                    {generatedMediaUrl && (
                                        <div className="border-t border-gray-800 pt-6 animate-in fade-in">
                                            <p className="text-green-400 text-sm font-bold mb-4 text-center">✓ Generation Complete</p>
                                            
                                            {editMode === 'animate' && (
                                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                                                    <video src={generatedMediaUrl} controls autoPlay loop className="w-full h-auto" />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={saveGeneratedMedia} className="bg-white text-black font-bold py-2 rounded hover:bg-gray-200 text-sm">
                                                    Save to Gallery
                                                </button>
                                                <button onClick={() => setGeneratedMediaUrl(null)} className="border border-gray-600 text-gray-300 font-bold py-2 rounded hover:bg-gray-800 text-sm">
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-800/50 rounded-lg p-4 mt-auto">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            <strong>Note:</strong> Editing external stock photos might be blocked by browser security. Upload your own image for the best experience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
