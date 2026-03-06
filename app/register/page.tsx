'use client'
import { useState } from 'react';
import { api } from '../../src/lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Key, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showGroupKey, setShowGroupKey] = useState(false);
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
            await api.post('/api/auth/registrar', formData);
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
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />

                    <input
                        required
                        type="email"
                        placeholder="E-mail"
                        className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className='relative'>
                        <div className="relative flex items-center">
                            <input
                                type={showGroupKey ? "text" : "password"}
                                name="chaveAcesso"
                                placeholder="Digite a chave do grupo (ex: Musico@...)"
                                className="w-full p-2 border rounded pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowGroupKey(!showGroupKey)}
                                className="absolute right-3 text-gray-500 hover:text-gray-700"
                            >
                                {showGroupKey ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 font-bold ml-1 uppercase">Cargo</label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 appearance-none"
                            value={formData.cargoDesejado}
                            onChange={(e) => setFormData({ ...formData, cargoDesejado: e.target.value })}
                        >
                            <option value="USER">Integrante</option>
                            <option value="MUSICIAN">Músico</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    
                    {/* Campo de Chave de Acesso (Exigido pelo seu Backend) */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input required placeholder="Nome Completo"
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />

                        <input required type="email" placeholder="E-mail"
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                        {/* SENHA PESSOAL */}
                        <div className="relative flex items-center">
                            <input required
                                type={showGroupKey ? "text" : "password"} // Reaproveitando showGroupKey
                                placeholder="Crie sua senha pessoal"
                                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500 pr-12"
                                onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
                            <button type="button" onClick={() => setShowGroupKey(!showGroupKey)} className="absolute right-4 text-zinc-500">
                                {showGroupKey ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 font-bold ml-1 uppercase">Cargo</label>
                            <select className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                                value={formData.cargoDesejado} onChange={(e) => setFormData({ ...formData, cargoDesejado: e.target.value })}>
                                <option value="USER">Integrante</option>
                                <option value="MUSICIAN">Músico</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>

                        {/* CHAVE DE ACESSO */}
                        {formData.cargoDesejado !== 'USER' && (
                            <div className="relative flex items-center">
                                <Key className="absolute left-4 text-zinc-500" size={18} />
                                <input required
                                    type={showGroupKey ? "text" : "password"}
                                    placeholder="Chave de Acesso Secreta"
                                    className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500"
                                    value={formData.chaveAcesso}
                                    onChange={(e) => setFormData({ ...formData, chaveAcesso: e.target.value })} />
                            </div>
                        )}

                        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition mt-4">
                            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>

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