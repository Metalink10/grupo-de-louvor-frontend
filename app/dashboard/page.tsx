'use client'
import { useEffect, useState } from 'react';
import { api } from '../../src/lib/api';
import { useRouter } from 'next/navigation';
import { Music, Plus, LogOut, Users, Search } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    // Definimos como any[] para o TypeScript aceitar as propriedades titulo, autor, etc.
    const [hinos, setHinos] = useState<any[]>([]);
    const [hinosFiltrados, setHinosFiltrados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');

        if (!token) { window.location.href = '/'; return; }

        setUserRole(role || 'USER');
        setUserName(name || 'Usuário');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        carregarHinos();
    }, []);

    // Lógica da Barra de Pesquisa Inteligente (Título, Autor, Número e Letra)
    useEffect(() => {
        const resultado = hinos.filter((hino, index) => {
            const numeroVisual = (index + 1).toString().padStart(2, '0');
            const termo = termoBusca;

            return (
                hino.titulo?.includes(termo) ||
                hino.autor?.includes(termo) ||
                hino.letra?.includes(termo) ||
                hino.cifraTexto?.includes(termo) ||
                numeroVisual.includes(termo)
            );
        });
        setHinosFiltrados(resultado);
    }, [termoBusca, hinos]);

    async function carregarHinos() {
        try {
            const response = await api.get('/hinos/todos');
            setHinos(response.data);
            setHinosFiltrados(response.data);
        } catch (err: any) {
            console.error("Erro no Dashboard:", err);
            if (err.response?.status === 401) window.location.href = '/';
        } finally { setLoading(false); }
    }

    const logout = () => { localStorage.clear(); window.location.href = '/'; };

    const formatarCargo = (cargo: string) => {
        if (cargo === 'ADMIN') return 'Administrador';
        if (cargo === 'MUSICIAN') return 'Músico';
        return 'Integrante';
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-bold animate-pulse uppercase tracking-widest text-xs">
            Carregando repertório...
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 p-6 text-white font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-blue-500 italic">Olá, {userName}!</h1>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">
                            Logado como: {formatarCargo(userRole)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {userRole === 'ADMIN' && (
                            <button onClick={() => router.push('/dashboard/membros')} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 p-2.5 rounded-xl border border-zinc-800 transition">
                                <Users size={18} />
                            </button>
                        )}
                        <button onClick={() => router.push('/dashboard/cadastrar')} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition shadow-lg shadow-blue-900/20">
                            <Plus size={18} /> Novo Louvor
                        </button>
                        <button onClick={logout} className="text-zinc-500 hover:text-white p-2 transition">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="relative mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar por título, autor, número ou trecho da letra..."
                        className="w-full bg-zinc-900/40 border border-zinc-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500/50 transition text-sm placeholder:text-zinc-700"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>

                {hinosFiltrados.length === 0 ? (
                    <div className="bg-zinc-900/20 border border-zinc-800 border-dashed rounded-[2.5rem] p-16 text-center text-zinc-600 text-sm font-medium">
                        Nenhum louvor encontrado para "{termoBusca}"
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hinosFiltrados.map((hino: any) => {
                            const numeroReal = hinos.findIndex(h => h.id === hino.id) + 1;

                            return (
                                <div
                                    key={hino.id}
                                    onClick={() => router.push(`/dashboard/hino/${hino.id}`)}
                                    className="bg-zinc-900/50 p-6 rounded-[1.8rem] border border-zinc-800 hover:border-blue-500/40 transition cursor-pointer group flex flex-col gap-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-600 tracking-widest opacity-50">
                                            {String(numeroReal).padStart(2, '0')}
                                        </span>
                                        <Music className="text-blue-500/60 group-hover:text-blue-400 transition" size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-zinc-100 group-hover:text-blue-500 transition line-clamp-1">
                                            {hino.titulo}
                                        </h2>
                                        <p className="text-zinc-500 text-[11px] mt-1 font-bold uppercase tracking-tight italic opacity-60">
                                            {hino.autor || "Ministério Desconhecido"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}