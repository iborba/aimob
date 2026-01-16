// ========================================
// FILTRO E RENDERIZAÇÃO DE IMÓVEIS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Wait for database to load
    if (typeof window.imoveisPOA === 'undefined') {
        setTimeout(initFilters, 500);
    } else {
        initFilters();
    }
});

// Make initFilters globally accessible
window.initFilters = function() {
    const imoveis = window.imoveisPOA || [];
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {
        tipo: urlParams.get('tipo') || '',
        quartos: urlParams.get('quartos') ? parseInt(urlParams.get('quartos')) : null,
        preco_min: urlParams.get('preco_min') ? parseInt(urlParams.get('preco_min')) : null,
        preco_max: urlParams.get('preco_max') ? parseInt(urlParams.get('preco_max')) : null,
        localizacao: urlParams.get('localizacao') || '',
        features: urlParams.get('features') ? urlParams.get('features').split(',') : []
    };
    
    // Apply filters
    let filteredImoveis = imoveis.filter(imovel => {
        if (filters.tipo && imovel.tipo !== filters.tipo) return false;
        if (filters.quartos && imovel.quartos < filters.quartos) return false;
        if (filters.preco_min && imovel.preco < filters.preco_min) return false;
        if (filters.preco_max && imovel.preco > filters.preco_max) return false;
        if (filters.localizacao && !imovel.regiao.toLowerCase().includes(filters.localizacao.toLowerCase()) && 
            !imovel.bairro.toLowerCase().includes(filters.localizacao.toLowerCase())) return false;
        if (filters.features.length > 0) {
            const hasAllFeatures = filters.features.every(feature => 
                imovel.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
            );
            if (!hasAllFeatures) return false;
        }
        return true;
    });
    
    // Update page header
    updatePageHeader(filteredImoveis.length, filters);
    
    // Update filters UI
    updateFiltersUI(filters);
    
    // Render properties
    renderProperties(filteredImoveis);
};

function updatePageHeader(count, filters) {
    const header = document.querySelector('.page-header h1');
    const subtitle = document.querySelector('.page-header p');
    
    if (header) {
        if (count === 0) {
            header.innerHTML = 'Nenhum imóvel encontrado';
        } else {
            header.innerHTML = `Encontramos <span class="text-gradient">${count} imóveis</span>`;
        }
    }
    
    if (subtitle) {
        const filterText = [];
        if (filters.tipo) filterText.push(filters.tipo);
        if (filters.quartos) filterText.push(`${filters.quartos}+ quartos`);
        if (filters.preco_max) filterText.push(`até ${formatCurrency(filters.preco_max)}`);
        if (filters.localizacao) filterText.push(filters.localizacao);
        
        if (filterText.length > 0) {
            subtitle.textContent = `Filtros: ${filterText.join(', ')}`;
        } else {
            subtitle.textContent = 'Explore nossa seleção de imóveis na Região Metropolitana de Porto Alegre/RS';
        }
    }
}

function updateFiltersUI(filters) {
    // Update tipo filter
    const tipoSelect = document.querySelector('.filters-bar select');
    if (tipoSelect && filters.tipo) {
        tipoSelect.value = filters.tipo;
    }
    
    // Update results count
    const countSpan = document.querySelector('.results-count strong');
    if (countSpan) {
        const imoveis = window.imoveisPOA || [];
        const filtered = imoveis.filter(i => {
            if (filters.tipo && i.tipo !== filters.tipo) return false;
            if (filters.quartos && i.quartos < filters.quartos) return false;
            if (filters.preco_max && i.preco > filters.preco_max) return false;
            return true;
        });
        countSpan.textContent = filtered.length;
    }
}

function renderProperties(imoveis) {
    const grid = document.querySelector('.properties-grid');
    if (!grid) return;
    
    // Clear existing
    grid.innerHTML = '';
    
    if (imoveis.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 4rem; color: var(--color-text-muted); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 12px;">Nenhum imóvel encontrado</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 24px;">
                    Tente ajustar os filtros ou <a href="../index.html" style="color: var(--color-primary);">volte para conversar com a Luna</a>
                </p>
            </div>
        `;
        return;
    }
    
    imoveis.forEach(imovel => {
        const card = createPropertyCard(imovel);
        grid.appendChild(card);
    });
}

function createPropertyCard(imovel) {
    const card = document.createElement('article');
    card.className = 'property-card';
    
    const tipoLabel = {
        'apartamento': 'Apartamento',
        'casa': 'Casa',
        'cobertura': 'Cobertura',
        'studio': 'Studio'
    }[imovel.tipo] || imovel.tipo;
    
    card.innerHTML = `
        <div class="property-image">
            <img src="${imovel.imagem}" alt="${imovel.titulo}" loading="lazy">
            ${imovel.preco > 1500000 ? '<span class="badge badge-premium">Premium</span>' : ''}
            ${imovel.preco < 300000 ? '<span class="badge badge-new">Oportunidade</span>' : ''}
            <button class="property-favorite" aria-label="Favoritar">
                <i class="far fa-heart"></i>
            </button>
            <div class="property-price">${formatCurrency(imovel.preco)}</div>
        </div>
        <div class="property-content">
            <div class="property-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${imovel.bairro}, ${imovel.cidade} - RS</span>
            </div>
            <h3 class="property-title">${imovel.titulo}</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; margin: 8px 0;">${imovel.descricao}</p>
            <div class="property-features">
                <div class="feature">
                    <i class="fas fa-bed"></i>
                    <span>${imovel.quartos} Quarto${imovel.quartos > 1 ? 's' : ''}</span>
                </div>
                <div class="feature">
                    <i class="fas fa-bath"></i>
                    <span>${imovel.banheiros} Banheiro${imovel.banheiros > 1 ? 's' : ''}</span>
                </div>
                ${imovel.vagas > 0 ? `
                <div class="feature">
                    <i class="fas fa-car"></i>
                    <span>${imovel.vagas} Vaga${imovel.vagas > 1 ? 's' : ''}</span>
                </div>
                ` : ''}
                <div class="feature">
                    <i class="fas fa-ruler-combined"></i>
                    <span>${imovel.area} m²</span>
                </div>
            </div>
            ${imovel.features && imovel.features.length > 0 ? `
            <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${imovel.features.slice(0, 3).map(f => `<span style="font-size: 0.75rem; padding: 4px 8px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; color: #8b5cf6;">${f}</span>`).join('')}
            </div>
            ` : ''}
            <div class="property-footer">
                <a href="imovel-detalhe.html?id=${imovel.id}" class="btn btn-outline">Ver Detalhes</a>
                <a href="https://wa.me/5551999999999?text=Olá! Tenho interesse no imóvel: ${encodeURIComponent(imovel.titulo)}" class="btn-whatsapp" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>
        </div>
    `;
    
    return card;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    }).format(value);
}

