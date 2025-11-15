import '../balanco.css'
import React, { useEffect, useState } from "react";
import { TipoAtivo } from "../components/TipoAtivo";
import { useAuth } from "../firebase/useAuth";
import { getAllLancamentoService } from "../service/LancamentoService";
import { gerarSaldosMap } from "../service/Utilitarios";
import DetalhesLancamentos from '../components/ContasListaBalanco';
import { getAllContaService } from '../service/ContasService';

const Balanco: React.FC = () => {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<any>([]);
  const [contas, setContas] = useState<any>([]);
  const [loading, setLoading] = useState(true)
  const [saldosMap, setSaldosMap] = useState<any>()
  
  useEffect(() => {
    const fetchLancamentos = async () => {
      if (user) {
        const data = await getAllLancamentoService(user);
                  setLancamentos(data);
        setLoading(false)
      }
    };
    fetchLancamentos();
    
    const fetchContas = async () => {
      if (user) {
        const data = await getAllContaService(user);
          setContas(data);
        setLoading(false)

      }
    };
    fetchContas();

    if(!loading){
      const fetchSaldosMap = async () =>{
        const data = await gerarSaldosMap(lancamentos, user)
        setSaldosMap(data)
      }
      fetchSaldosMap();
    }
  }, [user, loading]);


  if(loading){
        return (
        <div className="spinner-container">
            <div className='spinner'></div>
        </div>
        )
    }

  return (
    <>
    <div className="itens-balanco" id="ativos">
        <TipoAtivo 
          grupo="Ativos Circulantes"
          saldo= {`R$ ${saldosMap?.get("AC") ?? "Carregando..."}`}
          class="ativos"
        />
        <DetalhesLancamentos
          titulo="Ativos Circulantes"
          grupo={1}
          contas={contas}
          lancamentos={lancamentos}
        />
        <TipoAtivo 
          grupo="Ativos Não Circulantes"
          saldo= {`R$ ${saldosMap?.get("ANC") ?? "Carregando..."}`}
          class="ativos"
        />
        <DetalhesLancamentos
          titulo="Ativos Não Circulantes"
          grupo={2}
          contas={contas}
          lancamentos={lancamentos}
        />
        
        <TipoAtivo 
          grupo="Ativos Totais"
          saldo= {`R$ ${saldosMap?.get("totalAtivos") ?? "Carregando..."}`}
          class="ativos-totais"
        />
    </div>

    <hr className="linha-divisao"/>

    <div className="itens-balanco" id="passivos">
        <TipoAtivo 
          grupo="Passivos circulantes"
          saldo= {`R$ ${saldosMap?.get("PC") ?? "Carregando..."}`}
          class="passivos"
        />
        <DetalhesLancamentos
          titulo="Passivos Circulantes"
          grupo={3}
          contas={contas}
          lancamentos={lancamentos}
        />
        <TipoAtivo 
          grupo="Passivos não circulantes"
          saldo= {`R$ ${saldosMap?.get("PNC") ?? "Carregando..."}`}
          class="passivos"
        />
        <DetalhesLancamentos
          titulo="Passivos Não Circulantes"
          grupo={4}
          contas={contas}
          lancamentos={lancamentos}
        />
        <TipoAtivo
          grupo="Passivos + PL"
          saldo= {`R$ ${saldosMap?.get("totalPassivos") ?? "Carregando..."}`}
          class="passivos-totais"
        />
    </div>

    <hr className="linha-divisao"/>

    <div className="itens-balanco" id="contas">
        <TipoAtivo 
          grupo="Despesas"
          saldo= {`R$ ${saldosMap?.get("despesas") ?? "Carregando..."}`}
          class="despesas"
        />
        <TipoAtivo 
          grupo="Receitas"
          saldo= {`R$ ${saldosMap?.get("receitas") ?? "Carregando..."}`}
          class="receitas"
        />
        <TipoAtivo 
          grupo="Patrimônio Liquido"
          saldo= {`R$ ${saldosMap?.get("patrimonioLiquido") ?? "Carregando..."}`}
          class="patrimonio"
        />
        
    </div>
    <div className="itens-balanco" id="contas">
        <TipoAtivo 
          grupo="Lucros Acumulados"
          saldo= {`R$ ${saldosMap?.get("lucrosAcumulados") ?? "Carregando..."}`}
          class="lucros"
        />
        <TipoAtivo 
          grupo="Prejuizos Acumulados"
          saldo= {`R$ ${saldosMap?.get("prejuizosAcumulados") ?? "Carregando..."}`}
          class="prejuizos"
        />
    </div>
    </>
  )
  
};

export default Balanco;
