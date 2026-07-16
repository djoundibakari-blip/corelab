import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, UserPlus, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserItem { _id: string; firstName: string; lastName: string; email: string; role: string; }
interface Course { _id: string; title: string; }

export const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get('/api/users', { headers }).then(r => setUsers(r.data)),
      axios.get('/api/courses', { headers }).then(r => setCourses(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setImportMsg({ ok: false, text: 'Format invalide — utilisez un fichier .csv' });
      return;
    }
    setImporting(true);
    setImportMsg(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const r = await axios.post('/api/users/import', form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setImportMsg({ ok: true, text: `${r.data.count} utilisateur${r.data.count > 1 ? 's' : ''} importé${r.data.count > 1 ? 's' : ''}` });
      const updated = await axios.get('/api/users', { headers });
      setUsers(updated.data);
    } catch (err: any) {
      setImportMsg({ ok: false, text: err?.response?.data?.message ?? 'Import échoué' });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleAssign = async (userId: string, courseId: string) => {
    setAssigning(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.post('/api/courses/assign-user', { userId, courseId }, { headers });
    } catch { /* ignore */ }
    finally { setAssigning(prev => ({ ...prev, [userId]: false })); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#707D7D]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00DF81]" />
          <h1 className="text-xl font-bold text-white">Gestion des Utilisateurs</h1>
        </div>
      </div>

      {/* Drag & Drop zone */}
      <div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        <div
          onClick={() => !importing && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all
            ${dragging
              ? 'border-[#00DF81] bg-[#00DF81]/10 scale-[1.01]'
              : 'border-[#03624C]/60 hover:border-[#00DF81]/60 hover:bg-[#00DF81]/5'
            } ${importing ? 'opacity-60 cursor-wait' : ''}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
            ${dragging ? 'bg-[#00DF81]/20' : 'bg-[#03624C]/30'}`}>
            {importing
              ? <div className="w-6 h-6 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
              : <Upload className={`w-6 h-6 ${dragging ? 'text-[#00DF81]' : 'text-[#AACBC4]'}`} />
            }
          </div>
          <div className="text-center">
            <p className={`font-semibold text-sm ${dragging ? 'text-[#00DF81]' : 'text-white'}`}>
              {importing ? 'Import en cours...' : dragging ? 'Relâchez pour importer' : 'Glissez votre fichier CSV ici'}
            </p>
            <p className="text-xs text-[#707D7D] mt-1">ou cliquez pour parcourir · format : <code className="text-[#AACBC4]">firstName, lastName, email, password, role</code></p>
          </div>
        </div>
      </div>

      {importMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border
          ${importMsg.ok
            ? 'bg-[#00DF81]/15 border-[#00DF81]/30 text-[#00DF81]'
            : 'bg-red-900/30 border-red-700/50 text-red-400'}`}>
          {importMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          {importMsg.text}
        </div>
      )}

      {/* Users table */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-[#03624C]/50 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00DF81]/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-[#00DF81]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white mb-1">Aucun utilisateur</p>
            <p className="text-sm text-[#707D7D]">Importez un fichier CSV pour ajouter des étudiants ou des administrateurs.</p>
          </div>
        </div>
      ) : (
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
              {users.map((u, i) => (
                <tr key={u._id}
                  className={`border-b border-[#03624C]/30 last:border-0 ${i % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#00DF81]/20 text-[#00DF81] text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#AACBC4]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      u.role === 'admin'
                        ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                        : 'bg-[#00DF81]/15 text-[#00DF81] border-[#00DF81]/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {courses.length === 0 ? (
                        <span className="text-xs text-[#707D7D]">Aucun cours disponible</span>
                      ) : courses.map(c => (
                        <button key={c._id} onClick={() => handleAssign(u._id, c._id)}
                          disabled={assigning[u._id]}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs border border-[#03624C]/50 rounded-lg text-[#AACBC4] hover:border-[#00DF81] hover:text-[#00DF81] hover:bg-[#00DF81]/5 transition disabled:opacity-40">
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
          <div className="px-4 py-2.5 border-t border-[#03624C]/30 bg-[#021B1A]">
            <p className="text-xs text-[#707D7D]">
              <span className="text-white font-semibold">{users.length}</span> utilisateur{users.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
