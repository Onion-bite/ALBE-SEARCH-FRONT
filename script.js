const API_BASE_URL = 'http://localhost:5056/api';

// Función para detectar cuando se presiona la tecla Enter en el select
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        buscarBecas();
    }
}

async function buscarBecas() {
    const carrera = document.getElementById('carrera').value;

    // Ya no bloqueamos si no hay carrera, porque por defecto cargará "TODAS"
    if (!carrera) {
        alert('Por favor selecciona una opción válida');
        return;
    }

    // Activar el cambio de interfaz (Fondo sólido, banner y reajuste)
    document.body.classList.add('modo-resultados');
    
    // Ocultar resultados previos mientras carga
    document.getElementById('resultados').classList.add('hidden');
    mostrarCargando(true);

    try {
        // Enrutamiento dinámico inteligente
        let url = "";
        if (carrera === "TODAS") {
            // Llama a api/Becas (Listar todas)
            url = `${API_BASE_URL}/becas`; 
        } else {
            // Llama a api/becas/carrera/{carrera}
            url = `${API_BASE_URL}/becas/carrera/${encodeURIComponent(carrera)}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error en la API');
        }

        const becas = await response.json();
        mostrarResultados(becas);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resultados').innerHTML = 
            '<div class="sin-resultados">Error al conectar con la API. Verifica que esté en línea.</div>';
        document.getElementById('resultados').classList.remove('hidden');
    } finally {
        mostrarCargando(false);
    }
}

function mostrarCargando(visible) {
    document.getElementById('loading').classList.toggle('hidden', !visible);
}

function mostrarResultados(becas) {
    const container = document.getElementById('resultados');
    
    // Mostramos el contenedor de resultados
    container.classList.remove('hidden');

    if (becas.length === 0) {
        container.innerHTML = '<div class="sin-resultados">No se encontraron becas para esa carrera.</div>';
        return;
    }

    container.innerHTML = becas.map(beca => {
        // Manejo de Mayúsculas o Minúsculas dependiendo de tu API C# (.id o .Id)
        const idBeca = beca.id || beca.Id || 1;
        const nombreBeca = beca.nombre || beca.Nombre;
        const carreraBeca = beca.carrera || beca.Carrera;
        const descBeca = beca.descripcion || beca.Descripcion;
        const reqBeca = beca.requisitos || beca.Requisitos;
        const fechaBeca = beca.fechaLimite || beca.FechaLimite;

        // Se agregó la estructura Flexbox para separar Imagen (Izquierda) e Info (Derecha)
        return `
        <div class="beca-card">
            <div class="beca-img-container">
                <img src="public/beca-${idBeca}.jpeg" alt="Imagen de ${nombreBeca}" onerror="this.src='public/logo.jpeg'">
            </div>
            
            <div class="beca-info">
                <h3>${nombreBeca}</h3>
                <p><span class="beca-label">Carrera:</span> ${carreraBeca}</p>
                <p><span class="beca-label">Requisitos:</span> ${convertirLinks(reqBeca)}</p>
                <p><span class="beca-label">Descripción:</span> ${convertirLinks(descBeca)}</p>
                <p class="fecha-vencimiento">
                    <img src="https://api.iconify.design/lucide:calendar-clock.svg?color=%23fca5a5" alt="Plazo" class="icono-vence">
                    Vence: ${new Date(fechaBeca).toLocaleDateString('es-ES')}
                </p>
            </div>
        </div>
        `;
    }).join('');
}

function convertirLinks(texto) {
    if (!texto) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return texto.replace(urlRegex, url =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">Ver más aquí</a>`
    );
}