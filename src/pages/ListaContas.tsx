import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { getAllLancamentoService } from "../service/LancamentoService";
import { useAuth } from "../firebase/useAuth";
import editar from "../assets/editar.png"
import trash from '../assets/trash-icon.png'

interface Conta {
  id: string;
  nome: string;
  grupo: number;
  subGrupo: number;
  elemento: number;
  natureza: string;
}

const ListaContas: React.FC = () => {
  const { user } = useAuth()
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContas = async () => {
      const contasRef = ref(db, "contas/lista-contas");
      const snapshot = await get(contasRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const lista: Conta[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setContas(lista);
      } else {
        setContas([]);
      }
      setLoading(false);
    };

    fetchContas();
  }, []);

    const excluirConta = async (id: string, nomeConta: string) => {
    try {
        const lancamentos = await getAllLancamentoService(user)
        console.log(lancamentos)

        let existeLancamento = false 
        lancamentos.forEach((lancamento) => {
            if(lancamento.getConta() == nomeConta){
                existeLancamento = true
                
            }
        })

        if (existeLancamento) {
            alert("Não é possível excluir: existem lançamentos vinculados a esta conta.");
            return;
        }
        
        await remove(ref(db, `contas/lista-contas/${id}`));
        setContas((prev) => prev.filter((conta) => conta.id !== id));
        alert("Conta excluída com sucesso!");

    } catch (error) {
        console.error(error);
        alert("Erro ao excluir a conta");
    }
    };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1>Lista de Contas</h1>
      <button onClick={() => navigate("/cadastro-conta")}>
        Nova Conta
      </button>
      <table border={1} cellPadding={8} style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Grupo</th>
            <th>SubGrupo</th>
            <th>Elemento</th>
            <th>Natureza</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((conta) => (
            <tr key={conta.id}>
              <td>{conta.nome}</td>
              <td>{conta.grupo}</td>
              <td>{conta.subGrupo}</td>
              <td>{conta.elemento}</td>
              <td>{conta.natureza}</td>
              <td>
                <button onClick={() => navigate(`/cadastro-conta/${conta.id}`)}><img src={editar} alt="" width='25rem' /></button>
                <button onClick={() => excluirConta(conta.id, conta.nome)}><img src={trash} alt="" width='25rem' /></button>          
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaContas;
