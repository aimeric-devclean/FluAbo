import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { Header } from '../components/Header';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { useStore } from '../store/useStore';
import { generateUUID } from '../utils/uuid';
import dayjs from 'dayjs';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const noteColors = [
  { name: 'Bleu', value: 'from-blue-400 to-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Violet', value: 'from-violet-400 to-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { name: 'Rose', value: 'from-pink-400 to-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { name: 'Vert', value: 'from-green-400 to-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'Orange', value: 'from-orange-400 to-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'Jaune', value: 'from-yellow-400 to-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
];

export const Notes: React.FC = () => {
  const notesStore = useStore((state) => state.notes || []);
  const setNotes = useStore((state) => state.setNotes);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: noteColors[0].value,
  });

  const handleCreateNote = () => {
    if (!formData.title.trim()) return;

    const newNote: Note = {
      id: generateUUID(),
      title: formData.title.trim(),
      content: formData.content.trim(),
      color: formData.color,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };

    setNotes([...(notesStore || []), newNote]);
    setFormData({ title: '', content: '', color: noteColors[0].value });
    setIsCreating(false);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !formData.title.trim()) return;

    const updatedNotes = (notesStore || []).map((note) =>
      note.id === editingNote.id
        ? {
            ...note,
            title: formData.title.trim(),
            content: formData.content.trim(),
            color: formData.color,
            updatedAt: dayjs().toISOString(),
          }
        : note
    );

    setNotes(updatedNotes);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: noteColors[0].value });
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Supprimer cette note ?')) {
      setNotes((notesStore || []).filter((note) => note.id !== id));
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color,
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
    setFormData({ title: '', content: '', color: noteColors[0].value });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: noteColors[0].value });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-pink-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-pink-950/10">
        <div className="px-4 pt-20 pb-40 max-w-2xl mx-auto animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Notes
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Organisez vos idées
              </p>
            </div>
          </div>

          {(isCreating || editingNote) && (
            <div className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-2xl p-4 shadow-lg">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la note"
                className="w-full mb-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                autoFocus
              />
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Contenu..."
                rows={4}
                className="w-full mb-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {noteColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${color.value} transition-all ${
                      formData.color === color.value
                        ? 'ring-4 ring-blue-500 scale-110'
                        : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingNote ? handleUpdateNote : handleCreateNote}
                  disabled={!formData.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {editingNote ? 'Modifier' : 'Créer'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-slate-700 dark:text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            </div>
          )}

          {(!notesStore || notesStore.length === 0) && !isCreating && !editingNote ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full flex items-center justify-center">
                <Edit3 size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Aucune note
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Créez votre première note pour commencer
              </p>
              <button
                onClick={startCreate}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Nouvelle note
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {(notesStore || []).map((note) => {
                const colorConfig = noteColors.find((c) => c.value === note.color) || noteColors[0];
                return (
                  <div
                    key={note.id}
                    className={`${colorConfig.bg} backdrop-blur-xl border border-gray-200/30 dark:border-slate-700/30 rounded-xl p-4 shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex-1">
                        {note.title}
                      </h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(note)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 dark:transition-colors active:scale-95"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 dark:transition-colors active:scale-95"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {note.content && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                        {note.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dayjs(note.updatedAt).format('DD/MM/YYYY à HH:mm')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!isCreating && !editingNote && (
        <FloatingActionButton
          onClick={startCreate}
        />
      )}
    </>
  );
};
