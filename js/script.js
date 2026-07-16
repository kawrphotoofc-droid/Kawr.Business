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
    document.getElementById("aliq-efetiva").innerText = (aliqEfetiva * 100).toFixed(2) + "%";
    document.getElementById("valor-das").innerText = "R$ " + valorDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function calcularMargem() {
    const custo = parseFloat(document.getElementById("calc-custo").value) || 0;
    const venda = parseFloat(document.getElementById("calc-venda").value) || 0;
    if (venda > 0) {
        const markup = venda / custo;
        const margem = ((venda - custo) / venda) * 100;
        document.getElementById("res-markup").innerText = markup.toFixed(2);
        document.getElementById("res-margem").innerText = margem.toFixed(2) + "%";
    }
}

function calcularBE() {
    const fixo = parseFloat(document.getElementById("be-fixo").value) || 0;
    const margemCont = parseFloat(document.getElementById("be-margem").value) || 0;
    if (margemCont > 0) {
        const be = fixo / (margemCont / 100);
        document.getElementById("res-be").innerText = "R$ " + be.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }
}

function initCharts() {
    const ctxLine = document.getElementById("lineChart").getContext("2d");
    new Chart(ctxLine, {
        type: "line",
        data: {
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            datasets: [{
                label: "Entradas",
                data: [100000, 115000, 108000, 125000, 130000, 125400],
                borderColor: "#C5A850",
                tension: 0.4,
                fill: false
            }, {
                label: "Saídas",
                data: [80000, 85000, 82000, 90000, 88000, 82248],
                borderColor: "#000000",
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
    const ctxBar = document.getElementById("barChart").getContext("2d");
    new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            datasets: [{
                label: "Lucro Líquido",
                data: [20000, 30000, 26000, 35000, 42000, 43152],
                backgroundColor: "#C5A850"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

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
            ["Receita Bruta", "R$ 125.400,00"],
            ["Custos Variáveis", "R$ 45.200,00"],
            ["Despesas Fixas", "R$ 22.000,00"],
            ["Lucro Operacional", "R$ 43.152,00"],
            ["Score de Saúde", "858 / 1000"],
            ["Status", "Saudável"]
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

window.onload = () => {
    initCharts();
    calcularSimples();
    calcularMargem();
    calcularBE();
};
