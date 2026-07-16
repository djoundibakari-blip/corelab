import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { Lesson, Course } from '@/types';
import { Plus, Edit, Trash2, Save, X, Upload, FileJson, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export const LessonManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [quizJson, setQuizJson] = useState('');
  const [quizImporting, setQuizImporting] = useState(false);
  const [quizMsg, setQuizMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [draggingJson, setDraggingJson] = useState(false);
  const quizFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
        setCourses(response.data);
      } catch {
        setCourses([{
          _id: '65c201f1f1f1f1f1f1f1f1a1', title: 'Fondamentaux JavaScript',
          description: 'Apprenez les bases de JavaScript.', lessons: [
            { _id: '65c201f1f1f1f1f1f1f1f1b1', courseId: '65c201f1f1f1f1f1f1f1f1a1', title: 'Introduction à JavaScript', htmlContent: '', order: 1 },
          ]
        }]);
      } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      setLessons(course?.lessons || []);
    } else {
      setLessons([]);
    }
  }, [selectedCourse]);

  const handleCreateLesson = () => {
    if (!selectedCourse) return;
    setEditingLesson({ _id: `new-${Date.now()}`, courseId: selectedCourse, title: 'Nouvelle leçon', htmlContent: '<p>Contenu de la leçon...</p>', order: lessons.length + 1 });
  };

  const handleEditLesson = (lesson: Lesson) => setEditingLesson({ ...lesson });

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = editingLesson._id.startsWith('new-');
      if (isNew) {
        const { _id, ...payload } = editingLesson;
        const response = await axios.post('/api/lessons', payload, { headers: { Authorization: `Bearer ${token}` } });
        const created = response.data;
        setLessons(prev => [...prev, created]);
        setCourses(prev => prev.map(c => c._id === selectedCourse ? { ...c, lessons: [...c.lessons, created] } : c));
      } else {
        await axios.put(`/api/lessons/${editingLesson._id}`, editingLesson, { headers: { Authorization: `Bearer ${token}` } });
        setLessons(prev => prev.map(l => l._id === editingLesson._id ? editingLesson : l));
        setCourses(prev => prev.map(c => {
          if (c._id === selectedCourse) return { ...c, lessons: c.lessons.map(l => l._id === editingLesson._id ? editingLesson : l) };
          return c;
        }));
      }
      setEditingLesson(null);
    } catch { setEditingLesson(null); }
    finally { setSaving(false); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Supprimer cette leçon ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      setCourses(prev => prev.map(c => c._id === selectedCourse ? { ...c, lessons: c.lessons.filter(l => l._id !== lessonId) } : c));
    } catch { /* ignore */ }
  };

  const loadJsonFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setQuizMsg({ ok: false, text: 'Format invalide — utilisez un fichier .json' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setQuizJson(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleQuizFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadJsonFile(file);
  };

  const handleJsonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingJson(false);
    const file = e.dataTransfer.files[0];
    if (file) loadJsonFile(file);
  };

  const handleImportQuiz = async () => {
    if (!selectedCourse) { setQuizMsg({ ok: false, text: 'Sélectionnez un cours d\'abord.' }); return; }
    if (!quizJson.trim()) { setQuizMsg({ ok: false, text: 'Le JSON est vide.' }); return; }
    let parsed: any;
    try { parsed = JSON.parse(quizJson); } catch { setQuizMsg({ ok: false, text: 'JSON invalide — vérifiez la syntaxe.' }); return; }
    const token = localStorage.getItem('token');
    setQuizImporting(true); setQuizMsg(null);
    try {
      await axios.post('/api/quizzes/import', { ...parsed, courseId: selectedCourse }, { headers: { Authorization: `Bearer ${token}` } });
      setQuizMsg({ ok: true, text: 'Quiz importé avec succès !' });
      setQuizJson('');
      if (quizFileRef.current) quizFileRef.current.value = '';
    } catch (err: any) {
      setQuizMsg({ ok: false, text: err?.response?.data?.message ?? 'Erreur lors de l\'import' });
    } finally { setQuizImporting(false); }
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C]/50 rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:ring-2 focus:ring-[#00DF81] focus:outline-none";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#707D7D]">Chargement des leçons...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Admin</p>
        <h2 className="text-xl font-bold text-white">Gestion des Leçons</h2>
        <p className="text-sm text-[#AACBC4] mt-1">Modifiez le contenu pédagogique des cours.</p>
      </div>

      {/* Course selector */}
      <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
        <label className="block text-sm font-medium text-[#AACBC4] mb-2">Sélectionner un cours</label>
        <select value={selectedCourse || ''} onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#032221] border border-[#03624C]/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition cursor-pointer">
          <option value="">-- Choisir un cours --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>{course.title}</option>
          ))}
        </select>
        {courses.length === 0 && (
          <p className="text-xs text-amber-400 mt-2">Aucun cours disponible. <a href="/admin/courses" className="text-[#00DF81] hover:underline">Créer un cours →</a></p>
        )}
      </div>

      {/* Lessons list */}
      {!selectedCourse ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-[#03624C]/50 rounded-xl">
          <BookOpen className="w-10 h-10 text-[#00DF81]/30" />
          <p className="text-sm text-[#707D7D]">Sélectionnez un cours ci-dessus pour gérer ses leçons.</p>
        </div>
      ) : (
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#03624C]/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Leçons du cours</h3>
              <p className="text-xs text-[#707D7D] mt-0.5">{lessons.length} leçon{lessons.length > 1 ? 's' : ''}</p>
            </div>
            <button onClick={handleCreateLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Ajouter une leçon
            </button>
          </div>

          {lessons.length === 0 && !editingLesson ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <BookOpen className="w-8 h-8 text-[#00DF81]/30" />
              <p className="text-sm text-[#707D7D]">Aucune leçon pour ce cours — cliquez sur «&nbsp;Ajouter&nbsp;» pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#03624C]/30">
              {editingLesson && editingLesson._id.startsWith('new-') && (
                <div className="p-5 bg-[#032221]/50">
                  <p className="text-xs font-semibold text-[#00DF81] uppercase mb-3">Nouvelle leçon</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#AACBC4] mb-1.5">Titre</label>
                      <input type="text" value={editingLesson.title}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                        className={inputClass} placeholder="Titre de la leçon" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#AACBC4] mb-1.5">Contenu HTML</label>
                      <textarea value={editingLesson.htmlContent}
                        onChange={(e) => setEditingLesson({ ...editingLesson, htmlContent: e.target.value })}
                        rows={6} className={`${inputClass} font-mono resize-none text-xs`} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveLesson} disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg">
                        <Save className="w-4 h-4" /> {saving ? 'Création...' : 'Créer la leçon'}
                      </button>
                      <button onClick={() => setEditingLesson(null)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#03624C]/50 text-[#AACBC4] text-sm rounded-lg hover:bg-[#021B1A]/50">
                        <X className="w-4 h-4" /> Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="p-4">
                  {editingLesson?._id === lesson._id && !editingLesson._id.startsWith('new-') ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#AACBC4] mb-1.5">Titre</label>
                        <input type="text" value={editingLesson.title}
                          onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#AACBC4] mb-1.5">Contenu HTML</label>
                        <textarea value={editingLesson.htmlContent}
                          onChange={(e) => setEditingLesson({ ...editingLesson, htmlContent: e.target.value })}
                          rows={6} className={`${inputClass} font-mono resize-none text-xs`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveLesson} disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg">
                          <Save className="w-4 h-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button onClick={() => setEditingLesson(null)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-[#03624C]/50 text-[#AACBC4] text-sm rounded-lg hover:bg-[#021B1A]/50">
                          <X className="w-4 h-4" /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00DF81]/20 flex items-center justify-center text-[#00DF81] font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{lesson.title}</h4>
                          <p className="text-xs text-[#707D7D]">Ordre : {lesson.order}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditLesson(lesson)}
                          className="p-2 rounded-lg hover:bg-[#00DF81]/10 text-[#AACBC4] hover:text-[#00DF81] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson._id)}
                          className="p-2 rounded-lg hover:bg-red-900/20 text-[#707D7D] hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import Quiz JSON — Drag & Drop */}
      <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#03624C]/50 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-[#00DF81]" />
          <h3 className="font-semibold text-white">Importer un Quiz (JSON)</h3>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {!selectedCourse && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-700/40 rounded-lg text-xs text-amber-300">
              ⚠ Sélectionnez un cours ci-dessus avant d'importer un quiz.
            </div>
          )}

          <div>
            <p className="text-xs text-[#707D7D] mb-3">
              Format attendu :{' '}
              <code className="bg-[#032221] px-1.5 py-0.5 rounded text-[#AACBC4]">
                {'{"title":"Mon Quiz","questions":[{"questionText":"...","propositions":["A","B"],"correctAnswer":"A"}]}'}
              </code>
            </p>

            {/* Drag & drop zone for JSON */}
            <input ref={quizFileRef} type="file" accept=".json" className="hidden" onChange={handleQuizFileChange} />
            <div
              onClick={() => quizFileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDraggingJson(true); }}
              onDragLeave={() => setDraggingJson(false)}
              onDrop={handleJsonDrop}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all
                ${draggingJson
                  ? 'border-[#00DF81] bg-[#00DF81]/10 scale-[1.01]'
                  : quizJson ? 'border-[#00DF81]/40 bg-[#00DF81]/5' : 'border-[#03624C]/50 hover:border-[#00DF81]/50 hover:bg-[#00DF81]/5'
                }`}>
              {quizJson ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-[#00DF81]" />
                  <p className="text-sm font-semibold text-[#00DF81]">Fichier JSON chargé</p>
                  <p className="text-xs text-[#707D7D]">Cliquez pour en charger un autre</p>
                </>
              ) : (
                <>
                  <Upload className={`w-6 h-6 ${draggingJson ? 'text-[#00DF81]' : 'text-[#AACBC4]'}`} />
                  <p className={`text-sm font-semibold ${draggingJson ? 'text-[#00DF81]' : 'text-white'}`}>
                    {draggingJson ? 'Relâchez pour charger' : 'Glissez votre fichier .json ici'}
                  </p>
                  <p className="text-xs text-[#707D7D]">ou cliquez pour parcourir</p>
                </>
              )}
            </div>
          </div>

          {/* JSON textarea */}
          <div>
            <label className="block text-xs font-medium text-[#AACBC4] mb-1.5">Contenu JSON</label>
            <textarea value={quizJson} onChange={(e) => setQuizJson(e.target.value)} rows={6}
              placeholder='{"title": "Mon Quiz", "questions": [...]}'
              className="w-full px-3 py-2.5 bg-[#032221] border border-[#03624C]/50 rounded-lg text-xs font-mono text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] resize-none" />
          </div>

          {quizMsg && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border
              ${quizMsg.ok
                ? 'bg-[#00DF81]/15 border-[#00DF81]/30 text-[#00DF81]'
                : 'bg-red-900/30 border-red-700/50 text-red-400'}`}>
              {quizMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
              {quizMsg.text}
            </div>
          )}

          <button onClick={handleImportQuiz} disabled={quizImporting || !selectedCourse || !quizJson.trim()}
            className="self-start flex items-center gap-1.5 px-5 py-2.5 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
            {quizImporting
              ? <><div className="w-4 h-4 border-2 border-[#021B1A] border-t-transparent rounded-full animate-spin" /> Import en cours...</>
              : <><Plus className="w-4 h-4" /> Importer le quiz</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};
