'use client'
import { useState, useEffect } from 'react';
import { api } from '../../../src/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Music, FileText, Plus, Minus, Image as ImageIcon } from 'lucide-react';

export default function CadastrarHino() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState('');

    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        letra: '',
        tom: 'C',
        cifraTexto: ''
    });

    const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role || 'USER');
    }, []);

    // Lógica de transposição para o campo de Tom
    const alterarTomManual = (semitons: number) => {
        const indexAtual = notas.indexOf(formData.tom.toUpperCase());
        if (indexAtual === -1) return;

        let novoIndex = (indexAtual + semitons) % 12;
        if (novoIndex < 0) novoIndex += 12;
        setFormData({ ...formData, tom: notas[novoIndex] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Define a rota baseada no cargo para respeitar seu backend
            const rota = (userRole === 'MUSICIAN' || userRole === 'ADMIN')
                ? '/api/hinos/musico/admin'
                : '/api/hinos/integrante/criar';

            await api.post(rota, formData);
            alert("Louvor cadastrado com sucesso!");
            router.push('/dashboard');
        } catch (error: any) {
            alert(error.response?.data?.erro || "Erro ao salvar louvor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition uppercase text-[10px] font-black tracking-widest">
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    <div className="bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Modo: {userRole}</span>
                    </div>
                </header>

                <h1 className="text-4xl font-black tracking-tighter mb-8 italic">NOVO LOUVOR</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos Básicos (Comum a todos) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Título do Hino</label>
                            <input required className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-blue-500 transition"
                                value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Ministério / Autor</label>
                            <input required className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-blue-500 transition"
                                value={formData.autor} onChange={(e) => setFormData({ ...formData, autor: e.target.value })} />
                        </div>
                    </div>

                    {/* SE FOR MÚSICO OU ADMIN: Mostra Tom e Cifra */}
                    {(userRole === 'MUSICIAN' || userRole === 'ADMIN') ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 w-fit">
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-blue-500 uppercase mb-1">Tom Base</p>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => alterarTomManual(-1)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"><Minus size={16} /></button>
                                        <span className="text-2xl font-black text-white w-8">{formData.tom}</span>
                                        <button type="button" onClick={() => alterarTomManual(1)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-blue-500 uppercase ml-2 flex items-center gap-2">
                                    <Music size={12} /> Cifra e Letra (Campo Técnico)
                                </label>
                                <textarea
                                    className="w-full bg-zinc-900 border border-blue-500/20 p-6 rounded-3xl outline-none focus:border-blue-500 transition font-mono text-sm min-h-[400px]"
                                    placeholder="Digite a letra com os acordes em cima..."
                                    value={formData.cifraTexto}
                                    onChange={(e) => setFormData({ ...formData, cifraTexto: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        /* SE FOR INTEGRANTE: Mostra apenas Letra Limpa */
                        <div className="space-y-2 animate-in fade-in duration-500">
                            <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-2">
                                <FileText size={12} /> Letra do Louvor
                            </label>
                            <textarea
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-3xl outline-none focus:border-blue-500 transition text-lg min-h-[400px]"
                                placeholder="Digite apenas a letra do hino, estrofe por estrofe..."
                                value={formData.letra}
                                onChange={(e) => setFormData({ ...formData, letra: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Botão de salvar Imagem (Se o Músico não quiser digitar) */}
                    {(userRole === 'MUSICIAN' || userRole === 'ADMIN') && (
                        <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-6 rounded-3xl flex flex-col items-center">
                            <ImageIcon className="text-zinc-700 mb-2" size={24} />
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Upload de Cifra em Imagem (Opcional)</p>
                            <input type="file" className="mt-4 text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-zinc-400 hover:file:bg-zinc-700" />
                        </div>
                    )}

                    <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3">
                        {loading ? "SALVANDO..." : <><Save size={20} /> Finalizar Cadastro</>}
                    </button>
                </form>
            </div>
        </div>
    );
}