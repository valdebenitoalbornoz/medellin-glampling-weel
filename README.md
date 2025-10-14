# 🎡 Ruleta de Sorteo - Glampling

Sistema de ruleta de sorteos con probabilidades personalizables y integración con API.

## 🚀 Despliegue

### Frontend (Netlify)
- ✅ **URL**: Tu ruleta está desplegada en Netlify
- ✅ **Archivo principal**: `index-iframe.html` (optimizado para iframe)
- ✅ **Script principal**: `script-iframe.js` (con comunicación a API)

### Backend (Railway)
- ✅ **URL**: `https://medellin-glampling-weel-backend-production.up.railway.app`
- ✅ **Endpoint**: `/api/registrar-premio`
- ✅ **Método**: POST

## 🔧 Configuración

### Archivos principales:
- `index-iframe.html` - Página principal optimizada para iframe
- `script-iframe.js` - JavaScript con comunicación a API
- `spinweel.js` - Lógica de la ruleta
- `emitter.js` - Sistema de eventos
- `style.css` - Estilos
- `config.js` - Configuración (opcional)

### Archivos eliminados:
- ❌ `registrar-premio.php` - Ya no necesario
- ❌ `wix-integration-guide.md` - Guía obsoleta
- ❌ `deploy-guide.md` - Guía obsoleta
- ❌ `wix-integration.js` - Código obsoleto

## 📡 Comunicación con API

### Datos enviados:
```json
{
  "email": "usuario@email.com",
  "premio": "Descuento del 5%",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "source": "ruleta-glampling"
}
```

### Respuesta esperada:
```json
{
  "success": true,
  "message": "Premio registrado exitosamente",
  "premio": {
    "id": 1234567890,
    "email": "usuario@email.com",
    "premio": "Descuento del 5%",
    "timestamp": "2025-01-27T10:30:00.000Z",
    "fechaRegistro": "27/01/2025, 10:30:00"
  }
}
```

## 🎯 Integración con Wix

### Método 1: HTML Embed
```html
<iframe 
  src="https://tu-ruleta.netlify.app" 
  width="100%" 
  height="600px"
  frameborder="0"
  style="border-radius: 10px;">
</iframe>
```

### Método 2: Comunicación con Wix
La ruleta envía mensajes a la página padre (Wix) cuando se registra un premio:

```javascript
// En Wix, escuchar mensajes:
window.addEventListener('message', (event) => {
  if (event.data.type === 'PREMIO_GANADO') {
    const { email, premio, timestamp } = event.data.data;
    console.log('Premio recibido:', { email, premio, timestamp });
  }
});
```

## 🎲 Probabilidades Configuradas

| Premio | Probabilidad |
|--------|-------------|
| 💰 Descuento 5% | 8% |
| 💸 Descuento 10% | 16% |
| 🎯 Descuento 15% | 8% |
| 🎊 Descuento 20% | 6% |
| 🏆 Descuento 80% | 2% |
| 🍽️ Comida para dos | 20% |
| 🍷 Botella de Vino | 20% |
| 💕 Decoración Romántica | 20% |

## 🔍 Testing

### Probar API:
```bash
curl -X POST https://medellin-glampling-weel-backend-production.up.railway.app/api/registrar-premio \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","premio":"Test","timestamp":"2025-01-27T10:30:00.000Z","source":"test"}'
```

### Ver premios registrados:
```bash
curl https://medellin-glampling-weel-backend-production.up.railway.app/api/premios
```

## 📝 Logs

Los premios se registran en:
- ✅ **Consola del navegador** (para debugging)
- ✅ **API de Railway** (base de datos)
- ✅ **Wix** (si está configurado)

¡Tu ruleta está lista para usar! 🎉
