// SPA Navigation Logic
function navigateTo(sectionId) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-section") === sectionId) {
            item.classList.add("active");
        }
    });
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");
    closeSidebar();
    window.scrollTo(0, 0);
}

const mobileMenu = document.getElementById("mobile-menu");
const sidebar = document.getElementById("sidebar");
const closeMenu = document.getElementById("close-menu");
const menuOverlay = document.getElementById("menu-overlay");

function openSidebar() {
    sidebar.classList.add("active");
    menuOverlay.classList.add("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    menuOverlay.classList.remove("active");
}

mobileMenu.addEventListener("click", openSidebar);
closeMenu.addEventListener("click", closeSidebar);
menuOverlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        const sectionId = item.getAttribute("data-section");
        navigateTo(sectionId);
    });
});

document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
        const item = header.parentElement;
        const isActive = item.classList.contains("active");
        document.querySelectorAll(".accordion-item").forEach(otherItem => {
            otherItem.classList.remove("active");
        });
        if (!isActive) {
            item.classList.add("active");
        }
    });
});

// ============================================
// SISTEMA DE ESTADO GLOBAL E SINCRONIZAÇÃO
// ============================================

// Estado global que será sincronizado entre painéis
let globalState = {
    // Dados do Contador
    receita_bruta: 125400,
    deducoes_impostos: 15048,
    receita_liquida: 110352,
    custos_variaveis: 45200,
    margem_contribuicao: 65152,
    despesas_fixas: 22000,
    lucro_operacional: 43152,
    
    // Dados da Calculadora
    calc_custo: 100,
    calc_venda: 180,
    calc_be_fixo: 20000,
    calc_be_margem: 40,
    
    // Dados do Simples
    rbt12: 1200000,
    fat_mensal: 100000,
    aliq_efetiva: 0.105,
    valor_das: 10500,
    
    // Score e Indicadores
    score_financeiro: 858,
    score_max: 1000,
    liquidez: 85,
    rentabilidade: 78,
    endividamento: 20,
    alavancagem: 45,
    
    // Histórico para gráficos
    entradas_historico: [100000, 115000, 108000, 125000, 130000, 125400],
    saidas_historico: [80000, 85000, 82000, 90000, 88000, 82248],
    lucro_historico: [20000, 30000, 26000, 35000, 42000, 43152]
};

// Global chart instances
let lineChartInstance = null;
let barChartInstance = null;

// Intervalo de atualização automática
let updateInterval = null;

// ============================================
// FUNÇÕES DE CÁLCULO DO CONTADOR
// ============================================

function calcularSimples() {
    const rbt12 = parseFloat(document.getElementById("rbt12").value) || 0;
    const fatMensal = parseFloat(document.getElementById("fat-mensal").value) || 0;
    
    let aliqNominal = 0;
    let parcelaDeducao = 0;
    
    if (rbt12 <= 180000) { aliqNominal = 0.06; parcelaDeducao = 0; }
    else if (rbt12 <= 360000) { aliqNominal = 0.112; parcelaDeducao = 9360; }
    else if (rbt12 <= 720000) { aliqNominal = 0.135; parcelaDeducao = 17640; }
    else if (rbt12 <= 1800000) { aliqNominal = 0.16; parcelaDeducao = 35640; }
    else if (rbt12 <= 3600000) { aliqNominal = 0.21; parcelaDeducao = 125640; }
    else { aliqNominal = 0.33; parcelaDeducao = 648000; }
    
    const aliqEfetiva = ((rbt12 * aliqNominal) - parcelaDeducao) / rbt12;
    const valorDas = fatMensal * aliqEfetiva;
    
    // Atualizar estado global
    globalState.rbt12 = rbt12;
    globalState.fat_mensal = fatMensal;
    globalState.aliq_efetiva = aliqEfetiva;
    globalState.valor_das = valorDas;
    
    // Atualizar UI do contador
    document.getElementById("aliq-efetiva").innerText = (aliqEfetiva * 100).toFixed(2) + "%";
    document.getElementById("valor-das").innerText = "R$ " + valorDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    
    // Recalcular dados derivados
    recalcularDadosGlobais();
}

// ============================================
// FUNÇÕES DE CÁLCULO DA CALCULADORA
// ============================================

function calcularMargem() {
    const custo = parseFloat(document.getElementById("calc-custo").value) || 0;
    const venda = parseFloat(document.getElementById("calc-venda").value) || 0;
    
    // Atualizar estado global
    globalState.calc_custo = custo;
    globalState.calc_venda = venda;
    
    if (venda > 0) {
        const markup = venda / custo;
        const margem = ((venda - custo) / venda) * 100;
        document.getElementById("res-markup").innerText = markup.toFixed(2);
        document.getElementById("res-margem").innerText = margem.toFixed(2) + "%";
    }
    
    // Recalcular dados derivados
    recalcularDadosGlobais();
}

