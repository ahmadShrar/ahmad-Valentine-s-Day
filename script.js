const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* Resize */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* معادلة القلب */
function heart(t) {
  return {
    x: 16 * Math.pow(Math.sin(t), 3),
    y: -(13 * Math.cos(t)
      - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t)
      - Math.cos(4 * t))
  };
}

/* نقاط القلب + نبض */
let heartPoints = [];
let pulse = 0;

function generateHeart() {
  heartPoints = [];
  const baseScale = Math.min(canvas.width, canvas.height) / 40;
  const scale = baseScale * (1 + Math.sin(pulse) * 0.03);

  for (let t = 0; t < Math.PI * 2; t += 0.035) {
    const p = heart(t);
    heartPoints.push({
      x: canvas.width / 2 + p.x * scale,
      y: canvas.height / 2 + p.y * scale
    });
  }
}

/* Particle */
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 300;
    this.r = Math.random() * 2 + 1.2;
    this.alpha = Math.random() * 0.5 + 0.5;
    this.target = null;
  }

  update(force) {
    if (!this.target) {
      this.target = heartPoints[Math.floor(Math.random() * heartPoints.length)];
    }

    this.x += (this.target.x - this.x) * force;
    this.y += (this.target.y - this.y) * force;
    this.y -= 0.08;
  }

  draw(glow) {
    const hue = 330 + Math.sin(Date.now() * 0.002) * 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${this.alpha})`;
    ctx.shadowColor = `hsla(${hue}, 80%, 70%, ${0.6 + glow})`;
    ctx.shadowBlur = 6 + glow * 10;
    ctx.fill();
  }
}

let particles = [];
let formationProgress = 0; // 0 → 1

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pulse += 0.02;
  generateHeart();

  // تقدم التكوين
  if (formationProgress < 1) {
    formationProgress += 0.002;
  }

  const isMobile = window.innerWidth < 600;

  // عدد الدوائر يتكثف مع التكوين
  const baseCount = isMobile ? 280 : 520;
  const maxCount  = isMobile ? 520 : 900;
  const targetCount =
    baseCount + (maxCount - baseCount) * formationProgress;

  // قوة الانجذاب
  const attractionForce = 0.01 + formationProgress * 0.02;

  // توهج إضافي عند الاكتمال
  const glowStrength = formationProgress;

  while (particles.length < targetCount) {
    particles.push(new Particle());
  }

  particles.forEach(p => {
    p.update(attractionForce);
    p.draw(glowStrength);
  });

  requestAnimationFrame(animate);
}

animate();
