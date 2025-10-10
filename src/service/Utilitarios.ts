import type LancamentoDTO from "../model/dto/LancamantoDTO";
import { getContaByNome } from "./ContasService";

function inserirCaractere(stringOriginal: string, caractereParaInserir: string, posicao: number): string {
    const parteInicio = stringOriginal.slice(0, posicao);
    const parteFim = stringOriginal.slice(posicao);

    return parteInicio + caractereParaInserir + parteFim;
  }

export function formatarValorParaDinheiro(valor: number): string {
    const valorString = valor.toFixed(2)

    var split: string[] = valorString.split('.')
    var nPontos = Math.trunc(split[0].length / 3)

    if(nPontos >= 0){
      for(var j=0; j<nPontos; j++){
        var posicao = split[0].length - (j+1) * 3 - j

        if(posicao != 0)
          split[0] = inserirCaractere(split[0], '.', posicao)
      }
    }

    return split.join(",")
  }

function moedaParaNumero(valor: string): number {
  return parseFloat(
    valor
      .replace("R$", "")  
      .replace(/\s/g, "")
      .replace(".", "")   
      .replace(",", ".")  
  );
}

export function valorParaComparacao(coluna: string, lanc: LancamentoDTO): number | string {
        switch (coluna) {
            case "data":
                const dataStr = lanc.getData();
                if (!dataStr) return 0;
                const [dia, mes, ano] = dataStr.split("/");
                return Number(`${ano}${mes}${dia}`);

            case "valor":
                let valorStr = lanc.getValor();
                if (!valorStr) return 0;
                valorStr = valorStr.replace("R$", "").replace(/\./g, "").replace(",", ".");
                return parseFloat(valorStr);

            case "descricao":
                return lanc.getDescricao().toLowerCase();
            case "conta":
                return lanc.getConta().toLowerCase();
            case "tipo":
                return lanc.getTipo().toLowerCase();
            case "data-vencimento":
                const dataVenc = lanc.getVencimento();
                if (!dataVenc) return 0;
                const [diaVenc, mesVenc, anoVenc] = dataVenc.split("/");
                return Number(`${anoVenc}${mesVenc}${diaVenc}`);
            default:
                return 0;
        }
    }

export async function gerarSaldosMap(lancamentos: Array<LancamentoDTO>, user: any) {
    let saldoAC = 0; // Ativo Circulante
    let saldoANC = 0; // Ativo Não Circulante
    let saldoPC = 0; // Passivo Circulante
    let saldoPNC = 0; // Passivo Não Circulante
    let capitalSocial = 0;
    let lucrosAcumulados = 0;
    let prejuizosAcumulados = 0;
    let receitas = 0;
    let despesas = 0;

    for (const lancamento of lancamentos) {
        const contas = await getContaByNome('nome', lancamento.getConta(), user);
        if (!contas || contas.length === 0) continue;

        const conta = contas[0];
        const valor = moedaParaNumero(lancamento.getValor());
        const chave = `${conta.getGrupo()}-${conta.getNatureza()}-${lancamento.getTipo()}`;

        // Regras de movimentação por grupo contábil
        switch (chave) {
            // --- ATIVO CIRCULANTE ---
            case '1-devedor-debito':
            case '1-credor-credito':
                saldoAC += valor;
                break;
            case '1-devedor-credito':
            case '1-credor-debito':
                saldoAC -= valor;
                break;

            // --- ATIVO NÃO CIRCULANTE ---
            case '2-devedor-debito':
            case '2-credor-credito':
                saldoANC += valor;
                break;
            case '2-devedor-credito':
            case '2-credor-debito':
                saldoANC -= valor;
                break;

            // --- PASSIVO CIRCULANTE ---
            case '3-credor-credito':
            case '3-devedor-debito':
                saldoPC += valor;
                break;
            case '3-credor-debito':
            case '3-devedor-credito':
                saldoPC -= valor;
                break;

            // --- PASSIVO NÃO CIRCULANTE ---
            case '4-credor-credito':
            case '4-devedor-debito':
                saldoPNC += valor;
                break;
            case '4-credor-debito':
            case '4-devedor-credito':
                saldoPNC -= valor;
                break;

            // --- PATRIMÔNIO LÍQUIDO ---
            case '5-credor-credito':
            case '5-devedor-debito':
                if (lancamento.getConta() === 'Capital Social') {
                    capitalSocial += valor;
                } else {
                    lucrosAcumulados += valor;
                }
                break;

            case '5-credor-debito':
            case '5-devedor-credito':
                if (lancamento.getConta() === 'Capital Social') {
                    capitalSocial -= valor;
                } else {
                    prejuizosAcumulados += valor;
                }
                break;

            // --- DESPESAS ---
            case '6-devedor-debito':
            case '6-credor-credito':
                despesas += valor;
                break;
            case '6-credor-debito':
            case '6-devedor-credito':
                despesas -= valor;
                break;

            // --- RECEITAS ---
            case '7-credor-credito':
            case '7-devedor-debito':
                receitas += valor;
                break;
            case '7-credor-debito':
            case '7-devedor-credito':
                receitas -= valor;
                break;
        }
    }

    // --- Resultado do exercício ---
    const resultadoExercicio = receitas - despesas;

    if (resultadoExercicio > 0) {
        lucrosAcumulados += resultadoExercicio;
    } else if (resultadoExercicio < 0) {
        prejuizosAcumulados += Math.abs(resultadoExercicio);
    }

    // --- Patrimônio Líquido ---
    const patrimonioLiquido = capitalSocial + lucrosAcumulados - prejuizosAcumulados;

    // --- Totais ---
    const totalAtivos = saldoAC + saldoANC;
    const totalPassivos = saldoPC + saldoPNC + patrimonioLiquido;

    // --- Retorno formatado ---
    const saldosMap: Map<string, string> = new Map();
    saldosMap.set('AC', formatarValorParaDinheiro(saldoAC));
    saldosMap.set('ANC', formatarValorParaDinheiro(saldoANC));
    saldosMap.set('PC', formatarValorParaDinheiro(saldoPC));
    saldosMap.set('PNC', formatarValorParaDinheiro(saldoPNC));
    saldosMap.set('capitalSocial', formatarValorParaDinheiro(capitalSocial));
    saldosMap.set('receitas', formatarValorParaDinheiro(receitas));
    saldosMap.set('despesas', formatarValorParaDinheiro(despesas));
    saldosMap.set('resultadoExercicio', formatarValorParaDinheiro(resultadoExercicio));
    saldosMap.set('lucrosAcumulados', formatarValorParaDinheiro(lucrosAcumulados));
    saldosMap.set('prejuizosAcumulados', formatarValorParaDinheiro(prejuizosAcumulados));
    saldosMap.set('patrimonioLiquido', formatarValorParaDinheiro(patrimonioLiquido));
    saldosMap.set('totalAtivos', formatarValorParaDinheiro(totalAtivos));
    saldosMap.set('totalPassivos', formatarValorParaDinheiro(totalPassivos));

    return saldosMap;
}



export function getInput(id: string) : HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement
}