function calcularBE() {
    const fixo = parseFloat(document.getElementById("be-fixo").value) || 0;
    const margemCont = parseFloat(document.getElementById("be-margem").value) || 0;
    
    // Atualizar estado global
    globalState.calc_be_fixo = fixo;
    globalState.calc_be_margem = margemCont;
    
    if (margemCont > 0) {
        const be = fixo / (margemCont / 100);
        document.getElementById("res-be").innerText = "R$ " + be.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }
    
    // Recalcular dados derivados
    recalcularDadosGlobais();
}

// ============================================
// FUNÇÕES DE RECÁLCULO E SINCRONIZAÇÃO
// ============================================

function recalcularDadosGlobais() {
    // Calcular margens e indicadores baseado na calculadora
    const markup = globalState.calc_venda > 0 ? globalState.calc_venda / globalState.calc_custo : 1;
    const margemLucro = globalState.calc_venda > 0 ? ((globalState.calc_venda - globalState.calc_custo) / globalState.calc_venda) * 100 : 0;
    const breakEven = globalState.calc_be_margem > 0 ? globalState.calc_be_fixo / (globalState.calc_be_margem / 100) : 0;
    
    // Simular variação realista dos valores baseado nas mudanças da calculadora
    const fatorMargem = margemLucro / 44.44; // 44.44% é o padrão inicial
    const fatorBE = breakEven / 50000; // 50000 é o break-even padrão
    
    // Atualizar receita bruta com base na margem
    globalState.receita_bruta = 125400 * (0.9 + fatorMargem * 0.2);
    
    // Atualizar custos variáveis
    globalState.custos_variaveis = 45200 * (1 - margemLucro / 100 * 0.1);
    
    // Manter despesas fixas próximas ao valor do break-even
    globalState.despesas_fixas = Math.min(22000, breakEven * 0.4);
    
    // Calcular receita líquida
    globalState.receita_liquida = globalState.receita_bruta - globalState.deducoes_impostos;
    
    // Calcular margem de contribuição
    globalState.margem_contribuicao = globalState.receita_liquida - globalState.custos_variaveis;
    
    // Calcular lucro operacional
    globalState.lucro_operacional = globalState.margem_contribuicao - globalState.despesas_fixas;
    
    // Calcular score financeiro baseado em indicadores
    calcularScoreFinanceiro();
    
    // Atualizar histórico com novos valores
    globalState.entradas_historico.shift();
    globalState.entradas_historico.push(globalState.receita_bruta);
    
    globalState.saidas_historico.shift();
    globalState.saidas_historico.push(globalState.custos_variaveis + globalState.despesas_fixas);
    
    globalState.lucro_historico.shift();
    globalState.lucro_historico.push(globalState.lucro_operacional);
}

function calcularScoreFinanceiro() {
    // Calcular indicadores
    const margemLucro = globalState.receita_bruta > 0 ? (globalState.lucro_operacional / globalState.receita_bruta) * 100 : 0;
    const margemContribuicao = globalState.receita_liquida > 0 ? (globalState.margem_contribuicao / globalState.receita_liquida) * 100 : 0;
    const indiceEndividamento = globalState.receita_bruta > 0 ? (globalState.despesas_fixas / globalState.receita_bruta) * 100 : 0;
    
    // Atualizar indicadores de score
    globalState.liquidez = Math.min(100, Math.max(0, 85 + (margemLucro - 34.5) * 2));
    globalState.rentabilidade = Math.min(100, Math.max(0, 78 + (margemContribuicao - 52) * 1.5));
    globalState.endividamento = Math.min(100, Math.max(0, 100 - indiceEndividamento * 2));
    globalState.alavancagem = Math.min(100, Math.max(0, 45 + (margemContribuicao - 52) * 1));
    
    // Calcular score geral (média ponderada)
    globalState.score_financeiro = Math.round(
        (globalState.liquidez * 0.25 + 
         globalState.rentabilidade * 0.35 + 
         globalState.endividamento * 0.25 + 
         globalState.alavancagem * 0.15)
    );
    
    // Garantir que o score fique entre 0 e 1000
    globalState.score_financeiro = Math.min(1000, Math.max(0, globalState.score_financeiro));
}

// ============================================
// ATUALIZAÇÃO DO PAINEL DO EMPREENDEDOR
// ============================================

