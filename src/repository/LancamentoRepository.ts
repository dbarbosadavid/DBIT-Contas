import { get, orderByChild, push, query, ref, set } from "firebase/database";
import { db } from "../firebase/firebase";
import type LancamentoDTO from "../model/dto/LancamantoDTO";



export const addLancamento = async (lancamento: LancamentoDTO, user: any) => {
    if (user) {
        const newPostRef = await push(ref(db, 'user/' + user.uid + '/lancamentos'));
        set(newPostRef, lancamento.toJSON());
    }
}

export const getAllRepository = async (user: any) => {
    const dbRef = ref(db, 'user/' + user.uid + '/lancamentos')
    
    const response = await get(dbRef);
    
    return response;
}

export const getAllLancamentoOrderRepository = async (orderBy: string, user: any) => {
    const lancamentoQuery = query(
        ref(db, 'user/' + user.uid + "/lancamentos"), 
        orderByChild(orderBy), 
    );

    const response = await get(lancamentoQuery);

    return response;
     
}

export const getLancamentoByIdRepository = async (id: string, user: any) => {
    const lancamentosQuery = query(
        ref(db, `/user/${user.uid}/lancamentos/${id}`),
    );

    const response = await get(lancamentosQuery);

    return response;
     
}
