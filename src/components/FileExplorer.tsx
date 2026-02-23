
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, { useState, useMemo, useEffect, useRef } from 'react';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
  size?: string;
  date: string;
  icon?: string; // Optional custom icon
}

const INITIAL_FILES: FileSystemItem[] = [
  // Root Folders
  { id: 'docs', name: 'Documents', type: 'folder', parentId: null, date: '2023-10-24' },
  { id: 'pics', name: 'Pictures', type: 'folder', parentId: null, date: '2023-10-25' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: null, date: '2023-11-01' },
  { id: 'work', name: 'Work', type: 'folder', parentId: null, date: '2023-10-20' },
  { id: 'music', name: 'Music', type: 'folder', parentId: null, date: '2023-10-18' },
  
  // Documents
  { id: 'resume', name: 'Resume.pdf', type: 'file', parentId: 'docs', size: '1.2 MB', date: '2023-09-15' },
  { id: 'budget', name: 'Budget_2024.xlsx', type: 'file', parentId: 'docs', size: '24 KB', date: '2023-10-28' },
  { id: 'notes', name: 'Meeting_Notes.txt', type: 'file', parentId: 'docs', size: '2 KB', date: '2023-11-02' },
  { id: 'specs', name: 'Project_Specs.docx', type: 'file', parentId: 'docs', size: '1.5 MB', date: '2023-11-05' },

  // Pictures
  { id: 'vacation', name: 'Vacation', type: 'folder', parentId: 'pics', date: '2023-08-10' },
  { id: 'profile', name: 'Profile_Pic.png', type: 'file', parentId: 'pics', size: '2.4 MB', date: '2023-10-01' },
  { id: 'beach', name: 'Beach.jpg', type: 'file', parentId: 'vacation', size: '3.1 MB', date: '2023-08-12' },
  { id: 'mountain', name: 'Mountain.jpg', type: 'file', parentId: 'vacation', size: '4.2 MB', date: '2023-08-14' },

  // Downloads
  { id: 'installer', name: 'ChromeSetup.exe', type: 'file', parentId: 'downloads', size: '1.4 MB', date: '2023-11-05' },
  { id: 'archive', name: 'Project_Backup.zip', type: 'file', parentId: 'downloads', size: '145 MB', date: '2023-11-04' },
  { id: 'image_dl', name: 'funny_cat.gif', type: 'file', parentId: 'downloads', size: '1.2 MB', date: '2023-11-06' },

  // Work
  { id: 'q4_plan', name: 'Q4_Plan.docx', type: 'file', parentId: 'work', size: '500 KB', date: '2023-10-22' },
  { id: 'pres', name: 'Presentation.pptx', type: 'file', parentId: 'work', size: '12 MB', date: '2023-10-23' },
  { id: 'invoice', name: 'Invoice_1001.pdf', type: 'file', parentId: 'work', size: '150 KB', date: '2023-10-25' },
];

