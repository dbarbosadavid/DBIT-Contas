import { useEffect, useState } from "react";
import { getAllLancamentoService } from "../service/LancamentoService";
import { getAllContaService } from "../service/ContasService";
import { gerarDRE, type ItemDRE } from "../service/DREService";
import { useAuth } from "../firebase/useAuth";

import { addContaService, getContaByNome } from "../service/ContasService";
import { addLancamentoService } from "../service/LancamentoService";
import { addFechamento, getFechamentos } from "../service/FechamentoService";

const DRETabela: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<ItemDRE[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [periodoFechado, setPeriodoFechado] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [lancs, accs, fechamentos] = await Promise.all([
            getAllLancamentoService(user),
            getAllContaService(user),
            getFechamentos(user)
          ]);

          // Check if period is closed
          const isClosed = fechamentos.some(f => f.mes === mesSelecionado && f.ano === anoSelecionado);
          setPeriodoFechado(isClosed);

          // Filter lancamentos by month/year
          const lancsFiltrados = lancs.filter(l => {
            const [m, y] = l.getData().split('/').map(Number);
            return m === mesSelecionado && y === anoSelecionado;
          });

          const dre = gerarDRE(lancsFiltrados, accs);
          setDados(dre);
        } catch (error) {
          console.error("Error fetching data for DRE:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user, mesSelecionado, anoSelecionado]);

  const formatar = (valor: any) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const handleFecharPeriodo = async () => {
    if (!user) return;

    if (periodoFechado) {
      alert("Este período já está fechado!");
      return;
    }

    const confirmacao = window.confirm(`Tem certeza que deseja fechar o período ${mesSelecionado}/${anoSelecionado}? Esta ação é irreversível e bloqueará novos lançamentos para este mês.`);
    if (!confirmacao) return;

    // Find Lucro Líquido
    const lucroLiquidoItem = dados.find(d => d.categoria === "Lucro Líquido");
    if (!lucroLiquidoItem) {
      alert("Não foi possível encontrar o Lucro Líquido.");
      return;
    }

    const valor = lucroLiquidoItem.valor || 0;

    try {
      let nomeContaDestino = "";

      if (valor >= 0) {
        nomeContaDestino = "Lucros Acumulados";
      } else {
        nomeContaDestino = "Prejuízos Acumulados";
      }

      // Check if account exists, if not create it
      const contasExistentes = await getContaByNome('nome', nomeContaDestino, user);
      let contaDestino = contasExistentes.find(c => c.getNome() === nomeContaDestino);

      if (!contaDestino) {
        // Create Account (Grupo 5 - PL, Natureza Credor for Lucros, Devedor for Prejuizos technically but usually PL is Credor nature)
        // We'll stick to Credor for PL accounts generally
        await addContaService(nomeContaDestino, 5, 9, 1, 'credor', user);
      }

      // Create Transaction
      // Date: Last day of the month
      const lastDay = new Date(anoSelecionado, mesSelecionado, 0).getDate();
      const dataStr = `${lastDay}-${mesSelecionado}-${anoSelecionado}`;

      const valorAbs = Math.abs(valor);
      const valorStr = valorAbs.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

      // If Profit (Positive): Credit "Lucros Acumulados"
      // If Loss (Negative): Debit "Prejuízos Acumulados"
      const tipo = valor >= 0 ? 'credito' : 'debito';

      await addLancamentoService(
        dataStr,
        `Apuração do Resultado - ${mesSelecionado}/${anoSelecionado}`,
        valorStr,
        nomeContaDestino,
        tipo,
        '',
        { checked: false },
        user
      );

      // Mark period as closed
      await addFechamento(mesSelecionado, anoSelecionado, user);

      alert("Período fechado com sucesso!");
      window.location.reload();

    } catch (error: any) {
      console.error("Erro ao fechar período:", error);
      alert("Erro ao fechar período: " + error.message);
    }
  };

  if (loading) {
    return <div className="dre-container">Carregando...</div>;
  }

  return (
    <div className="dre-container">
      <h2>DRE - Demonstração do Resultado</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        <label>Mês:</label>
        <select value={mesSelecionado} onChange={e => setMesSelecionado(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label>Ano:</label>
        <input
          type="number"
          value={anoSelecionado}
          onChange={e => setAnoSelecionado(Number(e.target.value))}
          style={{ width: '80px' }}
        />
      </div>

      {!periodoFechado ? (
        <button
          onClick={handleFecharPeriodo}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          FECHAR PERÍODO {mesSelecionado}/{anoSelecionado}
        </button>
      ) : (
        <div style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#e0e0e0',
          color: '#555',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          Período Fechado
        </div>
      )}

      <table className="dre-tabela">
        <thead>
          <tr>
            <th>Categoria</th>
            <th className="valor">Valor (R$)</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((linha, index) =>
            linha.tipo === "titulo" ? (
              <tr key={index} className="linha-titulo">
                <td colSpan={2}>{linha.categoria}</td>
              </tr>
            ) : (
              <tr
                key={index}
                className={linha.destaque ? "linha-destaque" : ""}
              >
                <td>{linha.categoria}</td>
                <td className="valor">{formatar(linha.valor)}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DRETabela;
