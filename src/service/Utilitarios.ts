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

export async function gerarSaldosMap(lancamentos: Array<LancamentoDTO>){
    var saldoAC = 0
    var saldoANC = 0
    var saldoPC = 0
    var saldoPNC = 0
    var patrimonioLiquido = 0
    var receitas = 0
    var despesas = 0

    for(const lancamento of lancamentos){
        const contas = await getContaByNome('nome', lancamento.getConta())
        const conta = contas[0]

        switch(conta.getGrupo() + '-' + conta.getNatureza() + '-' + lancamento.getTipo()){
        case '1-devedor-debito':
        case '1-credor-credito':
            saldoAC += moedaParaNumero(lancamento.getValor())
            break
        case '1-devedor-credito':
        case '1-credor-debito':
            saldoAC -= moedaParaNumero(lancamento.getValor())
            break
        case '2-devedor-debito':
        case '2-credor-credito':
            saldoANC += moedaParaNumero(lancamento.getValor())
            break
        case '2-devedor-credito':
        case '2-credor-debito':
            saldoANC -= moedaParaNumero(lancamento.getValor())
            break
        case '3-credor-credito':
        case '3-devedor-debito':
            saldoPC += moedaParaNumero(lancamento.getValor())
            break
        case '3-credor-debito':
        case '3-devedor-credito':
            saldoPC -= moedaParaNumero(lancamento.getValor())
            break
        case '4-credor-credito':
        case '4-devedor-debito':
            saldoPNC += moedaParaNumero(lancamento.getValor())
            break
        case '4-credor-debito':
        case '4-devedor-credito':
            saldoPNC -= moedaParaNumero(lancamento.getValor())
            break
        case '5-credor-credito':
        case '5-devedor-debito':
            patrimonioLiquido += moedaParaNumero(lancamento.getValor())
            break
        case '5-credor-debito':
        case '5-devedor-credito':
            patrimonioLiquido -= moedaParaNumero(lancamento.getValor())
            break
        case '6-devedor-debito':
        case '6-credor-credito':
            despesas += moedaParaNumero(lancamento.getValor())
            break    
        case '6-credor-debito':
        case '6-devedor-credito':
            despesas -= moedaParaNumero(lancamento.getValor())
            break 
        case '7-devedor-debito':
        case '7-credor-credito':
            receitas += moedaParaNumero(lancamento.getValor())
            break    
        case '7-credor-debito':
        case '7-devedor-credito':
            receitas -= moedaParaNumero(lancamento.getValor())
            break  
        default:
            break
        }
    }

    var capitalSocial = 0
    var totalAtivos = saldoAC + saldoANC
    var totalPassivos = saldoPC + saldoPNC
    var saldo = patrimonioLiquido - capitalSocial
    var lucrosAcumulados = saldo > 0 ? 0 : saldo
    var prejuizosAcumulados = saldo < 0 ? 0 : saldo

    var saldosMap: Map<any, string> = new Map()

    saldosMap.set('totalAtivos', formatarValorParaDinheiro(totalAtivos))
    saldosMap.set('totalPassivos', formatarValorParaDinheiro(totalPassivos))
    saldosMap.set('AC', formatarValorParaDinheiro(saldoAC))
    saldosMap.set('ANC', formatarValorParaDinheiro(saldoANC))
    saldosMap.set('PC', formatarValorParaDinheiro(saldoPC))
    saldosMap.set('PNC', formatarValorParaDinheiro(saldoPNC))
    saldosMap.set('patrimonioLiquido', formatarValorParaDinheiro(patrimonioLiquido))
    saldosMap.set('lucrosAcumulados', formatarValorParaDinheiro(prejuizosAcumulados))
    saldosMap.set('prejuizosAcumulados', formatarValorParaDinheiro(lucrosAcumulados))
    saldosMap.set('receitas', formatarValorParaDinheiro(receitas))
    saldosMap.set('despesas', formatarValorParaDinheiro(despesas))


    return saldosMap;
}

export function getInput(id: string) : HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement
}