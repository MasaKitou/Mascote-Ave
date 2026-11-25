"use strict";

/* ================== CONFIGURAÇÃO ================== */
const WIKI_PT = "https://pt.wikipedia.org/w/api.php";
const WIKIDATA = "https://www.wikidata.org/w/api.php";

// Categorias da Wikipédia usadas no "catálogo completo".
// Se alguma não existir (ou tiver outro nome), o catálogo avisa: ajuste aqui.
const CATEGORIAS = {
  brasil: ["Aves do Brasil", "Aves endêmicas do Brasil"],
  norte: ["Aves do Norte do Brasil", "Aves da Amazônia"],
  nordeste: ["Aves do Nordeste do Brasil", "Aves da Caatinga"],
  "centro-oeste": ["Aves do Centro-Oeste do Brasil", "Aves do Cerrado", "Aves do Pantanal"],
  sudeste: ["Aves do Sudeste do Brasil", "Aves da Mata Atlântica"],
  sul: ["Aves do Sul do Brasil", "Aves da Mata Atlântica", "Aves dos Pampas"]
};

// Cada item: [nome popular, nome científico (plano B)].
// Se o artigo não existir na Wikipédia, o item é simplesmente ignorado.
const BR_DESTAQUES = [
  ["Arara-azul-grande", "Anodorhynchus hyacinthinus"],
  ["Arara-vermelha-grande", "Ara chloropterus"],
  ["Arara-canindé", "Ara ararauna"],
  ["Ararinha-azul", "Cyanopsitta spixii"],
  ["Arara-azul-de-lear", "Anodorhynchus leari"],
  ["Papagaio-verdadeiro", "Amazona aestiva"],
  ["Tucano-toco", "Ramphastos toco"],
  ["Tucano-de-bico-preto", "Ramphastos vitellinus"],
  ["Tuiuiú", "Jabiru mycteria"],
  ["Gavião-real", "Harpia harpyja"],
  ["Seriema", "Cariama cristata"],
  ["Carcará", "Caracara plancus"],
  ["Gavião-carijó", "Rupornis magnirostris"],
  ["Urubu-rei", "Sarcoramphus papa"],
  ["Coruja-buraqueira", "Athene cunicularia"],
  ["Ema", "Rhea americana"],
  ["Mutum-de-penacho", "Crax fasciolata"],
  ["Sabiá-laranjeira", "Turdus rufiventris"],
  ["Bem-te-vi", "Pitangus sulphuratus"],
  ["João-de-barro", "Furnarius rufus"],
  ["Quero-quero", "Vanellus chilensis"],
  ["Garça-branca-grande", "Ardea alba"],
  ["Colhereiro", "Platalea ajaja"],
  ["Guará", "Eudocimus ruber"],
  ["Beija-flor-tesoura", "Eupetomena macroura"],
  ["Cardeal-de-topete-vermelho", "Paroaria coronata"],
  ["Tiê-sangue", "Ramphocelus bresilius"],
  ["Saíra-sete-cores", "Tangara seledon"],
  ["Canário-da-terra", "Sicalis flaveola"],
  ["Sanhaço-cinzento", "Thraupis sayaca"],
  ["Gralha-azul", "Cyanocorax caeruleus"],
  ["Anu-preto", "Crotophaga ani"],
  ["Urubu-de-cabeça-preta", "Coragyps atratus"],
  ["Pica-pau-do-campo", "Colaptes campestris"],
  ["Uirapuru-verdadeiro", "Cyphorhinus arada"],
  ["Pinguim-de-magalhães", "Spheniscus magellanicus"]
];

const NE_DESTAQUES = [
  ["Ararinha-azul", "Cyanopsitta spixii"],
  ["Arara-azul-de-lear", "Anodorhynchus leari"],
  ["Soldadinho-do-araripe", "Antilophia bokermanni"],
  ["Galo-de-campina", "Paroaria dominicana"],
  ["Periquito-da-caatinga", "Eupsittula cactorum"],
  ["Carcará", "Caracara plancus"],
  ["Concriz", "Icterus jamacaii"],
  ["Pintassilgo-do-nordeste", "Spinus yarrellii"],
  ["Formigueiro-do-nordeste", "Formicivora iheringi"],
  ["Arapaçu-do-nordeste", "Xiphocolaptes falcirostris"],
  ["Maria-do-nordeste", "Hemitriccus mirandae"],
  ["Torom-do-nordeste", "Hylopezus ochroleucus"],
  ["Choca-do-nordeste", "Sakesphorus cristatus"],
  ["Maria-preta-do-nordeste", "Knipolegus franciscanus"],
  ["Bico-virado-da-caatinga", "Megaxenops parnaguae"],
  ["Chorozinho-da-caatinga", "Herpsilochmus sellowi"],
  ["Bacurauzinho-da-caatinga", "Caprimulgus hirundinaceus"],
  ["João-chique-chique", "Gyalophylax hellmayri"],
  ["Rabo-branco-de-cauda-larga", "Anopetia gounellei"],
  ["Jacupemba", "Penelope superciliaris"],
  ["Casaca-de-couro", "Pseudoseisura cristata"],
  ["Avoante", "Zenaida auriculata"],
  ["Asa-branca", "Patagioenas picazuro"],
  ["Seriema", "Cariama cristata"],
  ["Guará", "Eudocimus ruber"]
];

/* ================== UTILITÁRIOS ================== */
const $ = id => document.getElementById(id);

const REGEX_AVE = /(\baves?\b|psittac|passerif|trochil|tyrann|thraup|accipitr|falcon|strigi|columb|ardeid|picid|ramphast|furnari|thamnophil|cracid|rallid|anatid|larid|sulid|procellari)/i;
const REGEX_AVE_TEXTO = /(esp[eé]cie de (ave|aves|p[aá]ssaro)|g[eê]nero de aves|fam[ií]lia de aves|\bave\b d[aeo]s? )/i;
const REGEX_GRUPO_AVE = /(designa[cç][aã]o comum a|denomina[cç][aã]o comum a|g[eê]nero de aves|fam[ií]lia de aves|ordem de aves|subfam[ií]lia de aves|\b[a-zá-ú-]{2,}\s+s[aã]o aves (?:da|do|de)\b)/i;
const REGEX_NORDESTE = /(nordeste|caatinga|maranh[aã]o|piau[ií]|cear[aá]|rio grande do norte|para[ií]ba|pernambuco|alagoas|sergipe|bahia)/i;
const REGEX_BRASIL = /(brasil|brasileir|mata atl[aâ]ntica|cerrado|pantanal|amaz[oô]nia)/i;
const REGEX_REGIOES = {
  norte: /(regi[aã]o norte|norte do brasil|amaz[oô]nia|amaz[oô]nic|acre|amap[aá]|amazonas|par[aá]|rond[oô]nia|roraima|tocantins)/i,
  nordeste: REGEX_NORDESTE,
  "centro-oeste": /(centro[- ]oeste|mato grosso do sul|mato grosso|goi[aá]s|distrito federal|cerrado|pantanal)/i,
  sudeste: /(regi[aã]o sudeste|sudeste do brasil|minas gerais|esp[ií]rito santo|rio de janeiro|s[aã]o paulo|mata atl[aâ]ntica)/i,
  sul: /(regi[aã]o sul|sul do brasil|paran[aá]|santa catarina|rio grande do sul|pampas?|pampa)/i
};
const NOMES_REGIOES = {
  norte: "Norte", nordeste: "Nordeste", "centro-oeste": "Centro-Oeste", sudeste: "Sudeste", sul: "Sul"
};
const SECOES_IGNORADAS = /^(refer[eê]ncias?|notas?|bibliografia|liga[cç][oõ]es externas|links externos|ver tamb[eé]m|fontes?)$/i;

