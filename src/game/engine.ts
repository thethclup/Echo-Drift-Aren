export interface GameConfig {
  width: number;
  height: number;
  onGameOver?: (score: number) => void;
  onEchoFire?: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w: number;
  private h: number;
  
  // Game State
  private lastTime = 0;
  private isRunning = false;
  private score = 0;
  
  // Entities
  public player: PlayerCar;
  public enemies: EnemyCar[] = [];
  public echoWaves: EchoWave[] = [];
  public particles: Particle[] = [];
  public orbs: Orb[] = [];

  // Controls
  public controls = {
    left: false,
    right: false,
    boost: false,
    drift: false,
  };
  
  constructor(canvas: HTMLCanvasElement, private config: GameConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.w = config.width;
    this.h = config.height;
    
    this.player = new PlayerCar(this.w / 2, this.h / 2);
    this.spawnOrbs(5);
    this.spawnEnemies(2);
  }

  public resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  public start() {
    this.isRunning = true;
    requestAnimationFrame((t) => this.loop(t));
  }

  public stop() {
    this.isRunning = false;
  }
  
  public fireEcho() {
    if (this.player.isDrifting && this.player.energy >= 20) {
      this.player.energy -= 20;
      this.echoWaves.push(new EchoWave(this.player.x, this.player.y));
      if (this.config.onEchoFire) this.config.onEchoFire();
    }
  }

  private spawnOrbs(count: number) {
    for (let i = 0; i < count; i++) {
        this.orbs.push(new Orb(Math.random() * this.w, Math.random() * this.h));
    }
  }

  private spawnEnemies(count: number) {
    for (let i = 0; i < count; i++) {
        // Spawn slightly outside view to not pop in directly
        let ex = Math.random() < 0.5 ? -100 : this.w + 100;
        let ey = Math.random() * this.h;
        this.enemies.push(new EnemyCar(ex, ey));
    }
  }

  private loop(timestamp: number) {
    if (!this.isRunning) return;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Cap dt just in case of tab switching
    this.update(Math.min(dt, 0.1));
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    // Player Update
    this.player.update(dt, this.controls, this.w, this.h);
    
    // Spawn trails if drifting
    if (this.player.isDrifting && Math.random() < 0.3) {
      this.particles.push(new DriftTrail(this.player.x, this.player.y));
    }

    // Entities Update
    this.echoWaves.forEach(e => e.update(dt));
    this.echoWaves = this.echoWaves.filter(e => e.life > 0);

    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    this.enemies.forEach(e => e.update(dt, this.player));

    // Collisions
    // Player vs Orbs
    this.orbs.forEach((o, index) => {
        const dx = o.x - this.player.x;
        const dy = o.y - this.player.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
            this.player.energy = Math.min(100, this.player.energy + 10);
            this.score += 50;
            this.orbs.splice(index, 1);
            this.spawnOrbs(1);
        }
    });

    // EchoWave vs Enemies
    this.echoWaves.forEach(wave => {
        this.enemies.forEach(enemy => {
            const dx = enemy.x - wave.x;
            const dy = enemy.y - wave.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            // Check if ring hits enemy (radius match approx)
            if (Math.abs(dist - wave.radius) < 20 && !enemy.hitBy.has(wave.id)) {
                enemy.health -= 35;
                enemy.hitBy.add(wave.id);
                // Knockback
                enemy.vx += (dx / dist) * 200;
                enemy.vy += (dy / dist) * 200;
            }
        });
    });

    // Cleanup dead enemies and spawn new
    const deadEnemies = this.enemies.filter(e => e.health <= 0);
    this.enemies = this.enemies.filter(e => e.health > 0);
    deadEnemies.forEach(e => {
        this.score += 200;
        // explode
        for(let i=0; i<10; i++) {
           this.particles.push(new ExplosionParticle(e.x, e.y));
        }
    });
    if (this.enemies.length < 2 + Math.floor(this.score / 1000)) {
        this.spawnEnemies(1);
    }
  }

  private draw() {
    this.ctx.fillStyle = "rgba(3, 3, 8, 0.3)"; // Trail fade effect
    this.ctx.fillRect(0, 0, this.w, this.h);

    // Save camera context (simulating camera following player loosely or static arena)
    // For pure mobile battle arena, static single screen + wrapping or bounded is good.
    // Let's do bounded with wrapping for neon madness.

    this.orbs.forEach(o => o.draw(this.ctx));
    this.particles.forEach(p => p.draw(this.ctx));
    this.echoWaves.forEach(w => w.draw(this.ctx));
    this.enemies.forEach(e => e.draw(this.ctx));
    this.player.draw(this.ctx);

    // Grid effect
    this.drawGrid();
  }

  private drawGrid() {
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
      this.ctx.lineWidth = 1;
      const gridSize = 100;
      const ox = (this.player.x % gridSize) * -0.1; // Parallax effect
      const oy = (this.player.y % gridSize) * -0.1;
      
      this.ctx.beginPath();
      for(let x = ox; x < this.w; x += gridSize) {
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, this.h);
      }
      for(let y = oy; y < this.h; y += gridSize) {
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.w, y);
      }
      this.ctx.stroke();
      this.ctx.restore();
  }

  public getScore() {
      return this.score;
  }
}

