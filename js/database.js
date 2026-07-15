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
        
    } catch (erro) {
        notificarErro(erro.message);
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

console.log("✅ Database carregado");