const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  filhos.flat().forEach(f => {
    if (f === null || f === undefined || f === false) return;
    n.append(f.nodeType ? f : document.createTextNode(String(f)));
  });
  return n;
}

async function wiki(params, base = WIKI_PT) {
  const url = new URL(base);
  const todos = { format: "json", formatversion: "2", origin: "*", maxlag: 5, ...params };
  Object.entries(todos).forEach(([k, v]) => url.searchParams.set(k, v));
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        if (tentativa < 2 && (resp.status === 429 || resp.status >= 500)) {
          await new Promise(resolve => setTimeout(resolve, 300 * (2 ** tentativa)));
          continue;
        }
        throw new Error("HTTP " + resp.status);
      }
      const dados = await resp.json();
      if (dados.error) {
        const erro = new Error((dados.error.code ? `[${dados.error.code}] ` : "") + (dados.error.info || "Erro na API"));
        if (tentativa < 2 && /maxlag|readonly|ratelimited|internal_api_error/i.test(dados.error.code || "")) {
          await new Promise(resolve => setTimeout(resolve, 300 * (2 ** tentativa)));
          continue;
        }
        throw erro;
      }
      return dados;
    } catch (erro) {
      if (tentativa < 2 && (erro instanceof TypeError || /network|failed to fetch/i.test(erro.message))) {
        await new Promise(resolve => setTimeout(resolve, 300 * (2 ** tentativa)));
        continue;
      }
      throw erro;
    }
  }
  throw new Error("A Wikipédia não respondeu após algumas tentativas.");
}

const semPrefixo = titulo => titulo.replace(/^[^:]+:/, "");
const resumoCurto = (t = "") => (t.length > 130 ? t.slice(0, 127).trim() + "…" : t);

// Aves já confirmadas (vindas das listas curadas) — ajudam a filtrar a busca
const conhecidosPorRegiao = Object.fromEntries(Object.keys(CATEGORIAS).map(chave => [chave, new Set()]));
const cache = Object.fromEntries(Object.keys(CATEGORIAS).map(chave => [chave, []]));
const preferenciaFavoritos = "avifauna-favoritos-v1";
let favoritos = new Set();
try { favoritos = new Set(JSON.parse(localStorage.getItem(preferenciaFavoritos) || "[]")); } catch (_) { favoritos = new Set(); }
const mostrarSoFavoritos = Object.fromEntries(Object.keys(CATEGORIAS).map(chave => [chave, false]));
let timerNotificacao;
const descoberta = {
  ...Object.fromEntries(Object.entries(CATEGORIAS).map(([chave, categorias]) => [chave, criarEstadoDescoberta(categorias)]))
};

function criarEstadoDescoberta(categorias) {
  return {
    fila: categorias.map(nome => ({ nome, continuar: null })),
    categoriasVistas: new Set(categorias.map(norm)),
    titulosVistos: new Set(),
    paginasVistas: new Set(),
    linksVistos: new Set(),
    pendentes: [],
    listaPagina: null,
    listaContinuacao: null,
    listaTerminou: false,
    carregando: false,
    terminou: false
  };
}
Object.values(descoberta).forEach(estado => { estado.listaPagina = "Lista de aves do Brasil"; });

function notificar(mensagem) {
  const caixa = $("notificacao");
  caixa.textContent = mensagem;
  caixa.classList.add("visivel");
  clearTimeout(timerNotificacao);
  timerNotificacao = setTimeout(() => caixa.classList.remove("visivel"), 2200);
}

function salvarFavoritos() {
  try { localStorage.setItem(preferenciaFavoritos, JSON.stringify([...favoritos])); }
  catch (_) { notificar("Não foi possível salvar os favoritos neste navegador."); }
}

/* ================== CARREGAR RESUMOS ================== */
async function carregarResumos(titulos, incluirCategorias = false) {
  const lotes = [];
  for (let i = 0; i < titulos.length; i += 20) lotes.push(titulos.slice(i, i + 20));

  const respostas = await Promise.all(lotes.map(lote => wiki({
    action: "query",
    prop: incluirCategorias ? "extracts|pageimages|categories|pageprops" : "extracts|pageimages|pageprops",
    ...(!incluirCategorias ? { exintro: 1 } : {}),
    explaintext: 1, exsentences: incluirCategorias ? 10 : 2, exlimit: "max",
    piprop: "thumbnail", pithumbsize: 360, pilimit: "max",
    ...(incluirCategorias ? { cllimit: "max", clshow: "!hidden" } : {}),
    redirects: 1,
    titles: lote.join("|")
  })));

  const resultado = new Map();
  respostas.forEach((d, i) => {
    const q = d.query || {};
    const normalizados = new Map((q.normalized || []).map(n => [n.from, n.to]));
    const redirecionados = new Map((q.redirects || []).map(r => [r.from, r.to]));
    const porTitulo = new Map((q.pages || []).filter(p => !p.missing && !p.invalid).map(p => [p.title, p]));
    lotes[i].forEach(t => {
      let x = normalizados.get(t) || t;
      x = redirecionados.get(x) || x;
      if (porTitulo.has(x)) resultado.set(t, porTitulo.get(x));
    });
  });
  return resultado;
}

async function resolverCurados(lista) {
  const nomes = [...new Set(lista.flat())];
  const mapa = await carregarResumos(nomes, true);
  const vistos = new Set();
  const saida = [];
  for (const entrada of lista) {
    // Resolve pelo binômio; só recorre ao nome popular se o artigo confirmar esse binômio.
    const cientifico = entrada.at(-1);
    const valido = pagina => pagina && pagina.pageprops?.disambiguation === undefined && ehAve(pagina);
    const p = valido(mapa.get(cientifico))
      ? mapa.get(cientifico)
      : entrada.slice(0, -1).map(nome => mapa.get(nome)).find(pagina =>
          valido(pagina) && norm(pagina.extract || "").includes(norm(cientifico)));
    if (p && !vistos.has(p.pageid)) {
      vistos.add(p.pageid);
      saida.push(p);
    }
  }
  return saida;
}

/* ================== CARDS E LISTAS ================== */
function criarCard(p) {
  const foto = p.thumbnail && p.thumbnail.source;
  const salvo = favoritos.has(norm(p.title));
  return el("article", { class: "card", "data-titulo": p.title },
    el("button", { class: "card-main", type: "button", "aria-label": `Ver detalhes de ${p.title}`, onclick: () => abrirAve(p.title) },
      foto ? el("img", { src: foto, alt: "", loading: "lazy" }) : el("div", { class: "sem-foto", text: "🐦", "aria-hidden": "true" }),
      el("div", { class: "card-corpo" },
        el("h3", { text: p.title }),
        el("p", { text: resumoCurto(p.extract) })
      ),
      el("div", { class: "card-cta", "aria-hidden": "true" }, el("span", { text: "Explorar espécie" }), el("span", { text: "↗" }))
    ),
    el("button", { class: "favoritar", type: "button", "aria-label": `${salvo ? "Remover dos" : "Adicionar aos"} favoritos: ${p.title}`, "aria-pressed": String(salvo), text: salvo ? "♥" : "♡", onclick: e => { e.stopPropagation(); alternarFavorito(p.title); } })
  );
}

function preencher(container, paginas, vazio = "Nenhuma ave encontrada.") {
  if (!paginas.length) {
    container.replaceChildren(el("p", { class: "aviso", text: vazio }));
    return;
  }
  container.replaceChildren(...paginas.map(criarCard));
}

