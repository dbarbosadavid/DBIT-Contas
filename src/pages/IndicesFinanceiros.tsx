import React, { useEffect, useState } from 'react';
import { useAuth } from '../firebase/useAuth';
import { getAllContaService } from '../service/ContasService';
import { getAllLancamentoService } from '../service/LancamentoService';
import { gerarDRE } from '../service/DREService';
import LancamentoDTO from '../model/dto/LancamantoDTO';
import { ContaDTO } from '../model/dto/ContaDTO';
import '../indicesFinanceiros.css';

const IndicesFinanceiros: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Data
    const [ativoCirculante, setAtivoCirculante] = useState(0);
    const [ativoNaoCirculante, setAtivoNaoCirculante] = useState(0);
    const [passivoCirculante, setPassivoCirculante] = useState(0);
    const [passivoNaoCirculante, setPassivoNaoCirculante] = useState(0);
    const [patrimonioLiquido, setPatrimonioLiquido] = useState(0);

    const [disponivel, setDisponivel] = useState(0);
    const [estoque, setEstoque] = useState(0);
    const [lucroLiquido, setLucroLiquido] = useState(0);

    // Inputs for ROI
    const [ganhoROI, setGanhoROI] = useState(30000);
    const [custoROI, setCustoROI] = useState(80000);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const [lancs, accs] = await Promise.all([
                        getAllLancamentoService(user),
                        getAllContaService(user)
                    ]);

                    calculateValues(lancs, accs);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    const parseValor = (valorStr: string): number => {
        if (typeof valorStr === 'number') return valorStr;
        return parseFloat(
            valorStr
                .replace("R$", "")
                .replace(/\s/g, "")
                .replace(".", "")
                .replace(",", ".")
        );
    };

    const getSaldoConta = (conta: ContaDTO, lancs: LancamentoDTO[]) => {
        let saldo = 0;
        const nomeConta = conta.getNome().trim().toLowerCase();

        lancs.forEach(l => {
            if (l.getConta().trim().toLowerCase() !== nomeConta) return;

            const valor = parseValor(l.getValor());
            const tipo = l.getTipo();
            const natureza = conta.getNatureza();

            if (natureza === 'devedor') {
                if (tipo === 'debito') saldo += valor;
                else saldo -= valor;
            } else {
                if (tipo === 'credito') saldo += valor;
                else saldo -= valor;
            }
        });
        return saldo;
    };

    const calculateValues = (lancs: LancamentoDTO[], accs: ContaDTO[]) => {
        let ac = 0, anc = 0, pc = 0, pnc = 0, pl = 0;
        let disp = 0, est = 0;

        accs.forEach(c => {
            const saldo = getSaldoConta(c, lancs);
            const grupo = Number(c.getGrupo());
            const nome = c.getNome().toLowerCase();

            if (grupo === 1) ac += saldo;
            if (grupo === 2) anc += saldo;
            if (grupo === 3) pc += saldo;
            if (grupo === 4) pnc += saldo;
            if (grupo === 5) pl += saldo;

            // Specific Accounts
            if (nome.includes("caixa") || nome.includes("banco")) disp += saldo;
            if (nome.includes("estoque") || nome.includes("mercadoria")) est += saldo;
        });

        setAtivoCirculante(ac);
        setAtivoNaoCirculante(anc);
        setPassivoCirculante(pc);
        setPassivoNaoCirculante(pnc);
        setPatrimonioLiquido(pl);
        setDisponivel(disp);
        setEstoque(est);

        // Calculate Net Profit from DRE logic
        const dre = gerarDRE(lancs, accs);
        const lucroItem = dre.find(d => d.categoria === "Lucro Líquido");
        setLucroLiquido(lucroItem ? Number(lucroItem.valor) : 0);
    };

    const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatNumber = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatPercent = (val: number) => (val * 100).toFixed(2) + "%";

    // Calculations
    const ativoTotal = ativoCirculante + ativoNaoCirculante;
    // Solvencia Geral = Ativo Total / (Passivo Circulante + Passivo Não Circulante)
    // Passivo Total in the image likely refers to Passivo Exigível (PC + PNC).

    const liquidezImediata = passivoCirculante ? disponivel / passivoCirculante : 0;
    const liquidezSeca = passivoCirculante ? (ativoCirculante - estoque) / passivoCirculante : 0;
    const liquidezCorrente = passivoCirculante ? ativoCirculante / passivoCirculante : 0;
    const liquidezGeral = (passivoCirculante + passivoNaoCirculante) ? (ativoCirculante + ativoNaoCirculante) / (passivoCirculante + passivoNaoCirculante) : 0;
    const solvenciaGeral = (passivoCirculante + passivoNaoCirculante) ? ativoTotal / (passivoCirculante + passivoNaoCirculante) : 0;

    const roa = ativoTotal ? lucroLiquido / ativoTotal : 0;
    const roi = custoROI ? ganhoROI / custoROI : 0;
    const roe = patrimonioLiquido ? lucroLiquido / patrimonioLiquido : 0;

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="indices-container">
            <h1 className="indices-title">Índices Financeiros</h1>

            <div className="indices-grid">
                {/* Liquidez (Blue) */}
                <div className="indices-column">
                    <table className="indices-table">
                        <thead>
                            <tr>
                                <th colSpan={3} className="blue-header">Índice de Liquidez</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Imediata */}
                            <tr>
                                <td className="blue-sub-header">Imediata</td>
                                <td className="blue-sub-header">Disponível</td>
                                <td className="blue-sub-header">Passivo Circulante</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatNumber(liquidezImediata)}</td>
                                <td>{formatMoney(disponivel)}</td>
                                <td>{formatMoney(passivoCirculante)}</td>
                            </tr>

                            {/* Seca */}
                            <tr>
                                <td className="blue-sub-header">Seca</td>
                                <td className="blue-sub-header">Ativo Circulante - Estoque</td>
                                <td className="blue-sub-header">Passivo Circulante</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatNumber(liquidezSeca)}</td>
                                <td>{formatMoney(ativoCirculante - estoque)}</td>
                                <td>{formatMoney(passivoCirculante)}</td>
                            </tr>

                            {/* Corrente */}
                            <tr>
                                <td className="blue-sub-header">Corrente</td>
                                <td className="blue-sub-header">Ativo Circulante</td>
                                <td className="blue-sub-header">Passivo Circulante</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatNumber(liquidezCorrente)}</td>
                                <td>{formatMoney(ativoCirculante)}</td>
                                <td>{formatMoney(passivoCirculante)}</td>
                            </tr>

                            {/* Geral */}
                            <tr>
                                <td className="blue-sub-header">Geral</td>
                                <td className="blue-sub-header">Ativo Circulante + RLP</td>
                                <td className="blue-sub-header">Passivo Total</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatNumber(liquidezGeral)}</td>
                                <td>{formatMoney(ativoCirculante + ativoNaoCirculante)}</td>
                                <td>{formatMoney(passivoCirculante + passivoNaoCirculante)}</td>
                            </tr>

                            {/* Solvência Geral */}
                            <tr>
                                <td className="blue-sub-header">Solvência Geral</td>
                                <td className="blue-sub-header">Ativo Total</td>
                                <td className="blue-sub-header">Passivo Total</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatNumber(solvenciaGeral)}</td>
                                <td>{formatMoney(ativoTotal)}</td>
                                <td>{formatMoney(passivoCirculante + passivoNaoCirculante)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Retorno (Orange) */}
                <div className="indices-column">
                    <table className="indices-table">
                        <thead>
                            <tr>
                                <th colSpan={3} className="orange-header">Índice de Retorno</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* ROA */}
                            <tr>
                                <td className="orange-sub-header">ROA</td>
                                <td className="orange-sub-header">Lucro Líquido</td>
                                <td className="orange-sub-header">Ativo Total</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatPercent(roa)}</td>
                                <td>{formatMoney(lucroLiquido)}</td>
                                <td>{formatMoney(ativoTotal)}</td>
                            </tr>

                            {/* ROI */}
                            <tr>
                                <td className="orange-sub-header">ROI</td>
                                <td className="orange-sub-header">Ganho</td>
                                <td className="orange-sub-header">Custo do Investimento</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatPercent(roi)}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="input-value"
                                        value={ganhoROI}
                                        onChange={e => setGanhoROI(Number(e.target.value))}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="input-value"
                                        value={custoROI}
                                        onChange={e => setCustoROI(Number(e.target.value))}
                                    />
                                </td>
                            </tr>

                            {/* ROE */}
                            <tr>
                                <td className="orange-sub-header">ROE</td>
                                <td className="orange-sub-header">Lucro Líquido</td>
                                <td className="orange-sub-header">Patrimônio Líquido</td>
                            </tr>
                            <tr>
                                <td className="red-value">{formatPercent(roe)}</td>
                                <td>{formatMoney(lucroLiquido)}</td>
                                <td>{formatMoney(patrimonioLiquido)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IndicesFinanceiros;
