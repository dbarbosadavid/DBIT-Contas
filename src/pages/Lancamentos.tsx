import { useAuth } from "../firebase/useAuth";
import { getAllLancamentoService } from "../service/LancamentoService";
import React, { useEffect, useState } from "react";
import type LancamentoDTO from "../model/dto/LancamantoDTO";
import { useNavigate } from "react-router-dom";
import editar from "../assets/editar.png"
import trash from '../assets/trash-icon.png'
import { valorParaComparacao } from "../service/Utilitarios";
import { ref, remove } from "firebase/database";
import { db } from "../firebase/firebase";

const Lancamentos: React.FC = () => {
    const { user } = useAuth();
    var [lancamentos, setLancamentos] = useState<any>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [ordem, setOrdem] = useState('cres')


    useEffect(() => {
        const fetchLancamentos = async () => {
            if (user) {
                const data = await getAllLancamentoService(user);
                setLancamentos(data);
                setLoading(false)
            }
        };
        fetchLancamentos();
    }, [user]);


    function ordenarLancamentos(coluna: string) {
        const ordenado = [...lancamentos].sort((a, b) => {
            const va = valorParaComparacao(coluna, a);
            const vb = valorParaComparacao(coluna, b);

            if (typeof va === "number" && typeof vb === "number") {
                return ordem === "cres" ? va - vb : vb - va;
            }
            if (typeof va === "string" && typeof vb === "string") {
                return ordem === "cres" ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return 0;
        });

        setLancamentos(ordenado);
        setOrdem(ordem === "cres" ? "dec" : "cres");
    }

    const excluirLancamento = async (id?: string) => {
        try {
            await remove(ref(db, `user/${user.uid}/lancamentos/${id}`));
            setLancamentos((prev: Array<LancamentoDTO>) => prev.filter((lancamento) => lancamento.getId() !== id));
            alert("Lançamento excluído com sucesso!");

        } catch (error) {
            console.error(error);
            alert("Erro ao excluir a conta");
        }
    };

    const editarLancamento = (id?: string) => {
        navigate(`/novo-lancamento/${id}`)
    }

    if(loading){
        return (
        <div className="spinner-container">
            <div className='spinner'></div>
        </div>
        )
    }

    return (
        <>
            <h1>Lançamentos</h1>
            <button onClick={() => navigate('/novo-lancamento')}>Novo Lançamento</button>
            <table border={1}>
                <thead>
                <tr>
                    <th onClick={() => ordenarLancamentos('data')}>Data</th>
                    <th onClick={() => ordenarLancamentos('descricao')}>Descrição</th>
                    <th onClick={() => ordenarLancamentos('conta')}>Conta</th>
                    <th onClick={() => ordenarLancamentos('valor')}>Valor</th>
                    <th onClick={() => ordenarLancamentos('tipo')}>Tipo</th>
                    <th onClick={() => ordenarLancamentos('data-vencimento')}>Vencimento</th>
                    <th >Ações</th>
                </tr>
                </thead>
                <tbody>
                    {lancamentos.map((lancamento : LancamentoDTO, idx: any) => (
                                <tr key={idx}>
                                    <td>{lancamento.getData()}</td>
                                    <td>{lancamento.getDescricao()}</td>
                                    <td>{lancamento.getConta()}</td>
                                    <td>{lancamento.getValor()}</td>
                                    <td>{lancamento.getTipo()}</td>
                                    <td>{lancamento.getVencimento()}</td>
                                    <td>
                                        <button onClick={() => editarLancamento(lancamento.getId())}>
                                            <img src={editar} alt="" width='25rem' />
                                        </button>
                                        <button onClick={() => {
                                                let confirm = window.confirm("DESEJA REALMENTE EXCLUIR ESTE LANÇAMENTO?\n\n" + 
                                                                                `Data: ${lancamento.getData()}\n` +
                                                                                `Descrição: ${lancamento.getDescricao()}\n` +
                                                                                `Conta: ${lancamento.getConta()}\n` +
                                                                                `Valor: ${lancamento.getValor()}\n` +
                                                                                `Tipo: ${lancamento.getTipo()}\n`
                                                                            )
                                                if(confirm)
                                                    excluirLancamento(lancamento.getId());
                                            }
                                        }>
                                            <img src={trash} alt="" width='25rem' />
                                        </button>
                                    </td>
                                </tr>
                        ))}
                </tbody>
            </table>

        </>
    );
}

export default Lancamentos;

