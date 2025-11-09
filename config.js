// Configuración de la API
const CONFIG = {
  // URL de tu API de Railway
  API_URL: 'https://medellin-glampling-weel-backend-production.up.railway.app',
  
  // Endpoints
  ENDPOINTS: {
    REGISTRAR_PREMIO: '/api/registrar-premio',
    OBTENER_PREMIOS: '/api/premios',
    VALIDAR_EMAIL: '/api/validar-email'
  },
  
  // Configuración de la ruleta
  RULETA: {
    FRICTION: 0.991,
    MIN_VELOCITY: 0.25,
    MAX_VELOCITY: 0.45,
    MIN_ROTATIONS: 5,
    MAX_ROTATIONS: 8
  },
  
  // Control de participación local (localStorage)
  RESTRICCIONES: {
    // Tiempo de espera local en minutos antes de poder girar nuevamente
    TIEMPO_ESPERA_MINUTOS: 30,
    // Tiempo de espera para volver a ganar con el mismo email (en días)
    TIEMPO_ESPERA_EMAIL_DIAS: 7,
    // Key para localStorage
    STORAGE_KEY: 'glamping_ultimo_giro',
    STORAGE_EMAIL_KEY: 'glamping_emails_usados'
  },
  
  // Mensajes
  MESSAGES: {
    ERROR_SERVIDOR: 'Error al conectar con el servidor. Inténtalo de nuevo.',
    EMAIL_REQUERIDO: '¡Necesitas ingresar tu correo electrónico!',
    EMAIL_INVALIDO: '¡Por favor ingresa un correo electrónico válido!',
    PREMIO_VALIDADO: 'Tu premio ha sido validado exitosamente.',
    DEBE_ESPERAR: 'Debes esperar antes de volver a participar.',
    EMAIL_YA_USADO: 'Este correo ya fue usado en este dispositivo. Intenta con otro correo.'
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
