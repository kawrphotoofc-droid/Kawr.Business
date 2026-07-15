/* ==========================================
   KAWR BUSINESS v2.0
   database.js - Banco de Dados (Firestore Simulado)
========================================== */

// ===== CONSTANTE DE USUÁRIO PADRÃO =====
const DEFAULT_USER_ID = 'default_user';

// ===== BANCO DE DADOS LOCAL =====
const DB = {
    empresas: recuperarLocal('kawr_empresas') || {},
    financeiro: recuperarLocal('kawr_financeiro') || {},
    scores: recuperarLocal('kawr_scores') || {},
    alertas: recuperarLocal('kawr_alertas') || {},

    /**
     * Salva dados da empresa
     * @param {object} dados - Dados da empresa
     * @returns {Promise} Resultado da operação
     */
    salvarEmpresa: async function(dados) {
        return new Promise((resolve) => {
            this.empresas[DEFAULT_USER_ID] = {
                ...this.empresas[DEFAULT_USER_ID],
                ...dados,
                atualizadoEm: new Date().toISOString()
            };

            salvarLocal('kawr_empresas', this.empresas);

            resolve({
                sucesso: true,
                mensagem: "Dados da empresa salvos com sucesso",
                dados: this.empresas[DEFAULT_USER_ID]
            });
        });
    },

    /**
     * Obtém dados da empresa
     * @returns {Promise} Dados da empresa
     */
    obterEmpresa: async function() {
        return new Promise((resolve) => {
            const empresa = this.empresas[DEFAULT_USER_ID] || null;
            resolve(empresa);
        });
    },

    /**
     * Salva dados financeiros
     * @param {string} mes - Mês (YYYY-MM)
     * @param {object} dados - Dados financeiros
     * @returns {Promise} Resultado da operação
     */
    salvarFinanceiro: async function(mes, dados) {
        return new Promise((resolve) => {
            if (!this.financeiro[DEFAULT_USER_ID]) {
                this.financeiro[DEFAULT_USER_ID] = {};
            }

            this.financeiro[DEFAULT_USER_ID][mes] = {
                ...this.financeiro[DEFAULT_USER_ID][mes],
                ...dados,
                mes: mes,
                atualizadoEm: new Date().toISOString()
            };

            salvarLocal('kawr_financeiro', this.financeiro);

            resolve({
                sucesso: true,
                mensagem: "Dados financeiros salvos com sucesso",
                dados: this.financeiro[DEFAULT_USER_ID][mes]
            });
        });
    },

    /**
     * Obtém dados financeiros de um mês
     * @param {string} mes - Mês (YYYY-MM)
     * @returns {Promise} Dados financeiros
     */
    obterFinanceiro: async function(mes) {
        return new Promise((resolve) => {
            const dados = this.financeiro[DEFAULT_USER_ID]?.[mes] || null;
            resolve(dados);
        });
    },

    /**
     * Obtém histórico financeiro (todos os meses)
     * @returns {Promise} Histórico completo
     */
    obterHistorico: async function() {
        return new Promise((resolve) => {
            const historico = this.financeiro[DEFAULT_USER_ID] || {};
            resolve(historico);
        });
    },

    /**
     * Salva score da empresa
     * @param {string} mes - Mês (YYYY-MM)
     * @param {object} dados - Dados do score
     * @returns {Promise} Resultado da operação
     */
    salvarScore: async function(mes, dados) {
        return new Promise((resolve) => {
            if (!this.scores[DEFAULT_USER_ID]) {
                this.scores[DEFAULT_USER_ID] = {};
            }

            this.scores[DEFAULT_USER_ID][mes] = {
                ...this.scores[DEFAULT_USER_ID][mes],
                ...dados,
                mes: mes,
                atualizadoEm: new Date().toISOString()
            };

            salvarLocal('kawr_scores', this.scores);

            resolve({
                sucesso: true,
                mensagem: "Score salvo com sucesso",
                dados: this.scores[DEFAULT_USER_ID][mes]
            });
        });
    },

    /**
     * Obtém score de um mês
     * @param {string} mes - Mês (YYYY-MM)
     * @returns {Promise} Dados do score
     */
    obterScore: async function(mes) {
        return new Promise((resolve) => {
            const score = this.scores[DEFAULT_USER_ID]?.[mes] || null;
            resolve(score);
        });
    },

    /**
     * Salva alertas
     * @param {string} mes - Mês (YYYY-MM)
     * @param {array} alertas - Lista de alertas
     * @returns {Promise} Resultado da operação
     */
    salvarAlertas: async function(mes, alertas) {
        return new Promise((resolve) => {
            if (!this.alertas[DEFAULT_USER_ID]) {
                this.alertas[DEFAULT_USER_ID] = {};
            }

            this.alertas[DEFAULT_USER_ID][mes] = {
                alertas: alertas,
                atualizadoEm: new Date().toISOString()
            };

            salvarLocal('kawr_alertas', this.alertas);

            resolve({
                sucesso: true,
                mensagem: "Alertas salvos com sucesso",
                dados: this.alertas[DEFAULT_USER_ID][mes]
            });
        });
    },

    /**
     * Obtém alertas de um mês
     * @param {string} mes - Mês (YYYY-MM)
     * @returns {Promise} Lista de alertas
     */
    obterAlertas: async function(mes) {
        return new Promise((resolve) => {
            const dados = this.alertas[DEFAULT_USER_ID]?.[mes] || { alertas: [] };
            resolve(dados.alertas);
        });
    },

    /**
     * Limpa todos os dados
     * @returns {Promise} Resultado da operação
     */
    limparDados: async function() {
        return new Promise((resolve) => {
            delete this.empresas[DEFAULT_USER_ID];
            delete this.financeiro[DEFAULT_USER_ID];
            delete this.scores[DEFAULT_USER_ID];
            delete this.alertas[DEFAULT_USER_ID];

            salvarLocal('kawr_empresas', this.empresas);
            salvarLocal('kawr_financeiro', this.financeiro);
            salvarLocal('kawr_scores', this.scores);
            salvarLocal('kawr_alertas', this.alertas);

            resolve({
                sucesso: true,
                mensagem: "Todos os dados foram removidos"
            });
        });
    }
};

