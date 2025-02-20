import "../src/style.css"

// Correct path to JS file
import  {EventEmitter}  from "events"

export const imagesSequenceEmitter = new EventEmitter()

let loadedImages: HTMLImageElement[] = []

export const loadSequenceImages = () => {
  
  const tr1_2 = []
  for (let i = 0; i <= 27; i++) {
    const fileName = `./images/1-2/1-2${i.toString().padStart(2, "0")}.png`
    tr1_2.push(fileName)
  }
  const tr2_3 = []
  for (let i = 0; i <= 24; i++) {
    const fileName = `./images/2-3/2-3${i.toString().padStart(2, "0")}.png`
    tr2_3.push(fileName)
  }
  const tr3_4 = []
  for (let i = 1; i <= 24; i++) {
    const fileName = `./images/3-4/3-4${i.toString().padStart(2, "0")}.png`
    tr3_4.push(fileName)
  }
  const tr4_5 = []
  for (let i = 1; i <= 26; i++) {
    const fileName = `./images/4-5/4-5${i.toString().padStart(2, "0")}.png`
    tr4_5.push(fileName)
  }

  const tr5_1 = []
  for (let i = 1; i <= 24; i++) {
    const fileName = `./images/5-1/5-1${i.toString().padStart(2, "0")}.png`
    tr5_1.push(fileName)
  }

  const images = [...tr1_2, ...tr2_3, ...tr3_4, ...tr4_5, ...tr5_1]

  const imagePromises = images.map((src) => {
    return new Promise<HTMLImageElement>((resolve,reject) => {
      const img = new Image()
      img.src = src
      img.onload = () =>{
                console.log("Image loaded:", src);
                resolve(img);} 
                img.onerror = (err) => {
                  console.error("Failed to load image:", src, err);
                  reject(err);
                };
    })
  })

  Promise.all(imagePromises).then((imagesLoaded) => {
    loadedImages = [...(imagesLoaded as HTMLImageElement[])]
    imagesSequenceEmitter.emit("sequence-loaded")
  })
}

const removeLoadingClass = () => {
  document.body.classList.remove("loading");
};

let progress = 1

export const normalize = (value: number, min: number, max: number) => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

const canvas = document.querySelector("canvas") as HTMLCanvasElement

canvas.width = 400
canvas.height = 400
const ctx = canvas.getContext("2d")

imagesSequenceEmitter.on("sequence-loaded", () => {
  removeLoadingClass();
  requestAnimationFrame(render)
})

loadSequenceImages()

let currentIndex = -1

function render() {
  let index = Math.round(normalize(progress, 1, 6) * (loadedImages.length - 1))

  if (index !== currentIndex) {
    currentIndex = index
    if (!ctx || !canvas) return
 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      loadedImages[index] as HTMLImageElement,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }

  requestAnimationFrame(render)
}

let animation: number | null = null
let startTime: number | null = null
let startValue = 1
let targetValue = 1

const calculateShortestPath = (start: number, end: number): number => {
  // Regular difference
  const directDiff = end - start

  // Circular differences
  const throughTopDiff = end + 5 - start
  const throughBottomDiff = end - (start + 5)

  // Find the smallest absolute difference
  const diffs = [directDiff, throughTopDiff, throughBottomDiff]
  const absDiffs = diffs.map(Math.abs)
  const minDiff = Math.min(...absDiffs)

  return diffs[absDiffs.indexOf(minDiff)]
}

const progressIndicator = document.querySelector(".switcher-progress")

const animate = (timestamp: number): void => {
  if (!startTime) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const duration = 1000

  if (elapsed < duration) {
    const animprogress = elapsed / duration
    // Easing function for smoother animation

    const diff = calculateShortestPath(startValue, targetValue)
    let newValue = startValue + diff * animprogress

    // Handle wrapping
    if (newValue > 5) newValue = newValue - 5
    if (newValue < 1) newValue = newValue + 5

    progress = newValue
    animation = requestAnimationFrame(animate)
  } else {
   
    progress = targetValue
    animation = null
    startTime = null
  }

  if (!progressIndicator) return

  progressIndicator.textContent = progress.toFixed(2)
}

const onClick = (target: number): void => {
  
  if (animation) {
    cancelAnimationFrame(animation)
  }

  // Start new animation from current position
  startTime = null
  startValue = progress
  targetValue = target
  animation = requestAnimationFrame(animate)
}

;[...document.querySelectorAll(".switcher button")].forEach((button) => {
  button.addEventListener("click", (e) => {
    const value = parseInt(
      (e.currentTarget as HTMLButtonElement).getAttribute(
        "data-state"
      ) as string
    )

    onClick(value)
  })
})
