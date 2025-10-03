import Lancamento from "../Lancamento"

class LancamentoDTO extends Lancamento {
    private id?: string;

    constructor(
        data: string,
        descricao: string,
        valor: string,
        conta: string,
        tipo: 'credito' | 'debito',
        dataVencimento: string,
        id?: string,
    ){
        super(
            data,
            descricao,
            valor,
            conta,
            tipo,
            dataVencimento
        )
        this.id = id
    }

    public getId(): string | undefined {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getData(): string {
        return this.data;
    }

    public setData(data: string): void {
        this.data = data;
    }

    public getDescricao(): string {
        return this.descricao;
    }

    public setDescricao(descricao: string): void {
        this.descricao = descricao;
    }

    public getConta(): string {
        return this.conta;
    }

    public setConta(conta: string): void {
        this.conta = conta;
    }

    public getTipo(): 'credito' | 'debito' {
        return this.tipo;
    }

    public setTipo(tipo: 'credito' | 'debito'): void {
        this.tipo = tipo;
    }

    public getValor(): string {
        return this.valor;
    }

    public setValor(valor: string): void {
        this.valor = valor;
    }
    
    public getVencimento(): string {
        return this.dataVencimento
    }

    toJSON(){
        return {
            "data": this.data,
            "descricao": this.descricao,
            "valor": this.valor,
            "conta": this.conta,
            "tipo": this.tipo,
            "data-vencimento": this.dataVencimento
        }
    }
}

export default LancamentoDTO