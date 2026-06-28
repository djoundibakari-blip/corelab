import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap } from 'lucide-react';

export const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true); setError(null);
    try {
      await axios.post('/api/auth/register', {
        firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C] rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition";
  const labelClass = "block text-sm font-medium text-[#AACBC4] mb-2";

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
          <h2 className="text-xl font-bold text-white mb-6">Créer un compte élève</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prénom</label>
                <input name="firstName" type="text" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="Jean" required />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input name="lastName" type="text" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Dupont" required />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="votre@email.com" required />
            </div>

            <div>
              <label className={labelClass}>Mot de passe</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="6 caractères minimum" required />
            </div>

            <div>
              <label className={labelClass}>Confirmer le mot de passe</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#00DF81] hover:bg-[#2CC295] disabled:opacity-40 text-[#021B1A] font-bold py-3 rounded-lg transition text-sm">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-[#707D7D] mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[#00DF81] hover:text-[#2CC295] font-medium transition">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
