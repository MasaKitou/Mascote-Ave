"use strict";

/* ================== HUB DE JOGOS ================== */
let jogoAtual = "flappy";
let limparJogoAtual = null;

function obterAvesParaJogos() {
  const carregadas = typeof obterTodasAvesCarregadas === "function" ? obterTodasAvesCarregadas() : [];
  if (carregadas.length >= 6) return carregadas;
  // Fallback mínimo enquanto a Wikipédia carrega
  return Object.keys(METADADOS_AVES).map(chave => ({
    title: chave.split("-").map(p => p[0].toUpperCase() + p.slice(1)).join("-"),
    extract: METADADOS_AVES[chave].habitat,
    thumbnail: null
  }));
}

function embaralhar(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function iniciarAbaJogos() {
  selecionarJogo(jogoAtual);
}
window.iniciarAbaJogos = iniciarAbaJogos;
window.aoAtualizarAves = () => {
  const painel = $("painel-jogos");
  if (painel && !painel.hidden) selecionarJogo(jogoAtual);
};

document.querySelectorAll(".jogo-tab").forEach(btn => {
  btn.addEventListener("click", () => selecionarJogo(btn.dataset.jogo));
});

function selecionarJogo(nome) {
  jogoAtual = nome;
  document.querySelectorAll(".jogo-tab").forEach(b => b.classList.toggle("ativo", b.dataset.jogo === nome));
  if (typeof limparJogoAtual === "function") {
    limparJogoAtual();
    limparJogoAtual = null;
  }
  const palco = $("palco-jogo");
  if (!palco) return;
  if (nome === "flappy") limparJogoAtual = montarFlappy(palco);
  else if (nome === "forca") limparJogoAtual = montarForca(palco);
  else if (nome === "quiz") limparJogoAtual = montarQuiz(palco);
  else if (nome === "quebra-cabeca") limparJogoAtual = montarQuebraCabeca(palco);
  else if (nome === "palavras") limparJogoAtual = montarCacaPalavras(palco);
  else if (nome === "termo") limparJogoAtual = montarTermoAves(palco);
}

/* ================== ÁUDIO SINTÉTICO (FALLBACK PARA JOGOS) ================== */
let audioCtxJogo = null;
function tocarCantoSintetico(titulo) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtxJogo) audioCtxJogo = new Ctx();
    if (audioCtxJogo.state === "suspended") audioCtxJogo.resume();

    let h = 0;
    for (let i = 0; i < titulo.length; i++) h = (h * 31 + titulo.charCodeAt(i)) | 0;
    const baseFreq = 900 + (Math.abs(h) % 1400);
    const notas = [0, 2, 4, 7, 5, 9];
    const agora = audioCtxJogo.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = audioCtxJogo.createOscillator();
      const gain = audioCtxJogo.createGain();
      const t0 = agora + i * 0.14;
      const semi = notas[(Math.abs(h >> (i * 2)) + i) % notas.length];
      const freq = baseFreq * Math.pow(2, semi / 12);
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * (i % 2 === 0 ? 1.25 : 0.85), t0 + 0.1);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
      osc.connect(gain);
      gain.connect(audioCtxJogo.destination);
      osc.start(t0);
      osc.stop(t0 + 0.13);
    }
  } catch (_) {}
}

let audioAtualJogo = null;
let audioTokenJogo = 0;

function pararSomJogo() {
  audioTokenJogo++;
  if (audioAtualJogo) {
    try {
      audioAtualJogo.pause();
      audioAtualJogo.currentTime = 0;
    } catch (_) {}
    audioAtualJogo = null;
  }
}
window.pararSomJogo = pararSomJogo;

async function tocarSomDaAveNoJogo(ave) {
  pararSomJogo();
  const meuToken = audioTokenJogo;
  const som = await buscarSomAve(ave.title, null);
  if (meuToken !== audioTokenJogo) return { tipo: "cancelado", som: null };
  if (som?.url) {
    audioAtualJogo = new Audio(som.url);
    audioAtualJogo.play().catch(() => {
      if (meuToken === audioTokenJogo) tocarCantoSintetico(ave.title);
    });
    return { tipo: "real", som };
  }
  tocarCantoSintetico(ave.title);
  return { tipo: "sintetico", som: null };
}

/* ================== 1. FLAPPY DA AVE ESCOLHIDA ================== */
const CHAVE_RANKING_FLAPPY = "avifauna-flappy-ranking-v1";
const CHAVE_JOGADOR_FLAPPY = "avifauna-flappy-jogador-v1";

function lerRankingFlappy() {
  try { return JSON.parse(localStorage.getItem(CHAVE_RANKING_FLAPPY) || "[]"); }
  catch (_) { return []; }
}

function salvarRankingFlappy(nome, ave, pontos, dificuldade = "Normal") {
  const lista = lerRankingFlappy();
  lista.push({
    nome: nome.trim() || "Explorador(a)",
    ave,
    pontos,
    dificuldade,
    data: new Date().toLocaleDateString("pt-BR")
  });
  lista.sort((a, b) => b.pontos - a.pontos);
  const top10 = lista.slice(0, 10);
  try { localStorage.setItem(CHAVE_RANKING_FLAPPY, JSON.stringify(top10)); } catch (_) {}
  return top10;
}

const MODOS_FLAPPY = {
  facil: {
    rotulo: "Fácil",
    velocidade: 135,
    intervaloCano: 1.85,
    abertura: 148,
    gravidade: 720,
    pulo: -275,
    inimigos: false,
    canosMoveis: false
  },
  normal: {
    rotulo: "Normal",
    velocidade: 165,
    intervaloCano: 1.55,
    abertura: 122,
    gravidade: 820,
    pulo: -290,
    inimigos: false,
    canosMoveis: false
  },
  dificil: {
    rotulo: "Difícil",
    velocidade: 225,
    intervaloCano: 1.25,
    abertura: 106,
    gravidade: 920,
    pulo: -310,
    inimigos: true,
    intervaloInimigo: 2.3,
    velocidadeInimigo: 295,
    canosMoveis: true
  },
  extremo: {
    rotulo: "Extremo",
    velocidade: 265,
    intervaloCano: 1.08,
    abertura: 96,
    gravidade: 980,
    pulo: -325,
    inimigos: true,
    intervaloInimigo: 1.65,
    velocidadeInimigo: 350,
    canosMoveis: true
  }
};

