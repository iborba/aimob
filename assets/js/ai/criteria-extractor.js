// ========================================
// CRITERIA EXTRACTOR - Enhanced Extraction
// Extracts ALL criteria including amenities, preferences, and intensity
// ========================================

/**
 * Extract all criteria from user message with intensity recognition
 * @param {string} text - User message
 * @param {string} field - Current field being processed
 * @returns {Object} - Extracted criteria with intensity
 */
function extractAllCriteria(text, field = null) {
    if (!text || typeof text !== 'string') return {};
    
    const lowerText = text.toLowerCase();
    const extracted = {};
    
    // ========================================
    // INTENSITY RECOGNITION
    // ========================================
    const intensityPatterns = {
        essential: /preciso|essencial|obrigatório|tem que ter|não pode faltar|fundamental|indispensável/i,
        high: /gostaria|seria legal|seria ótimo|quero|desejo|preferência/i,
        medium: /se tiver|se der|seria bom|opcional/i,
        exclusion: /não quero|não gosto|evitar|sem|não precisa/i
    };
    
    function getIntensity(text) {
        if (intensityPatterns.essential.test(text)) return 'essential';
        if (intensityPatterns.exclusion.test(text)) return 'exclusion';
        if (intensityPatterns.high.test(text)) return 'high';
        if (intensityPatterns.medium.test(text)) return 'medium';
        return 'high'; // Default to high priority
    }
    
    // ========================================
    // PROPERTY TYPE
    // ========================================
    if (field === 'propertyType' || !leadData.propertyType) {
        if (lowerText.match(/apartamento|apto|ap\b/i)) {
            extracted.propertyType = 'apartamento';
        } else if (lowerText.match(/casa|sobrado|residencial/i)) {
            extracted.propertyType = 'casa';
        } else if (lowerText.match(/studio|loft|kitnet|kitchenette/i)) {
            extracted.propertyType = 'studio';
        } else if (lowerText.match(/cobertura|cobert|penthouse/i)) {
            extracted.propertyType = 'cobertura';
        }
    }
    
    // ========================================
    // BEDROOMS & BATHROOMS
    // ========================================
    if (field === 'bedrooms' || !leadData.bedrooms) {
        const bedroomMatch = text.match(/(\d+)\s*(?:quarto|dormitório|dorm)/i) || 
                            text.match(/(um|dois|três|quatro|cinco|seis)\s*(?:quarto|dormitório)/i);
        if (bedroomMatch) {
            const numMap = { 'um': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5, 'seis': 6 };
            extracted.bedrooms = numMap[bedroomMatch[1]?.toLowerCase()] || parseInt(bedroomMatch[1]) || null;
        }
        
        // Infer from family size
        if (lowerText.match(/sozinho|só eu/i)) extracted.bedrooms = 1;
        else if (lowerText.match(/casal|eu e (?:minha|meu)/i)) extracted.bedrooms = 2;
        else if (lowerText.match(/filhos|família/i)) extracted.bedrooms = 3;
    }
    
    // Bathrooms
    const bathroomMatch = text.match(/(\d+)\s*(?:banheiro|wc|lavabo)/i);
    if (bathroomMatch) {
        extracted.bathrooms = parseInt(bathroomMatch[1]);
    }
    
    // ========================================
    // LOCATION
    // ========================================
    if (field === 'location' || !leadData.location) {
        const cities = {
            'porto alegre': 'Porto Alegre',
            'canoas': 'Canoas',
            'viamão': 'Viamão',
            'gravataí': 'Gravataí',
            'cachoeirinha': 'Cachoeirinha',
            'são leopoldo': 'São Leopoldo',
            'novo hamburgo': 'Novo Hamburgo',
            'alvorada': 'Alvorada',
            'sapucaia do sul': 'Sapucaia do Sul',
            'esteio': 'Esteio',
            'guaíba': 'Guaíba',
            'eldorado do sul': 'Eldorado do Sul'
        };
        
        for (const [key, value] of Object.entries(cities)) {
            if (lowerText.includes(key)) {
                extracted.location = value;
                extracted.city = value;
                break;
            }
        }
        
        // Zone/Region
        if (lowerText.match(/zona\s*(norte|sul|leste|oeste|centro)/i)) {
            const zoneMatch = text.match(/zona\s*(norte|sul|leste|oeste|centro)/i);
            if (zoneMatch) {
                extracted.zone = zoneMatch[1].toLowerCase();
            }
        }
        
        // Neighborhood
        const neighborhoodMatch = text.match(/(?:bairro|no|na|em)\s+([a-záàâãéêíóôõúç\s]+?)(?:,|\.|$|região|zona)/i);
        if (neighborhoodMatch && neighborhoodMatch[1].length > 2 && neighborhoodMatch[1].length < 30) {
            extracted.neighborhood = neighborhoodMatch[1].trim();
        }
    }
    
    // ========================================
    // BUDGET
    // ========================================
    if (field === 'budget.range' || text.match(/mil|milhão|reais|r\$/i)) {
        const hasMillionWord = /milh[oõ]es?/i.test(text);
        
        if (hasMillionWord) {
            const millionMatch = text.match(/(?:até|até\s*|uns?\s*|máximo\s*de\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(?:milh[oõ]es?|m[ií]lh[oõ]es?)/i);
            if (millionMatch) {
                let value = parseFloat(millionMatch[1].replace(',', '.'));
                value *= 1000000;
                extracted.budget = { max: value };
            }
        } else {
            const thousandMatch = text.match(/(?:até|até\s*|uns?\s*|máximo\s*de\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(mil|k)\b/i);
            if (thousandMatch) {
                let value = parseFloat(thousandMatch[1].replace(',', '.'));
                value *= 1000;
                extracted.budget = { max: value };
            }
        }
        
        // Range detection
        const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:a|até|-)\s*(\d+(?:[.,]\d+)?)\s*(milh[oõ]es?|mil|k)/i);
        if (rangeMatch) {
            let min = parseFloat(rangeMatch[1].replace(',', '.'));
            let max = parseFloat(rangeMatch[2].replace(',', '.'));
            const unit = rangeMatch[3];
            if (unit.includes('milhão')) {
                min *= 1000000;
                max *= 1000000;
            } else {
                min *= 1000;
                max *= 1000;
            }
            extracted.budget = { min, max };
        }
        
        // Minimum
        const minMatch = text.match(/(?:mínimo|a partir de|no mínimo)\s*(?:de\s*)?(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(milh[oõ]es?|mil|k)?/i);
        if (minMatch) {
            let value = parseFloat(minMatch[1].replace(',', '.'));
            if (minMatch[2] && minMatch[2].includes('milhão')) {
                value *= 1000000;
            } else if (minMatch[2]) {
                value *= 1000;
            }
            if (!extracted.budget) extracted.budget = {};
            extracted.budget.min = value;
        }
    }
    
    // ========================================
    // AMENITIES & FEATURES
    // ========================================
    const amenities = [];
    const amenitiesMap = {
        'piscina': 'piscina',
        'garagem': 'garagem',
        'vaga': 'garagem',
        'estacionamento': 'garagem',
        'academia': 'academia',
        'ginásio': 'academia',
        'elevador': 'elevador',
        'portaria': 'portaria',
        'portaria 24h': 'portaria_24h',
        'segurança': 'seguranca',
        'churrasqueira': 'churrasqueira',
        'churrasco': 'churrasqueira',
        'área de lazer': 'area_lazer',
        'playground': 'playground',
        'pet friendly': 'pet_friendly',
        'aceita pet': 'pet_friendly',
        'aceita pets': 'pet_friendly',
        'animais': 'pet_friendly',
        'sacada': 'sacada',
        'varanda': 'sacada',
        'terraço': 'terrace',
        'lavanderia': 'lavanderia',
        'quintal': 'quintal',
        'jardim': 'jardim',
        'piscina aquecida': 'piscina_aquecida',
        'sauna': 'sauna',
        'salão de festas': 'salao_festas',
        'quadra': 'quadra',
        'espaço gourmet': 'espaco_gourmet'
    };
    
    // Extract amenities with intensity
    for (const [keyword, amenity] of Object.entries(amenitiesMap)) {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(text)) {
            // Check context for intensity
            const contextStart = Math.max(0, text.toLowerCase().indexOf(keyword) - 50);
            const contextEnd = Math.min(text.length, text.toLowerCase().indexOf(keyword) + keyword.length + 50);
            const context = text.substring(contextStart, contextEnd).toLowerCase();
            
            const intensity = getIntensity(context);
            
            amenities.push({
                name: amenity,
                intensity: intensity,
                keyword: keyword
            });
        }
    }
    
    if (amenities.length > 0) {
        extracted.amenities = amenities;
        
        // Separate by intensity
        extracted.essentialAmenities = amenities.filter(a => a.intensity === 'essential').map(a => a.name);
        extracted.highPriorityAmenities = amenities.filter(a => a.intensity === 'high').map(a => a.name);
        extracted.mediumPriorityAmenities = amenities.filter(a => a.intensity === 'medium').map(a => a.name);
        extracted.excludedAmenities = amenities.filter(a => a.intensity === 'exclusion').map(a => a.name);
    }
    
    // ========================================
    // ADDITIONAL PREFERENCES
    // ========================================
    
    // Proximity preferences
    if (lowerText.match(/perto|próximo|próximo de|perto de/i)) {
        const proximityMatch = text.match(/(?:perto|próximo)(?:\s+de)?\s+([a-záàâãéêíóôõúç\s]+?)(?:,|\.|$)/i);
        if (proximityMatch) {
            extracted.proximity = proximityMatch[1].trim();
        }
    }
    
    // Transportation
    if (lowerText.match(/metrô|metro|ônibus|onibus|transporte|estação|estacao/i)) {
        extracted.needsTransportation = true;
    }
    
    // Schools
    if (lowerText.match(/escola|colégio|colegio|educação|educacao/i)) {
        extracted.needsSchools = true;
    }
    
    // Size preferences
    const sizeMatch = text.match(/(\d+)\s*(?:m²|metros|m2)/i);
    if (sizeMatch) {
        extracted.minArea = parseInt(sizeMatch[1]);
    }
    
    // Age of property
    if (lowerText.match(/novo|recente|lançamento|lancamento/i)) {
        extracted.propertyAge = 'new';
    } else if (lowerText.match(/usado|antigo|reformado/i)) {
        extracted.propertyAge = 'used';
    }
    
    return extracted;
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.extractAllCriteria = extractAllCriteria;
}