async function carregarLista(chave, lista) {
  const container = $("lista-" + chave);
  container.replaceChildren(el("p", { class: "carregando", text: "Carregando aves…" }));
  try {
    const paginas = await resolverCurados(lista);
    const existentes = new Map(cache[chave].map(p => [p.pageid, p]));
    paginas.forEach(p => existentes.set(p.pageid, p));
    cache[chave] = [...existentes.values()];
    cache[chave].forEach(p => {
      const n = norm(p.title);
      descoberta[chave].titulosVistos.add(n);
      descoberta[chave].paginasVistas.add(p.pageid);
      conhecidosPorRegiao.brasil.add(n);
      if (chave !== "brasil") conhecidosPorRegiao[chave].add(n);
    });
    atualizarLista(chave);
  } catch (e) {
    container.replaceChildren(
      el("p", { class: "erro", text: "Não foi possível carregar a lista: " + e.message }),
      el("button", { class: "botao", type: "button", text: "Tentar de novo", onclick: () => carregarLista(chave, lista) })
    );
  }
}

function atualizarLista(chave) {
  const filtro = $("filtro-" + chave);
  const filtroNome = filtro ? norm(filtro.value) : "";
  const det = filtrosDetalhados[chave] || {};
  let paginas = cache[chave].filter(p => {
    if (filtroNome && !norm(p.title).includes(filtroNome)) return false;
    if (det.cor || det.regiao || det.subregiao || det.local || det.porte) {
      const meta = obterMetadadosAve(p);
      if (det.cor && !meta.cores.some(c => norm(c) === norm(det.cor))) return false;
      if (det.regiao && !meta.regioes.includes(det.regiao)) return false;
      if (det.subregiao && !meta.subregioes.some(s => norm(s) === norm(det.subregiao))) return false;
      if (det.porte && norm(meta.porte) !== norm(det.porte)) return false;
      if (det.local) {
        const q = norm(det.local);
        const textoLocais = norm([
          ...(meta.locais || []),
          ...(meta.subregioes || []),
          meta.habitat || "",
          p.extract || ""
        ].join(" "));
        if (!textoLocais.includes(q)) return false;
      }
    }
    return true;
  });
  if (mostrarSoFavoritos[chave]) paginas = paginas.filter(p => favoritos.has(norm(p.title)));
  const ordem = $("ordem-" + chave).value;
  if (ordem === "az") paginas.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  if (ordem === "za") paginas.sort((a, b) => b.title.localeCompare(a.title, "pt-BR"));
  $("contagem-" + chave).textContent = `${paginas.length} ${paginas.length === 1 ? "espécie" : "espécies"}`;
  preencher($("lista-" + chave), paginas, mostrarSoFavoritos[chave] ? "Você ainda não salvou favoritos nesta lista." : "Nenhuma ave combina com os filtros.");
}

function alternarFavorito(titulo) {
  const chave = norm(titulo);
  if (favoritos.has(chave)) {
    favoritos.delete(chave);
    notificar(`${titulo} removida dos favoritos`);
  } else {
    favoritos.add(chave);
    notificar(`${titulo} adicionada aos favoritos`);
  }
  salvarFavoritos();
  document.querySelectorAll(".card[data-titulo]").forEach(card => {
    const nome = card.dataset.titulo;
    const botao = card.querySelector(".favoritar");
    if (!botao || norm(nome) !== chave) return;
    const ativo = favoritos.has(chave);
    botao.textContent = ativo ? "♥" : "♡";
    botao.setAttribute("aria-pressed", String(ativo));
    botao.setAttribute("aria-label", `${ativo ? "Remover dos" : "Adicionar aos"} favoritos: ${nome}`);
  });
  Object.keys(CATEGORIAS).forEach(chave => {
    if (mostrarSoFavoritos[chave]) atualizarLista(chave);
  });
}

async function carregarMaisAves(chave) {
  const estado = descoberta[chave];
  const bloco = $("mais-" + chave);
  const mensagem = bloco.querySelector(".estado-paginacao");
  const botao = bloco.querySelector(".carregar-aves");
  if (estado.carregando || estado.terminou) return;

  estado.carregando = true;
  botao.disabled = true;
  botao.textContent = "Carregar mais aves";
  mensagem.textContent = "Buscando espécies nas categorias da Wikipédia…";
  const selecionados = estado.pendentes.splice(0, 20);
  let chamadas = 0;
  let ultimoErro = null;

  try {
    while (selecionados.length < 20 && chamadas < 3) {
      // A lista brasileira liga diretamente para os artigos das espécies.
      const priorizarCategoriasRegionais = chave !== "brasil" && estado.fila.length > 0;
      if (estado.listaPagina && !estado.listaTerminou && estado.pendentes.length === 0 && !priorizarCategoriasRegionais) {
        const parametrosLista = {
          action: "query", prop: "links", titles: estado.listaPagina,
          redirects: 1, plnamespace: 0, pllimit: 100
        };
        if (estado.listaContinuacao) parametrosLista.plcontinue = estado.listaContinuacao;
        const d = await wiki(parametrosLista);
        chamadas++;
        const paginaLista = (d.query?.pages || []).find(p => !p.missing && !p.invalid);
        (paginaLista?.links || []).forEach(link => {
          const chaveTitulo = norm(link.title);
          if (estado.linksVistos.has(chaveTitulo)) return;
          estado.linksVistos.add(chaveTitulo);
          estado.pendentes.push({ titulo: link.title, daLista: true });
        });
        estado.listaContinuacao = d.continue?.plcontinue || null;
        estado.listaTerminou = !estado.listaContinuacao || !paginaLista;
        if (!estado.listaTerminou || estado.pendentes.length) continue;
      }

      if (estado.pendentes.length) {
        while (selecionados.length < 20 && estado.pendentes.length) {
          const item = estado.pendentes.shift();
          const chaveTitulo = norm(item.titulo);
          if (estado.titulosVistos.has(chaveTitulo)) continue;
          estado.titulosVistos.add(chaveTitulo);
          selecionados.push(item);
        }
        continue;
      }

      // As categorias cobrem artigos que não estejam ligados na lista geral.
      const usarCategorias = !estado.listaPagina || estado.listaTerminou || (chave !== "brasil" && estado.fila.length > 0);
      if (!usarCategorias || !estado.fila.length) break;
      const categoria = estado.fila.shift();
      const parametros = {
        action: "query", list: "categorymembers",
        cmtitle: "Categoria:" + categoria.nome,
        cmtype: "page|subcat", cmlimit: 25, cmprop: "title|type"
      };
      if (categoria.continuar) parametros.cmcontinue = categoria.continuar;

      try {
        const d = await wiki(parametros);
        chamadas++;
        const itens = d.query?.categorymembers || [];
        const continua = d.continue?.cmcontinue;
        if (continua) estado.fila.unshift({ nome: categoria.nome, continuar: continua });

        itens.forEach(item => {
          if (item.type === "subcat") {
            const nome = semPrefixo(item.title);
            const chaveCategoria = norm(nome);
            if (!estado.categoriasVistas.has(chaveCategoria)) {
              estado.categoriasVistas.add(chaveCategoria);
              estado.fila.push({ nome, continuar: null });
            }
            return;
          }
          estado.pendentes.push({ titulo: item.title, daLista: false });
        });
      } catch (erroCategoria) {
        chamadas++;
        ultimoErro = erroCategoria;
        if (/invalid category|cminvalidcategory|category does not exist/i.test(erroCategoria.message)) continue;
        estado.fila.unshift(categoria);
        break;
      }
    }

    if (selecionados.length) {
      let mapa;
      try {
        mapa = await carregarResumos(selecionados.map(item => item.titulo), true);
      } catch (erroResumo) {
        estado.pendentes.unshift(...selecionados);
        selecionados.forEach(item => estado.titulosVistos.delete(norm(item.titulo)));
        throw erroResumo;
      }
      const novas = [];
      selecionados.forEach(item => {
        const pagina = mapa.get(item.titulo);
        if (!pagina || estado.paginasVistas.has(pagina.pageid)) return;
        if (!ehAve(pagina)) return;
        // Categorias amplas podem conter aves sem ocorrência confirmada no país.
        if (!item.daLista && chave === "brasil" && !ehBrasileira(pagina)) return;
        if (chave !== "brasil" && !ehDaRegiao(pagina, chave)) return;
        estado.paginasVistas.add(pagina.pageid);
        estado.titulosVistos.add(norm(pagina.title));
        novas.push(pagina);
        conhecidosPorRegiao.brasil.add(norm(pagina.title));
        if (chave === "brasil" || ehDaRegiao(pagina, chave)) conhecidosPorRegiao[chave].add(norm(pagina.title));
      });
      cache[chave].push(...novas);

      const filtro = $("filtro-" + chave);
      const filtroNome = filtro ? norm(filtro.value) : "";
      const det = filtrosDetalhados[chave] || {};
      const temDetalhado = Boolean(det.cor || det.regiao || det.subregiao || det.local || det.porte);
      const podeAcrescentar = $("ordem-" + chave).value === "original"
        && !mostrarSoFavoritos[chave] && !filtroNome && !temDetalhado;
      if (podeAcrescentar) {
        const grade = $("lista-" + chave);
        const vazia = grade.querySelector(".aviso");
        if (vazia) grade.replaceChildren();
        novas.forEach(pagina => grade.append(criarCard(pagina)));
        $("contagem-" + chave).textContent = `${cache[chave].length} espécies carregadas`;
      } else {
        atualizarLista(chave);
      }
      mensagem.textContent = novas.length
        ? `Mais ${novas.length} ${novas.length === 1 ? "espécie carregada" : "espécies carregadas"}. Continue descendo para explorar.`
        : `Este lote não trouxe aves com distribuição ${chave === "brasil" ? "brasileira" : `na região ${NOMES_REGIOES[chave]}`} identificada. Continue buscando; ${estado.titulosVistos.size} artigos verificados.`;
    }

    const listaTerminou = !estado.listaPagina || (estado.listaTerminou && !estado.pendentes.length);
    if (listaTerminou && !estado.fila.length) {
      estado.terminou = true;
      botao.hidden = true;
      mensagem.textContent = cache[chave].length
        ? `Fim das categorias encontradas. ${cache[chave].length} espécies carregadas.`
        : "Não encontrei categorias de aves disponíveis agora. Tente novamente mais tarde.";
    } else if (!selecionados.length && ultimoErro) {
      mensagem.textContent = "A Wikipédia não respondeu agora. Toque em “Tentar novamente”.";
      botao.textContent = "Tentar novamente";
    }
  } catch (erro) {
    mensagem.textContent = "Não foi possível carregar mais aves. Toque em “Tentar novamente”.";
    botao.textContent = "Tentar novamente";
  } finally {
    estado.carregando = false;
    botao.disabled = false;
    if (!estado.terminou) botao.hidden = false;
  }
}