function desenharInimigoCanvas(ctx, inimigo, ehNoite) {
  ctx.save();
  ctx.translate(inimigo.x, inimigo.y);
  const r = inimigo.raio;
  const asaY = Math.sin(inimigo.asa) * 6;

  // Aura sutil de perigo para destacar o inimigo
  ctx.fillStyle = ehNoite ? "rgba(244, 63, 94, 0.18)" : "rgba(220, 38, 38, 0.14)";
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
  ctx.fill();

  if (inimigo.tipo === "morcego" || ehNoite) {
    // Asa esquerda / direita de morcego ou ave sombria
    ctx.fillStyle = "#4c1d95";
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.quadraticCurveTo(6, -r * 1.4 + asaY, r * 1.3, -4 + asaY * 0.5);
    ctx.quadraticCurveTo(6, 4, -4, 4);
    ctx.closePath();
    ctx.fill();

    // Corpo
    ctx.fillStyle = "#1f1235";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas pontudas
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.4);
    ctx.lineTo(-r * 0.8, -r * 1.15);
    ctx.lineTo(-r * 0.1, -r * 0.6);
    ctx.fill();
  } else {
    // Cauda do gavião predador (voando para a esquerda)
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.moveTo(r * 0.65, -2);
    ctx.lineTo(r * 1.45, -7);
    ctx.lineTo(r * 1.35, 6);
    ctx.closePath();
    ctx.fill();

    // Corpo
    ctx.fillStyle = "#991b1b";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.08, r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asa batendo
    ctx.fillStyle = "#450a0a";
    ctx.beginPath();
    ctx.ellipse(2, -1 + asaY * 0.45, r * 0.68, r * 0.36, 0.25 - asaY * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  // Olho brilhante voltado para a esquerda
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(-r * 0.42, -r * 0.2, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(-r * 0.48, -r * 0.2, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Bico afiado apontando para a esquerda
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(-r * 0.88, -3);
  ctx.lineTo(-r * 1.52, 1);
  ctx.lineTo(-r * 0.85, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function desenharAveCanvas(ctx, x, y, raio, angulo, skin, asaFase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angulo);

  // Cauda
  ctx.fillStyle = skin.rabo || skin.asa;
  ctx.beginPath();
  ctx.moveTo(-raio * 0.7, -2);
  ctx.lineTo(-raio * 1.45, -7);
  ctx.lineTo(-raio * 1.35, 6);
  ctx.closePath();
  ctx.fill();

  // Corpo
  ctx.fillStyle = skin.corpo;
  ctx.beginPath();
  ctx.ellipse(0, 0, raio * 1.1, raio * 0.88, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barriga
  ctx.fillStyle = skin.barriga || "#fff";
  ctx.beginPath();
  ctx.ellipse(2, raio * 0.28, raio * 0.72, raio * 0.45, 0, 0, Math.PI);
  ctx.fill();

  // Crista (se a ave tiver)
  if (skin.crista) {
    ctx.fillStyle = skin.crista;
    ctx.beginPath();
    ctx.moveTo(-2, -raio * 0.8);
    ctx.lineTo(-10, -raio * 1.45);
    ctx.lineTo(4, -raio * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  // Asa animada
  const asaY = Math.sin(asaFase) * 6;
  ctx.fillStyle = skin.asa;
  ctx.beginPath();
  ctx.ellipse(-3, 2 + asaY * 0.4, raio * 0.65, raio * 0.36, -0.2 + asaY * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Anel ao redor do olho
  if (skin.anel) {
    ctx.fillStyle = skin.anel;
    ctx.beginPath();
    ctx.arc(raio * 0.45, -raio * 0.25, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Olho
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(raio * 0.48, -raio * 0.25, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(raio * 0.54, -raio * 0.25, 2, 0, Math.PI * 2);
  ctx.fill();

  // Bico
  ctx.fillStyle = skin.bico || "#ff9f1c";
  ctx.beginPath();
  ctx.moveTo(raio * 0.9, -4);
  ctx.lineTo(raio * 1.55, 1);
  ctx.lineTo(raio * 0.9, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function desenharCorujaCanvas(ctx, x, y, raio, angulo, asaFase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angulo * 0.7);

  // Cauda
  ctx.fillStyle = "#3b2366";
  ctx.beginPath();
  ctx.moveTo(-raio * 0.7, -2);
  ctx.lineTo(-raio * 1.35, -6);
  ctx.lineTo(-raio * 1.3, 6);
  ctx.closePath();
  ctx.fill();

  // Corpo arredondado da coruja
  ctx.fillStyle = "#5b3b8c";
  ctx.beginPath();
  ctx.ellipse(0, 0, raio * 1.08, raio * 0.96, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barriga clara com manchinhas
  ctx.fillStyle = "#d8ccf0";
  ctx.beginPath();
  ctx.ellipse(2, raio * 0.28, raio * 0.68, raio * 0.48, 0, 0, Math.PI);
  ctx.fill();

  // Penachos (orelhas da coruja)
  ctx.fillStyle = "#43286e";
  ctx.beginPath();
  ctx.moveTo(-3, -raio * 0.75);
  ctx.lineTo(-10, -raio * 1.35);
  ctx.lineTo(3, -raio * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -raio * 0.75);
  ctx.lineTo(10, -raio * 1.32);
  ctx.lineTo(11, -raio * 0.75);
  ctx.closePath();
  ctx.fill();

  // Asa animada
  const asaY = Math.sin(asaFase) * 6;
  ctx.fillStyle = "#3f2669";
  ctx.beginPath();
  ctx.ellipse(-4, 2 + asaY * 0.4, raio * 0.65, raio * 0.4, -0.15 + asaY * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Disco facial + olho grande de coruja
  ctx.fillStyle = "#f3e8ff";
  ctx.beginPath();
  ctx.arc(raio * 0.42, -raio * 0.22, 6.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(raio * 0.46, -raio * 0.22, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#090711";
  ctx.beginPath();
  ctx.arc(raio * 0.5, -raio * 0.22, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // Bico curto e curvo
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(raio * 0.85, -2);
  ctx.lineTo(raio * 1.32, 2);
  ctx.lineTo(raio * 0.82, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function montarFlappy(palco) {
  const aves = obterAvesParaJogos();
  const aveSelecionada = aves[0];
  let dificuldade = "normal";
  let jogadorNome = "";
  try { jogadorNome = localStorage.getItem(CHAVE_JOGADOR_FLAPPY) || ""; } catch (_) {}

  const inputJogador = el("input", {
    type: "text",
    class: "jogo-input",
    placeholder: "Seu nome para o ranking",
    value: jogadorNome,
    maxlength: 24,
    oninput: e => {
      jogadorNome = e.target.value;
      try { localStorage.setItem(CHAVE_JOGADOR_FLAPPY, jogadorNome); } catch (_) {}
    }
  });

  const seletorDif = el("select", {
    class: "jogo-select",
    "aria-label": "Dificuldade do Flappy Ave",
    onchange: e => {
      dificuldade = e.target.value;
      reiniciarJogo();
    }
  },
    el("option", { value: "facil", text: "Fácil (Mais lento)" }),
    el("option", { value: "normal", text: "Normal", selected: true }),
    el("option", { value: "dificil", text: "Difícil (Rápido + Inimigos)" }),
    el("option", { value: "extremo", text: "Extremo (Turbinado)" })
  );

  const curiosidadeBox = el("div", { class: "flappy-curiosidade", hidden: true });
  const rankingBox = el("div", { class: "flappy-ranking" });

  const canvas = el("canvas", { width: 520, height: 380, class: "flappy-canvas" });
  const ctx = canvas.getContext("2d");

  const btnJogar = el("button", { class: "botao", type: "button", text: "▶ Começar / Reiniciar", onclick: () => iniciarVoo() });

  palco.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Flappy Ave" }),
        el("p", { class: "ajuda", text: "Toque, clique ou aperte Espaço/↑ para voar. Nos modos Difícil e Extremo, desvie também dos inimigos voadores!" })
      )
    ),
    el("div", { class: "flappy-controles" },
      el("label", { class: "campo-detalhe" }, el("span", { text: "Dificuldade" }), seletorDif),
      el("label", { class: "campo-detalhe" }, el("span", { text: "Jogador(a)" }), inputJogador),
      btnJogar
    ),
    el("div", { class: "flappy-layout" },
      el("div", { class: "flappy-palco" }, canvas, curiosidadeBox),
      rankingBox
    )
  );

  let estado = "pronto"; // pronto | jogando | fim
  let pontos = 0;
  let passaro = { x: 110, y: 180, vy: 0, raio: 15, asa: 0 };
  let canos = [];
  let inimigos = [];
  let tempoUltimoCano = 0;
  let tempoUltimoInimigo = 0;
  let ultimoFrame = 0;
  let animId = null;
  let indiceCuriosidade = 0;
  let timerCuriosidade = null;

  function renderizarRanking() {
    const lista = lerRankingFlappy();
    rankingBox.replaceChildren(
      el("h4", { text: "🏆 Ranking Local" }),
      lista.length
        ? el("ol", { class: "ranking-lista" }, lista.map(r =>
            el("li", {},
              el("strong", { text: `${r.pontos} pts` }),
              el("span", { text: ` — ${r.nome} (${r.ave}${r.dificuldade ? ` · ${r.dificuldade}` : ""})` })
            )))
        : el("p", { class: "aviso", text: "Nenhuma pontuação salva ainda. Jogue para entrar no ranking!" })
    );
  }

  function mostrarCuriosidade() {
    const meta = obterMetadadosAve(aveSelecionada);
    const lista = meta.curiosidades?.length ? meta.curiosidades : [`${aveSelecionada.title} é uma espécie registrada no Brasil.`];
    const texto = lista[indiceCuriosidade % lista.length];
    indiceCuriosidade++;
    curiosidadeBox.hidden = false;
    curiosidadeBox.replaceChildren(
      el("strong", { text: `💡 Curiosidade (${pontos} pts): ` }),
      el("span", { text: texto })
    );
    clearTimeout(timerCuriosidade);
    timerCuriosidade = setTimeout(() => { curiosidadeBox.hidden = true; }, 4500);
  }

  function reiniciarJogo() {
    estado = "pronto";
    pontos = 0;
    passaro = { x: 110, y: 180, vy: 0, raio: 15, asa: 0 };
    canos = [];
    inimigos = [];
    tempoUltimoCano = 0;
    tempoUltimoInimigo = 0;
    curiosidadeBox.hidden = true;
  }

  function iniciarVoo() {
    reiniciarJogo();
    estado = "jogando";
    pular();
  }

  function pular() {
    const cfg = MODOS_FLAPPY[dificuldade] || MODOS_FLAPPY.normal;
    if (estado === "pronto") estado = "jogando";
    if (estado === "jogando") {
      passaro.vy = cfg.pulo;
    } else if (estado === "fim") {
      iniciarVoo();
    }
  }

  function finalizarJogo() {
    if (estado === "fim") return;
    estado = "fim";
    const cfg = MODOS_FLAPPY[dificuldade] || MODOS_FLAPPY.normal;
    if (pontos > 0) {
      salvarRankingFlappy(jogadorNome, aveSelecionada.title, pontos, cfg.rotulo);
      renderizarRanking();
    }
  }

  function atualizar(dt) {
    passaro.asa += dt * 12;
    if (estado !== "jogando") return;

    const cfg = MODOS_FLAPPY[dificuldade] || MODOS_FLAPPY.normal;
    passaro.vy += cfg.gravidade * dt;
    passaro.y += passaro.vy * dt;

    tempoUltimoCano += dt;
    if (tempoUltimoCano > cfg.intervaloCano) {
      tempoUltimoCano = 0;
      const abertura = cfg.abertura;
      const topo = 48 + Math.random() * (canvas.height - abertura - 110);
      const vyCano = cfg.canosMoveis && Math.random() < 0.55 ? (Math.random() < 0.5 ? 36 : -36) : 0;
      canos.push({ x: canvas.width + 20, largura: 54, topo, abertura, vy: vyCano, contado: false });
    }

    for (let i = canos.length - 1; i >= 0; i--) {
      const c = canos[i];
      c.x -= cfg.velocidade * dt;
      if (c.vy) {
        c.topo += c.vy * dt;
        const maxTopo = canvas.height - c.abertura - 60;
        if (c.topo < 42) { c.topo = 42; c.vy = Math.abs(c.vy); }
        else if (c.topo > maxTopo) { c.topo = maxTopo; c.vy = -Math.abs(c.vy); }
      }

      if (!c.contado && c.x + c.largura < passaro.x) {
        c.contado = true;
        pontos++;
        if (pontos > 0 && pontos % 5 === 0) mostrarCuriosidade();
      }

      const bateX = passaro.x + passaro.raio * 0.8 > c.x && passaro.x - passaro.raio * 0.8 < c.x + c.largura;
      const bateY = passaro.y - passaro.raio * 0.75 < c.topo || passaro.y + passaro.raio * 0.75 > c.topo + c.abertura;
      if (bateX && bateY) finalizarJogo();

      if (c.x + c.largura < -10) canos.splice(i, 1);
    }

    if (cfg.inimigos) {
      tempoUltimoInimigo += dt;
      if (tempoUltimoInimigo > cfg.intervaloInimigo) {
        tempoUltimoInimigo = 0;
        const yBase = 55 + Math.random() * (canvas.height - 120);
        inimigos.push({
          x: canvas.width + 28,
          y: yBase,
          yBase,
          raio: 13,
          vx: cfg.velocidadeInimigo + Math.random() * 45,
          amp: 14 + Math.random() * 18,
          fase: Math.random() * Math.PI * 2,
          asa: 0,
          tipo: Math.random() < 0.5 ? "gaviao" : "morcego"
        });
      }

      for (let i = inimigos.length - 1; i >= 0; i--) {
        const inmg = inimigos[i];
        inmg.x -= inmg.vx * dt;
        inmg.fase += dt * 4.5;
        inmg.asa += dt * 16;
        inmg.y = Math.max(26, Math.min(canvas.height - 42, inmg.yBase + Math.sin(inmg.fase) * inmg.amp));

        const dx = passaro.x - inmg.x;
        const dy = passaro.y - inmg.y;
        const distMin = passaro.raio * 0.75 + inmg.raio * 0.78;
        if (dx * dx + dy * dy < distMin * distMin) finalizarJogo();

        if (inmg.x < -35) inimigos.splice(i, 1);
      }
    }

    if (passaro.y + passaro.raio > canvas.height - 24 || passaro.y - passaro.raio < 0) {
      finalizarJogo();
    }
  }

  function desenhar() {
    const ehNoite = document.documentElement.getAttribute("data-tema") === "escuro";

    // Céu (Dia vs Noite roxo/preto)
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (ehNoite) {
      grad.addColorStop(0, "#1c0f38");
      grad.addColorStop(1, "#090711");
    } else {
      grad.addColorStop(0, "#cfe9f7");
      grad.addColorStop(1, "#eef5e6");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ehNoite) {
      // Estrelas e lua crescente
      ctx.fillStyle = "rgba(233, 213, 255, 0.85)";
      const estrelas = [[42, 46], [130, 32], [210, 68], [295, 28], [380, 74], [470, 110], [85, 115], [330, 128]];
      estrelas.forEach(([sx, sy], i) => {
        ctx.beginPath();
        ctx.arc(sx, sy, i % 2 === 0 ? 1.8 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#e9d5ff";
      ctx.beginPath();
      ctx.arc(445, 58, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#170c30";
      ctx.beginPath();
      ctx.arc(453, 52, 19, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Nuvens simples
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.arc(90, 68, 22, 0, Math.PI * 2);
      ctx.arc(114, 62, 26, 0, Math.PI * 2);
      ctx.arc(140, 70, 20, 0, Math.PI * 2);
      ctx.arc(360, 90, 20, 0, Math.PI * 2);
      ctx.arc(386, 84, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Troncos / obstáculos
    canos.forEach(c => {
      ctx.fillStyle = ehNoite ? "#352063" : "#2d6a4f";
      ctx.fillRect(c.x, 0, c.largura, c.topo);
      ctx.fillRect(c.x, c.topo + c.abertura, c.largura, canvas.height - (c.topo + c.abertura) - 24);
      ctx.fillStyle = ehNoite ? "#221245" : "#1b4332";
      ctx.fillRect(c.x - 4, c.topo - 16, c.largura + 8, 16);
      ctx.fillRect(c.x - 4, c.topo + c.abertura, c.largura + 8, 16);
    });

    // Inimigos voadores (nos modos Difícil e Extremo)
    inimigos.forEach(inmg => desenharInimigoCanvas(ctx, inmg, ehNoite));

    // Solo
    ctx.fillStyle = ehNoite ? "#1b1033" : "#6c9a4f";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
    ctx.fillStyle = ehNoite ? "#5b21b6" : "#4d7c36";
    ctx.fillRect(0, canvas.height - 24, canvas.width, 5);

    // Ave (Coruja à noite, ave escolhida de dia)
    const meta = obterMetadadosAve(aveSelecionada);
    const angulo = estado === "jogando" ? Math.max(-0.45, Math.min(0.65, passaro.vy / 480)) : 0;
    if (ehNoite) {
      desenharCorujaCanvas(ctx, passaro.x, passaro.y, passaro.raio, angulo, passaro.asa);
    } else {
      desenharAveCanvas(ctx, passaro.x, passaro.y, passaro.raio, angulo, meta.skin, passaro.asa);
    }

    // Placar e dificuldade
    const cfg = MODOS_FLAPPY[dificuldade] || MODOS_FLAPPY.normal;
    ctx.fillStyle = ehNoite ? "#f1ecff" : "#123b2e";
    ctx.font = "800 28px Manrope, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(pontos), canvas.width / 2, 44);
    ctx.font = "700 12px DM Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = ehNoite ? "rgba(233, 213, 255, 0.85)" : "rgba(18, 59, 46, 0.75)";
    ctx.fillText(`Modo: ${cfg.rotulo}`, 14, 24);
    ctx.textAlign = "center";

    if (estado === "pronto") {
      ctx.fillStyle = ehNoite ? "rgba(241, 236, 255, 0.9)" : "rgba(18, 59, 46, 0.85)";
      ctx.font = "700 16px DM Sans, sans-serif";
      ctx.fillText(ehNoite ? "Noite! Voe com a coruja (Espaço ou clique)" : "Clique ou aperte Espaço para voar!", canvas.width / 2, canvas.height / 2 + 65);
    } else if (estado === "fim") {
      ctx.fillStyle = ehNoite ? "rgba(15, 10, 30, 0.88)" : "rgba(18, 59, 46, 0.82)";
      ctx.fillRect(90, 125, canvas.width - 180, 120);
      ctx.fillStyle = "#fff";
      ctx.font = "800 22px Manrope, sans-serif";
      ctx.fillText(`Fim de voo! ${pontos} pts`, canvas.width / 2, 168);
      ctx.font = "500 14px DM Sans, sans-serif";
      ctx.fillText("Clique ou aperte Espaço para jogar de novo", canvas.width / 2, 206);
    }
  }

  function loop(ts) {
    if (!canvas.isConnected) return;
    const dt = ultimoFrame ? Math.min(0.04, (ts - ultimoFrame) / 1000) : 0.016;
    ultimoFrame = ts;
    atualizar(dt);
    desenhar();
    animId = requestAnimationFrame(loop);
  }

  const aoTeclar = e => {
    if ($("painel-jogos").hidden || jogoAtual !== "flappy") return;
    if (document.activeElement?.matches("input, select, textarea")) return;
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      pular();
    }
  };
  canvas.addEventListener("pointerdown", e => { e.preventDefault(); pular(); });
  document.addEventListener("keydown", aoTeclar);

  renderizarRanking();
  animId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
    clearTimeout(timerCuriosidade);
    document.removeEventListener("keydown", aoTeclar);
  };
}

/* ================== 3. QUIZ "QUEM SOU EU?" ================== */
function montarQuiz(palco) {
  let pontos = 0;
  let rodada = 0;
  let aveAlvo = null;
  let metaAlvo = null;
  let dicasVisiveis = 1;
  let encerrada = false;

  const cabecalhoPts = el("p", { class: "contagem" });
  const listaDicas = el("ol", { class: "quiz-dicas" });
  const fotoBox = el("div", { class: "quiz-foto-box" });
  const opcoesBox = el("div", { class: "quiz-opcoes" });
  const feedback = el("div", { class: "quiz-feedback" });

  const btnProxDica = el("button", {
    class: "chip ativo", type: "button", text: "💡 Pedir próxima dica (-20 pts)",
    onclick: () => {
      if (encerrada || dicasVisiveis >= 5) return;
      dicasVisiveis++;
      renderizarDicas();
    }
  });
  const btnNovaRodada = el("button", { class: "botao", type: "button", text: "Próxima ave →", onclick: () => novaRodada() });

  palco.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Quiz: Quem sou eu?" }),
        el("p", { class: "ajuda", text: "Tente descobrir a espécie usando o menor número possível de dicas!" })
      )
    ),
    cabecalhoPts,
    el("div", { class: "quiz-layout" },
      el("div", {}, listaDicas, el("div", { class: "acoes" }, btnProxDica, btnNovaRodada)),
      fotoBox
    ),
    opcoesBox,
    feedback
  );

  function construirDicas() {
    const regioesTxt = metaAlvo.regioes.length
      ? metaAlvo.regioes.map(r => NOMES_REGIOES[r] || r).join(", ")
      : "várias regiões do Brasil";
    return [
      `Porte ${metaAlvo.porte.toLowerCase()} · Ocorre em: ${regioesTxt}.`,
      `Cores principais: ${metaAlvo.cores.join(", ")}.`,
      `Habitat e sub-região: ${metaAlvo.habitat}${metaAlvo.subregioes.length ? ` (${metaAlvo.subregioes.join(", ")})` : ""}`,
      `Canto: ${metaAlvo.canto}`,
      `Curiosidade: ${metaAlvo.curiosidades?.[0] || "Espécie típica da avifauna brasileira."}`
    ];
  }

  function renderizarDicas() {
    const todas = construirDicas();
    const visiveis = todas.slice(0, dicasVisiveis);
    listaDicas.replaceChildren(...visiveis.map((txt, i) => {
      const li = el("li", { class: "quiz-dica-item" }, el("span", { text: txt }));
      if (i === 3) {
        li.append(" ", el("button", {
          class: "chip", type: "button", text: "🔊 Ouvir canto",
          onclick: () => tocarSomDaAveNoJogo(aveAlvo)
        }));
      }
      return li;
    }));
    btnProxDica.disabled = encerrada || dicasVisiveis >= 5;
    cabecalhoPts.textContent = `Rodada ${rodada} · Pontuação total: ${pontos} pts · Valendo agora: ${Math.max(20, 120 - dicasVisiveis * 20)} pts`;
  }

  function novaRodada() {
    rodada++;
    encerrada = false;
    dicasVisiveis = 1;
    feedback.replaceChildren();
    const todas = obterAvesParaJogos();
    const comFoto = todas.filter(a => a.thumbnail?.source);
    const pool = comFoto.length >= 4 ? comFoto : todas;
    const embaralhadas = embaralhar(pool);
    aveAlvo = embaralhadas[0];
    metaAlvo = obterMetadadosAve(aveAlvo);

    const alternativas = embaralhar([aveAlvo, ...embaralhadas.slice(1, 4)]);
    opcoesBox.replaceChildren(...alternativas.map(op =>
      el("button", {
        class: "quiz-opcao", type: "button", text: op.title,
        onclick: () => responder(op.title)
      })
    ));

    if (aveAlvo.thumbnail?.source) {
      fotoBox.replaceChildren(
        el("img", { src: aveAlvo.thumbnail.source, alt: "Ave misteriosa", class: "quiz-foto borrada" }),
        el("span", { class: "aviso", text: "A foto é revelada ao responder" })
      );
    } else {
      fotoBox.replaceChildren();
    }

    renderizarDicas();
  }

  function responder(escolha) {
    if (encerrada) return;
    encerrada = true;
    const acertou = escolha === aveAlvo.title;
    const ganho = acertou ? Math.max(20, 120 - dicasVisiveis * 20) : 0;
    pontos += ganho;

    opcoesBox.querySelectorAll(".quiz-opcao").forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === aveAlvo.title) btn.classList.add("certa");
      else if (btn.textContent === escolha && !acertou) btn.classList.add("errada");
    });

    const img = fotoBox.querySelector("img");
    if (img) img.classList.remove("borrada");

    feedback.replaceChildren(
      el("p", {
        class: acertou ? "quiz-acerto" : "erro",
        text: acertou
          ? `Acertou! Era ${aveAlvo.title} (+${ganho} pts com ${dicasVisiveis} ${dicasVisiveis === 1 ? "dica" : "dicas"}).`
          : `Ops! A resposta certa era ${aveAlvo.title}.`
      }),
      el("button", { class: "chip", type: "button", text: "Ver ficha da ave", onclick: () => abrirAve(aveAlvo.title) })
    );
    renderizarDicas();
  }

  novaRodada();
  return () => {
    if (audioAtualJogo) { audioAtualJogo.pause(); audioAtualJogo = null; }
  };
}

/* ================== 4. QUEBRA-CABEÇA ================== */
function montarQuebraCabeca(palco) {
  let nivel = 1; // 1: 3x3, 2: 4x4, 3: 5x5
  let aveAtual = null;
  let ordem = [];
  let selecionada = null;
  let movimentos = 0;

  const status = el("p", { class: "contagem" });
  const grade = el("div", { class: "puzzle-grade" });
  const refImg = el("img", { class: "puzzle-referencia", alt: "Foto completa de referência" });
  const btnProx = el("button", { class: "botao", type: "button", text: "Avançar de nível →", hidden: true, onclick: () => { nivel = Math.min(3, nivel + 1); iniciar(); } });

  const selNivel = el("select", {
    class: "jogo-select",
    "aria-label": "Dificuldade do quebra-cabeça",
    onchange: e => { nivel = Number(e.target.value); iniciar(); }
  },
    el("option", { value: "1", text: "Nível 1 (3×3)" }),
    el("option", { value: "2", text: "Nível 2 (4×4)" }),
    el("option", { value: "3", text: "Nível 3 (5×5)" })
  );

  palco.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Quebra-Cabeça" }),
        el("p", { class: "ajuda", text: "Clique em duas peças para trocá-las de lugar e montar a foto da ave." })
      )
    ),
    el("div", { class: "flappy-controles" },
      el("label", { class: "campo-detalhe" }, el("span", { text: "Dificuldade" }), selNivel),
      el("button", { class: "chip", type: "button", text: "🎲 Trocar foto", onclick: () => iniciar() }),
      btnProx
    ),
    status,
    el("div", { class: "puzzle-layout" },
      grade,
      el("div", { class: "puzzle-lateral" }, el("strong", { text: "Referência" }), refImg)
    )
  );

  function iniciar() {
    selNivel.value = String(nivel);
    btnProx.hidden = true;
    selecionada = null;
    movimentos = 0;

    const comFoto = obterAvesParaJogos().filter(a => a.thumbnail?.source);
    if (!comFoto.length) {
      status.textContent = "Aguardando carregamento das fotos…";
      return;
    }
    aveAtual = comFoto[Math.floor(Math.random() * comFoto.length)];
    refImg.src = aveAtual.thumbnail.source;

    const n = nivel + 2; // 3, 4 ou 5
    const total = n * n;
    ordem = embaralhar(Array.from({ length: total }, (_, i) => i));
    if (ordem.every((v, i) => v === i)) [ordem[0], ordem[1]] = [ordem[1], ordem[0]];
    renderizar();
  }

  function renderizar() {
    const n = nivel + 2;
    const resolvido = ordem.every((v, i) => v === i);
    status.textContent = `${aveAtual.title} · Grade ${n}×${n} · Movimentos: ${movimentos}${resolvido ? " · ✅ Montado!" : ""}`;

    grade.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grade.replaceChildren(...ordem.map((pecaIdx, posIdx) => {
      const col = pecaIdx % n;
      const lin = Math.floor(pecaIdx / n);
      const posX = n > 1 ? (col / (n - 1)) * 100 : 0;
      const posY = n > 1 ? (lin / (n - 1)) * 100 : 0;
      const certa = pecaIdx === posIdx;

      return el("button", {
        type: "button",
        class: `puzzle-peca ${selecionada === posIdx ? "selecionada" : ""} ${certa ? "certa" : ""}`,
        style: `background-image: url("${aveAtual.thumbnail.source}"); background-size: ${n * 100}% ${n * 100}%; background-position: ${posX}% ${posY}%;`,
        "aria-label": `Peça ${posIdx + 1}`,
        onclick: () => aoClicarPeca(posIdx)
      });
    }));

    if (resolvido) {
      notificar(`Quebra-cabeça de ${aveAtual.title} montado em ${movimentos} movimentos!`);
      if (nivel < 3) btnProx.hidden = false;
    }
  }

  function aoClicarPeca(posIdx) {
    if (ordem.every((v, i) => v === i)) return;
    if (selecionada === null) {
      selecionada = posIdx;
      renderizar();
    } else if (selecionada === posIdx) {
      selecionada = null;
      renderizar();
    } else {
      [ordem[selecionada], ordem[posIdx]] = [ordem[posIdx], ordem[selecionada]];
      selecionada = null;
      movimentos++;
      renderizar();
    }
  }

  iniciar();
  return null;
}

/* ================== 5. CAÇA-PALAVRAS ================== */
function limparPalavraParaJogo(titulo) {
  return titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "").toUpperCase();
}

function montarCacaPalavras(container) {
  const TAM = 12;
  let grade = [];
  let palavras = [];
  let encontradas = new Set();
  let selecionadas = []; // lista de "r,c" marcadas pelo usuário
  let erroCelulas = new Set();
  let celulasEncontradas = new Set();
  let maxTamanhoPalavra = 0;
  let timerErro = null;

  const listaPalavras = el("ul", { class: "caca-lista" });
  const tabela = el("div", { class: "caca-grade" });
  const status = el("p", { class: "contagem" });
  const feedbackEl = el("p", { class: "caca-feedback", role: "status", "aria-live": "polite" });

  container.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Caça-Palavras" }),
        el("p", { class: "ajuda", text: "Encontre os nomes populares de aves brasileiras escondidos na grade." })
      )
    ),
    el("div", { class: "acoes" },
      el("button", { class: "botao", type: "button", text: "Novo caça-palavras", onclick: () => gerar() }),
      el("button", { class: "chip ativo", type: "button", text: "✓ Verificar palavra", onclick: () => verificarSelecao(true) }),
      el("button", { class: "chip", type: "button", text: "✕ Limpar seleção", onclick: () => { selecionadas = []; feedbackEl.textContent = ""; renderizar(); } }),
      el("button", { class: "chip", type: "button", text: "💡 Dica", onclick: () => darDica() })
    ),
    status,
    feedbackEl,
    el("div", { class: "caca-layout" }, tabela, listaPalavras)
  );

  function gerar() {
    clearTimeout(timerErro);
    encontradas = new Set();
    celulasEncontradas = new Set();
    selecionadas = [];
    erroCelulas = new Set();
    feedbackEl.textContent = "";
    feedbackEl.className = "caca-feedback";
    grade = Array.from({ length: TAM }, () => Array(TAM).fill(""));

    const candidatas = embaralhar(obterAvesParaJogos())
      .map(a => ({ titulo: a.title, limpa: limparPalavraParaJogo(a.title) }))
      .filter(a => a.limpa.length >= 3 && a.limpa.length <= 11);

    palavras = [];
    const dirs = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0]];
    for (const item of candidatas) {
      if (palavras.length >= 6) break;
      let colocada = false;
      for (let t = 0; t < 60 && !colocada; t++) {
        const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
        const r0 = Math.floor(Math.random() * TAM);
        const c0 = Math.floor(Math.random() * TAM);
        const rf = r0 + dr * (item.limpa.length - 1);
        const cf = c0 + dc * (item.limpa.length - 1);
        if (rf < 0 || rf >= TAM || cf < 0 || cf >= TAM) continue;

        let cabe = true;
        for (let k = 0; k < item.limpa.length; k++) {
          const cur = grade[r0 + dr * k][c0 + dc * k];
          if (cur && cur !== item.limpa[k]) { cabe = false; break; }
        }
        if (cabe) {
          const coords = [];
          for (let k = 0; k < item.limpa.length; k++) {
            const r = r0 + dr * k, c = c0 + dc * k;
            grade[r][c] = item.limpa[k];
            coords.push(`${r},${c}`);
          }
          palavras.push({ ...item, coords });
          colocada = true;
        }
      }
    }

    maxTamanhoPalavra = palavras.reduce((max, p) => Math.max(max, p.limpa.length), 0);

    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < TAM; r++) {
      for (let c = 0; c < TAM; c++) {
        if (!grade[r][c]) grade[r][c] = alfabeto[Math.floor(Math.random() * alfabeto.length)];
      }
    }
    renderizar();
  }

  function mostrarErro(mensagem) {
    clearTimeout(timerErro);
    erroCelulas = new Set(selecionadas);
    selecionadas = [];
    feedbackEl.className = "caca-feedback erro";
    feedbackEl.textContent = mensagem;
    renderizar();
    timerErro = setTimeout(() => {
      erroCelulas = new Set();
      renderizar();
    }, 700);
  }

  function renderizar() {
    status.textContent = `Encontradas: ${encontradas.size}/${palavras.length} · Máximo de letras: ${maxTamanhoPalavra} — Clique nas letras da palavra para marcar.`;
    tabela.replaceChildren();
    for (let r = 0; r < TAM; r++) {
      for (let c = 0; c < TAM; c++) {
        const chave = `${r},${c}`;
        const sel = selecionadas.includes(chave);
        const err = erroCelulas.has(chave);
        tabela.append(el("button", {
          type: "button",
          class: `caca-celula ${celulasEncontradas.has(chave) ? "achada" : ""} ${sel ? "selecionada" : ""} ${err ? "erro" : ""}`,
          text: grade[r][c],
          onclick: () => aoClicarCelula(r, c)
        }));
      }
    }

    listaPalavras.replaceChildren(...palavras.map(p =>
      el("li", { class: encontradas.has(p.limpa) ? "achada" : "", text: p.titulo })
    ));
  }

  function verificarSelecao(forcarErro = false) {
    if (!selecionadas.length) {
      if (forcarErro) mostrarErro("Marque as letras de uma palavra antes de verificar.");
      return;
    }

    const selSet = new Set(selecionadas);
    const achada = palavras.find(p =>
      !encontradas.has(p.limpa)
      && p.coords.length === selSet.size
      && p.coords.every(xy => selSet.has(xy))
    );

    if (achada) {
      encontradas.add(achada.limpa);
      achada.coords.forEach(xy => celulasEncontradas.add(xy));
      selecionadas = [];
      feedbackEl.className = "caca-feedback quiz-acerto";
      feedbackEl.textContent = `✔ Você encontrou: ${achada.titulo}!`;
      if (encontradas.size === palavras.length) notificar("Você encontrou todas as aves!");
      renderizar();
      return;
    }

    if (forcarErro) {
      const letrasMarcadas = selecionadas.map(xy => {
        const [r, c] = xy.split(",").map(Number);
        return grade[r][c];
      }).join("");
      mostrarErro(`Erro: "${letrasMarcadas}" não existe neste caça-palavras!`);
    }
  }

  function aoClicarCelula(r, c) {
    const chave = `${r},${c}`;
    const idx = selecionadas.indexOf(chave);
    if (idx !== -1) {
      selecionadas.splice(idx, 1);
      feedbackEl.textContent = "";
      renderizar();
      return;
    }

    selecionadas.push(chave);
    feedbackEl.textContent = "";

    if (selecionadas.length > maxTamanhoPalavra) {
      mostrarErro(`Erro: você marcou ${selecionadas.length} letras, maior que a maior palavra atual (${maxTamanhoPalavra} letras)!`);
      return;
    }

    verificarSelecao(false);
    if (selecionadas.length) renderizar();
  }

  function darDica() {
    const falta = palavras.find(p => !encontradas.has(p.limpa));
    if (!falta) return;
    selecionadas = [falta.coords[0]];
    const [r, c] = falta.coords[0].split(",").map(Number);
    feedbackEl.className = "caca-feedback";
    feedbackEl.textContent = `Dica: "${falta.titulo}" começa na linha ${r + 1}, coluna ${c + 1}.`;
    renderizar();
  }

  gerar();
  return () => clearTimeout(timerErro);
}

/* ================== 2. JOGO DA FORCA ================== */
function montarForca(container) {
  let aveAlvo = null;
  let palavraVisivel = "";
  let palavraLimpa = "";
  let letrasTentadas = new Set();
  let erros = 0;
  let comDica = true;
  let dicasProgressivas = [];
  const MAX_ERROS = 6;

  const dicaEl = el("p", { class: "ajuda" });
  const desenhoEl = el("div", { class: "forca-desenho" });
  const palavraEl = el("div", { class: "forca-palavra" });
  const tecladoEl = el("div", { class: "forca-teclado" });
  const resultadoEl = el("div", { class: "quiz-feedback" });

  const selDica = el("select", {
    class: "jogo-select",
    "aria-label": "Modo de dicas na forca",
    onchange: e => {
      comDica = e.target.value === "com";
      atualizarDica();
    }
  },
    el("option", { value: "com", text: "Com dica (a cada erro)", selected: true }),
    el("option", { value: "sem", text: "Sem dica" })
  );

  container.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Jogo da Forca" }),
        el("p", { class: "ajuda", text: "Descubra o nome da ave brasileira antes de completar a forca." })
      )
    ),
    el("div", { class: "flappy-controles" },
      el("label", { class: "campo-detalhe" }, el("span", { text: "Dicas" }), selDica),
      el("button", { class: "botao", type: "button", text: "Nova palavra", onclick: () => iniciar() })
    ),
    dicaEl,
    el("div", { class: "forca-layout" }, desenhoEl, el("div", {}, palavraEl, tecladoEl, resultadoEl))
  );

  const normLetra = ch => ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  function atualizarDica() {
    if (!comDica) {
      dicaEl.hidden = true;
      dicaEl.textContent = "";
      return;
    }
    dicaEl.hidden = false;
    if (erros === 0) {
      dicaEl.textContent = "Dica: erre uma letra para liberar a 1ª dica (ou tente sem dicas!).";
      return;
    }
    const liberadas = dicasProgressivas.slice(0, erros);
    dicaEl.textContent = `Dicas (${liberadas.length}/${dicasProgressivas.length}): ${liberadas.join(" · ")}`;
  }

  function iniciar() {
    const aves = obterAvesParaJogos();
    aveAlvo = aves[Math.floor(Math.random() * aves.length)];
    palavraVisivel = aveAlvo.title.toUpperCase();
    palavraLimpa = normLetra(palavraVisivel);
    letrasTentadas = new Set();
    erros = 0;
    resultadoEl.replaceChildren();

    const meta = obterMetadadosAve(aveAlvo);
    const regioesTxt = meta.regioes.length ? meta.regioes.map(r => NOMES_REGIOES[r] || r).join(", ") : "Brasil";
    const biomasTxt = meta.subregioes?.length ? meta.subregioes.join(", ") : regioesTxt;
    const primeiraLetra = [...palavraVisivel].find((_, i) => /[A-Z]/.test(palavraLimpa[i])) || "";
    dicasProgressivas = [
      `Porte ${meta.porte.toLowerCase()}`,
      `Regiões: ${regioesTxt}`,
      `Cores: ${meta.cores.join(", ")}`,
      `Biomas: ${biomasTxt}`,
      `Habitat: ${meta.habitat}`,
      `Começa com "${primeiraLetra}" (${palavraLimpa.replace(/[^A-Z]/g, "").length} letras)`
    ];
    atualizarDica();
    renderizar();
  }

  function renderizar() {
    const letras = [...palavraVisivel].map((ch, idx) => {
      const n = palavraLimpa[idx];
      if (!/[A-Z]/.test(n)) return el("span", { class: "forca-espaco", text: ch });
      const revelada = letrasTentadas.has(n) || erros >= MAX_ERROS;
      return el("span", { class: "forca-letra", text: revelada ? ch : "_" });
    });
    palavraEl.replaceChildren(...letras);

    const ganhou = [...palavraLimpa].every((n, i) => !/[A-Z]/.test(n) || letrasTentadas.has(n));
    const perdeu = erros >= MAX_ERROS;
    const acabou = ganhou || perdeu;

    desenhoEl.innerHTML = `
      <svg viewBox="0 0 140 150" width="140" height="150" aria-label="Desenho da forca: ${erros} de ${MAX_ERROS} erros">
        <line x1="15" y1="140" x2="95" y2="140" stroke="#17372d" stroke-width="4" stroke-linecap="round"/>
        <line x1="35" y1="140" x2="35" y2="15" stroke="#17372d" stroke-width="4" stroke-linecap="round"/>
        <line x1="35" y1="15" x2="95" y2="15" stroke="#17372d" stroke-width="4" stroke-linecap="round"/>
        <line x1="95" y1="15" x2="95" y2="34" stroke="#17372d" stroke-width="3"/>
        ${erros >= 1 ? '<circle cx="95" cy="46" r="12" fill="none" stroke="#b84235" stroke-width="3"/>' : ""}
        ${erros >= 2 ? '<line x1="95" y1="58" x2="95" y2="96" stroke="#b84235" stroke-width="3"/>' : ""}
        ${erros >= 3 ? '<line x1="95" y1="68" x2="75" y2="84" stroke="#b84235" stroke-width="3"/>' : ""}
        ${erros >= 4 ? '<line x1="95" y1="68" x2="115" y2="84" stroke="#b84235" stroke-width="3"/>' : ""}
        ${erros >= 5 ? '<line x1="95" y1="96" x2="78" y2="122" stroke="#b84235" stroke-width="3"/>' : ""}
        ${erros >= 6 ? '<line x1="95" y1="96" x2="112" y2="122" stroke="#b84235" stroke-width="3"/>' : ""}
      </svg>
      <span class="contagem">Erros: ${erros}/${MAX_ERROS}</span>
    `;

    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    tecladoEl.replaceChildren(...alfabeto.map(l => {
      const usada = letrasTentadas.has(l);
      const certa = usada && palavraLimpa.includes(l);
      return el("button", {
        type: "button",
        class: `forca-tecla ${certa ? "certa" : usada ? "errada" : ""}`,
        text: l,
        disabled: usada || acabou,
        onclick: () => tentar(l)
      });
    }));

    if (acabou && !resultadoEl.children.length) {
      resultadoEl.replaceChildren(
        el("p", {
          class: ganhou ? "quiz-acerto" : "erro",
          text: ganhou ? `Parabéns! Você acertou: ${aveAlvo.title}!` : `Fim de jogo! A ave era ${aveAlvo.title}.`
        }),
        el("button", { class: "chip", type: "button", text: "Ver ficha da ave", onclick: () => abrirAve(aveAlvo.title) })
      );
    }
  }

  function tentar(l) {
    if (letrasTentadas.has(l) || erros >= MAX_ERROS) return;
    letrasTentadas.add(l);
    if (!palavraLimpa.includes(l)) {
      erros++;
      atualizarDica();
    }
    renderizar();
  }

  const aoTeclar = e => {
    if ($("painel-jogos").hidden || jogoAtual !== "forca") return;
    if (document.activeElement?.matches("input, select, textarea")) return;
    const l = normLetra(e.key);
    if (/^[A-Z]$/.test(l)) tentar(l);
  };
  document.addEventListener("keydown", aoTeclar);

  iniciar();
  return () => document.removeEventListener("keydown", aoTeclar);
}

/* ================== 6. DESAFIO DAS AVES (LOCAL 2-4 JOGADORES) ================== */
const DESAFIO_AVATARES = [
  { id: "arara", icone: "🦜", nome: "Arara" },
  { id: "tucano", icone: "🦤", nome: "Tucano" },
  { id: "coruja", icone: "🦉", nome: "Coruja" },
  { id: "aguia", icone: "🦅", nome: "Gavião" },
  { id: "flamingo", icone: "🦩", nome: "Guará" },
  { id: "pinguim", icone: "🐧", nome: "Pinguim" },
  { id: "passaro", icone: "🐦", nome: "Sabiá" },
  { id: "pato", icone: "🦆", nome: "Marreco" }
];

const DESAFIO_AVES = [
  { id: "arara-azul", nome: "Arara-azul-grande", bioma: "Pantanal", dieta: "Coquinhos de palmeiras", tamanho: "Grande (cerca de 1 m)", ninho: "Ocos de árvores grandes", status: "Vulnerável", canto: "Grito alto, rouco e metálico", freq: 980, cor: "#1557c0", bico: "#22252a", barriga: "#1c6be8" },
  { id: "arara-vermelha", nome: "Arara-vermelha-grande", bioma: "Amazônia", dieta: "Sementes, frutos e argila", tamanho: "Grande (até 90 cm)", ninho: "Ocos altos e paredões", status: "Pouco preocupante", canto: "Grasnados graves em duplas", freq: 1050, cor: "#c92a2a", bico: "#f1efe7", barriga: "#2b8a3e" },
  { id: "arara-caninde", nome: "Arara-canindé", bioma: "Cerrado", dieta: "Frutos, castanhas e sementes", tamanho: "Grande (cerca de 80 cm)", ninho: "Ocos de buritis mortos", status: "Pouco preocupante", canto: "Grito agudo em bando ao entardecer", freq: 1180, cor: "#1890d5", bico: "#1e2022", barriga: "#f5b700" },
  { id: "ararinha-azul", nome: "Ararinha-azul", bioma: "Caatinga", dieta: "Sementes de pinhão-bravo", tamanho: "Médio (cerca de 55 cm)", ninho: "Ocos de caraibeiras", status: "Extinta na natureza (em reintrodução)", canto: "Chamado nasalado curto e repetido", freq: 1420, cor: "#4ea8de", bico: "#212529", barriga: "#72efdd" },
  { id: "arara-lear", nome: "Arara-azul-de-lear", bioma: "Caatinga", dieta: "Cocos da palmeira licuri", tamanho: "Grande (cerca de 75 cm)", ninho: "Fendas em cânions de arenito", status: "Em perigo", canto: "Grito áspero e grave", freq: 1120, cor: "#1d4ed8", bico: "#1f2937", barriga: "#facc15" },
  { id: "papagaio-verdadeiro", nome: "Papagaio-verdadeiro", bioma: "Cerrado", dieta: "Frutos, sementes e flores", tamanho: "Médio (cerca de 37 cm)", ninho: "Ocos de troncos secos", status: "Pouco preocupante", canto: "Assobios melodiosos e imitações", freq: 1350, cor: "#2b9348", bico: "#343a40", barriga: "#ffd166" },
  { id: "tucano-toco", nome: "Tucano-toco", bioma: "Cerrado", dieta: "Frutos, insetos e ovos", tamanho: "Grande (cerca de 60 cm)", ninho: "Ocos naturais em árvores", status: "Pouco preocupante", canto: "Notas graves e secas ('rek-rek')", freq: 860, cor: "#1a1d20", bico: "#ff7b00", barriga: "#f8f9fa" },
  { id: "tucano-bico-preto", nome: "Tucano-de-bico-preto", bioma: "Mata Atlântica", dieta: "Frutos da copa e artrópodes", tamanho: "Médio (cerca de 48 cm)", ninho: "Ocos altos na floresta", status: "Vulnerável", canto: "Canto rítmico parecido com latido suave", freq: 920, cor: "#1a1d20", bico: "#2b2d42", barriga: "#ffd60a" },
  { id: "tuiuiu", nome: "Tuiuiú", bioma: "Pantanal", dieta: "Peixes, anfíbios e répteis", tamanho: "Muito grande (1,4 m)", ninho: "Plataforma gigante de gravetos no alto", status: "Pouco preocupante", canto: "Matraquear forte com o bico", freq: 720, cor: "#f8f9fa", bico: "#1b1d1f", barriga: "#d90429" },
  { id: "gaviao-real", nome: "Gavião-real", bioma: "Amazônia", dieta: "Preguiças, macacos e grandes aves", tamanho: "Muito grande (até 1 m)", ninho: "Plataforma no topo de castanheiras", status: "Vulnerável", canto: "Assobio agudo e prolongado", freq: 1620, cor: "#495057", bico: "#212529", barriga: "#f8f9fa" },
  { id: "seriema", nome: "Seriema", bioma: "Cerrado", dieta: "Insetos, lagartos e cobras", tamanho: "Grande (cerca de 90 cm)", ninho: "Plataforma de galhos em árvores baixas", status: "Pouco preocupante", canto: "Grito estridente que ecoa longe", freq: 1520, cor: "#a68a64", bico: "#d9480f", barriga: "#ede0d4" },
  { id: "carcara", nome: "Carcará", bioma: "Campos e Cerrado", dieta: "Carniça, insetos e pequenos animais", tamanho: "Médio-grande (55 cm)", ninho: "Galhos altos ou palmeiras", status: "Pouco preocupante", canto: "Som áspero inclinando a cabeça para trás", freq: 1240, cor: "#4a3728", bico: "#f08c00", barriga: "#f8f9fa" },
  { id: "coruja-buraqueira", nome: "Coruja-buraqueira", bioma: "Pampas", dieta: "Insetos e pequenos roedores", tamanho: "Pequeno (cerca de 23 cm)", ninho: "Tocas escavadas no chão", status: "Pouco preocupante", canto: "Piado agudo e rápido em alerta", freq: 1680, cor: "#8c6239", bico: "#d4a373", barriga: "#f3e5ab" },
  { id: "ema", nome: "Ema", bioma: "Cerrado", dieta: "Folhas, frutos e insetos", tamanho: "Muito grande (1,5 m)", ninho: "Depressão rasa no solo com capim", status: "Quase ameaçada", canto: "Som grave e oco emitido pelo macho", freq: 650, cor: "#8d99ae", bico: "#6c757d", barriga: "#edf2f4" },
  { id: "sabia-laranjeira", nome: "Sabiá-laranjeira", bioma: "Mata Atlântica", dieta: "Frutos, minhocas e insetos", tamanho: "Pequeno (cerca de 25 cm)", ninho: "Taça de gravetos e barro", status: "Pouco preocupante", canto: "Melodia doce na madrugada", freq: 1780, cor: "#6c584c", bico: "#e9c46a", barriga: "#e76f51" },
  { id: "bem-te-vi", nome: "Bem-te-vi", bioma: "Mata Atlântica", dieta: "Insetos, frutos e pequenos peixes", tamanho: "Pequeno (cerca de 22 cm)", ninho: "Esfera de capim em galhos", status: "Pouco preocupante", canto: "Canto trissilábico 'bem-te-vi!'", freq: 1850, cor: "#6f4e37", bico: "#212529", barriga: "#ffd60a" },
  { id: "joao-de-barro", nome: "João-de-barro", bioma: "Pampas", dieta: "Insetos e larvas no solo", tamanho: "Pequeno (cerca de 20 cm)", ninho: "Casinha de barro em forma de forno", status: "Pouco preocupante", canto: "Dueto vibrante e estridente do casal", freq: 1710, cor: "#b5651d", bico: "#5c3d2e", barriga: "#f4e8d1" },
  { id: "quero-quero", nome: "Quero-quero", bioma: "Pampas", dieta: "Insetos, vermes e moluscos", tamanho: "Médio (cerca de 37 cm)", ninho: "Raspagem rasa no gramado", status: "Pouco preocupante", canto: "Grito de alerta alto ao proteger o ninho", freq: 1580, cor: "#8d99ae", bico: "#e63946", barriga: "#f8f9fa" },
  { id: "garca-branca", nome: "Garça-branca-grande", bioma: "Pantanal", dieta: "Peixes, rãs e crustáceos", tamanho: "Grande (cerca de 95 cm)", ninho: "Colônias em árvores sobre a água", status: "Pouco preocupante", canto: "Grasnado grave e curto", freq: 810, cor: "#f8f9fa", bico: "#f59f00", barriga: "#e9ecef" },
  { id: "colhereiro", nome: "Colhereiro", bioma: "Pantanal", dieta: "Camarões e pequenos peixes", tamanho: "Grande (cerca de 80 cm)", ninho: "Plataforma de gravetos em manguezais", status: "Pouco preocupante", canto: "Grunhidos baixos perto do ninho", freq: 890, cor: "#ff8fa3", bico: "#adb5bd", barriga: "#ff4d6d" },
  { id: "guara", nome: "Guará", bioma: "Manguezais", dieta: "Caranguejos ricos em carotenoides", tamanho: "Médio-grande (60 cm)", ninho: "Plataforma em árvores de mangue", status: "Pouco preocupante", canto: "Notas nasais curtas em bando", freq: 1140, cor: "#e01e37", bico: "#2b2d42", barriga: "#c71f37" },
  { id: "beija-flor-tesoura", nome: "Beija-flor-tesoura", bioma: "Cerrado", dieta: "Néctar de flores e minúsculos insetos", tamanho: "Pequeno (cerca de 17 cm)", ninho: "Copinho de teia e musgo", status: "Pouco preocupante", canto: "Trinado agudo e metálico rápido", freq: 2150, cor: "#1b4332", bico: "#111", barriga: "#1d3557" },
  { id: "tie-sangue", nome: "Tiê-sangue", bioma: "Mata Atlântica", dieta: "Frutos silvestres e insetos", tamanho: "Pequeno (cerca de 19 cm)", ninho: "Taça funda em arbustos densos", status: "Pouco preocupante", canto: "Notas curtas e agudas ('tzi-tzi')", freq: 1920, cor: "#d00000", bico: "#e9ecef", barriga: "#9d0208" },
  { id: "saira-sete-cores", nome: "Saíra-sete-cores", bioma: "Mata Atlântica", dieta: "Frutos macios e insetos", tamanho: "Pequeno (cerca de 13 cm)", ninho: "Taça bem escondida nas folhas", status: "Pouco preocupante", canto: "Chamado fino e agudo em grupo", freq: 2040, cor: "#00b4d8", bico: "#212529", barriga: "#80ed99" },
  { id: "canario-terra", nome: "Canário-da-terra", bioma: "Cerrado", dieta: "Sementes de capim e grãos", tamanho: "Pequeno (cerca de 14 cm)", ninho: "Cavidades ou ninhos abandonados", status: "Pouco preocupante", canto: "Trinado alegre e contínuo", freq: 1960, cor: "#f5b700", bico: "#8d6e63", barriga: "#ffd60a" },
  { id: "gralha-azul", nome: "Gralha-azul", bioma: "Mata Atlântica (Araucárias)", dieta: "Pinhões, frutos e insetos", tamanho: "Médio (cerca de 40 cm)", ninho: "Taça de gravetos em pinheiros", status: "Pouco preocupante", canto: "Grasnados fortes e variados", freq: 1290, cor: "#023e8a", bico: "#111", barriga: "#0077b6" },
  { id: "uirapuru", nome: "Uirapuru-verdadeiro", bioma: "Amazônia", dieta: "Insetos e pequenas aranhas", tamanho: "Pequeno (cerca de 12 cm)", ninho: "Esfera de fibras no sub-bosque", status: "Pouco preocupante", canto: "Canto flautado considerado o mais belo", freq: 1890, cor: "#7f4f24", bico: "#333", barriga: "#b08968" },
  { id: "pinguim-magalhaes", nome: "Pinguim-de-magalhães", bioma: "Litoral Sul", dieta: "Peixes, lulas e crustáceos", tamanho: "Médio-grande (70 cm)", ninho: "Tocas escavadas na areia ou terra", status: "Pouco preocupante", canto: "Zurro grave parecido com jumento", freq: 760, cor: "#1d2d44", bico: "#212529", barriga: "#f8f9fa" },
  { id: "soldadinho-araripe", nome: "Soldadinho-do-araripe", bioma: "Caatinga (Chapada do Araripe)", dieta: "Frutos de mata úmida", tamanho: "Pequeno (cerca de 15 cm)", ninho: "Cestinha presa em forquilha sobre riachos", status: "Em perigo crítico", canto: "Assobio forte e breve", freq: 1750, cor: "#f8f9fa", bico: "#212529", barriga: "#d90429" },
  { id: "galo-campina", nome: "Galo-de-campina", bioma: "Caatinga", dieta: "Sementes, grãos e insetos", tamanho: "Pequeno (cerca de 17 cm)", ninho: "Taça aberta em arbustos espinhosos", status: "Pouco preocupante", canto: "Canto claro e forte ao amanhecer", freq: 1640, cor: "#c1121f", bico: "#495057", barriga: "#f8f9fa" },
  { id: "periquito-caatinga", nome: "Periquito-da-caatinga", bioma: "Caatinga", dieta: "Sementes, flores e frutos de cactos", tamanho: "Pequeno (cerca de 25 cm)", ninho: "Escava cupinzeiros arbóreos", status: "Pouco preocupante", canto: "Algazarra aguda em bandos", freq: 1550, cor: "#38b000", bico: "#e9ecef", barriga: "#ffbe0b" },
  { id: "concriz", nome: "Concriz", bioma: "Caatinga", dieta: "Insetos, néctar e frutos", tamanho: "Pequeno-médio (24 cm)", ninho: "Aproveita ninhos fechados de outras aves", status: "Pouco preocupante", canto: "Notas musicais que imitam outros sons", freq: 1480, cor: "#fb8500", bico: "#111", barriga: "#111" },
  { id: "asa-branca", nome: "Asa-branca", bioma: "Caatinga", dieta: "Sementes e frutos secos", tamanho: "Médio (cerca de 34 cm)", ninho: "Plataforma simples de gravetos", status: "Pouco preocupante", canto: "Arrulho grave ('hu-hu-hu')", freq: 780, cor: "#8d99ae", bico: "#212529", barriga: "#edf2f4" },
  { id: "mutum-penacho", nome: "Mutum-de-penacho", bioma: "Pantanal", dieta: "Frutos caídos e sementes", tamanho: "Grande (cerca de 85 cm)", ninho: "Plataforma de folhas e galhos", status: "Vulnerável", canto: "Som grave e abafado ('hum-hum')", freq: 690, cor: "#1a1d20", bico: "#f5b700", barriga: "#e76f51" },
  { id: "anu-preto", nome: "Anu-preto", bioma: "Campos e Cerrado", dieta: "Gafanhotos, lagartas e carrapatos", tamanho: "Médio (cerca de 35 cm)", ninho: "Ninho coletivo de vários casais", status: "Pouco preocupante", canto: "Assobio descendente ('anu-u')", freq: 1320, cor: "#1b1d1f", bico: "#111", barriga: "#343a40" },
  { id: "pica-pau-campo", nome: "Pica-pau-do-campo", bioma: "Cerrado", dieta: "Formigas e cupins no solo", tamanho: "Médio (cerca de 32 cm)", ninho: "Buraco escavado em cupinzeiros", status: "Pouco preocupante", canto: "Grito alto e vibrante ('kui-kui')", freq: 1410, cor: "#5c4033", bico: "#212529", barriga: "#ffd60a" },
  { id: "urubu-rei", nome: "Urubu-rei", bioma: "Amazônia", dieta: "Exclusivamente carniça", tamanho: "Grande (cerca de 80 cm)", ninho: "Ocos de troncos ou fendas no chão", status: "Pouco preocupante", canto: "Não possui siringe, faz apenas bufos", freq: 620, cor: "#f8f9fa", bico: "#f77f00", barriga: "#212529" },
  { id: "cardeal", nome: "Cardeal-de-topete-vermelho", bioma: "Pampas", dieta: "Sementes, grãos e insetos", tamanho: "Pequeno (cerca de 19 cm)", ninho: "Taça em árvores espinhosas", status: "Pouco preocupante", canto: "Assobios altos e melodiosos", freq: 1690, cor: "#adb5bd", bico: "#6c757d", barriga: "#d90429" },
  { id: "sanhaco-cinzento", nome: "Sanhaço-cinzento", bioma: "Mata Atlântica", dieta: "Frutos moles, brotos e néctar", tamanho: "Pequeno (cerca de 18 cm)", ninho: "Taça rasa em galhos altos", status: "Pouco preocupante", canto: "Sequência rápida de notas agudas", freq: 1810, cor: "#748cab", bico: "#3d405b", barriga: "#90e0ef" },
  { id: "jacupemba", nome: "Jacupemba", bioma: "Mata Atlântica", dieta: "Frutos da mata e folhas tenras", tamanho: "Médio-grande (55 cm)", ninho: "Plataforma de ramos em árvores", status: "Pouco preocupante", canto: "Grito áspero ao amanhecer", freq: 950, cor: "#4a3f35", bico: "#212529", barriga: "#c1121f" },
  { id: "avoante", nome: "Avoante", bioma: "Caatinga", dieta: "Sementes de gramíneas no solo", tamanho: "Pequeno-médio (24 cm)", ninho: "Ninho simples no chão ou arbustos", status: "Pouco preocupante", canto: "Arrulho suave repetitivo", freq: 840, cor: "#9c8976", bico: "#212529", barriga: "#d6ccc2" },
  { id: "gaviao-carijo", nome: "Gavião-carijó", bioma: "Campos e Mata Atlântica", dieta: "Insetos grandes, lagartos e roedores", tamanho: "Médio (cerca de 36 cm)", ninho: "Taça de gravetos em copas de árvores", status: "Pouco preocupante", canto: "Grito agudo e insistente", freq: 1600, cor: "#6c757d", bico: "#f59f00", barriga: "#dee2e6" }
];

const DESAFIO_TIPOS_PERGUNTA = [
  { chave: "bioma", rotulo: "Bioma", texto: a => `Em qual bioma o(a) ${a.nome} é mais característico(a)?`, exp: a => `O(a) ${a.nome} vive principalmente no bioma ${a.bioma}.` },
  { id: "dieta", chave: "dieta", rotulo: "Dieta", texto: a => `Qual é a principal dieta do(a) ${a.nome}?`, exp: a => `Na natureza, o(a) ${a.nome} se alimenta principalmente de ${a.dieta.toLowerCase()}.` },
  { chave: "tamanho", rotulo: "Tamanho", texto: a => `Qual é o porte/tamanho aproximado do(a) ${a.nome}?`, exp: a => `O(a) ${a.nome} apresenta tamanho ${a.tamanho.toLowerCase()}.` },
  { chave: "ninho", rotulo: "Ninho", texto: a => `Onde o(a) ${a.nome} costuma fazer seu ninho?`, exp: a => `O(a) ${a.nome} constrói ou ocupa ${a.ninho.toLowerCase()}.` },
  { chave: "status", rotulo: "Conservação", texto: a => `Qual é o status de conservação do(a) ${a.nome}?`, exp: a => `Atualmente, o(a) ${a.nome} tem status de conservação: ${a.status}.` },
  { chave: "canto", rotulo: "Canto", texto: a => `Qual característica descreve o canto do(a) ${a.nome}?`, exp: a => `O canto do(a) ${a.nome} é conhecido por: ${a.canto.toLowerCase()}.` }
];

function sanitizarNomeDesafio(valor, fallback) {
  const limpo = String(valor ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]))
    .trim();
  return limpo || fallback;
}

