// Régua do DFD: ligada à estrutura real do template (seção 5.1 do AGENTS.md), não a
// palavras-chave soltas. Cada item aponta para um ou mais blocos do template pelo
// data-regua-id, e o "tipo" define como o bloco é lido (campo/seleção/tabela/seção livre).
const REGUA_DFD = [
  { id: "secretaria", label: "Secretaria/unidade requisitante identificada", tipo: "campo" },
  { id: "responsavel", label: "Responsável pela demanda indicado", tipo: "campo" },
  { id: "objeto_desc", label: "Objeto da futura contratação descrito", tipo: "secao" },
  { id: "objeto_natureza", label: "Natureza do objeto selecionada", tipo: "selecao" },
  { id: "forma_contratacao", label: "Forma de contratação selecionada", tipo: "selecao" },
  { id: "valor_estimado", label: "Estimativa de valor informada", tipo: "secao" },
  { id: "justificativa", label: "Justificativa da necessidade descrita", tipo: "secao" },
  { id: "quantidade_tabela", label: "Quantidade de materiais detalhada", tipo: "tabela" },
  { id: "previsao_entrega", label: "Previsão de entrega informada", tipo: "secao" },
  { id: "creditos", label: "Créditos orçamentários indicados", tipo: "secao" },
  { id: "previsao_conclusao", label: "Previsão de conclusão indicada", tipo: "secao" },
  { id: "grau_prioridade", label: "Grau de prioridade selecionado", tipo: "selecao" },
  { id: "dependencia_dfd", label: "Dependência de outro DFD indicada", tipo: "selecao" },
];

// "Anti-noob": ao pressionar Enter num bloco de texto, o conteúdo é cruzado com o
// título da seção à qual pertence para flagar preenchimento raso/genérico demais.
// v1: heurística estática por seção (poucas palavras = genérico) — simula a IA que
// faria essa checagem de verdade; hoje só a seção "objeto_desc" tem regra definida.
const ANTI_NOOB_REGRAS = {
  objeto_desc: {
    alertaLabel: "Objeto genérico identificado",
    caixaTitulo: "Isso parece genérico demais",
    perguntas: [
      "Qual é o tipo específico do item ou serviço (material, modelo, características técnicas)?",
      "Qual a quantidade estimada e a unidade de medida?",
      "Existe alguma norma técnica, certificação ou padrão exigido?",
    ],
    exemplo:
      "Aquisição de canetas esferográficas, corpo transparente, tinta azul, ponta 1.0 mm, para uso administrativo das unidades escolares.",
    detectar(texto) {
      const limpo = (texto || "").trim();
      if (!limpo) return false;

      const palavras = limpo.split(/\s+/).filter(Boolean);
      if (palavras.length <= 2) return true; // ex.: "caneta"

      // Mesmo com mais palavras, sem nenhuma medida/quantidade/número o objeto ainda
      // não tem especificação concreta (ex.: "Aquisição de canetas esferográficas").
      const temNumero = /\d/.test(limpo);
      return !temNumero && palavras.length < 10;
    },
  },
};

// Régua da Matriz de Risco: cabeçalho + verificação agregada sobre todos os blocos
// "RISCO NN" existentes (quantidade cadastrada e completude de cada um).
const REGUA_MATRIZ_RISCO = [
  { id: "numero_matriz", label: "Número da matriz identificado", tipo: "campo" },
  { id: "responsavel_edicao", label: "Responsável pela edição indicado", tipo: "campo" },
  { id: "objeto_matriz", label: "Objeto da matriz descrito", tipo: "secao" },
  { id: "riscos_cadastrados", label: "Ao menos um risco cadastrado", tipo: "risco_count" },
  { id: "riscos_completos", label: "Riscos com categoria, probabilidade e impacto preenchidos", tipo: "risco_completo" },
];

// Régua do ETP/TR: ainda não modelada como template estruturado (v1 foca no DFD).
// Usa heurística simples por palavra-chave sobre o texto livre do editor.
const CHECKLISTS = {
  etp: [
    { id: "necessidade", label: "Descrição da necessidade", keywords: ["necessidade"] },
    { id: "requisitos", label: "Requisitos da contratação", keywords: ["requisito"] },
    { id: "mercado", label: "Levantamento de mercado", keywords: ["mercado", "fornecedor"] },
    { id: "quantidade", label: "Estimativa de quantidades", keywords: ["quantidade"] },
    { id: "valor", label: "Estimativa de valor", keywords: ["valor"] },
    { id: "riscos", label: "Análise de riscos", keywords: ["risco"] },
    { id: "viabilidade", label: "Declaração de viabilidade", keywords: ["viável", "viavel", "viabilidade"] },
  ],
  tr: [
    { id: "objeto", label: "Objeto detalhado", keywords: ["objeto"] },
    { id: "especificacao", label: "Especificação técnica", keywords: ["especificação", "especificacao", "técnica"] },
    { id: "quantidade", label: "Quantidade e unidade de medida", keywords: ["quantidade", "unidade"] },
    { id: "prazo", label: "Prazo de entrega/execução", keywords: ["prazo"] },
    { id: "garantia", label: "Garantia", keywords: ["garantia"] },
    { id: "criterio", label: "Critério de julgamento", keywords: ["critério de julgamento", "criterio de julgamento", "julgamento"] },
    { id: "base_legal", label: "Base legal", keywords: ["lei 14.133", "14.133", "base legal"] },
  ],
};

const DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");
function normalizar(texto) {
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase();
}

const state = {
  tipoDocumento: "dfd",
};

let blockSeq = 0;
function novoBlockId() {
  blockSeq += 1;
  return `block-${blockSeq}`;
}

function iconArrastar() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>`;
}

function iconLixeira() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"/></svg>`;
}

function iconAdicionar() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
}

function iconAlertaAntiNoob() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
}

function iconIA() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.9 4.9L19 9l-5.1 1.6L12 15.5l-1.9-4.9L5 9l5.1-1.6L12 2.5z"/><path d="M19 13.5l.95 2.15L22 16.5l-2.05.85L19 19.5l-.95-2.15L16 16.5l2.05-.85L19 13.5z"/></svg>`;
}

// Sobe a partir de um bloco até achar o marcador de seção (título/seleção/tabela)
// mais próximo antes dele — é a seção "dona" daquele parágrafo.
function encontrarSecaoDoBloco(blockWrapper) {
  let el = blockWrapper.previousElementSibling;
  while (el) {
    if (el.dataset && el.dataset.reguaId) return el.dataset.reguaId;
    el = el.previousElementSibling;
  }
  return null;
}

