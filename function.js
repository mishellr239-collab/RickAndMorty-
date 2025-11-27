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
// AÑADIDO: LÓGICA DE AUDIO 🎶
// ====================================================================

/**
 * Maneja el inicio de la música tras la interacción del usuario.
 * Llamada por el 'onclick="startMusic()"' del botón en el HTML.
 */
function startMusic() {
    const audio = document.getElementById('background-music');
    const overlay = document.getElementById('audioConsentOverlay');
    
    // Ajusta el volumen a un nivel agradable (40%)
    audio.volume = 0.4; 

    audio.play()
        .then(() => {
            console.log('Música iniciada por interacción del usuario.');
            // Ocultar el overlay con una transición
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex'); // Quitar display flex para eliminarlo completamente del flujo
            }, 500);
        })
        .catch(error => {
            console.error('Error al intentar reproducir el audio:', error);
            // Si falla, ocultar el overlay de todas formas para no bloquear la UI
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }, 500);
        });
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
            <h3 class="text-xl font-bold gradient-text mb-2">${character.name}</h3>
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
            character.episode[0] ? fetch(character.episode[0]).then(