class PlayerCar {
  x = 0; y = 0;
  vx = 0; vy = 0;
  angle = 0; // facing direction in radians
  speed = 0;
  energy = 100;
  isDrifting = false;
  
  maxSpeed = 400;
  accel = 600;
  turnSpeed = Math.PI * 1.5;

  constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.angle = -Math.PI / 2;
  }

  update(dt: number, controls: any, gw: number, gh: number) {
      if (controls.left) this.angle -= this.turnSpeed * dt;
      if (controls.right) this.angle += this.turnSpeed * dt;

      this.isDrifting = controls.drift && this.speed > 100;
      
      const currentAccel = controls.boost ? this.accel * 1.5 : this.accel;
      
      // forward vector
      const fx = Math.cos(this.angle);
      const fy = Math.sin(this.angle);

      // Auto-accelerate forward base, boost adds more
      this.vx += fx * currentAccel * dt;
      this.vy += fy * currentAccel * dt;

      // Friction
      this.vx *= 0.96;
      this.vy *= 0.96;

      this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);

      // velocity aligning
      // if not drifting, velocity tries to match facing direction aggressively
      if (!this.isDrifting) {
          const vAngle = Math.atan2(this.vy, this.vx);
          const angleDiff = Math.atan2(Math.sin(this.angle - vAngle), Math.cos(this.angle - vAngle));
          const alignSpeed = 5 * dt;
          
          if (this.speed > 10) {
              const newVAngle = vAngle + angleDiff * alignSpeed;
              this.vx = Math.cos(newVAngle) * this.speed;
              this.vy = Math.sin(newVAngle) * this.speed;
          }
      } else {
         // Drifting: low alignment, slide heavily, gain energy
         if (this.energy < 100) this.energy += 10 * dt;
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Wrap
      if (this.x < 0) this.x = gw;
      if (this.x > gw) this.x = 0;
      if (this.y < 0) this.y = gh;
      if (this.y > gh) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // Glow 
      ctx.shadowBlur = this.isDrifting ? 20 : 10;
      ctx.shadowColor = this.isDrifting ? "#ff00ff" : "#00ffff";

      // Car body
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-10, 8);
      ctx.fill();

      // Exhaust
      if (this.speed > 50) {
          ctx.fillStyle = this.isDrifting ? "#ff00ff" : "#00ffff";
          ctx.beginPath();
          ctx.arc(-12 + Math.random()*2, 0, 4, 0, Math.PI*2);
          ctx.fill();
      }

      ctx.restore();
  }
}

class EnemyCar {
  x: number; y: number;
  vx = 0; vy = 0;
  angle = 0;
  health = 100;
  speed = 150 + Math.random() * 100;
  hitBy = new Set<string>();

  constructor(x: number, y: number) {
      this.x = x; this.y = y;
  }

  update(dt: number, player: PlayerCar) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const targetAngle = Math.atan2(dy, dx);
      
      // Turn towards player
      const angleDiff = Math.atan2(Math.sin(targetAngle - this.angle), Math.cos(targetAngle - this.angle));
      this.angle += angleDiff * 2 * dt;

      this.vx += Math.cos(this.angle) * 300 * dt;
      this.vy += Math.sin(this.angle) * 300 * dt;

      this.vx *= 0.95;
      this.vy *= 0.95;

      this.x += this.vx * dt;
      this.y += this.vy * dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff1493"; // red/pink enemy

      ctx.fillStyle = "#222";
      ctx.strokeStyle = "#ff1493";
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
  }
}

class EchoWave {
  id = Math.random().toString();
  x: number; y: number;
  radius = 10;
  life = 1.0; // 1 second
  maxLife = 1.0;

  constructor(x: number, y: number) {
      this.x = x; this.y = y;
  }

  update(dt: number) {
      this.radius += 500 * dt;
      this.life -= dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 255, ${this.life / this.maxLife})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ffff";
      ctx.stroke();
      ctx.restore();
  }
}

class Orb {
  x: number; y: number;
  pulse = 0;

  constructor(x: number, y: number) {
      this.x = x; this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
      this.pulse += 0.1;
      ctx.save();
      ctx.shadowBlur = 15 + Math.sin(this.pulse) * 5;
      ctx.shadowColor = "#8a2be2";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
  }
}

class Particle {
  life = 0;
  update(dt: number) {}
  draw(ctx: CanvasRenderingContext2D) {}
}

class DriftTrail extends Particle {
  x = 0; y = 0; life = 0.5; maxLife = 0.5;
  constructor(x: number, y: number) { super(); this.x = x; this.y = y; }
  update(dt: number) { this.life -= dt; }
  draw(ctx: CanvasRenderingContext2D) {
      ctx.fillStyle = `rgba(255, 0, 255, ${(this.life/this.maxLife) * 0.5})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI*2); ctx.fill();
  }
}

class ExplosionParticle extends Particle {
    x = 0; y = 0; vx = 0; vy = 0; life = 0.5; maxLife = 0.5;
    constructor(x: number, y: number) { 
        super(); this.x = x; this.y = y;
        const speed = Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }
    update(dt: number) { 
        this.x += this.vx * dt; this.y += this.vy * dt;
        this.life -= dt; 
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 20, 147, ${this.life/this.maxLife})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI*2); ctx.fill();
    }
}
