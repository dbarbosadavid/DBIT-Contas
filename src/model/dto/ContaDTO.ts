import { Conta } from "../Contas"

export class ContaDTO extends Conta{
    private id?: string

    constructor(
        nome: string,
        grupo: number,
        subGrupo: number,
        elemento: number,
        natureza: 'devedor' | 'credor'
    ) {
        super(
            nome,
            grupo,
            subGrupo,
            elemento,
            natureza
        )
    }

    public getId(): string {
        return this.id?.toString() ?? '';
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getNome(): string {
        return this.nome.toString();
    }

    public setNome(nome: string): void {
        this.nome = nome;
    }

    public getGrupo(): string {
        return this.grupo.toString();
    }

    public setGrupo(grupo: string): void {
        this.grupo = Number(grupo);
    }

    public getSubGrupo(): string {
        return this.subGrupo.toString();
    }

    public setSubGrupo(subGrupo: string): void {
        this.subGrupo = Number(subGrupo);
    }

    public getElemento(): string {
        return this.elemento.toString();
    }

    public setElemento(elemento: string): void {
        this.elemento = Number(elemento);
    }
    
    public getNatureza(): string {
        return this.natureza
    }

    public jsonToObject() {
        
    }
}