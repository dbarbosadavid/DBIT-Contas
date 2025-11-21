import React, { useEffect, useState } from 'react';
import { useAuth } from '../firebase/useAuth';
import { getAllContaService } from '../service/ContasService';
import { getAllLancamentoService } from '../service/LancamentoService';
import LancamentoDTO from '../model/dto/LancamantoDTO';
import { ContaDTO } from '../model/dto/ContaDTO';
import '../planilhaBalanco.css';

const PlanilhaBalanco: React.FC = () => {
    const { user } = useAuth();
    const [lancamentos, setLancamentos] = useState<LancamentoDTO[]>([]);
    const [contas, setContas] = useState<ContaDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Dates for comparison
    const [dataPeriodo1, setDataPeriodo1] = useState<Date>(new Date()); // Current
    const [dataPeriodo2, setDataPeriodo2] = useState<Date>(new Date()); // Previous

    useEffect(() => {
        // Set default dates: End of current month and End of previous month
        const now = new Date();
        const endCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const endPrevious = new Date(now.getFullYear(), now.getMonth(), 0);

        setDataPeriodo1(endCurrent);
        setDataPeriodo2(endPrevious);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const [lancs, accs] = await Promise.all([
                        getAllLancamentoService(user),
                        getAllContaService(user)
                    ]);
                    setLancamentos(lancs);
                    setContas(accs);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const parseValor = (valorStr: string): number => {
        return parseFloat(
            valorStr
                .replace("R$", "")
                .replace(/\s/g, "")
                .replace(".", "")
                .replace(",", ".")
        );
    };

    const formatMoney = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatPercent = (val: number) => {
        if (!isFinite(val) || isNaN(val)) return "0%";
        return (val * 100).toFixed(0) + "%";
    };

    const getSaldoConta = (conta: ContaDTO, ateData: Date, lancs: LancamentoDTO[]) => {
        let saldo = 0;
        const nomeConta = conta.getNome().trim().toLowerCase();

        lancs.forEach(l => {
            const lDate = parseDate(l.getData());
            if (lDate > ateData) return;

            if (l.getConta().trim().toLowerCase() !== nomeConta) return;

            const valor = parseValor(l.getValor());
            const tipo = l.getTipo(); // 'credito' | 'debito'
            const natureza = conta.getNatureza(); // 'devedor' | 'credor'

            // Logic from Utilitarios.ts adapted for single account
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

    const getGroupTotal = (grupo: number, ateData: Date, lancs: LancamentoDTO[], accs: ContaDTO[]) => {
        let total = 0;
        accs.filter(c => Number(c.getGrupo()) === grupo).forEach(c => {
            total += getSaldoConta(c, ateData, lancs);
        });
        return total;
    };

    if (loading) {
        return <div className="planilha-container">Carregando...</div>;
    }

    // Calculate totals for AV%
    const totalAtivo1 = getGroupTotal(1, dataPeriodo1, lancamentos, contas) + getGroupTotal(2, dataPeriodo1, lancamentos, contas);
    const totalAtivo2 = getGroupTotal(2, dataPeriodo2, lancamentos, contas) + getGroupTotal(1, dataPeriodo2, lancamentos, contas);

    const totalPassivoPL1 = totalAtivo1;
    const totalPassivoPL2 = totalAtivo2;

    const renderGroup = (grupoId: number, groupName: string, totalBase1: number, totalBase2: number) => {
        const groupAccounts = contas.filter(c => Number(c.getGrupo()) === grupoId).sort((a, b) => {
            const subA = Number(a.getSubGrupo() || 0);
            const subB = Number(b.getSubGrupo() || 0);
            if (subA !== subB) return subA - subB;
            return Number(a.getElemento() || 0) - Number(b.getElemento() || 0);
        });

        const groupTotal1 = getGroupTotal(grupoId, dataPeriodo1, lancamentos, contas);
        const groupTotal2 = getGroupTotal(grupoId, dataPeriodo2, lancamentos, contas);

        const av1 = totalBase1 ? groupTotal1 / totalBase1 : 0;
        const av2 = totalBase2 ? groupTotal2 / totalBase2 : 0;
        const ah = groupTotal2 ? (groupTotal1 - groupTotal2) / groupTotal2 : 0;

        return (
            <>
                <tr className="grupo-row">
                    <td>{grupoId}</td>
                    <td className="text-left">{groupName.toUpperCase()}</td>
                    <td>{formatMoney(groupTotal1)}</td>
                    <td className="yellow-bg">{formatPercent(av1)}</td>
                    <td>{formatMoney(groupTotal2)}</td>
                    <td className="yellow-bg">{formatPercent(av2)}</td>
                    <td className="yellow-bg">{formatPercent(ah)}</td>
                </tr>
                {groupAccounts.map(conta => {
                    const saldo1 = getSaldoConta(conta, dataPeriodo1, lancamentos);
                    const saldo2 = getSaldoConta(conta, dataPeriodo2, lancamentos);
                    const cAv1 = totalBase1 ? saldo1 / totalBase1 : 0;
                    const cAv2 = totalBase2 ? saldo2 / totalBase2 : 0;
                    const cAh = saldo2 ? (saldo1 - saldo2) / saldo2 : 0;

                    return (
                        <tr key={conta.getNome()}>
                            <td>{conta.getGrupo()}.{conta.getSubGrupo()}.{conta.getElemento()}</td>
                            <td className="text-left">{conta.getNome()}</td>
                            <td>{formatMoney(saldo1)}</td>
                            <td className="gray-bg">{formatPercent(cAv1)}</td>
                            <td>{formatMoney(saldo2)}</td>
                            <td className="gray-bg">{formatPercent(cAv2)}</td>
                            <td className="gray-bg">{formatPercent(cAh)}</td>
                        </tr>
                    );
                })}
            </>
        );
    };

    return (
        <div className="planilha-container">
            <h1>Balanço Patrimonial Comparativo</h1>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                    <label style={{ marginRight: '10px' }}><strong>Período 1:</strong></label>
                    <input
                        type="date"
                        value={dataPeriodo1.getFullYear() + '-' + String(dataPeriodo1.getMonth() + 1).padStart(2, '0') + '-' + String(dataPeriodo1.getDate()).padStart(2, '0')}
                        onChange={(e) => {
                            if (e.target.value) {
                                const [y, m, d] = e.target.value.split('-').map(Number);
                                setDataPeriodo1(new Date(y, m - 1, d));
                            }
                        }}
                    />
                </div>
                <div>
                    <label style={{ marginRight: '10px' }}><strong>Período 2:</strong></label>
                    <input
                        type="date"
                        value={dataPeriodo2.getFullYear() + '-' + String(dataPeriodo2.getMonth() + 1).padStart(2, '0') + '-' + String(dataPeriodo2.getDate()).padStart(2, '0')}
                        onChange={(e) => {
                            if (e.target.value) {
                                const [y, m, d] = e.target.value.split('-').map(Number);
                                setDataPeriodo2(new Date(y, m - 1, d));
                            }
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* ATIVO */}
                <div style={{ flex: 1 }}>
                    <table className="planilha-table">
                        <thead>
                            <tr className="header-row">
                                <th>Cód</th>
                                <th>BALANÇO PATRIMONIAL</th>
                                <th>{dataPeriodo1.toLocaleDateString()}</th>
                                <th className="yellow-bg">AV%</th>
                                <th>{dataPeriodo2.toLocaleDateString()}</th>
                                <th className="yellow-bg">AV%</th>
                                <th className="yellow-bg">AH%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="total-row">
                                <td></td>
                                <td className="text-left">ATIVO</td>
                                <td>{formatMoney(totalAtivo1)}</td>
                                <td className="yellow-bg">100%</td>
                                <td>{formatMoney(totalAtivo2)}</td>
                                <td className="yellow-bg">100%</td>
                                <td className="yellow-bg">{formatPercent(totalAtivo2 ? (totalAtivo1 - totalAtivo2) / totalAtivo2 : 0)}</td>
                            </tr>
                            {renderGroup(1, "Ativo Circulante", totalAtivo1, totalAtivo2)}
                            {renderGroup(2, "Ativo Não Circulante", totalAtivo1, totalAtivo2)}
                        </tbody>
                    </table>
                </div>

                {/* PASSIVO */}
                <div style={{ flex: 1 }}>
                    <table className="planilha-table">
                        <thead>
                            <tr className="header-row">
                                <th>Cód</th>
                                <th>PASSIVO + PL</th>
                                <th>{dataPeriodo1.toLocaleDateString()}</th>
                                <th className="yellow-bg">AV%</th>
                                <th>{dataPeriodo2.toLocaleDateString()}</th>
                                <th className="yellow-bg">AV%</th>
                                <th className="yellow-bg">AH%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="total-row">
                                <td></td>
                                <td className="text-left">PASSIVO + PL</td>
                                <td>{formatMoney(totalPassivoPL1)}</td>
                                <td className="yellow-bg">100%</td>
                                <td>{formatMoney(totalPassivoPL2)}</td>
                                <td className="yellow-bg">100%</td>
                                <td className="yellow-bg">{formatPercent(totalPassivoPL2 ? (totalPassivoPL1 - totalPassivoPL2) / totalPassivoPL2 : 0)}</td>
                            </tr>
                            {renderGroup(3, "Passivo Circulante", totalPassivoPL1, totalPassivoPL2)}
                            {renderGroup(4, "Passivo Não Circulante", totalPassivoPL1, totalPassivoPL2)}
                            {renderGroup(5, "Patrimônio Líquido", totalPassivoPL1, totalPassivoPL2)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlanilhaBalanco;
