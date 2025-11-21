import { addLancamento, getAllLancamentoOrderRepository, getAllRepository, getLancamentoByIdRepository } from "../repository/LancamentoRepository";
import LancamentoDTO from "../model/dto/LancamantoDTO";

export const getAllLancamentoService = async (user: any) => {
    const response = await getAllRepository(user);
    const listaLancamentos = Array<LancamentoDTO>();

    response.forEach((snapshot) => {
            const lancamento = snapshot.val();
            const lancamentoObj = new LancamentoDTO(
                lancamento.data,
                lancamento.descricao,
                lancamento.valor,
                lancamento.conta,
                lancamento.tipo,
                lancamento["data-vencimento"],
                snapshot.key,
            );
            listaLancamentos.push(lancamentoObj);
    })

    return listaLancamentos;
};

export const addLancamentoService = async (data: string, descricao:string, valor: string, nomeConta: string, tipo: 'credito' | 'debito', dataVencimento: string, prazo: any, user: any) => {

    if((data == '' || descricao == '' || valor == '' || nomeConta == '') || (prazo.checked && dataVencimento == '')){
        throw new Error('Preencha todos os campos obrigatórios');
    }

    let dataStringArray = data.split('-')
    dataStringArray.reverse()
    let dataString = dataStringArray.join('/')

    let dataVencimentoString = ''

    if(dataVencimento != ''){
        let dataStringArray = dataVencimento.split('-')
        dataStringArray.reverse()
        dataVencimentoString = dataStringArray.join('/')
    }

    const lancamento = new LancamentoDTO(
        dataString,
        descricao,
        valor,
        nomeConta,
        tipo,
        dataVencimentoString,
    )

    addLancamento(lancamento, user)
}

export const getLancamentoContaService = async (searchItem: string, user: any) => {
    const lancamentos  = await getAllLancamentoService(user)

    var listaLancamentos : Array<LancamentoDTO> = []

    lancamentos.forEach((lancamento) => {
            if(lancamento.getConta() == searchItem){
                const lancamentoObj = new LancamentoDTO(
                    lancamento.getData(),
                    lancamento.getDescricao(),
                    lancamento.getValor(),
                    lancamento.getConta(),
                    lancamento.getTipo(),
                    lancamento.getVencimento(),
                    lancamento.getId(),
                );
                listaLancamentos.push(lancamentoObj);
            }
    })
    return listaLancamentos;
}

export const getAllLancamentoOrderService = async (orderBy: string, user: any) => {
    const response = await getAllLancamentoOrderRepository(orderBy, user)

    var listaLancamentos: any = []

    response.forEach((snapshot) => {
            const lancamento = snapshot.val();
                const lancamentoObj = new LancamentoDTO(
                    lancamento.data,
                    lancamento.descricao,
                    lancamento.valor,
                    lancamento.conta,
                    lancamento.tipo,
                    lancamento["data-vencimento"],
                    snapshot.key,
                );
                listaLancamentos.push(lancamentoObj);
    })
    return listaLancamentos;
}

export const getLancamentoByIdService = async (id: string, user: any) => {
    const response = await getLancamentoByIdRepository (id, user)

    if(!response.key)
        return;

        const listaLancamentos = Array<LancamentoDTO>();
            const lancamento = response.val()
            const lancamentoObj = new LancamentoDTO(
                lancamento.data,
                lancamento.descricao,
                lancamento.valor,
                lancamento.conta,
                lancamento.tipo,
                lancamento['data-vencimento'],
                response.key
            )   
            listaLancamentos.push(lancamentoObj)
        
    
        return lancamentoObj
} 