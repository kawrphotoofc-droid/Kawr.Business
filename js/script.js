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

let globalState = {
    // Dados Base
    receita_bruta: 125400,
    custos_variaveis: 45200,
    despesas_fixas: 22000,
    
    // Calculados
    deducoes_impostos: 15048,
    receita_liquida: 110352,
    margem_contribuicao: 65152,
    lucro_operacional: 43152,
    
    // Calculadora
    calc_custo: 100,
    calc_venda: 180,
    calc_be_fixo: 20000,
    calc_be_margem: 40,
    
    // Simples Nacional
    rbt12: 1200000,
    fat_mensal: 100000,
    aliq_efetiva: 0.105,
    valor_das: 10500,
    
    // Score
    score_financeiro: 858,
    liquidez: 85,
    rentabilidade: 78,
    endividamento: 20,
    alavancagem: 45,
    
    // Histórico
    entradas_historico: [100000, 115000, 108000, 125000, 130000, 125400],
    saidas_historico: [80000, 85000, 82000, 90000, 88000, 82248],
    lucro_historico: [20000, 30000, 26000, 35000, 42000, 43152]
};

let lineChartInstance = null;
let barChartInstance = null;
let updateInterval = null;

// ============================================
// CÁLCULOS PRECISOS
// ============================================

function calcularSimples() {
    const rbt12 = parseFloat(document.getElementById("rbt12").value) || 0;
    const fatMensal = parseFloat(document.getElementById("fat-mensal").value) || 0;
    
    let aliqNominal = 0;
    let parcelaDeducao = 0;
    
    // Anexo III - Serviços (Exemplo)
    if (rbt12 <= 180000) { aliqNominal = 0.06; parcelaDeducao = 0; }
    else if (rbt12 <= 360000) { aliqNominal = 0.112; parcelaDeducao = 9360; }
    else if (rbt12 <= 720000) { aliqNominal = 0.135; parcelaDeducao = 17640; }
    else if (rbt12 <= 1800000) { aliqNominal = 0.16; parcelaDeducao = 35640; }
    else if (rbt12 <= 3600000) { aliqNominal = 0.21; parcelaDeducao = 125640; }
    else { aliqNominal = 0.33; parcelaDeducao = 648000; }
    
    const aliqEfetiva = rbt12 > 0 ? ((rbt12 * aliqNominal) - parcelaDeducao) / rbt12 : 0;
    const valorDas = fatMensal * aliqEfetiva;
    
    globalState.rbt12 = rbt12;
    globalState.fat_mensal = fatMensal;
    globalState.aliq_efetiva = aliqEfetiva;
    globalState.valor_das = valorDas;
    globalState.deducoes_impostos = globalState.receita_bruta * aliqEfetiva;
    
    document.getElementById("aliq-efetiva").innerText = (aliqEfetiva * 100).toFixed(2) + "%";
    document.getElementById("valor-das").innerText = "R$ " + valorDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    
    sincronizarDados();
}

function calcularMargem() {
    const custo = parseFloat(document.getElementById("calc-custo").value) || 0;
    const venda = parseFloat(document.getElementById("calc-venda").value) || 0;
    
    globalState.calc_custo = custo;
    globalState.calc_venda = venda;
    
    if (venda > 0) {
        const markup = venda / custo;
        const margem = ((venda - custo) / venda) * 100;
        document.getElementById("res-markup").innerText = markup.toFixed(2);
        document.getElementById("res-margem").innerText = margem.toFixed(2) + "%";
        
        // Atualiza margem de contribuição no estado global baseada na calculadora
        globalState.calc_be_margem = margem;
        document.getElementById("be-margem").value = margem.toFixed(2);
    }
    
    sincronizarDados();
}

function calcularBE() {
    const fixo = parseFloat(document.getElementById("be-fixo").value) || 0;
    const margemCont = parseFloat(document.getElementById("be-margem").value) || 0;
    
    globalState.calc_be_fixo = fixo;
    globalState.calc_be_margem = margemCont;
    globalState.despesas_fixas = fixo;
    
    if (margemCont > 0) {
        const be = fixo / (margemCont / 100);
        document.getElementById("res-be").innerText = "R$ " + be.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }
    
    sincronizarDados();
}

// ============================================
// SINCRONIZAÇÃO E ATUALIZAÇÃO
// ============================================

function sincronizarDados() {
    // 1. Cálculos de DRE Precisos
    globalState.receita_liquida = globalState.receita_bruta - globalState.deducoes_impostos;
    
    // Ajusta custos variáveis baseado na margem da calculadora se disponível
    if (globalState.calc_be_margem > 0) {
        // Margem = (Venda - Custo) / Venda -> Custo = Venda * (1 - Margem)
        globalState.custos_variaveis = globalState.receita_liquida * (1 - (globalState.calc_be_margem / 100));
    }
    
    globalState.margem_contribuicao = globalState.receita_liquida - globalState.custos_variaveis;
    globalState.lucro_operacional = globalState.margem_contribuicao - globalState.despesas_fixas;
    
    // 2. Score Financeiro (Lógica Realista)
    const margemLucro = globalState.receita_bruta > 0 ? (globalState.lucro_operacional / globalState.receita_bruta) * 100 : 0;
    const pontoEquilibrio = globalState.calc_be_margem > 0 ? globalState.despesas_fixas / (globalState.calc_be_margem / 100) : 0;
    const seguranca = globalState.receita_bruta > 0 ? (globalState.receita_bruta - pontoEquilibrio) / globalState.receita_bruta : 0;
    
    globalState.liquidez = Math.min(100, Math.max(0, seguranca * 100));
    globalState.rentabilidade = Math.min(100, Math.max(0, margemLucro * 2));
    globalState.endividamento = Math.min(100, Math.max(0, (globalState.despesas_fixas / globalState.receita_bruta) * 200));
    globalState.alavancagem = Math.min(100, Math.max(0, (globalState.margem_contribuicao / globalState.receita_bruta) * 100));
    
    globalState.score_financeiro = Math.round(
        (globalState.liquidez * 0.4 + globalState.rentabilidade * 0.4 + (100 - globalState.endividamento) * 0.2) * 10
    );
    
    atualizarInterface();
}

