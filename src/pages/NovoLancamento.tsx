import React, { useEffect, useState } from "react";
import { useAuth } from "../firebase/useAuth";
import { addLancamentoService, getLancamentoByIdService } from "../service/LancamentoService";
import { useNavigate, useParams } from "react-router-dom";
import { getInput } from "../service/Utilitarios";
import { getAllContaService } from "../service/ContasService";
import type { ContaDTO } from "../model/dto/ContaDTO";
import LancamentoDTO from "../model/dto/LancamantoDTO";
import { ref, update } from "firebase/database";
import { db } from "../firebase/firebase";


const NovoLancamento: React.FC = () => {
    const { id } = useParams();
    
    const navigate = useNavigate()
    const { user } = useAuth()
    const [valor, setValor] = useState("");
    const [date, setDate] = useState("");
    const [contas, setContas] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [lancamento, setLancamento] = useState<any>();
    const [dataVencimento, setVencimento] = useState("");
    const [descricao, setDescricao] = useState("");


    useEffect(() => {
        if(id){
            const fetchLancamentos = async () => {
                const lancamentoId = await getLancamentoByIdService(id, user)
                setLancamento(lancamentoId)
                
                if(!lancamentoId)
                    return

                let date = lancamentoId.getData().split('/')
                date.reverse()
                let dateString = date.join('-')

                setDate(dateString)
                setValor(lancamento.getValor())
                setDescricao(lancamentoId.getDescricao())

                let prazo = getInput('prazo-div')
                if(lancamentoId.getVencimento() != ''){
                    prazo.removeAttribute('hidden')
                    let date = lancamentoId.getVencimento().split('/')
                    date.reverse()
                    let dateString = date.join('-')
                    setVencimento(dateString)
                }
                let contaSelecionada = getInput(lancamento.getConta())
                contaSelecionada.setAttribute('selected', '')

                let debito = getInput('debito')
                let credito = getInput('credito')

                if(lancamentoId.getTipo() == 'credito'){
                    credito.setAttribute('selected', '')
                }
                else{
                    debito.setAttribute('selected', '')
                }
                setLoading(false)
            }
            fetchLancamentos();
        }

            const fetchContas = async () => {
                if (user) {
                    const data = await getAllContaService(user);
                    setContas(data);
                    setLoading(false)
                }
            };
            fetchContas();

            
        }, [user, loading]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        value = value.replace(/\D/g, "");

        const valorNumerico = (Number(value) / 100).toFixed(2);

        const formatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        }).format(Number(valorNumerico));

        setValor(formatado);
    };

    const dateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let date = e.target.valueAsDate?.toISOString()
        date = date?.slice(0, 10)
        
        if(!date)
            return;

        if(date > new Date().toISOString().slice(0, 10)){
            date = new Date().toISOString().slice(0, 10)
            setDate(date)
        }
        else{
            setDate(date)
        }
    }

    async function getValues(){
        var data = getInput('data-input')
        var descricao = getInput('descricao-input')
        var valor = getInput('valor')
        var contaDebitar = getInput('conta-debito')
        var contaCreditar = getInput('conta-credito')
        var dataVencimento = getInput('data-vencimento-input')
        var prazo = getInput('checkbox')
        var conta = getInput('conta')
        let tipo: 'credito' | 'debito' = 'credito'
        
        try{
            var tipoString = getInput('tipo').value
            if (tipoString === 'credito'){
                tipo = 'credito'
            }
            else{
                tipo = 'debito'
            }

        }catch{}

        if(data.value == '' || descricao.value == '' || valor.value == 'R$ 0,00'){
            window.alert("ERRO: Preencha todos os campos!!!")
            return
        }   
        

        try{
            if(id){
                const updates: any = {};
                let dataStringArray = data.value.split('-')
                dataStringArray.reverse()
                let dataString = dataStringArray.join('/')

                let dataVencimentoString = ''

                if(dataVencimento.value != ''){
                    let dataStringArray = dataVencimento.value.split('-')
                    dataStringArray.reverse()
                    dataVencimentoString = dataStringArray.join('/')
                }
                var lancamentoObj = new LancamentoDTO(dataString, descricao.value, valor.value, conta.value, tipo, dataVencimentoString)
                updates[`/user/${user.uid}/lancamentos/${lancamento.getId()}`] = lancamentoObj.toJSON();
                await update(ref(db), updates);
                window.alert("Lançamanto atualizado com sucesso!!!")
                navigate("/lancamentos")
            }
            else{
                if(contaCreditar.value == '' && contaDebitar.value != ''){
                    await addLancamentoService(data.value, descricao.value, valor.value, contaDebitar.value, 'debito', dataVencimento.value, prazo, user)
                }
                else if(contaCreditar.value != '' && contaDebitar.value == ''){
                    await addLancamentoService(data.value, descricao.value, valor.value, contaCreditar.value, 'credito', dataVencimento.value, prazo, user)
                    
                } else {
                    await addLancamentoService(data.value, descricao.value, valor.value, contaDebitar.value, 'debito', dataVencimento.value, prazo, user)
                    await addLancamentoService(data.value, descricao.value, valor.value, contaCreditar.value, 'credito', dataVencimento.value, prazo, user)
                }
                window.alert("Lançamanto realizado com sucesso!!!")
                navigate("/lancamentos")
            }
        }
        catch(error: unknown){
            if(error instanceof Error)
                window.alert(error.message)
        }
    }

    function alterarView(){
        const select = document.getElementsByName('data-vencimento-input')
        const label = document.getElementById('label-data-vencimento')

        var data = select[0]

        if(data?.hasAttribute('hidden')){
            data?.removeAttribute('hidden')
            label?.removeAttribute('hidden')
        }
        else {
            data?.setAttribute('hidden', '')
            label?.setAttribute('hidden', '')
        }
    }

    if(loading){
        return (
        <div className="spinner-container">
            <div className='spinner'></div>
        </div>
        )
    }

    if(id){
        return (
            <>
            <h1>Editar Lançamento</h1>
            <form id="lancamento-form">
                <p>Lançamento de: </p>
                <input required id="descricao-input" type="text" placeholder="Ex.: Compra de matéria-prima" className="input-descricao" onChange={(e) => setDescricao(e.target.value)} value={descricao}/> 

                <p>Data do Lançamento</p>
                <input required type="date" name="" id="data-input" onChange={dateChange} value={date}/>
            
                <div id='prazo-div' hidden>
                    <p id='label-data-vencimento'>Data Vencimento</p>
                    <input type="date" name="data-vencimento-input" id="data-vencimento-input" value={dataVencimento} onChange={(e) => setVencimento(e.target.value)}/>
                </div>
                
                <p>
                    Conta
                    <select id="conta">
                        {contas.map((conta : ContaDTO) => (
                            <option id={conta.getNome()} value={conta.getNome()}>{conta.getGrupo()}.{conta.getSubGrupo()}.{conta.getElemento()} {conta.getNome()}</option>
                        ))}
                    </select>
                </p>
            
                <p>
                    Tipo
                    <select required id="tipo">
                        <option id='credito' value="credito">Crédito</option>
                        <option id='debito' value="debito">Débito</option>
                    </select>
                </p>    

                <p>Valor</p>
                <input required type="Text" placeholder="R$ 0,00" className="input-descricao" id="valor" value={valor} onChange={handleChange}/>
                <hr />
            </form>

            <button onClick={getValues} type="submit">Salvar</button>
            </>
        )
    }

    return (
        <>
            <h1>Lançamento</h1>
            <form id="lancamento-form">
                <p>Lançamento de: </p>
                <input id="descricao-input" type="text" placeholder="Ex.: Compra de matéria-prima" className="input-descricao"/> 

                <p>
                    Data do Lançamento
                </p>
                    <input type="date" name="" id="data-input" onChange={dateChange} value={date}/>

                <p >
                    Conta a prazo 
                </p>
                    <input id="checkbox" type="checkbox" onClick={alterarView}/>
                
                <p id='label-data-vencimento' hidden>
                    Data Vencimento
                </p>
                    <input hidden type="date" name="data-vencimento-input" id="data-vencimento-input"/>
                
                <p>
                    Conta a debitar 
                    <select id="conta-debito">
                        <option value="" selected>Selecionar Conta</option>
                        {contas.map((conta : ContaDTO) => (
                            <option value={conta.getNome()}>{conta.getGrupo()}.{conta.getSubGrupo()}.{conta.getElemento()} {conta.getNome()}</option>
                        ))}
                    </select>
                </p>

                <p>
                    Conta a creditar
                    <select id="conta-credito">
                        <option value="" selected>Selecionar Conta</option>
                        {contas.map((conta : ContaDTO) => (
                            <option value={conta.getNome()}>{conta.getGrupo()}.{conta.getSubGrupo()}.{conta.getElemento()} {conta.getNome()}</option>
                        ))}
                    </select>
                </p>
                
                <p>
                    Valor
                </p>
                    <input type="Text" placeholder="R$ 0,00" className="input-descricao" id="valor" value={valor} onChange={handleChange}/>
                <hr />
            </form>
            <button onClick={getValues} type="submit">Criar Lançamento</button>

        </>
    );
}

export default NovoLancamento;

