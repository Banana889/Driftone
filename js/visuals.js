class RainVisualizer {
    constructor() {
        this.canvas = document.getElementById('rain-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.isRunning = false;
        this.animationFrameId = null;
        this.intensity = 0;
        this.tone = 400;
        this.wind = 0;
        
        // 响应窗口大小变化
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setIntensity(val) {
        this.intensity = Math.max(0, Math.min(1, val));
    }

    setTone(val) {
        this.tone = Math.max(100, Math.min(3000, val));
    }

    setWind(val) {
        this.wind = Math.max(0, Math.min(40, val));
    }

    createDrop() {
        const spawnBase = 1 + this.intensity * 6;
        const count = Math.max(1, Math.floor(Math.random() * 2 + spawnBase));
        const toneRatio = (this.tone - 100) / 2900;
        const windDrift = this.wind * 0.35;

        for (let i = 0; i < count; i++) {
            const speed = 4 + this.intensity * 8 + toneRatio * 6 + Math.random() * 3;
            const length = 10 + this.intensity * 20 + toneRatio * 10 + Math.random() * 8;
            const opacity = 0.12 + this.intensity * 0.4 + toneRatio * 0.18 + Math.random() * 0.08;
            this.drops.push({
                x: Math.random() * this.canvas.width,
                y: -20, // 从屏幕上方一点点开始
                speed,
                drift: windDrift + (Math.random() - 0.5) * 0.6,
                length,
                opacity: Math.min(opacity, 0.85)
            });
        }
    }

    draw() {
        if (!this.isRunning) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        // 稍微保留一点上一帧的痕迹，制造模糊感 (可选)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const toneRatio = (this.tone - 100) / 2900;
        const blue = Math.round(210 + toneRatio * 45);
        const green = Math.round(185 + toneRatio * 25);
        this.ctx.strokeStyle = `rgb(169, ${green}, ${blue})`;
        this.ctx.lineWidth = 1 + this.intensity * 0.8 + toneRatio * 0.6;
        this.ctx.lineCap = 'round';

        // 更新并绘制每个雨滴
        for (let i = 0; i < this.drops.length; i++) {
            const d = this.drops[i];
            const slant = d.drift * (2.5 + d.length * 0.08);
            
            this.ctx.beginPath();
            this.ctx.moveTo(d.x, d.y);
            this.ctx.lineTo(d.x + slant, d.y + d.length);
            this.ctx.globalAlpha = d.opacity;
            this.ctx.stroke();
            
            // 移动
            d.y += d.speed;
            d.x += d.drift;

            // 如果超出屏幕底部，移除
            if (d.y > this.canvas.height || d.x < -80 || d.x > this.canvas.width + 80) {
                this.drops.splice(i, 1);
                i--;
            }
        }

        // 持续生成新雨滴
        this.createDrop();
        this.ctx.globalAlpha = 1;
        this.animationFrameId = requestAnimationFrame(() => this.draw());
    }

    toggle(enable) {
        if (enable === this.isRunning) return;

        this.isRunning = enable;
        if (enable) {
            this.draw();
        } else {
            // todo： 关掉后不要清空屏幕。让剩下的雨滴落下
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.drops = []; // 清空雨滴
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// 导出实例
const visuals = new RainVisualizer();
