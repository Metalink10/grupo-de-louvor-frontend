import { Link} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../../src/lib/api';
export default function GerenciarHinos() {

    const [hinos, setHinos] = useState<any[]>([]);

    useEffect(() => {
        const carregarHinos = async () => {
            try {
                const response = await api.get('/hinos/todos');
                setHinos(response.data);
            } catch (err: any) {
                console.error("Erro ao carregar hinos:", err);
            }
        };
        carregarHinos();
    }, []);

    return (
    <div className="p-8 bg-zinc-950 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Gerenciamento de Letras</h2>
      
      <div className="grid gap-4">
        {hinos.map((hino) => (
          <div key={hino.id} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <span>{hino.titulo}</span>
            
            {/* O botão de editar só existe dentro desta página de gerência */}
            <Link 
              href={`/dashboard/editar-hino/${hino.id}`}
              className="bg-zinc-800 p-2 rounded-lg hover:text-blue-500 transition"
            >
              Editar Letra
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