// Roda a checagem "anti-noob" para o parágrafo — remove o box antigo (se houver) e,
// se o texto ainda for genérico demais para a seção, recria o box com as perguntas-chave.
function aplicarVerificacaoAntiNoob(wrapper, texto) {
  const boxAntigo = wrapper.querySelector(".anti-noob-box, .fallback-computadores-box");
  if (boxAntigo) boxAntigo.remove();
  delete wrapper.dataset.antiNoobAlerta;

  const secaoId = encontrarSecaoDoBloco(wrapper);

  if (secaoId === "objeto_desc" && textoIndicaComputadoresGenerico(texto)) {
    wrapper.dataset.antiNoobAlerta = "Objeto genérico identificado";
    montarFallbackComputadores(wrapper);
    atualizarRegua();
    return;
  }

  const regra = secaoId ? ANTI_NOOB_REGRAS[secaoId] : null;
  if (!regra || !regra.detectar(texto)) {
    atualizarRegua();
    return;
  }

  wrapper.dataset.antiNoobAlerta = regra.alertaLabel;

  const box = document.createElement("div");
  box.className = "anti-noob-box";
  box.innerHTML = `
    <p class="anti-noob-titulo">${iconAlertaAntiNoob()} ${regra.caixaTitulo}</p>
    <ul class="anti-noob-perguntas">
      ${regra.perguntas.map((p) => `<li>${p}</li>`).join("")}
    </ul>
    <p class="anti-noob-exemplo"><span>Exemplo:</span> ${regra.exemplo}</p>
  `;
  wrapper.querySelector(".block-content").appendChild(box);

  atualizarRegua();
}

// --- Fallback "computadores": em vez do box estático genérico, guia o usuário por um
// mini-fluxo (uso -> configuração) e monta sozinho o texto final do objeto, em texto
// corrido. Cada escolha simula um processamento (ex.: IA buscando especificações) com
// um loader de alguns segundos — mesma ideia da busca de preço da tabela de quantidade
// (ver DFD_DELAY_BUSCA_PRECO_MS), só que mais curta.
const FALLBACK_COMPUTADORES_DELAY_MS = 3000;

const FALLBACK_COMPUTADORES = {
  pergunta: "Para que tipo de uso são os computadores?",
  avisoConfiguracao:
    "Escolha uma configuração específica — a Lei 14.133/2021 exige que o objeto da contratação seja descrito de forma não genérica.",
  usos: [
    {
      id: "administrativo",
      label: "Uso administrativo (digitação, planilhas, sistemas web)",
      configuracoes: [
        {
          id: "basica",
          label: "Configuração básica",
          texto:
            "Aquisição de computadores desktop para uso administrativo, com processador Intel Core i3 de 12ª geração (ou equivalente), 8 GB de memória RAM DDR4, armazenamento SSD de 256 GB, placa de vídeo integrada, monitor de 21,5 polegadas com resolução Full HD, teclado e mouse USB, sistema operacional Windows 11 Pro licenciado, destinados às atividades de digitação, uso de planilhas, sistemas administrativos web e correio eletrônico das unidades requisitantes.",
        },
        {
          id: "intermediaria",
          label: "Configuração intermediária",
          texto:
            "Aquisição de computadores desktop para uso administrativo, com processador Intel Core i5 de 12ª geração (ou equivalente), 16 GB de memória RAM DDR4, armazenamento SSD de 512 GB, placa de vídeo integrada, monitor de 23,8 polegadas com resolução Full HD, teclado e mouse USB, sistema operacional Windows 11 Pro licenciado, destinados a ambientes com uso simultâneo de múltiplos sistemas administrativos, planilhas de grande volume de dados e videoconferência.",
        },
      ],
    },
    {
      id: "design",
      label: "Edição de imagem, vídeo e design gráfico",
      configuracoes: [
        {
          id: "basica",
          label: "Configuração básica",
          texto:
            "Aquisição de computadores desktop para edição de imagem e vídeo, com processador Intel Core i5 de 13ª geração (ou equivalente), 16 GB de memória RAM DDR4, armazenamento SSD NVMe de 512 GB, placa de vídeo dedicada com no mínimo 6 GB de memória VRAM, monitor de 24 polegadas com resolução Full HD e cobertura de cor sRGB, sistema operacional Windows 11 Pro licenciado, destinados a atividades de edição de imagens e vídeos em resolução Full HD.",
        },
        {
          id: "avancada",
          label: "Configuração avançada",
          texto:
            "Aquisição de computadores desktop para edição de imagem, vídeo e design gráfico em alta resolução, com processador Intel Core i7 de 13ª geração (ou equivalente), 32 GB de memória RAM DDR4, armazenamento SSD NVMe de 1 TB, placa de vídeo dedicada com no mínimo 12 GB de memória VRAM, monitor de 27 polegadas com resolução 4K e cobertura de cor sRGB de no mínimo 99%, sistema operacional Windows 11 Pro licenciado, destinados à edição de vídeos em 4K e à renderização de projetos gráficos complexos.",
        },
      ],
    },
    {
      id: "processamento",
      label: "Processamento pesado (análise de dados, IA, servidores)",
      configuracoes: [
        {
          id: "basica",
          label: "Configuração básica",
          texto:
            "Aquisição de estações de trabalho para processamento de dados e cargas de trabalho intensivas, com processador Intel Core i9 ou Xeon (ou equivalente), 64 GB de memória RAM DDR4, armazenamento SSD NVMe de 1 TB, placa de vídeo dedicada com no mínimo 12 GB de memória VRAM compatível com processamento paralelo (CUDA ou equivalente), fonte de alimentação redundante, sistema operacional Windows 11 Pro ou Linux, destinados à análise de grandes volumes de dados e ao treinamento de modelos de aprendizado de máquina de porte moderado.",
        },
        {
          id: "avancada",
          label: "Configuração avançada",
          texto:
            "Aquisição de estações de trabalho de alto desempenho para processamento de dados em larga escala e cargas de trabalho de inteligência artificial, com processador Intel Xeon ou AMD EPYC multi-núcleo (ou equivalente), 128 GB de memória RAM DDR5 ECC, armazenamento SSD NVMe de 2 TB em configuração redundante (RAID), placa de vídeo dedicada de alto desempenho com no mínimo 24 GB de memória VRAM compatível com processamento paralelo (CUDA ou equivalente), fonte de alimentação redundante, sistema operacional Linux, destinados ao treinamento de modelos de aprendizado de máquina de grande porte e à análise de dados em larga escala.",
        },
      ],
    },
  ],
};