// ===== FUNÇÕES DE CARREGAMENTO =====

/**
 * Carrega dados da empresa no formulário
 */
async function carregarDadosEmpresa() {
    const empresa = await DB.obterEmpresa();
    
    if (empresa) {
        document.getElementById('inputEmpresa').value = empresa.nome || '';
        document.getElementById('inputCNPJ').value = empresa.cnpj || '';
        document.getElementById('inputTipo').value = empresa.tipo || '';
        document.getElementById('inputRegime').value = empresa.regime || '';

        // Atualizar configurações
        document.getElementById('configEmpresa').textContent = empresa.nome || '-';
        document.getElementById('configCNPJ').textContent = empresa.cnpj ? formatarCNPJ(empresa.cnpj) : '-';
        document.getElementById('configTipo').textContent = empresa.tipo || '-';
    }
}

/**
 * Carrega dados financeiros do mês atual
 */
async function carregarFinanceiro() {
    const mes = obterMesAtual();
    const financeiro = await DB.obterFinanceiro(mes);

    if (financeiro) {
        document.getElementById('inputReceitaBruta').value = financeiro.receitaBruta || 0;
        document.getElementById('inputDespesasTotal').value = financeiro.despesasTotal || 0;
        document.getElementById('inputFolha').value = financeiro.folhaPagamento || 0;
        document.getElementById('inputPeriodo').value = financeiro.mes || mes;
    }
}

/**
 * Salva dados da empresa
 */
async function salvarDadosEmpresa() {
    const empresa = {
        nome: document.getElementById('inputEmpresa').value.trim(),
        cnpj: document.getElementById('inputCNPJ').value.trim(),
        tipo: document.getElementById('inputTipo').value,
        regime: document.getElementById('inputRegime').value
    };

    if (!empresa.nome) {
        notificarErro("Informe o nome da empresa");
        return;
    }

    try {
        await DB.salvarEmpresa(empresa);
        notificarSucesso("Dados da empresa salvos com sucesso");
        await carregarDadosEmpresa();
    } catch (erro) {
        notificarErro(erro.message);
    }
}

