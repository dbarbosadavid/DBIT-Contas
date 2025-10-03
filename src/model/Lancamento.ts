abstract class Lancamento {
    protected data: string
    protected descricao: string
    protected conta: string
    protected tipo: 'credito' | 'debito'
    protected valor: string
    protected dataVencimento: string

    constructor(
        data: string,
        descricao: string,
        valor: string,
        conta: string,
        tipo: 'credito' | 'debito',
        dataVencimento: string
    ) {
        this.data = data  
        this.descricao = descricao
        this.valor = valor
        this.conta = conta
        this.tipo = tipo
        this.dataVencimento = dataVencimento
    }

}

export default Lancamento