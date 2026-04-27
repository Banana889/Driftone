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
        // 音量映射到“雨量感”：影响密度、长度、透明度
        this.intensity = Math.max(0, Math.min(1, val));
    }

    setTone(val) {
        // Tone 保持和音频滤波器同量级，视觉上用于控制速度和亮度
        this.tone = Math.max(100, Math.min(3000, val));
    }

    setWind(val) {
        // Wind 不直接做物理模拟，只作为横向漂移强度
        this.wind = Math.max(0, Math.min(40, val));
    }

    createDrop() {
        const spawnBase = 1 + this.intensity * 6;
        const count = Math.max(1, Math.floor(Math.random() * 2 + spawnBase));
        const toneRatio = (this.tone - 100) / 2900;
        const windDrift = this.wind * 0.16;
        const baseSpeed = 4 + this.intensity * 8 + toneRatio * 6;
        // 斜雨如果只从屏幕正上方生成，迎风侧会出现空白。
        // 这里按“整段下落期间可能横向漂移多远”来扩展出生区域。
        const horizontalTravel = Math.abs(windDrift) * (this.canvas.height / Math.max(baseSpeed, 1));
        const spawnPadding = Math.max(40, horizontalTravel + 40);
        const spawnMinX = windDrift >= 0 ? -spawnPadding : 0;
        const spawnMaxX = windDrift >= 0 ? this.canvas.width : this.canvas.width + spawnPadding;
        const spawnBandHeight = 30 + this.intensity * 30;

        for (let i = 0; i < count; i++) {
            const speed = 4 + this.intensity * 8 + toneRatio * 6 + Math.random() * 3;
            const length = 10 + this.intensity * 20 + toneRatio * 10 + Math.random() * 8;
            const opacity = 0.12 + this.intensity * 0.4 + toneRatio * 0.18 + Math.random() * 0.08;
            this.drops.push({
                x: spawnMinX + Math.random() * (spawnMaxX - spawnMinX),
                y: -Math.random() * spawnBandHeight,
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
            const slant = d.drift * (1.4 + d.length * 0.04);
            
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
        // 避免重复 toggle(true) 时叠出多条 requestAnimationFrame 循环
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
