import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

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
      navigate(user?.role === 'admin' ? '/admin/gradebook' : '/student/courses');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CORE<span className="text-blue-600">LAB</span></h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Choisissez votre mot de passe</h2>
          <p className="text-sm text-gray-500 mb-6">Première connexion — définissez un mot de passe personnel.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="6 caractères minimum" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••" required />
            </div>
            {error && <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-lg transition text-sm">
              {loading ? 'Enregistrement...' : 'Confirmer mon mot de passe'}
            </button>
            <button type="button" onClick={logout}
              className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
