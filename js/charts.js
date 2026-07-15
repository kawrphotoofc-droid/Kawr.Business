/* ==========================================
   KAWR BUSINESS v2.0
   charts.js - Gráficos Profissionais
========================================== */

// ===== VARIÁVEIS GLOBAIS =====
const charts = {};

// ===== CONFIGURAÇÃO PADRÃO DE GRÁFICOS =====
const chartConfig = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: '#e0e0e0',
                font: {
                    size: 12,
                    weight: 600
                }
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#a0a0a0'
            },
            grid: {
                color: '#3d3d3d'
            }
        },
        y: {
            ticks: {
                color: '#a0a0a0'
            },
            grid: {
                color: '#3d3d3d'
            }
        }
    }
};

/**
 * Cria gráfico de receita mensal (barras)
 * @param {object} historico - Histórico financeiro
 */
function criarGraficoReceita(historico) {
    const ctx = document.getElementById('chartReceita')?.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(historico).sort();
    const receitas = meses.map(mes => historico[mes]?.receitaBruta || 0);

    if (charts.receita) {
        charts.receita.destroy();
    }

    charts.receita = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses.map(m => formatarMes(m + '-01')),
            datasets: [{
                label: 'Receita Mensal',
                data: receitas,
                backgroundColor: '#d4af37',
                borderColor: '#e8c547',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: '#e8c547'
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria gráfico de evolução do lucro (linhas)
 * @param {object} historico - Histórico financeiro
 */
function criarGraficoLucro(historico) {
    const ctx = document.getElementById('chartLucro')?.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(historico).sort();
    const lucros = meses.map(mes => historico[mes]?.lucroLiquido || 0);

    if (charts.lucro) {
        charts.lucro.destroy();
    }

    charts.lucro = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses.map(m => formatarMes(m + '-01')),
            datasets: [{
                label: 'Lucro Líquido',
                data: lucros,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d4af37',
                pointBorderColor: '#e8c547',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria gráfico de fluxo de caixa (linhas)
 * @param {object} historico - Histórico financeiro
 */
function criarGraficoFluxo(historico) {
    const ctx = document.getElementById('chartFluxo')?.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(historico).sort();
    const fluxos = meses.map(mes => historico[mes]?.fluxoCaixa || 0);

    if (charts.fluxo) {
        charts.fluxo.destroy();
    }

    charts.fluxo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses.map(m => formatarMes(m + '-01')),
            datasets: [{
                label: 'Fluxo de Caixa',
                data: fluxos,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#22d3ee',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria gráfico comparativo receita x custos
 * @param {object} historico - Histórico financeiro
 */
function criarGraficoComparativo(historico) {
    const ctx = document.getElementById('chartComparativo')?.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(historico).sort();
    const receitas = meses.map(mes => historico[mes]?.receitaBruta || 0);
    const despesas = meses.map(mes => historico[mes]?.despesasTotal || 0);

    if (charts.comparativo) {
        charts.comparativo.destroy();
    }

    charts.comparativo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses.map(m => formatarMes(m + '-01')),
            datasets: [
                {
                    label: 'Receita',
                    data: receitas,
                    backgroundColor: '#10b981',
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    backgroundColor: '#ef4444',
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria gráfico de distribuição financeira (pizza)
 * @param {object} financeiro - Dados financeiros
 */
function criarGraficoDistribuicao(financeiro) {
    const ctx = document.getElementById('chartDistribuicao')?.getContext('2d');
    if (!ctx) return;

    const receita = financeiro.receitaBruta || 0;
    const custos = financeiro.despesasTotal || 0;
    const impostos = financeiro.impostos || 0;
    const lucro = financeiro.lucroLiquido || 0;

    if (charts.distribuicao) {
        charts.distribuicao.destroy();
    }

    charts.distribuicao = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Custos', 'Impostos', 'Lucro'],
            datasets: [{
                data: [custos, impostos, lucro],
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#10b981'
                ],
                borderColor: '#1a1a1a',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            ...chartConfig,
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = 'R$ ' + context.parsed.toFixed(2);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return label + ': ' + value + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Cria gráfico de evolução do score
 * @param {object} scores - Histórico de scores
 */
function criarGraficoScore(scores) {
    const ctx = document.getElementById('chartScore')?.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(scores).sort();
    const valores = meses.map(mes => scores[mes]?.valor || 0);

    if (charts.score) {
        charts.score.destroy();
    }

    charts.score = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses.map(m => formatarMes(m + '-01')),
            datasets: [{
                label: 'Score Geral',
                data: valores,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d4af37',
                pointBorderColor: '#e8c547',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                ...chartConfig.scales,
                y: {
                    ...chartConfig.scales.y,
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                ...chartConfig.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Score: ' + context.parsed.y.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Atualiza todos os gráficos
 */
async function atualizarGraficos() {
    try {
        const historico = await DB.obterHistorico();
        const scores = await DB.obterScore(obterMesAtual()) ? 
            { [obterMesAtual()]: await DB.obterScore(obterMesAtual()) } : {};

        if (Object.keys(historico).length > 0) {
            const ultimoMes = Object.keys(historico).sort().pop();
            const financeiro = historico[ultimoMes];

            criarGraficoReceita(historico);
            criarGraficoLucro(historico);
            criarGraficoFluxo(historico);
            criarGraficoComparativo(historico);
            criarGraficoDistribuicao(financeiro);
            criarGraficoScore(scores);
        }
    } catch (erro) {
        console.error("Erro ao atualizar gráficos:", erro);
    }
}

/**
 * Inicializa gráficos com dados de exemplo
 */
function inicializarGraficosExemplo() {
    const historicoExemplo = {
        '2026-05': {
            mes: '2026-05',
            receitaBruta: 15000,
            despesasTotal: 8000,
            folhaPagamento: 3000,
            lucroLiquido: 7000,
            margem: 46.67,
            impostos: 900,
            fluxoCaixa: 6100
        },
        '2026-06': {
            mes: '2026-06',
            receitaBruta: 18000,
            despesasTotal: 9000,
            folhaPagamento: 3500,
            lucroLiquido: 9000,
            margem: 50,
            impostos: 1080,
            fluxoCaixa: 7920
        },
        '2026-07': {
            mes: '2026-07',
            receitaBruta: 20000,
            despesasTotal: 10000,
            folhaPagamento: 4000,
            lucroLiquido: 10000,
            margem: 50,
            impostos: 1200,
            fluxoCaixa: 8800
        }
    };

    criarGraficoReceita(historicoExemplo);
    criarGraficoLucro(historicoExemplo);
    criarGraficoFluxo(historicoExemplo);
    criarGraficoComparativo(historicoExemplo);
    criarGraficoDistribuicao(historicoExemplo['2026-07']);
    criarGraficoScore(historicoExemplo);
}

// Inicializar gráficos com exemplo ao carregar
document.addEventListener('DOMContentLoaded', inicializarGraficosExemplo);

console.log("✅ Charts carregado");
