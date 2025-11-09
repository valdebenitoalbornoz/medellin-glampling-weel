// Cargar configuración
const CONFIG = {
  API_URL: 'https://medellin-glampling-weel-backend-production.up.railway.app',
  // API_URL: 'http://localhost:3000',
  ENDPOINTS: {
    REGISTRAR_PREMIO: '/api/registrar-premio',
    VALIDAR_EMAIL: '/api/validar-email'
  }
};

// Variable global para almacenar el email del usuario
let emailUsuario = null;
let puedeGirar = false;

// Sectores de la ruleta con sus probabilidades (Total debe ser 100)
// -80%: 0.1% (muy raro), resto distribuido entre los demás premios
const wheelSectors = [
    { color: '#f5f1e8', textColor: '#8b4513', label: '-5%', probability: 9.1 },
    { color: '#6b8e5a', textColor: '#ffffff', label: '-10%', probability: 16.15 },
    { color: '#d4c4a8', textColor: '#5d4e37', label: '-15%', probability: 8.05 },
    { color: '#5a7a4a', textColor: '#ffffff', label: '-20%', probability: 6.05 },
    { color: '#c4a484', textColor: '#ffffff', label: '-80%', probability: 0.1 },
    { color: '#4a6b3a', textColor: '#ffffff', label: '🍽️', probability: 20.15 },
    { color: '#a68b5b', textColor: '#ffffff', label: '🍷', probability: 20.2 },
    { color: '#8b7355', textColor: '#ffffff', label: '💕', probability: 20.2 }
  ]

// Hacer wheelSectors accesible globalmente para testing
window.wheelSectors = wheelSectors;

// ============================================
// FUNCIONES DE DEBUG PARA TESTING (ejecutar en consola)
// ============================================

// Función para probar probabilidades
// Uso: testProbabilities(10000)
window.testProbabilities = function(iterations = 10000) {
  try {
    console.log('🎲 Iniciando prueba de probabilidades...');
    
    const sectors = window.wheelSectors;
    if (!sectors || sectors.length === 0) {
      console.error('❌ Error: wheelSectors no está definido o está vacío');
      return;
    }
    
    const results = {};
    sectors.forEach(sector => results[sector.label] = 0);
    
    const totalProbability = sectors.reduce((sum, sector) => sum + sector.probability, 0);
    console.log('📊 Total de probabilidades:', totalProbability);
    console.log('🔄 Ejecutando', iterations, 'simulaciones...\n');
    
    for (let i = 0; i < iterations; i++) {
      const random = Math.random() * totalProbability;
      let cumulativeProbability = 0;
      
      for (let j = 0; j < sectors.length; j++) {
        cumulativeProbability += sectors[j].probability;
        if (random <= cumulativeProbability) {
          results[sectors[j].label]++;
          break;
        }
      }
    }
    
    console.log('🎰 Resultados de ' + iterations + ' iteraciones:\n');
    console.log('═'.repeat(60));
    
    sectors.forEach(sector => {
      const count = results[sector.label];
      const percentage = ((count / iterations) * 100).toFixed(2);
      const expected = sector.probability;
      const diff = (percentage - expected).toFixed(2);
      const diffSign = diff >= 0 ? '+' : '';
      console.log(sector.label + ': ' + count + ' veces (' + percentage + '%) | Esperado: ' + expected + '% | Diferencia: ' + diffSign + diff + '%');
    });
    
    console.log('═'.repeat(60));
    console.log('✅ Prueba completada exitosamente\n');
    
    return results;
  } catch (error) {
    console.error('❌ Error al ejecutar testProbabilities:', error);
    console.error('Stack:', error.stack);
  }
}

// Función para limpiar restricciones locales (para testing)
// Uso: clearRestrictions()
window.clearRestrictions = function() {
  localStorage.removeItem('glamping_ultimo_giro');
  localStorage.removeItem('glamping_emails_usados');
  console.log('✅ Restricciones locales eliminadas');
  console.log('🔄 Recarga la página para poder participar de nuevo');
}

// Función para verificar si puede participar (control local)
function verificarParticipacionLocal() {
  const ultimoGiro = localStorage.getItem('glamping_ultimo_giro');
  
  if (!ultimoGiro) {
    return { puede: true };
  }
  
  const tiempoUltimoGiro = parseInt(ultimoGiro);
  const ahora = new Date().getTime();
  const tiempoEsperaMs = 30 * 60 * 1000; // 30 minutos en milisegundos
  const tiempoTranscurrido = ahora - tiempoUltimoGiro;
  
  if (tiempoTranscurrido < tiempoEsperaMs) {
    const minutosRestantes = Math.ceil((tiempoEsperaMs - tiempoTranscurrido) / (60 * 1000));
    return {
      puede: false,
      minutosRestantes: minutosRestantes
    };
  }
  
  return { puede: true };
}

