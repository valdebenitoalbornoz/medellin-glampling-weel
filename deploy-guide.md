# Guía de Despliegue para Wix

## Paso 1: Hostear la Ruleta

### Opción A: Netlify (Gratis)
1. Sube tu proyecto a GitHub
2. Conecta Netlify con tu repositorio
3. Netlify automáticamente desplegará tu sitio
4. Obtienes una URL como: `https://tu-ruleta.netlify.app`

### Opción B: Vercel (Gratis)
1. Instala Vercel CLI: `npm i -g vercel`
2. En tu carpeta del proyecto: `vercel`
3. Sigue las instrucciones
4. Obtienes una URL como: `https://tu-ruleta.vercel.app`

## Paso 2: Crear API Backend

### Usar Railway (Gratis)
1. Sube tu `server.js` a GitHub
2. Conecta Railway con tu repositorio
3. Railway desplegará automáticamente
4. Obtienes una URL como: `https://tu-api.railway.app`

## Paso 3: Integrar en Wix

### Método 1: Iframe Embedding
1. En Wix, agrega un elemento "HTML Embed"
2. Usa este código:

```html
<iframe 
  src="https://tu-ruleta.netlify.app" 
  width="100%" 
  height="600px"
  frameborder="0"
  style="border-radius: 10px;">
</iframe>
```

### Método 2: Wix Corvid
1. Activa Wix Corvid en tu sitio
2. Crea una nueva página
3. Agrega tu código de la ruleta
4. Configura la base de datos Wix
