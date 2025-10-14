const wheelSectors = [
    { color: '#ffcd01', textColor: '#000000', label: '💰 Descuento 5%', probability: 8 },
    { color: '#685ca2', textColor: '#ffffff', label: '💸 Descuento 10%', probability: 16 },
    { color: '#029ede', textColor: '#ffffff', label: '🎯 Descuento 15%', probability: 8 },
    { color: '#a7d02a', textColor: '#ffffff', label: '🎊 Descuento 20%', probability: 6 },
    { color: '#ff1744', textColor: '#ffffff', label: '🏆 Descuento 80%', probability: 2 },
    { color: '#26cda2', textColor: '#ffffff', label: '🍽️ Comida para dos', probability: 20 },
    { color: '#8f3389', textColor: '#ffffff', label: '🍷 Botella de Vino', probability: 20 },
    { color: '#e65100', textColor: '#ffffff', label: '💕 Decoración Romántica', probability: 20 }
  ]
  
  const spinWheel = new SpinWheel({
    canvasSelector: '#wheel',
    buttonSelector: '#spin',
    sectors: wheelSectors
  })
  
  spinWheel.events.on('finishSpinning', sector => {
    const premios = {
      '💰 Descuento 5%': 'Descuento del 5%',
      '💸 Descuento 10%': 'Descuento del 10%',
      '🎯 Descuento 15%': 'Descuento del 15%',
      '🎊 Descuento 20%': 'Descuento del 20%',
      '🏆 Descuento 80%': 'Descuento del 80%',
      '🍽️ Comida para dos': 'Comida para dos',
      '🍷 Botella de Vino': 'Botella de vino',
      '💕 Decoración Romántica': 'Decoración romántica'
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
          // Simular validación exitosa (modo desarrollo)
          console.log('🎉 Premio registrado:', {
            email: email,
            premio: premioCompleto,
            timestamp: new Date().toISOString()
          });
          
          // Simular delay de red
          setTimeout(() => {
            resolve(email);
          }, 1000);
          
          // Para usar con servidor real, descomenta el código de abajo:
          /*
          fetch('registrar-premio.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              premio: premioCompleto,
              timestamp: new Date().toISOString()
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en el servidor')
            }
            return response.json()
          })
          .then(data => {
            console.log('Premio registrado:', data)
            resolve(email)
          })
          .catch(error => {
            console.error('Error al registrar premio:', error)
            Swal.showValidationMessage('Error al registrar el premio. Inténtalo de nuevo.')
            reject(error)
          })
          */
        })
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const email = result.value
        console.log(`Premio obtenido: ${premioCompleto} - Email: ${email}`)
        
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
            </div>
          `,
          icon: 'success',
          confirmButtonText: '🎉 ¡Genial!',
          confirmButtonColor: '#27ae60'
        })
      }
    })
    .catch(err => {
      console.error(err);
    })
  })