function criarSvgDesafio(ave) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("aria-hidden", "true");
  const add = (tag, attrs) => {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    svg.appendChild(node);
  };
  add("rect", { width: "100", height: "100", fill: "#e8efdc" });
  add("polygon", { points: "18,52 6,38 10,62", fill: ave.cor });
  add("ellipse", { cx: "48", cy: "54", rx: "28", ry: "22", fill: ave.cor });
  add("ellipse", { cx: "52", cy: "61", rx: "18", ry: "12", fill: ave.barriga || "#fff" });
  add("circle", { cx: "65", cy: "38", r: "15", fill: ave.cor });
  add("polygon", { points: "77,34 94,40 77,45", fill: ave.bico || "#f59f00" });
  add("circle", { cx: "69", cy: "35", r: "3.2", fill: "#fff" });
  add("circle", { cx: "70", cy: "35", r: "1.6", fill: "#111" });
  return svg;
}

function criarPerguntaDesafio(aveAlvo, chaveTipo) {
  const tipoObj = DESAFIO_TIPOS_PERGUNTA.find(t => t.chave === chaveTipo) || DESAFIO_TIPOS_PERGUNTA[0];
  const correta = aveAlvo[tipoObj.chave];
  const outrosValores = [...new Set(
    DESAFIO_AVES.filter(a => a.id !== aveAlvo.id && a[tipoObj.chave] && a[tipoObj.chave] !== correta)
      .map(a => a[tipoObj.chave])
  )];
  const distratores = embaralhar(outrosValores).slice(0, 3);
  return {
    aveId: aveAlvo.id,
    aveNome: aveAlvo.nome,
    tipoRotulo: tipoObj.rotulo,
    enunciado: tipoObj.texto(aveAlvo),
    opcoes: embaralhar([correta, ...distratores]),
    correta,
    explicacao: tipoObj.exp(aveAlvo)
  };
}

