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
    
    // Apply filters - but always return results (smart fallback)
    let filteredImoveis = imoveis.filter(imovel => {
        if (filters.tipo && imovel.tipo !== filters.tipo) return false;
        if (filters.quartos && imovel.quartos < filters.quartos) return false;
        if (filters.preco_min && imovel.preco < filters.preco_min) return false;
        if (filters.preco_max && imovel.preco > filters.preco_max) return false;
        if (filters.localizacao && !imovel.regiao.toLowerCase().includes(filters.localizacao.toLowerCase()) && 
            !imovel.bairro.toLowerCase().includes(filters.localizacao.toLowerCase()) &&
            !imovel.cidade.toLowerCase().includes(filters.localizacao.toLowerCase())) return false;
        if (filters.features.length > 0) {
            const hasAllFeatures = filters.features.every(feature => 
                imovel.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
            );
            if (!hasAllFeatures) return false;
        }
        return true;
    });
    
    // SMART FALLBACK: Se não encontrou resultados exatos, mostrar resultados relevantes
    if (filteredImoveis.length === 0) {
        // Estratégia: relaxar filtros progressivamente
        filteredImoveis = imoveis.filter(imovel => {
            let score = 0;
            let matches = 0;
            let totalFilters = 0;
            
            // Tipo (obrigatório se especificado)
            if (filters.tipo) {
                totalFilters++;
                if (imovel.tipo === filters.tipo) {
                    score += 3;
                    matches++;
                }
            }
            
            // Quartos (relaxar: aceitar 1 quarto a menos)
            if (filters.quartos) {
                totalFilters++;
                if (imovel.quartos >= filters.quartos) {
                    score += 2;
                    matches++;
                } else if (imovel.quartos >= filters.quartos - 1) {
                    score += 1; // Quase match
                }
            }
            
            // Preço (relaxar: aceitar até 20% a mais)
            if (filters.preco_max) {
                totalFilters++;
                if (imovel.preco <= filters.preco_max) {
                    score += 2;
                    matches++;
                } else if (imovel.preco <= filters.preco_max * 1.2) {
                    score += 1; // Quase match (até 20% a mais)
                }
            }
            
            // Localização (relaxar: mesma cidade ou região próxima)
            if (filters.localizacao) {
                totalFilters++;
                const locLower = filters.localizacao.toLowerCase();
                if (imovel.regiao.toLowerCase().includes(locLower) || 
                    imovel.bairro.toLowerCase().includes(locLower) ||
                    imovel.cidade.toLowerCase().includes(locLower)) {
                    score += 3;
                    matches++;
                } else if (imovel.cidade === 'Porto Alegre' && locLower.includes('porto alegre')) {
                    score += 1; // Mesma cidade
                }
            }
            
            // Features (relaxar: pelo menos uma feature)
            if (filters.features.length > 0) {
                totalFilters++;
                const hasAnyFeature = filters.features.some(feature => 
                    imovel.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
                );
                if (hasAnyFeature) {
                    score += 1;
                    matches++;
                }
            }
            
            // Retornar se tem pelo menos 1 match ou score >= 2
            return score >= 2 || matches > 0;
        });
        
        // Se ainda vazio, mostrar os melhores imóveis disponíveis
        if (filteredImoveis.length === 0) {
            // Ordenar por relevância: preço médio, bem localizados, com features
            filteredImoveis = [...imoveis]
                .sort((a, b) => {
                    // Priorizar imóveis com mais features
                    const aFeatures = a.features?.length || 0;
                    const bFeatures = b.features?.length || 0;
                    if (aFeatures !== bFeatures) return bFeatures - aFeatures;
                    // Depois por preço (mais acessíveis primeiro)
                    return a.preco - b.preco;
                })
                .slice(0, 12); // Mostrar até 12 imóveis
        } else {
            // Ordenar resultados relaxados por relevância (score)
            filteredImoveis.sort((a, b) => {
                // Calcular score para cada imóvel
                const scoreA = calculateRelevanceScore(a, filters);
                const scoreB = calculateRelevanceScore(b, filters);
                return scoreB - scoreA;
            });
            
            // Limitar a 20 resultados mais relevantes
            filteredImoveis = filteredImoveis.slice(0, 20);
        }
    }
    
    // Update page header
    updatePageHeader(filteredImoveis.length, filters);
    
    // Update filters UI
    updateFiltersUI(filters);
    
    // Render properties
    renderProperties(filteredImoveis);
};

// Helper function to calculate relevance score
function calculateRelevanceScore(imovel, filters) {
    let score = 0;
    
    if (filters.tipo && imovel.tipo === filters.tipo) score += 3;
    if (filters.quartos && imovel.quartos >= filters.quartos) score += 2;
    if (filters.preco_max && imovel.preco <= filters.preco_max) score += 2;
    if (filters.localizacao) {
        const locLower = filters.localizacao.toLowerCase();
        if (imovel.regiao.toLowerCase().includes(locLower) || 
            imovel.bairro.toLowerCase().includes(locLower)) {
            score += 3;
        }
    }
    if (filters.features && filters.features.length > 0) {
        const matchingFeatures = filters.features.filter(f => 
            imovel.features.some(imf => imf.toLowerCase().includes(f.toLowerCase()))
        ).length;
        score += matchingFeatures;
    }
    
    return score;
}

function updatePageHeader(count, filters) {
    const header = document.querySelector('.page-header h1');
    const subtitle = document.querySelector('.page-header p');
    
    if (header) {
        // NUNCA mostrar "nenhum imóvel encontrado" - sempre mostrar algo
        header.innerHTML = `Encontramos <span class="text-gradient">${count} imóvel${count > 1 ? 'is' : ''}</span>`;
    }
    
    if (subtitle) {
        const filterText = [];
        if (filters.tipo) filterText.push(filters.tipo);
        if (filters.quartos) filterText.push(`${filters.quartos}+ quartos`);
        if (filters.preco_max) filterText.push(`até ${formatCurrency(filters.preco_max)}`);
        if (filters.localizacao) filterText.push(filters.localizacao);
        
        if (filterText.length > 0) {
            subtitle.textContent = `Baseado no que você procurou: ${filterText.join(', ')}`;
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
    
    // NUNCA mostrar "nenhum imóvel encontrado" - sempre renderizar algo
    // Se chegou aqui, filteredImoveis já tem resultados (graças ao fallback inteligente)
    
    if (imoveis.length === 0) {
        // Fallback final: mostrar os melhores imóveis disponíveis
        const allImoveis = window.imoveisPOA || [];
        const bestImoveis = [...allImoveis]
            .sort((a, b) => {
                const aFeatures = a.features?.length || 0;
                const bFeatures = b.features?.length || 0;
                if (aFeatures !== bFeatures) return bFeatures - aFeatures;
                return a.preco - b.preco;
            })
            .slice(0, 12);
        
        bestImoveis.forEach(imovel => {
            const card = createPropertyCard(imovel);
            grid.appendChild(card);
        });
        
        // Adicionar mensagem amigável
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 20px; background: rgba(139, 92, 246, 0.05); border-radius: 12px; margin-top: 20px;';
        messageDiv.innerHTML = `
            <p style="color: var(--color-text); margin: 0;">
                <i class="fas fa-lightbulb" style="color: #8b5cf6; margin-right: 8px;"></i>
                <strong>Dica da Luna:</strong> Essas são algumas opções que podem te interessar! 
                <a href="../index.html" style="color: var(--color-primary); text-decoration: underline;">Converse comigo</a> para refinar ainda mais sua busca! 😊
            </p>
        `;
        grid.appendChild(messageDiv);
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

