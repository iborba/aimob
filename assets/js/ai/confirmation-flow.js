// ========================================
// CONFIRMATION FLOW - Structured Summary
// Creates structured summary before search
// ========================================

/**
 * Generate structured summary of extracted criteria
 * @param {Object} extractedData - All extracted criteria
 * @returns {string} - Formatted summary message
 */
function generateStructuredSummary(extractedData) {
    const summary = [];
    const details = [];
    
    // Type
    if (extractedData.propertyType) {
        const typeLabels = {
            'apartamento': 'Apartamento',
            'casa': 'Casa',
            'studio': 'Studio',
            'cobertura': 'Cobertura'
        };
        details.push(`Tipo: ${typeLabels[extractedData.propertyType] || extractedData.propertyType}`);
    }
    
    // Bedrooms
    if (extractedData.bedrooms) {
        details.push(`Quartos: ${extractedData.bedrooms}`);
    }
    
    // Bathrooms
    if (extractedData.bathrooms) {
        details.push(`Banheiros: ${extractedData.bathrooms}`);
    }
    
    // Location
    if (extractedData.location || extractedData.city) {
        let locationStr = extractedData.location || extractedData.city;
        if (extractedData.zone) {
            locationStr += ` (Zona ${extractedData.zone.charAt(0).toUpperCase() + extractedData.zone.slice(1)})`;
        }
        if (extractedData.neighborhood) {
            locationStr += ` - ${extractedData.neighborhood}`;
        }
        details.push(`Localização: ${locationStr}`);
    }
    
    // Budget
    if (extractedData.budget) {
        let budgetStr = '';
        if (extractedData.budget.min && extractedData.budget.max) {
            budgetStr = `R$ ${formatCurrency(extractedData.budget.min)} a R$ ${formatCurrency(extractedData.budget.max)}`;
        } else if (extractedData.budget.max) {
            budgetStr = `até R$ ${formatCurrency(extractedData.budget.max)}`;
        } else if (extractedData.budget.min) {
            budgetStr = `a partir de R$ ${formatCurrency(extractedData.budget.min)}`;
        }
        if (budgetStr) {
            details.push(`Orçamento: ${budgetStr}`);
        }
    }
    
    // Essential Amenities
    if (extractedData.essentialAmenities && extractedData.essentialAmenities.length > 0) {
        const amenityLabels = {
            'piscina': 'Piscina',
            'garagem': 'Garagem',
            'academia': 'Academia',
            'elevador': 'Elevador',
            'portaria_24h': 'Portaria 24h',
            'seguranca': 'Segurança',
            'churrasqueira': 'Churrasqueira',
            'pet_friendly': 'Aceita Pets',
            'sacada': 'Sacada',
            'area_lazer': 'Área de Lazer'
        };
        const amenitiesList = extractedData.essentialAmenities
            .map(a => amenityLabels[a] || a)
            .join(', ');
        details.push(`Amenities Essenciais: ${amenitiesList}`);
    }
    
    // High Priority Amenities
    if (extractedData.highPriorityAmenities && extractedData.highPriorityAmenities.length > 0) {
        const amenityLabels = {
            'piscina': 'Piscina',
            'garagem': 'Garagem',
            'academia': 'Academia',
            'elevador': 'Elevador',
            'portaria_24h': 'Portaria 24h',
            'seguranca': 'Segurança',
            'churrasqueira': 'Churrasqueira',
            'pet_friendly': 'Aceita Pets',
            'sacada': 'Sacada',
            'area_lazer': 'Área de Lazer'
        };
        const amenitiesList = extractedData.highPriorityAmenities
            .map(a => amenityLabels[a] || a)
            .join(', ');
        details.push(`Amenities Desejáveis: ${amenitiesList}`);
    }
    
    // Additional preferences
    if (extractedData.proximity) {
        details.push(`Próximo de: ${extractedData.proximity}`);
    }
    
    if (extractedData.needsTransportation) {
        details.push(`Precisa: Transporte público`);
    }
    
    if (extractedData.needsSchools) {
        details.push(`Precisa: Escolas próximas`);
    }
    
    if (extractedData.minArea) {
        details.push(`Área mínima: ${extractedData.minArea} m²`);
    }
    
    // Build summary message
    if (details.length > 0) {
        summary.push("📋 RESUMO DA SUA BUSCA:");
        summary.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        summary.push(...details);
        summary.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        summary.push("\nTá tudo certo? Quer que eu comece a busca? 🔍");
    } else {
        summary.push("Deixa eu confirmar o que entendi...");
    }
    
    return summary.join('\n');
}

/**
 * Format currency helper
 */
function formatCurrency(value) {
    if (!value || value === 0) return '0';
    
    if (value >= 1000000) {
        const millions = value / 1000000;
        if (millions % 1 === 0) {
            return `${millions.toFixed(0)} milhão${millions > 1 ? 'ões' : ''}`;
        } else {
            return `${millions.toFixed(1)} milhões`;
        }
    }
    
    if (value >= 1000) {
        const thousands = value / 1000;
        if (thousands % 1 === 0) {
            return `${thousands.toFixed(0)} mil`;
        } else {
            return `${thousands.toFixed(1)} mil`;
        }
    }
    
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        maximumFractionDigits: 0 
    }).format(value);
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.generateStructuredSummary = generateStructuredSummary;
    window.formatCurrency = formatCurrency;
}

