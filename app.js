// Sistema Front-End Raizes do Nordeste - Versao 1.1 (ajustes pos-teste)                                                                                                
let canalAtual = "app";
let unidadeAtual = "recife";
let categoriaAtual = "Todos";
let carrinho = [];
let descontoPercentual = 0;
let etapaPedidoAtual = 1;
let clienteLogado = null;

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  carregarSessaoLocal();
  selecionarCanal("app");
  alterarUnidade();
  atualizarResumoCarrinho();
});

// 1. Controle de Multicanalidade (App Mobile, Totem Loja, Web Desktop)
function selecionarCanal(canal) {
  canalAtual = canal;
  document.body.className = `canal-${canal}`;

  document.querySelectorAll(".btn-canal").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.canal === canal);
  });

  const subtitulo = document.getElementById("subtitulo-canal");
  const opcaoDelivery = document.getElementById("opcao-delivery");
  document.getElementById("msg-erro-pedido").textContent = "";

  if (canal === "totem") {
    subtitulo.textContent = "Totem de Autoatendimento em Loja (Somente Retirada no Balcão)";
    opcaoDelivery.classList.add("oculto");
    document.querySelector('input[name="tipoEntrega"][value="retirada"]').checked = true;
  } else if (canal === "web") {
    subtitulo.textContent = "Portal Web Desktop (Tela Ampla)";
    opcaoDelivery.classList.remove("oculto");
  } else {
    subtitulo.textContent = "Aplicativo Mobile (Visualização Smartphone 430px)";
    opcaoDelivery.classList.remove("oculto");
  }

  atualizarResumoCarrinho();
}

// 2. Cardápio Dinâmico por Unidade
function alterarUnidade() {
  unidadeAtual = document.getElementById("select-unidade").value;
  const infoUnidade = UNIDADES[unidadeAtual];

  document.getElementById("info-unidade-ativa").innerHTML =
    `<strong>${infoUnidade.nome}</strong> • Tempo médio de preparo: ${infoUnidade.tempoEstimado} • Taxa de entrega: R$ ${infoUnidade.taxaEntrega.toFixed(2).replace(".", ",")}`;

  renderizarCardapio();
  atualizarResumoCarrinho();
}

function filtrarCategoria(categoria, botaoClicado) {
  categoriaAtual = categoria;
  document.querySelectorAll(".btn-filtro").forEach(b => b.classList.remove("ativo"));
  botaoClicado.classList.add("ativo");
  renderizarCardapio();
}

