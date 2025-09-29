import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import { ref, get, push, set, update } from "firebase/database";
import { getLancamentoContaService } from "../service/LancamentoService";
import { useAuth } from "../firebase/useAuth";

const Contas: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth()
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [grupo, setGrupo] = useState("");
  const [subGrupo, setSubGrupo] = useState("");
  const [elemento, setElemento] = useState("");
  const [natureza, setNatureza] = useState("");

  useEffect(() => {
    if (id) {
      const fetchConta = async () => {
        const snapshot = await get(ref(db, `contas/lista-contas/${id}`));
        console.log('snap ', snapshot)
        if (snapshot.exists()) {
          const conta = snapshot.val();
          setNome(conta.nome);
          setGrupo(conta.grupo);
          setSubGrupo(conta.subGrupo);
          setElemento(conta.elemento);
          setNatureza(conta.natureza);
        }
      };
      fetchConta();
    }
  }, [id]);

  const salvarConta = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!nome || !grupo || !subGrupo || !elemento || !natureza) {
    alert("Preencha todos os campos!");
    return;
  }
  // Pegar todas as contas existentes
  const snapshotContas = await get(ref(db, "contas/lista-contas"));
  const contasExistentes = snapshotContas.exists() ? snapshotContas.val() : {};

  const nomeDuplicado = Object.entries(contasExistentes).some(
    ([key, conta]: [string, any]) => conta.nome === nome && key !== id
  );
  if (nomeDuplicado) {
    alert("Já existe uma conta com este nome!");
    return;
  }

  const combinacaoDuplicada = Object.entries(contasExistentes).some(
    ([key, conta]: [string, any]) =>
      Number(conta.grupo) === Number(grupo) &&
      Number(conta.subGrupo) === Number(subGrupo) &&
      Number(conta.elemento) === Number(elemento) &&
      key !== id
  );
  if (combinacaoDuplicada) {
    alert("Já existe uma conta com esta combinação de Grupo > SubGrupo > Elemento!");
    return;
  }

  if (id) {
    const contaAtual = contasExistentes[id];
    const nomeAntigo = contaAtual.nome;

    if (nome !== nomeAntigo) {
      const lancamentos = await getLancamentoContaService(nomeAntigo, user);
      
      const updates: any = {};
      
      lancamentos.forEach(lancamento => {
            updates[`/user/${user.uid}/lancamentos/${lancamento.getId()}/conta`] = nome;
      });
          
        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
        }
      }
    
    await update(ref(db, `contas/lista-contas/${id}`), {
      nome,
      grupo: Number(grupo),
      subGrupo: Number(subGrupo),
      elemento: Number(elemento),
      natureza,
    });
    alert("Conta atualizada com sucesso!");
  } else {
    const contasRef = ref(db, "contas/lista-contas");
    const novaRef = push(contasRef);
    await set(novaRef, {
      nome,
      grupo: Number(grupo),
      subGrupo: Number(subGrupo),
      elemento: Number(elemento),
      natureza,
    });
    alert("Conta criada com sucesso!");
  }

  navigate("/contas");
};


  return (
    <div>
      <h1>{id ? "Editar Conta" : "Nova Conta"}</h1>
      <form onSubmit={salvarConta}>
        <div>
          <label>Nome:</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label>Grupo:</label>
          <input
            type="number"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            min={1}
            max={10}
          />
        </div>
        <div>
          <label>SubGrupo:</label>
          <input
            type="number"
            value={subGrupo}
            onChange={(e) => setSubGrupo(e.target.value)}
            min={1}
          />
        </div>
        <div>
          <label>Elemento:</label>
          <input
            type="number"
            value={elemento}
            onChange={(e) => setElemento(e.target.value)}
            min={1}
          />
        </div>
        <div>
          <label>Natureza:</label>
          <select
            value={natureza}
            onChange={(e) => setNatureza(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="devedor">Devedor</option>
            <option value="credor">Credor</option>
          </select>
        </div>
        <button type="submit">{id ? "Salvar Alterações" : "Criar Conta"}</button>
      </form>
    </div>
  );
};

export default Contas;
