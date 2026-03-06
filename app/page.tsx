'use client';
import { useState, useEffect } from 'react';
import { api } from '../src/lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Key, LogIn, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showGroupKey, setShowGroupKey] = useState(false); // Olhinho para a chave de grupo
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    senha: '', 
    cargoDesejado: 'USER', 
    chaveAcesso: '' 
  });

  useEffect(() => { 
    localStorage.clear(); 
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email: formData.email, senha: formData.senha });
      if (response.data && response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userName', response.data.nome);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        window.location.href = '/dashboard';
      }
    } catch (err: any) { 
      alert(err.response?.data?.erro || "Credenciais inválidas."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('api/auth/registrar', formData);
      alert("Sucesso! Agora faça seu login.");
      setIsLogin(true);
    } catch (err: any) { 
      alert(err.response?.data?.erro || "Erro ao criar conta."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <div className="bg-blue-600 w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-900/40">
            {isLogin ? <LogIn className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter">
            {isLogin ? 'Gestão de Louvores' : 'Criar Conta'}
          </h1>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            
            {!isLogin && (
              <div className="relative flex items-center">
                <User className="absolute left-4 text-zinc-500" size={18} />
                <input 
                  required 
                  placeholder="Nome Completo" 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500"
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })} 
                />
              </div>
            )}

            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-zinc-500" size={18} />
              <input 
                required 
                type="email" 
                placeholder="E-mail" 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>

            {/* CAMPO DE SENHA COM OLHINHO */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-zinc-500" size={18} />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 pr-12 rounded-2xl text-white outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none"
                  value={formData.cargoDesejado} 
                  onChange={(e) => setFormData({ ...formData, cargoDesejado: e.target.value })}
                >
                  <option value="USER">Integrante</option>
                  <option value="MUSICIAN">Músico</option>
                  <option value="ADMIN">Administrador</option>
                </select>

                {formData.cargoDesejado !== 'USER' && (
                  <div className="relative flex items-center">
                    <Key className="absolute left-4 text-zinc-500" size={18} />
                    <input
                      required
                      type={showGroupKey ? "text" : "password"}
                      placeholder="Chave de músico para cadastro"
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 pr-12 rounded-2xl text-white outline-none focus:border-blue-500"
                      value={formData.chaveAcesso}
                      onChange={(e) => setFormData({ ...formData, chaveAcesso: e.target.value })}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowGroupKey(!showGroupKey)}
                      className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showGroupKey ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}
              </>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-white transition-all mt-4 active:scale-[0.98]"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Criar minha conta')}
            </button>
          </form>
        </div>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center mt-4 text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {isLogin ? 'Não tem conta? Crie uma aqui' : 'Já tem conta? Faça login'}
        </button>
      </div>
    </div>
  );
}