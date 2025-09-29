import { ContaDTO } from "../model/dto/ContaDTO";
import { getAllConta, getConta } from "../repository/ContasRepository";

export const getAllContaService = async () => {
    const response = await getAllConta();
    const listaContas = Array<ContaDTO>();
    console.log(response)

    response.forEach((snapshot: any) => {
            const conta = snapshot.val()
            const contaObj = new ContaDTO(
                    conta.nome,
                    conta.grupo,
                    conta.subGrupo,
                    conta.elemento,
                    conta.natureza
                )
          
            listaContas.push(contaObj);
    })

    return listaContas;
};

export const getContaByNome = async (orderBy:string ,nome: string): Promise<Array<ContaDTO>> => {
    const response = await getConta (orderBy, nome)
    const listaContas = Array<ContaDTO>();

    response.forEach((snapshot) => {
        const conta = snapshot.val()
        const contaObj = new ContaDTO(
            conta.nome,
            conta.grupo,
            conta.subGrupo,
            conta.elemento,
            conta.natureza
        )   
        listaContas.push(contaObj)
    })

    return listaContas
}