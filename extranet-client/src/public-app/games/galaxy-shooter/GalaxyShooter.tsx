import React, { useEffect, useRef, useState, useCallback } from 'react';
import './GalaxyShooter.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Star { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
interface Bullet { x: number; y: number; active: boolean; }
interface EnemyBullet { x: number; y: number; active: boolean; vx: number; vy: number; }
interface Enemy {
    x: number; y: number; active: boolean;
    hp: number; maxHp: number;
    type: number;
    flashTimer: number;
}
interface Explosion { x: number; y: number; r: number; maxR: number; life: number; color: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAYER_W = 48;
const PLAYER_H = 56;
const BULLET_W = 3;
const BULLET_H = 20;
const ENEMY_W = 42;
const ENEMY_H = 36;
const COLS = 8;
const ROWS = 5;
const SHOOT_CD = 280;
const ENEMY_SHOOT_CD = 1400;
const STAR_COUNT = 140;
const MAX_PARTICLES = 180;

function makeStars(w: number, h: number): Star[] {
    return Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.6 + 0.15,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
    }));
}

// ── Draw helpers — each resets ALL canvas state before returning ───────────────

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Thruster flame
    const fl = 0.55 + Math.sin(t * 3) * 0.2;
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    const flame = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.5 * fl);
    flame.addColorStop(0, 'rgba(255,255,255,0.9)');
    flame.addColorStop(0.3, 'rgba(0,210,255,0.7)');
    flame.addColorStop(1, 'rgba(0,50,200,0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, h * 0.22);
    ctx.bezierCurveTo(-w * 0.16, h * 0.38, -w * 0.04, h * 0.5 * fl, 0, h * 0.5 * fl);
    ctx.bezierCurveTo(w * 0.04, h * 0.5 * fl, w * 0.16, h * 0.38, w * 0.08, h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // clears shadowBlur

    // Hull
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    const hull = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.3);
    hull.addColorStop(0, '#e0f4ff');
    hull.addColorStop(0.3, '#7dd3fc');
    hull.addColorStop(0.7, '#2563eb');
    hull.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo(w * 0.12, -h * 0.2, w * 0.5, h * 0.1, w * 0.46, h * 0.28);
    ctx.lineTo(w * 0.17, h * 0.2);
    ctx.lineTo(w * 0.17, h * 0.3);
    ctx.lineTo(-w * 0.17, h * 0.3);
    ctx.lineTo(-w * 0.17, h * 0.2);
    ctx.lineTo(-w * 0.46, h * 0.28);
    ctx.bezierCurveTo(-w * 0.5, h * 0.1, -w * 0.12, -h * 0.2, 0, -h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Wings (no shadow)
    const wing = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    wing.addColorStop(0, '#1e40af');
    wing.addColorStop(0.5, '#3b82f6');
    wing.addColorStop(1, '#1e40af');
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(-w * 0.17, h * 0.04);
    ctx.lineTo(-w * 0.5, h * 0.29);
    ctx.lineTo(-w * 0.36, h * 0.29);
    ctx.lineTo(-w * 0.1, h * 0.09);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.04);
    ctx.lineTo(w * 0.5, h * 0.29);
    ctx.lineTo(w * 0.36, h * 0.29);
    ctx.lineTo(w * 0.1, h * 0.09);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.save();
    ctx.shadowColor = '#bae6fd';
    ctx.shadowBlur = 8;
    const glass = ctx.createRadialGradient(-w * 0.04, -h * 0.22, 0, 0, -h * 0.17, w * 0.16);
    glass.addColorStop(0, 'rgba(200,240,255,0.95)');
    glass.addColorStop(0.5, 'rgba(56,189,248,0.6)');
    glass.addColorStop(1, 'rgba(14,165,233,0.15)');
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.17, w * 0.13, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Accent lines — no shadow
    ctx.strokeStyle = 'rgba(147,210,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -h * 0.44); ctx.lineTo(0, h * 0.19); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.27, h * 0.11); ctx.lineTo(w * 0.27, h * 0.11); ctx.stroke();

    // Gun barrels
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(-w * 0.41, -h * 0.07, w * 0.055, h * 0.2);
    ctx.fillRect(w * 0.355, -h * 0.07, w * 0.055, h * 0.2);

    ctx.restore(); // back to identity
}

