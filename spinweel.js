class SpinWheel {
    constructor({ canvasSelector, buttonSelector, sectors, friction = 0.991 }) {
      this.sectors = sectors
      this.friction = friction
      this.canvas = document.querySelector(canvasSelector)
      this.context = this.canvas.getContext('2d')
      this.button = document.querySelector(buttonSelector)
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
      // Ajustar tamaño de fuente basado en el radio
      const fontSize = Math.max(12, this.radius / 15)
      this.context.font = `bold ${fontSize}px 'Lato', sans-serif`
      this.context.fillText(sector.label, this.radius - 10, 10)
  
      this.context.restore()
    }
  
    rotateCanvas() {
      const currentSector = this.sectors[this.currentIndex]
      this.canvas.style.transform = `rotate(${this.angle - Math.PI / 2}rad)`
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
        
        // Redibujar la ruleta
        this.redrawWheel()
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
    
    static randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }
  }