function atualizarPainelEmpreendedor() {
    // Atualizar cards de receita/custos/lucro
    const cards = document.querySelectorAll(".dashboard-cards .card");
    
    if (cards.length >= 4) {
        cards[0].querySelector(".card-value").innerText = "R$ " + globalState.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[1].querySelector(".card-value").innerText = "R$ " + globalState.custos_variaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[2].querySelector(".card-value").innerText = "R$ " + globalState.despesas_fixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[3].querySelector(".card-value").innerText = "R$ " + globalState.lucro_operacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        
        // Atualizar trend do primeiro card
        const percentualTrend = ((globalState.receita_bruta - 125400) / 125400) * 100;
        const trendElement = cards[0].querySelector(".card-trend");
        if (trendElement) {
            trendElement.className = percentualTrend >= 0 ? "card-trend up" : "card-trend down";
            trendElement.innerHTML = `<i class="fas fa-caret-${percentualTrend >= 0 ? 'up' : 'down'}"></i> ${Math.abs(percentualTrend).toFixed(1)}%`;
        }
    }
    
    // Atualizar score
    const scoreNumber = document.getElementById("score-number");
    if (scoreNumber) {
        scoreNumber.innerText = globalState.score_financeiro;
    }
    
    // Atualizar barras de progresso do score
    const details = document.querySelectorAll(".score-details .detail");
    if (details.length >= 4) {
        const bars = [
            details[0].querySelector(".bar"),
            details[1].querySelector(".bar"),
            details[2].querySelector(".bar"),
            details[3].querySelector(".bar")
        ];
        
        if (bars[0]) bars[0].style.width = globalState.liquidez + "%";
        if (bars[1]) bars[1].style.width = globalState.rentabilidade + "%";
        if (bars[2]) bars[2].style.width = (100 - globalState.endividamento) + "%";
        if (bars[3]) bars[3].style.width = globalState.alavancagem + "%";
    }
    
    // Atualizar gráficos
    atualizarGraficos();
}

// ============================================
// ATUALIZAÇÃO DOS GRÁFICOS
// ============================================

function atualizarGraficos() {
    // Atualizar line chart (Entradas x Saídas)
    if (lineChartInstance) {
        lineChartInstance.data.datasets[0].data = globalState.entradas_historico;
        lineChartInstance.data.datasets[1].data = globalState.saidas_historico;
        lineChartInstance.update();
    }
    
    // Atualizar bar chart (Fluxo Mensal)
    if (barChartInstance) {
        barChartInstance.data.datasets[0].data = globalState.lucro_historico;
        barChartInstance.update();
    }
}

// ============================================
// INICIALIZAÇÃO DOS GRÁFICOS
// ============================================

