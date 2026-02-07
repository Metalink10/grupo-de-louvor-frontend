'use client'
import { useState, useEffect } from 'react';
import { api } from '../src/lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Key, LogIn, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cargoDesejado: 'USER', chaveAcesso: '' });

  // Limpa vestígios antigos para evitar conflitos de sessão
  useEffect(() => { localStorage.clear(); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: formData.email, senha: formData.senha });
      if (response.data && response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userName', response.data.nome);

        // INJEÇÃO IMEDIATA: Resolve o erro 401 na hora
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        window.location.href = '/dashboard';
      }
    } catch (err: any) { alert(err.response?.data?.erro || "Credenciais inválidas."); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/registrar', formData);
      alert("Sucesso! Agora faça seu login.");
      setIsLogin(true);
    } catch (err: any) { alert(err.response?.data?.erro || "Erro no cadastro."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
            {isLogin ? <LogIn className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">{isLogin ? 'Entrar' : 'Criar Conta'}</h1>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <input required placeholder="Nome Completo" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            )}
            <input required type="email" placeholder="E-mail" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <input required type="password" placeholder="Senha" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
            {!isLogin && (
              <>
                <select className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none"
                  value={formData.cargoDesejado} onChange={(e) => setFormData({ ...formData, cargoDesejado: e.target.value })}>
                  <option value="USER">Integrante</option>
                  <option value="MUSICIAN">Músico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {/* No seu arquivo de Registro (Frontend) */}
                {formData.cargoDesejado !== 'USER' && (
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      required
                      type='password'
                      autoComplete="new-password"
                      placeholder={formData.cargoDesejado === 'ADMIN' ? "Chave Mestra Admin" : "Chave de Músico"}
                      className="w-full bg-zinc-950 border border-blue-900/50 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500"
                      onChange={(e) => setFormData({ ...formData, chaveAcesso: e.target.value })} // Verifique se é chaveAcesso aqui
                    />
                  </div>
                )}
              </>
            )}
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-white transition mt-4">
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>
        </div>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-zinc-500 hover:text-white text-sm mt-8 transition">
          {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Login"}
        </button>
      </div>
    </div>
  );
}