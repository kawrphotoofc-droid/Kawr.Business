/* ==========================================
   KAWR BUSINESS v2.0
   relatorios.js - Geração de Relatórios PDF
========================================== */

/**
 * Gera relatório PDF profissional
 * @param {string} mes - Mês (YYYY-MM)
 */
async function gerarRelatorioPDF(mes) {
    try {
        // Obter dados
        const empresa = await DB.obterEmpresa();
        const financeiro = await DB.obterFinanceiro(mes);
        const score = await DB.obterScore(mes);
        const alertas = await DB.obterAlertas(mes);

        if (!financeiro) {
            notificarErro("Nenhum dado financeiro para este mês");
            return;
        }

        // Criar documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPos = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);

        // ===== CABEÇALHO =====
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, pageWidth, 30, 'F');

        doc.setTextColor(212, 175, 55);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Kawr Business', margin, yPos + 12);

        doc.setTextColor(160, 160, 160);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Relatório Financeiro v2.0', margin, yPos + 20);

        yPos += 35;

        // ===== INFORMAÇÕES DA EMPRESA =====
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Informações da Empresa', margin, yPos);
        yPos += 8;

        doc.setTextColor(224, 224, 224);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');

        const empresaInfo = [
            ['Empresa:', empresa?.nome || '-'],
            ['CNPJ:', empresa?.cnpj ? formatarCNPJ(empresa.cnpj) : '-'],
            ['Tipo:', empresa?.tipo || '-'],
            ['Regime:', empresa?.regime || '-'],
            ['Período:', formatarMes(mes + '-01')]
        ];

        empresaInfo.forEach(([label, valor]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(valor, margin + 40, yPos);
            yPos += 6;
        });

        yPos += 5;

        // ===== RESUMO FINANCEIRO =====
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Resumo Financeiro', margin, yPos);
        yPos += 8;

        doc.setTextColor(224, 224, 224);
        doc.setFontSize(10);

        const resumo = [
            ['Receita Bruta', formatarMoeda(financeiro.receitaBruta)],
            ['Despesas Totais', formatarMoeda(financeiro.despesasTotal)],
            ['Lucro Líquido', formatarMoeda(financeiro.lucroLiquido)],
            ['Margem de Lucro', `${financeiro.margem.toFixed(2)}%`],
            ['Impostos (DAS)', formatarMoeda(financeiro.impostos)],
            ['Fluxo de Caixa', formatarMoeda(financeiro.fluxoCaixa)]
        ];

        resumo.forEach(([label, valor]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, margin, yPos);
            doc.setFont(undefined, 'normal');
            doc.text(valor, margin + 60, yPos);
            yPos += 6;
        });

        yPos += 5;

        // ===== SCORE =====
        if (score) {
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Score Geral', margin, yPos);
            yPos += 8;

            doc.setTextColor(224, 224, 224);
            doc.setFontSize(11);
            doc.text(`Pontuação: ${Math.round(score.valor)}/100`, margin, yPos);
            yPos += 6;

            const faixa = obterFaixaScore(score.valor);
            doc.text(`Status: ${faixa.label}`, margin, yPos);
            yPos += 10;
        }

        // ===== ALERTAS =====
        if (alertas && alertas.length > 0) {
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Alertas', margin, yPos);
            yPos += 8;

            doc.setTextColor(224, 224, 224);
            doc.setFontSize(9);

            alertas.slice(0, 5).forEach(alerta => {
                doc.setFont(undefined, 'bold');
                doc.text(`• ${alerta.titulo}`, margin + 5, yPos);
                yPos += 4;

                doc.setFont(undefined, 'normal');
                const linhas = doc.splitTextToSize(alerta.mensagem, contentWidth - 10);
                linhas.forEach(linha => {
                    doc.text(linha, margin + 10, yPos);
                    yPos += 3;
                });
                yPos += 2;

                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = 10;
                }
            });
        }

        // ===== RODAPÉ =====
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10);
        doc.text('Kawr Business - Gestão Financeira Inteligente', margin, pageHeight - 5);

        // Salvar PDF
        doc.save(`Relatorio_Kawr_${mes}.pdf`);
        notificarSucesso("Relatório gerado com sucesso!");

    } catch (erro) {
        console.error("Erro ao gerar relatório:", erro);
        notificarErro("Erro ao gerar relatório");
    }
}

/**
 * Exporta dados em CSV
 */
async function exportarCSV() {
    try {
        const historico = await DB.obterHistorico();

        if (Object.keys(historico).length === 0) {
            notificarErro("Nenhum dado para exportar");
            return;
        }

        let csv = 'Mês,Receita Bruta,Despesas,Lucro Líquido,Margem,Impostos,Fluxo de Caixa\n';

        Object.keys(historico).sort().forEach(mes => {
            const f = historico[mes];
            csv += `${mes},${f.receitaBruta},${f.despesasTotal},${f.lucroLiquido},${f.margem.toFixed(2)},${f.impostos},${f.fluxoCaixa}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `Dados_Kawr_${obterMesAtual()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notificarSucesso("Dados exportados com sucesso");

    } catch (erro) {
        console.error("Erro ao exportar CSV:", erro);
        notificarErro("Erro ao exportar dados");
    }
}

// ===== EVENT LISTENERS =====

document.getElementById('btnGerarPDF')?.addEventListener('click', async function() {
    const mes = obterMesAtual();
    await gerarRelatorioPDF(mes);
});

console.log("✅ Relatorios carregado");
