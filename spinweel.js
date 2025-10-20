class SpinWheel {
    constructor({ canvasSelector, buttonSelector, sectors, friction = 0.991 }) {
      this.sectors = sectors
      this.friction = friction
      this.canvas = document.querySelector(canvasSelector)
      this.context = this.canvas.getContext('2d')
      this.button = document.querySelector(buttonSelector)
      this.logoCanvas = document.querySelector('#logoCanvas')
      this.logoContext = this.logoCanvas ? this.logoCanvas.getContext('2d') : null
      this.totalSectors = sectors.length
      this.arcAngle = (2 * Math.PI) / this.totalSectors
      this.angle = 0
      this.angularVelocity = 0
      this.spinButtonClicked = false
      this.events = new EventEmitter()
      this.targetAngle = 0
      this.setupResponsiveCanvas()
      this.init()
    }
  
    get currentIndex() {
      return (
        Math.floor(
          this.totalSectors - (this.angle / (2 * Math.PI)) * this.totalSectors
        ) % this.totalSectors
      )
    }

    selectWinnerByProbability() {
      const totalProbability = this.sectors.reduce((sum, sector) => sum + sector.probability, 0)
      const random = Math.random() * totalProbability
      let cumulativeProbability = 0
      
      for (let i = 0; i < this.sectors.length; i++) {
        cumulativeProbability += this.sectors[i].probability
        if (random <= cumulativeProbability) {
          return i
        }
      }
      return this.sectors.length - 1
    }
  
    drawSector(sector, index) {
      const startAngle = this.arcAngle * index
      this.context.save()
  
      this.context.beginPath()
      this.context.fillStyle = sector.color
      this.context.moveTo(this.radius, this.radius)
      this.context.arc(
        this.radius,
        this.radius,
        this.radius,
        startAngle,
        startAngle + this.arcAngle
      )
      this.context.lineTo(this.radius, this.radius)
      this.context.fill()
  
      this.context.translate(this.radius, this.radius)
      this.context.rotate(startAngle + this.arcAngle / 2)
      this.context.textAlign = 'right'
      this.context.fillStyle = sector.textColor
      
      // Ajustar tamaño de fuente basado en el radio (más grande para mejor legibilidad)
      const fontSize = Math.max(18, this.radius / 12)
      this.context.font = `bold ${fontSize}px 'Lato', sans-serif`
      this.context.fillText(sector.label, this.radius - 10, 10)
  
      this.context.restore()
    }
    
    rotateCanvas() {
      const currentSector = this.sectors[this.currentIndex]
      this.canvas.style.transform = `rotate(${this.angle - Math.PI / 2}rad)`
    }
    
    drawStaticLogo() {
      if (!this.logoCanvas || !this.logoContext) {
        console.log('Logo canvas no encontrado')
        return
      }
      
      
      // Limpiar canvas del logo
      this.logoContext.clearRect(0, 0, this.logoCanvas.width, this.logoCanvas.height)
      
      // Crear imagen del logo estático (no gira con la ruleta)
      const logo = new Image()
      logo.onload = () => {
        console.log('Logo cargado correctamente')
        // Calcular tamaño del logo (30% del radio de la ruleta - más pequeño)
        const logoSize = this.radius * 0.3
        const x = this.radius - logoSize / 2
        const y = this.radius - logoSize / 2
        
        
        // Dibujar fondo circular para el logo
        this.logoContext.save()
        this.logoContext.beginPath()
        this.logoContext.arc(this.radius, this.radius, logoSize / 2 + 3, 0, 2 * Math.PI)
        this.logoContext.fillStyle = 'rgba(255, 255, 255, 0.95)'
        this.logoContext.fill()
        this.logoContext.strokeStyle = '#ddd'
        this.logoContext.lineWidth = 1
        this.logoContext.stroke()
        this.logoContext.restore()
        
        // Crear máscara circular para el logo
        this.logoContext.save()
        this.logoContext.beginPath()
        this.logoContext.arc(this.radius, this.radius, logoSize / 2, 0, 2 * Math.PI)
        this.logoContext.clip()
        
        // Dibujar el logo dentro de la máscara circular
        this.logoContext.drawImage(logo, x, y, logoSize, logoSize)
        this.logoContext.restore()
        
      }
      logo.onerror = () => {
        console.log('Error cargando el logo')
        // Dibujar un círculo de fallback
        this.logoContext.save()
        this.logoContext.beginPath()
        this.logoContext.arc(this.radius, this.radius, this.radius * 0.15, 0, 2 * Math.PI)
        this.logoContext.fillStyle = 'rgba(255, 255, 255, 0.95)'
        this.logoContext.fill()
        this.logoContext.strokeStyle = '#ddd'
        this.logoContext.lineWidth = 2
        this.logoContext.stroke()
        this.logoContext.restore()
      }
      logo.src = 'Logo 8x8 CM.jpg'
    }
  
    updateFrame() {
      if (!this.angularVelocity && this.spinButtonClicked) {
        const winningSector = this.sectors[this.currentIndex]
        this.events.emit('finishSpinning', winningSector)
        this.spinButtonClicked = false
        return
      }
  
      this.angularVelocity *= this.friction
      if (this.angularVelocity < 0.002) this.angularVelocity = 0
  
      this.angle += this.angularVelocity
      this.angle %= 2 * Math.PI
  
      this.rotateCanvas()
    }
  
    startSimulation() {
      const animate = () => {
        this.updateFrame()
        requestAnimationFrame(animate)
      }
      animate()
    }
  
    init() {
      this.sectors.forEach((sector, index) => this.drawSector(sector, index))
      this.rotateCanvas()
      this.startSimulation()
      
      // Dibujar logo estático después de un pequeño delay
      setTimeout(() => {
        this.drawStaticLogo()
      }, 100)
  
      this.button.addEventListener('click', () => {
        if (!this.angularVelocity) {
          // Seleccionar ganador basado en probabilidades
          const winnerIndex = this.selectWinnerByProbability()
          const targetAngle = (winnerIndex * this.arcAngle) + (this.arcAngle / 2)
          
          // Calcular múltiples vueltas + ángulo objetivo
          const extraRotations = SpinWheel.randomInRange(5, 8) * 2 * Math.PI
          this.targetAngle = extraRotations + targetAngle
          
          // Calcular velocidad inicial para llegar al objetivo
          this.angularVelocity = SpinWheel.randomInRange(0.25, 0.45)
        }
        this.spinButtonClicked = true
      })
    }
  
    setupResponsiveCanvas() {
      // Función para ajustar el tamaño del canvas
      const resizeCanvas = () => {
        const container = this.canvas.parentElement
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        
        // Calcular el tamaño basado en el contenedor y dispositivo
        let maxSize, minSize
        
        if (window.innerWidth >= 1200) {
          // Desktop grande - muy grande
          maxSize = Math.min(containerWidth, containerHeight, 700)
          minSize = 600
        } else if (window.innerWidth >= 769) {
          // Desktop - más grande
          maxSize = Math.min(containerWidth, containerHeight, 600)
          minSize = 500
        } else if (window.innerWidth >= 481) {
          // Tablet
          maxSize = Math.min(containerWidth, containerHeight, 400)
          minSize = 300
        } else {
          // Móvil
          maxSize = Math.min(containerWidth, containerHeight, 320)
          minSize = 250
        }
        
        const size = Math.max(maxSize, minSize)
        
        this.canvas.width = size
        this.canvas.height = size
        this.diameter = size
        this.radius = size / 2
        
        // Configurar canvas del logo
        if (this.logoCanvas && this.logoContext) {
          this.logoCanvas.width = size
          this.logoCanvas.height = size
          }
        
        // Redibujar la ruleta
        this.redrawWheel()
        this.redrawStaticLogo()
      }
      
      // Ajustar tamaño inicial
      resizeCanvas()
      
      // Escuchar cambios de tamaño
      window.addEventListener('resize', resizeCanvas)
      
      // Ajustar cuando cambie la orientación del dispositivo
      window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100)
      })
    }
    
    redrawWheel() {
      // Limpiar canvas
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      
      // Redibujar todos los sectores
      this.sectors.forEach((sector, index) => this.drawSector(sector, index))
      
      this.rotateCanvas()
    }
    
    redrawStaticLogo() {
      // Dibujar logo estático (no gira)
      this.drawStaticLogo()
    }
    
    static randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }
  }