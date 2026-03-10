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
  const [novaLetra, setNovaLetra] = useState(''); // 1. Novo estado para a letra

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
      setNovaLetra(hinoData.letra || ''); // Inicializa a nova letra
    } catch (err) {
      console.error("Erro ao buscar hino", err);
    }
  }
  const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const transporAcorde = (acorde: string, semitons: number) => {
    // 1. Captura nota base (A-G) e separadamente o sustenido/bemol e o resto
    const match = acorde.match(/^([A-G][#b]*)(.*)/);
    if (!match) return acorde;

    let notaBaseOriginal = match[1];
    const resto = match[2];

    // Limpeza: Pega apenas a letra e UM sustenido/bemol se existir (evita G###)
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
    // Regex para identificar acordes (Notas A-G com seus complementos)
    const regexAcordes = /([A-G][#b]*[mMaj\d\+\-\/]*(?:\/[A-G][#b]*)?)/g;

    // 1. Dividimos a cifra em linhas para analisar uma por uma
    const linhas = novaCifra.split('\n');

    const novasLinhas = linhas.map(linha => {
      // 2. REGRA DE PROTEÇÃO:
      // Se a linha contiver palavras com 3 ou mais letras minúsculas seguidas, 
      // é quase certo que é uma linha de LETRA (ex: "está", "louvor", "amor").
      // O acorde menor usa apenas um 'm' (ex: Am7), então ele passa no teste.
      if (/[a-z]{3,}/.test(linha)) {
        return linha; // Retorna a linha da letra sem mexer em nada
      }

      // 3. Se a linha for de cifras (não tem palavras longas), fazemos a troca
      return linha.replace(regexAcordes, (match) => {
        if (match.length > 1 && /^[A-G][a-z]{2,}/.test(match)) {
          return match;
        }
        if (match.includes('/')) {
          return match.split('/').map(p => transporAcorde(p.trim(), semitons)).join('/');
        }

        return transporAcorde(match, semitons);
      });
    });

    setNovaCifra(novasLinhas.join('\n'));

    // Atualiza o Tom Principal do cabeçalho
    setNovoTom((prev) => transporAcorde(prev, semitons));
  };

  const salvarAlteracoes = async () => {
    try {
      await api.put(`/api/hinos/editar/${id}`, {
        ...hino,
        tom: novoTom,
        cifraTexto: novaCifra,
        letra: novaLetra // 2. Envia a letra atualizada para o banco
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
        // Chamamos o caminho completo começando com /api
        // O interceptor já injeta o Bearer Token automaticamente aqui
        await api.delete(`/api/hinos/deletar/${id}`);

        alert("Louvor excluído com sucesso!");
        router.push('/dashboard');
      } catch (err: any) {
        console.error("Erro detalhado:", err.response);

        if (err.response?.status === 404) {
          alert("Erro 404: Rota não encontrada no servidor. Verifique o backend.");
        } else if (err.response?.status === 403) {
          alert("Erro 403: Você não tem permissão de ADMIN para excluir.");
        } else {
          alert("Erro ao excluir louvor.");
        }
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

          {/* Botão de edição visível para todos os cargos (USER, MUSICIAN, ADMIN) */}
          <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-[2rem] border border-zinc-800">

            {/* Controles de tom aparecem apenas para músicos/admin */}
            {(role === 'MUSICIAN' || role === 'ADMIN') && (
              <>
                {editandoTudo && (
                  <button onClick={() => aplicarTransposicao(-1)} className="p-2 hover:bg-zinc-800 rounded-full text-blue-500 transition">
                    <Minus size={20} />
                  </button>
                )}

                <div className="text-center px-4">
                  <p className="text-[10px] text-blue-500 font-black uppercase mb-1">Tom</p>
                  {editandoTudo ? (
                    <input
                      className="bg-zinc-800 border border-blue-500 rounded-xl px-2 py-1 w-20 text-2xl text-center outline-none text-blue-400 font-bold"
                      value={novoTom}
                      onChange={(e) => setNovoTom(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-4xl font-black text-blue-500">{hino.tom || '--'}</span>
                  )}
                </div>

                {editandoTudo && (
                  <button onClick={() => aplicarTransposicao(1)} className="p-2 hover:bg-zinc-800 rounded-full text-blue-500 transition">
                    <Plus size={20} />
                  </button>
                )}
              </>
            )}

            {!editandoTudo ? (
              <button onClick={() => setEditandoTudo(true)} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl transition ml-2">
                <Edit size={20} />
              </button>
            ) : (
              <div className="flex flex-col gap-2 ml-2">
                <button onClick={salvarAlteracoes} className="bg-green-600 p-2 rounded-lg hover:bg-green-500"><Save size={18} /></button>
                <button onClick={() => setEditandoTudo(false)} className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700"><X size={18} /></button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {role === 'USER' ? (
            <div className="bg-zinc-900/30 p-10 rounded-[3rem] border border-zinc-900">
              <h3 className="text-zinc-600 text-xs font-black mb-8 flex items-center gap-2 uppercase tracking-tighter">
                <FileText size={14} /> Letra do Louvor
              </h3>

              {/* 3. Se estiver editando, mostra o campo de texto, senão mostra o parágrafo */}
              {editandoTudo ? (
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-800 p-8 rounded-3xl text-2xl leading-relaxed text-zinc-300 outline-none min-h-[500px] focus:ring-1 focus:ring-blue-500"
                  value={novaLetra}
                  onChange={(e) => setNovaLetra(e.target.value)}
                  placeholder="Edite a letra aqui..."
                />
              ) : (
                <p className="text-3xl leading-relaxed whitespace-pre-line font-medium text-white-300">
                  {hino.letra}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/80 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl relative">
              <h3 className="text-blue-500 text-xs font-black mb-8 flex items-center gap-2 uppercase tracking-tighter">
                <Music size={14} /> Cifra e Harmonia Técnica
              </h3>

              {editandoTudo ? (
                <div className="flex flex-col gap-6">
                  <textarea
                    className="w-full bg-zinc-950 border border-blue-500/30 p-8 rounded-3xl font-mono text-xl leading-relaxed text-white-400 outline-none min-h-[400px] focus:ring-1 focus:ring-blue-500"
                    value={novaCifra}
                    onChange={(e) => setNovaCifra(e.target.value)}
                    placeholder="Cole a cifra aqui..."
                  />
                  <p className="text-xs font-bold text-red-500 uppercase px-2">Editar Letra (Base)</p>
                  <textarea
                    className="w-full bg-zinc-950 border border-zinc-600 p-6 rounded-2xl text-lg text-white-400 outline-none min-h-[200px]"
                    value={novaLetra}
                    onChange={(e) => setNovaLetra(e.target.value)}
                  />
                </div>
              ) : (
           <pre className="font-mono text-base md:text-lg leading-relaxed whitespace-pre overflow-x-auto scrollbar-hide">
  {novaCifra ? (
    novaCifra.split('\n').map((linha, index) => {
      // 1. Lista de palavras que DEVEM ficar brancas (etiquetas)
      const etiquetas = ['INTRO', 'REFRÃO', 'PONTE', 'SOLO', 'CORO', 'FINAL', 'FRASE', 'PONTE'];

      // 2. Quebramos a linha preservando os espaços para não desalinhcar a cifra
      // Usamos uma técnica de 'split' que mantém os espaços vazios
      const partes = linha.split(/(\s+)/); 

      return (
        <div key={index} className="min-h-[1.2em]">
          {partes.map((parte, pIndex) => {
            const parteLimpa = parte.trim().toUpperCase().replace(/[\[\]()]/g, '');
            
            // Lógica para decidir se a palavra é um ACORDE ou uma ETIQUETA/LETRA
            // - Se estiver na lista de etiquetas: BRANCO
            // - Se for uma letra de música (3+ minúsculas): BRANCO
            // - Se for curto e parecer nota (A, B, C, G#, Dm7): LARANJA
            
            const ehEtiqueta = etiquetas.includes(parteLimpa);
            const ehPalavraDeLetra = /[a-z]{3,}/.test(parte);
            const ehAcorde = !ehEtiqueta && !ehPalavraDeLetra && /[A-G]/.test(parte);

            return (
              <span
                key={pIndex}
                className={ehAcorde ? 'text-orange-400 font-bold' : 'text-white'}
              >
                {parte}
              </span>
            );
          })}
        </div>
      );
    })
  ) : (
    <span className="text-zinc-500">Nenhuma cifra disponível.</span>
  )}
</pre>
          )}
        </div>
      
    </div>
  );
}