document.querySelectorAll(".paginacao").forEach(bloco => {
  const chave = bloco.dataset.regiao;
  bloco.querySelector(".carregar-aves").addEventListener("click", () => carregarMaisAves(chave));
});

if ("IntersectionObserver" in window) {
  const observadorAves = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) carregarMaisAves(entrada.target.dataset.regiao);
    });
  }, { rootMargin: "500px 0px" });
  document.querySelectorAll(".paginacao").forEach(bloco => observadorAves.observe(bloco));
}

/* ================== FILTROS DETALHADOS ================== */
const filtrosDetalhados = Object.fromEntries(Object.keys(CATEGORIAS).map(chave => [chave, {
  cor: "", regiao: "", subregiao: "", local: "", porte: ""
}]));

const OPCOES_CORES = ["Azul", "Vermelho", "Amarelo", "Verde", "Preto", "Branco", "Cinza", "Marrom", "Laranja", "Rosa"];
const OPCOES_SUBREGIOES = ["Amazônia", "Caatinga", "Cerrado", "Pantanal", "Mata Atlântica", "Pampas", "Litoral"];
const OPCOES_PORTES = ["Pequeno", "Médio", "Grande"];

function montarFiltrosDetalhados(chave) {
  const inputSimples = $("filtro-" + chave);
  if (!inputSimples) return;

  const estado = filtrosDetalhados[chave];
  const envoltorio = el("div", { class: "filtro-envoltorio" });
  inputSimples.parentNode.insertBefore(envoltorio, inputSimples);

  const linhaSimples = el("div", { class: "filtro-linha" });
  envoltorio.append(linhaSimples);
  linhaSimples.append(inputSimples);

  const painelDet = el("div", { class: "filtro-detalhado", id: `filtro-det-${chave}`, hidden: true });
  const btnToggle = el("button", {
    class: "btn-filtro-detalhado",
    type: "button",
    "aria-expanded": "false",
    "aria-controls": `filtro-det-${chave}`,
    text: "⚙ Filtros detalhados",
    onclick: () => {
      const aberto = !painelDet.hidden;
      painelDet.hidden = aberto;
      btnToggle.setAttribute("aria-expanded", String(!aberto));
      btnToggle.classList.toggle("ativo", !aberto);
    }
  });
  linhaSimples.append(btnToggle);

  const atualizarBadge = () => {
    const ativos = Object.values(estado).filter(Boolean).length;
    btnToggle.textContent = ativos ? `⚙ Filtros detalhados (${ativos})` : "⚙ Filtros detalhados";
  };

  const criarSelect = (label, opcoes, prop, placeholder) => {
    const sel = el("select", {
      "aria-label": label,
      onchange: e => { estado[prop] = e.target.value; atualizarBadge(); atualizarLista(chave); }
    },
      el("option", { value: "", text: placeholder }),
      ...opcoes.map(op => typeof op === "string"
        ? el("option", { value: op, text: op })
        : el("option", { value: op.valor, text: op.rotulo }))
    );
    return el("label", { class: "campo-detalhe" }, el("span", { text: label }), sel);
  };

  const selCor = criarSelect("Cor", OPCOES_CORES, "cor", "Todas as cores");
  const selRegiao = criarSelect("Região", Object.entries(NOMES_REGIOES).map(([valor, rotulo]) => ({ valor, rotulo })), "regiao", "Todas as regiões");
  const selSub = criarSelect("Sub-região / Bioma", OPCOES_SUBREGIOES, "subregiao", "Todas as sub-regiões");
  const selPorte = criarSelect("Porte", OPCOES_PORTES, "porte", "Todos os portes");

  const inputLocal = el("input", {
    type: "search",
    placeholder: "Ex.: Bahia, Pantanal, Serra…",
    "aria-label": "Local, estado ou bioma",
    oninput: e => { estado.local = e.target.value.trim(); atualizarBadge(); atualizarLista(chave); }
  });
  const campoLocal = el("label", { class: "campo-detalhe" }, el("span", { text: "Local / Estado" }), inputLocal);

  const btnLimpar = el("button", {
    class: "chip",
    type: "button",
    text: "Limpar filtros",
    onclick: () => {
      Object.keys(estado).forEach(k => { estado[k] = ""; });
      painelDet.querySelectorAll("select").forEach(s => { s.value = ""; });
      inputLocal.value = "";
      inputSimples.value = "";
      atualizarBadge();
      atualizarLista(chave);
    }
  });

  painelDet.append(
    el("div", { class: "filtro-detalhado-grade" }, selCor, selRegiao, selSub, selPorte, campoLocal),
    el("div", { class: "filtro-detalhado-rodape" }, btnLimpar)
  );
  envoltorio.append(painelDet);
}

