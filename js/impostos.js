/* ==========================================
   KAWR BUSINESS BETA 1.0
   impostos.js
========================================== */

// ===============================
// TABELAS (MVP)
// ===============================

const ANEXO_III = {
    aliquota: 0.06,
    deducao: 0
};

const ANEXO_IV = {
    aliquota: 0.045,
    deducao: 0
};

const ANEXO_V = {
    aliquota: 0.155,
    deducao: 0
};

// ===============================
// CÁLCULO DO FATOR R
// ===============================

function calcularFatorR(receitaBruta, folhaPagamento){

    if(receitaBruta <= 0){

        return 0;

    }

    return folhaPagamento / receitaBruta;

}

// ===============================
// IDENTIFICAÇÃO DO ANEXO (MVP)
// ===============================

function identificarAnexo(fatorR){

    if(fatorR >= 0.28){

        return "Anexo III";

    }

    return "Anexo V";

}

// ===============================
// CÁLCULO DO DAS (SIMPLIFICADO)
// ===============================

function calcularDAS(receitaBruta, anexo){

    let aliquota = 0;

    switch(anexo){

        case "Anexo III":
            aliquota = ANEXO_III.aliquota;
            break;

        case "Anexo IV":
            aliquota = ANEXO_IV.aliquota;
            break;

        case "Anexo V":
            aliquota = ANEXO_V.aliquota;
            break;

        default:
            aliquota = 0;
            break;

    }

    return receitaBruta * aliquota;

}

// ===============================
// LUCRO LÍQUIDO
// ===============================

function calcularLucro(receitaBruta, despesas){

    return receitaBruta - despesas;

}

// ===============================
// MARGEM DE LUCRO
// ===============================

function calcularMargem(receitaBruta, lucro){

    if(receitaBruta <= 0){

        return 0;

    }

    return (lucro / receitaBruta) * 100;

}

// ===============================
// FUNÇÃO PRINCIPAL
// ===============================

function calcularImpostos(){

    const receitaBruta =
        Number(document.getElementById("receitaBruta").value);

    const folhaPagamento =
        Number(document.getElementById("folha").value);

    if(receitaBruta <= 0){

        return;

    }

    const fatorR =
        calcularFatorR(receitaBruta, folhaPagamento);

    const anexo =
        identificarAnexo(fatorR);

    const das =
        calcularDAS(receitaBruta, anexo);

    const despesas = das;

    const lucro =
        calcularLucro(receitaBruta, despesas);

    const margem =
        calcularMargem(receitaBruta, lucro);

    // Atualizar painel contador

    document.getElementById("anexo").innerHTML =
        "Anexo: " + anexo;

    document.getElementById("aliquota").innerHTML =
        "Alíquota: " + (das / receitaBruta * 100).toFixed(2) + "%";

    document.getElementById("fatorR").innerHTML =
        "Fator R: " + (fatorR * 100).toFixed(2) + "%";

    document.getElementById("das").innerHTML =
        "DAS estimado: R$ " + das.toFixed(2);

    // Atualizar painel empresário

    atualizarEmpresario(

        receitaBruta,

        despesas,

        lucro

    );

    // Memória de cálculo

    atualizarMemoria(

`
<h2>Memória de Cálculo</h2>

<hr>

<p><strong>Receita Bruta:</strong> R$ ${receitaBruta.toFixed(2)}</p>

<p><strong>Folha:</strong> R$ ${folhaPagamento.toFixed(2)}</p>

<p><strong>Fator R:</strong></p>

<p>${folhaPagamento.toFixed(2)} ÷ ${receitaBruta.toFixed(2)} = ${(fatorR*100).toFixed(2)}%</p>

<hr>

<p><strong>Anexo identificado:</strong> ${anexo}</p>

<p><strong>Alíquota utilizada:</strong> ${(das/receitaBruta*100).toFixed(2)}%</p>

<hr>

<p><strong>DAS:</strong></p>

<p>${receitaBruta.toFixed(2)} × ${(das/receitaBruta*100).toFixed(2)}% = R$ ${das.toFixed(2)}</p>

<hr>

<p><strong>Lucro:</strong></p>

<p>${receitaBruta.toFixed(2)} - ${das.toFixed(2)} = R$ ${lucro.toFixed(2)}</p>

<hr>

<p><strong>Margem:</strong></p>

<p>${margem.toFixed(2)}%</p>

`
    );

}
