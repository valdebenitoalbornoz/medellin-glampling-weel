# Guía de Integración con Wix

## Opción 1: Wix Corvid (Recomendada)

### Ventajas:
- ✅ Integración nativa con Wix
- ✅ Base de datos Wix incluida
- ✅ Hosting incluido
- ✅ Dominio personalizado

### Pasos:
1. **Activar Wix Corvid** en tu sitio Wix
2. **Crear aplicación** en el editor de Wix
3. **Subir tu código** de la ruleta
4. **Configurar base de datos** Wix para premios

### Código para Wix Corvid:

```javascript
// En Wix Corvid, crear una página con:
import wixData from 'wix-data';

// Función para registrar premios
export function registrarPremio(email, premio) {
  return wixData.save('premios', {
    email: email,
    premio: premio,
    fecha: new Date()
  });
}

// Función para obtener premios
export function obtenerPremios() {
  return wixData.query('premios').find();
}
```

## Opción 2: Iframe Embedding

### Ventajas:
- ✅ Fácil implementación
- ✅ Mantiene funcionalidad completa
- ✅ No requiere cambios en Wix

### Pasos:
1. **Hostear** tu ruleta en Netlify/Vercel
2. **Crear iframe** en Wix
3. **Comunicación** entre iframe y Wix

### Código para comunicación:

```javascript
// En tu ruleta (iframe)
window.parent.postMessage({
  type: 'PREMIO_GANADO',
  data: {
    email: email,
    premio: premio
  }
}, '*');

// En Wix (página padre)
window.addEventListener('message', (event) => {
  if (event.data.type === 'PREMIO_GANADO') {
    // Procesar premio
    console.log('Premio recibido:', event.data.data);
  }
});
```

## Opción 3: API Externa + Wix

### Ventajas:
- ✅ Control total del backend
- ✅ Base de datos externa
- ✅ Escalable

### Arquitectura:
- **Frontend**: Iframe en Wix
- **Backend**: Node.js en Railway/Heroku
- **Base de datos**: MongoDB Atlas/PostgreSQL
