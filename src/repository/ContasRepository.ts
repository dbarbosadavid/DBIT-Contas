import { equalTo, get, orderByChild, query, ref, set } from "firebase/database";
import { db } from "../firebase/firebase";
import { listaContas } from "./ListaContas";

const contasRef = ref(db, "/contas");

export const init = async () => {
    set(contasRef, {
        "lista-contas": Array.isArray(listaContas) ? listaContas : Object.values(listaContas)
    })
}

export const getAllConta = async () => {
    const dbRef = ref(db, "/contas/lista-contas")

    const response = await get(dbRef);

    return response;
}


export const getConta = async (orderBy: string, searchItem: string) => {
    const contasQuery = query(
        ref(db, "/contas/lista-contas"), 
        orderByChild(orderBy), 
        equalTo(searchItem)
    );

    const response = await get(contasQuery);


    return response;
     
}