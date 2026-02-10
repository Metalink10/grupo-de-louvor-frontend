// 'use client'
// import { useEffect, useState } from 'react';
// import { api } from '../../../src/lib/api';
// import { User, Trash2, ShieldCheck, X, Lock, ArrowLeft, Star, Save } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export default function GestaoMembros() {
//     const router = useRouter();
//     const [membros, setMembros] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Estados para o Modal de Confirmação
//     const [confirmacao, setConfirmacao] = useState<{ aberto: boolean, tipo: 'DELETAR' | 'PROMOVER', id: string, novoCargo?: string }>({
//         aberto: false, tipo: 'DELETAR', id: ''
//     });
//     const [senhaAdmin, setSenhaAdmin] = useState('');

//     useEffect(() => {
//         carregarMembros();
//     }, []);

//     async function carregarMembros() {
//         try {
//             const token = localStorage.getItem('userToken'); // Busca o token salvo no login

//             if (!token) {
//                 window.location.href = '/';
//                 return;
//             }

//             // Faz a chamada com o prefixo correto (/api/auth) e envia o Token
//             const res = await api.get('/auth/usuarios', {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });

//             setMembros(res.data);
//         } catch (err: any) {
//             console.error("Erro ao carregar membros:", err);
//             if (err.response?.status === 401) {
//                 alert("Sessão expirada. Faça login novamente.");
//                 window.location.href = '/';
//             }
//         } finally {
//             setLoading(false);
//         }
//     }

//     const executarAcao = async () => {
//         try {
//             const token = localStorage.getItem('userToken');
//             const config = {
//                 headers: { Authorization: `Bearer ${token}` }
//             };

//             if (confirmacao.tipo === 'DELETAR') {
//                 // No DELETE, o corpo (data) vai dentro do config
//                 await api.delete(`/auth/usuarios/deletar/${confirmacao.id}`, {
//                     ...config,
//                     data: { senhaAdmin }
//                 });
//                 alert("Membro removido.");
//             } else {
//                 // No PUT, o config é o terceiro parâmetro
//                 await api.put(`/auth/usuarios/alterar-cargo/${confirmacao.id}`, {
//                     novoCargo: confirmacao.novoCargo,
//                     senhaAdmin
//                 }, config);
//                 alert("Cargo atualizado!");
//             }

//             setConfirmacao({ aberto: false, tipo: 'DELETAR', id: '' });
//             setSenhaAdmin('');
//             carregarMembros(); // Recarrega a lista
//         } catch (err: any) {
//             alert(err.response?.data?.erro || "Erro na operação. Verifique a senha.");
//         }
//     };

//     if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-bold">CARREGANDO MEMBROS...</div>;

//     return (
//         <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
//             <div className="max-w-5xl mx-auto">
//                 <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition text-[10px] font-black uppercase">
//                     <ArrowLeft size={16} /> Voltar ao Painel
//                 </button>

//                 <h1 className="text-4xl font-black tracking-tighter mb-10 flex items-center gap-4">
//                     <ShieldCheck className="text-blue-500" size={36} /> GESTÃO DO MINISTÉRIO
//                 </h1>

//                 <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="bg-zinc-900/60 border-b border-zinc-800">
//                                 <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nome</th>
//                                 <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">E-mail</th>
//                                 <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cargo Atual</th>
//                                 <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center">Ações</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {membros.map((m: any) => (
//                                 <tr key={m.id} className="border-b border-zinc-900/50 hover:bg-zinc-800/20 transition">
//                                     <td className="p-6 font-bold">{m.nome}</td>
//                                     <td className="p-6 text-zinc-400 text-sm">{m.email}</td>
//                                     <td className="p-6">
//                                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
//                                             m.role === 'MUSICIAN' ? 'bg-blue-500/10 text-blue-500' :
//                                                 'bg-zinc-800 text-zinc-400'
//                                             }`}>
//                                             {m.role === 'ADMIN' ? 'Administrador' : m.role === 'MUSICIAN' ? 'Músico' : 'Integrante'}
//                                         </span>
//                                     </td>
//                                     <td className="p-6 flex justify-center gap-3">
//                                         <select
//                                             className="bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-bold p-1 outline-none"
//                                             onChange={(e) => setConfirmacao({ aberto: true, tipo: 'PROMOVER', id: m.id, novoCargo: e.target.value })}
//                                             value={m.role} // Mudado para role
//                                         >
//                                             <option value="USER">Integrante</option>
//                                             <option value="MUSICIAN">Músico</option>
//                                             <option value="ADMIN">Admin</option>
//                                         </select>

//                                         <button
//                                             onClick={() => setConfirmacao({ aberto: true, tipo: 'DELETAR', id: m.id })}
//                                             className="p-2 text-zinc-600 hover:text-red-500 transition"
//                                         >
//                                             <Trash2 size={18} />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {confirmacao.aberto && (
//                     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
//                         <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
//                             {/* ... cabeçalho e texto do modal ... */}

//                             <div className="relative mb-6">
//                                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
//                                 <input
//                                     type="password" // ALTERADO DE "text" PARA "password"
//                                     placeholder="Senha de Administrador"
//                                     className="w-full bg-zinc-950 border border-zinc-800 p-4 pl-12 rounded-2xl outline-none focus:border-red-500 transition"
//                                     value={senhaAdmin}
//                                     onChange={(e) => setSenhaAdmin(e.target.value)}
//                                     autoFocus
//                                 />
//                             </div>

//                             <button
//                                 onClick={executarAcao}
//                                 className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
//                             >
//                                 <Save size={18} /> Confirmar
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }