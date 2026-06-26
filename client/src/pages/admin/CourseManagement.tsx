import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Course { _id: string; title: string; description: string; category: string; }

export const CourseManagement = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/courses', { headers }).then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) { setError('Tous les champs sont requis'); return; }
    setSaving(true); setError(null);
    try {
      const r = await axios.post('/api/courses', form, { headers });
      setCourses(prev => [...prev, r.data]);
      setForm({ title: '', description: '', category: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur serveur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
      await axios.delete(`/api/courses/${id}`, { headers });
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-8 text-sm text-gray-500">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900">Gestion des Cours</h1>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Créer un cours</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Titre du cours" required
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            placeholder="Catégorie (ex: JavaScript, React...)" required
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Description du cours" required rows={3}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving}
            className="flex items-center gap-1.5 self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-40">
            <Plus className="w-4 h-4" />
            {saving ? 'Création...' : 'Créer le cours'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Aucun cours créé.</p>
        ) : courses.map(c => (
          <div key={c._id} className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div>
              <p className="font-semibold text-gray-900">{c.title}</p>
              <p className="text-xs text-blue-600 font-medium mb-1">{c.category}</p>
              <p className="text-sm text-gray-500">{c.description}</p>
            </div>
            <button onClick={() => handleDelete(c._id)}
              className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
