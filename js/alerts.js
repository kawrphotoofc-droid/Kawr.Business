/* ==========================================
   KAWR BUSINESS v2.0
   alerts.js - Sistema de Alertas Inteligentes
========================================== */

/**
 * Gera alertas baseado em dados financeiros
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 * @param {object} financeiro - Dados financeiros
 */
async function gerarAlertas(usuarioId, mes, financeiro) {
    const alertas = [];

    // ===== ALERTA 1: FLUXO DE CAIXA NEGATIVO =====
    if (financeiro.fluxoCaixa < 0) {
        alertas.push({
            tipo: 'FLUXO_NEGATIVO',
            titulo: 'Fluxo de Caixa Negativo',
            mensagem: `Seu fluxo de caixa está negativo em R$ ${formatarMoeda(Math.abs(financeiro.fluxoCaixa))}. Isso significa que suas despesas superaram suas receitas. Recomendamos revisar os gastos e aumentar as vendas.`,
            icone: 'fa-arrow-down',
            cor: 'danger',
            acao: 'Revisar Despesas'
        });
    }

    // ===== ALERTA 2: DESPESAS MUITO ALTAS =====
    const percentualDespesas = (financeiro.despesasTotal / financeiro.receitaBruta) * 100;
    if (percentualDespesas > 85) {
        alertas.push({
            tipo: 'DESPESAS_ALTAS',
            titulo: 'Despesas Muito Altas',
            mensagem: `Suas despesas representam ${percentualDespesas.toFixed(1)}% da receita. O recomendado é manter abaixo de 70%. Considere renegociar contratos ou reduzir custos.`,
            icone: 'fa-exclamation-circle',
            cor: 'warning',
            acao: 'Analisar Despesas'
        });
    }

    // ===== ALERTA 3: RECEITA EM QUEDA =====
    try {
        const mesAnterior = obterMesAnterior(mes);
        const financeirAnterior = await DB.obterFinanceiro(usuarioId, mesAnterior);
        
        if (financeirAnterior) {
            const variacaoReceita = calcularVariacao(financeiro.receitaBruta, financeirAnterior.receitaBruta);
            if (variacaoReceita < -15) {
                alertas.push({
                    tipo: 'RECEITA_QUEDA',
                    titulo: 'Receita em Queda Significativa',
                    mensagem: `Sua receita caiu ${Math.abs(variacaoReceita).toFixed(1)}% em relação ao mês anterior. Investigue as causas dessa queda e revise suas estratégias comerciais.`,
                    icone: 'fa-chart-line',
                    cor: 'warning',
                    acao: 'Analisar Tendência'
                });
            }
        }
    } catch (erro) {
        console.error("Erro ao verificar receita anterior:", erro);
    }

    // ===== ALERTA 4: POSSÍVEL DESENQUADRAMENTO MEI =====
    const empresa = await DB.obterEmpresa(usuarioId);
    if (empresa && empresa.tipo === 'MEI' && financeiro.receitaBruta > KAWR.LIMITE_MEI) {
        alertas.push({
            tipo: 'DESENQUADRAMENTO_MEI',
            titulo: 'Possível Desenquadramento do MEI',
            mensagem: `Sua receita ultrapassou o limite de MEI (R$ ${formatarMoeda(KAWR.LIMITE_MEI)}). Você pode estar desenquadrado. Consulte um contador para regularizar sua situação.`,
            icone: 'fa-alert-triangle',
            cor: 'danger',
            acao: 'Consultar Contador'
        });
    }

    // ===== ALERTA 5: IMPOSTOS QUE MERECEM REVISÃO =====
    const cargaTributaria = (financeiro.impostos / financeiro.receitaBruta) * 100;
    if (cargaTributaria > 15) {
        alertas.push({
            tipo: 'IMPOSTOS_REVISAO',
            titulo: 'Carga Tributária Elevada',
            mensagem: `Sua carga tributária está em ${cargaTributaria.toFixed(1)}%, acima do normal. Há indícios de que você pode estar em um regime tributário inadequado. Recomendamos revisar com seu contador.`,
            icone: 'fa-receipt',
            cor: 'info',
            acao: 'Revisar Regime'
        });
    }

    // ===== ALERTA 6: DADOS INCOMPLETOS =====
    if (!financeiro.folhaPagamento || financeiro.folhaPagamento === 0) {
        alertas.push({
            tipo: 'DADOS_INCOMPLETOS',
            titulo: 'Informações Incompletas',
            mensagem: 'Você não preencheu a folha de pagamento. Isso pode afetar o cálculo do Fator R e da identificação do anexo. Atualize essas informações.',
            icone: 'fa-info-circle',
            cor: 'info',
            acao: 'Completar Dados'
        });
    }

    // Salvar alertas no banco de dados
    await DB.salvarAlertas(usuarioId, mes, alertas);

    // Atualizar interface
    atualizarAlertas(alertas);
}

