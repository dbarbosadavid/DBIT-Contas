export class Conta {
    protected nome: string
    protected grupo: number
    protected subGrupo: number 
    protected elemento: number
    protected natureza: 'devedor' | 'credor'

    constructor(
        nome: string,
        grupo: number,
        subGrupo: number,
        elemento: number,
        natureza: 'devedor' | 'credor'
    ) {
        this.nome = nome
        this.grupo = grupo
        this.subGrupo = subGrupo
        this.elemento = elemento
        this.natureza = natureza
    }
}