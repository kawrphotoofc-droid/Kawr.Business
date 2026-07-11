/* ==========================================
   KAWR BUSINESS BETA 1.0
   score.js
========================================== */

function calcularScore() {

    const receita =
        Number(document.getElementById("receitaBruta").value);

    const folha =
        Number(document.getElementById("folha").value);

    if(receita <= 0){

        document.getElementById("score").innerHTML = "0";

        mostrarAlerta("Informe a receita da empresa.");

        return;

    }

    let score = 100;

    // Folha muito baixa
    if(folha < receita * 0.10){

        score -= 20;

    }

    // Receita muito baixa
    if(receita < 5000){

        score -= 15;

    }

    // Receita boa
    if(receita > 50000){

        score += 5;

    }

    if(score > 100){

        score = 100;

    }

    if(score < 0){

        score = 0;

    }

    document.getElementById("score").innerHTML = score;

    const scoreElemento =
        document.getElementById("score");

    // ===== ALERTAS =====

    if(score < 30){

        scoreElemento.style.color = "#DC2626";

        mostrarAlerta(
            "🔴 Risco elevado. Revise os dados financeiros e as obrigações fiscais."
        );

    }

    else if(score < 50){

        scoreElemento.style.color = "#EA580C";

        mostrarAlerta(
            "🟠 Zona de alerta. Acompanhe despesas e pendências."
        );

    }

    else if(score == 50){

        scoreElemento.style.color = "#EAB308";

        mostrarAlerta(
            "🟡 Sua empresa está em cima do muro. Pequenas decisões podem melhorar ou piorar o resultado."
        );

    }

    else if(score < 70){

        scoreElemento.style.color = "#65A30D";

        mostrarAlerta(
            "🟢 Boa situação financeira, mas ainda há espaço para melhorar."
        );

    }

    else if(score < 90){

        scoreElemento.style.color = "#16A34A";

        mostrarAlerta(
            "🟢 Empresa estável e financeiramente saudável."
        );

    }

    else{

        scoreElemento.style.color = "#2563EB";

        mostrarAlerta(
            "🔵 Excelente! A empresa apresenta ótimos indicadores financeiros."
        );

    }

}