let desafioIniciado = false;
function iniciarAbaDesafio() {
  const raiz = $("desafio-das-aves-raiz");
  if (!raiz || desafioIniciado) return;
  desafioIniciado = true;

  const config = {
    numJogadores: 2,
    perguntasPorJogador: 5,
    dificuldade: "medio",
    nomes: ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"],
    avatares: ["arara", "tucano", "coruja", "aguia"]
  };
  let partida = null;
  let timerId = null;

  const limparTimer = () => {
    if (timerId) { clearInterval(timerId); timerId = null; }
  };

  const audioDisponivel = () => Boolean(window.AudioContext || window.webkitAudioContext);

  function renderConfig() {
    limparTimer();
    const contJogadores = el("div", { class: "desafio-jogadores" });

    const renderJogInputs = () => {
      contJogadores.replaceChildren();
      for (let i = 0; i < config.numJogadores; i++) {
        contJogadores.append(
          el("div", { class: "desafio-jog-row" },
            el("input", {
              type: "text",
              class: "desafio-input",
              maxlength: 20,
              value: config.nomes[i],
              "aria-label": `Nome do jogador ${i + 1}`,
              oninput: e => { config.nomes[i] = e.target.value; }
            }),
            el("select", {
              class: "desafio-select",
              "aria-label": `Avatar do jogador ${i + 1}`,
              onchange: e => { config.avatares[i] = e.target.value; }
            }, ...DESAFIO_AVATARES.map(av => el("option", {
              value: av.id, text: `${av.icone} ${av.nome}`, selected: config.avatares[i] === av.id
            })))
          )
        );
      }
    };

    const grupoNum = el("div", { class: "desafio-seg" }, [2, 3, 4].map(n =>
      el("button", {
        type: "button",
        class: `desafio-seg-btn ${config.numJogadores === n ? "ativo" : ""}`,
        text: `${n} jogadores`,
        onclick: () => {
          config.numJogadores = n;
          [...grupoNum.children].forEach((b, idx) => b.classList.toggle("ativo", [2, 3, 4][idx] === n));
          renderJogInputs();
        }
      })
    ));

    const grupoPerg = el("div", { class: "desafio-seg" }, [5, 7, 10].map(q =>
      el("button", {
        type: "button",
        class: `desafio-seg-btn ${config.perguntasPorJogador === q ? "ativo" : ""}`,
        text: `${q} perguntas`,
        onclick: () => {
          config.perguntasPorJogador = q;
          [...grupoPerg.children].forEach((b, idx) => b.classList.toggle("ativo", [5, 7, 10][idx] === q));
        }
      })
    ));

    const difs = [
      { id: "facil", txt: "Fácil" },
      { id: "medio", txt: "Médio" },
      { id: "dificil", txt: "Difícil" }
    ];
    const grupoDif = el("div", { class: "desafio-seg" }, difs.map(d =>
      el("button", {
        type: "button",
        class: `desafio-seg-btn ${config.dificuldade === d.id ? "ativo" : ""}`,
        text: d.txt,
        onclick: () => {
          config.dificuldade = d.id;
          [...grupoDif.children].forEach((b, idx) => b.classList.toggle("ativo", difs[idx].id === d.id));
        }
      })
    ));

    raiz.replaceChildren(
      el("div", { class: "desafio-intro" },
        el("strong", { text: "Como funciona o jogo" }),
        el("ol", {},
          el("li", { text: "Cada jogador joga na sua vez, passando o mesmo aparelho." }),
          el("li", { text: "No seu turno, você tem até 12s para ler 3 cards de aves (com foto, canto e fatos)." }),
          el("li", { text: "Depois, responde a uma pergunta (A–D) sobre uma dessas 3 aves." }),
          el("li", { text: "Vence quem tiver mais acertos; em empate, ganha o menor tempo total (ou morte súbita)." })
        )
      ),
      el("p", { class: "ajuda", text: "Revezem o celular: estudem 3 aves por turno e respondam ao desafio!" }),
      el("div", { class: "desafio-campo" }, el("span", { class: "desafio-rotulo", text: "Número de jogadores" }), grupoNum),
      el("div", { class: "desafio-campo" }, el("span", { class: "desafio-rotulo", text: "Jogadores e avatares" }), contJogadores),
      el("div", { class: "desafio-campo" }, el("span", { class: "desafio-rotulo", text: "Perguntas por jogador" }), grupoPerg),
      el("div", { class: "desafio-campo" }, el("span", { class: "desafio-rotulo", text: "Dificuldade (Fácil: vê cards · Médio: esconde · Difícil: 15s)" }), grupoDif),
      el("button", { type: "button", class: "desafio-btn-primario", text: "Iniciar Partida", onclick: iniciarPartida })
    );

    renderJogInputs();
  }

  function iniciarPartida() {
    const disp = audioDisponivel() ? DESAFIO_TIPOS_PERGUNTA : DESAFIO_TIPOS_PERGUNTA.filter(t => t.chave !== "canto");
    const tiposBase = Array.from({ length: config.perguntasPorJogador }, (_, i) => disp[i % disp.length].chave);
    const poolAlvos = embaralhar(DESAFIO_AVES);
    const alvosUsados = new Set();
    const jogadores = [];

    for (let i = 0; i < config.numJogadores; i++) {
      const av = DESAFIO_AVATARES.find(a => a.id === config.avatares[i]) || DESAFIO_AVATARES[0];
      jogadores.push({
        idx: i,
        nome: sanitizarNomeDesafio(config.nomes[i], `Jogador ${i + 1}`),
        avatar: av.icone,
        acertos: 0,
        tempoTotalMs: 0,
        erradas: [],
        tipos: embaralhar(tiposBase),
        avesVistas: new Set()
      });
    }

    const turnos = [];
    let ptr = 0;
    for (let r = 0; r < config.perguntasPorJogador; r++) {
      for (let j = 0; j < jogadores.length; j++) {
        const jog = jogadores[j];
        const aveAlvo = poolAlvos[ptr++];
        alvosUsados.add(aveAlvo.id);
        const compCand = embaralhar(DESAFIO_AVES.filter(a => a.id !== aveAlvo.id && !jog.avesVistas.has(a.id)));
        const extras = compCand.length >= 2 ? compCand.slice(0, 2) : embaralhar(DESAFIO_AVES.filter(a => a.id !== aveAlvo.id)).slice(0, 2);
        const trio = embaralhar([aveAlvo, ...extras]);
        trio.forEach(a => jog.avesVistas.add(a.id));
        turnos.push({
          jogadorIdx: j,
          rodada: r + 1,
          totalRodadas: config.perguntasPorJogador,
          trio,
          pergunta: criarPerguntaDesafio(aveAlvo, jog.tipos[r])
        });
      }
    }

    partida = { jogadores, turnos, turnoAtual: 0, morteSubita: false, alvosUsados };
    renderPassagem();
  }

  const fotosDesafioCache = new Map();

  async function obterFotoRealAve(ave) {
    const emCache = fotosDesafioCache.get(ave.id);
    if (emCache !== undefined) return emCache;
    const alvoNorm = norm(ave.nome);
    const carregada = obterAvesParaJogos().find(a => {
      const t = norm(a.title);
      return t === alvoNorm || t.includes(alvoNorm) || alvoNorm.includes(t);
    });
    if (carregada?.thumbnail?.source) {
      fotosDesafioCache.set(ave.id, carregada.thumbnail.source);
      return carregada.thumbnail.source;
    }
    if (typeof wiki !== "function") return null;
    const parCurado = [...(typeof BR_DESTAQUES !== "undefined" ? BR_DESTAQUES : []), ...(typeof NE_DESTAQUES !== "undefined" ? NE_DESTAQUES : [])]
      .find(item => norm(item[0]) === alvoNorm);
    const tituloBusca = parCurado ? parCurado[1] : ave.nome;
    try {
      const d = await wiki({
        action: "query",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: 360,
        redirects: 1,
        titles: tituloBusca
      });
      const src = d?.query?.pages?.[0]?.thumbnail?.source || null;
      fotosDesafioCache.set(ave.id, src);
      return src;
    } catch (_) {
      return null;
    }
  }

  const encerrarPartida = () => {
    limparTimer();
    pararSomJogo();
    const houveResposta = partida?.jogadores?.some(j => j.acertos > 0 || j.erradas.length > 0);
    if (!houveResposta) {
      renderConfig();
      return;
    }
    const ordenados = [...partida.jogadores].sort((a, b) => b.acertos - a.acertos || a.tempoTotalMs - b.tempoTotalMs);
    mostrarResultado(ordenados, true);
  };

  const criarBotaoEncerrar = () => el("button", {
    type: "button",
    class: "desafio-btn-encerrar",
    text: "Encerrar partida",
    onclick: encerrarPartida
  });

  function renderPassagem() {
    limparTimer();
    pararSomJogo();
    const t = partida.turnos[partida.turnoAtual];
    const jog = partida.jogadores[t.jogadorIdx];
    t.trio.forEach(a => { obterFotoRealAve(a); });
    raiz.replaceChildren(
      el("div", { class: "desafio-passagem" },
        el("span", { class: "desafio-badge", text: partida.morteSubita ? "⚡ Morte Súbita" : `Rodada ${t.rodada} de ${t.totalRodadas}` }),
        el("div", { class: "desafio-avatar", "aria-hidden": "true", text: jog.avatar }),
        el("h3", { text: `Vez de ${jog.nome}` }),
        el("p", { class: "ajuda", text: "Passe o celular para este jogador. Toque abaixo quando estiver pronto!" }),
        el("button", { type: "button", class: "desafio-btn-primario", text: "Toque para começar", onclick: () => renderEstudo(t) }),
        criarBotaoEncerrar()
      )
    );
  }

  function criarCardAve(ave) {
    const fotoBox = el("div", { class: "desafio-foto" }, criarSvgDesafio(ave));
    const aplicarFoto = src => {
      if (!src || !fotoBox.isConnected) return;
      const img = el("img", { src, alt: ave.nome });
      img.addEventListener("error", () => {
        if (fotoBox.isConnected) fotoBox.replaceChildren(criarSvgDesafio(ave));
      });
      fotoBox.replaceChildren(img);
    };

    const urlImediata = fotosDesafioCache.get(ave.id)
      || obterAvesParaJogos().find(a => norm(a.title) === norm(ave.nome))?.thumbnail?.source;
    if (urlImediata) {
      const img = el("img", { src: urlImediata, alt: ave.nome });
      img.addEventListener("error", () => fotoBox.replaceChildren(criarSvgDesafio(ave)));
      fotoBox.replaceChildren(img);
    } else {
      obterFotoRealAve(ave).then(aplicarFoto);
    }

    const btnSom = el("button", {
      type: "button",
      class: "desafio-btn-som",
      text: "🔊 Canto",
      onclick: async () => {
        try { await tocarSomDaAveNoJogo({ title: ave.nome }); }
        catch (_) { btnSom.textContent = "🔇 Sem áudio"; }
      }
    });

    return el("article", { class: "desafio-card" },
      fotoBox,
      el("div", {},
        el("div", { class: "desafio-card-topo" },
          el("span", { class: "desafio-ave-nome", text: ave.nome }),
          btnSom
        ),
        el("ul", { class: "desafio-fatos" },
          el("li", {}, el("strong", { text: "Bioma: " }), ave.bioma),
          el("li", {}, el("strong", { text: "Dieta: " }), ave.dieta),
          el("li", {}, el("strong", { text: "Tamanho: " }), ave.tamanho),
          el("li", {}, el("strong", { text: "Ninho: " }), ave.ninho)
        )
      )
    );
  }

  function renderEstudo(turno) {
    limparTimer();
    const jog = partida.jogadores[turno.jogadorIdx];
    const TEMPO_ESTUDO = 12;
    const fill = el("div", { class: "desafio-tempo-fill" });
    const txtTempo = el("div", { class: "desafio-tempo-txt", text: `Tempo de leitura: ${TEMPO_ESTUDO}s` });
    const avancar = () => { limparTimer(); renderPergunta(turno); };

    raiz.replaceChildren(
      el("div", { class: "desafio-turno-barra" },
        el("span", { text: `${jog.avatar} ${jog.nome}` }),
        el("span", { text: partida.morteSubita ? "Morte Súbita" : `Rodada ${turno.rodada}/${turno.totalRodadas}` })
      ),
      el("div", { class: "desafio-tempo-wrap" }, fill),
      txtTempo,
      el("div", { class: "desafio-cards" }, turno.trio.map(criarCardAve)),
      el("button", { type: "button", class: "desafio-btn-primario", text: "Já li — Ir para a pergunta", onclick: avancar }),
      criarBotaoEncerrar()
    );

    const inicio = Date.now();
    timerId = setInterval(() => {
      const falta = Math.max(0, TEMPO_ESTUDO - (Date.now() - inicio) / 1000);
      fill.style.width = `${(falta / TEMPO_ESTUDO) * 100}%`;
      fill.classList.toggle("alerta", falta <= 3.5);
      txtTempo.textContent = `Tempo de leitura: ${Math.ceil(falta)}s`;
      if (falta <= 0) avancar();
    }, 100);
  }

  function renderPergunta(turno) {
    limparTimer();
    pararSomJogo();
    const jog = partida.jogadores[turno.jogadorIdx];
    const p = turno.pergunta;
    const inicioResp = Date.now();
    let respondeu = false;
    const letras = ["A", "B", "C", "D"];

    const extras = [];
    if (config.dificuldade === "facil") {
      extras.push(
        el("details", { class: "desafio-recolhivel", open: true },
          el("summary", { text: "Ver os 3 cards novamente" }),
          el("div", { class: "desafio-cards" }, turno.trio.map(criarCardAve))
        )
      );
    }

    const fill = config.dificuldade === "dificil" ? el("div", { class: "desafio-tempo-fill" }) : null;
    const txtTempo = config.dificuldade === "dificil" ? el("div", { class: "desafio-tempo-txt", text: "Tempo para responder: 15s" }) : null;

    const finalizar = (escolha, esgotou) => {
      if (respondeu) return;
      respondeu = true;
      limparTimer();
      jog.tempoTotalMs += esgotou ? 15000 : Math.max(100, Date.now() - inicioResp);
      const acertou = !esgotou && escolha === p.correta;
      if (acertou) jog.acertos++;
      else {
        jog.erradas.push({
          ave: p.aveNome, enunciado: p.enunciado,
          suaResposta: esgotou ? "Tempo esgotado (15s)" : escolha,
          correta: p.correta, explicacao: p.explicacao
        });
      }
      renderFeedback(turno, acertou, esgotou);
    };

    raiz.replaceChildren(...[
      el("div", { class: "desafio-turno-barra" },
        el("span", { text: `${jog.avatar} ${jog.nome}` }),
        el("span", { text: `Acertos: ${jog.acertos}` })
      ),
      fill ? el("div", { class: "desafio-tempo-wrap" }, fill) : null,
      txtTempo,
      ...extras,
      el("div", { class: "desafio-pergunta-box" },
        el("span", { class: "desafio-pergunta-tipo", text: p.tipoRotulo }),
        el("p", { class: "desafio-pergunta-txt", text: p.enunciado })
      ),
      el("div", { class: "desafio-opcoes" }, p.opcoes.map((op, idx) =>
        el("button", { type: "button", class: "desafio-opcao", onclick: () => finalizar(op, false) },
          el("span", { class: "desafio-opcao-letra", text: letras[idx] }),
          el("span", { text: op })
        )
      )),
      criarBotaoEncerrar()
    ].filter(Boolean));

    if (config.dificuldade === "dificil") {
      timerId = setInterval(() => {
        const falta = Math.max(0, 15 - (Date.now() - inicioResp) / 1000);
        fill.style.width = `${(falta / 15) * 100}%`;
        fill.classList.toggle("alerta", falta <= 4);
        txtTempo.textContent = `Tempo para responder: ${Math.ceil(falta)}s`;
        if (falta <= 0) finalizar("", true);
      }, 100);
    }
  }

  function renderFeedback(turno, acertou, esgotou) {
    limparTimer();
    const p = turno.pergunta;
    const ehUltimo = partida.turnoAtual + 1 >= partida.turnos.length;
    raiz.replaceChildren(
      el("div", { class: `desafio-feedback ${acertou ? "certo" : "errado"}` },
        el("p", { class: "desafio-feedback-titulo", text: acertou ? "✔ Acertou!" : (esgotou ? "⏱ Tempo esgotado!" : "✘ Errou!") }),
        el("p", { class: "desafio-feedback-resp", text: `Resposta certa: ${p.correta}` }),
        el("p", { class: "desafio-feedback-exp", text: p.explicacao })
      ),
      el("button", {
        type: "button",
        class: "desafio-btn-primario",
        text: ehUltimo ? "Ver resultado final" : "Próximo jogador",
        onclick: () => {
          partida.turnoAtual++;
          if (partida.turnoAtual < partida.turnos.length) renderPassagem();
          else avaliarFim();
        }
      }),
      criarBotaoEncerrar()
    );
  }

  function mostrarResultado(ordenados, encerradaAntes = false) {
    limparTimer();
    pararSomJogo();
    const vencedor = ordenados[0];
    const erradas = ordenados.flatMap(j => j.erradas.map(e => ({ jogador: j.nome, ...e })));
    raiz.replaceChildren(
      el("div", { class: "desafio-vencedor" },
        el("div", { text: encerradaAntes ? "🏁 Partida encerrada — Líder" : "🏆 Vencedor(a) da partida" }),
        el("strong", { text: `${vencedor.avatar} ${vencedor.nome}` }),
        el("div", { text: `${vencedor.acertos} acerto(s) · ${(vencedor.tempoTotalMs / 1000).toFixed(1)}s` })
      ),
      el("h3", { text: "Ranking" }),
      el("ol", { class: "desafio-ranking" }, ordenados.map((j, pos) =>
        el("li", {},
          el("span", { text: `${pos + 1}º ${j.avatar} ${j.nome}` }),
          el("strong", { text: `${j.acertos} pts · ${(j.tempoTotalMs / 1000).toFixed(1)}s` })
        )
      )),
      erradas.length
        ? el("div", {},
            el("h3", { text: "Revisão das erradas" }),
            el("div", { class: "desafio-revisao" }, erradas.map(item =>
              el("div", { class: "desafio-revisao-item" },
                el("p", {}, el("strong", { text: `${item.jogador} — ${item.ave}` })),
                el("p", { text: item.enunciado }),
                el("p", { text: `Marcou: ${item.suaResposta} | Certo: ${item.correta}` }),
                el("p", { text: item.explicacao })
              )
            ))
          )
        : el("p", { class: "ajuda", text: "Nenhum erro na partida — desempenho perfeito!" }),
      el("button", { type: "button", class: "desafio-btn-primario", text: "Jogar de novo", onclick: renderConfig })
    );
  }

  function avaliarFim() {
    const ordenados = [...partida.jogadores].sort((a, b) => b.acertos - a.acertos || a.tempoTotalMs - b.tempoTotalMs);
    const topo = ordenados[0];
    const empatados = ordenados.filter(j => j.acertos === topo.acertos && Math.abs(j.tempoTotalMs - topo.tempoTotalMs) <= 50);

    if (empatados.length > 1) {
      const disp = embaralhar(DESAFIO_AVES.filter(a => !partida.alvosUsados.has(a.id)));
      const fonte = disp.length >= empatados.length ? disp : embaralhar(DESAFIO_AVES);
      const tipos = audioDisponivel() ? DESAFIO_TIPOS_PERGUNTA : DESAFIO_TIPOS_PERGUNTA.filter(t => t.chave !== "canto");
      const tipo = tipos[Math.floor(Math.random() * tipos.length)].chave;
      partida.morteSubita = true;
      empatados.forEach((jog, idx) => {
        const alvo = fonte[idx];
        partida.alvosUsados.add(alvo.id);
        const comp = embaralhar(DESAFIO_AVES.filter(a => a.id !== alvo.id)).slice(0, 2);
        partida.turnos.push({
          jogadorIdx: jog.idx, rodada: "Morte Súbita", totalRodadas: "MS",
          trio: embaralhar([alvo, ...comp]), pergunta: criarPerguntaDesafio(alvo, tipo)
        });
      });
      renderPassagem();
      return;
    }

    mostrarResultado(ordenados, false);
  }

  renderConfig();
}
window.iniciarAbaDesafio = iniciarAbaDesafio;

