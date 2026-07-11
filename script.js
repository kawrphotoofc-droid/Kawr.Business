/* ==========================================
   KAWR BUSINESS BETA 1.0
   script.js
========================================== */

console.log("Kawr Business Beta 1.0 iniciado.");

/* ==============================
   BOTÃO CONHECER O SISTEMA
============================== */

const botaoSistema = document.querySelector(".hero button");

if(botaoSistema){

    botaoSistema.addEventListener("click", function(){

        document.querySelector("#dashboard").scrollIntoView({

            behavior:"smooth"

        });

    });

}

/* ==============================
   BOTÃO VER / ESCONDER CÁLCULOS
============================== */

const botaoCalculos = document.getElementById("btnCalculos");

const memoria = document.getElementById("memoriaCalculo");

let aberto = false;

if(botaoCalculos){

    botaoCalculos.addEventListener("click", function(){

        if(!aberto){

            memoria.style.display = "block";

            botaoCalculos.innerHTML = "Esconder Cálculos";

            aberto = true;

        }

        else{

            memoria.style.display = "none";

            botaoCalculos.innerHTML = "Ver Cálculos";

            aberto = false;

        }

    });

}

/* ==============================
   CAMPOS
============================== */

const receita = document.getElementById("receitaBruta");

const folha = document.getElementById("folha");

const regime = document.getElementById("regime");

const cnae = document.getElementById("cnae");

/* ==============================
   ATUALIZAR SISTEMA
============================== */

function atualizarSistema(){

    if(typeof calcularImpostos === "function"){

        calcularImpostos();

    }

    if(typeof calcularScore === "function"){

        calcularScore();

    }

}

/* ==============================
   EVENTOS
============================== */

if(receita){

    receita.addEventListener("input", atualizarSistema);

}

if(folha){

    folha.addEventListener("input", atualizarSistema);

}

if(regime){

    regime.addEventListener("change", atualizarSistema);

}

if(cnae){

    cnae.addEventListener("input", atualizarSistema);

}

/* ==============================
   ATUALIZAR EMPRESÁRIO
============================== */

function atualizarEmpresario(receitaValor, despesaValor, lucroValor){

    document.getElementById("receita").innerHTML =
    "R$ " + receitaValor.toFixed(2);

    document.getElementById("despesas").innerHTML =
    "R$ " + despesaValor.toFixed(2);

    document.getElementById("lucro").innerHTML =
    "R$ " + lucroValor.toFixed(2);

}

/* ==============================
   ALERTAS
============================== */

function mostrarAlerta(texto){

    document.getElementById("alertas").innerHTML = texto;

}

/* ==============================
   MEMÓRIA DE CÁLCULO
============================== */

function atualizarMemoria(texto){

    memoria.innerHTML = texto;

}

/* ==============================
   MENSAGEM INICIAL
============================== */

mostrarAlerta("Aguardando preenchimento dos dados...");

/* ==============================
   VERSÃO
============================== */

console.log("Versão Beta 1.0 carregada com sucesso.");
