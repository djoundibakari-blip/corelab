import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Lesson, Course } from '@/types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const LessonManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4242/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        // CORRECTION : Remplacement des faux ID ('1') par des formats valides MongoDB à 24 caractères
        setCourses([
          {
            _id: '65c201f1f1f1f1f1f1f1f1a1',
            title: 'Fondamentaux JavaScript',
            description: 'Apprenez les bases de JavaScript, ES6+ et les bonnes pratiques.',
            lessons: [
              { _id: '65c201f1f1f1f1f1f1f1f1b1', courseId: '65c201f1f1f1f1f1f1f1f1a1', title: 'Introduction à JavaScript', htmlContent: '', order: 1 },
              { _id: '65c201f1f1f1f1f1f1f1f1b2', courseId: '65c201f1f1f1f1f1f1f1f1a1', title: 'Variables et Types', htmlContent: '', order: 2 },
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
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

  // CORRECTION : Logique pour créer une nouvelle leçon vierge
  const handleCreateLesson = () => {
    if (!selectedCourse) return;
    setEditingLesson({
      _id: `new-${Date.now()}`, // Identifiant temporaire pour l'interface
      courseId: selectedCourse,
      title: 'Nouvelle leçon',
      htmlContent: '<p>Contenu de la leçon...</p>',
      order: lessons.length + 1
    });
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson({ ...lesson });
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = editingLesson._id.startsWith('new-');

      if (isNew) {
        // Logique de création (POST)
        const { _id, ...payload } = editingLesson;
        const response = await axios.post(
          'http://localhost:4242/api/lessons',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const created = response.data;
        setLessons(prev => [...prev, created]);
        setCourses(prev => prev.map(c => c._id === selectedCourse ? { ...c, lessons: [...c.lessons, created] } : c));
      } else {
        // Logique de mise à jour (PUT)
        await axios.put(
          `http://localhost:4242/api/lessons/${editingLesson._id}`,
          editingLesson,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLessons(prev => prev.map(l => l._id === editingLesson._id ? editingLesson : l));
        setCourses(prev => prev.map(c => {
          if (c._id === selectedCourse) {
            return { ...c, lessons: c.lessons.map(l => l._id === editingLesson._id ? editingLesson : l) };
          }
          return c;
        }));
      }

      setEditingLesson(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la leçon:', error);
      setEditingLesson(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLesson(null);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4242/api/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLessons(prev => prev.filter(l => l._id !== lessonId));
      setCourses(prev => prev.map(c => c._id === selectedCourse ? { ...c, lessons: c.lessons.filter(l => l._id !== lessonId) } : c));
    } catch (error) {
      console.error('Erreur lors de la suppression de la leçon:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des leçons...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Espace Admin</p>
        <h2 className="text-xl font-bold text-gray-900">Gestion des Leçons</h2>
        <p className="text-sm text-gray-600 mt-1">Modifiez le contenu pédagogique des cours.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un cours</label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition cursor-pointer"
        >
          <option value="">-- Choisir un cours --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>{course.title}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Leçons du cours</h3>
            <button 
              onClick={handleCreateLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une leçon
            </button>
          </div>

          {lessons.length === 0 && !editingLesson ? (
            <div className="p-8 text-center text-gray-600">Aucune leçon pour ce cours</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {editingLesson && editingLesson._id.startsWith('new-') && (
                <div className="p-4 bg-gray-50/50 border-b border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la nouvelle leçon</label>
                      <input
                        type="text"
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contenu HTML</label>
                      <textarea
                        value={editingLesson.htmlContent}
                        onChange={(e) => setEditingLesson({ ...editingLesson, htmlContent: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveLesson} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                        <Save className="w-4 h-4" /> {saving ? 'Création...' : 'Créer la leçon'}
                      </button>
                      <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-4 py-2 border text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4" /> Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="p-4">
                  {editingLesson?._id === lesson._id && !editingLesson._id.startsWith('new-') ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la leçon</label>
                        <input
                          type="text"
                          value={editingLesson.title}
                          onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu HTML</label>
                        <textarea
                          value={editingLesson.htmlContent}
                          onChange={(e) => setEditingLesson({ ...editingLesson, htmlContent: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveLesson} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                          <Save className="w-4 h-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-4 py-2 border text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100">
                          <X className="w-4 h-4" /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          <p className="text-xs text-gray-600">Ordre: {lesson.order}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditLesson(lesson)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteLesson(lesson._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
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
    </div>
  );
};