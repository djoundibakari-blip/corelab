import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, KeyRound } from 'lucide-react';

export const SetupPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 6) { setError('6 caractères minimum'); return; }
    setLoading(true);
    setError(null);
    try {
      await axios.put('/api/auth/setup-password', { password }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = { ...user, firstLogin: false };
      localStorage.setItem('user', JSON.stringify(updated));
      navigate(user?.role === 'admin' ? '/admin/suivi' : '/student/courses');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C] rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition";

  return (
    <div className="min-h-screen bg-[#021B1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00DF81] mb-4">
            <GraduationCap className="w-7 h-7 text-[#021B1A]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            CORE<span className="text-[#00DF81]">LAB</span>
          </h1>
          <p className="text-[#AACBC4] text-sm mt-1">Quiz &amp; Notes</p>
        </div>

        <div className="bg-[#032221] border border-[#03624C] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#00DF81]/15 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[#00DF81]" />
            </div>
            <h2 className="text-xl font-bold text-white">Choisissez votre mot de passe</h2>
          </div>
          <p className="text-sm text-[#707D7D] mb-6 ml-11">Première connexion — définissez un mot de passe personnel.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#AACBC4] mb-2">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className={inputClass} placeholder="6 caractères minimum" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#AACBC4] mb-2">Confirmer</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className={inputClass} placeholder="••••••••" required />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#00DF81] hover:bg-[#2CC295] disabled:opacity-40 text-[#021B1A] font-bold py-3 rounded-lg transition text-sm">
              {loading ? 'Enregistrement...' : 'Confirmer mon mot de passe'}
            </button>
            <button type="button" onClick={logout}
              className="w-full text-sm text-[#707D7D] hover:text-[#AACBC4] transition mt-1">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
