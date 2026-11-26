// Dados mockados das unidades e do cardápio regional da Rede Raízes do Nordeste
const UNIDADES = {
  recife: {
    nome: "Recife - Boa Viagem",
    taxaEntrega: 6.00,
    tempoEstimado: "25 a 35 min",
    itensIndisponiveis: []
  },
  fortaleza: {
    nome: "Fortaleza - Aldeota",
    taxaEntrega: 5.00,
    tempoEstimado: "20 a 30 min",
    itensIndisponiveis: [4] // Acarajé indisponível nesta unidade para simular cardápio dinâmico
  },
  salvador: {
    nome: "Salvador - Pituba",
    taxaEntrega: 7.00,
    tempoEstimado: "30 a 40 min",
    itensIndisponiveis: [6] // Bolo de Rolo indisponível nesta unidade
  }
};

const CARDAPIO = [
  {
    id: 1,
    nome: "Cuscuz Recheado de Carne de Sol",
    categoria: "Pratos",
    descricao: "Cuscuz de milho artesanal com carne de sol desfiada na manteiga da terra e queijo coalho.",
    preco: 24.90
  },
  {
    id: 2,
    nome: "Tapioca Nordestina Completa",
    categoria: "Lanches",
    descricao: "Goma fresca hidratada recheada com queijo coalho assado, coco ralado e toque de leite condensado.",
    preco: 16.50
  },
  {
    id: 3,
    nome: "Baião de Dois Cremoso (Individual)",
    categoria: "Pratos",
    descricao: "Arroz vermelho, feijão verde, queijo coalho em cubos, nata fresca e coentro.",
    preco: 28.00
  },
  {
    id: 4,
    nome: "Acarajé Tradicional no Prato",
    categoria: "Lanches",
    descricao: "Bolinho de feijão-fradinho frito no azeite de dendê, acompanhado de vatapá, caruru e camarão seco.",
    preco: 22.00
  },
  {
    id: 5,
    nome: "Cartola Pernambucana",
    categoria: "Sobremesas",
    descricao: "Banana-prata frita na manteiga, coberta com queijo manteiga derretido, açúcar e canela.",
    preco: 15.00
  },
  {
    id: 6,
    nome: "Bolo de Rolo Artesanal (2 Fatias)",
    categoria: "Sobremesas",
    descricao: "Camadas finíssimas de massa amanteigada recheadas com goiabada derretida.",
    preco: 12.00
  },
  {
    id: 7,
    nome: "Suco Natural de Cajá (400ml)",
    categoria: "Bebidas",
    descricao: "Polpa pura de cajá batida na hora.",
    preco: 9.50
  },
  {
    id: 8,
    nome: "Cajuína Gelada (350ml)",
    categoria: "Bebidas",
    descricao: "Bebida típica nordestina clarificada e sem álcool, servida bem gelada.",
    preco: 8.00
  }
];