/* ================== ABAS ================== */
function mostrarAba(nome) {
  document.querySelectorAll(".aba").forEach(b => b.setAttribute("aria-selected", String(b.dataset.aba === nome)));
  document.querySelectorAll(".painel").forEach(p => { p.hidden = p.id !== "painel-" + nome; });
  if (nome !== "jogos" && nome !== "desafio" && typeof window.pararSomJogo === "function") window.pararSomJogo();
  if (nome === "comparador") renderizarComparador();
  if (nome === "jogos" && typeof window.iniciarAbaJogos === "function") window.iniciarAbaJogos();
  if (nome === "desafio" && typeof window.iniciarAbaDesafio === "function") window.iniciarAbaDesafio();
}
document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => mostrarAba(b.dataset.aba)));

for (const chave of Object.keys(CATEGORIAS)) {
  montarFiltrosDetalhados(chave);
  const filtro = $("filtro-" + chave);
  if (filtro) filtro.addEventListener("input", () => atualizarLista(chave));
  $("ordem-" + chave).addEventListener("change", () => atualizarLista(chave));
  document.querySelector(`[data-favoritos="${chave}"]`).addEventListener("click", e => {
    mostrarSoFavoritos[chave] = !mostrarSoFavoritos[chave];
    e.currentTarget.setAttribute("aria-pressed", String(mostrarSoFavoritos[chave]));
    e.currentTarget.innerHTML = mostrarSoFavoritos[chave] ? "♥ Favoritos" : "♡ Favoritos";
    atualizarLista(chave);
  });
}

/* ================== BUSCA ================== */
const categoriasDe = p => (p.categories || []).map(c => semPrefixo(c.title));

function ehAve(p) {
  if (p.pageprops?.disambiguation !== undefined) return false;
  if (REGEX_GRUPO_AVE.test(p.extract || "")) return false;
  const cats = categoriasDe(p);
  return cats.some(c => REGEX_AVE.test(c)) || REGEX_AVE_TEXTO.test(p.extract || "") || /\baves?\b|\bp[aá]ssaros?\b/i.test(p.extract || "");
}

function ehBrasileira(p) {
  const texto = `${categoriasDe(p).join(" | ")} | ${p.extract || ""}`;
  return conhecidosPorRegiao.brasil.has(norm(p.title)) || REGEX_BRASIL.test(texto) || REGEX_NORDESTE.test(texto);
}

function ehDaRegiao(p, regiao) {
  const texto = `${categoriasDe(p).join(" | ")} | ${p.extract || ""}`;
  return conhecidosPorRegiao[regiao]?.has(norm(p.title)) || Boolean(REGEX_REGIOES[regiao]?.test(texto));
}

async function buscarNaWikipedia(termo) {
  const base = {
    action: "query", generator: "search", gsrnamespace: 0, gsrlimit: 20,
    prop: "extracts|pageimages|categories|pageprops",
    exintro: 1, explaintext: 1, exsentences: 2, exlimit: "max",
    piprop: "thumbnail", pithumbsize: 360, pilimit: "max",
    cllimit: "max", clshow: "!hidden"
  };
  const respostas = await Promise.allSettled([
    wiki({
      action: "query", prop: "extracts|pageimages|categories|pageprops",
      exintro: 1, explaintext: 1, exsentences: 4, exlimit: "max",
      piprop: "thumbnail", pithumbsize: 360,
      cllimit: "max", clshow: "!hidden", redirects: 1, titles: termo
    }),
    wiki({ ...base, gsrsearch: termo }),
    wiki({ ...base, gsrsearch: termo + " ave" }),
    wiki({ ...base, gsrsearch: termo + " Brasil" })
  ]);
  if (respostas.every(r => r.status === "rejected")) throw respostas[0].reason;

  const mapa = new Map();
  const paginasExatas = respostas[0].status === "fulfilled" ? respostas[0].value.query?.pages || [] : [];
  paginasExatas.filter(p => !p.missing && !p.invalid).forEach(p => {
    p.correspondenciaExata = true;
    mapa.set(p.pageid, p);
  });
  respostas.slice(1).filter(r => r.status === "fulfilled").forEach(r => {
    (r.value.query?.pages || []).forEach(p => { if (!p.missing && !p.invalid && !mapa.has(p.pageid)) mapa.set(p.pageid, p); });
  });
  return [...mapa.values()].sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
}

$("form-busca").addEventListener("submit", async e => {
  e.preventDefault();
  const termo = $("campo-busca").value.trim();
  const escopo = $("escopo").value;
  if (termo.length < 2) return;

  $("aba-busca").hidden = false;
  mostrarAba("busca");
  $("titulo-busca").textContent = `Resultados para “${termo}”`;
  $("nota-busca").textContent = escopo === "brasil"
    ? "Buscando aves com categorias e registros relacionados ao Brasil."
    : `Buscando aves com registros na região ${NOMES_REGIOES[escopo]}.`;
  const lista = $("lista-busca");
  $("contagem-busca").textContent = "";
  lista.replaceChildren(el("p", { class: "carregando", text: "Buscando…" }));

  try {
    // 1) correspondências nas listas curadas (rápido e preciso)
    const t = norm(termo);
    const locais = (escopo === "brasil" ? cache.brasil.concat(...Object.keys(CATEGORIAS).filter(k => k !== "brasil").map(k => cache[k])) : cache[escopo] || [])
      .filter(p => norm(p.title).includes(t));

    // 2) busca na Wikipédia, filtrando só aves brasileiras
    const remotos = (await buscarNaWikipedia(termo))
      .filter(p => ehAve(p) && ehBrasileira(p)
        && (escopo === "brasil" || ehDaRegiao(p, escopo) || (p.correspondenciaExata && conhecidosPorRegiao[escopo]?.has(norm(p.title)))));

    const vistos = new Set();
    const todos = [...locais, ...remotos].filter(p => !vistos.has(p.pageid) && vistos.add(p.pageid));
    $("contagem-busca").textContent = `${todos.length} ${todos.length === 1 ? "espécie encontrada" : "espécies encontradas"}`;
    preencher(lista, todos, "Nenhuma ave brasileira encontrada com esse nome. Tente outro nome popular ou o nome científico.");
  } catch (err) {
    $("contagem-busca").textContent = "";
    lista.replaceChildren(el("p", { class: "erro", text: "Erro na busca: " + err.message }));
  }
});

/* ================== DETALHE DA AVE ================== */
function dividirSecoes(texto) {
  const re = /^(={2,6})\s*(.+?)\s*\1\s*$/gm;
  const partes = [];
  let ultimo = 0, titulo = "Introdução", nivel = 1, m;
  while ((m = re.exec(texto)) !== null) {
    partes.push({ titulo, nivel, corpo: texto.slice(ultimo, m.index).trim() });
    titulo = m[2];
    nivel = m[1].length - 1;
    ultimo = re.lastIndex;
  }
  partes.push({ titulo, nivel, corpo: texto.slice(ultimo).trim() });
  return partes.filter(p => p.corpo);
}

