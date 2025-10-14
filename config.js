// Configuración de la API
const CONFIG = {
  // URL de tu API de Railway
  API_URL: 'https://medellin-glampling-weel-backend-production.up.railway.app',
  
  // Endpoints
  ENDPOINTS: {
    REGISTRAR_PREMIO: '/api/registrar-premio',
    OBTENER_PREMIOS: '/api/premios'
  },
  
  // Configuración de la ruleta
  RULETA: {
    FRICTION: 0.991,
    MIN_VELOCITY: 0.25,
    MAX_VELOCITY: 0.45,
    MIN_ROTATIONS: 5,
    MAX_ROTATIONS: 8
  },
  
  // Mensajes
  MESSAGES: {
    ERROR_SERVIDOR: 'Error al conectar con el servidor. Inténtalo de nuevo.',
    EMAIL_REQUERIDO: '¡Necesitas ingresar tu correo electrónico!',
    EMAIL_INVALIDO: '¡Por favor ingresa un correo electrónico válido!',
    PREMIO_VALIDADO: 'Tu premio ha sido validado exitosamente.'
  }
};

// Función para obtener la URL completa del endpoint
function getApiUrl(endpoint) {
  return CONFIG.API_URL + endpoint;
}

// Función para hacer llamadas a la API
async function callApi(endpoint, data) {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en API call:', error);
    throw error;
  }
}