function drawEnemy(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    type: number,
    flash: boolean,
    t: number
) {
    const COLORS = [
        { body: '#a855f7', glow: '#d946ef', accent: '#f0abfc', core: '#e879f9' },
        { body: '#ef4444', glow: '#f97316', accent: '#fca5a5', core: '#fb923c' },
        { body: '#10b981', glow: '#06d6a0', accent: '#6ee7b7', core: '#34d399' },
    ];
    const c = COLORS[type % 3];
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Pulse scale — apply via transform, NOT ctx.scale on live context
    const pulse = 1 + Math.sin(t * 0.003 + type * 1.1) * 0.05;
    const sw = w * pulse;
    const sh = h * pulse;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow halo — separate save so shadowBlur is contained
    ctx.save();
    ctx.shadowColor = flash ? '#ffffff' : c.glow;
    ctx.shadowBlur = flash ? 28 : 14;

    // Hexagon body
    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sw * 0.42);
    bodyGrad.addColorStop(0, flash ? '#ffffff' : c.accent);
    bodyGrad.addColorStop(0.5, flash ? '#ffbbcc' : c.body);
    bodyGrad.addColorStop(1, flash ? '#ff4466' : c.glow + 'cc');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 2;
        const rx = Math.cos(angle) * sw * 0.4;
        const ry = Math.sin(angle) * sh * 0.44;
        i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore(); // ← clears shadowBlur/shadowColor

    // Wings — no shadow
    ctx.fillStyle = flash ? 'rgba(255,180,180,0.65)' : c.body + 'bb';
    // left wing
    ctx.beginPath();
    ctx.moveTo(-sw * 0.32, -sh * 0.1);
    ctx.lineTo(-sw * 0.58, -sh * 0.28);
    ctx.lineTo(-sw * 0.58, sh * 0.28);
    ctx.lineTo(-sw * 0.32, sh * 0.12);
    ctx.closePath();
    ctx.fill();
    // right wing
    ctx.beginPath();
    ctx.moveTo(sw * 0.32, -sh * 0.1);
    ctx.lineTo(sw * 0.58, -sh * 0.28);
    ctx.lineTo(sw * 0.58, sh * 0.28);
    ctx.lineTo(sw * 0.32, sh * 0.12);
    ctx.closePath();
    ctx.fill();

    // Wing detail lines
    ctx.strokeStyle = c.accent + '77';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath(); ctx.moveTo(i * sw * 0.32, -sh * 0.06); ctx.lineTo(i * sw * 0.54, -sh * 0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i * sw * 0.32, sh * 0.06); ctx.lineTo(i * sw * 0.54, sh * 0.2); ctx.stroke();
    }

    // Core eye — own save for glow
    ctx.save();
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 10;
    const eye = ctx.createRadialGradient(0, 0, 0, 0, 0, sw * 0.16);
    eye.addColorStop(0, '#ffffff');
    eye.addColorStop(0.45, c.accent);
    eye.addColorStop(1, c.core);
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.ellipse(0, 0, sw * 0.16, sh * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore(); // clears shadow

    // Type extras — no shadow
    if (type === 1) {
        // Tank: top antenna spikes
        ctx.fillStyle = c.accent;
        [-sw * 0.16, 0, sw * 0.16].forEach(ox => {
            ctx.beginPath();
            ctx.moveTo(ox, -sh * 0.4);
            ctx.lineTo(ox - sw * 0.04, -sh * 0.56);
            ctx.lineTo(ox + sw * 0.04, -sh * 0.56);
            ctx.closePath();
            ctx.fill();
        });
    }
    if (type === 2) {
        // Speeder: swept rear fins
        ctx.fillStyle = c.accent + '99';
        ctx.beginPath();
        ctx.moveTo(-sw * 0.1, sh * 0.32);
        ctx.lineTo(-sw * 0.56, sh * 0.54);
        ctx.lineTo(-sw * 0.3, sh * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sw * 0.1, sh * 0.32);
        ctx.lineTo(sw * 0.56, sh * 0.54);
        ctx.lineTo(sw * 0.3, sh * 0.32);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore(); // back to identity — absolutely no shadow state leaks out
}

function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    const grad = ctx.createLinearGradient(x, y, x, y + BULLET_H);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, '#38bdf8');
    grad.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - BULLET_W / 2, y, BULLET_W, BULLET_H, BULLET_W / 2);
    ctx.fill();
    ctx.restore();
}

