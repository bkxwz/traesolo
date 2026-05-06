class Mecha {
    constructor(x, y, color, isPlayer1) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 80;
        this.color = color;
        this.isPlayer1 = isPlayer1;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 5;
        this.attackPower = 15;
        this.defending = false;
        this.defenseTimer = 0;
        this.attacking = false;
        this.attackTimer = 0;
        this.direction = isPlayer1 ? 1 : -1;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        
        if (!this.isPlayer1) {
            ctx.scale(-1, 1);
        }

        const frame = Math.floor(this.animationFrame) % 4;

        ctx.fillStyle = this.color;

        if (this.defending) {
            ctx.fillStyle = '#888888';
        }

        if (this.invincible && Math.floor(this.invincibleTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillRect(-20, -35, 40, 50);

        ctx.fillStyle = this.isPlayer1 ? '#4444aa' : '#aa4444';
        ctx.fillRect(-15, -30, 10, 20);
        ctx.fillRect(5, -30, 10, 20);

        ctx.fillStyle = '#ffff00';
        ctx.fillRect(-8, -15, 16, 10);

        ctx.fillStyle = '#333333';
        ctx.fillRect(-25, -25, 8, 35);
        ctx.fillRect(17, -25, 8, 35);

        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-18, -5, 8, 20);
        ctx.fillRect(10, -5, 8, 20);

        ctx.fillStyle = '#666666';
        ctx.fillRect(-20, 15, 12, 15);
        ctx.fillRect(8, 15, 12, 15);

        if (this.attacking) {
            ctx.fillStyle = '#ff4444';
            const swordLength = 30 + Math.sin(this.attackTimer * 0.3) * 10;
            ctx.fillRect(20, -5, swordLength, 6);
        }

        if (this.defending) {
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(-35, -25, 15, 50);
        }

        ctx.restore();
    }

    update() {
        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.animationFrame++;
            this.animationTimer = 0;
        }

        if (this.defending) {
            this.defenseTimer--;
            if (this.defenseTimer <= 0) {
                this.defending = false;
            }
        }

        if (this.attacking) {
            this.attackTimer++;
            if (this.attackTimer > 20) {
                this.attacking = false;
                this.attackTimer = 0;
            }
        }

        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    moveLeft() {
        if (!this.attacking && !this.defending) {
            this.x -= this.speed;
            this.direction = -1;
        }
    }

    moveRight() {
        if (!this.attacking && !this.defending) {
            this.x += this.speed;
            this.direction = 1;
        }
    }

    moveUp() {
        if (!this.attacking && !this.defending) {
            this.y -= this.speed;
        }
    }

    moveDown() {
        if (!this.attacking && !this.defending) {
            this.y += this.speed;
        }
    }

    attack() {
        if (!this.attacking && !this.defending) {
            this.attacking = true;
            this.attackTimer = 0;
        }
    }

    defend() {
        if (!this.attacking && !this.defending) {
            this.defending = true;
            this.defenseTimer = 30;
        }
    }

    takeDamage(damage) {
        if (this.invincible) return;
        
        if (this.defending) {
            damage = Math.floor(damage * 0.3);
        }
        
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        this.invincible = true;
        this.invincibleTimer = 30;
    }

    isAttacking() {
        return this.attacking && this.attackTimer > 5 && this.attackTimer < 15;
    }

    getAttackRange() {
        return {
            x: this.isPlayer1 ? this.x + this.width : this.x - 30,
            y: this.y + 10,
            width: 30,
            height: 30
        };
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player1 = new Mecha(100, 200, '#00aaff', true);
        this.player2 = new Mecha(650, 200, '#ff4444', false);
        this.keys = {};
        this.gameOver = false;
        this.winner = null;
        
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyJ') {
                this.player1.attack();
            }
            if (e.code === 'KeyK') {
                this.player1.defend();
            }
            if (e.code === 'Numpad1') {
                this.player2.attack();
            }
            if (e.code === 'Numpad2') {
                this.player2.defend();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleInput() {
        if (this.gameOver) return;

        if (this.keys['KeyW']) this.player1.moveUp();
        if (this.keys['KeyS']) this.player1.moveDown();
        if (this.keys['KeyA']) this.player1.moveLeft();
        if (this.keys['KeyD']) this.player1.moveRight();

        if (this.keys['ArrowUp']) this.player2.moveUp();
        if (this.keys['ArrowDown']) this.player2.moveDown();
        if (this.keys['ArrowLeft']) this.player2.moveLeft();
        if (this.keys['ArrowRight']) this.player2.moveRight();
    }

    checkCollisions() {
        const p1Range = this.player1.getAttackRange();
        const p2Range = this.player2.getAttackRange();

        if (this.player1.isAttacking() && this.isColliding(p1Range, this.player2)) {
            this.player2.takeDamage(this.player1.attackPower);
        }

        if (this.player2.isAttacking() && this.isColliding(p2Range, this.player1)) {
            this.player1.takeDamage(this.player2.attackPower);
        }
    }

    isColliding(range, target) {
        return range.x < target.x + target.width &&
               range.x + range.width > target.x &&
               range.y < target.y + target.height &&
               range.y + range.height > target.y;
    }

    checkGameOver() {
        if (this.player1.health <= 0) {
            this.gameOver = true;
            this.winner = 'PLAYER 2';
        } else if (this.player2.health <= 0) {
            this.gameOver = true;
            this.winner = 'PLAYER 1';
        }

        if (this.gameOver) {
            document.getElementById('winnerText').textContent = this.winner + ' 胜利!';
            document.getElementById('winner').style.display = 'block';
        }
    }

    updateHealthBars() {
        document.getElementById('player1Health').style.width = this.player1.health + '%';
        document.getElementById('player2Health').style.width = this.player2.health + '%';
    }

    drawBackground() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#1a1a2e';
        for (let i = 0; i < 100; i++) {
            const x = (i * 53 + Date.now() * 0.01) % this.canvas.width;
            const y = (i * 37) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }

        this.ctx.fillStyle = '#333';
        for (let i = 0; i < 8; i++) {
            this.ctx.fillRect(0, 420 + i * 10, this.canvas.width, 5);
        }

        this.ctx.fillStyle = '#00ff88';
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            const x = (Date.now() * 0.02 + i * 100) % this.canvas.width;
            this.ctx.fillRect(x, 450, 50, 2);
        }
        this.ctx.globalAlpha = 1;

        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(395, 0, 10, this.canvas.height);

        const gridSize = 40;
        this.ctx.strokeStyle = '#1a1a2e';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    draw() {
        this.drawBackground();
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
    }

    update() {
        this.player1.update();
        this.player2.update();
        this.handleInput();
        this.checkCollisions();
        this.checkGameOver();
        this.updateHealthBars();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    restart() {
        this.player1 = new Mecha(100, 200, '#00aaff', true);
        this.player2 = new Mecha(650, 200, '#ff4444', false);
        this.gameOver = false;
        this.winner = null;
        document.getElementById('winner').style.display = 'none';
    }
}

window.addEventListener('load', () => {
    new Game();
});