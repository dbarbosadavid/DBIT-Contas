import "../dre.css"; // opcional

const DRETabela: React.FC = () => {
  /*
    Estrutura esperada em "dados":
    [
      { categoria: "Receita Bruta", valor: 100000 },
      { categoria: "(-) Deduções e Impostos", valor: -15000 },
      { categoria: "Receita Líquida", valor: 85000, destaque: true },
      { categoria: "(-) Custo dos Produtos", valor: -30000 },
      { categoria: "Lucro Bruto", valor: 55000, destaque: true },
      ...
    ]
  */

  const formatar = (valor: any) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
            <tr>
              <td>a</td>
              <td className="valor">aa</td>
            </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DRETabela;
