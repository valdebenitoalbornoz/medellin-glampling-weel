// Cargar configuración
const CONFIG = {
  API_URL: 'https://medellin-glampling-weel-backend-production.up.railway.app',
  ENDPOINTS: {
    REGISTRAR_PREMIO: '/api/registrar-premio'
  }
};

const wheelSectors = [
    { color: '#f5f1e8', textColor: '#8b4513', label: '-5%', probability: 8 },
    { color: '#6b8e5a', textColor: '#ffffff', label: '-10%', probability: 16 },
    { color: '#d4c4a8', textColor: '#5d4e37', label: '-15%', probability: 8 },
    { color: '#5a7a4a', textColor: '#ffffff', label: '-20%', probability: 6 },
    { color: '#c4a484', textColor: '#ffffff', label: '-80%', probability: 2 },
    { color: '#4a6b3a', textColor: '#ffffff', label: '🍽️', probability: 20 },
    { color: '#a68b5b', textColor: '#ffffff', label: '🍷', probability: 20 },
    { color: '#8b7355', textColor: '#ffffff', label: '💕', probability: 20 }
  ]
  
  const spinWheel = new SpinWheel({
    canvasSelector: '#wheel',
    buttonSelector: '#spin',
    sectors: wheelSectors
  })
  
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
    }

    const premioCompleto = premios[sector.label]
    
    // Mostrar modal de felicitaciones con input de email
    Swal.fire({
      title: '🎉 ¡Felicidades!',
      html: `
        <div style="text-align: center; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-bottom: 15px;">Has ganado:</h3>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px; 
                      border-radius: 10px; 
                      font-size: 18px; 
                      font-weight: bold;
                      margin: 10px 0;">
            ${premioCompleto}
          </div>
          <p style="color: #7f8c8d; margin-top: 15px;">
            Para validar tu premio, ingresa tu correo electrónico:
          </p>
        </div>
      `,
      input: 'email',
      inputPlaceholder: 'tu@email.com',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas ingresar tu correo electrónico!'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return '¡Por favor ingresa un correo electrónico válido!'
        }
      },
      showCancelButton: true,
      confirmButtonText: '🎁 Validar Premio',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#e74c3c',
      focusConfirm: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showLoaderOnConfirm: true,
      preConfirm: (email) => {
        return new Promise((resolve, reject) => {
          // Llamada a la API de Railway
          fetch(CONFIG.API_URL + CONFIG.ENDPOINTS.REGISTRAR_PREMIO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              premio: premioCompleto,
              timestamp: new Date().toISOString(),
              source: 'ruleta-glampling'
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error del servidor: ${response.status}`)
            }
            return response.json()
          })
          .then(data => {
            console.log('🎉 Premio registrado en API:', data)
            
            // Comunicar con Wix (página padre)
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'PREMIO_GANADO',
                data: {
                  email: email,
                  premio: premioCompleto,
                  timestamp: new Date().toISOString(),
                  source: 'ruleta-glampling'
                }
              }, '*');
            }
            
            resolve(email)
          })
          .catch(error => {
            console.error('❌ Error al registrar premio:', error)
            Swal.showValidationMessage('Error al conectar con el servidor. Inténtalo de nuevo.')
            reject(error)
          })
        })
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const email = result.value
        
        // Mostrar confirmación final
        Swal.fire({
          title: '✅ ¡Premio Validado!',
          html: `
            <div style="text-align: center;">
              <p style="color: #2c3e50; margin-bottom: 15px;">
                Tu premio <strong>${premioCompleto}</strong> ha sido validado.
              </p>
              <p style="color: #7f8c8d;">
                Te enviaremos los detalles a: <strong>${email}</strong>
              </p>
              <p style="color: #95a5a6; font-size: 14px; margin-top: 10px;">
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
          window.open('https://www.medellinglamping.com.co/', '_blank')
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si cancela, también lo dirigimos al glamping
        Swal.fire({
          title: '🏕️ ¡Conoce Medellín Glamping!',
          html: `
            <div style="text-align: center;">
              <p style="color: #2c3e50; margin-bottom: 15px;">
                Aunque no validaste tu premio, ¡te invitamos a conocer nuestro glamping!
              </p>
              <p style="color: #7f8c8d;">
                Descubre una experiencia única a 30 minutos del centro de Medellín.
              </p>
            </div>
          `,
          icon: 'info',
          confirmButtonText: '🏕️ Conocer Glamping',
          confirmButtonColor: '#27ae60',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          // Redirigir a la página del glamping
          window.open('https://www.medellinglamping.com.co/', '_blank')
        })
      }
    })
  })
