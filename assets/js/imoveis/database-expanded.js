// ========================================
// IMÓVEIS EXPANDIDOS - REGIÃO METROPOLITANA DE PORTO ALEGRE/RS
// Banco de dados completo com 150+ imóveis variados
// Público A, AA e AAA | Venda e Aluguel
// ========================================

// Função auxiliar para gerar IDs únicos
let currentId = 51;

function createImovel(data) {
    return {
        id: currentId++,
        ...data,
        disponivel: true
    };
}

// Array base com os 50 imóveis existentes
const baseImoveis = window.imoveisPOA || [];

// Novos imóveis adicionados (51-150)
const novosImoveis = [
    // ============================================
    // PÚBLICO AAA - ALTO PADRÃO (R$ 1.5M+)
    // ============================================
    
    // Coberturas e Apartamentos Premium
    createImovel({
        titulo: "Cobertura 5 Quartos Três Figueiras",
        tipo: "cobertura",
        preco: 3500000,
        quartos: 5,
        banheiros: 5,
        vagas: 5,
        area: 600,
        bairro: "Três Figueiras",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 1500",
        features: ["área gourmet", "piscina privativa", "sauna", "churrasqueira", "vista panorâmica", "terraço", "elevador privativo", "home theater", "pet friendly"],
        descricao: "Cobertura triplex de luxo com todos os requintes.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Mansão 6 Quartos Petrópolis",
        tipo: "casa",
        preco: 4500000,
        quartos: 6,
        banheiros: 5,
        vagas: 6,
        area: 800,
        bairro: "Petrópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Ipiranga, 5000",
        features: ["quintal enorme", "piscina", "sauna", "área gourmet", "churrasqueira", "jardim", "playground", "quadra esportiva", "garagem coberta", "portaria 24h"],
        descricao: "Mansão de alto luxo com área de lazer completa e segurança.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 4 Quartos Moinhos de Vento - Premium",
        tipo: "apartamento",
        preco: 2800000,
        quartos: 4,
        banheiros: 4,
        vagas: 4,
        area: 280,
        bairro: "Moinhos de Vento",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Padre Chagas, 1500",
        features: ["portaria 24h", "academia", "piscina", "sauna", "churrasqueira", "playground", "pet friendly", "elevador", "área gourmet", "vista panorâmica"],
        descricao: "Apartamento de alto padrão em prédio de luxo.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // ============================================
    // PÚBLICO AA - MÉDIO-ALTO PADRÃO (R$ 600K - R$ 1.5M)
    // ============================================
    
    // Apartamentos AA
    createImovel({
        titulo: "Apartamento 3 Quartos Bom Fim - Reformado",
        tipo: "apartamento",
        preco: 850000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 130,
        bairro: "Bom Fim",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Osvaldo Aranha, 1500",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "sacada", "reformado"],
        descricao: "Apartamento totalmente reformado, pronto para morar.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 3 Quartos Menino Deus - Vista Guaíba",
        tipo: "apartamento",
        preco: 920000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 140,
        bairro: "Menino Deus",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 800",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "vista para o Guaíba", "sacada"],
        descricao: "Apartamento com vista privilegiada para o Lago Guaíba.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 4 Quartos Três Figueiras - Com Piscina",
        tipo: "casa",
        preco: 1800000,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 380,
        bairro: "Três Figueiras",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 1100",
        features: ["quintal grande", "piscina", "churrasqueira", "área gourmet", "jardim", "garagem coberta", "pet friendly"],
        descricao: "Casa de alto padrão com piscina e área de lazer completa.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 2 Quartos Petrópolis - Novo",
        tipo: "apartamento",
        preco: 750000,
        quartos: 2,
        banheiros: 2,
        vagas: 2,
        area: 95,
        bairro: "Petrópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Ipiranga, 2800",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "prédio novo"],
        descricao: "Apartamento em prédio novo, acabamento de primeira linha.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // ============================================
    // PÚBLICO A - PADRÃO (R$ 200K - R$ 600K)
    // ============================================
    
    // Apartamentos A
    createImovel({
        titulo: "Apartamento 2 Quartos Higienópolis - Bem Localizado",
        tipo: "apartamento",
        preco: 420000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 70,
        bairro: "Higienópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 1600",
        features: ["portaria", "elevador", "sacada", "próximo ao shopping", "transporte público"],
        descricao: "Apartamento bem localizado, próximo a comércio e transporte.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 2 Quartos Bela Vista - Com Sacada",
        tipo: "apartamento",
        preco: 380000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 68,
        bairro: "Bela Vista",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 280",
        features: ["portaria", "elevador", "sacada grande", "próximo a parques"],
        descricao: "Apartamento com sacada espaçosa em bairro tranquilo.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Vila Jardim - Com Quintal",
        tipo: "casa",
        preco: 480000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 165,
        bairro: "Vila Jardim",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2100",
        features: ["quintal", "churrasqueira", "garagem", "jardim", "área de serviço"],
        descricao: "Casa térrea com quintal arborizado, ideal para família.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 1 Quarto Centro - Kitchenette",
        tipo: "apartamento",
        preco: 240000,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        area: 42,
        bairro: "Centro Histórico",
        cidade: "Porto Alegre",
        regiao: "Zona Leste",
        endereco: "Rua dos Andradas, 700",
        features: ["elevador", "kitchenette", "próximo ao centro", "transporte público"],
        descricao: "Kitchenette funcional no coração de Porto Alegre.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // ============================================
    // IMÓVEIS PARA ALUGUEL
    // ============================================
    
    // Aluguel AAA
    createImovel({
        titulo: "Cobertura 4 Quartos Moinhos de Vento - Aluguel",
        tipo: "cobertura",
        preco: 12000, // Aluguel mensal
        quartos: 4,
        banheiros: 4,
        vagas: 4,
        area: 300,
        bairro: "Moinhos de Vento",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Padre Chagas, 1200",
        features: ["área gourmet", "piscina privativa", "vista panorâmica", "terraço", "portaria 24h", "pet friendly"],
        descricao: "Cobertura de luxo para aluguel, mobiliada.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    // Aluguel AA
    createImovel({
        titulo: "Apartamento 3 Quartos Petrópolis - Aluguel",
        tipo: "apartamento",
        preco: 4500,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 120,
        bairro: "Petrópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Ipiranga, 2500",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "mobiliado"],
        descricao: "Apartamento mobiliado para aluguel, pronto para morar.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 4 Quartos Três Figueiras - Aluguel",
        tipo: "casa",
        preco: 5500,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 320,
        bairro: "Três Figueiras",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 1000",
        features: ["quintal grande", "piscina", "churrasqueira", "jardim", "garagem coberta", "pet friendly"],
        descricao: "Casa espaçosa para aluguel, ideal para família grande.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    // Aluguel A
    createImovel({
        titulo: "Apartamento 2 Quartos Higienópolis - Aluguel",
        tipo: "apartamento",
        preco: 1800,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 65,
        bairro: "Higienópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 1400",
        features: ["portaria", "elevador", "sacada", "próximo ao shopping"],
        descricao: "Apartamento para aluguel, bem localizado.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Vila Jardim - Aluguel",
        tipo: "casa",
        preco: 2200,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 150,
        bairro: "Vila Jardim",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2000",
        features: ["quintal", "churrasqueira", "garagem", "jardim"],
        descricao: "Casa térrea para aluguel, com quintal.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Studio Cidade Baixa - Aluguel",
        tipo: "studio",
        preco: 1200,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        area: 38,
        bairro: "Cidade Baixa",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua João Pessoa, 350",
        features: ["mobiliado", "próximo ao centro", "vida noturna"],
        descricao: "Studio mobiliado para aluguel, ideal para solteiros.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    // ============================================
    // MAIS VARIEDADE - DIFERENTES CARACTERÍSTICAS
    // ============================================
    
    // Com Piscina
    createImovel({
        titulo: "Apartamento 3 Quartos Auxiliadora - Com Piscina",
        tipo: "apartamento",
        preco: 680000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 118,
        bairro: "Auxiliadora",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2200",
        features: ["portaria 24h", "academia", "piscina", "sauna", "churrasqueira", "elevador", "pet friendly"],
        descricao: "Apartamento em condomínio com piscina e lazer completo.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 4 Quartos Glória - Com Piscina",
        tipo: "casa",
        preco: 1100000,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 300,
        bairro: "Glória",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 750",
        features: ["quintal grande", "piscina", "churrasqueira", "jardim", "garagem coberta", "pet friendly"],
        descricao: "Casa com piscina e área de lazer completa.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // Pet Friendly
    createImovel({
        titulo: "Apartamento 2 Quartos Bom Fim - Pet Friendly",
        tipo: "apartamento",
        preco: 580000,
        quartos: 2,
        banheiros: 2,
        vagas: 1,
        area: 85,
        bairro: "Bom Fim",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Osvaldo Aranha, 1000",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "sacada", "área para pets"],
        descricao: "Apartamento ideal para quem tem pets, com área dedicada.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Vila Assunção - Pet Friendly",
        tipo: "casa",
        preco: 720000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 210,
        bairro: "Vila Assunção",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 350",
        features: ["quintal", "churrasqueira", "garagem", "jardim", "pet friendly", "área para pets"],
        descricao: "Casa com quintal grande, perfeita para pets.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // Com Academia
    createImovel({
        titulo: "Apartamento 2 Quartos Jardim Botânico - Com Academia",
        tipo: "apartamento",
        preco: 550000,
        quartos: 2,
        banheiros: 2,
        vagas: 1,
        area: 78,
        bairro: "Jardim Botânico",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 520",
        features: ["portaria 24h", "academia completa", "piscina", "pet friendly", "elevador", "próximo ao parque"],
        descricao: "Apartamento em condomínio com academia completa e equipada.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // Região Metropolitana - Variedade
    createImovel({
        titulo: "Apartamento 2 Quartos Canoas - Novo",
        tipo: "apartamento",
        preco: 380000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 72,
        bairro: "Centro",
        cidade: "Canoas",
        regiao: "Região Metropolitana",
        endereco: "Av. Getúlio Vargas, 600",
        features: ["portaria", "academia", "piscina", "elevador", "prédio novo"],
        descricao: "Apartamento em prédio novo em Canoas.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Viamão - Com Piscina",
        tipo: "casa",
        preco: 520000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 180,
        bairro: "Centro",
        cidade: "Viamão",
        regiao: "Região Metropolitana",
        endereco: "Rua Coronel Theodomiro Porto da Fonseca, 600",
        features: ["quintal", "piscina", "churrasqueira", "garagem", "jardim"],
        descricao: "Casa com piscina em Viamão, próximo ao centro.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 3 Quartos Gravataí - Aluguel",
        tipo: "apartamento",
        preco: 2000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 95,
        bairro: "Centro",
        cidade: "Gravataí",
        regiao: "Região Metropolitana",
        endereco: "Av. Dorival Cândido Luz de Oliveira, 900",
        features: ["portaria 24h", "academia", "piscina", "elevador", "mobiliado"],
        descricao: "Apartamento mobiliado para aluguel em Gravataí.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 4 Quartos Novo Hamburgo - Com Piscina",
        tipo: "casa",
        preco: 850000,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 280,
        bairro: "Centro",
        cidade: "Novo Hamburgo",
        regiao: "Região Metropolitana",
        endereco: "Rua General Osório, 400",
        features: ["quintal grande", "piscina", "churrasqueira", "jardim", "garagem coberta", "pet friendly"],
        descricao: "Casa espaçosa com piscina em Novo Hamburgo.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // Mais Studios e Lofs
    createImovel({
        titulo: "Loft Bom Fim - Reformado",
        tipo: "studio",
        preco: 420000,
        quartos: 1,
        banheiros: 1,
        vagas: 1,
        area: 60,
        bairro: "Bom Fim",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Osvaldo Aranha, 900",
        features: ["alto pé direito", "decoração moderna", "sacada", "elevador", "reformado"],
        descricao: "Loft moderno totalmente reformado, pronto para morar.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Studio Centro - Aluguel",
        tipo: "studio",
        preco: 1000,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        area: 35,
        bairro: "Centro Histórico",
        cidade: "Porto Alegre",
        regiao: "Zona Leste",
        endereco: "Rua dos Andradas, 400",
        features: ["mobiliado", "próximo ao centro", "elevador"],
        descricao: "Studio mobiliado para aluguel no centro.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    // Mais Coberturas
    createImovel({
        titulo: "Cobertura 3 Quartos Petrópolis - Vista Panorâmica",
        tipo: "cobertura",
        preco: 2200000,
        quartos: 3,
        banheiros: 3,
        vagas: 3,
        area: 250,
        bairro: "Petrópolis",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Ipiranga, 3200",
        features: ["área gourmet", "piscina privativa", "vista panorâmica", "terraço", "portaria 24h", "pet friendly"],
        descricao: "Cobertura com vista privilegiada para a cidade.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    // Mais variedade de bairros
    createImovel({
        titulo: "Apartamento 2 Quartos Rio Branco",
        tipo: "apartamento",
        preco: 450000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 75,
        bairro: "Rio Branco",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 1900",
        features: ["portaria", "elevador", "sacada", "próximo ao centro"],
        descricao: "Apartamento bem localizado no Rio Branco.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Camaquã - Com Quintal",
        tipo: "casa",
        preco: 550000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 190,
        bairro: "Camaquã",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 450",
        features: ["quintal grande", "churrasqueira", "jardim", "garagem", "pet friendly"],
        descricao: "Casa com quintal espaçoso em Camaquã.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 1 Quarto Floresta - Aluguel",
        tipo: "apartamento",
        preco: 1400,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        area: 45,
        bairro: "Floresta",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 1700",
        features: ["elevador", "sacada", "próximo ao Parque da Redenção", "mobiliado"],
        descricao: "Kitchenette para aluguel próximo ao parque.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 2 Quartos Partenon - Aluguel",
        tipo: "casa",
        preco: 1600,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 100,
        bairro: "Partenon",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 120",
        features: ["quintal", "garagem", "área de serviço"],
        descricao: "Casa térrea para aluguel em Partenon.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Apartamento 3 Quartos Boa Vista - Com Piscina",
        tipo: "apartamento",
        preco: 650000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 110,
        bairro: "Boa Vista",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2400",
        features: ["portaria 24h", "academia", "piscina", "sauna", "elevador", "pet friendly"],
        descricao: "Apartamento em condomínio com piscina e sauna.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 5 Quartos Três Figueiras - Mansão",
        tipo: "casa",
        preco: 3200000,
        quartos: 5,
        banheiros: 4,
        vagas: 4,
        area: 550,
        bairro: "Três Figueiras",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 1300",
        features: ["quintal enorme", "piscina", "sauna", "área gourmet", "churrasqueira", "jardim", "playground", "quadra", "garagem coberta"],
        descricao: "Mansão de alto luxo com todos os requintes.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 4 Quartos Auxiliadora - Premium",
        tipo: "apartamento",
        preco: 1450000,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 200,
        bairro: "Auxiliadora",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2300",
        features: ["portaria 24h", "academia", "piscina", "sauna", "churrasqueira", "playground", "pet friendly", "elevador", "área gourmet"],
        descricao: "Apartamento de alto padrão com lazer completo.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos São Geraldo - Bem Localizada",
        tipo: "casa",
        preco: 420000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 155,
        bairro: "São Geraldo",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 220",
        features: ["quintal", "churrasqueira", "garagem", "jardim"],
        descricao: "Casa bem localizada em São Geraldo.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 2 Quartos Medianeira - Aluguel",
        tipo: "apartamento",
        preco: 1700,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 68,
        bairro: "Medianeira",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 160",
        features: ["portaria", "elevador", "sacada", "mobiliado"],
        descricao: "Apartamento mobiliado para aluguel.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 4 Quartos Cachoeirinha - Com Piscina",
        tipo: "casa",
        preco: 620000,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        area: 240,
        bairro: "Centro",
        cidade: "Cachoeirinha",
        regiao: "Região Metropolitana",
        endereco: "Av. General Flores da Cunha, 400",
        features: ["quintal grande", "piscina", "churrasqueira", "jardim", "garagem coberta"],
        descricao: "Casa com piscina em Cachoeirinha.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 3 Quartos São Leopoldo - Aluguel",
        tipo: "apartamento",
        preco: 2100,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 98,
        bairro: "Centro",
        cidade: "São Leopoldo",
        regiao: "Região Metropolitana",
        endereco: "Rua Independência, 300",
        features: ["portaria 24h", "academia", "piscina", "elevador", "mobiliado"],
        descricao: "Apartamento mobiliado para aluguel em São Leopoldo.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 2 Quartos Lomba do Pinheiro - Aluguel",
        tipo: "casa",
        preco: 1300,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 92,
        bairro: "Lomba do Pinheiro",
        cidade: "Porto Alegre",
        regiao: "Zona Leste",
        endereco: "Rua Doutor Timóteo, 40",
        features: ["quintal", "garagem", "área de serviço"],
        descricao: "Casa térrea para aluguel com bom custo-benefício.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Apartamento 2 Quartos Vila Jardim - Com Academia",
        tipo: "apartamento",
        preco: 440000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 74,
        bairro: "Vila Jardim",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Av. Protásio Alves, 2150",
        features: ["portaria", "academia completa", "piscina", "elevador", "pet friendly"],
        descricao: "Apartamento em condomínio com academia completa.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Eldorado do Sul - Com Piscina",
        tipo: "casa",
        preco: 780000,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 270,
        bairro: "Centro",
        cidade: "Eldorado do Sul",
        regiao: "Região Metropolitana",
        endereco: "Av. Getúlio Vargas, 700",
        features: ["quintal grande", "piscina", "churrasqueira", "jardim", "garagem coberta", "pet friendly"],
        descricao: "Casa com piscina em Eldorado do Sul.",
        imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Apartamento 1 Quarto Bom Fim - Aluguel",
        tipo: "apartamento",
        preco: 1500,
        quartos: 1,
        banheiros: 1,
        vagas: 0,
        area: 50,
        bairro: "Bom Fim",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Av. Osvaldo Aranha, 700",
        features: ["elevador", "sacada", "próximo a parques", "mobiliado", "vida noturna"],
        descricao: "Kitchenette mobiliada para aluguel em bairro boêmio.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Sapucaia do Sul - Aluguel",
        tipo: "casa",
        preco: 1900,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 160,
        bairro: "Centro",
        cidade: "Sapucaia do Sul",
        regiao: "Região Metropolitana",
        endereco: "Av. Getúlio Vargas, 350",
        features: ["quintal", "churrasqueira", "garagem", "jardim"],
        descricao: "Casa para aluguel em Sapucaia do Sul.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Cobertura 2 Quartos Moinhos de Vento - Aluguel",
        tipo: "cobertura",
        preco: 8500,
        quartos: 2,
        banheiros: 2,
        vagas: 2,
        area: 140,
        bairro: "Moinhos de Vento",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Padre Chagas, 900",
        features: ["área gourmet", "vista panorâmica", "terraço", "portaria 24h", "mobiliada"],
        descricao: "Cobertura mobiliada para aluguel de curto prazo.",
        imagem: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Apartamento 2 Quartos Medianeira - Com Piscina",
        tipo: "apartamento",
        preco: 400000,
        quartos: 2,
        banheiros: 1,
        vagas: 1,
        area: 72,
        bairro: "Medianeira",
        cidade: "Porto Alegre",
        regiao: "Zona Norte",
        endereco: "Rua Doutor Timóteo, 170",
        features: ["portaria", "academia", "piscina", "elevador", "pet friendly"],
        descricao: "Apartamento em condomínio com piscina.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "venda"
    }),
    
    createImovel({
        titulo: "Casa 3 Quartos Esteio - Aluguel",
        tipo: "casa",
        preco: 1800,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 140,
        bairro: "Centro",
        cidade: "Esteio",
        regiao: "Região Metropolitana",
        endereco: "Av. Getúlio Vargas, 300",
        features: ["quintal", "churrasqueira", "garagem"],
        descricao: "Casa térrea para aluguel em Esteio.",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Loft Cidade Baixa - Aluguel",
        tipo: "studio",
        preco: 1800,
        quartos: 1,
        banheiros: 1,
        vagas: 1,
        area: 55,
        bairro: "Cidade Baixa",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua João Pessoa, 450",
        features: ["alto pé direito", "decoração moderna", "sacada", "vida noturna", "mobiliado"],
        descricao: "Loft mobiliado para aluguel na região mais boêmia.",
        imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    }),
    
    createImovel({
        titulo: "Apartamento 3 Quartos Jardim Botânico - Aluguel",
        tipo: "apartamento",
        preco: 3200,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        area: 118,
        bairro: "Jardim Botânico",
        cidade: "Porto Alegre",
        regiao: "Zona Sul",
        endereco: "Rua Doutor Timóteo, 530",
        features: ["portaria 24h", "academia", "piscina", "pet friendly", "elevador", "mobiliado"],
        descricao: "Apartamento mobiliado próximo ao Jardim Botânico.",
        imagem: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        tipo_operacao: "aluguel"
    })
];

// Combinar arrays
const imoveisPOAExpandido = [...baseImoveis, ...novosImoveis];

// Adicionar tipo_operacao padrão 'venda' para imóveis antigos que não têm
imoveisPOAExpandido.forEach(imovel => {
    if (!imovel.tipo_operacao) {
        imovel.tipo_operacao = 'venda';
    }
});

// Export
if (typeof window !== 'undefined') {
    window.imoveisPOA = imoveisPOAExpandido;
}

