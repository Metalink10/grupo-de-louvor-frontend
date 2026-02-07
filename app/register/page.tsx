'use client'
import { useState } from 'react';
import { api } from '../../src/lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Key } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',      // Mudou de name para nome
        email: '',
        senha: '',     // Mudou de password para senha
        cargoDesejado: 'USER',
        chaveAcesso: '' // Campo novo exigido pelo seu backend
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Chamando a rota correta: /auth/registrar
            await api.post('/auth/registrar', formData); 
            alert("Cadastro realizado com sucesso!");
            router.push('/'); 
        } catch (err: any) {
            console.error(err.response?.data);
            alert(err.response?.data?.erro || "Erro ao se cadastrar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
                <h1 className="text-2xl font-bold text-center mb-8">Criar Conta</h1>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                        required
                        placeholder="Nome Completo"
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    />

                    <input 
                        required
                        type="email"
                        placeholder="E-mail"
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />

                    <input 
                        required
                        type="password"
                        placeholder="Senha"
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    />

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 font-bold ml-1 uppercase">Cargo</label>
                        <select 
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none"
                            value={formData.cargoDesejado}
                            onChange={(e) => setFormData({...formData, cargoDesejado: e.target.value})}
                        >
                            <option value="USER">Integrante</option>
                            <option value="MUSICIAN">Músico</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    {/* Campo de Chave de Acesso (Exigido pelo seu Backend) */}
                    {formData.cargoDesejado !== 'USER' && (
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input 
                                required
                                type='password'
                                placeholder="Chave de Acesso Secreta"
                                className="w-full bg-zinc-950 border border-blue-900/50 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500"
                                onChange={(e) => setFormData({...formData, chaveAcesso: e.target.value})}
                            />
                        </div>
                    )}

                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition mt-4"
                    >
                        {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
}