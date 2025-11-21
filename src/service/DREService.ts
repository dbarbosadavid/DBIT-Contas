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
/**
 * Helper to parse currency string "R$ 1.000,00" to number 1000.00
 */
const parseValor = (valorStr: string | number): number => {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  return parseFloat(
    valorStr
      .toString()
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(".", "")
      .replace(",", ".")
  );
};

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
    // Normalize comparison
    const contaLancamento = l.getConta().trim().toLowerCase();
    const conta = contas.find(c => c.getNome().trim().toLowerCase() === contaLancamento);

    if (!conta) return;

    const valor = parseValor(l.getValor());

    // === GRUPO 7: RECEITAS ===
    if (conta.getGrupo() === '7') {
      const nome = conta.getNome().trim().toLowerCase();
      if (nome.includes("receita financeira")) {
        receitaFinanceira += valor;
      } else if (nome.includes("receita")) {
        receita += valor;
      }
    }

    // === GRUPO 6: CUSTOS E DESPESAS ===
    if (conta.getGrupo() === '6') {
      const nome = conta.getNome().trim().toLowerCase();

      if (nome.includes("impostos sobre vendas")) {
        impostosSobreVendas += valor;
      } else if (["cmv", "cpv", "csp"].some(t => nome.includes(t))) {
        custos += valor;
      } else if (nome.includes("depreciação")) {
        deprec += valor;
      } else if (nome.includes("despesa financeira")) {
        despesaFinanceira += valor;
      } else if (nome.includes("irpj") || nome.includes("csll")) {
        irpj_csll += valor;
      } else {
        // Default fallback for other expenses in group 6
        despesas += valor;
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