export const FileExplorer: React.FC = () => {
  const [allFiles, setAllFiles] = useState<FileSystemItem[]>(INITIAL_FILES);
  const [currentPath, setCurrentPath] = useState<FileSystemItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Context Menu & Clipboard
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId: string | null } | null>(null);
  const [clipboard, setClipboard] = useState<{ id: string; action: 'copy' | 'cut' } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

  const items = useMemo(() => {
    if (searchQuery.trim()) {
      // Global search
      return allFiles.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Current folder
      return allFiles.filter(item => item.parentId === currentFolderId);
    }
  }, [currentFolderId, searchQuery, allFiles]);

  // Derived state for the preview panel
  const selectedFile = useMemo(() => {
      if (selectedIds.size !== 1) return null;
      const id = Array.from(selectedIds)[0];
      return allFiles.find(f => f.id === id) || null;
  }, [selectedIds, allFiles]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
            setContextMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavigate = (folder: FileSystemItem) => {
    if (folder.type === 'folder') {
      setCurrentPath([...currentPath, folder]);
      setSearchQuery(''); // Clear search on navigation
      setSelectedIds(new Set()); // Clear selection on navigate
    } else {
        // Mock opening file
        console.log(`Opening ${folder.name}...`);
    }
  };

  const handleNavigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedIds(new Set());
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedIds(new Set());
  };

  const handleHomeClick = () => {
    setCurrentPath([]);
    setSearchQuery('');
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string, multi: boolean) => {
      const newSet = new Set(multi ? selectedIds : []);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  }

  const handleContextMenu = (e: React.MouseEvent, itemId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Calculate adjusted position to prevent menu going off-screen
      let x = e.clientX;
      let y = e.clientY;
      const menuWidth = 180;
      const menuHeight = 250;
      
      if (x + menuWidth > window.innerWidth) x -= menuWidth;
      if (y + menuHeight > window.innerHeight) y -= menuHeight;

      setContextMenu({ x, y, targetId: itemId });
      
      if (itemId) {
          setSelectedIds(new Set([itemId]));
      } else {
          // If right-clicking background, clear selection unless CTRL is held, 
          // but for simplicity we'll just clear it to focus on the folder actions
          setSelectedIds(new Set());
      }
  };

  const handleMenuAction = (action: string) => {
      if (!contextMenu) return;
      const { targetId } = contextMenu;
      const targetItem = allFiles.find(f => f.id === targetId);

      switch (action) {
          case 'copy':
              if (targetId) setClipboard({ id: targetId, action: 'copy' });
              break;
          case 'cut':
              if (targetId) setClipboard({ id: targetId, action: 'cut' });
              break;
          case 'paste':
              if (clipboard) {
                  const sourceItem = allFiles.find(f => f.id === clipboard.id);
                  if (sourceItem) {
                      const newId = Math.random().toString(36).substr(2, 9);
                      
                      if (clipboard.action === 'cut') {
                          // Move item logic
                          setAllFiles(prev => prev.map(f => f.id === clipboard.id ? { ...f, parentId: currentFolderId } : f));
                          setClipboard(null); // Clear clipboard after move
                      } else {
                          // Copy item logic
                          const newItem: FileSystemItem = {
                              ...sourceItem,
                              id: newId,
                              parentId: currentFolderId,
                              name: sourceItem.name.includes(' - Copy') ? sourceItem.name : `${sourceItem.name} - Copy`,
                              date: new Date().toISOString().split('T')[0]
                          };
                          setAllFiles(prev => [...prev, newItem]);
                      }
                  }
              }
              break;
          case 'rename':
              if (targetItem) {
                  const newName = prompt('Enter new name:', targetItem.name);
                  if (newName && newName !== targetItem.name) {
                      setAllFiles(prev => prev.map(f => f.id === targetId ? { ...f, name: newName } : f));
                  }
              }
              break;
          case 'edit':
              alert(`Editing ${targetItem?.name} in default editor...`);
              break;
          case 'convert':
              alert(`Converting ${targetItem?.name}... (Simulation)`);
              break;
          case 'share':
              if (navigator.share && targetItem) {
                   navigator.share({
                       title: targetItem.name,
                       text: `Check out ${targetItem.name}`,
                       url: window.location.href
                   }).catch(() => alert(`Sharing ${targetItem?.name} to app...`));
              } else {
                  alert(`Sharing ${targetItem?.name} to app...`);
              }
              break;
          case 'delete':
              if (targetId) {
                  if (confirm(`Are you sure you want to delete ${targetItem?.name}?`)) {
                      setAllFiles(prev => prev.filter(f => f.id !== targetId));
                  }
              }
              break;
          case 'new_folder':
              const folderName = prompt('Enter folder name:', 'New Folder');
              if (folderName) {
                  const newFolder: FileSystemItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      name: folderName,
                      type: 'folder',
                      parentId: currentFolderId,
                      date: new Date().toISOString().split('T')[0]
                  };
                  setAllFiles(prev => [...prev, newFolder]);
              }
              break;
      }
      setContextMenu(null);
  };

  // Icons mapping
  const getIcon = (item: FileSystemItem) => {
      if (item.type === 'folder') return '📁';
      if (item.name.endsWith('.pdf')) return '📕';
      if (item.name.endsWith('.xlsx')) return '📊';
      if (item.name.endsWith('.docx')) return '📝';
      if (item.name.endsWith('.pptx')) return '📽️';
      if (item.name.endsWith('.jpg') || item.name.endsWith('.png') || item.name.endsWith('.gif')) return '🖼️';
      if (item.name.endsWith('.exe')) return '📦';
      if (item.name.endsWith('.zip')) return '🤐';
      if (item.name.endsWith('.txt')) return '📄';
      if (item.name.endsWith('.mp3')) return '🎵';
      return '📄';
  };

  const getPreviewContent = (file: FileSystemItem) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'png', 'gif', 'jpeg'].includes(ext || '')) {
      return (
        <div className="w-full aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
           <img 
              src={`https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(file.name)}`} 
              alt={file.name} 
              className="w-full h-full object-cover"
           />
        </div>
      );
    }
    
    if (['txt', 'md', 'json', 'js', 'ts', 'docx', 'pdf'].includes(ext || '')) {
      return (
        <div className="w-full h-48 bg-white border border-gray-200 rounded p-3 shadow-sm overflow-hidden">
          <div className="flex gap-1 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <div className="text-[10px] font-mono text-gray-500 space-y-1">
            <p className="text-gray-800 font-bold">Previewing {file.name}...</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
            <p className="opacity-50">...</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="w-full aspect-square max-h-48 bg-gray-50 rounded flex flex-col items-center justify-center border border-gray-200 text-gray-400">
         <span className="text-6xl mb-2 opacity-50">{getIcon(file)}</span>
         <span className="text-xs">No preview available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans select-none relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1">
            <button 
                onClick={handleNavigateUp} 
                disabled={currentPath.length === 0 && !searchQuery}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                title="Up"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button onClick={handleHomeClick} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </button>
        </div>
        
        {/* Breadcrumbs / Address Bar */}
        <div className="flex-grow flex items-center bg-white border border-gray-300 rounded px-2 py-1 text-sm overflow-hidden h-8">
            <button onClick={handleHomeClick} className="hover:bg-gray-100 px-1 rounded flex-shrink-0">Home</button>
            {currentPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <span className="text-gray-400 mx-1 flex-shrink-0">›</span>
                    <button 
                        onClick={() => handleBreadcrumbClick(index)}
                        className="hover:bg-gray-100 px-1 rounded truncate max-w-[100px]"
                    >
                        {folder.name}
                    </button>
                </React.Fragment>
            ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
            <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-2 text-xs text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-200 rounded p-0.5">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-300 text-gray-500'}`}
                title="Grid View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-300 text-gray-500'}`}
                title="List View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-2 flex flex-col gap-1 text-sm hidden sm:flex flex-shrink-0">
            <div className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-2 px-2 mt-2">Quick Access</div>
            <button onClick={handleHomeClick} className="text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2 text-gray-700">
                <span className="text-lg">🏠</span> Home
            </button>
            <button onClick={() => handleNavigate(INITIAL_FILES[0])} className="text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2 text-gray-700">
                <span className="text-lg">📄</span> Documents
            </button>
            <button onClick={() => handleNavigate(INITIAL_FILES[1])} className="text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2 text-gray-700">
                <span className="text-lg">🖼️</span> Pictures
            </button>
            <button onClick={() => handleNavigate(INITIAL_FILES[2])} className="text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2 text-gray-700">
                <span className="text-lg">⬇️</span> Downloads
            </button>
            <div className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-2 px-2 mt-4">Drives</div>
            <div className="text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2 text-gray-700">
                <span className="text-lg">💿</span> Local Disk (C:)
            </div>
        </div>

        {/* Main Content */}
        <div 
            className="flex-grow p-4 overflow-y-auto bg-white relative" 
            onClick={() => setSelectedIds(new Set())}
            onContextMenu={(e) => handleContextMenu(e, null)}
        >
            {searchQuery && (
                <div className="mb-4 text-sm text-gray-500 flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100">
                    <span>🔍</span>
                    Search results for "<span className="font-bold">{searchQuery}</span>" — {items.length} items found
                </div>
            )}

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="text-6xl mb-4 opacity-20">📭</div>
                    <p className="text-sm font-medium">This folder is empty</p>
                </div>
            ) : (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {items.map(item => (
                            <div 
                                key={item.id}
                                onClick={(e) => { e.stopPropagation(); toggleSelection(item.id, e.ctrlKey || e.metaKey); }}
                                onDoubleClick={() => handleNavigate(item)}
                                onContextMenu={(e) => handleContextMenu(e, item.id)}
                                className={`flex flex-col items-center p-4 rounded border transition-all cursor-pointer group ${selectedIds.has(item.id) ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300' : 'border-transparent hover:bg-gray-100'}`}
                            >
                                <div className="text-5xl mb-3 drop-shadow-sm transition-transform group-hover:scale-105">{getIcon(item)}</div>
                                <div className="text-xs text-center break-words w-full line-clamp-2 px-1 leading-tight text-gray-700">{item.name}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 font-medium border-b border-gray-200">Name</th>
                                <th className="px-4 py-2 font-medium w-32 border-b border-gray-200">Date</th>
                                <th className="px-4 py-2 font-medium w-24 border-b border-gray-200">Type</th>
                                <th className="px-4 py-2 font-medium w-24 border-b border-gray-200">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr 
                                    key={item.id}
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id, e.ctrlKey || e.metaKey); }}
                                    onDoubleClick={() => handleNavigate(item)}
                                    onContextMenu={(e) => handleContextMenu(e, item.id)}
                                    className={`cursor-pointer transition-colors ${selectedIds.has(item.id) ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="px-4 py-2 flex items-center gap-3 border-b border-gray-50">
                                        <span className="text-lg">{getIcon(item)}</span>
                                        <span className="text-gray-700">{item.name}</span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 border-b border-gray-50">{item.date}</td>
                                    <td className="px-4 py-2 text-gray-500 capitalize border-b border-gray-50">{item.type}</td>
                                    <td className="px-4 py-2 text-gray-500 font-mono text-xs border-b border-gray-50">{item.size || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </div>

        {/* Preview Panel */}
        {selectedFile && (
            <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0 animate-in slide-in-from-right-2 duration-200 shadow-xl z-10">
                <div className="flex flex-col items-center text-center">
                    <div className="text-6xl mb-4 drop-shadow-md animate-in zoom-in duration-300">{getIcon(selectedFile)}</div>
                    <h3 className="font-semibold text-gray-800 break-words w-full text-sm">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{selectedFile.type === 'folder' ? 'File Folder' : selectedFile.type.toUpperCase() + ' File'}</p>
                </div>

                <div className="border-t border-gray-200 pt-4 w-full">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Properties</h4>
                    <div className="space-y-2 text-xs">
                        {selectedFile.size && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Size</span>
                                <span className="text-gray-800 font-mono">{selectedFile.size}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="text-gray-800">{selectedFile.date}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">Location</span>
                            <span className="text-gray-800 truncate max-w-[120px]" title={currentPath.map(p => p.name).join('/') || 'Home'}>
                                {currentPath.length > 0 ? currentPath[currentPath.length-1].name : 'Home'}
                            </span>
                        </div>
                    </div>
                </div>

                {selectedFile.type === 'file' && (
                    <div className="border-t border-gray-200 pt-4 w-full flex-grow flex flex-col">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</h4>
                        {getPreviewContent(selectedFile)}
                    </div>
                )}
                
                <div className="mt-auto pt-4 flex gap-2 justify-center">
                     <button className="flex-1 bg-white border border-gray-300 rounded py-2 text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm">Open</button>
                     <button className="flex-1 bg-blue-600 border border-blue-600 text-white rounded py-2 text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">Share</button>
                </div>
            </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-1 text-xs text-gray-500 flex justify-between items-center h-6 flex-shrink-0">
          <span>{items.length} items</span>
          <div className="flex gap-4">
             <span>{selectedIds.size > 0 ? `${selectedIds.size} selected` : ''}</span>
             <span className="border-l border-gray-300 pl-4">Local Disk (C:)</span>
          </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
          <div 
            ref={contextMenuRef}
            className="fixed bg-white border border-gray-200 shadow-xl rounded-md py-1 z-[100] min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              {contextMenu.targetId ? (
                  <>
                      <button onClick={() => handleMenuAction('copy')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>📋</span> Copy
                      </button>
                      <button onClick={() => handleMenuAction('cut')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>✂️</span> Cut
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button onClick={() => handleMenuAction('rename')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>✏️</span> Rename
                      </button>
                      <button onClick={() => handleMenuAction('edit')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>📝</span> Edit
                      </button>
                      <button onClick={() => handleMenuAction('convert')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>🔄</span> Convert
                      </button>
                      <button onClick={() => handleMenuAction('share')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>📤</span> Share to app
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button onClick={() => handleMenuAction('delete')} className="w-full text-left px-4 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <span>🗑️</span> Delete
                      </button>
                  </>
              ) : (
                  <>
                      <button onClick={() => handleMenuAction('new_folder')} className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>📁</span> New Folder
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button 
                        onClick={() => handleMenuAction('paste')} 
                        disabled={!clipboard}
                        className={`w-full text-left px-4 py-1.5 text-xs flex items-center gap-2 ${clipboard ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-400 cursor-not-allowed'}`}
                      >
                          <span>📋</span> Paste
                      </button>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button className="w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2">
                          <span>⚙️</span> Properties
                      </button>
                  </>
              )}
          </div>
      )}
    </div>
  );
};
