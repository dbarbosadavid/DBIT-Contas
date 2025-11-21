import { get, push, ref, set } from "firebase/database";
import { db } from "../firebase/firebase";

export interface FechamentoDTO {
    mes: number;
    ano: number;
    id?: string;
}

export const getFechamentos = async (user: any): Promise<FechamentoDTO[]> => {
    const fechamentosRef = ref(db, `user/${user.uid}/fechamentos`);
    const snapshot = await get(fechamentosRef);

    if (!snapshot.exists()) return [];

    const fechamentos: FechamentoDTO[] = [];
    snapshot.forEach((childSnapshot) => {
        fechamentos.push({
            id: childSnapshot.key as string,
            ...childSnapshot.val()
        });
    });
    return fechamentos;
};

export const addFechamento = async (mes: number, ano: number, user: any) => {
    const fechamentosRef = ref(db, `user/${user.uid}/fechamentos`);

    // Check if already closed
    const existing = await getFechamentos(user);
    if (existing.some(f => f.mes === mes && f.ano === ano)) {
        throw new Error("Este período já está fechado.");
    }

    const novaRef = push(fechamentosRef);
    await set(novaRef, { mes, ano });
};

export const isPeriodoFechado = async (data: string, user: any): Promise<boolean> => {
    // data format: YYYY-MM-DD
    const [ano, mes] = data.split('-').map(Number);
    const fechamentos = await getFechamentos(user);
    return fechamentos.some(f => f.mes === mes && f.ano === ano);
};
