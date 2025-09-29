import React, { useEffect, useState } from "react";
import { useAuth } from "../firebase/useAuth";
import type { ContaDTO } from "../model/dto/ContaDTO";
import { getAllContaService } from "../service/ContasService";
import TabelaLivroRazao from "../components/TabelaLivroRazao";

const LivroRazao: React.FC = () => {
    const { user } = useAuth();
    const [contas, setContas] = useState<any>([]);
    const [nomeConta, setNomeConta] = useState<any>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConta = async () => {
            if (user) {
                const data = await getAllContaService();
                setContas(data);
                setLoading(false)
                }
            };
        fetchConta();
        
        }, [user, nomeConta, loading]);


    if(loading){
        return (
        <div className="spinner-container">
            <div className='spinner'></div>
        </div>
        )
    }

    return (
        <>
            <h1>Livro Razão</h1>
            <select onChange={(e) => {setNomeConta(e.target.value)}}>
                <option value="">Selecione uma Conta</option>
                {contas.map((conta : ContaDTO) => (
                                    <option value={conta.getNome()}>{conta.getGrupo()}.{conta.getSubGrupo()}.{conta.getElemento()} {conta.getNome()}</option>
                            ))}
            </select>
            
            <h2>{nomeConta}</h2>

            <TabelaLivroRazao nomeConta={nomeConta}/>
        </>

    )
}

export default LivroRazao;