function drawEnemyBullet(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.shadowColor = '#e879f9';
    ctx.shadowBlur = 8;
    const grad = ctx.createLinearGradient(x, y - 4, x, y + 14);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.4, '#e879f9');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 3, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const GalaxyShooter: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'WIN'>('IDLE');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [wave, setWave] = useState(1);
    const [hiScore, setHiScore] = useState(() => Number(localStorage.getItem('gs_hi') || 0));

    const gsRef = useRef<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'WIN'>('IDLE');
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const waveRef = useRef(1);

    useEffect(() => { gsRef.current = gameState; }, [gameState]);
    useEffect(() => { livesRef.current = lives; }, [lives]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { waveRef.current = wave; }, [wave]);

    const playerRef = useRef({ x: 0, y: 0 });
    const targetXRef = useRef(0);
    const bulletsRef = useRef<Bullet[]>([]);
    const enemyBulletsRef = useRef<EnemyBullet[]>([]);
    const enemiesRef = useRef<Enemy[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const explosionsRef = useRef<Explosion[]>([]);
    const starsRef = useRef<Star[]>([]);
    const shootTimerRef = useRef(0);
    const enemyShootTimerRef = useRef(0);
    const enemyDirRef = useRef(1);
    const enemyOffsetXRef = useRef(0);
    const enemyOffsetYRef = useRef(0);
    const lastTimeRef = useRef(0);
    const afRef = useRef(0);
    const invincibleRef = useRef(0);

    const spawnWave = useCallback((canvas: HTMLCanvasElement, waveNum: number) => {
        const enemies: Enemy[] = [];
        const totalW = COLS * (ENEMY_W + 12) - 12;
        const startX = (canvas.width - totalW) / 2;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const type = r === 0 ? 1 : r === ROWS - 1 ? 2 : 0;
                const hp = type === 1 ? 2 + Math.floor(waveNum / 2) : 1;
                enemies.push({
                    x: startX + c * (ENEMY_W + 12),
                    y: 72 + r * (ENEMY_H + 14),
                    active: true, hp, maxHp: hp, type, flashTimer: 0,
                });
            }
        }
        enemiesRef.current = enemies;
        enemyOffsetXRef.current = 0;
        enemyOffsetYRef.current = 0;
        enemyDirRef.current = 1;
    }, []);

    const spawnParticles = useCallback((x: number, y: number, color: string, count = 12) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = Math.random() * 3 + 1;
            particlesRef.current.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: Math.random() * 3.5 + 1.5,
            });
        }
        if (particlesRef.current.length > MAX_PARTICLES)
            particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
    }, []);

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        playerRef.current = { x: canvas.width / 2 - PLAYER_W / 2, y: canvas.height - 110 };
        targetXRef.current = playerRef.current.x;
        bulletsRef.current = [];
        enemyBulletsRef.current = [];
        particlesRef.current = [];
        explosionsRef.current = [];
        shootTimerRef.current = 0;
        enemyShootTimerRef.current = 0;
        invincibleRef.current = 0;
        waveRef.current = 1;
        scoreRef.current = 0;
        livesRef.current = 3;
        setScore(0); setLives(3); setWave(1);
        spawnWave(canvas, 1);
        starsRef.current = makeStars(canvas.width, canvas.height);
    }, [spawnWave]);

    const handlePointer = useCallback((clientX: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        targetXRef.current = Math.max(0, Math.min(x - PLAYER_W / 2, canvas.width - PLAYER_W));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const resize = () => {
            const { width, height } = container.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            starsRef.current = makeStars(width, height);
            if (gsRef.current === 'IDLE') {
                playerRef.current = { x: width / 2 - PLAYER_W / 2, y: height - 110 };
                targetXRef.current = playerRef.current.x;
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // ─── Game Loop ────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const loop = (ts: number) => {
            const dt = Math.min(ts - lastTimeRef.current, 50);
            lastTimeRef.current = ts;

            const ctx = canvas.getContext('2d')!;
            const W = canvas.width, H = canvas.height;
            const state = gsRef.current;

            // ── Clear — full reset each frame ─────────────────────────────────
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            ctx.clearRect(0, 0, W, H);

            // ── Background ────────────────────────────────────────────────────
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#000008');
            bg.addColorStop(0.45, '#03001e');
            bg.addColorStop(0.75, '#07023b');
            bg.addColorStop(1, '#0d0528');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Nebulae
            const neb1 = ctx.createRadialGradient(W * 0.25, H * 0.28, 0, W * 0.25, H * 0.28, W * 0.36);
            neb1.addColorStop(0, 'rgba(100,30,150,0.11)');
            neb1.addColorStop(1, 'transparent');
            ctx.fillStyle = neb1; ctx.fillRect(0, 0, W, H);
            const neb2 = ctx.createRadialGradient(W * 0.75, H * 0.55, 0, W * 0.75, H * 0.55, W * 0.3);
            neb2.addColorStop(0, 'rgba(10,60,160,0.09)');
            neb2.addColorStop(1, 'transparent');
            ctx.fillStyle = neb2; ctx.fillRect(0, 0, W, H);

            // ── Stars ─────────────────────────────────────────────────────────
            starsRef.current.forEach(s => {
                if (state === 'PLAYING') {
                    s.y += s.speed * (dt / 16);
                    s.twinkle += 0.04;
                    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
                }
                const op = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3);
                // No shadowBlur on stars — cheaper and avoids state leak
                ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // ── Explosions ────────────────────────────────────────────────────
            explosionsRef.current = explosionsRef.current.filter(e => e.life > 0);
            explosionsRef.current.forEach(e => {
                e.r = Math.min(e.maxR, e.r + (e.maxR - e.r) * 0.18);
                e.life -= dt / 380;
                ctx.save();
                ctx.globalAlpha = Math.max(0, e.life);
                ctx.shadowColor = e.color;
                ctx.shadowBlur = 18;
                const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, Math.max(1, e.r));
                eg.addColorStop(0, '#ffffff');
                eg.addColorStop(0.2, e.color);
                eg.addColorStop(0.65, e.color + '66');
                eg.addColorStop(1, 'transparent');
                ctx.fillStyle = eg;
                ctx.beginPath(); ctx.arc(e.x, e.y, Math.max(1, e.r), 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });

            // ── Particles ─────────────────────────────────────────────────────
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);
            particlesRef.current.forEach(p => {
                p.x += p.vx * (dt / 16);
                p.y += p.vy * (dt / 16);
                p.vx *= 0.96; p.vy *= 0.96;
                p.life -= dt / 480;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ── GAME LOGIC (only when PLAYING) ────────────────────────────────
            if (state === 'PLAYING') {
                // Move player
                const px = playerRef.current;
                px.x += (targetXRef.current - px.x) * Math.min(1, 0.14 * (dt / 16));

                // Auto shoot
                shootTimerRef.current += dt;
                if (shootTimerRef.current >= SHOOT_CD) {
                    shootTimerRef.current = 0;
                    const bx = px.x + PLAYER_W / 2;
                    const by = px.y + 4;
                    bulletsRef.current.push({ x: bx, y: by, active: true });
                    bulletsRef.current.push({ x: px.x + PLAYER_W * 0.14, y: by + 12, active: true });
                    bulletsRef.current.push({ x: px.x + PLAYER_W * 0.86, y: by + 12, active: true });
                }

                // Enemy movement
                const waveSpeed = 28 + waveRef.current * 5;
                const maxOffset = 55 + waveRef.current * 7;
                enemyOffsetXRef.current += (waveSpeed * dt / 1000) * enemyDirRef.current;
                if (Math.abs(enemyOffsetXRef.current) > maxOffset) {
                    enemyDirRef.current *= -1;
                    enemyOffsetYRef.current += 14;
                }

                // Flash timers
                enemiesRef.current.forEach(e => { if (e.flashTimer > 0) e.flashTimer -= dt; });

                // Enemy shoot
                const activeEnemies = enemiesRef.current.filter(e => e.active);
                enemyShootTimerRef.current += dt;
                const eshootCd = Math.max(550, ENEMY_SHOOT_CD - waveRef.current * 80);
                if (enemyShootTimerRef.current >= eshootCd && activeEnemies.length > 0) {
                    enemyShootTimerRef.current = 0;
                    const count = Math.min(3, Math.ceil(waveRef.current / 2));
                    activeEnemies.sort(() => Math.random() - 0.5).slice(0, count).forEach(e => {
                        const ex = e.x + enemyOffsetXRef.current + ENEMY_W / 2;
                        const ey = e.y + enemyOffsetYRef.current + ENEMY_H;
                        const tx = px.x + PLAYER_W / 2;
                        const ty = px.y;
                        const dist = Math.hypot(tx - ex, ty - ey) || 1;
                        const spd = 2.5 + waveRef.current * 0.3;
                        enemyBulletsRef.current.push({
                            x: ex, y: ey,
                            vx: ((tx - ex) / dist) * spd,
                            vy: ((ty - ey) / dist) * spd + 1.5,
                            active: true,
                        });
                    });
                }

                // Move player bullets
                const bspd = 9 * (dt / 16);
                bulletsRef.current.forEach(b => { if (b.active) b.y -= bspd; });
                bulletsRef.current = bulletsRef.current.filter(b => b.active && b.y + BULLET_H > 0);

                // Move enemy bullets
                const espd = dt / 16;
                enemyBulletsRef.current.forEach(b => {
                    if (b.active) { b.x += b.vx * espd; b.y += b.vy * espd; }
                });
                enemyBulletsRef.current = enemyBulletsRef.current.filter(b => b.active && b.y < H + 20);

                // Bullet → enemy collision
                bulletsRef.current.forEach(b => {
                    if (!b.active) return;
                    enemiesRef.current.forEach(e => {
                        if (!e.active || !b.active) return;
                        const ex = e.x + enemyOffsetXRef.current;
                        const ey = e.y + enemyOffsetYRef.current;
                        if (b.x > ex && b.x < ex + ENEMY_W && b.y > ey && b.y < ey + ENEMY_H) {
                            b.active = false;
                            e.hp--;
                            e.flashTimer = 130;
                            if (e.hp <= 0) {
                                e.active = false;
                                const pts = e.type === 1 ? 30 : e.type === 2 ? 20 : 10;
                                scoreRef.current += pts;
                                setScore(scoreRef.current);
                                const expC = ['#a855f7', '#ef4444', '#10b981'][e.type % 3];
                                explosionsRef.current.push({
                                    x: ex + ENEMY_W / 2, y: ey + ENEMY_H / 2,
                                    r: 4, maxR: 38, life: 1, color: expC,
                                });
                                spawnParticles(ex + ENEMY_W / 2, ey + ENEMY_H / 2, expC, 14);
                            }
                        }
                    });
                });

                // Enemy bullet → player collision
                if (invincibleRef.current <= 0) {
                    enemyBulletsRef.current.forEach(b => {
                        if (!b.active) return;
                        const px2 = playerRef.current;
                        if (
                            b.x > px2.x + 6 && b.x < px2.x + PLAYER_W - 6 &&
                            b.y > px2.y + 8 && b.y < px2.y + PLAYER_H - 8
                        ) {
                            b.active = false;
                            const nl = livesRef.current - 1;
                            livesRef.current = nl;
                            invincibleRef.current = 1800;
                            setLives(nl);
                            spawnParticles(px2.x + PLAYER_W / 2, px2.y + PLAYER_H / 2, '#38bdf8', 10);
                            if (nl <= 0) {
                                setGameState('GAMEOVER');
                                gsRef.current = 'GAMEOVER';
                                const hi = Math.max(scoreRef.current, hiScore);
                                setHiScore(hi);
                                localStorage.setItem('gs_hi', String(hi));
                            }
                        }
                    });
                } else {
                    invincibleRef.current -= dt;
                }

                // Wave clear
                if (activeEnemies.length === 0) {
                    const nw = waveRef.current + 1;
                    waveRef.current = nw;
                    setWave(nw);
                    spawnWave(canvas, nw);
                    enemyBulletsRef.current = [];
                    scoreRef.current += 100 * (nw - 1);
                    setScore(scoreRef.current);
                }

                // Enemies breach bottom
                const breached = enemiesRef.current.some(
                    e => e.active && e.y + enemyOffsetYRef.current + ENEMY_H > playerRef.current.y
                );
                if (breached) {
                    setGameState('GAMEOVER');
                    gsRef.current = 'GAMEOVER';
                    const hi = Math.max(scoreRef.current, hiScore);
                    setHiScore(hi);
                    localStorage.setItem('gs_hi', String(hi));
                }
            }

            // ── Draw bullets ──────────────────────────────────────────────────
            bulletsRef.current.forEach(b => { if (b.active) drawBullet(ctx, b.x, b.y); });
            enemyBulletsRef.current.forEach(b => { if (b.active) drawEnemyBullet(ctx, b.x, b.y); });

            // ── Draw enemies ──────────────────────────────────────────────────
            enemiesRef.current.forEach(e => {
                if (!e.active) return;
                const ex = e.x + enemyOffsetXRef.current;
                const ey = e.y + enemyOffsetYRef.current;

                // HP bar for tanks
                if (e.maxHp > 1) {
                    ctx.fillStyle = 'rgba(0,0,0,0.55)';
                    ctx.fillRect(ex, ey - 8, ENEMY_W, 4);
                    const hg = ctx.createLinearGradient(ex, 0, ex + ENEMY_W, 0);
                    hg.addColorStop(0, '#f97316');
                    hg.addColorStop(1, '#ef4444');
                    ctx.fillStyle = hg;
                    ctx.fillRect(ex, ey - 8, ENEMY_W * (e.hp / e.maxHp), 4);
                }

                drawEnemy(ctx, ex, ey, ENEMY_W, ENEMY_H, e.type, e.flashTimer > 0, ts);

                // CRITICAL: reset after every enemy draw
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
            });

            // ── Draw player ───────────────────────────────────────────────────
            const inv = invincibleRef.current;
            const showPlayer = inv <= 0 || Math.floor(ts / 110) % 2 === 0;

            if (showPlayer) {
                ctx.globalAlpha = inv > 0 ? 0.55 : 1;
                drawPlayer(ctx, playerRef.current.x, playerRef.current.y, PLAYER_W, PLAYER_H, ts * 0.005);

                // Reset after player draw
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';

                // Shield ring
                if (inv > 0) {
                    ctx.save();
                    ctx.strokeStyle = `rgba(56,189,248,${Math.min(1, inv / 500)})`;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(
                        playerRef.current.x + PLAYER_W / 2,
                        playerRef.current.y + PLAYER_H / 2,
                        PLAYER_W * 0.72, 0, Math.PI * 2
                    );
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Final safety reset every frame
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

            afRef.current = requestAnimationFrame(loop);
        };

        afRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(afRef.current);
    }, [spawnParticles, spawnWave, hiScore]);

    const startGame = () => {
        initGame();
        setGameState('PLAYING');
        gsRef.current = 'PLAYING';
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (gsRef.current === 'PLAYING') handlePointer(e.clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (gsRef.current === 'PLAYING') handlePointer(e.touches[0].clientX);
    };
    const onTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        handlePointer(e.touches[0].clientX);
        if (gsRef.current !== 'PLAYING') startGame();
    };

    return (
        <div className="gs-container" ref={containerRef}>
            {gameState === 'PLAYING' && (
                <div className="gs-hud">
                    <div className="gs-pill">
                        <span className="gs-pill-label">SCORE</span>
                        <span className="gs-pill-value">{score}</span>
                    </div>
                    <div className="gs-pill gs-wave-pill">
                        <span className="gs-pill-label">WAVE</span>
                        <span className="gs-pill-value">{wave}</span>
                    </div>
                    <div className="gs-pill">
                        <span className="gs-pill-label">LIVES</span>
                        <span className="gs-pill-value gs-lives">{'♦'.repeat(Math.max(0, lives))}</span>
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="gs-canvas"
                onMouseMove={onMouseMove}
                onTouchMove={onTouchMove}
                onTouchStart={onTouchStart}
                onClick={gameState !== 'PLAYING' ? startGame : undefined}
                style={{ touchAction: 'none' }}
            />

            {gameState === 'IDLE' && (
                <div className="gs-overlay">
                    <div className="gs-card">
                        <div className="gs-title-group">
                            <span className="gs-eyebrow">GALAXY</span>
                            <h1 className="gs-title">SHOOTER</h1>
                            <div className="gs-title-line" />
                        </div>
                        <p className="gs-desc">Slide to aim · Shoots automatically</p>
                        <div className="gs-legend">
                            <span>🟣 Grunt — 10pts</span>
                            <span>🔴 Tank — 30pts · needs 2 hits</span>
                            <span>🟢 Speeder — 20pts</span>
                        </div>
                        {hiScore > 0 && <p className="gs-hi">BEST &nbsp; {hiScore}</p>}
                        <button className="gs-btn" onClick={startGame}>LAUNCH</button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="gs-overlay">
                    <div className="gs-card gs-gameover-card">
                        <h2 className="gs-over-title">GAME OVER</h2>
                        <div className="gs-score-row">
                            <div className="gs-score-block">
                                <span className="gs-score-label">SCORE</span>
                                <span className="gs-score-val">{score}</span>
                            </div>
                            <div className="gs-score-block">
                                <span className="gs-score-label">BEST</span>
                                <span className="gs-score-val gs-hi-val">{hiScore}</span>
                            </div>
                        </div>
                        <p className="gs-wave-reached">Reached Wave {wave}</p>
                        <button className="gs-btn gs-retry-btn" onClick={startGame}>RETRY</button>
                    </div>
                </div>
            )}
        </div>
    );
};