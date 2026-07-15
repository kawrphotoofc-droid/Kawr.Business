/* ==========================================
   KAWR BUSINESS v2.0
   relatorios.js - Geração de Relatórios PDF
========================================== */

/**
 * Gera relatório PDF profissional
 * @param {string} usuarioId - ID do usuário
 * @param {string} mes - Mês (YYYY-MM)
 */
async function gerarRelatorioPDF(usuarioId, mes) {
    try {
        // Obter dados
        const empresa = await DB.obterEmpresa(usuarioId);
        const financeiro = await DB.obterFinanceiro(usuarioId, mes);
        const score = await DB.obterScore(usuarioId, mes);
        const alertas = await DB.obterAlertas(usuarioId, mes);

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

        // ===== SCORE GERAL =====
        if (score) {
            const faixa = obterFaixaScore(score.valor);
            
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Score Geral', margin, yPos);
            yPos += 8;

            doc.setTextColor(224, 224, 224);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');

            // Desenhar barra de score
            const barWidth = 100;
            const barHeight = 8;
            doc.setDrawColor(61, 61, 61);
            doc.rect(margin, yPos, barWidth, barHeight);
            
            doc.setFillColor(212, 175, 55);
            const fillWidth = (score.valor / 100) * barWidth;
            doc.rect(margin, yPos, fillWidth, barHeight, 'F');

            doc.setTextColor(224, 224, 224);
            doc.setFont(undefined, 'bold');
            doc.text(`${Math.round(score.valor)} - ${faixa.label}`, margin + barWidth + 5, yPos + 6);

            yPos += 15;

            // Fatores influentes
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Fatores Influentes:', margin, yPos);
            yPos += 6;

            doc.setTextColor(224, 224, 224);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            score.fatoresInfluentes.slice(0, 5).forEach(fator => {
                doc.text(`• ${fator.fator}: ${fator.impacto}`, margin + 5, yPos);
                yPos += 5;
            });

            yPos += 5;
        }

        // ===== ALERTAS =====
        if (alertas && alertas.length > 0) {
            // Verificar se precisa de nova página
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 10;
            }

            doc.setTextColor(212, 175, 55);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Alertas Identificados', margin, yPos);
            yPos += 8;

            doc.setTextColor(224, 224, 224);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            alertas.slice(0, 5).forEach(alerta => {
                if (yPos > pageHeight - 20) {
                    doc.addPage();
                    yPos = 10;
                }

                doc.setFont(undefined, 'bold');
                doc.text(`⚠ ${alerta.titulo}`, margin + 2, yPos);
                yPos += 5;

                doc.setFont(undefined, 'normal');
                const lines = doc.splitTextToSize(alerta.mensagem, contentWidth - 5);
                doc.text(lines, margin + 5, yPos);
                yPos += (lines.length * 4) + 3;
            });

            yPos += 5;
        }

        // ===== RODAPÉ =====
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
            `Relatório gerado em ${formatarData(new Date())} | Kawr Business v2.0`,
            margin,
            pageHeight - 5
        );

        // ===== SALVAR =====
        const nomeArquivo = `Kawr_Business_${mes}_${new Date().getTime()}.pdf`;
        doc.save(nomeArquivo);

        notificarSucesso(`Relatório gerado: ${nomeArquivo}`);

    } catch (erro) {
        console.error("Erro ao gerar PDF:", erro);
        notificarErro("Erro ao gerar relatório: " + erro.message);
    }
}

/**
 * Exporta dados para CSV
 * @param {string} usuarioId - ID do usuário
 */
async function exportarCSV(usuarioId) {
    try {
        const historico = await DB.obterHistorico(usuarioId);
        
        if (Object.keys(historico).length === 0) {
            notificarErro("Nenhum dado para exportar");
            return;
        }

        let csv = 'Mês,Receita,Despesas,Lucro,Margem,Impostos,Fluxo de Caixa\n';

        Object.keys(historico).sort().forEach(mes => {
            const f = historico[mes];
            csv += `${mes},${f.receitaBruta},${f.despesasTotal},${f.lucroLiquido},${f.margem.toFixed(2)},${f.impostos},${f.fluxoCaixa}\n`;
        });

        // Criar blob e download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `Kawr_Business_Historico_${new Date().getTime()}.csv`);
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
    const usuario = AUTH.obterUsuarioAtual();
    if (usuario) {
        const mes = obterMesAtual();
        await gerarRelatorioPDF(usuario.id, mes);
    }
});

console.log("✅ Relatorios carregado");