/* ================== 7. TERMO DAS AVES (1 A 4 PALAVRAS) ================== */
const TERMO_AVES = [
  // 5 letras
  { palavra: "ARARA", exibicao: "Arara", grupo: "frutas", dica: "Ave colorida de bico forte que adora coquinhos e frutos." },
  { palavra: "SABIA", exibicao: "Sabiá", grupo: "frutas", dica: "Pássaro famoso pelo canto melodioso que come frutinhas e minhocas." },
  { palavra: "GUARA", exibicao: "Guará", grupo: "agua", dica: "Ave de plumagem avermelhada que vive em manguezais e áreas alagadas." },
  { palavra: "GARCA", exibicao: "Garça", grupo: "agua", dica: "Ave pernalta que pesca peixes e girinos em rios e lagoas." },
  { palavra: "URUBU", exibicao: "Urubu", grupo: "rapina", dica: "Ave de grande voo planado que ajuda a limpar a natureza." },
  { palavra: "MUTUM", exibicao: "Mutum", grupo: "frutas", dica: "Ave florestal que caminha no solo buscando frutos caídos." },
  { palavra: "CURIO", exibicao: "Curió", grupo: "sementes", dica: "Pequeno pássaro cantor que se alimenta de sementes de capim." },
  { palavra: "BIGUA", exibicao: "Biguá", grupo: "agua", dica: "Ave aquática que mergulha fundo para capturar peixes." },
  { palavra: "CISNE", exibicao: "Cisne", grupo: "agua", dica: "Ave aquática de pescoço longo que nada em lagos." },
  { palavra: "POMBA", exibicao: "Pomba", grupo: "sementes", dica: "Ave comum que caminha no chão bicando grãos e sementes." },
  { palavra: "PAVAO", exibicao: "Pavão", grupo: "sementes", dica: "Ave vistosa de cauda em leque que procura grãos e insetos no solo." },
  { palavra: "GANSO", exibicao: "Ganso", grupo: "agua", dica: "Ave aquática de bico largo que pasta perto de lagos e rios." },
  // 6 letras
  { palavra: "TUCANO", exibicao: "Tucano", grupo: "frutas", dica: "Ave de bico grande e colorido que come frutos na copa das árvores." },
  { palavra: "CORUJA", exibicao: "Coruja", grupo: "rapina", dica: "Ave noturna com ótima visão e audição para caçar no escuro." },
  { palavra: "GAVIAO", exibicao: "Gavião", grupo: "rapina", dica: "Ave de rapina ágil que caça insetos, lagartos e pequenos animais." },
  { palavra: "TUIUIU", exibicao: "Tuiuiú", grupo: "agua", dica: "Ave símbolo do Pantanal que pesca em áreas alagadas." },
  { palavra: "GRALHA", exibicao: "Gralha", grupo: "frutas", dica: "Ave inteligente que vive em bandos e ajuda a espalhar sementes." },
  { palavra: "PARDAL", exibicao: "Pardal", grupo: "sementes", dica: "Pequena ave urbana muito comum que bica migalhas e sementes." },
  { palavra: "BICUDO", exibicao: "Bicudo", grupo: "sementes", dica: "Pássaro de bico robusto especializado em quebrar sementes duras." },
  { palavra: "FALCAO", exibicao: "Falcão", grupo: "rapina", dica: "Ave de rapina veloz conhecida por mergulhos rápidos no ar." },
  { palavra: "JABURU", exibicao: "Jaburu", grupo: "agua", dica: "Ave alta de pernas compridas que caça peixes e rãs na água." },
  // 7 letras
  { palavra: "PINGUIM", exibicao: "Pinguim", grupo: "agua", dica: "Ave marinha que não voa, mas nada muito bem atrás de peixes." },
  { palavra: "MARRECO", exibicao: "Marreco", grupo: "agua", dica: "Ave aquática parecida com o pato que vive em lagoas e banhados." },
  { palavra: "SERIEMA", exibicao: "Seriema", grupo: "rapina", dica: "Ave corredora de campos abertos que caça lagartos e serpentes." },
  { palavra: "CARCARA", exibicao: "Carcará", grupo: "rapina", dica: "Ave de rapina comum em campos e estradas de todo o Brasil." },
  { palavra: "CONCRIZ", exibicao: "Concriz", grupo: "frutas", dica: "Ave colorida da Caatinga que gosta de frutos, néctar e insetos." },
  { palavra: "AVOANTE", exibicao: "Avoante", grupo: "sementes", dica: "Ave que forma grandes bandos no Nordeste em busca de sementes." },
  { palavra: "CANARIO", exibicao: "Canário", grupo: "sementes", dica: "Pássaro amarelinho que come sementes de capim nos campos." },
  { palavra: "COLEIRO", exibicao: "Coleiro", grupo: "sementes", dica: "Pássaro pequeno que vive em áreas de capim comendo sementes." },
  { palavra: "CARDEAL", exibicao: "Cardeal", grupo: "sementes", dica: "Pássaro de topete vistoso que se alimenta de grãos e insetos." },
  { palavra: "SANHACO", exibicao: "Sanhaço", grupo: "frutas", dica: "Pássaro frequente em pomares que adora frutas macias." },
  { palavra: "MAITACA", exibicao: "Maitaca", grupo: "frutas", dica: "Ave verde barulhenta que voa em bandos atrás de frutos e sementes." }
];