function renderizarCardapio() {
  const container = document.getElementById("lista-produtos");
  const indisponiveis = UNIDADES[unidadeAtual].itensIndisponiveis;
  container.innerHTML = "";

  const itensFiltrados = CARDAPIO.filter(item =>
    categoriaAtual === "Todos" || item.categoria === categoriaAtual
  );

  itensFiltrados.forEach(item => {
    const estaIndisponivel = indisponiveis.includes(item.id);
    const card = document.createElement("article");
    card.className = `card-produto ${estaIndisponivel ? "indisponivel" : ""}`;

    card.innerHTML = `
      <div>
        <span class="tag-categoria">${item.categoria}</span>
        <h3>${item.nome}</h3>
        <p>${item.descricao}</p>
      </div>
      <div class="rodape-card">
        <span class="preco">R$ ${item.preco.toFixed(2).replace(".", ",")}</span>
        ${
          estaIndisponivel
            ? `<span class="texto-pequeno">Indisponível nesta unidade</span>`
            : `<button type="button" class="btn-primario" onclick="adicionarAoCarrinho(${item.id})">+ Adicionar</button>`
        }
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. Gestão do Carrinho e Cupons
function adicionarAoCarrinho(idProduto, precoCustomizado = null, nomeCustomizado = null) {
  const produtoBase = CARDAPIO.find(p => p.id === idProduto);
  const ehRecompensa = precoCustomizado !== null;
  const chaveId = ehRecompensa ? `${idProduto}-recompensa` : `${idProduto}`;
  const itemExistente = carrinho.find(i => i.chave === chaveId);

  if (itemExistente) {
    if (ehRecompensa) return; // Impede duplicar recompensa sem gastar pontos
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      chave: chaveId,
      nome: nomeCustomizado || produtoBase.nome,
      preco: ehRecompensa ? precoCustomizado : produtoBase.preco,
      quantidade: 1,
      ehRecompensa: ehRecompensa
    });
  }

  document.getElementById("msg-erro-pedido").textContent = "";
  atualizarResumoCarrinho();
}

function alterarQuantidade(chave, delta) {
  const index = carrinho.findIndex(i => i.chave === chave);
  if (index === -1) return;

  const item = carrinho[index];

  // Bloqueia aumento manual de quantidade em item de recompensa
  if (item.ehRecompensa && delta > 0) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    // Se remover a recompensa do carrinho, devolve os 50 pontos ao cliente
    if (item.ehRecompensa && clienteLogado) {
      clienteLogado.pontos += 50;
      salvarSessaoLocal();
      atualizarInterfaceCliente();
    }
    carrinho.splice(index, 1);
  }
  atualizarResumoCarrinho();
}

function aplicarCupom() {
  const codigo = document.getElementById("input-cupom").value.trim().toUpperCase();
  const msg = document.getElementById("msg-cupom");

  if (codigo === "NORDESTE10") {
    descontoPercentual = 0.10;
    msg.style.color = "#3b6e4c";
    msg.textContent = "Cupom NORDESTE10 aplicado (10% de desconto).";
  } else {
    descontoPercentual = 0;
    msg.style.color = "#c02828";
    msg.textContent = "Cupom inválido ou expirado.";
  }
  atualizarResumoCarrinho();
}

function atualizarResumoCarrinho() {
  const listaEl = document.getElementById("itens-carrinho");
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
  const campoEndereco = document.getElementById("campo-endereco");

  campoEndereco.classList.toggle("oculto", tipoEntrega !== "entrega");

  if (carrinho.length === 0) {
    listaEl.innerHTML = `<p class="carrinho-vazio">Nenhum item adicionado ao pedido.</p>`;
  } else {
    listaEl.innerHTML = carrinho.map(item => `
      <div class="item-carrinho">
        <div>
          <strong>${item.nome}</strong><br>
          <span class="texto-pequeno">R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</span>
        </div>
        <div class="controles-qtd">
          <button type="button" class="btn-qtd" onclick="alterarQuantidade('${item.chave}', -1)">-</button>
          <span>${item.quantidade}</span>
          ${item.ehRecompensa ? "" : `<button type="button" class="btn-qtd" onclick="alterarQuantidade('${item.chave}', 1)">+</button>`}
        </div>
      </div>
    `).join("");
  }

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const taxaEntrega = (tipoEntrega === "entrega" && subtotal > 0) ? UNIDADES[unidadeAtual].taxaEntrega : 0;
  const valorDesconto = subtotal * descontoPercentual;
  const total = Math.max(0, subtotal + taxaEntrega - valorDesconto);

  document.getElementById("valor-subtotal").textContent = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  document.getElementById("valor-entrega").textContent = `R$ ${taxaEntrega.toFixed(2).replace(".", ",")}`;
  document.getElementById("valor-desconto").textContent = `- R$ ${valorDesconto.toFixed(2).replace(".", ",")}`;
  document.getElementById("valor-total").textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// 4. Programa de Fidelidade e Cadastro (com LGPD)
function entrarContaDemo() {
  clienteLogado = {
    nome: "Carlos Silva",
    cpf: "12345678901",
    email: "carlos@email.com",
    pontos: 65
  };
  salvarSessaoLocal();
  atualizarInterfaceCliente();
  fecharModais();
}

function cadastrarCliente(event) {
  event.preventDefault();
  const nome = document.getElementById("cad-nome").value.trim();
  const cpf = document.getElementById("cad-cpf").value.trim();
  const email = document.getElementById("cad-email").value.trim();
  const aceitouLGPD = document.getElementById("check-lgpd-cadastro").checked;
  const msgErro = document.getElementById("msg-erro-cadastro");

  if (!/^\d{11}$/.test(cpf)) {
    msgErro.textContent = "Informe um CPF válido contendo exatamente 11 números.";
    return;
  }

  if (!aceitouLGPD) {
    msgErro.textContent = "É obrigatório aceitar o termo de consentimento da LGPD para se cadastrar.";
    return;
  }

  msgErro.textContent = "";
  clienteLogado = { nome, cpf, email, pontos: 20 };
  salvarSessaoLocal();
  atualizarInterfaceCliente();
  fecharModais();
}

function resgatarRecompensa() {
  const msgErro = document.getElementById("msg-erro-pedido");

  if (!clienteLogado) {
    msgErro.textContent = "Faça login ou cadastre-se para resgatar pontos de fidelidade.";
    return;
  }

  if (carrinho.some(item => item.ehRecompensa)) {
    msgErro.textContent = "Limite de 1 recompensa resgatada por pedido.";
    return;
  }

  if (clienteLogado.pontos < 50) {
    msgErro.textContent = "Saldo insuficiente: são necessários 50 pontos para este resgate.";
    return;
  }

  clienteLogado.pontos -= 50;
  salvarSessaoLocal();
  atualizarInterfaceCliente();
  adicionarAoCarrinho(6, 0, "Bolo de Rolo (Recompensa Fidelidade)");
  msgErro.textContent = "";
}

function atualizarInterfaceCliente() {
  const topoBadge = document.getElementById("resumo-pontos-topo");
  const saldoCarrinho = document.getElementById("saldo-pontos-carrinho");
  const btnAreaCliente = document.getElementById("btn-area-cliente");
  const cpfInput = document.getElementById("input-cpf-pedido");

  if (clienteLogado) {
    topoBadge.textContent = `Olá, ${clienteLogado.nome.split(" ")[0]} • ${clienteLogado.pontos} pts`;
    saldoCarrinho.textContent = clienteLogado.pontos;
    btnAreaCliente.textContent = `Minha Conta (${clienteLogado.pontos} pts)`;
    cpfInput.value = clienteLogado.cpf;

    document.getElementById("visao-deslogado").classList.add("oculto");
    document.getElementById("visao-logado").classList.remove("oculto");
    document.getElementById("perfil-nome").textContent = clienteLogado.nome;
    document.getElementById("perfil-cpf").textContent = clienteLogado.cpf;
    document.getElementById("perfil-pontos").textContent = clienteLogado.pontos;
  } else {
    topoBadge.textContent = "Visitante (Faça login para pontuar)";
    saldoCarrinho.textContent = "0";
    btnAreaCliente.textContent = "Entrar / Fidelidade";

    document.getElementById("visao-deslogado").classList.remove("oculto");
    document.getElementById("visao-logado").classList.add("oculto");
  }
}

// 5. Checkout, Validação LGPD e Simulação de Pagamento Externo
function iniciarPagamento() {
  const msgErro = document.getElementById("msg-erro-pedido");
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
  const endereco = document.getElementById("input-endereco").value.trim();
  const cpfPedido = document.getElementById("input-cpf-pedido").value.trim();
  const aceitouLGPD = document.getElementById("check-lgpd-pedido").checked;
  const metodoPagamento = document.getElementById("select-pagamento").value;

  if (carrinho.length === 0) {
    msgErro.textContent = "Adicione pelo menos um item ao pedido antes de finalizar.";
    return;
  }

  if (tipoEntrega === "entrega" && endereco.length < 8) {
    msgErro.textContent = "Informe o endereço completo para entrega (Delivery).";
    return;
  }

  if (cpfPedido !== "" && !/^\d{11}$/.test(cpfPedido)) {
    msgErro.textContent = "O CPF informado deve conter exatamente 11 dígitos numéricos.";
    return;
  }

  if (!aceitouLGPD) {
    msgErro.textContent = "É necessário marcar o consentimento da LGPD antes de enviar o pedido.";
    return;
  }

  msgErro.textContent = "";
  document.getElementById("painel-status-pedido").classList.add("oculto");

  const modalPag = document.getElementById("modal-pagamento");
  const textoGateway = document.getElementById("texto-status-gateway");
  textoGateway.textContent = "Conectando ao serviço externo de pagamento (PagNordeste API)...";
  modalPag.classList.remove("oculto");

  setTimeout(() => {
    modalPag.classList.add("oculto");

    if (metodoPagamento === "falha") {
      msgErro.textContent = "Pagamento recusado pelo serviço externo. Verifique o método e tente novamente.";
      return;
    }

    const totalTexto = document.getElementById("valor-total").textContent.replace("R$ ", "").replace(",", ".");
    const pontosGanhos = Math.floor(parseFloat(totalTexto));

    if (clienteLogado) {
      clienteLogado.pontos += pontosGanhos;
      salvarSessaoLocal();
      atualizarInterfaceCliente();
    }

    const numeroPedido = "#RN-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("numero-pedido-ativo").textContent = numeroPedido;
    document.getElementById("detalhe-canal-pedido").textContent =
      `Canal: ${canalAtual.toUpperCase()} | Unidade: ${UNIDADES[unidadeAtual].nome} | Pontos gerados: +${pontosGanhos} pts`;

    etapaPedidoAtual = 1;
    const btnAvancar = document.getElementById("btn-avancar-status");
    btnAvancar.disabled = false;
    btnAvancar.textContent = "Simular Avanço (Cozinha / Atendente)";

    atualizarVisualEtapas();
    document.getElementById("painel-status-pedido").classList.remove("oculto");

    const resumoItensTexto = carrinho.map(i => `${i.quantidade}x ${i.nome}`).join(", ");
    const totalPagoTexto = document.getElementById("valor-total").textContent;
    document.getElementById("resumo-itens-pagos").innerHTML =
      `<strong>Itens:</strong> ${resumoItensTexto} • <strong>Total pago:</strong> ${totalPagoTexto}`;

      

    carrinho = [];
    descontoPercentual = 0;
    document.getElementById("input-cupom").value = "";
    document.getElementById("msg-cupom").textContent = "";
    atualizarResumoCarrinho();
  }, 1200);
}

function avancarStatusPedido() {
  if (etapaPedidoAtual < 4) {
    etapaPedidoAtual += 1;
    atualizarVisualEtapas();

    if (etapaPedidoAtual === 4) {
      const btnAvancar = document.getElementById("btn-avancar-status");
      btnAvancar.disabled = true;
      btnAvancar.textContent = "Pedido Retirado / Entregue ✓";
    }
  }
}

function atualizarVisualEtapas() {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`etapa-${i}`);
    el.classList.toggle("concluida", i <= etapaPedidoAtual);
  }
}

// 6. Modais e Controles de Privacidade (LGPD)
function abrirModalConta() {
  document.getElementById("modal-conta").classList.remove("oculto");
}

function abrirModalLGPD(event) {
  if (event) event.preventDefault();
  document.getElementById("modal-lgpd").classList.remove("oculto");
}

function fecharModais() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("oculto"));
}

function aceitarAvisoInicialLGPD() {
  localStorage.setItem("raizes_aviso_lgpd", "aceito");
  document.getElementById("banner-lgpd-fixo").classList.add("oculto");
}

function revogarDadosLGPD() {
  localStorage.removeItem("raizes_cliente");
  localStorage.removeItem("raizes_aviso_lgpd");
  clienteLogado = null;
  atualizarInterfaceCliente();
  fecharModais();
  document.getElementById("banner-lgpd-fixo").classList.remove("oculto");
  alert("Seus dados locais foram removidos conforme a LGPD.");
}

function salvarSessaoLocal() {
  if (clienteLogado) {
    localStorage.setItem("raizes_cliente", JSON.stringify(clienteLogado));
  }
}

function carregarSessaoLocal() {
  const aviso = localStorage.getItem("raizes_aviso_lgpd");
  if (aviso === "aceito") {
    document.getElementById("banner-lgpd-fixo").classList.add("oculto");
  }

  const salvo = localStorage.getItem("raizes_cliente");
  if (salvo) {
    clienteLogado = JSON.parse(salvo);
    atualizarInterfaceCliente();
  }
}

function sairConta() {
  localStorage.removeItem("raizes_cliente");
  clienteLogado = null;
  atualizarInterfaceCliente();
  fecharModais();
}
