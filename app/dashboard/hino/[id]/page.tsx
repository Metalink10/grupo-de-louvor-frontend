'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../src/lib/api';
import { ArrowLeft, Music, Edit, Save, X, FileText, Trash2, Plus, Minus } from 'lucide-react';

export default function ExibirHino() {
  const { id } = useParams();
  const router = useRouter();
  const [hino, setHino] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const [editandoTudo, setEditandoTudo] = useState(false);
  const [novoTom, setNovoTom] = useState('');
  const [novaCifra, setNovaCifra] = useState('');
  const [novaLetra, setNovaLetra] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);
    buscarHino();
  }, [id]);

  async function buscarHino() {
    try {
      const response = await api.get(`/api/hinos/buscar/${id}`);
      const hinoData = Array.isArray(response.data) ? response.data[0] : response.data;
      setHino(hinoData);
      setNovoTom(hinoData.tom || '');
      setNovaCifra(hinoData.cifraTexto || '');
      setNovaLetra(hinoData.letra || '');
    } catch (err) {
      console.error("Erro ao buscar hino", err);
    }
  }

  const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const transporAcorde = (acorde: string, semitons: number) => {
    const match = acorde.match(/^([A-G][#b]*)(.*)/);
    if (!match) return acorde;

    let notaBaseOriginal = match[1];
    const resto = match[2];

    let notaLimpa = notaBaseOriginal[0].toUpperCase();
    if (notaBaseOriginal.includes('#')) notaLimpa += '#';
    else if (notaBaseOriginal.includes('b')) notaLimpa += 'b';

    const mapaBemois: { [key: string]: string } = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
    if (mapaBemois[notaLimpa]) notaLimpa = mapaBemois[notaLimpa];

    const indexAtual = notas.indexOf(notaLimpa);
    if (indexAtual === -1) return acorde;

    let novoIndex = (indexAtual + semitons) % 12;
    if (novoIndex < 0) novoIndex += 12;

    return notas[novoIndex] + resto;
  };

  const aplicarTransposicao = (semitons: number) => {
    const regexAcordes = /([A-G][#b]*[mMaj\d\+\-\/]*(?:\/[A-G][#b]*)?)/g;
    const linhas = novaCifra.split('\n');

    const novasLinhas = linhas.map(linha => {
      if (/[a-z]{3,}/.test(linha)) return linha;
      return linha.replace(regexAcordes, (match) => {
        if (match.length > 1 && /^[A-G][a-z]{2,}/.test(match)) return match;
        if (match.includes('/')) {
          return match.split('/').map(p => transporAcorde(p.trim(), semitons)).join('/');
        }
        return transporAcorde(match, semitons);
      });
    });

    setNovaCifra(novasLinhas.join('\n'));
    setNovoTom((prev) => transporAcorde(prev, semitons));
  };

  const salvarAlteracoes = async () => {
    try {
      await api.put(`/api/hinos/editar/${id}`, {
        ...hino,
        tom: novoTom,
        cifraTexto: novaCifra,
        letra: novaLetra
      });
      setHino({ ...hino, tom: novoTom, cifraTexto: novaCifra, letra: novaLetra });
      setEditandoTudo(false);
      alert("Atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar alterações.");
    }
  };

  const deletarLouvor = async () => {
    if (confirm("Deseja realmente excluir este louvor definitivamente?")) {
      try {
        await api.delete(`/api/hinos/deletar/${id}`);
        alert("Louvor excluído com sucesso!");
        router.push('/dashboard');
      } catch (err: any) {
        alert("Erro ao excluir louvor.");
      }
    }
  };

  if (!hino) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition">
            <ArrowLeft size={20} /> Voltar
          </button>
          {role === 'ADMIN' && (
            <button onClick={deletarLouvor} className="flex items-center gap-2 text-red-500/50 hover:text-red-500 transition text-[10px] font-black uppercase border border-red-500/20 px-3 py-1 rounded-lg">
              <Trash2 size={12} /> Excluir Hino
            </button>
          )}
        </div>

        <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">{hino.titulo}</h1>
            <p className="text-zinc-500 text-sm font-medium">{hino.autor}</p>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-[2rem]