// Función para verificar si un email ya fue usado en este dispositivo
function verificarEmailUsado(email) {
  const emailsUsados = localStorage.getItem('glamping_emails_usados');
  
  if (!emailsUsados) {
    return false;
  }
  
  try {
    const listaEmails = JSON.parse(emailsUsados);
    return listaEmails.some(e => e.toLowerCase() === email.toLowerCase());
  } catch (e) {
    return false;
  }
}

// Función para guardar email usado
function guardarEmailUsado(email) {
  let emailsUsados = [];
  const emailsGuardados = localStorage.getItem('glamping_emails_usados');
  
  if (emailsGuardados) {
    try {
      emailsUsados = JSON.parse(emailsGuardados);
    } catch (e) {
      emailsUsados = [];
    }
  }
  
  if (!emailsUsados.includes(email.toLowerCase())) {
    emailsUsados.push(email.toLowerCase());
    localStorage.setItem('glamping_emails_usados', JSON.stringify(emailsUsados));
  }
}

// Función para registrar la participación
function registrarParticipacion() {
  const ahora = new Date().getTime();
  localStorage.setItem('glamping_ultimo_giro', ahora.toString());
}

// Función para solicitar email antes de girar
async function solicitarEmailYValidar() {
  // Verificar primero si puede participar por tiempo
  const verificacionTiempo = verificarParticipacionLocal();
  
  if (!verificacionTiempo.puede) {
    await Swal.fire({
      title: '⏰ Debes Esperar',
      html: `
        <div style="text-align: center;">
          <p style="color: #2c3e50; margin-bottom: 15px;">
            Ya has participado recientemente desde este dispositivo.
          </p>
          <p style="color: #e74c3c; font-weight: bold; font-size: 18px;">
            Tiempo de espera: ${verificacionTiempo.minutosRestantes} minuto(s)
          </p>
          <p style="color: #7f8c8d; margin-top: 15px; font-size: 14px;">
            ¡Vuelve pronto para intentar ganar!
          </p>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: '🏕️ Conocer Glamping',
      confirmButtonColor: '#27ae60',
      allowOutsideClick: true
    }).then(() => {
      window.open('https://www.medellinglamping.com.co/', '_blank');
    });
    return false;
  }
  
  // Solicitar email
  const result = await Swal.fire({
    title: '🎡 ¡Participa y Gana!',
    html: `
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #2c3e50; margin-bottom: 20px; font-size: 16px;">
          Para girar la ruleta y participar por increíbles premios, 
          ingresa tu correo electrónico:
        </p>
        <p style="color: #7f8c8d; font-size: 13px; margin-top: 10px;">
          Solo puedes participar una vez cada 30 minutos
        </p>
      </div>
    `,
    input: 'email',
    inputPlaceholder: 'tu@email.com',
    inputAttributes: {
      autocomplete: 'email'
    },
    inputValidator: (value) => {
      if (!value) {
        return '¡Necesitas ingresar tu correo electrónico!';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '¡Por favor ingresa un correo electrónico válido!';
      }
      // Verificar si el email ya fue usado en este dispositivo
      if (verificarEmailUsado(value)) {
        return 'Este correo ya fue usado en este dispositivo. Por favor usa otro correo.';
      }
    },
    showCancelButton: true,
    confirmButtonText: '🎯 ¡Girar Ruleta!',
    cancelButtonText: '❌ Cancelar',
    confirmButtonColor: '#27ae60',
    cancelButtonColor: '#95a5a6',
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showLoaderOnConfirm: true,
    preConfirm: async (email) => {
      try {
        // Validar con el backend si el email puede participar
        const response = await fetch(CONFIG.API_URL + CONFIG.ENDPOINTS.VALIDAR_EMAIL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al validar el email');
        }
        
        // Si no puede participar, mostrar error
        if (!data.puedeParticipar) {
          return Swal.showValidationMessage(
            `⏰ ${data.mensaje}`
          );
        }
        
        return { email, validacionData: data };
      } catch (error) {
        console.error('Error al validar email:', error);
        return Swal.showValidationMessage(
          `Error al verificar el correo. Por favor, intenta nuevamente.`
        );
      }
    }
  });
  
  if (result.isConfirmed && result.value) {
    const { email, validacionData } = result.value;
    emailUsuario = email;
    puedeGirar = true;
    
    // Si no puede participar, mostrar mensaje detallado
    if (validacionData && !validacionData.puedeParticipar) {
      await Swal.fire({
        title: '⏰ No Puedes Participar Aún',
        html: `
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #e74c3c; font-weight: bold; font-size: 18px; margin-bottom: 15px;">
              Este correo ya participó recientemente
            </p>
            <div style="background: #fff3cd; 
                        border: 2px solid #ffc107; 
                        padding: 20px; 
                        border-radius: 10px; 
                        margin: 20px 0;">
              <p style="color: #856404; font-size: 16px; margin-bottom: 10px;">
                <strong>📧 Correo:</strong> ${emailUsuario}
              </p>
              <p style="color: #856404; font-size: 16px; margin-bottom: 10px;">
                <strong>⏱️ Días transcurridos:</strong> ${validacionData.diasTranscurridos}
              </p>
              <p style="color: #856404; font-size: 16px; margin-bottom: 10px;">
                <strong>⏳ Días restantes:</strong> ${validacionData.diasRestantes}
              </p>
              <p style="color: #856404; font-size: 16px;">
                <strong>📅 Tiempo de espera:</strong> ${validacionData.diasEspera} días
              </p>
            </div>
            <p style="color: #2c3e50; margin-top: 15px; font-size: 16px;">
              ${validacionData.mensaje}
            </p>
            <p style="color: #7f8c8d; margin-top: 15px; font-size: 14px;">
              ¡Vuelve pronto para intentar ganar nuevamente!
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: '🏕️ Conocer Medellín Glamping',
        confirmButtonColor: '#ffc107',
        allowOutsideClick: true
      }).then(() => {
        window.open('https://www.medellinglamping.com.co/', '_blank');
      });
      
      return false;
    }
    
    // Guardar email como usado
    guardarEmailUsado(emailUsuario);
    
    // Registrar participación (timestamp)
    registrarParticipacion();
    
    // Mostrar mensaje de confirmación
    await Swal.fire({
      title: '✅ ¡Listo para Jugar!',
      html: `
        <div style="text-align: center;">
          <p style="color: #2c3e50; margin-bottom: 15px; font-size: 16px;">
            Perfecto, <strong>${emailUsuario}</strong>
          </p>
          <p style="color: #27ae60; font-weight: bold; font-size: 18px;">
            👆 Ahora pulsa en el logo del centro para girar la ruleta
          </p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: '🎡 Entendido',
      confirmButtonColor: '#27ae60',
      allowOutsideClick: true,
      timer: 3000
    });
    
    return true;
  }
  
  return false;
}

// Inicializar la ruleta
const spinWheel = new SpinWheel({
  canvasSelector: '#wheel',
  buttonSelector: '#spin',
  sectors: wheelSectors
});

// Interceptar el clic en el botón de girar
const spinButton = document.querySelector('#spin');
spinButton.addEventListener('click', async (e) => {
  // Si no tiene email válido, solicitar email
  if (!puedeGirar || !emailUsuario) {
    e.stopImmediatePropagation();
    const resultado = await solicitarEmailYValidar();
    if (!resultado) {
      // Si no se validó el email, recargar para que pueda intentar de nuevo
      location.reload();
    }
  }
}, true); // Usar capture para interceptar antes que SpinWheel

// Manejar el evento cuando termina de girar
spinWheel.events.on('finishSpinning', sector => {
  const premios = {
    '-5%': 'Descuento del 5%',
    '-10%': 'Descuento del 10%',
    '-15%': 'Descuento del 15%',
    '-20%': 'Descuento del 20%',
    '-80%': 'Descuento del 80%',
    '🍽️': 'Comida para dos',
    '🍷': 'Botella de vino',
    '💕': 'Decoración romántica'
  };

  const premioCompleto = premios[sector.label];
  
  // Registrar premio en el backend
  fetch(CONFIG.API_URL + CONFIG.ENDPOINTS.REGISTRAR_PREMIO, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: emailUsuario,
      premio: premioCompleto,
      timestamp: new Date().toISOString(),
      source: 'ruleta-glampling'
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('🎉 Premio registrado en API:', data);
  })
  .catch(error => {
    console.error('❌ Error al registrar premio:', error);
  });
  
  // Mostrar mensaje de felicitaciones
  Swal.fire({
    title: '🎉 ¡Felicidades!',
    html: `
      <div style="text-align: center; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-bottom: 15px;">¡Has ganado!</h3>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 20px; 
                    border-radius: 10px; 
                    font-size: 22px; 
                    font-weight: bold;
                    margin: 15px 0;">
          ${premioCompleto}
        </div>
        <p style="color: #27ae60; margin-top: 20px; font-size: 16px;">
          ✉️ Te enviaremos los detalles a:
        </p>
        <p style="color: #2c3e50; font-weight: bold; font-size: 16px;">
          ${emailUsuario}
        </p>
        <p style="color: #7f8c8d; margin-top: 15px; font-size: 14px;">
          ¡Gracias por participar en nuestro sorteo!
        </p>
      </div>
    `,
    icon: 'success',
    confirmButtonText: '🏕️ Conocer Medellín Glamping',
    confirmButtonColor: '#27ae60',
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then(() => {
    // Redirigir a la página del glamping
    window.open('https://www.medellinglamping.com.co/', '_blank');
    // Recargar después de cerrar para resetear el estado
    setTimeout(() => {
      location.reload();
    }, 500);
  });
  
  // Resetear variables
  puedeGirar = false;
  emailUsuario = null;
});
