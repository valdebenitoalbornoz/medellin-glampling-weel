// Código para agregar en Wix Corvid o en el HTML Embed

// Función para manejar premios ganados
function manejarPremioGanado(event) {
  // Verificar que el mensaje viene de nuestro iframe
  if (event.origin !== 'https://tu-ruleta.netlify.app') {
    return;
  }
  
  if (event.data.type === 'PREMIO_GANADO') {
    const { email, premio, timestamp } = event.data.data;
    
    console.log('🎉 Premio recibido en Wix:', {
      email,
      premio,
      timestamp
    });
    
    // Aquí puedes:
    // 1. Guardar en la base de datos de Wix
    // 2. Enviar email de confirmación
    // 3. Mostrar notificación al usuario
    // 4. Redirigir a una página de agradecimiento
    
    // Ejemplo: Mostrar notificación
    if (typeof wixLocation !== 'undefined') {
      // Redirigir a página de agradecimiento
      wixLocation.to('/gracias-premio');
    }
    
    // Ejemplo: Guardar en base de datos Wix
    if (typeof wixData !== 'undefined') {
      wixData.save('premios', {
        email: email,
        premio: premio,
        fecha: new Date(),
        timestamp: timestamp
      }).then(() => {
        console.log('Premio guardado en Wix');
      });
    }
  }
}

// Escuchar mensajes del iframe
window.addEventListener('message', manejarPremioGanado);

// Función para abrir la ruleta en modal (opcional)
function abrirRuleta() {
  // Crear modal con iframe
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const iframe = document.createElement('iframe');
  iframe.src = 'https://tu-ruleta.netlify.app';
  iframe.style.cssText = `
    width: 90%;
    height: 90%;
    border: none;
    border-radius: 10px;
  `;
  
  modal.appendChild(iframe);
  document.body.appendChild(modal);
  
  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Función para integrar con formularios de Wix
function integrarConFormulario() {
  // Si tienes un formulario de contacto en Wix
  // puedes capturar los datos del premio aquí
  
  const formulario = document.querySelector('#contact-form');
  if (formulario) {
    formulario.addEventListener('submit', (e) => {
      // Agregar datos del premio al formulario
      const premioInput = document.createElement('input');
      premioInput.type = 'hidden';
      premioInput.name = 'premio-ganado';
      premioInput.value = localStorage.getItem('ultimo-premio') || '';
      formulario.appendChild(premioInput);
    });
  }
}
