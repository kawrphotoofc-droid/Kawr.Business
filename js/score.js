/* ==========================================
   KAWR BUSINESS v2.0
   score.js - Score Inteligente
========================================== */

/**
 * Calcula score inteligente baseado em múltiplos fatores
 * @param {object} financeiro - Dados financeiros
 * @param {object} anterior - Dados do mês anterior (opcional)
 * @returns {object} Objeto com score e análise
 */
function calcularScoreInteligente(financeiro, anterior = null) {
    const score = {
        valor: 0,
        fluxoCaixa: 0,
        receita: 0,
        lucro: 0,
        margem: 0,
        liquidez: 0,
        endividamento: 0,
        impostos: 0,
        crescimento: 0,
        estabilidade: 0,
        fatoresInfluentes: [],
        recomendacoes: []
    };

    // ===== FATOR 1: FLUXO DE CAIXA (20 pontos) =====
    if (financeiro.fluxoCaixa > 0) {
        score.fluxoCaixa = 20;
        score.fatoresInfluentes.push({
            fator: "Fluxo de Caixa Positivo",
            impacto: "+20",
            cor: "success"
        });
    } else if (financeiro.fluxoCaixa > -financeiro.receita * 0.1) {
        score.fluxoCaixa = 10;
        score.fatoresInfluentes.push({
            fator: "Fluxo de Caixa Levemente Negativo",
            impacto: "+10",
            cor: "warning"
        });
    } else {
        score.fluxoCaixa = 0;
        score.fatoresInfluentes.push({
            fator: "Fluxo de Caixa Crítico",
            impacto: "0",
            cor: "danger"
        });
        score.recomendacoes.push("Fluxo de caixa negativo. Procure orientação de um contador.");
    }

    // ===== FATOR 2: RECEITA (15 pontos) =====
    if (financeiro.receitaBruta >= 50000) {
        score.receita = 15;
        score.fatoresInfluentes.push({
            fator: "Receita Saudável",
            impacto: "+15",
            cor: "success"
        });
    } else if (financeiro.receitaBruta >= 20000) {
        score.receita = 10;
        score.fatoresInfluentes.push({
            fator: "Receita Moderada",
            impacto: "+10",
            cor: "info"
        });
    } else if (financeiro.receitaBruta >= 5000) {
        score.receita = 5;
        score.fatoresInfluentes.push({
            fator: "Receita Baixa",
            impacto: "+5",
            cor: "warning"
        });
    } else {
        score.receita = 0;
        score.fatoresInfluentes.push({
            fator: "Receita Muito Baixa",
            impacto: "0",
            cor: "danger"
        });
        score.recomendacoes.push("Receita muito baixa. Considere revisar estratégias de vendas.");
    }

    // ===== FATOR 3: LUCRO LÍQUIDO (15 pontos) =====
    if (financeiro.lucroLiquido > financeiro.receitaBruta * 0.3) {
        score.lucro = 15;
        score.fatoresInfluentes.push({
            fator: "Lucro Excelente",
            impacto: "+15",
            cor: "success"
        });
    } else if (financeiro.lucroLiquido > financeiro.receitaBruta * 0.15) {
        score.lucro = 10;
        score.fatoresInfluentes.push({
            fator: "Lucro Bom",
            impacto: "+10",
            cor: "success"
        });
    } else if (financeiro.lucroLiquido > 0) {
        score.lucro = 5;
        score.fatoresInfluentes.push({
            fator: "Lucro Baixo",
            impacto: "+5",
            cor: "warning"
        });
        score.recomendacoes.push("Lucro baixo. Analise a margem de ganho em seus produtos/serviços.");
    } else {
        score.lucro = 0;
        score.fatoresInfluentes.push({
            fator: "Sem Lucro",
            impacto: "0",
            cor: "danger"
        });
        score.recomendacoes.push("Empresa operando no prejuízo. Ação imediata necessária.");
    }

    // ===== FATOR 4: MARGEM DE LUCRO (15 pontos) =====
    if (financeiro.margem >= 30) {
        score.margem = 15;
        score.fatoresInfluentes.push({
            fator: "Margem Excelente",
            impacto: "+15",
            cor: "success"
        });
    } else if (financeiro.margem >= 15) {
        score.margem = 10;
        score.fatoresInfluentes.push({
            fator: "Margem Boa",
            impacto: "+10",
            cor: "success"
        });
    } else if (financeiro.margem >= 5) {
        score.margem = 5;
        score.fatoresInfluentes.push({
            fator: "Margem Baixa",
            impacto: "+5",
            cor: "warning"
        });
        score.recomendacoes.push("Margem de lucro baixa. Considere aumentar preços ou reduzir custos.");
    } else {
        score.margem = 0;
        score.fatoresInfluentes.push({
            fator: "Margem Crítica",
            impacto: "0",
            cor: "danger"
        });
    }

    // ===== FATOR 5: LIQUIDEZ (10 pontos) =====
    const razaoLiquidez = financeiro.fluxoCaixa / financeiro.despesasTotal;
    if (razaoLiquidez > 0.5) {
        score.liquidez = 10;
        score.fatoresInfluentes.push({
            fator: "Liquidez Boa",
            impacto: "+10",
            cor: "success"
        });
    } else if (razaoLiquidez > 0.2) {
        score.liquidez = 5;
        score.fatoresInfluentes.push({
            fator: "Liquidez Moderada",
            impacto: "+5",
            cor: "info"
        });
    } else {
        score.liquidez = 0;
        score.fatoresInfluentes.push({
            fator: "Liquidez Baixa",
            impacto: "0",
            cor: "warning"
        });
    }

    // ===== FATOR 6: CARGA TRIBUTÁRIA (10 pontos) =====
    const cargaTributaria = (financeiro.impostos / financeiro.receitaBruta) * 100;
    if (cargaTributaria <= 10) {
        score.impostos = 10;
        score.fatoresInfluentes.push({
            fator: "Carga Tributária Otimizada",
            impacto: "+10",
            cor: "success"
        });
    } else if (cargaTributaria <= 15) {
        score.impostos = 5;
        score.fatoresInfluentes.push({
            fator: "Carga Tributária Normal",
            impacto: "+5",
            cor: "info"
        });
    } else {
        score.impostos = 0;
        score.fatoresInfluentes.push({
            fator: "Carga Tributária Alta",
            impacto: "0",
            cor: "warning"
        });
        score.recomendacoes.push("Carga tributária acima do normal. Revise com seu contador.");
    }

    // ===== FATOR 7: CRESCIMENTO (5 pontos) =====
    if (anterior) {
        const crescimentoReceita = calcularVariacao(financeiro.receitaBruta, anterior.receitaBruta);
        if (crescimentoReceita > 10) {
            score.crescimento = 5;
            score.fatoresInfluentes.push({
                fator: "Crescimento Positivo",
                impacto: "+5",
                cor: "success"
            });
        } else if (crescimentoReceita > 0) {
            score.crescimento = 3;
            score.fatoresInfluentes.push({
                fator: "Crescimento Leve",
                impacto: "+3",
                cor: "info"
            });
        } else if (crescimentoReceita > -10) {
            score.crescimento = 1;
            score.fatoresInfluentes.push({
                fator: "Receita em Queda Leve",
                impacto: "+1",
                cor: "warning"
            });
        } else {
            score.crescimento = 0;
            score.fatoresInfluentes.push({
                fator: "Receita em Queda Significativa",
                impacto: "0",
                cor: "danger"
            });
            score.recomendacoes.push("Receita em queda significativa. Revise estratégias comerciais.");
        }
    } else {
        score.crescimento = 5; // Primeira vez
    }

    // ===== FATOR 8: ESTABILIDADE (5 pontos) =====
    if (financeiro.despesasTotal <= financeiro.receitaBruta * 0.7) {
        score.estabilidade = 5;
        score.fatoresInfluentes.push({
            fator: "Despesas Controladas",
            impacto: "+5",
            cor: "success"
        });
    } else if (financeiro.despesasTotal <= financeiro.receitaBruta * 0.85) {
        score.estabilidade = 3;
        score.fatoresInfluentes.push({
            fator: "Despesas Moderadas",
            impacto: "+3",
            cor: "info"
        });
    } else {
        score.estabilidade = 0;
        score.fatoresInfluentes.push({
            fator: "Despesas Muito Altas",
            impacto: "0",
            cor: "danger"
        });
        score.recomendacoes.push("As despesas estão acima do recomendado. Revise os gastos fixos.");
    }

    // ===== CÁLCULO FINAL =====
    score.valor = Math.min(100, Math.max(0, 
        score.fluxoCaixa + 
        score.receita + 
        score.lucro + 
        score.margem + 
        score.liquidez + 
        score.impostos + 
        score.crescimento + 
        score.estabilidade
    ));

    return score;
}

