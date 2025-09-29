import { useEffect, useState } from "react";
import LancamentoDTO from "../model/dto/LancamantoDTO"
import { valorParaComparacao } from "../service/Utilitarios";
import { useAuth } from "../firebase/useAuth";
import { getLancamentoContaService } from "../service/LancamentoService";

interface props{
    nomeConta:string
}

const TabelaLivroRazao: React.FC<props> = (props) => {
    const {user} = useAuth()
    const [ordem, setOrdem] = useState('cres')
    const [lancamentos, setLancamentos] = useState<any>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        const fetchLancamentos = async () => {
            if (user) {
                const data = await getLancamentoContaService(props.nomeConta, user);
                setLancamentos(data);
                setLoading(false)
                }
            };
            fetchLancamentos();
    }, [props.nomeConta]);
    
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

    if(loading){
        return (<h3>Carregando...</h3>)
    }

    if(lancamentos.length == 0){
        return (
            <h3>Lista Vazia</h3>
        )
    }

    return (
        <>
            <table border={1}>
                <thead>
                <tr>
                    <th onClick={() => ordenarLancamentos('descricao')}>Descrição</th>
                    <th onClick={() => ordenarLancamentos('data')}>Data</th>
                    <th onClick={() => ordenarLancamentos('valor')}>Valor</th>
                    <th onClick={() => ordenarLancamentos('tipo')}>Tipo</th>
                    <th onClick={() => ordenarLancamentos('data-vencimento')}>Vencimento</th>
                </tr>
                </thead>
                <tbody>   
                    {lancamentos.map((lancamento : LancamentoDTO, idx: any) => (
                        <tr key={idx}>
                            <td>{lancamento.getDescricao()}</td>
                            <td>{lancamento.getData()}</td>
                            <td>{lancamento.getValor()}</td>
                            <td>{lancamento.getTipo()}</td>
                            <td>{lancamento.getVencimento()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default TabelaLivroRazao