/**
 * Salva dados financeiros
 */
async function salvarDadosFinanceiro() {
    const mes = document.getElementById('inputPeriodo').value || obterMesAtual();
    const receitaBruta = Number(document.getElementById('inputReceitaBruta').value) || 0;
    const despesasTotal = Number(document.getElementById('inputDespesasTotal').value) || 0;
    const folhaPagamento = Number(document.getElementById('inputFolha').value) || 0;

    if (receitaBruta <= 0) {
        notificarErro("Informe a receita bruta");
        return;
    }

    // Calcular indicadores
    const lucroLiquido = calcularLucro(receitaBruta, despesasTotal);
    const margem = calcularMargem(receitaBruta, lucroLiquido);
    const fatorR = calcularFatorR(receitaBruta, folhaPagamento);
    const anexo = identificarAnexo(fatorR);
    const impostos = calcularDAS(receitaBruta, anexo);
    const fluxoCaixa = lucroLiquido - impostos;

    const financeiro = {
        mes: mes,
        receitaBruta: receitaBruta,
        despesasTotal: despesasTotal,
        folhaPagamento: folhaPagamento,
        lucroLiquido: lucroLiquido,
        margem: margem,
        fatorR: fatorR,
        anexo: anexo,
        impostos: impostos,
        fluxoCaixa: fluxoCaixa
    };

    try {
        await DB.salvarFinanceiro(mes, financeiro);
        notificarSucesso("Dados financeiros salvos com sucesso");
        
        // Atualizar dashboard
        atualizarDashboard(financeiro);
        
        // Calcular score
        await calcularEAtualizarScore(mes, financeiro);
        
        // Gerar alertas
        await gerarAlertas(mes, financeiro);

        // Gerar memória de cálculo
        const empresaDados = await DB.obterEmpresa();
        gerarMemoriaCalculo(financeiro, empresaDados);
        
    } catch (erro) {
        notificarErro(erro.message);
    }
}

// ===== GERAR MEMÓRIA DE CÁLCULO =====

/**
 * Gera e exibe a memória de cálculo na seção financeira.
 * Chamada após salvar dados financeiros com sucesso.
 * @param {object} fin - Objeto com os dados financeiros calculados
 * @param {object} empresa - Objeto com os dados da empresa
 */
