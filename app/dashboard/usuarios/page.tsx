'use client'
import { useState } from 'react';
import { api } from '../../../src/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Shield } from 'lucide-react';

export default function CadastrarUsuario() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' // Padrão é integrante comum
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/register', formData);
            alert("Novo membro cadastrado com sucesso!");
            router.push('/dashboard');
        } catch (err) {
            alert("Erro ao cadastrar usuário. Verifique se o e-mail já existe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition">
                    <ArrowLeft size={20} /> Voltar
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-600/20 rounded-2xl">
                        <UserPlus className="text-blue-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciar Equipe</h1>
                        <p className="text-zinc-500">Adicione novos integrantes, músicos ou administradores.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-900">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Nome Completo</label>
                        <input 
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">E-mail (Login)</label>
                            <input 
                                type="email"
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Senha Inicial</label>
                            <input 
                                type="password"
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                            <Shield size={16} className="text-blue-500" /> Nível de Acesso
                        </label>
                        <select 
                            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="USER">INTEGRANTE (Só vê letras)</option>
                            <option value="MUSICIAN">MÚSICO (Vê letras e cifras)</option>
                            <option value="ADMIN">ADMINISTRADOR (Controle total)</option>
                        </select>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold transition mt-4"
                    >
                        {loading ? 'Cadastrando...' : 'Confirmar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
}