const REGEX_IMAGEM_IGNORADA = /(logo|icon|symbol|ambox|question_book|edit-|padlock|nuvola|folder|crystal|wik[it]|commons-|iucn|animal[_ ]diversity|for[_ ]thumbnail|portal|tree[_ ]of[_ ]life|flag[_ ]of|bandeira|coat[_ ]of[_ ]arms|bras[aã]o|red[_ ]pencil|disambig|esbo[cç]o|stub|loudspeaker|speaker|gnome-|gtk-|freedesktop|open[_ ]book|emblem|badge|featured|good[_ ]article|placeholder|no[_ ]image|sem[_ ]imagem)/i;

async function carregarImagens(titulo) {
  const d = await wiki({
    action: "query", generator: "images", titles: titulo, gimlimit: 50,
    prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: 480,
    iiextmetadatafilter: "LicenseShortName"
  });
  return (d.query?.pages || [])
    .filter(p => p.imageinfo && p.imageinfo[0])
    .filter(p => {
      const t = p.title;
      const i = p.imageinfo[0];
      const ehSvgMapa = /\.svg$/i.test(t) && /(map|mapa|range|distrib)/i.test(t);
      const extOk = /\.(jpe?g|png|webp)$/i.test(t) || ehSvgMapa;
      if (!extOk || REGEX_IMAGEM_IGNORADA.test(t)) return false;
      if (!ehSvgMapa && i.width && i.height) {
        if (i.width < 150 || i.height < 150) return false;
        const razao = i.width / i.height;
        if (razao > 3.5 || razao < 0.28) return false;
      }
      return true;
    })
    .map(p => {
      const i = p.imageinfo[0];
      return {
        titulo: semPrefixo(p.title).replace(/\.[a-z]+$/i, "").replace(/_/g, " "),
        miniatura: i.thumburl || i.url,
        pagina: i.descriptionurl,
        licenca: (i.extmetadata && i.extmetadata.LicenseShortName && i.extmetadata.LicenseShortName.value) || ""
      };
    });
}

async function carregarWikidata(qid) {
  if (!qid) return null;
  const d = await wiki({ action: "wbgetentities", ids: qid, props: "claims|sitelinks", languages: "pt|en" }, WIKIDATA);
  const ent = d.entities && d.entities[qid];
  if (!ent) return null;
  const claims = ent.claims || {};
  const valores = prop => (claims[prop] || []).map(c => c.mainsnak?.datavalue?.value).filter(v => v !== undefined);

  const cientifico = valores("P225")[0];
  const populares = valores("P1843").filter(v => /^pt/.test(v.language)).map(v => v.text);
  const audio = valores("P51")[0] || null;
  const enTitle = ent.sitelinks?.enwiki?.title || null;
  const statusId = valores("P141")[0]?.id;
  let status = null;
  if (statusId) {
    const s = await wiki({ action: "wbgetentities", ids: statusId, props: "labels", languages: "pt|en" }, WIKIDATA);
    const rotulos = s.entities?.[statusId]?.labels;
    status = rotulos?.pt?.value || rotulos?.en?.value || null;
  }
  return { cientifico, populares: [...new Set(populares)], status, audio, enTitle };
}

let tokenAbertura = 0;
let elementoQueAbriuDetalhe = null;

async function abrirAve(titulo) {
  const meu = ++tokenAbertura;
  const conteudo = $("detalhe-conteudo");
  if ($("detalhe").hidden) elementoQueAbriuDetalhe = document.activeElement;
  $("detalhe").hidden = false;
  document.body.classList.add("sem-rolagem");
  $("fechar").focus();
  conteudo.replaceChildren(el("p", { class: "carregando", text: "Carregando informações da Wikipédia…" }));

  try {
    const d = await wiki({
      action: "query",
      prop: "extracts|pageimages|pageprops|categories|info",
      explaintext: 1, exsectionformat: "wiki",
      piprop: "thumbnail", pithumbsize: 900,
      ppprop: "wikibase_item",
      cllimit: "max", clshow: "!hidden",
      inprop: "url", redirects: 1,
      titles: titulo
    });
    const p = (d.query?.pages || [])[0];
    if (!p || p.missing) throw new Error("Artigo não encontrado.");

    const [imagens, wd] = await Promise.all([
      carregarImagens(p.title).catch(() => []),
      carregarWikidata(p.pageprops && p.pageprops.wikibase_item).catch(() => null)
    ]);
    if (meu !== tokenAbertura) return; // o usuário abriu outra ave nesse meio-tempo
    renderizarDetalhe(conteudo, p, imagens, wd);
  } catch (e) {
    if (meu !== tokenAbertura) return;
    conteudo.replaceChildren(
      el("p", { class: "erro", text: "Não foi possível carregar: " + e.message }),
      el("button", { class: "botao", type: "button", text: "Tentar de novo", onclick: () => abrirAve(titulo) })
    );
  }
}

function renderizarDetalhe(c, p, imagens, wd) {
  const cats = categoriasDe(p);
  const meta = obterMetadadosAve(p);
  const ficha = [];
  if (wd?.cientifico) ficha.push(["Nome científico", el("em", { text: wd.cientifico })]);
  if (wd?.populares.length) ficha.push(["Nomes populares", wd.populares.join(", ")]);
  if (wd?.status) ficha.push(["Estado de conservação", wd.status]);
  if (meta.porte) ficha.push(["Porte", meta.porte]);
  if (meta.cores?.length) ficha.push(["Cores", meta.cores.join(", ")]);
  if (meta.subregioes?.length) ficha.push(["Sub-regiões / Biomas", meta.subregioes.join(", ")]);

  const blocoSom = el("div", { class: "som-ave" },
    el("span", { class: "som-titulo", text: "🔊 Canto da ave" }),
    el("span", { class: "som-estado", text: "Verificando gravação disponível…" })
  );

  buscarSomAve(p.title, wd).then(som => {
    if (!blocoSom.isConnected) return;
    if (!som) {
      blocoSom.replaceChildren(
        el("span", { class: "som-titulo", text: "🔊 Canto da ave" }),
        el("span", { class: "som-indisponivel", text: "Gravação de canto não disponível para esta espécie." })
      );
      return;
    }
    const audioEl = el("audio", { controls: true, preload: "none", src: som.url });
    blocoSom.replaceChildren(
      el("div", { class: "som-cabecalho" },
        el("span", { class: "som-titulo", text: "🔊 Canto da ave" }),
        el("a", { href: som.fonte, target: "_blank", rel: "noopener", class: "som-fonte", text: `${som.arquivo} (${som.licenca})` })
      ),
      audioEl
    );
  });

  const secoes = dividirSecoes(p.extract || "").filter(s => !SECOES_IGNORADAS.test(s.titulo));
  const blocoSecoes = el("div", { class: "secoes" });
  secoes.forEach((s, i) => {
    const det = el("details", { class: "secao nivel-" + Math.min(s.nivel, 3) }, el("summary", { text: s.titulo }));
    if (i === 0) det.open = true;
    s.corpo.split(/\n+/).map(t => t.trim()).filter(Boolean).forEach(t => det.append(el("p", { text: t })));
    blocoSecoes.append(det);
  });

  const foto = p.thumbnail && p.thumbnail.source;
  const urlHistorico = `https://pt.wikipedia.org/w/index.php?title=${encodeURIComponent(p.title)}&action=history`;

  c.replaceChildren(
    el("h2", { id: "titulo-detalhe", text: p.title }),
    wd?.cientifico ? el("p", { class: "cientifico", text: wd.cientifico }) : null,
    foto ? el("img", { class: "foto-principal", src: foto, alt: p.title }) : null,
    blocoSom,

    ficha.length
      ? el("div", { class: "ficha" }, el("dl", {}, ficha.map(([k, v]) => [el("dt", { text: k }), el("dd", {}, v)]).flat()))
      : null,

    el("div", { class: "acoes" },
      el("button", {
        class: "chip ativo", type: "button", text: "⚖️ Comparar esta ave",
        onclick: () => { fecharDetalhe(); irParaComparador(p.title); }
      }),
      ...(secoes.length ? [
        el("button", { class: "chip", type: "button", text: "Expandir tudo", onclick: () => blocoSecoes.querySelectorAll("details").forEach(x => { x.open = true; }) }),
        el("button", { class: "chip", type: "button", text: "Recolher tudo", onclick: () => blocoSecoes.querySelectorAll("details").forEach(x => { x.open = false; }) })
      ] : [])
    ),
    secoes.length ? blocoSecoes : el("p", { class: "aviso", text: "Este artigo ainda não tem texto na Wikipédia." }),

    imagens.length
      ? el("div", {},
          el("h3", { text: "Imagens" }),
          el("div", { class: "galeria" }, imagens.map(i =>
            el("figure", {},
              el("img", { src: i.miniatura, alt: i.titulo, loading: "lazy" }),
              el("figcaption", { text: i.licenca ? `${i.titulo} (${i.licenca})` : i.titulo })))))
      : null,

    cats.length
      ? el("div", {}, el("h3", { text: "Categorias na Wikipédia" }), el("div", { class: "chips" }, cats.map(n => el("span", { class: "chip", text: n }))))
      : null,

    el("p", { class: "atribuicao" },
      "Texto da Wikipédia em português, licença CC BY-SA 4.0. ",
      el("a", { href: p.fullurl, target: "_blank", rel: "noopener", text: "Ver artigo original" }), " · ",
      el("a", { href: urlHistorico, target: "_blank", rel: "noopener", text: "Histórico e autores" }),
      ". Imagens via Wikimedia Commons.")
  );

  $("detalhe").scrollTop = 0;
}