function avaliarPalpiteTermo(palpite, alvo) {
  const res = Array(alvo.length).fill("errada");
  const restantes = {};
  for (let i = 0; i < alvo.length; i++) {
    if (palpite[i] === alvo[i]) res[i] = "certa";
    else restantes[alvo[i]] = (restantes[alvo[i]] || 0) + 1;
  }
  for (let i = 0; i < alvo.length; i++) {
    if (res[i] === "certa") continue;
    const ch = palpite[i];
    if (restantes[ch] > 0) {
      res[i] = "lugar";
      restantes[ch]--;
    }
  }
  return res;
}

function montarTermoAves(palco) {
  const MAX_TENTATIVAS = 6;
  let qtdPalavras = 1;
  let alvos = [];
  let tentativas = [];
  let atual = "";
  let encerrado = false;
  let tamanhoPalavra = 5;
  let dicasAbertas = [];
  let pesquisasAbertas = [];
  let listasPesquisa = [];

  const statusEl = el("p", { class: "contagem" });
  const feedbackEl = el("div", { class: "quiz-feedback" });
  const tabuleirosEl = el("div", { class: "termo-tabuleiros" });
  const tecladoEl = el("div", { class: "termo-teclado" });

  const selModo = el("select", {
    class: "jogo-select",
    "aria-label": "Quantidade de palavras no Termo das Aves",
    onchange: e => {
      qtdPalavras = Number(e.target.value);
      iniciar();
    }
  },
    el("option", { value: "1", text: "1 palavra (Clássico)", selected: true }),
    el("option", { value: "2", text: "2 palavras (Dueto)" }),
    el("option", { value: "3", text: "3 palavras (Trio)" }),
    el("option", { value: "4", text: "4 palavras (Quarteto)" })
  );

  const btnNovo = el("button", {
    class: "botao", type: "button", text: "Novo jogo", onclick: () => iniciar()
  });

  palco.replaceChildren(
    el("div", { class: "jogo-cabecalho" },
      el("div", {},
        el("h3", { text: "Termo das Aves" }),
        el("p", { class: "ajuda", text: "Descubra o nome das aves em até 6 tentativas! Use o botão 💡 Dica em cada quadro se precisar de ajuda." })
      )
    ),
    el("div", { class: "flappy-controles" },
      el("label", { class: "campo-detalhe" }, el("span", { text: "Modo" }), selModo),
      btnNovo
    ),
    statusEl,
    tabuleirosEl,
    feedbackEl,
    tecladoEl
  );

  function iniciar() {
    const tamanhos = [5, 6, 7];
    tamanhoPalavra = tamanhos[Math.floor(Math.random() * tamanhos.length)];
    const candidatas = embaralhar(TERMO_AVES.filter(a => a.palavra.length === tamanhoPalavra));
    alvos = candidatas.slice(0, qtdPalavras);
    tentativas = [];
    atual = "";
    encerrado = false;
    dicasAbertas = Array(qtdPalavras).fill(false);
    pesquisasAbertas = Array(qtdPalavras).fill(false);
    listasPesquisa = alvos.map(alvo => {
      const mesmoGrupo = embaralhar(TERMO_AVES.filter(a => a.grupo === alvo.grupo && a.palavra !== alvo.palavra));
      const extras = embaralhar(TERMO_AVES.filter(a => a.grupo !== alvo.grupo && a.palavra !== alvo.palavra));
      return embaralhar([alvo, ...mesmoGrupo, ...extras].slice(0, 10));
    });
    feedbackEl.replaceChildren();
    renderizar();
  }

  function estadoQuadros() {
    return alvos.map(alvo => {
      const idxAcerto = tentativas.findIndex(t => t === alvo.palavra);
      return {
        alvo,
        resolvido: idxAcerto !== -1,
        linhasAte: idxAcerto !== -1 ? idxAcerto + 1 : tentativas.length
      };
    });
  }

  function melhorEstadoTecla(letra, quadros) {
    const prioridade = { certa: 3, lugar: 2, errada: 1, "": 0 };
    let melhor = "";
    quadros.forEach(q => {
      const limite = q.resolvido ? q.linhasAte : tentativas.length;
      for (let i = 0; i < limite; i++) {
        const palpite = tentativas[i];
        const aval = avaliarPalpiteTermo(palpite, q.alvo.palavra);
        for (let c = 0; c < palpite.length; c++) {
          if (palpite[c] === letra && prioridade[aval[c]] > prioridade[melhor]) {
            melhor = aval[c];
          }
        }
      }
    });
    return melhor;
  }

  function renderizar() {
    const quadros = estadoQuadros();
    const todosResolvidos = quadros.every(q => q.resolvido);
    encerrado = todosResolvidos || tentativas.length >= MAX_TENTATIVAS;

    statusEl.textContent = `Tentativa ${Math.min(tentativas.length + (encerrado ? 0 : 1), MAX_TENTATIVAS)}/${MAX_TENTATIVAS} · ${tamanhoPalavra} letras · ${qtdPalavras} ${qtdPalavras === 1 ? "ave" : "aves"}`;
    tabuleirosEl.style.setProperty("--termo-cols", qtdPalavras === 1 ? 1 : 2);

    tabuleirosEl.replaceChildren(...quadros.map((q, qIdx) => {
      const linhas = [];
      for (let r = 0; r < MAX_TENTATIVAS; r++) {
        const celulas = [];
        const jaEnviada = r < q.linhasAte;
        const ehAtual = !encerrado && !q.resolvido && r === tentativas.length;
        const palavraLinha = jaEnviada ? tentativas[r] : (ehAtual ? atual : "");
        const aval = jaEnviada ? avaliarPalpiteTermo(palavraLinha, q.alvo.palavra) : null;

        for (let c = 0; c < tamanhoPalavra; c++) {
          const ch = palavraLinha[c] || "";
          const clsEstado = aval ? aval[c] : (ch ? "preenchida" : "");
          celulas.push(el("div", { class: `termo-celula ${clsEstado}`, text: ch }));
        }
        linhas.push(el("div", { class: "termo-linha" }, celulas));
      }

      const grade = el("div", { class: "termo-grade", style: `--termo-len:${tamanhoPalavra}` }, linhas);
      const btnDica = el("button", {
        type: "button",
        class: "termo-btn-dica",
        text: dicasAbertas[qIdx] ? "Ocultar dica" : "💡 Dica",
        onclick: () => {
          dicasAbertas[qIdx] = !dicasAbertas[qIdx];
          renderizar();
        }
      });

      const dicaBox = dicasAbertas[qIdx]
        ? el("div", { class: "termo-dica-txt" },
            el("span", { text: q.alvo.dica }),
            el("button", {
              type: "button",
              class: "termo-btn-pesquisar",
              text: pesquisasAbertas[qIdx] ? "Ocultar aves parecidas" : "🔍 Pesquisar aves com essa característica",
              onclick: () => {
                pesquisasAbertas[qIdx] = !pesquisasAbertas[qIdx];
                renderizar();
              }
            }),
            pesquisasAbertas[qIdx]
              ? el("div", { class: "termo-pesquisa-lista" },
                  listasPesquisa[qIdx].map(item => el("span", { class: "termo-pesquisa-chip", text: item.exibicao }))
                )
              : null
          )
        : null;

      return el("div", { class: `termo-quadro ${q.resolvido ? "resolvido" : ""}` },
        el("div", { class: "termo-quadro-topo" },
          el("span", { text: q.resolvido ? `✔ ${q.alvo.exibicao}` : `Ave ${qIdx + 1}` }),
          btnDica
        ),
        dicaBox,
        grade
      );
    }));

    const linhasTeclado = [
      "QWERTYUIOP".split(""),
      "ASDFGHJKL".split(""),
      ["ENTER", ..."ZXCVBNM".split(""), "⌫"]
    ];
    tecladoEl.replaceChildren(...linhasTeclado.map(linha =>
      el("div", { class: "termo-teclado-linha" }, linha.map(tecla => {
        const ehEspecial = tecla === "ENTER" || tecla === "⌫";
        const estado = ehEspecial ? "" : melhorEstadoTecla(tecla, quadros);
        return el("button", {
          type: "button",
          class: `termo-tecla ${ehEspecial ? "larga" : ""} ${estado}`,
          text: tecla,
          disabled: encerrado,
          onclick: () => processarTecla(tecla)
        });
      }))
    ));

    if (encerrado) {
      const nomes = alvos.map(a => a.exibicao).join(", ");
      feedbackEl.replaceChildren(
        el("p", {
          class: todosResolvidos ? "quiz-acerto" : "erro",
          text: todosResolvidos
            ? `🎉 Parabéns! Você acertou: ${nomes}!`
            : `Fim das 6 tentativas! As aves eram: ${nomes}.`
        })
      );
    } else {
      feedbackEl.replaceChildren();
    }
  }

  function processarTecla(tecla) {
    if (encerrado) return;
    if (tecla === "⌫" || tecla === "BACKSPACE") {
      if (atual.length > 0) {
        atual = atual.slice(0, -1);
        renderizar();
      }
      return;
    }
    if (tecla === "ENTER") {
      if (atual.length < tamanhoPalavra) {
        notificar(`Complete as ${tamanhoPalavra} letras antes de enviar!`);
        return;
      }
      tentativas.push(atual);
      atual = "";
      renderizar();
      return;
    }
    if (/^[A-Z]$/.test(tecla) && atual.length < tamanhoPalavra) {
      atual += tecla;
      renderizar();
    }
  }

  const aoTeclar = e => {
    if ($("painel-jogos").hidden || jogoAtual !== "termo") return;
    if (document.activeElement?.matches("input, select, textarea")) return;
    if (e.key === "Backspace") { e.preventDefault(); processarTecla("BACKSPACE"); return; }
    if (e.key === "Enter") { e.preventDefault(); processarTecla("ENTER"); return; }
    const l = e.key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (/^[A-Z]$/.test(l)) processarTecla(l);
  };
  document.addEventListener("keydown", aoTeclar);

  iniciar();
  return () => document.removeEventListener("keydown", aoTeclar);
}