/**
 * Obtém faixa de score com cor e mensagem
 * @param {number} valor - Valor do score
 * @returns {object} Objeto com faixa, cor e mensagem
 */
function obterFaixaScore(valor) {
    for (const [key, faixa] of Object.entries(KAWR.SCORE_RANGES)) {
        if (valor >= faixa.min && valor <= faixa.max) {
            return {
                faixa: key,
                label: faixa.label,
                cor: faixa.color,
                min: faixa.min,
                max: faixa.max
            };
        }
    }
    return KAWR.SCORE_RANGES.EXCEPTIONAL;
}

/**
 * Atualiza score no dashboard
 * @param {object} score - Objeto do score
 */
function atualizarScoreDashboard(score) {
    const faixa = obterFaixaScore(score.valor);

    // Atualizar valor do score
    document.getElementById('cardScore').textContent = Math.round(score.valor);
    document.getElementById('scoreLabelStatus').textContent = faixa.label;
    document.getElementById('scoreFill').style.width = score.valor + '%';
    document.getElementById('scoreFill').style.backgroundColor = faixa.cor;

    // Atualizar insights
    const insightsBox = document.getElementById('insightsBox');
    let html = '<div class="insights-content">';

    // Fatores influentes
    html += '<div class="insights-factors">';
    html += '<h4>Fatores Influentes:</h4>';
    score.fatoresInfluentes.forEach(fator => {
        const classe = `badge-${fator.cor}`;
        html += `<div class="insight-item"><span class="${classe}">${fator.fator}</span> <strong>${fator.impacto}</strong></div>`;
    });
    html += '</div>';

    // Recomendações
    if (score.recomendacoes.length > 0) {
        html += '<div class="insights-recomendacoes">';
        html += '<h4>Recomendações:</h4>';
        score.recomendacoes.forEach(rec => {
            html += `<p>💡 ${rec}</p>`;
        });
        html += '</div>';
    }

    html += '</div>';
    insightsBox.innerHTML = html;
}

/**
 * Calcula e atualiza score
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 * @param {object} financeiro - Dados financeiros
 */
async function calcularEAtualizarScore(usuarioId, mes, financeiro) {
    try {
        // Obter dados do mês anterior
        const mesAnterior = obterMesAnterior(mes);
        const financeirAnterior = await DB.obterFinanceiro(usuarioId, mesAnterior);

        // Calcular score
        const score = calcularScoreInteligente(financeiro, financeirAnterior);

        // Salvar no banco de dados
        await DB.salvarScore(usuarioId, mes, score);

        // Atualizar dashboard
        atualizarScoreDashboard(score);

    } catch (erro) {
        console.error("Erro ao calcular score:", erro);
    }
}

/**
 * Carrega e exibe score do mês
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 */
async function carregarScore(usuarioId, mes) {
    try {
        const score = await DB.obterScore(usuarioId, mes);
        if (score) {
            atualizarScoreDashboard(score);
        }
    } catch (erro) {
        console.error("Erro ao carregar score:", erro);
    }
}

console.log("✅ Score carregado");
