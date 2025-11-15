import LancamentoDTO from "../model/dto/LancamantoDTO";
import { ContaDTO } from "../model/dto/ContaDTO";

export interface ItemDRE {
  tipo?: "titulo";
  categoria: string;
  valor?: number;
  destaque?: boolean;
}

/** 
 * geraDRE(listaLancamentos, listaContas)
 * 
 * Agora totalmente dinâmico, sem lista fixa.
 */
export const gerarDRE = (
  lancamentos: LancamentoDTO[],
  contas: ContaDTO[]
): ItemDRE[] => {

  // Acumuladores
  let receita = 0;
  let receitaFinanceira = 0;
  let impostosSobreVendas = 0;

  let custos = 0;
  let despesas = 0;
  let deprec = 0;
  let despesaFinanceira = 0;

  let irpj_csll = 0;

  lancamentos.forEach(l => {
    // identificar conta do lançamento
    const conta = contas.find(c => c.getNome() === l.getConta());
    if (!conta) return;

    const valor = Number(l.getValor());

    // === GRUPO 7: RECEITAS ===
    if (conta.getGrupo() === '7') {
      if (conta.getNome() === "Receita") receita += valor;
      if (conta.getNome() === "Receita Financeira") receitaFinanceira += valor;
    }

    // === GRUPO 6: CUSTOS E DESPESAS ===
    if (conta.getGrupo() === '6') {
      switch (conta.getNome()) {
        case "Impostos sobre Vendas":
          impostosSobreVendas += valor;
          break;

        case "CMV":
        case "CPV":
        case "CSP":
          custos += valor;
          break;

        case "Água/Luz":
        case "Salários":
          despesas += valor;
          break;

        case "Despesas com depreciação":
          deprec += valor;
          break;

        case "Despesa Financeira":
          despesaFinanceira += valor;
          break;

        case "IRPJ/CSLL":
          irpj_csll += valor;
          break;
      }
    }
  });
  
  const receitaLiquida = receita - impostosSobreVendas;
  const lucroBruto = receitaLiquida - custos;
  const resultadoOperacional = lucroBruto - despesas - deprec;
  const resultadoAntesTributos =
    resultadoOperacional + receitaFinanceira - despesaFinanceira;
  const lucroLiquido = resultadoAntesTributos - irpj_csll;

  return [
    { tipo: "titulo", categoria: "RECEITAS" },
    { categoria: "Receita Bruta", valor: receita },
    { categoria: "(-) Impostos sobre Vendas", valor: -impostosSobreVendas },
    { categoria: "Receita Líquida", valor: receitaLiquida, destaque: true },

    { tipo: "titulo", categoria: "CUSTOS" },
    { categoria: "(-) CPV/CMV/CSP", valor: -custos },
    { categoria: "Lucro Bruto", valor: lucroBruto, destaque: true },

    { tipo: "titulo", categoria: "DESPESAS" },
    { categoria: "Despesas Operacionais", valor: -despesas },
    { categoria: "Depreciação", valor: -deprec },

    { tipo: "titulo", categoria: "RESULTADO OPERACIONAL" },
    { categoria: "RO", valor: resultadoOperacional },

    { tipo: "titulo", categoria: "FINANCEIRO" },
    { categoria: "Receita Financeira", valor: receitaFinanceira },
    { categoria: "Despesa Financeira", valor: -despesaFinanceira },
    { categoria: "Resultado Antes dos Tributos", valor: resultadoAntesTributos, destaque: true },

    { tipo: "titulo", categoria: "TRIBUTOS" },
    { categoria: "IRPJ/CSLL", valor: -irpj_csll },

    { tipo: "titulo", categoria: "LUCRO LÍQUIDO" },
    { categoria: "Lucro Líquido", valor: lucroLiquido, destaque: true }
  ];
};