function fecharDetalhe() {
  tokenAbertura++;
  $("detalhe").hidden = true;
  document.body.classList.remove("sem-rolagem");
  if (elementoQueAbriuDetalhe?.isConnected) elementoQueAbriuDetalhe.focus();
  elementoQueAbriuDetalhe = null;
}
$("fechar").addEventListener("click", fecharDetalhe);
$("detalhe").addEventListener("click", e => { if (e.target === $("detalhe")) fecharDetalhe(); });
document.addEventListener("keydown", e => {
  if ($("detalhe").hidden) return;
  if (e.key === "Escape") fecharDetalhe();
  if (e.key === "Tab") {
    const focaveis = [...$("detalhe").querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')];
    if (!focaveis.length) return;
    const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  }
});

document.addEventListener("keydown", e => {
  if (!$("detalhe").hidden) return;
  const digitando = e.target.matches("input, textarea, select, [contenteditable='true']");
  if ((e.key === "/" && !digitando) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
    e.preventDefault();
    $("campo-busca").focus();
  }
  if (e.key === "Escape" && e.target === $("campo-busca")) {
    $("campo-busca").value = "";
    $("campo-busca").blur();
  }
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const abaAtual = document.activeElement.closest?.(".aba");
    if (!abaAtual) return;
    const abasVisiveis = [...document.querySelectorAll(".aba:not([hidden])")];
    const indice = abasVisiveis.indexOf(abaAtual);
    const passo = e.key === "ArrowRight" ? 1 : -1;
    const proxima = abasVisiveis[(indice + passo + abasVisiveis.length) % abasVisiveis.length];
    e.preventDefault();
    proxima.focus();
    proxima.click();
  }
});

const botaoTopo = $("voltar-topo");
function atualizarBotaoTopo() { botaoTopo.classList.toggle("visivel", window.scrollY > 420); }
window.addEventListener("scroll", atualizarBotaoTopo, { passive: true });
botaoTopo.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ================== CATÁLOGO POR CATEGORIA ================== */
function criarCatalogo(corpo, raizes) {
  const estado = { pilha: [], cont: null };
  const botoesRaiz = el("div", { class: "chips" });
  const trilha = el("div", { class: "trilha" });
  const subs = el("div", { class: "chips" });
  const grade = el("div", { class: "grade" });
  const msg = el("p", { class: "aviso" });
  const mais = el("button", { class: "botao", type: "button", text: "Carregar mais", hidden: true, onclick: () => carregarMais() });
  corpo.append(botoesRaiz, trilha, subs, grade, msg, mais);

  function atualizarTrilha() {
    trilha.replaceChildren(...estado.pilha.map((nome, i) =>
      el("button", {
        class: "chip" + (i === estado.pilha.length - 1 ? " ativo" : ""),
        type: "button", text: nome,
        onclick: () => abrir(estado.pilha.slice(0, i + 1))
      })));
  }

  async function abrir(pilha) {
    estado.pilha = pilha;
    estado.cont = null;
    grade.replaceChildren();
    subs.replaceChildren();
    atualizarTrilha();
    await carregarMais();
  }

  async function carregarMais() {
    const nome = estado.pilha[estado.pilha.length - 1];
    mais.hidden = true;
    msg.textContent = "Carregando…";
    try {
      const params = {
        action: "query", list: "categorymembers",
        cmtitle: "Categoria:" + nome, cmtype: "subcat|page", cmlimit: 40, cmprop: "title|type"
      };
      if (estado.cont) params.cmcontinue = estado.cont;
      const d = await wiki(params);
      const itens = d.query?.categorymembers || [];
      estado.cont = d.continue?.cmcontinue || null;

      itens.filter(i => i.type === "subcat").forEach(s => {
        const n = semPrefixo(s.title);
        subs.append(el("button", { class: "chip", type: "button", text: n, onclick: () => abrir([...estado.pilha, n]) }));
      });

      const titulos = itens.filter(i => i.type === "page").map(i => i.title);
      if (titulos.length) {
        const mapa = await carregarResumos(titulos);
        titulos.forEach(t => { const p = mapa.get(t); if (p) grade.append(criarCard(p)); });
      }

      msg.textContent = (!grade.children.length && !subs.children.length)
        ? `Nada encontrado em “${nome}”. O nome dessa categoria pode ser outro na Wikipédia (ajuste CATEGORIAS no app.js).`
        : "";
      mais.hidden = !estado.cont;
    } catch (e) {
      msg.textContent = "Erro ao carregar o catálogo: " + e.message;
    }
  }

  raizes.forEach(r => botoesRaiz.append(el("button", { class: "chip", type: "button", text: r, onclick: () => abrir([r]) })));
  let aberto = false;
  return () => { if (!aberto) { aberto = true; abrir([raizes[0]]); } };
}

function ligarCatalogo(idDetails, raizes) {
  const det = $(idDetails);
  const iniciar = criarCatalogo(det.querySelector(".catalogo-corpo"), raizes);
  det.addEventListener("toggle", () => { if (det.open) iniciar(); });
}

