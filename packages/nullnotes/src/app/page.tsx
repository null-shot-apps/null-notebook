'use client';

import { useEffect, useState } from 'react';

type Note = {
  id: string;
  content: string;
  color: string;
  image?: string;
  position: { x: number; y: number };
  archived: boolean;
  createdAt: number;
};

const COLORS = [
  '#FFE066', // Yellow
  '#FF9999', // Pink
  '#99CCFF', // Blue
  '#99FF99', // Green
  '#FFCC99', // Orange
  '#E6B3FF', // Purple
  '#FFB3D9', // Rose
  '#B3E6CC', // Mint
];

export default function NullNotebook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nullnotes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('nullnotes')) {
      localStorage.setItem('nullnotes', JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      position: { 
        x: Math.random() * (window.innerWidth - 300), 
        y: Math.random() * (window.innerHeight - 300) + 100 
      },
      archived: false,
      createdAt: Date.now(),
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => note.id === id ? { ...note, ...updates } : note));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const archiveNote = (id: string) => {
    updateNote(id, { archived: true });
  };

  const restoreNote = (id: string) => {
    updateNote(id, { archived: false });
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateNote(id, { image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || 
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setDraggedNote(noteId);
      setDragOffset({
        x: e.clientX - note.position.x,
        y: e.clientY - note.position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNote) {
      updateNote(draggedNote, {
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  const activeNotes = notes.filter(n => !n.archived);
  const archivedNotes = notes.filter(n => n.archived);
  const displayNotes = showArchived ? archivedNotes : activeNotes;

  return (
    <div 
      className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-slate-800">Null Notebook</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 text-white rounded-full text-sm font-medium">
              <span>{activeNotes.length}</span>
              <span className="text-slate-300">open</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {showArchived ? 'Show Active' : `Archive (${archivedNotes.length})`}
            </button>
            <button
              onClick={createNote}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
            >
              + New Note
            </button>
          </div>
        </div>
      </header>

      {/* Notes Canvas */}
      <div className="absolute inset-0 pt-20">
        {displayNotes.map(note => (
          <div
            key={note.id}
            className="absolute w-72 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-move"
            style={{
              left: note.position.x,
              top: note.position.y,
              backgroundColor: note.color,
              zIndex: draggedNote === note.id ? 50 : 10,
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
          >
            {/* Color picker */}
            <div className="flex items-center justify-between p-2 border-b border-black/10">
              <div className="flex gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-full border-2 border-black/20 hover:border-black/40 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => updateNote(note.id, { color })}
                  />
                ))}
              </div>
              
              <div className="flex gap-1">
                {!showArchived && (
                  <button
                    onClick={() => archiveNote(note.id)}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    title="Archive"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                )}
                {showArchived && (
                  <button
                    onClick={() => restoreNote(note.id)}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    title="Restore"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            {note.image && (
              <div className="relative p-2">
                <img src={note.image} alt="Note" className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => updateNote(note.id, { image: undefined })}
                  className="absolute top-3 right-3 p-1 bg-black/50 hover:bg-black/70 text-white rounded transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
              placeholder="Start typing..."
              className="w-full p-4 bg-transparent resize-none outline-none font-sans text-slate-800 placeholder-slate-500"
              style={{ minHeight: '150px' }}
            />

            {/* Image upload button */}
            {!note.image && (
              <div className="p-2 border-t border-black/10">
                <label className="flex items-center gap-2 px-3 py-1 hover:bg-black/10 rounded cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Add image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(note.id, e)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {displayNotes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-slate-400 text-lg mb-4">
              {showArchived ? 'No archived notes' : 'No notes yet'}
            </p>
            {!showArchived && (
              <button
                onClick={createNote}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors"
              >
                Create your first note
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

