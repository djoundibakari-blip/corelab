import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) return;
      if (user.firstLogin) return;
      navigate(user.role === 'admin' ? '/admin/suivi' : '/student/courses');
    } catch {
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021B1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00DF81] mb-4">
            <GraduationCap className="w-7 h-7 text-[#021B1A]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            CORE<span className="text-[#00DF81]">LAB</span>
          </h1>
          <p className="text-[#AACBC4] text-sm mt-1">Quiz &amp; Notes</p>
        </div>

        {/* Card */}
        <div className="bg-[#032221] border border-[#03624C] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#AACBC4] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C] rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#AACBC4] mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C] rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00DF81] hover:bg-[#2CC295] disabled:opacity-40 disabled:cursor-not-allowed text-[#021B1A] font-bold py-3 rounded-lg transition-all duration-150 text-sm"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-[#707D7D] mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#00DF81] hover:text-[#2CC295] font-medium transition">
              Créer un compte élève
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
