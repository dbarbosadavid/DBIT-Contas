import { ContaDTO } from "../model/dto/ContaDTO";
import { getAllConta, getAllContaUser, getConta, getContaUser } from "../repository/ContasRepository";

export const getAllContaService = async (user: any) => {
    const response = await getAllConta();
    const response2 = await getAllContaUser(user);
    const listaContas = Array<ContaDTO>();

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

    response2.forEach((snapshot: any) => {
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

export const getContaByNome = async (orderBy:string ,nome: string, user: any): Promise<Array<ContaDTO>> => {
    const response = await getConta (orderBy, nome)
    const response2 = await getContaUser (orderBy, nome, user)
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

    response2.forEach((snapshot) => {
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