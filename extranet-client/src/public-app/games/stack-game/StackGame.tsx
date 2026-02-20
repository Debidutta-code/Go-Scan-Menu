import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import './StackGame.css';

// ── Constants ──────────────────────────────────────────────
const BLOCK_H      = 48;
const BASE_W       = 200;
const WORLD_BASE_Y = 4000; // blocks sit at decreasing Y (going up)
const SPEED_BASE   = 2.6;
const SPEED_INC    = 0.07; // gets faster each block
const GROUND_PAD   = 110;  // px from screen bottom to base block

const PALETTE: [string, string][] = [
    ['#ff6b9d', '#c44569'],
    ['#ffd32a', '#ff9f1a'],
    ['#0be881', '#05c46b'],
    ['#00d2d3', '#54a0ff'],
    ['#a55eea', '#fd79a8'],
    ['#ff4d4d', '#ff793f'],
    ['#00d8ff', '#5352ed'],
    ['#ffd166', '#ef476f'],
];

type Phase = 'IDLE' | 'PLAYING' | 'OVER';

interface Block { x: number; worldY: number; w: number; }

// ── Helper: draw a rounded rect block ──────────────────────
function drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    c1: string, c2: string,
    isBase = false,
    pulse = false,
) {
    if (w < 1) return;
    const r = Math.min(8, w / 3, h / 3);

    ctx.shadowColor  = c1;
    ctx.shadowBlur   = pulse ? 22 : 8;

    // body
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 3, r);
    ctx.fill();

    ctx.shadowBlur = 0;

    // top shine
    if (w > 8) {
        const shine = ctx.createLinearGradient(x, y, x, y + h * 0.45);
        shine.addColorStop(0, 'rgba(255,255,255,0.30)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h * 0.42, [r, r, 1, 1]);
        ctx.fill();
    }

    // bottom shadow edge
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + r, y + h - 7, w - r * 2, 4);

    // dots / windows
    if (!isBase && w > 36) {
        const dotCount = Math.min(Math.floor(w / 22), 6);
        const spacing  = w / (dotCount + 1);
        ctx.fillStyle  = 'rgba(255,255,255,0.38)';
        for (let d = 0; d < dotCount; d++) {
            ctx.beginPath();
            ctx.arc(x + spacing * (d + 1), y + h / 2 + 1, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ── Component ──────────────────────────────────────────────
export const StackGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);

    // game state in refs for animation loop
    const phaseRef    = useRef<Phase>('IDLE');
    const blocksRef   = useRef<Block[]>([]);
    const swingXRef   = useRef(0);
    const swingDirRef = useRef(1);
    const swingWRef   = useRef(BASE_W);
    const scoreRef    = useRef(0);
    const camRef      = useRef(0);   // actual camera (canvas units)
    const camTgtRef   = useRef(0);   // target camera
    const rafRef      = useRef(0);

    const debrisColors = useRef<Map<number, [string, string]>>(new Map());
    const debrisId     = useRef(0);

    // React state for UI only
    const [phase, setPhase] = useState<Phase>('IDLE');
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);

    // ── Init Matter.js ──────────────────────────────────────
    const initMatter = useCallback(() => {
        if (engineRef.current) {
            Matter.World.clear(engineRef.current.world, false);
            Matter.Engine.clear(engineRef.current);
        }
        const engine = Matter.Engine.create({ gravity: { x: 0, y: 2.2 } });
        engineRef.current = engine;
        // Static floor well below game area
        const floor = Matter.Bodies.rectangle(0, WORLD_BASE_Y + 2000, 20000, 100, {
            isStatic: true, label: 'floor',
        });
        Matter.World.add(engine.world, floor);
        debrisColors.current = new Map();
    }, []);

    // ── Start / Restart ─────────────────────────────────────
    const startGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cw = canvas.width;
        const ch = canvas.height;

        initMatter();

        const baseX: number = cw / 2 - BASE_W / 2;
        blocksRef.current = [{ x: baseX, worldY: WORLD_BASE_Y, w: BASE_W }];
        swingWRef.current  = BASE_W;
        swingXRef.current  = 0;
        swingDirRef.current = 1;
        scoreRef.current   = 0;

        // Camera: base block appears near bottom of screen
        // screenY = worldY - cam  =>  cam = worldY - screenY
        const initCam = WORLD_BASE_Y - (ch - GROUND_PAD - BLOCK_H);
        camRef.current    = initCam;
        camTgtRef.current = initCam;

        phaseRef.current = 'PLAYING';
        setPhase('PLAYING');
        setScore(0);
    }, [initMatter]);

    // ── Drop ────────────────────────────────────────────────
    const dropBlock = useCallback(() => {
        if (phaseRef.current !== 'PLAYING') return;

        const top  = blocksRef.current[blocksRef.current.length - 1];
        const sx   = swingXRef.current;
        const sw   = swingWRef.current;
        const newWorldY = top.worldY - BLOCK_H;

        const olStart = Math.max(sx, top.x);
        const olEnd   = Math.min(sx + sw, top.x + top.w);
        const newW    = olEnd - olStart;

        if (newW <= 1) {
            const final = scoreRef.current;
            setBestScore(prev => Math.max(prev, final));
            phaseRef.current = 'OVER';
            setPhase('OVER');
            return;
        }

        const score = scoreRef.current;
        const [c1, c2] = PALETTE[score % PALETTE.length];
        const engine   = engineRef.current!;

        // ── Spawn debris for cut-off pieces ──
        const spawnDebris = (debrisX: number, debrisW: number) => {
            if (debrisW < 2) return;
            const body = Matter.Bodies.rectangle(
                debrisX + debrisW / 2,
                newWorldY + BLOCK_H / 2,
                debrisW,
                BLOCK_H - 4,
                { restitution: 0.35, friction: 0.4, frictionAir: 0.008, label: 'debris' }
            );
            const id = ++debrisId.current;
            (body as any)._id = id;
            debrisColors.current.set(id, [c1, c2]);
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.22);
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 4,
                y: -0.5 + Math.random() * -1.5,
            });
            Matter.World.add(engine.world, body);
        };

        if (sx < olStart)    spawnDebris(sx, olStart - sx);
        if (sx + sw > olEnd) spawnDebris(olEnd, sx + sw - olEnd);

        // ── Place new block ──
        blocksRef.current = [
            ...blocksRef.current,
            { x: olStart, worldY: newWorldY, w: newW },
        ];
        swingWRef.current   = newW;
        swingXRef.current   = 0;
        swingDirRef.current = 1;
        scoreRef.current   += 1;
        setScore(scoreRef.current);

        // ── Update camera target ──
        const canvas = canvasRef.current;
        if (canvas) {
            const ch = canvas.height;
            // Keep swinging block visible at ~38% from top
            const nextSwingWorldY = newWorldY - BLOCK_H;
            camTgtRef.current = nextSwingWorldY - ch * 0.38;
        }
    }, []);

    // ── Render loop ─────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // pre-bake random stars
        const stars = Array.from({ length: 160 }, () => ({
            x: Math.random(), y: Math.random(),
            r: Math.random() * 1.4 + 0.3,
            a: Math.random() * 0.6 + 0.15,
        }));

        let prevT = 0;

        const loop = (t: number) => {
            const dt = Math.min(t - prevT, 50);
            prevT = t;

            const cw = canvas.width;
            const ch = canvas.height;

            // physics tick
            if (engineRef.current && phaseRef.current !== 'IDLE') {
                Matter.Engine.update(engineRef.current, dt);
            }

            // camera smooth follow
            camRef.current += (camTgtRef.current - camRef.current) * 0.07;

            // swing update
            if (phaseRef.current === 'PLAYING') {
                const spd = SPEED_BASE + scoreRef.current * SPEED_INC;
                swingXRef.current += swingDirRef.current * spd;
                const maxX = cw - swingWRef.current;
                if (swingXRef.current >= maxX) { swingXRef.current = maxX; swingDirRef.current = -1; }
                if (swingXRef.current <= 0)     { swingXRef.current = 0;    swingDirRef.current =  1; }
            }

            // ── Background ──────────────────────────────────
            const bgGrad = ctx.createLinearGradient(0, 0, 0, ch);
            bgGrad.addColorStop(0, '#04000f');
            bgGrad.addColorStop(0.5, '#0d002b');
            bgGrad.addColorStop(1, '#1a0038');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, cw, ch);

            // Stars (fixed to screen)
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.a})`;
                ctx.fill();
            });

            // ── World-space rendering ────────────────────────
            const cam = camRef.current;
            // screenY = worldY - cam

            // Placed blocks
            const blocks = blocksRef.current;
            blocks.forEach((b, i) => {
                const sy = b.worldY - cam;
                if (sy > ch + 80 || sy + BLOCK_H < -80) return; // cull
                const [c1, c2] = PALETTE[i % PALETTE.length];
                drawBlock(ctx, b.x, sy, b.w, BLOCK_H, c1, c2, i === 0);
            });

            // ── Swinging block ────────────────────────────────
            if (phaseRef.current === 'PLAYING') {
                const top    = blocks[blocks.length - 1];
                const swWorldY = top.worldY - BLOCK_H;
                const swScreenY = swWorldY - cam;
                const sx = swingXRef.current;
                const sw = swingWRef.current;
                const sc = scoreRef.current;
                const [c1, c2] = PALETTE[sc % PALETTE.length];

                // Rope
                ctx.save();
                ctx.setLineDash([4, 7]);
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.lineWidth   = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx + sw / 2, swScreenY - 300);
                ctx.lineTo(sx + sw / 2, swScreenY);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Helper alignment guide (ghost of where top block is)
                ctx.save();
                ctx.globalAlpha = 0.07;
                ctx.fillStyle   = c1;
                ctx.fillRect(top.x, swScreenY, top.w, BLOCK_H - 3);
                ctx.globalAlpha = 1;
                ctx.restore();

                drawBlock(ctx, sx, swScreenY, sw, BLOCK_H, c1, c2, false, true);
            }

            // ── Debris (Matter.js bodies) ─────────────────────
            if (engineRef.current) {
                const bodies = Matter.Composite.allBodies(engineRef.current.world);
                bodies.forEach(body => {
                    if (body.label !== 'debris') return;
                    const id     = (body as any)._id as number;
                    const colors = debrisColors.current.get(id);
                    if (!colors) return;
                    const [c1] = colors;

                    const screenX = body.position.x;
                    const screenY = body.position.y - cam;
                    if (screenY > ch + 300) return; // cull far below

                    ctx.save();
                    ctx.translate(screenX, screenY);
                    ctx.rotate(body.angle);

                    const verts = body.vertices;
                    ctx.beginPath();
                    ctx.moveTo(verts[0].x - body.position.x, verts[0].y - body.position.y);
                    for (let v = 1; v < verts.length; v++) {
                        ctx.lineTo(verts[v].x - body.position.x, verts[v].y - body.position.y);
                    }
                    ctx.closePath();
                    ctx.fillStyle   = c1 + 'bb';
                    ctx.shadowColor = c1;
                    ctx.shadowBlur  = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.restore();
                });
            }

            // ── Ground ───────────────────────────────────────
            const groundWorldY = WORLD_BASE_Y + BLOCK_H;
            const groundScreenY = groundWorldY - cam;
            if (groundScreenY < ch + 100) {
                const gGrad = ctx.createLinearGradient(0, groundScreenY, 0, groundScreenY + GROUND_PAD);
                gGrad.addColorStop(0, '#1a0a40');
                gGrad.addColorStop(1, '#0a0020');
                ctx.fillStyle = gGrad;
                ctx.fillRect(0, groundScreenY, cw, GROUND_PAD + 200);
                // Ground line
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.lineWidth   = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, groundScreenY);
                ctx.lineTo(cw, groundScreenY);
                ctx.stroke();
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // ── Input ───────────────────────────────────────────────
    const handleTap = useCallback(() => {
        if (phase === 'IDLE') { startGame(); return; }
        if (phase === 'PLAYING') dropBlock();
    }, [phase, startGame, dropBlock]);

    return (
        <div className="sg-wrap" onPointerDown={handleTap}>
            <canvas ref={canvasRef} className="sg-canvas" />

            {/* Score */}
            {phase === 'PLAYING' && (
                <div className="sg-hud">
                    <div className="sg-score-pill">{score}</div>
                    <div className="sg-speed-hint">
                        {score > 0 && score % 5 === 0 ? '⚡ Speeding up!' : ''}
                    </div>
                </div>
            )}

            {/* Idle */}
            {phase === 'IDLE' && (
                <div className="sg-overlay">
                    <div className="sg-card">
                        <div className="sg-icon-row">
                            <span className="sg-block-icon" style={{ background: '#ff6b9d' }} />
                            <span className="sg-block-icon" style={{ background: '#ffd32a' }} />
                            <span className="sg-block-icon" style={{ background: '#0be881' }} />
                        </div>
                        <h1 className="sg-title">STACK</h1>
                        <p className="sg-desc">Tap to drop — perfect stacks score more!</p>
                        {bestScore > 0 && (
                            <div className="sg-best">Best: {bestScore}</div>
                        )}
                        <button className="sg-btn" onClick={e => { e.stopPropagation(); startGame(); }}>
                            PLAY
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {phase === 'OVER' && (
                <div className="sg-overlay">
                    <div className="sg-card">
                        <div className="sg-over-icon">💥</div>
                        <h2 className="sg-over-title">GAME OVER</h2>
                        <div className="sg-final-num">{score}</div>
                        <div className="sg-final-label">BLOCKS STACKED</div>
                        {score >= bestScore && score > 0 && (
                            <div className="sg-new-best">✨ New Best!</div>
                        )}
                        <div className="sg-btn-row">
                            <button className="sg-btn" onClick={e => { e.stopPropagation(); startGame(); }}>
                                ↺ RETRY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