/* ================== COMPARADOR E UTILITÁRIOS GLOBAIS ================== */
function obterTodasAvesCarregadas() {
  const mapa = new Map();
  Object.values(cache).flat().forEach(p => {
    if (p && p.title && !mapa.has(norm(p.title))) mapa.set(norm(p.title), p);
  });
  return [...mapa.values()].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

const comparadorSelecao = { a: "", b: "" };

function irParaComparador(titulo) {
  if (!comparadorSelecao.a || comparadorSelecao.a === titulo) comparadorSelecao.a = titulo;
  else comparadorSelecao.b = titulo;
  mostrarAba("comparador");
  notificar(`${titulo} selecionada no Comparador`);
}

function renderizarComparador() {
  const controles = $("comparador-controles");
  const resultado = $("comparador-resultado");
  if (!controles || !resultado) return;

  const aves = obterTodasAvesCarregadas();
  if (aves.length < 2) {
    controles.replaceChildren();
    resultado.replaceChildren(el("p", { class: "aviso", text: "Carregando espécies para comparar…" }));
    return;
  }

  if (!comparadorSelecao.a || !aves.some(p => p.title === comparadorSelecao.a)) comparadorSelecao.a = aves[0].title;
  if (!comparadorSelecao.b || !aves.some(p => p.title === comparadorSelecao.b)) {
    comparadorSelecao.b = (aves.find(p => p.title !== comparadorSelecao.a) || aves[1]).title;
  }

  const criarSeletor = (lado, rotulo) => el("label", { class: "comparador-seletor" },
    el("span", { text: rotulo }),
    el("select", {
      "aria-label": rotulo,
      onchange: e => { comparadorSelecao[lado] = e.target.value; renderizarComparador(); }
    }, ...aves.map(p => el("option", { value: p.title, text: p.title, selected: p.title === comparadorSelecao[lado] })))
  );

  const btnInverter = el("button", {
    class: "chip", type: "button", text: "⇄ Inverter",
    onclick: () => {
      [comparadorSelecao.a, comparadorSelecao.b] = [comparadorSelecao.b, comparadorSelecao.a];
      renderizarComparador();
    }
  });

  controles.replaceChildren(criarSeletor("a", "Ave 1"), btnInverter, criarSeletor("b", "Ave 2"));

  const aveA = aves.find(p => p.title === comparadorSelecao.a);
  const aveB = aves.find(p => p.title === comparadorSelecao.b);
  resultado.replaceChildren(criarColunaComparador(aveA), criarColunaComparador(aveB));
}

function criarColunaComparador(p) {
  if (!p) return el("div", { class: "comparador-card" });
  const meta = obterMetadadosAve(p);
  const foto = p.thumbnail?.source;
  const regioesTexto = meta.regioes.length ? meta.regioes.map(r => NOMES_REGIOES[r] || r).join(", ") : "Brasil";

  const somBloco = el("div", { class: "comparador-som" }, el("span", { class: "aviso", text: "Buscando som…" }));
  buscarSomAve(p.title, null).then(som => {
    if (!somBloco.isConnected) return;
    if (!som) somBloco.replaceChildren(el("span", { class: "aviso", text: "Sem gravação disponível" }));
    else somBloco.replaceChildren(el("audio", { controls: true, preload: "none", src: som.url }));
  });

  return el("article", { class: "comparador-card" },
    foto ? el("img", { src: foto, alt: p.title, class: "comparador-foto" }) : el("div", { class: "sem-foto comparador-foto", text: "🐦" }),
    el("div", { class: "comparador-corpo" },
      el("h3", { text: p.title }),
      el("dl", { class: "comparador-dl" },
        el("dt", { text: "Porte" }), el("dd", { text: meta.porte }),
        el("dt", { text: "Cores" }), el("dd", {}, el("div", { class: "chips" }, meta.cores.map(c => el("span", { class: "chip", text: c })))),
        el("dt", { text: "Regiões" }), el("dd", { text: regioesTexto }),
        el("dt", { text: "Sub-regiões" }), el("dd", { text: meta.subregioes.length ? meta.subregioes.join(", ") : "—" }),
        el("dt", { text: "Locais" }), el("dd", { text: meta.locais.length ? meta.locais.join(", ") : "Diversos estados" }),
        el("dt", { text: "Habitat" }), el("dd", { text: meta.habitat }),
        el("dt", { text: "Canto" }), el("dd", {}, el("p", { class: "comparador-canto-desc", text: meta.canto }), somBloco)
      ),
      el("p", { class: "comparador-resumo", text: resumoCurto(p.extract || "") }),
      el("button", { class: "botao", type: "button", text: "Abrir ficha completa", onclick: () => abrirAve(p.title) })
    )
  );
}

const btnSortearComp = $("btn-sortear-comparador");
if (btnSortearComp) {
  btnSortearComp.addEventListener("click", () => {
    const aves = obterTodasAvesCarregadas();
    if (aves.length < 2) return;
    const i1 = Math.floor(Math.random() * aves.length);
    let i2 = Math.floor(Math.random() * aves.length);
    while (i2 === i1) i2 = Math.floor(Math.random() * aves.length);
    comparadorSelecao.a = aves[i1].title;
    comparadorSelecao.b = aves[i2].title;
    renderizarComparador();
  });
}

/* ================== MODO NOITE (CORUJA + TRANSIÇÃO ROXO/PRETO) ================== */
const CHAVE_TEMA = "avifauna-tema-v1";
let timerTransicaoTema = null;

function aplicarTema(escuro, animar = false) {
  const root = document.documentElement;
  const btn = $("alternar-tema");
  const mascote = $("mascote-principal");
  const astro = $("mascote-astro");
  const ilustracao = document.querySelector(".ilustracao");
  const overlay = $("transicao-tema");
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const atualizarVisual = () => {
    if (escuro) root.setAttribute("data-tema", "escuro");
    else root.removeAttribute("data-tema");
    if (metaTheme) metaTheme.setAttribute("content", escuro ? "#090711" : "#f5f3eb");

    if (btn) {
      btn.setAttribute("aria-pressed", String(escuro));
      btn.querySelector(".tema-icone").textContent = escuro ? "☀️" : "🌙";
      btn.querySelector(".tema-rotulo").textContent = escuro ? "Modo Dia" : "Modo Noite";
    }
    if (mascote) mascote.textContent = escuro ? "🦉" : "🐦";
    if (astro) astro.textContent = escuro ? "🌙" : "✳";
    if (typeof window.atualizarFlappyTema === "function") window.atualizarFlappyTema();
  };

  try { localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro"); } catch (_) {}

  const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!animar || reduzido || !overlay) {
    atualizarVisual();
    return;
  }

  clearTimeout(timerTransicaoTema);
  overlay.classList.toggle("para-dia", !escuro);
  overlay.classList.add("ativa");
  if (ilustracao) ilustracao.classList.add("trocando");

  timerTransicaoTema = setTimeout(() => {
    atualizarVisual();
    requestAnimationFrame(() => {
      overlay.classList.remove("ativa");
      if (ilustracao) ilustracao.classList.remove("trocando");
    });
  }, 260);
}

const temaSalvo = (() => {
  try { return localStorage.getItem(CHAVE_TEMA); } catch (_) { return null; }
})();
aplicarTema(temaSalvo === "escuro", false);

const btnTema = $("alternar-tema");
if (btnTema) {
  btnTema.addEventListener("click", () => {
    const estaEscuro = document.documentElement.getAttribute("data-tema") === "escuro";
    aplicarTema(!estaEscuro, true);
  });
}

/* ================== INÍCIO ================== */
ligarCatalogo("catalogo-brasil", CATEGORIAS.brasil);
ligarCatalogo("catalogo-nordeste", CATEGORIAS.nordeste);
// Na página inicial, prioriza as espécies nordestinas; depois seguem os destaques do país.
carregarLista("brasil", [...NE_DESTAQUES, ...BR_DESTAQUES]).then(() => {
  if (typeof window.aoAtualizarAves === "function") window.aoAtualizarAves();
});
carregarLista("nordeste", NE_DESTAQUES);
atualizarBotaoTopo();