function atualizarInterface() {
    // Atualizar Painel Empreendedor
    const cards = document.querySelectorAll(".dashboard-cards .card");
    if (cards.length >= 4) {
        cards[0].querySelector(".card-value").innerText = "R$ " + globalState.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[1].querySelector(".card-value").innerText = "R$ " + globalState.custos_variaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[2].querySelector(".card-value").innerText = "R$ " + globalState.despesas_fixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        cards[3].querySelector(".card-value").innerText = "R$ " + globalState.lucro_operacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        
        // Adiciona classe de pulso para indicar atualização
        cards.forEach(card => {
            card.classList.add("updating");
            setTimeout(() => card.classList.remove("updating"), 600);
        });
    }
    
    // Score
    const scoreNum = document.getElementById("score-number");
    if (scoreNum) scoreNum.innerText = globalState.score_financeiro;
    
    const bars = document.querySelectorAll(".score-details .bar");
    if (bars.length >= 4) {
        bars[0].style.width = globalState.liquidez + "%";
        bars[1].style.width = globalState.rentabilidade + "%";
        bars[2].style.width = globalState.endividamento + "%";
        bars[3].style.width = globalState.alavancagem + "%";
    }
    
    // Atualizar DRE no Contador
    const dreRows = document.querySelectorAll("#dre-table tbody tr");
    if (dreRows.length >= 7) {
        dreRows[0].cells[1].innerText = globalState.receita_bruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[1].cells[1].innerText = globalState.deducoes_impostos.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[2].cells[1].innerText = globalState.receita_liquida.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[3].cells[1].innerText = globalState.custos_variaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[4].cells[1].innerText = globalState.margem_contribuicao.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[5].cells[1].innerText = globalState.despesas_fixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        dreRows[6].cells[1].innerText = globalState.lucro_operacional.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        
        // Percentuais
        dreRows[1].cells[2].innerText = ((globalState.deducoes_impostos / globalState.receita_bruta) * 100).toFixed(1) + "%";
        dreRows[3].cells[2].innerText = ((globalState.custos_variaveis / globalState.receita_bruta) * 100).toFixed(1) + "%";
        dreRows[6].cells[2].innerText = ((globalState.lucro_operacional / globalState.receita_bruta) * 100).toFixed(1) + "%";
    }
    
    // Gráficos
    if (lineChartInstance) {
        globalState.entradas_historico[5] = globalState.receita_bruta;
        globalState.saidas_historico[5] = globalState.custos_variaveis + globalState.despesas_fixas;
        lineChartInstance.update('none');
    }
    if (barChartInstance) {
        globalState.lucro_historico[5] = globalState.lucro_operacional;
        barChartInstance.update('none');
    }
}

// ============================================
// ATUALIZAÇÃO AUTOMÁTICA (5s)
// ============================================

function iniciarAutoUpdate() {
    updateInterval = setInterval(() => {
        // Simulação controlada de variação (±0.5%) para manter a precisão
        const variacao = 1 + (Math.random() - 0.5) * 0.01;
        globalState.receita_bruta *= variacao;
        
        // Recalcula tudo com base na nova receita
        sincronizarDados();
    }, 5000);
}

// ============================================
// INICIALIZAÇÃO E GRÁFICOS
// ============================================

function initCharts() {
    const ctxLine = document.getElementById("lineChart")?.getContext("2d");
    if (ctxLine) {
        lineChartInstance = new Chart(ctxLine, {
            type: "line",
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [{
                    label: "Entradas",
                    data: globalState.entradas_historico,
                    borderColor: "#C5A850",
                    backgroundColor: "rgba(197, 168, 80, 0.1)",
                    tension: 0.4,
                    fill: true
                }, {
                    label: "Saídas",
                    data: globalState.saidas_historico,
                    borderColor: "#000000",
                    tension: 0.4,
                    fill: false
                }]
            },
            options: { responsive: true, plugins: { legend: { position: "bottom" } } }
        });
    }
    
    const ctxBar = document.getElementById("barChart")?.getContext("2d");
    if (ctxBar) {
        barChartInstance = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [{
                    label: "Lucro Líquido",
                    data: globalState.lucro_historico,
                    backgroundColor: "#C5A850"
                }]
            },
            options: { responsive: true, plugins: { legend: { position: "bottom" } } }
        });
    }
}

window.onload = () => {
    initCharts();
    calcularSimples();
    calcularMargem();
    calcularBE();
    iniciarAutoUpdate();
};

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
            ["Score de Saúde", globalState.score_financeiro + " / 1000"]
        ],
        theme: "striped",
        headStyles: { fillColor: [0, 0, 0], textColor: [197, 168, 80] }
    });
    doc.save("Relatorio_Kawr_Business.pdf");
}
