/* ==========================================
   KAWR BUSINESS v2.0
   config.js - Configurações Globais
========================================== */

// ===== FIREBASE CONFIGURATION =====
// Substitua com suas credenciais do Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDemoKey1234567890ABCDEFGHIJKLMNOP",
    authDomain: "kawr-business.firebaseapp.com",
    projectId: "kawr-business",
    storageBucket: "kawr-business.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// ===== CONSTANTES DO SISTEMA =====
const KAWR = {
    VERSION: "2.0",
    APP_NAME: "Kawr Business",
    
    // Faixas de Score
    SCORE_RANGES: {
        CRITICAL: { min: 0, max: 25, color: "#ef4444", label: "Alto risco financeiro" },
        POOR: { min: 26, max: 45, color: "#f97316", label: "Empresa em dificuldades" },
        ATTENTION: { min: 46, max: 50, color: "#eab308", label: "Situação de atenção" },
        HEALTHY: { min: 51, max: 70, color: "#10b981", label: "Empresa saudável" },
        EXCELLENT: { min: 71, max: 90, color: "#3b82f6", label: "Excelente desempenho" },
        EXCEPTIONAL: { min: 91, max: 100, color: "#a855f7", label: "Desempenho excepcional" }
    },

    // Anexos do Simples Nacional
    ANEXOS: {
        III: { name: "Anexo III", aliquota: 0.06, deducao: 0 },
        IV: { name: "Anexo IV", aliquota: 0.045, deducao: 0 },
        V: { name: "Anexo V", aliquota: 0.155, deducao: 0 }
    },

    // Tipos de Empresa
    TIPOS_EMPRESA: ["MEI", "ME"],

    // Regimes Tributários
    REGIMES: {
        simples: "Simples Nacional",
        presumido: "Lucro Presumido",
        real: "Lucro Real"
    },

    // Cores dos Gráficos
    CHART_COLORS: {
        primary: "#d4af37",
        secondary: "#3b82f6",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        info: "#06b6d4"
    },

    // Limites MEI
    LIMITE_MEI: 81000,
    LIMITE_ME: 360000
};

// ===== ESTRUTURA DE DADOS PADRÃO =====
const DEFAULT_EMPRESA = {
    nome: "",
    cnpj: "",
    tipo: "",
    regime: "",
    estado: "",
    cidade: "",
    dataAbertura: "",
    areaAtuacao: "",
    criadoEm: new Date().toISOString()
};

const DEFAULT_FINANCEIRO = {
    mes: new Date().toISOString().slice(0, 7),
    receitaBruta: 0,
    despesasTotal: 0,
    folhaPagamento: 0,
    fluxoCaixa: 0,
    impostos: 0,
    lucroLiquido: 0,
    margem: 0,
    fatorR: 0,
    anexo: "",
    observacoes: "",
    atualizadoEm: new Date().toISOString()
};

const DEFAULT_SCORE = {
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
    atualizadoEm: new Date().toISOString()
};

// ===== OBSERVAÇÕES INTELIGENTES =====
const OBSERVACOES = {
    receita: {
        aumentou: "As receitas aumentaram em relação ao mês anterior.",
        diminuiu: "As receitas diminuíram em relação ao mês anterior.",
        estavel: "As receitas mantiveram-se estáveis.",
        baixa: "Receita abaixo do esperado. Considere revisar estratégias de vendas."
    },
    despesa: {
        aumentou: "As despesas cresceram em relação ao mês anterior.",
        diminuiu: "As despesas diminuíram em relação ao mês anterior.",
        estavel: "As despesas mantiveram-se estáveis.",
        alta: "As despesas estão acima do recomendado. Revise os gastos fixos."
    },
    lucro: {
        aumentou: "Seu lucro aumentou. Excelente resultado!",
        diminuiu: "Seu lucro diminuiu devido ao aumento dos custos.",
        estavel: "Seu lucro manteve-se estável.",
        baixo: "Lucro baixo. Analise a margem de ganho em seus produtos/serviços."
    },
    fluxoCaixa: {
        positivo: "O fluxo de caixa permanece saudável.",
        negativo: "Fluxo de caixa negativo. Atenção com as obrigações financeiras.",
        critico: "Fluxo de caixa crítico. Procure orientação de um contador."
    },
    margem: {
        boa: "Margem de lucro saudável. Mantenha o controle.",
        baixa: "Margem de lucro baixa. Considere aumentar preços ou reduzir custos.",
        excelente: "Margem de lucro excelente. Continue assim!"
    }
};

// ===== ALERTAS PADRÃO =====
const ALERTAS_TIPOS = {
    FLUXO_NEGATIVO: {
        titulo: "Fluxo de Caixa Negativo",
        icone: "fa-arrow-down",
        cor: "danger"
    },
    DESPESAS_ALTAS: {
        titulo: "Despesas Muito Altas",
        icone: "fa-exclamation-circle",
        cor: "warning"
    },
    RECEITA_QUEDA: {
        titulo: "Receita em Queda",
        icone: "fa-chart-line",
        cor: "warning"
    },
    DESENQUADRAMENTO_MEI: {
        titulo: "Possível Desenquadramento do MEI",
        icone: "fa-alert-triangle",
        cor: "danger"
    },
    IMPOSTOS_REVISAO: {
        titulo: "Impostos que Merecem Revisão",
        icone: "fa-receipt",
        cor: "info"
    },
    DADOS_INCOMPLETOS: {
        titulo: "Informações Financeiras Incompletas",
        icone: "fa-info-circle",
        cor: "info"
    }
};

console.log(`%c Kawr Business v${KAWR.VERSION} iniciado`, "color: #d4af37; font-weight: bold; font-size: 14px;");
