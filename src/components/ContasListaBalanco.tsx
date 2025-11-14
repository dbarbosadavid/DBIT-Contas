import React, { useEffect, useState } from "react";
import "../detalhesLancamentos.css";

interface Conta {
  id?: string;
  nome: string;
  grupo: number;
  subGrupo?: number;
  natureza: "devedor" | "credor";
}

interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  valor: string;
  conta: string;
  tipo: "credito" | "debito";
  dataVencimento: string;
}

interface Props {
  titulo: string;
  grupo: number;
  contas: Conta[];
  lancamentos: Lancamento[];
}

const DetalhesLancamentos: React.FC<Props> = ({
  titulo,
  grupo,
  contas,
  lancamentos
}) => {
  const [filtrados, setFiltrados] = useState<Lancamento[]>([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const contasDoGrupo = contas.filter(c => c.grupo === grupo);

    const nomesContasDoGrupo = contasDoGrupo.map(c => c.nome.trim().toLowerCase());

    const lancs = lancamentos.filter(l =>
      nomesContasDoGrupo.includes(l.conta.trim().toLowerCase())
    );

    setFiltrados(lancs);
  }, [grupo, contas, lancamentos]);

  return (
    <div className="detalhes-lancamentos">
      <button className="toggle-btn" onClick={() => setMostrar(!mostrar)}>
        {mostrar ? "Ocultar" : "Ver Lançamentos"} ({titulo})
      </button>

      {mostrar && (
        <table className="tabela-lancamentos">
          <thead>
            <tr>
              <th>Data</th>
              <th>Conta</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map(l => (
                <tr key={l.id}>
                  <td>{l.data}</td>
                  <td>{l.conta}</td>
                  <td>{l.descricao}</td>
                  <td>{l.tipo}</td>
                  <td className={(l.tipo === "debito" && titulo.includes('Passivos')) || (l.tipo === "credito" && titulo.includes('Ativos')) ? "debito" : "credito"}>
                    {l.valor}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DetalhesLancamentos;