/**
 * Atualiza a seção de alertas na interface
 * @param {array} alertas - Lista de alertas
 */
function atualizarAlertas(alertas) {
    const container = document.getElementById('alertasContainer');
    
    if (alertas.length === 0) {
        container.innerHTML = '<p class="empty-state">✅ Nenhum alerta no momento. Parabéns!</p>';
        return;
    }

    let html = '';
    alertas.forEach(alerta => {
        const corClass = `alert-${alerta.cor}`;
        html += `
            <div class="alert ${corClass}">
                <div class="alert-icon">
                    <i class="fas ${alerta.icone}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alerta.titulo}</h4>
                    <p>${alerta.mensagem}</p>
                    <button class="btn btn-secondary btn-sm" onclick="executarAcao('${alerta.acao}')">
                        ${alerta.acao}
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Executa ação de um alerta
 * @param {string} acao - Tipo de ação
 */
function executarAcao(acao) {
    switch(acao) {
        case 'Revisar Despesas':
            document.querySelector('[data-section="financeiro"]').click();
            break;
        case 'Analisar Despesas':
            document.querySelector('[data-section="graficos"]').click();
            break;
        case 'Analisar Tendência':
            document.querySelector('[data-section="historico"]').click();
            break;
        case 'Consultar Contador':
            alert('Entre em contato com seu contador para mais informações.');
            break;
        case 'Revisar Regime':
            document.querySelector('[data-section="configuracoes"]').click();
            break;
        case 'Completar Dados':
            document.querySelector('[data-section="financeiro"]').click();
            break;
    }
}

/**
 * Carrega alertas do mês
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 */
async function carregarAlertas(usuarioId, mes) {
    try {
        const alertas = await DB.obterAlertas(usuarioId, mes);
        atualizarAlertas(alertas);
    } catch (erro) {
        console.error("Erro ao carregar alertas:", erro);
    }
}

// ===== ESTILOS PARA ALERTAS =====
const estilosAlertas = `
.alert {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border-left: 4px solid;
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-tertiary) 100%);
    margin-bottom: var(--spacing-lg);
}

.alert-danger {
    border-left-color: var(--color-danger);
}

.alert-warning {
    border-left-color: var(--color-warning);
}

.alert-info {
    border-left-color: var(--color-info);
}

.alert-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.alert-danger .alert-icon {
    color: var(--color-danger);
}

.alert-warning .alert-icon {
    color: var(--color-warning);
}

.alert-info .alert-icon {
    color: var(--color-info);
}

.alert-content {
    flex: 1;
}

.alert-content h4 {
    color: var(--color-white);
    margin-bottom: var(--spacing-md);
    font-size: 1rem;
}

.alert-content p {
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
}

.btn-sm {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.85rem;
}
`;

// Injetar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = estilosAlertas;
document.head.appendChild(styleSheet);

console.log("✅ Alerts carregado");
