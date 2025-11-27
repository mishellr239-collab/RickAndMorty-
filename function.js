// ====================================================================
// 1. ESTADO GLOBAL
// ====================================================================

let allCharacters = []; // Almacenará todos los personajes cargados
// Usa Set para mejor rendimiento en la gestión de favoritos
let favorites = new Set(JSON.parse(localStorage.getItem('favPersonajes') || '[]')); 
let nextUrl = 'https://rickandmortyapi.com/api/character'; // URL de la próxima página a cargar
let isLoading = false; // Bandera para evitar llamadas duplicadas de scroll
let currentSearch = '';
let currentStatus = '';

// ====================================================================
// 2. ELEMENTOS DEL DOM
// ====================================================================

const charactersGrid = document.getElementById('charactersGrid');
const detailsPanel = document.getElementById('detailsPanel');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const favCount = document.getElementById('favCount');
const favoritesBar = document.getElementById('favoritesBar');
const speciesStatsContainer = document.getElementById('speciesStats');
const typesStatsContainer = document.getElementById('typesStats');

// ====================================================================
// 3. FUNCIONES DE UTILERÍA
// ====================================================================

/**
 * Función para generar partículas de fondo (mantenida de tu código)
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        particlesContainer.appendChild(particle);
    }
}

/**
 * Actualiza los favoritos en LocalStorage y en el contador de la interfaz.
 */
function updateFavoritesStorageAndUI() {
    localStorage.setItem('favPersonajes', JSON.stringify(Array.from(favorites)));
    favCount.textContent = favorites.size;
    updateFavoritesBar();
}

// ====================================================================
// 4. LÓGICA DE FETCHING Y PAGINACIÓN
// ====================================================================

/**
 * Construye la URL de la API con los filtros de búsqueda y estado.
 * @returns {string} La URL base para la consulta.
 */
function buildApiUrl() {
    let url = 'https://rickandmortyapi.com/api/character/?';
    if (currentSearch) {
        url += `name=${encodeURIComponent(currentSearch)}&`;
    }
    if (currentStatus) {
        url += `status=${encodeURIComponent(currentStatus)}&`;
    }
    return url.slice(0, -1); // Elimina el '&' final
}

/**
 * Obtiene personajes desde la API, manejando la paginación y filtros.
 * @param {boolean} resetGrid Si es true, limpia el grid y el estado.
 */