function gerarMemoriaCalculo(fin, empresa) {
    const tipoEmpresa = empresa?.tipo || 'N/A';
    const regime = empresa?.regime || 'N/A';
    const regimeLabel = {
        simples: 'Simples Nacional',
        presumido: 'Lucro Presumido',
        real: 'Lucro Real'
    }[regime] || regime;

    const html = `
        <h2><i class="fas fa-calculator" style="margin-right:8px;"></i>Memória de Cálculo</h2>

        <p><strong>Empresa:</strong> ${empresa?.nome || 'N/A'} (${tipoEmpresa})</p>
        <p><strong>Regime Tributário:</strong> ${regimeLabel}</p>
        <p><strong>Período:</strong> ${formatarMes ? formatarMes(fin.mes) : fin.mes}</p>

        <hr>

        <p><strong>1. Receita Bruta:</strong> ${formatarMoeda(fin.receitaBruta)}</p>
        <p><strong>2. Despesas Totais:</strong> ${formatarMoeda(fin.despesasTotal)}</p>
        <p><strong>3. Folha de Pagamento:</strong> ${formatarMoeda(fin.folhaPagamento)}</p>

        <hr>

        <p><strong>4. Lucro Líquido</strong> = Receita Bruta − Despesas Totais</p>
        <p>&nbsp;&nbsp;&nbsp;= ${formatarMoeda(fin.receitaBruta)} − ${formatarMoeda(fin.despesasTotal)}
           = <strong>${formatarMoeda(fin.lucroLiquido)}</strong></p>

        <p><strong>5. Margem de Lucro</strong> = (Lucro Líquido / Receita Bruta) × 100</p>
        <p>&nbsp;&nbsp;&nbsp;= (${formatarMoeda(fin.lucroLiquido)} / ${formatarMoeda(fin.receitaBruta)}) × 100
           = <strong>${fin.margem.toFixed(2)}%</strong></p>

        <p><strong>6. Fator R</strong> = Folha de Pagamento / Receita Bruta (12 meses)</p>
        <p>&nbsp;&nbsp;&nbsp;= ${formatarMoeda(fin.folhaPagamento)} / ${formatarMoeda(fin.receitaBruta)}
           = <strong>${(fin.fatorR * 100).toFixed(2)}%</strong>
           &rarr; ${fin.fatorR >= 0.28 ? 'Fator R ≥ 28% (Anexo III favorável)' : 'Fator R < 28% (Anexo V)'}</p>

        <hr>

        <p><strong>7. Enquadramento:</strong> ${fin.anexo || 'N/A'}</p>
        <p><strong>8. DAS Estimado (Imposto):</strong> ${formatarMoeda(fin.impostos)}</p>

        <p><strong>9. Fluxo de Caixa</strong> = Lucro Líquido − DAS</p>
        <p>&nbsp;&nbsp;&nbsp;= ${formatarMoeda(fin.lucroLiquido)} − ${formatarMoeda(fin.impostos)}
           = <strong style="color: ${fin.fluxoCaixa >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${formatarMoeda(fin.fluxoCaixa)}</strong></p>
    `;

    const memoriaBox = document.getElementById('memoriaBox');
    const memoriaSection = document.getElementById('memoriaSection');
    const verCalculosWrapper = document.getElementById('verCalculosWrapper');

    if (memoriaBox) memoriaBox.innerHTML = html;

    // Exibir a seção e o botão
    if (memoriaSection) memoriaSection.style.display = 'block';
    if (verCalculosWrapper) verCalculosWrapper.style.display = 'block';

    // Garantir que a memória comece recolhida após novo cálculo
    const collapsible = document.getElementById('memoriaCollapsible');
    const btn = document.getElementById('btnVerCalculos');
    if (collapsible) collapsible.classList.remove('aberto');
    if (btn) {
        btn.classList.remove('aberto');
        btn.setAttribute('aria-expanded', 'false');
        const label = document.getElementById('btnVerCalculosLabel');
        if (label) label.textContent = 'Ver Cálculos';
    }
}

// ===== EVENT LISTENERS =====

document.getElementById('btnSalvarDados')?.addEventListener('click', async function() {
    await salvarDadosEmpresa();
    await salvarDadosFinanceiro();
});

document.getElementById('btnLimparDados')?.addEventListener('click', async function() {
    if (confirm("Tem certeza? Todos os dados serão removidos permanentemente.")) {
        await DB.limparDados();
        notificarSucesso("Todos os dados foram removidos");
        location.reload();
    }
});

// ===== TOGGLE VER CÁLCULOS =====

document.addEventListener('DOMContentLoaded', function() {
    const btnVerCalculos = document.getElementById('btnVerCalculos');
    if (!btnVerCalculos) return;

    btnVerCalculos.addEventListener('click', function() {
        const collapsible = document.getElementById('memoriaCollapsible');
        const label = document.getElementById('btnVerCalculosLabel');
        const estaAberto = collapsible.classList.contains('aberto');

        if (estaAberto) {
            collapsible.classList.remove('aberto');
            btnVerCalculos.classList.remove('aberto');
            btnVerCalculos.setAttribute('aria-expanded', 'false');
            if (label) label.textContent = 'Ver Cálculos';
        } else {
            collapsible.classList.add('aberto');
            btnVerCalculos.classList.add('aberto');
            btnVerCalculos.setAttribute('aria-expanded', 'true');
            if (label) label.textContent = 'Ocultar Cálculos';

            // Rolar suavemente até a memória
            setTimeout(() => {
                document.getElementById('memoriaSection')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 80);
        }
    });
});

console.log("✅ Database carregado");
