import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, Upload, UserPlus } from 'lucide-react';
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

  if (loading) return <div className="text-center py-8 text-sm text-[#707D7D]">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00DF81]" />
          <h1 className="text-xl font-bold text-white">Gestion des Utilisateurs</h1>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] rounded-lg transition disabled:opacity-40">
            <Upload className="w-4 h-4" />
            {importing ? 'Import...' : 'Importer CSV'}
          </button>
        </div>
      </div>

      {importMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm border ${importMsg.startsWith('✓') ? 'bg-[#00DF81]/15 border-[#00DF81]/30 text-[#00DF81]' : 'bg-red-900/30 border-red-700/50 text-red-400'}`}>
          {importMsg}
        </div>
      )}

      <div className="text-xs text-[#707D7D] bg-[#021B1A] rounded-lg p-3 border border-[#03624C]/50">
        Format CSV : <code className="text-[#AACBC4]">firstName,lastName,email,password,role</code> — role = student ou admin
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#03624C]/50">
        <table className="w-full text-sm">
          <thead className="bg-[#021B1A] border-b border-[#03624C]/50">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Assigner à un cours'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-[#707D7D]">Aucun utilisateur</td></tr>
            ) : users.map((u, i) => (
              <tr key={u._id}
                className={`border-b border-[#03624C]/30 last:border-0 ${i % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                <td className="px-4 py-3 font-medium text-white">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-[#AACBC4]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' : 'bg-[#00DF81]/15 text-[#00DF81] border border-[#00DF81]/30'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {courses.map(c => (
                      <button key={c._id} onClick={() => handleAssign(u._id, c._id)}
                        disabled={assigning[u._id]}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-[#03624C]/50 rounded-lg text-[#AACBC4] hover:border-[#00DF81] hover:text-[#00DF81] transition">
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