async function fetchCharacters(resetGrid = false) {
    if (isLoading && !resetGrid) return;
    isLoading = true;
    loadingState.classList.remove('hidden');

    if (resetGrid) {
        allCharacters = [];
        charactersGrid.innerHTML = '';
        nextUrl = buildApiUrl();
        // Mostrar panel de detalles por defecto al resetear
        detailsPanel.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center py-12"><span class="text-6xl mb-4">👆</span>
                <p class="text-xl font-semibold gradient-text">Selecciona un personaje</p>
                <p class="text-gray-400 mt-2 text-sm">Haz clic en cualquier tarjeta para ver detalles completos</p>
            </div>
        `;
    }
    
    if (!nextUrl) {
        loadingState.classList.add('hidden');
        isLoading = false;
        if (allCharacters.length === 0) {
            showEmptyState(true);
        } else {
             showEmptyState(false);
        }
        return;
    }

    try {
        const response = await fetch(nextUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                 // Error 404 significa que no hay más resultados para la búsqueda/filtro
                 showEmptyState(true);
                 nextUrl = null; 
                 return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        allCharacters = allCharacters.concat(data.results);
        nextUrl = data.info.next;
        
        displayCharacters(data.results);
        updateStatistics(allCharacters);
        showEmptyState(false);

    } catch (error) {
        console.error('Error al cargar personajes:', error);
    } finally {
        isLoading = false;
        loadingState.classList.add('hidden');
    }
}

// ====================================================================
// 5. RENDERING (Creación de Elementos)
// ====================================================================

/**
 * Muestra u oculta el estado vacío de la búsqueda.
 */
function showEmptyState(show) {
    if (show) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
    }
}

/**
 * Muestra los personajes recién cargados en el grid.
 */
function displayCharacters(characters) {
    characters.forEach(character => {
        const card = createCharacterCard(character);
        charactersGrid.appendChild(card);
    });
}

/**
 * Crea la tarjeta individual de un personaje.
 */
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card glass-effect rounded-xl overflow-hidden cursor-pointer';
    
    const isFavorite = favorites.has(character.id);
    const statusClass = character.status.toLowerCase() === 'alive' ? 'status-alive' : 
                       character.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown';

    card.innerHTML = `
        <div class="relative">
            <img src="${character.image}" alt="${character.name}" class="w-full h-64 object-cover">
            <button 
                class="star-button absolute top-3 right-3 text-3xl"
                data-id="${character.id}"
                aria-label="Toggle favorite"
            >
                ${isFavorite ? '⭐' : '☆'}
            </button>
            <div class="${statusClass} absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span class="w-2 h-2 bg-white rounded-full"></span>
                ${character.status}
            </div>
        </div>
        <div class="p-4">
            <h3 class="text-xl font-bold mb-2 gradient-text">${character.name}</h3>
            <p class="text-gray-400 text-sm mb-1">🧬 ${character.species}</p>
            <p class="text-gray-400 text-sm">⚧ ${character.gender}</p>
        </div>
    `;

    // Listener para abrir detalles
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.star-button')) {
            showCharacterDetails(character);
        }
    });
    
    // Listener específico para el botón de favorito
    card.querySelector('.star-button').addEventListener('click', (e) => {
         e.stopPropagation(); // Evita que se abra el panel de detalles
         toggleFavorite(character.id);
    });


    return card;
}

/**
 * Muestra los detalles de un personaje en el panel lateral. (Mejorado para manejar errores)
 */
async function showCharacterDetails(character) {
    detailsPanel.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="loading-spinner mb-4"></div>
            <p class="text-sm text-gray-400">Cargando detalles...</p>
        </div>
    `;

    try {
        const [originData, locationData, firstEpisodeData] = await Promise.all([
            // Condicionalmente llama a fetch si la URL existe, si no, resuelve con null
            character.origin.url ? fetch(character.origin.url).then(r => r.json()).catch(() => null) : Promise.resolve(null),
            character.location.url ? fetch(character.location.url).then(r => r.json()).catch(() => null) : Promise.resolve(null),
            character.episode[0] ? fetch(character.episode[0]).then(r => r.json()).catch(() => null) : Promise.resolve(null)
        ]);

        const statusClass = character.status.toLowerCase() === 'alive' ? 'status-alive' : 
                           character.status.toLowerCase() === 'dead' ? 'status-dead' : 'status-unknown';

        detailsPanel.innerHTML = `
            <div class="text-center">
                <img src="${character.image}" alt="${character.name}" class="w-48 h-48 rounded-full mx-auto mb-4 pulse-glow border-4 border-cyan-400">
                <h2 class="text-3xl font-black gradient-text mb-2">${character.name}</h2>
                <div class="${statusClass} inline-block px-4 py-2 rounded-full text-sm font-bold mb-6">
                    ${character.status}
                </div>
            </div>

            <div class="space-y-4 mt-6">
                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-cyan-400/30">
                    <p class="text-cyan-400 font-semibold mb-1">🧬 Especie</p>
                    <p class="text-white">${character.species}</p>
                </div>

                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-purple-400/30">
                    <p class="text-purple-400 font-semibold mb-1">⚧ Género</p>
                    <p class="text-white">${character.gender}</p>
                </div>

                ${character.type ? `
                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-pink-400/30">
                    <p class="text-pink-400 font-semibold mb-1">🏷️ Tipo</p>
                    <p class="text-white">${character.type}</p>
                </div>
                ` : ''}

                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-green-400/30">
                    <p class="text-green-400 font-semibold mb-1">🌍 Origen</p>
                    <p class="text-white">${character.origin.name}</p>
                    ${originData && originData.type ? `<p class="text-gray-400 text-sm mt-1">Tipo: ${originData.type}</p>` : ''}
                    ${originData && originData.dimension ? `<p class="text-gray-400 text-sm">Dimensión: ${originData.dimension}</p>` : ''}
                </div>

                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-blue-400/30">
                    <p class="text-blue-400 font-semibold mb-1">📍 Ubicación Actual</p>
                    <p class="text-white">${character.location.name}</p>
                    ${locationData && locationData.type ? `<p class="text-gray-400 text-sm mt-1">Tipo: ${locationData.type}</p>` : ''}
                </div>

                ${firstEpisodeData ? `
                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-yellow-400/30">
                    <p class="text-yellow-400 font-semibold mb-1">📺 Primer Episodio</p>
                    <p class="text-white">${firstEpisodeData.name}</p>
                    <p class="text-gray-400 text-sm mt-1">${firstEpisodeData.episode} - ${firstEpisodeData.air_date}</p>
                </div>
                ` : ''}

                <div class="detail-card bg-gray-800/30 p-4 rounded-lg border border-gray-400/30">
                    <p class="text-gray-400 font-semibold mb-1">📅 Creado</p>
                    <p class="text-white">${new Date(character.created).toLocaleDateString('es-ES')}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        detailsPanel.innerHTML = '<p class="text-red-400 text-center">Error al cargar detalles</p>';
    }
}

// ====================================================================
// 6. FAVORITOS Y UI SECUNDARIA
// ====================================================================

/**
 * Agrega o quita un personaje de favoritos y actualiza la UI.
 */
function toggleFavorite(characterId) {
    if (favorites.has(characterId)) {
        favorites.delete(characterId);
    } else {
        favorites.add(characterId);
    }
    
    updateFavoritesStorageAndUI();
    
    // Re-renderizar la estrella en todas las tarjetas visibles
    document.querySelectorAll(`[data-id="${characterId}"]`).forEach(btn => {
        btn.innerHTML = favorites.has(characterId) ? '⭐' : '☆';
    });
}

/**
 * Actualiza la barra de favoritos en el header.
 */
function updateFavoritesBar() {
    favoritesBar.innerHTML = '';
    
    if (favorites.size === 0) {
        favoritesBar.innerHTML = '<p class="text-gray-400 text-sm">No hay favoritos aún. Haz clic en la estrella (☆) de cualquier personaje.</p>';
        return;
    }

    favorites.forEach(id => {
        // Asegura que solo buscamos personajes que ya se hayan cargado
        const character = allCharacters.find(c => c.id === id); 
        if (character) {
            const badge = document.createElement('div');
            badge.className = 'favorite-badge rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer flex-shrink-0';
            badge.innerHTML = `
                <img src="${character.image}" alt="${character.name}" class="w-10 h-10 rounded-full">
                <span class="font-semibold">${character.name}</span>
                <button onclick="toggleFavorite(${character.id})" class="text-xl hover:scale-125 transition-transform">❌</button>
            `;
            badge.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    showCharacterDetails(character);
                }
            });
            favoritesBar.appendChild(badge);
        }
    });
}

// ====================================================================
// 7. ESTADÍSTICAS
// ====================================================================

/**
 * Calcula y muestra las estadísticas de especies y tipos.
 */
function updateStatistics(characters) {
    const speciesCount = {};
    const typesCount = {};

    characters.forEach(char => {
        speciesCount[char.species] = (speciesCount[char.species] || 0) + 1;
        if (char.type) {
            typesCount[char.type] = (typesCount[char.type] || 0) + 1;
        }
    });

    displayStats(speciesStatsContainer, speciesCount, characters.length);
    displayStats(typesStatsContainer, typesCount, characters.length);
}

/**
 * Dibuja las barras de estadísticas en el DOM. (Mantenida de tu código)
 */
function displayStats(container, data, total) {
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10); // Top 10

    container.innerHTML = sorted.map(([name, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div>
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-300">${name || 'Sin tipo'}</span>
                    <span class="text-sm text-gray-400">${count} (${percentage}%)</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div class="stat-bar h-full rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// ====================================================================
// 8. EVENT LISTENERS
// ====================================================================

// Manejar la búsqueda y el filtrado
function handleFilterChange() {
    currentSearch = searchInput.value.toLowerCase();
    currentStatus = statusFilter.value.toLowerCase();
    // Reinicia el grid y llama a fetchCharacters para una nueva búsqueda desde la página 1
    fetchCharacters(true); 
}

// Debounce para búsqueda (mejora de rendimiento)
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleFilterChange, 400); // Espera 400ms después de escribir
});

// Filtro de estado
statusFilter.addEventListener('change', handleFilterChange);

// Paginación infinita
window.addEventListener('scroll', () => {
    // 500px antes del final de la página
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500; 

    if (isAtBottom && nextUrl && !isLoading) {
        fetchCharacters(false);
    }
});


// ====================================================================
// 9. INICIALIZACIÓN
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    // La carga inicial debe ser un reset para empezar en la página 1 de la API
    fetchCharacters(true); 
    updateFavoritesStorageAndUI(); 
});