function textoIndicaComputadoresGenerico(texto) {
  if (!/\bcomputador(es)?\b/.test(normalizar(texto))) return false;
  return ANTI_NOOB_REGRAS.objeto_desc.detectar(texto);
}

function montarFallbackComputadores(wrapper) {
  const box = document.createElement("div");
  box.className = "fallback-computadores-box";
  wrapper.querySelector(".block-content").appendChild(box);
  renderizarFallbackEtapaUso(box, wrapper);
}

function renderizarFallbackEtapaUso(box, wrapper) {
  box.innerHTML = `
    <p class="fallback-titulo">${iconAlertaAntiNoob()} ${FALLBACK_COMPUTADORES.pergunta}</p>
    <div class="fallback-opcoes">
      ${FALLBACK_COMPUTADORES.usos
        .map((uso) => `<button type="button" class="fallback-opcao" data-uso-id="${uso.id}">${uso.label}</button>`)
        .join("")}
    </div>
  `;
  box.querySelectorAll(".fallback-opcao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const uso = FALLBACK_COMPUTADORES.usos.find((u) => u.id === botao.dataset.usoId);
      if (!uso) return;
      renderizarFallbackCarregando(box, "Buscando configurações recomendadas...");
      setTimeout(() => renderizarFallbackEtapaConfiguracao(box, wrapper, uso), FALLBACK_COMPUTADORES_DELAY_MS);
    });
  });
}

function renderizarFallbackEtapaConfiguracao(box, wrapper, uso) {
  box.innerHTML = `
    <p class="fallback-titulo">${iconAlertaAntiNoob()} Configuração para "${uso.label}"</p>
    <p class="fallback-aviso">${FALLBACK_COMPUTADORES.avisoConfiguracao}</p>
    <div class="fallback-opcoes">
      ${uso.configuracoes
        .map((config) => `<button type="button" class="fallback-opcao" data-config-id="${config.id}">${config.label}</button>`)
        .join("")}
    </div>
  `;
  box.querySelectorAll(".fallback-opcao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const config = uso.configuracoes.find((c) => c.id === botao.dataset.configId);
      if (!config) return;
      renderizarFallbackCarregando(box, "Preenchendo objeto com a especificação escolhida...");
      setTimeout(
        () => aplicarTextoFallbackComputadores(wrapper, box, config.texto),
        FALLBACK_COMPUTADORES_DELAY_MS
      );
    });
  });
}

function renderizarFallbackCarregando(box, mensagem) {
  box.innerHTML = `
    <p class="fallback-carregando">
      <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-200 border-t-accent"></span>
      ${mensagem}
    </p>
  `;
}

function aplicarTextoFallbackComputadores(wrapper, box, texto) {
  const editable = wrapper.querySelector(".block-text");
  if (editable) editable.textContent = texto;
  box.remove();
  delete wrapper.dataset.antiNoobAlerta;
  atualizarRegua();
}

function montarWrapperBloco() {
  const wrapper = document.createElement("div");
  wrapper.className = "block-item";
  wrapper.draggable = true;
  wrapper.dataset.blockId = novoBlockId();

  const controls = document.createElement("div");
  controls.className = "block-controls";
  controls.innerHTML = `
    <span class="drag-handle" title="Arraste para reordenar">${iconArrastar()}</span>
    <span class="block-delete" title="Remover bloco">${iconLixeira()}</span>
  `;

  const content = document.createElement("div");
  content.className = "block-content";

  wrapper.appendChild(controls);
  wrapper.appendChild(content);

  const btnExcluir = controls.querySelector(".block-delete");
  if (btnExcluir) {
    btnExcluir.addEventListener("click", () => {
      wrapper.remove();
      atualizarRegua();
    });
  }

  ligarDragEvents(wrapper);

  return { wrapper, content };
}

function criarBlocoTexto(textoInicial) {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `<div class="block-text" contenteditable="true" data-placeholder="Escreva um parágrafo..."></div>`;
  const editable = content.querySelector(".block-text");
  if (textoInicial) editable.textContent = textoInicial;
  editable.addEventListener("input", atualizarRegua);

  // "Enter" = envio do parágrafo para a checagem anti-noob (simula a IA processando).
  editable.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    aplicarVerificacaoAntiNoob(wrapper, editable.textContent);
  });

  return wrapper;
}

function criarBlocoImagem() {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `
    <div class="block-image">
      <div class="image-preview"></div>
      <input type="text" placeholder="Cole a URL de uma imagem e pressione Enter..." />
    </div>`;
  const input = content.querySelector("input");
  const preview = content.querySelector(".image-preview");
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const url = input.value.trim();
    if (!url) return;
    preview.innerHTML = `<img src="${url}" alt="Imagem anexada" />`;
    input.remove();
    atualizarRegua();
  });
  return wrapper;
}