function initCharts() {
    const ctxLine = document.getElementById("lineChart");
    if (ctxLine) {
        const ctxLineContext = ctxLine.getContext("2d");
        lineChartInstance = new Chart(ctxLineContext, {
            type: "line",
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [{
                    label: "Entradas",
                    data: globalState.entradas_historico,
                    borderColor: "#C5A850",
                    backgroundColor: "rgba(197, 168, 80, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: "#C5A850"
                }, {
                    label: "Saídas",
                    data: globalState.saidas_historico,
                    borderColor: "#000000",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: "#000000"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: "bottom",
                        labels: {
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return "R$ " + value.toLocaleString("pt-BR");
                            }
                        }
                    }
                }
            }
        });
    }
    
    const ctxBar = document.getElementById("barChart");
    if (ctxBar) {
        const ctxBarContext = ctxBar.getContext("2d");
        barChartInstance = new Chart(ctxBarContext, {
            type: "bar",
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [{
                    label: "Lucro Líquido",
                    data: globalState.lucro_historico,
                    backgroundColor: "#C5A850",
                    borderColor: "#C5A850",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        position: "bottom",
                        labels: {
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return "R$ " + value.toLocaleString("pt-BR");
                            }
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA (5 SEGUNDOS)
// ============================================

function iniciarAtualizacaoAutomatica() {
    // Atualizar imediatamente
    atualizarPainelEmpreendedor();
    
    // Atualizar a cada 5 segundos
    updateInterval = setInterval(() => {
        // Simular pequenas variações nos dados para demonstrar atualização
        simularVariacaoDados();
        
        // Recalcular dados globais
        recalcularDadosGlobais();
        
        // Atualizar painel do empreendedor
        atualizarPainelEmpreendedor();
        
        // Atualizar painel do contador se visível
        atualizarPainelContador();
    }, 5000);
}

function pararAtualizacaoAutomatica() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function simularVariacaoDados() {
    // Simular pequenas variações realistas nos dados
    const variacao = (Math.random() - 0.5) * 0.05; // ±2.5%
    
    globalState.receita_bruta *= (1 + variacao);
    globalState.custos_variaveis *= (1 + variacao * 0.7);
    globalState.despesas_fixas *= (1 + variacao * 0.3);
    
    // Recalcular valores derivados
    globalState.deducoes_impostos = globalState.receita_bruta * 0.12;
    globalState.receita_liquida = globalState.receita_bruta - globalState.deducoes_impostos;
    globalState.margem_contribuicao = globalState.receita_liquida - globalState.custos_variaveis;
    globalState.lucro_operacional = globalState.margem_contribuicao - globalState.despesas_fixas;
}

function atualizarPainelContador() {
    // Atualizar tabela DRE
    const dreTable = document.getElementById("dre-table");
    if (dreTable && dreTable.offsetParent !== null) { // Verificar se está visível
        const tbody = dreTable.querySelector("tbody");
        if (tbody && tbody.rows.length >= 7) {
            // Receita Operacional Bruta
            tbody.rows[0].cells[1].innerText = globalState.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            tbody.rows[0].cells[2].innerText = "100%";
            
            // Deduções e Impostos
            tbody.rows[1].cells[1].innerText = globalState.deducoes_impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percDeducoes = (globalState.deducoes_impostos / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[1].cells[2].innerText = percDeducoes + "%";
            
            // Receita Líquida
            tbody.rows[2].cells[1].innerText = globalState.receita_liquida.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percLiquida = (globalState.receita_liquida / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[2].cells[2].innerText = percLiquida + "%";
            
            // Custos Variáveis
            tbody.rows[3].cells[1].innerText = globalState.custos_variaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percCustos = (globalState.custos_variaveis / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[3].cells[2].innerText = percCustos + "%";
            
            // Margem de Contribuição
            tbody.rows[4].cells[1].innerText = globalState.margem_contribuicao.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percMargem = (globalState.margem_contribuicao / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[4].cells[2].innerText = percMargem + "%";
            
            // Despesas Fixas
            tbody.rows[5].cells[1].innerText = globalState.despesas_fixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percDespesas = (globalState.despesas_fixas / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[5].cells[2].innerText = percDespesas + "%";
            
            // Lucro Operacional
            tbody.rows[6].cells[1].innerText = globalState.lucro_operacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
            const percLucro = (globalState.lucro_operacional / globalState.receita_bruta * 100).toFixed(1);
            tbody.rows[6].cells[2].innerText = percLucro + "%";
        }
    }
}

// ============================================
// EXPORTAR PDF
// ============================================

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(197, 168, 80);
    doc.setFontSize(22);
    doc.text("KAWR BUSINESS", 105, 20, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("RELATÓRIO DE PERFORMANCE CONSOLIDADO", 105, 30, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Resumo Financeiro - Junho 2026", 20, 55);
    
    doc.autoTable({
        startY: 65,
        head: [["Indicador", "Valor"]],
        body: [
            ["Receita Bruta", "R$ " + globalState.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })],
            ["Custos Variáveis", "R$ " + globalState.custos_variaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 })],
            ["Despesas Fixas", "R$ " + globalState.despesas_fixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })],
            ["Lucro Operacional", "R$ " + globalState.lucro_operacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 })],
            ["Score de Saúde", globalState.score_financeiro + " / 1000"],
            ["Liquidez", globalState.liquidez.toFixed(1) + "%"],
            ["Rentabilidade", globalState.rentabilidade.toFixed(1) + "%"],
            ["Endividamento", globalState.endividamento.toFixed(1) + "%"],
            ["Alavancagem", globalState.alavancagem.toFixed(1) + "%"]
        ],
        theme: "striped",
        headStyles: { fillColor: [0, 0, 0], textColor: [197, 168, 80] }
    });
    
    doc.setFontSize(12);
    doc.text("Alertas Críticos:", 20, doc.lastAutoTable.finalY + 20);
    doc.setTextColor(200, 0, 0);
    doc.text("- Guia do Simples Nacional vence em 48h.", 25, doc.lastAutoTable.finalY + 30);
    doc.text("- Margem de Lucro abaixo do limite (28% < 30%).", 25, doc.lastAutoTable.finalY + 38);
    
    doc.save("Relatorio_Kawr_Business.pdf");
}

// ============================================
// INICIALIZAÇÃO
// ============================================

window.onload = () => {
    // Inicializar gráficos
    initCharts();
    
    // Calcular valores iniciais
    calcularSimples();
    calcularMargem();
    calcularBE();
    
    // Iniciar atualização automática
    iniciarAtualizacaoAutomatica();
};

// Parar atualização ao descarregar a página
window.onbeforeunload = () => {
    pararAtualizacaoAutomatica();
};
