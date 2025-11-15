import { useEffect, useState } from "react";
import { getAllLancamentoService } from "../service/LancamentoService";
import { getAllContaService } from "../service/ContasService";
import { gerarDRE, type ItemDRE } from "../service/DREService";
import { useAuth } from "../firebase/useAuth";

const DRETabela: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<ItemDRE[]>([]);
  const [lancamentos, setLancamentos] = useState<any>([]);
  const [contas, setContas] = useState<any>([]);
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const carregar = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const fetchLancamentos = async () => {
            if (user) {
              const data = await getAllLancamentoService(user);
              setLancamentos(data);
              setLoading(false)
            }
          };
          fetchLancamentos();
          const fetchContas = async () => {
            if (user) {
              const data = await getAllContaService(user);
              setContas(data);
              setLoading(false)
      
            }
          };
          fetchContas();
          
      if(!loading){
        const dre = gerarDRE(lancamentos, contas);
        setDados(dre);
      }
    };

    carregar();
  }, [user, loading]);

  const formatar = (valor: any) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="dre-container">
      <h2>DRE - Demonstração do Resultado</h2>

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