function criarBlocoTabela(linhas = 2, colunas = 2, cabecalhos = null) {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `<div class="block-table"></div><div class="block-table-actions"><button type="button" data-acao="linha">+ Linha</button><button type="button" data-acao="coluna">+ Coluna</button></div>`;
  const tableWrap = content.querySelector(".block-table");
  const table = document.createElement("table");

  const numColunas = cabecalhos ? cabecalhos.length : colunas;

  if (cabecalhos) {
    const trHead = document.createElement("tr");
    trHead.className = "tabela-cabecalho";
    cabecalhos.forEach((h) => {
      const td = document.createElement("td");
      td.contentEditable = "true";
      td.textContent = h;
      td.addEventListener("input", atualizarRegua);
      trHead.appendChild(td);
    });
    table.appendChild(trHead);
  }

  for (let l = 0; l < linhas; l++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < numColunas; c++) {
      const td = document.createElement("td");
      td.contentEditable = "true";
      td.addEventListener("input", atualizarRegua);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  tableWrap.appendChild(table);

  const btnLinha = content.querySelector('[data-acao="linha"]');
  if (btnLinha) {
    btnLinha.addEventListener("click", () => {
      const cols = table.rows[0] ? table.rows[0].cells.length : numColunas;
      const tr = document.createElement("tr");
      for (let c = 0; c < cols; c++) {
        const td = document.createElement("td");
        td.contentEditable = "true";
        td.addEventListener("input", atualizarRegua);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    });
  }

  const btnColuna = content.querySelector('[data-acao="coluna"]');
  if (btnColuna) {
    btnColuna.addEventListener("click", () => {
      Array.from(table.rows).forEach((row) => {
        const td = document.createElement("td");
        td.contentEditable = "true";
        td.addEventListener("input", atualizarRegua);
        row.appendChild(td);
      });
    });
  }

  return wrapper;
}

// --- Tabela "5. Quantidade de material" do DFD ---
// Coluna "Item" segue o mesmo padrão da coluna "Id" da Matriz de Risco
// (criarSubTabelaRisco): desativada, numerada automaticamente pela posição da linha.
// Preço é simulado: ao preencher Descrição + Quantidade, mostra um loader e, após um
// delay fixo, preenche Valor Unitário e calcula Valor Total (quantidade × unitário).
const DFD_VALOR_UNITARIO_MOCK = 288.49;
const DFD_DELAY_BUSCA_PRECO_MS = 5000;

// Catálogo de preços mock casado com o objeto "computadores" do fallback anti-noob
// (ver FALLBACK_COMPUTADORES): digitar uma dessas descrições de exemplo e uma quantidade
// traz um valor unitário específico; qualquer outra descrição cai no mock genérico acima.
const DFD_CATALOGO_PRECOS_MOCK = [
  {
    descricaoExemplo: "Computador desktop para uso administrativo (Intel Core i5, 16 GB RAM, SSD 512 GB)",
    palavrasChave: ["administrativo"],
    valorUnitario: 3280.0,
  },
  {
    descricaoExemplo: "Computador desktop para edição de imagem e vídeo (Intel Core i7, 32 GB RAM, SSD 1 TB, GPU dedicada)",
    palavrasChave: ["video", "imagem", "grafico"],
    valorUnitario: 7150.0,
  },
];

function obterValorUnitarioMock(descricaoTexto) {
  const normalizado = normalizar(descricaoTexto);
  const item = DFD_CATALOGO_PRECOS_MOCK.find((c) => c.palavrasChave.some((p) => normalizado.includes(p)));
  return item ? item.valorUnitario : DFD_VALOR_UNITARIO_MOCK;
}

function formatarMoedaBRL(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseNumeroPtBr(texto) {
  const limpo = (texto || "").trim();
  if (!limpo) return null;
  const normalizado = limpo.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const numero = parseFloat(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

function criarTabelaQuantidadeDfd() {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `<div class="block-table"></div><div class="block-table-actions"><button type="button" data-acao="linha">+ Linha</button></div>`;
  const tableWrap = content.querySelector(".block-table");
  const table = document.createElement("table");
  table.className = "tabela-dfd-quantidade";
  table.innerHTML = `
    <colgroup>
      <col style="width: 3.5rem" />
      <col />
      <col style="width: 102px" />
      <col style="width: 113px" />
      <col style="width: 113px" />
    </colgroup>`;

  const trHead = document.createElement("tr");
  trHead.className = "tabela-cabecalho";
  ["Item", "Descrição de Itens", "Quantidade", "Valor Unitário", "Valor Total"].forEach((h) => {
    const td = document.createElement("td");
    if (h === "Item") {
      td.className = "risco-id-col";
    } else {
      td.contentEditable = "true";
      td.addEventListener("input", atualizarRegua);
    }
    td.textContent = h;
    trHead.appendChild(td);
  });
  table.appendChild(trHead);

  const buscarPreco = (tr) => {
    const tdDescricao = tr.cells[1];
    const tdQuantidade = tr.cells[2];
    const tdValorUnitario = tr.cells[3];
    const tdValorTotal = tr.cells[4];

    clearTimeout(tr._buscaPrecoTimeout);

    const temDescricao = tdDescricao.textContent.trim().length > 0;
    const quantidade = parseNumeroPtBr(tdQuantidade.textContent);
    if (!temDescricao || quantidade === null) return;

    tdValorUnitario.contentEditable = "false";
    tdValorTotal.contentEditable = "false";
    tdValorUnitario.innerHTML =
      '<span class="inline-flex items-center gap-1.5 text-zinc-500"><span class="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-accent"></span>Buscando preço</span>';
    tdValorTotal.textContent = "";

    tr._buscaPrecoTimeout = setTimeout(() => {
      const valorUnitario = obterValorUnitarioMock(tdDescricao.textContent);
      tdValorUnitario.textContent = formatarMoedaBRL(valorUnitario);
      tdValorTotal.textContent = formatarMoedaBRL(quantidade * valorUnitario);
      tdValorUnitario.contentEditable = "true";
      tdValorTotal.contentEditable = "true";
      atualizarRegua();
    }, DFD_DELAY_BUSCA_PRECO_MS);
  };

  const adicionarLinha = () => {
    const tr = document.createElement("tr");

    const tdItem = document.createElement("td");
    tdItem.className = "risco-id-col";
    tdItem.textContent = table.rows.length;
    tr.appendChild(tdItem);

    for (let c = 0; c < 4; c++) {
      const td = document.createElement("td");
      td.contentEditable = "true";
      tr.appendChild(td);
    }

    const tdDescricao = tr.cells[1];
    const tdQuantidade = tr.cells[2];
    const onInput = () => {
      atualizarRegua();
      buscarPreco(tr);
    };
    tdDescricao.addEventListener("input", onInput);
    tdQuantidade.addEventListener("input", onInput);
    tr.cells[3].addEventListener("input", atualizarRegua);
    tr.cells[4].addEventListener("input", atualizarRegua);

    table.appendChild(tr);
    return tr;
  };

  for (let l = 0; l < 3; l++) adicionarLinha();

  tableWrap.appendChild(table);

  const btnLinha = content.querySelector('[data-acao="linha"]');
  if (btnLinha) btnLinha.addEventListener("click", adicionarLinha);

  return wrapper;
}

// --- Blocos de formulário (campo curto, seleção única, título de seção) ---
// Usados para reproduzir a estrutura fixa de um documento oficial (ex.: DFD) dentro
// do mesmo editor livre — sem virar um formulário tradicional.

function criarBlocoCampo(label, placeholder) {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `
    <div class="block-field">
      <label class="block-field-label">${label}</label>
      <input type="text" class="block-field-input" placeholder="${placeholder || "Digite aqui..."}" />
    </div>`;
  content.querySelector(".block-field-input").addEventListener("input", atualizarRegua);
  return wrapper;
}

function criarBlocoSelecao(titulo, opcoes) {
  const { wrapper, content } = montarWrapperBloco();
  const opcoesHtml = opcoes
    .map(
      (op, idx) => `
      <button type="button" class="selecao-opcao" data-idx="${idx}">
        <span class="selecao-marcador"></span>
        <span>${op}</span>
      </button>`
    )
    .join("");
  content.innerHTML = `
    <div class="block-selecao">
      <p class="block-selecao-titulo">${titulo}</p>
      <div class="selecao-opcoes">${opcoesHtml}</div>
    </div>`;

  content.querySelectorAll(".selecao-opcao").forEach((btn) => {
    btn.addEventListener("click", () => {
      const jaSelecionado = btn.classList.contains("selecionado");
      content.querySelectorAll(".selecao-opcao").forEach((b) => b.classList.remove("selecionado"));
      if (!jaSelecionado) btn.classList.add("selecionado");
      atualizarRegua();
    });
  });

  return wrapper;
}

function criarBlocoTitulo(texto) {
  const { wrapper, content } = montarWrapperBloco();
  content.innerHTML = `<div class="block-titulo"><p class="block-titulo-texto">${texto}</p></div>`;
  return wrapper;
}

// Elemento independente (não é um .block-item) que fica ancorado ao final de uma
// seção: cada clique insere um bloco de texto logo antes dele — por isso o botão
// sempre acaba posicionado após o último conteúdo já adicionado naquela seção.
function criarBotaoAdicionarConteudo() {
  const el = document.createElement("div");
  el.className = "secao-add-wrapper";
  el.innerHTML = `<button type="button" class="block-titulo-add">${iconAdicionar()} Adicionar conteúdo</button>`;

  el.querySelector(".block-titulo-add").addEventListener("click", () => {
    const novo = criarBlocoTexto();
    el.before(novo);
    novo.querySelector(".block-text").focus();
    atualizarRegua();
  });

  return el;
}

// --- Bloco "Risco" (Matriz de Gerenciamento de Riscos, página 18 do modelo) ---
// Cada risco é um único bloco composto (categoria/probabilidade/impacto + 3 mini-tabelas),
// e pode ser repetido infinitas vezes através do botão ancorado "+ Adicionar risco".

function criarGrupoSelecaoInline(label, opcoes) {
  const div = document.createElement("div");
  div.className = "risco-selecao-grupo";

  const labelEl = document.createElement("span");
  labelEl.className = "risco-selecao-label";
  labelEl.textContent = label;
  div.appendChild(labelEl);

  const opcoesWrap = document.createElement("div");
  opcoesWrap.className = "selecao-opcoes horizontal";

  opcoes.forEach((op) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "selecao-opcao";
    btn.innerHTML = `<span class="selecao-marcador"></span><span>${op}</span>`;
    btn.addEventListener("click", () => {
      const jaSelecionado = btn.classList.contains("selecionado");
      opcoesWrap.querySelectorAll(".selecao-opcao").forEach((b) => b.classList.remove("selecionado"));
      if (!jaSelecionado) btn.classList.add("selecionado");
      atualizarRegua();
    });
    opcoesWrap.appendChild(btn);
  });

  div.appendChild(opcoesWrap);
  return div;
}

// `opcoes.aoClicarIA`, quando presente, acrescenta uma coluna "Ações" com um botão de IA
// em cada linha — usada só na tabela "Dano" para disparar a sugestão automática de ações
// preventivas/de contingência (ver sugerirAcoesComIA).
function criarSubTabelaRisco(titulo, colunas, opcoes = {}) {
  const temColunaAcoes = typeof opcoes.aoClicarIA === "function";

  const wrap = document.createElement("div");
  wrap.className = "risco-subtabela block-table";

  const tituloEl = document.createElement("p");
  tituloEl.className = "risco-subtabela-titulo";
  tituloEl.textContent = titulo;
  wrap.appendChild(tituloEl);

  const table = document.createElement("table");
  const trCabecalho = document.createElement("tr");
  trCabecalho.className = "tabela-cabecalho";
  const tdId = document.createElement("td");
  tdId.className = "risco-id-col";
  tdId.textContent = "Id";
  trCabecalho.appendChild(tdId);
  colunas.forEach((c) => {
    const td = document.createElement("td");
    td.textContent = c;
    trCabecalho.appendChild(td);
  });
  if (temColunaAcoes) {
    const tdAcoesHead = document.createElement("td");
    tdAcoesHead.className = "risco-acoes-col";
    tdAcoesHead.textContent = "Ações";
    trCabecalho.appendChild(tdAcoesHead);
  }
  table.appendChild(trCabecalho);
  wrap.appendChild(table);

  // `valores`, quando informado, prefila as células de dados (usado pela sugestão de IA
  // para inserir as ações prontas nas tabelas de Ação Preventiva/Contingência).
  const adicionarLinha = (valores) => {
    const tr = document.createElement("tr");
    const tdIdLinha = document.createElement("td");
    tdIdLinha.className = "risco-id-col";
    tdIdLinha.textContent = table.rows.length;
    tr.appendChild(tdIdLinha);
    colunas.forEach((_, i) => {
      const td = document.createElement("td");
      td.contentEditable = "true";
      if (valores && valores[i]) td.textContent = valores[i];
      td.addEventListener("input", atualizarRegua);
      tr.appendChild(td);
    });
    if (temColunaAcoes) {
      const tdAcoes = document.createElement("td");
      tdAcoes.className = "risco-acoes-col";
      tdAcoes.innerHTML = `<button type="button" class="risco-ia-btn" title="Sugerir ações com IA">${iconIA()}</button>`;
      tdAcoes.querySelector(".risco-ia-btn").addEventListener("click", () => opcoes.aoClicarIA(tdAcoes));
      tr.appendChild(tdAcoes);
    }
    table.appendChild(tr);
    return tr;
  };
  adicionarLinha();

  // Preenche a linha de dados já existente naquele índice (0 = linha "Id 1"); só cria uma
  // linha nova quando ainda não existe uma naquela posição. Usado pela sugestão de IA para
  // aproveitar a primeira linha em branco em vez de sempre acrescentar linhas novas.
  const definirOuAdicionarLinha = (indice, valores) => {
    const linhaExistente = table.rows[indice + 1];
    if (!linhaExistente) return adicionarLinha(valores);
    valores.forEach((valor, i) => {
      const td = linhaExistente.cells[i + 1];
      if (td && valor) td.textContent = valor;
    });
    return linhaExistente;
  };

  const acoes = document.createElement("div");
  acoes.className = "block-table-actions";
  const btnLinha = document.createElement("button");
  btnLinha.type = "button";
  btnLinha.textContent = "+ Linha";
  btnLinha.addEventListener("click", () => adicionarLinha());
  acoes.appendChild(btnLinha);
  wrap.appendChild(acoes);

  wrap.adicionarLinha = adicionarLinha;
  wrap.definirOuAdicionarLinha = definirOuAdicionarLinha;
  return wrap;
}

function criarBlocoRisco(numero) {
  const { wrapper, content } = montarWrapperBloco();
  wrapper.classList.add("block-risco");
  wrapper.dataset.reguaId = "riscos";

  const card = document.createElement("div");
  card.className = "risco-card";

  const header = document.createElement("p");
  header.className = "risco-numero";
  header.textContent = `RISCO ${String(numero).padStart(2, "0")}`;
  card.appendChild(header);

  const grupoCategoria = criarGrupoSelecaoInline("Categoria", [
    "Planejamento da Contratação",
    "Seleção do Fornecedor",
    "Gestão do Contrato",
  ]);
  const grupoProbabilidade = criarGrupoSelecaoInline("Probabilidade", ["Baixa", "Média", "Alta"]);
  const grupoImpacto = criarGrupoSelecaoInline("Impacto", ["Baixo", "Médio", "Alto"]);
  card.appendChild(grupoCategoria);
  card.appendChild(grupoProbabilidade);
  card.appendChild(grupoImpacto);

  // Preventiva/Contingência são criadas primeiro para que a tabela "Dano" (que referencia
  // as duas) possa passar os wrappers para o botão de IA — a ordem visual é reorganizada
  // no appendChild logo abaixo.
  const tabelaPreventiva = criarSubTabelaRisco("Ação Preventiva", ["Descrição", "Responsável"]);
  const tabelaContingencia = criarSubTabelaRisco("Ação de Contingência", ["Descrição", "Responsável"]);
  const tabelaDano = criarSubTabelaRisco(
    "Dano",
    ["Descrição do dano"],
    { aoClicarIA: (tdAcoes) => sugerirAcoesComIA(tdAcoes, tabelaPreventiva, tabelaContingencia) }
  );

  card.appendChild(tabelaDano);
  card.appendChild(tabelaPreventiva);
  card.appendChild(tabelaContingencia);

  content.appendChild(card);

  return wrapper;
}

// --- Sugestão de ações por IA (hardcoded) ---
// Clique no ícone de IA da tabela "Dano": simula 3s de processamento e, ao final, insere
// 2 ações preventivas e 1 ação de contingência prontas nas tabelas abaixo do mesmo risco,
// aproveitando a linha em branco já existente em cada tabela em vez de sempre criar linhas
// novas (só cria linha extra quando faltar espaço, ex.: a 2ª ação preventiva).
// v1: resultado fixo (mock), independente do texto digitado em "Descrição do dano" — mesma
// lógica de simulação da busca de preço da tabela de quantidade do DFD (ver buscarPreco).
const RISCO_IA_DELAY_MS = 3000;

const RISCO_ACOES_SUGERIDAS_MOCK = {
  preventivas: [
    "Exigir, na fase de habilitação, comprovação de estoque ou capacidade de fornecimento imediato do quantitativo licitado.",
    "Prever em contrato cronograma de entrega com prazos parciais e notificação obrigatória de qualquer risco de atraso com antecedência mínima de 10 dias.",
  ],
  contingencias: [
    "Aplicar as sanções administrativas previstas em contrato (advertência, multa por atraso e, em caso de reincidência, impedimento de licitar) e notificar a autoridade competente.",
  ],
};

function sugerirAcoesComIA(tdAcoes, tabelaPreventiva, tabelaContingencia) {
  if (tdAcoes.dataset.iaProcessando) return;
  tdAcoes.dataset.iaProcessando = "1";
  tdAcoes.innerHTML =
    '<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-200 border-t-accent"></span>';

  setTimeout(() => {
    RISCO_ACOES_SUGERIDAS_MOCK.preventivas.forEach((texto, i) => tabelaPreventiva.definirOuAdicionarLinha(i, [texto]));
    RISCO_ACOES_SUGERIDAS_MOCK.contingencias.forEach((texto, i) =>
      tabelaContingencia.definirOuAdicionarLinha(i, [texto])
    );

    delete tdAcoes.dataset.iaProcessando;
    tdAcoes.innerHTML = `<button type="button" class="risco-ia-btn" title="Sugerir ações com IA">${iconIA()}</button>`;
    tdAcoes.querySelector(".risco-ia-btn").addEventListener("click", () =>
      sugerirAcoesComIA(tdAcoes, tabelaPreventiva, tabelaContingencia)
    );

    atualizarRegua();
  }, RISCO_IA_DELAY_MS);
}

// Renumera os blocos "RISCO NN" na ordem em que aparecem no editor — chamado sempre
// que um risco é adicionado, removido ou arrastado para outra posição.
function renumerarRiscos() {
  document.querySelectorAll("#editor-blocks > .block-item.block-risco").forEach((el, idx) => {
    const header = el.querySelector(".risco-numero");
    if (header) header.textContent = `RISCO ${String(idx + 1).padStart(2, "0")}`;
  });
}

function criarBotaoAdicionarRisco() {
  const el = document.createElement("div");
  el.className = "secao-add-wrapper";
  el.innerHTML = `<button type="button" class="block-titulo-add">${iconAdicionar()} Adicionar risco</button>`;

  el.querySelector(".block-titulo-add").addEventListener("click", () => {
    const total = document.querySelectorAll("#editor-blocks > .block-item.block-risco").length;
    const novo = criarBlocoRisco(total + 1);
    el.before(novo);
    renumerarRiscos();
    atualizarRegua();
  });

  return el;
}

function adicionarBloco(tipo) {
  const editorBlocks = document.getElementById("editor-blocks");
  let blockEl;
  if (tipo === "texto") blockEl = criarBlocoTexto();
  else if (tipo === "imagem") blockEl = criarBlocoImagem();
  else if (tipo === "tabela") blockEl = criarBlocoTabela();
  else return;

  editorBlocks.appendChild(blockEl);

  const editable = blockEl.querySelector(".block-text");
  if (editable) editable.focus();

  atualizarRegua();
}

// --- Template do DFD (seção 5.1 do AGENTS.md) ---
// Monta a sequência de blocos que reproduz o formulário oficial: campos de cabeçalho,
// seções numeradas com "+ Adicionar conteúdo" para texto livre, seleções pré-preenchidas
// com as opções do documento, e a tabela de quantidades já com o cabeçalho certo.
function montarTemplateDfd(container) {
  const blocos = [];

  const add = (bloco, reguaId) => {
    if (reguaId) bloco.dataset.reguaId = reguaId;
    blocos.push(bloco);
    return bloco;
  };

  // Título de seção de texto livre: o botão "Adicionar conteúdo" vai logo depois,
  // como elemento próprio — é ele que fica ancorado ao final do que for inserido.
  const addSecao = (texto, reguaId) => {
    const titulo = criarBlocoTitulo(texto);
    if (reguaId) titulo.dataset.reguaId = reguaId;
    blocos.push(titulo);
    blocos.push(criarBotaoAdicionarConteudo());
    return titulo;
  };

  add(criarBlocoCampo("Secretaria/Unidade Requisitante", "Ex.: Secretaria de Educação"), "secretaria");
  add(criarBlocoCampo("Responsável pela Demanda", "Nome do responsável"), "responsavel");
  add(criarBlocoCampo("Matrícula", "Não se aplica, se for o caso"));
  add(criarBlocoCampo("E-mail", "nome@orgao.gov.br"));
  add(criarBlocoCampo("Telefone", "(DDD) 0000-0000"));

  addSecao("1. Objeto da futura contratação", "objeto_desc");

  add(
    criarBlocoSelecao("1.1. Objeto", [
      "Serviço não continuado",
      "Serviço continuado SEM dedicação exclusiva de mão de obra",
      "Serviço continuado COM dedicação exclusiva de mão de obra",
      "Compra",
      "Locação",
      "Obra",
      "Serviço Comum de Engenharia",
      "Serviço de tecnologia da informação e de comunicação",
      "Concessão e permissão de uso de bens públicos",
      "Alienação e concessão de direito real de uso de bens",
    ]),
    "objeto_natureza"
  );

  add(
    criarBlocoSelecao("2. Forma de Contratação sugerida", ["Pregão", "Concorrência", "Dispensa/Inexigibilidade", "Adesão à IRP de outro Órgão"]),
    "forma_contratacao"
  );

  addSecao("3. Estimativa de valor da contratação por meio de procedimento simplificado", "valor_estimado");

  addSecao(
    "4. Justificativa da necessidade da contratação da solução, considerando o Planejamento Estratégico, se for o caso",
    "justificativa"
  );

  add(criarBlocoTitulo("5. Quantidade de material da solução a ser contratada (expectativa)"), "quantidade_tabela");
  add(criarTabelaQuantidadeDfd(), "quantidade_tabela");

  addSecao("6. Previsão de entrega dos bens ou da obra ou do serviço", "previsao_entrega");

  addSecao("7.1. Ação Orçamentária", "creditos");
  addSecao("7.2. Plano de Contratação Anual", "creditos");

  addSecao("8. Previsão de data pretendida para a conclusão da contratação (assinado o instrumento contratual)", "previsao_conclusao");

  add(criarBlocoSelecao("9. Grau de prioridade da compra ou da contratação", ["Baixo", "Médio", "Alto"]), "grau_prioridade");

  add(
    criarBlocoSelecao("10. Depende de objeto de outro Documento de Formalização de Demanda?", ["Não", "Sim"]),
    "dependencia_dfd"
  );

  addSecao("11. Indicação da equipe de planejamento", "equipe_planejamento");
  addSecao("12. Indicação do(s) integrante(s) da equipe de fiscalização", "equipe_fiscalizacao");

  blocos.forEach((b) => container.appendChild(b));
}

// --- Template da Matriz de Gerenciamento de Riscos (página 18 do modelo) ---
function montarTemplateMatrizRisco(container) {
  const blocos = [];

  const add = (bloco, reguaId) => {
    if (reguaId) bloco.dataset.reguaId = reguaId;
    blocos.push(bloco);
    return bloco;
  };

  add(
    criarBlocoCampo("Número da Matriz de Alocação de Riscos", "Ex.: Processo Digital nº 00000/2026"),
    "numero_matriz"
  );
  add(criarBlocoCampo("Responsável pela Edição", "Nome ou secretaria responsável"), "responsavel_edicao");
  add(criarBlocoCampo("Data de Criação", "DD/MM/AAAA"));

  const tituloObjeto = criarBlocoTitulo("Objeto da Matriz de Riscos");
  tituloObjeto.dataset.reguaId = "objeto_matriz";
  blocos.push(tituloObjeto);
  blocos.push(criarBotaoAdicionarConteudo());

  blocos.push(criarBlocoRisco(1));
  blocos.push(criarBotaoAdicionarRisco());

  blocos.forEach((b) => container.appendChild(b));

}

function carregarTemplate(tipo) {
  const editorBlocks = document.getElementById("editor-blocks");
  editorBlocks.innerHTML = "";
  if (tipo === "dfd") {
    montarTemplateDfd(editorBlocks);
  } else if (tipo === "matriz_risco") {
    montarTemplateMatrizRisco(editorBlocks);
  } else {
    // ETP/TR ainda não têm um template estruturado nesta v1 — parte de um bloco em branco.
    editorBlocks.appendChild(criarBlocoTexto());
  }
}

// --- Drag and drop nativo para reordenar blocos ---
let draggedEl = null;

function ligarDragEvents(wrapper) {
  wrapper.addEventListener("dragstart", (e) => {
    draggedEl = wrapper;
    wrapper.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  wrapper.addEventListener("dragend", () => {
    wrapper.classList.remove("dragging");
    draggedEl = null;
    document.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach((el) => {
      el.classList.remove("drag-over-top", "drag-over-bottom");
    });
  });

  wrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedEl || draggedEl === wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const antes = e.clientY - rect.top < rect.height / 2;
    wrapper.classList.toggle("drag-over-top", antes);
    wrapper.classList.toggle("drag-over-bottom", !antes);
  });

  wrapper.addEventListener("dragleave", () => {
    wrapper.classList.remove("drag-over-top", "drag-over-bottom");
  });

  wrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    wrapper.classList.remove("drag-over-top", "drag-over-bottom");
    if (!draggedEl || draggedEl === wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const antes = e.clientY - rect.top < rect.height / 2;
    wrapper.parentElement.insertBefore(draggedEl, antes ? wrapper : wrapper.nextSibling);
    atualizarRegua();
  });
}

// --- Régua de validação ---
function textoCompletoDoEditor() {
  return normalizar(document.getElementById("editor-blocks").innerText || "");
}

function iconCheck() {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
}

// Verifica se há algum parágrafo com conteúdo entre um título de seção e o próximo
// bloco marcado (ou o fim do editor) — é como sabemos que a seção "foi preenchida".
function secaoTemConteudo(tituloWrapper) {
  let el = tituloWrapper.nextElementSibling;
  while (el && !el.dataset.reguaId) {
    const paragrafos = el.querySelectorAll(".block-text");
    for (const p of paragrafos) {
      if (p.textContent.trim().length > 0) return true;
    }
    el = el.nextElementSibling;
  }
  return false;
}

// Verifica se algum bloco da seção está com o alerta "anti-noob" ativo — usado para
// colorir o item da régua de vermelho/erro em vez de verde/pendente.
function secaoTemAlerta(tituloWrapper) {
  let el = tituloWrapper.nextElementSibling;
  while (el && !el.dataset.reguaId) {
    if (el.dataset && el.dataset.antiNoobAlerta) return el.dataset.antiNoobAlerta;
    el = el.nextElementSibling;
  }
  return null;
}

function calcularReguaDfd() {
  const wrappers = Array.from(document.querySelectorAll("#editor-blocks > .block-item[data-regua-id]"));

  return REGUA_DFD.map((item) => {
    const blocosDoItem = wrappers.filter((w) => w.dataset.reguaId === item.id);
    let checado = false;
    let alertaLabel = null;

    for (const w of blocosDoItem) {
      if (item.tipo === "campo") {
        const input = w.querySelector(".block-field-input");
        if (input && input.value.trim()) checado = true;
      } else if (item.tipo === "selecao") {
        if (w.querySelector(".selecao-opcao.selecionado")) checado = true;
      } else if (item.tipo === "tabela") {
        const linhas = Array.from(w.querySelectorAll("table tr")).filter((tr) => !tr.classList.contains("tabela-cabecalho"));
        if (
          linhas.some((tr) =>
            Array.from(tr.cells).some((td) => !td.classList.contains("risco-id-col") && td.textContent.trim())
          )
        )
          checado = true;
      } else if (item.tipo === "secao") {
        const alerta = secaoTemAlerta(w);
        if (alerta) alertaLabel = alerta;
        else if (secaoTemConteudo(w)) checado = true;
      }
      if (checado || alertaLabel) break;
    }

    return { ...item, checado, alertaLabel };
  });
}

function calcularReguaMatrizRisco() {
  const wrappers = Array.from(document.querySelectorAll("#editor-blocks > .block-item[data-regua-id]"));
  const riscos = wrappers.filter((w) => w.dataset.reguaId === "riscos");

  return REGUA_MATRIZ_RISCO.map((item) => {
    let checado = false;

    if (item.tipo === "campo") {
      const w = wrappers.find((x) => x.dataset.reguaId === item.id);
      const input = w && w.querySelector(".block-field-input");
      checado = !!(input && input.value.trim());
    } else if (item.tipo === "secao") {
      const w = wrappers.find((x) => x.dataset.reguaId === item.id);
      checado = !!(w && secaoTemConteudo(w));
    } else if (item.tipo === "risco_count") {
      checado = riscos.length > 0;
    } else if (item.tipo === "risco_completo") {
      checado = riscos.length > 0 && riscos.every((r) => r.querySelectorAll(".risco-selecao-grupo .selecao-opcao.selecionado").length === 3);
    }

    return { ...item, checado };
  });
}

function calcularReguaGenerica() {
  const texto = textoCompletoDoEditor();
  return CHECKLISTS[state.tipoDocumento].map((item) => ({
    ...item,
    checado: item.keywords.some((k) => texto.includes(normalizar(k))),
  }));
}

function atualizarRegua() {
  renumerarRiscos();

  const itens =
    state.tipoDocumento === "dfd"
      ? calcularReguaDfd()
      : state.tipoDocumento === "matriz_risco"
      ? calcularReguaMatrizRisco()
      : calcularReguaGenerica();

  const total = itens.length;
  const concluidos = itens.filter((i) => i.checado).length;

  document.getElementById("regua-resumo").textContent = `${concluidos} de ${total} itens preenchidos`;
  document.getElementById("regua-progresso").style.width = `${total ? (concluidos / total) * 100 : 0}%`;

  document.getElementById("regua-lista").innerHTML = itens
    .map((item) => {
      if (item.alertaLabel) {
        return `
        <li class="regua-item flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-[10px] font-bold text-white">!</span>
          <div class="min-w-0">
            <span class="text-sm text-zinc-700">${item.label}</span>
            <p class="mt-0.5 text-xs font-medium text-red-600">${item.alertaLabel}</p>
          </div>
        </li>`;
      }

      return `
      <li class="regua-item flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${
        item.checado ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-white"
      }">
        <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          item.checado ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 text-transparent"
        }">${item.checado ? iconCheck() : ""}</span>
        <span class="text-sm ${item.checado ? "text-zinc-700" : "text-zinc-500"}">${item.label}</span>
      </li>`;
    })
    .join("");
}

let toastTimeout;
function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function ligarEventos() {
  const btnAdd = document.getElementById("btn-add-block");
  const menu = document.getElementById("add-block-menu");

  btnAdd.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  document.addEventListener("click", () => menu.classList.add("hidden"));

  menu.querySelectorAll(".add-block-opcao").forEach((opcao) => {
    opcao.addEventListener("click", (e) => {
      e.stopPropagation();
      adicionarBloco(opcao.dataset.tipo);
      menu.classList.add("hidden");
    });
  });

  document.getElementById("btn-salvar").addEventListener("click", () => {
    mostrarToast("Documento salvo — em breve neste protótipo.");
  });

}

(function init() {
  carregarTemplate(state.tipoDocumento);
  ligarEventos();
  atualizarRegua();

})();
