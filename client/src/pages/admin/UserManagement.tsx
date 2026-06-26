import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, Upload, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserItem { _id: string; firstName: string; lastName: string; email: string; role: string; }
interface Course { _id: string; title: string; }

export const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get('/api/users', { headers }).then(r => setUsers(r.data)),
      axios.get('/api/courses', { headers }).then(r => setCourses(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const r = await axios.post('/api/users/import', form, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setImportMsg(`✓ ${r.data.count} utilisateurs importés`);
      const updated = await axios.get('/api/users', { headers });
      setUsers(updated.data);
    } catch (err: any) {
      setImportMsg(`Erreur : ${err?.response?.data?.message ?? 'Import échoué'}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAssign = async (userId: string, courseId: string) => {
    setAssigning(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.post('/api/courses/assign-user', { userId, courseId }, { headers });
    } catch { /* ignore */ }
    finally { setAssigning(prev => ({ ...prev, [userId]: false })); }
  };

  if (loading) return <div className="text-center py-8 text-sm text-gray-500">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-40">
            <Upload className="w-4 h-4" />
            {importing ? 'Import...' : 'Importer CSV'}
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${importMsg.startsWith('✓') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
          {importMsg}
        </div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
        Format CSV : <code>firstName,lastName,email,password,role</code> — role = student ou admin
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Rôle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Assigner à un cours</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">Aucun utilisateur</td></tr>
            ) : users.map((u, i) => (
              <tr key={u._id} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {courses.map(c => (
                      <button key={c._id} onClick={() => handleAssign(u._id, c._id)}
                        disabled={assigning[u._id]}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded-lg hover:border-blue-400 hover:text-blue-600 transition">
                        <UserPlus className="w-3 h-3" />
                        {c.title}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
