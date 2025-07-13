class SnakeGame {
    constructor() {
        console.log('SnakeGame constructor called');
        this.canvas = document.getElementById('gameCanvas');
        console.log('canvas:', this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 25;
        this.tileCount = 15;

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;

        // Snake properties
        this.snake = [
            {x: 10, y: 10, letter: null}
        ];
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.speed = 150;

        // VIVANTIS letters system
        this.vivantisLetters = [
            'V', 'I', 'V', 'A', 'N', 'T', 'I', 'S',
            '.', 'S', 'K', 'Y', 'I', 'S', 'T', 'H', 'E', 'L', 'I', 'M', 'I', 'T', '.', 'A', 'Ž', 'P', 'A', 'K', '.', 'S', 'A', 'M', 'O', 'S', 'E', 'T', 'O', '.', 'L', 'A', 'S', 'K', 'A', 'V', 'O', 'S', 'T', '.', 'M', 'O', 'O', 'N', 'S', 'O', 'O', 'N', '.', 'U', 'Ž', 'B', 'Ě', 'Ž', 'M', 'A', 'K', 'A', 'T', '.', 'Ř', 'Í', 'K', 'Á', 'M', 'T', 'I', 'B', 'Ě', 'Ž', 'M', 'A', 'K', 'A', 'T', '.', 'A', 'N', 'I', 'O', 'Č', 'K', 'O', 'N', 'E', 'N', 'A', 'S', 'A', 'D', 'Í', 'Í', 'Í', 'Í', 'Š', '.', 'H', 'L', 'A', 'V', 'N', 'Ě', 'Ž', 'E', 'M', 'Á', 'Š', 'P', 'I', 'V', 'O', 'V', 'O', 'L', 'E', '.', 'K', 'D', 'Y', 'Ž', 'N', 'E', 'M', 'Ů', 'Ž', 'E', 'Š', 'T', 'A', 'K', 'P', 'Ř', 'I', 'D', 'E', 'J', 'V', 'Í', 'C', '.', 'J', 'E', 'T', 'O', 'V', 'Ý', 'Z', 'V', 'A', '.'
        ];
        this.currentLetterIndex = 0;

        // Food properties
        this.food = this.generateFood();
        this.diamond = null; // bonusové jídlo
        this.mushroom = null; // jedovatá muchomůrka
        this.bolt = null; // blesk
        this.boltActive = false;
        this.baseSpeed = this.speed;
        this.wall = null; // pole segmentů zdi
        this.wallCrash = false;

        // UI elements
        this.scoreElement = document.getElementById('score');
        console.log('scoreElement:', this.scoreElement);
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.nicknameInput = document.getElementById('nickname');
        this.highscoresBody = document.getElementById('highscoresBody');
        // Odstraním localStorage žebříček
        // this.highscores = this.loadHighscores();
        // this.renderHighscores();
        // Načti online žebříček při startu
        loadHighscoresOnline();

        // Buttons
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.soundBtn = document.getElementById('soundBtn');
        console.log('pauseBtn:', this.pauseBtn, 'restartBtn:', this.restartBtn, 'playAgainBtn:', this.playAgainBtn, 'soundBtn:', this.soundBtn);

        // Zvuky
        this.audioEat = document.getElementById('audioEat');
        this.audioDiamond = document.getElementById('audioDiamond');
        this.audioMushroom = document.getElementById('audioMushroom');
        this.audioBolt = document.getElementById('audioBolt');
        this.audioCrash = document.getElementById('audioCrash');
        this.audioMusic = document.getElementById('audioMusic');
        this.audioApplause = document.getElementById('audioApplause');
        console.log('audioEat:', this.audioEat, 'audioDiamond:', this.audioDiamond, 'audioMushroom:', this.audioMushroom, 'audioBolt:', this.audioBolt, 'audioCrash:', this.audioCrash, 'audioMusic:', this.audioMusic, 'audioApplause:', this.audioApplause);
        
        // Hlášky po game over
        this.gameOverSounds = [
            'sounds/hlasky/to-neni-normalni-kurva.mp3',
            'sounds/hlasky/to-je-pico-nemozne.mp3',
            'sounds/hlasky/past-vedle-pasti-pico.mp3',
            'sounds/hlasky/nebudu-to-delat.mp3',
            'sounds/hlasky/kurva-do-pice-to-neni-mozne.mp3',
            'sounds/hlasky/kurva.mp3',
            'sounds/hlasky/jedu-do-pici-stadyma.mp3',
            'sounds/hlasky/jedinou-picovinku.mp3',
            'sounds/hlasky/ja-to-mrdam.mp3',
            'sounds/hlasky/ja-se-z-toho-musim-pojebat.mp3',
            'sounds/hlasky/hosi-to-je-neuveritelne.mp3',
            'sounds/hlasky/hajzli-jedni.mp3',
            'sounds/hlasky/do-pice.mp3',
            'sounds/hlasky/ani-za-kokot-vole.mp3',
            'sounds/hlasky/to-sou-nervy-ty-pico.mp3'
        ];
        
        // Funkce pro přehrávání zvuků s error handling
        this.playSound = (audioElement) => {
            if (!audioElement) {
                console.log('Audio element není nalezen');
                return;
            }
            if (!this.soundsEnabled) {
                console.log('Zvuky nejsou povoleny');
                return;
            }
            if (this.soundMuted) {
                console.log('Zvuky jsou vypnuté');
                return;
            }
            
            try {
                audioElement.currentTime = 0;
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Zvuk přehrán úspěšně');
                    }).catch(error => {
                        console.error('Zvuk se nepodařilo přehrát:', error);
                    });
                }
            } catch (error) {
                console.error('Chyba při přehrávání zvuku:', error);
            }
        };

        this.initializeGame();
        this.setupEventListeners();
        this.updateHighScore();
        
        // Inicializace zvuků - povolení po první interakci
        this.soundsEnabled = false;
        this.soundMuted = false;
        this.enableSounds = () => {
            if (!this.soundsEnabled) {
                this.soundsEnabled = true;
                console.log('Zvuky povoleny');
                this.startMusic(); // Spusť hudbu při povolení zvuků
            }
        };
        
        this.toggleSound = () => {
            this.soundMuted = !this.soundMuted;
            this.soundBtn.textContent = this.soundMuted ? '🔇' : '🔊';
            this.soundBtn.classList.toggle('muted', this.soundMuted);
            
            // Ovládání hudby
            if (this.soundMuted) {
                this.stopMusic();
                console.log('Zvuky vypnuty');
            } else {
                this.startMusic();
                console.log('Zvuky zapnuty');
            }
        };
        
        this.startMusic = () => {
            if (this.audioMusic && this.soundsEnabled && !this.soundMuted) {
                this.audioMusic.volume = 0.3; // Tichý podkres
                this.audioMusic.play().catch(error => {
                    console.error('Hudba se nepodařila přehrát:', error);
                });
            }
        };
        
        this.stopMusic = () => {
            if (this.audioMusic) {
                this.audioMusic.pause();
                this.audioMusic.currentTime = 0;
            }
        };
        
        this.playRandomGameOverSound = () => {
            if (this.soundsEnabled && !this.soundMuted) {
                const randomSound = this.gameOverSounds[Math.floor(Math.random() * this.gameOverSounds.length)];
                const audio = new Audio(randomSound);
                audio.volume = 0.7;
                audio.play().catch(error => {
                    console.error('Hláška se nepodařila přehrát:', error);
                });
            }
        };
        
        this.playApplause = () => {
            if (this.audioApplause && this.soundsEnabled && !this.soundMuted) {
                this.audioApplause.currentTime = 0;
                this.audioApplause.volume = 0.8;
                this.audioApplause.play().catch(error => {
                    console.error('Potlesk se nepodařil přehrát:', error);
                });
            }
        };
        
        // Debug - zkontroluj, jestli se zvuky načetly
        console.log('Audio elementy:', {
            eat: this.audioEat,
            diamond: this.audioDiamond,
            mushroom: this.audioMushroom,
            bolt: this.audioBolt,
            crash: this.audioCrash
        });
        
        // Kontrola načtení audio souborů
        const audioElements = [this.audioEat, this.audioDiamond, this.audioMushroom, this.audioBolt, this.audioCrash];
        audioElements.forEach((audio, index) => {
            if (audio) {
                audio.addEventListener('loadeddata', () => {
                    console.log(`Audio soubor ${index + 1} načten úspěšně`);
                });
                audio.addEventListener('error', (e) => {
                    console.error(`Chyba při načítání audio souboru ${index + 1}:`, e);
                });
            }
        });
    }

    initializeGame() {
        this.snake = [{x: 10, y: 10, letter: null}];
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.score = 0;
        this.currentLetterIndex = 0;
        this.food = this.generateFood();
        this.diamond = null;
        this.mushroom = null;
        this.bolt = null;
        this.boltActive = false;
        this.speed = this.baseSpeed;
        this.wall = null;
        this.updateScore();
        this.updateLettersCollected();
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.enableSounds(); // Povol zvuky při jakékoliv interakci s klávesnicí
            
            if (!this.gameRunning) {
                if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "a", "A", "s", "S", "d", "D"].includes(e.key)) {
                    this.startGame();
                } else {
                    return;
                }
            }

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) { // Prevent moving down when going up
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) { // Prevent moving up when going down
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) { // Prevent moving right when going left
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) { // Prevent moving left when going right
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });

        // Button controls
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                this.enableSounds();
                this.togglePause();
            });
        }
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.enableSounds();
                this.restartGame();
            });
        }
        if (this.playAgainBtn) {
            this.playAgainBtn.addEventListener('click', () => {
                this.enableSounds();
                this.restartGame();
            });
        }
        
        // Sound button
        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', () => {
                this.enableSounds();
                this.toggleSound();
            });
        }
    }

    startGame() {
        console.log('startGame called');
        if (!this.gameRunning) {
            this.enableSounds(); // Povol zvuky při startu hry
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
        }
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Pokračovat' : 'Pauza';

        if (this.gamePaused) {
            this.stopMusic(); // Zastav hudbu při pauze
        } else {
            this.startMusic(); // Spusť hudbu při pokračování
            this.gameLoop();
        }
    }

    restartGame() {
        this.gameOverElement.classList.remove('show');
        this.initializeGame();
        this.pauseBtn.textContent = 'Pauza';
        this.startMusic(); // Spusť hudbu při restartu
    }

    gameLoop() {
        console.log('gameLoop called, gameRunning:', this.gameRunning, 'gamePaused:', this.gamePaused);
        if (!this.gameRunning || this.gamePaused) return;

        this.update();
        this.draw();

        setTimeout(() => {
            if (this.gameRunning && !this.gamePaused) {
                this.gameLoop();
            }
        }, this.speed);
    }

    update() {
        console.log('update called, snake:', this.snake, 'dx:', this.dx, 'dy:', this.dy);
        // Move snake: create new head
        const newHead = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy, letter: null};

        // Check wall collision (okraj)
        if (newHead.x < 0 || newHead.x >= this.tileCount || newHead.y < 0 || newHead.y >= this.tileCount) {
            this.playSound(this.audioCrash);
            this.gameOver();
            return;
        }
        // Kolize se zdí
        if (this.wall && this.wall.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            this.wallCrash = true;
            this.playSound(this.audioCrash);
            this.gameOver();
            return;
        }

        // Check self collision (skip the head itself)
        for (let i = 1; i < this.snake.length; i++) {
            if (newHead.x === this.snake[i].x && newHead.y === this.snake[i].y) {
                this.playSound(this.audioCrash);
                this.gameOver();
                return;
            }
        }

        // Insert new head at the beginning
        this.snake.unshift(newHead);

        // Diamant - bonusové jídlo
        if (this.diamond && newHead.x === this.diamond.x && newHead.y === this.diamond.y) {
            this.score += 50;
            this.updateScore();
            this.playSound(this.audioDiamond);
            this.diamond = null;
        }
        // Muchomůrka - jedovaté jídlo
        if (this.mushroom && newHead.x === this.mushroom.x && newHead.y === this.mushroom.y) {
            this.score = Math.max(0, this.score - 50);
            this.updateScore();
            this.playSound(this.audioMushroom);
            this.mushroom = null;
        }
        // Blesk - zrychlení
        if (this.bolt && newHead.x === this.bolt.x && newHead.y === this.bolt.y) {
            this.bolt = null;
            if (!this.boltActive) {
                this.boltActive = true;
                this.speed = Math.max(30, Math.floor(this.speed / 1.5));
                this.playSound(this.audioBolt);
            }
        }

        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.playSound(this.audioEat);

            // Add letter to the snake for every food eaten
            if (this.currentLetterIndex < this.vivantisLetters.length) {
                this.currentLetterIndex++;
            }

            // Zapamatuj si, jestli muchomůrka existovala před tímto kolem
            const hadMushroomBefore = !!this.mushroom;
            const hadBoltBefore = !!this.bolt;

            this.food = this.generateFood();

            // Náhodně vygeneruj diamant (1:4 šance)
            if (!this.diamond && Math.floor(Math.random() * 4) === 0) {
                this.diamond = this.generateDiamond();
            }
            // Náhodně vygeneruj muchomůrku (1:4 šance)
            if (!this.mushroom && Math.floor(Math.random() * 4) === 0) {
                this.mushroom = this.generateMushroom();
            }
            // Náhodně vygeneruj blesk (1:4 šance)
            if (!this.bolt && Math.floor(Math.random() * 4) === 0) {
                this.bolt = this.generateBolt();
            }

            // Instantně smaž muchomůrku, pokud existovala už před tímto kolem
            if (hadMushroomBefore) {
                this.mushroom = null;
            }
            // Instantně smaž blesk, pokud existoval už před tímto kolem
            if (hadBoltBefore) {
                this.bolt = null;
            }
            // Pokud byl aktivní blesk, návrat rychlosti na původní hodnotu
            if (this.boltActive) {
                this.speed = this.baseSpeed;
                this.boltActive = false;
            }
        } else {
            // Remove tail segment
            this.snake.pop();
        }

        // Zeď po dosažení 20 bodů
        if (!this.wall && this.score >= 500) {
            this.wall = [];
            const word = 'NOTINO';
            const isHorizontal = Math.random() < 0.5;
            if (isHorizontal) {
                const midY = Math.floor(this.tileCount / 2);
                const startX = Math.floor((this.tileCount - 6) / 2);
                for (let i = 0; i < 6; i++) {
                    this.wall.push({ x: startX + i, y: midY, letter: word[i] });
                }
            } else {
                const midX = Math.floor(this.tileCount / 2);
                const startY = Math.floor((this.tileCount - 6) / 2);
                for (let i = 0; i < 6; i++) {
                    this.wall.push({ x: midX, y: startY + i, letter: word[i] });
                }
            }
        }

        // Nastav písmena na správné segmenty
        for (let i = 1; i <= this.currentLetterIndex; i++) {
            if (this.snake[i]) {
                this.snake[i].letter = this.vivantisLetters[i - 1];
            }
        }
        for (let i = this.currentLetterIndex + 1; i < this.snake.length; i++) {
            if (this.snake[i]) {
                this.snake[i].letter = null;
            }
        }
    }

    draw() {
        console.log('draw called');
        // Clear canvas
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head - moderní kulatý vzhled
                // Gradient pro hlavu
                const headGradient = this.ctx.createRadialGradient(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 8,
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 2
                );
                headGradient.addColorStop(0, '#5eead4');
                headGradient.addColorStop(1, '#22d3ee');
                this.ctx.fillStyle = headGradient;
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 2 - 2,
                    0, 2 * Math.PI
                );
                this.ctx.shadowColor = '#22d3ee88';
                this.ctx.shadowBlur = 8;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;

                // Eyes (moderní, decentní)
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(segment.x * this.gridSize + this.gridSize / 2 - 5, segment.y * this.gridSize + this.gridSize / 2 - 4, 2.2, 0, 2 * Math.PI);
                this.ctx.arc(segment.x * this.gridSize + this.gridSize / 2 + 5, segment.y * this.gridSize + this.gridSize / 2 - 4, 2.2, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                // Body - moderní kulatý vzhled
                const bodyGradient = this.ctx.createRadialGradient(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 8,
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 2
                );
                bodyGradient.addColorStop(0, '#38bdf8');
                bodyGradient.addColorStop(1, '#2563eb');
                this.ctx.fillStyle = bodyGradient;
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    this.gridSize / 2 - 2,
                    0, 2 * Math.PI
                );
                this.ctx.shadowColor = '#2563eb55';
                this.ctx.shadowBlur = 6;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;

                // Draw letter if present
                if (segment.letter) {
                    this.ctx.fillStyle = '#fff'; // Bílá pro lepší kontrast
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(segment.letter, 
                                    segment.x * this.gridSize + this.gridSize / 2, 
                                    segment.y * this.gridSize + this.gridSize / 2);
                }
            }
        });

        // Draw food - moderní kulatý vzhled
        // Glow efekt pro jídlo
        const foodGradient = this.ctx.createRadialGradient(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 8,
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2
        );
        foodGradient.addColorStop(0, '#fbbf24');
        foodGradient.addColorStop(1, '#f43f5e');
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0, 2 * Math.PI
        );
        this.ctx.shadowColor = '#f43f5e99';
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = foodGradient;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Písmenka se zobrazují pouze na hadovi, ne na jídle

        // Draw diamond (bonus food)
        if (this.diamond) {
            const cx = this.diamond.x * this.gridSize + this.gridSize / 2;
            const cy = this.diamond.y * this.gridSize + this.gridSize / 2;
            const r = this.gridSize / 2 - 3;
            this.ctx.save();
            this.ctx.beginPath();
            // Diamant jako polygon (kosočtverec)
            this.ctx.moveTo(cx, cy - r);
            this.ctx.lineTo(cx + r, cy);
            this.ctx.lineTo(cx, cy + r);
            this.ctx.lineTo(cx - r, cy);
            this.ctx.closePath();
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.shadowColor = '#0ea5e9';
            this.ctx.shadowBlur = 12;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            // Bílý lesk
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy - r + 3);
            this.ctx.lineTo(cx + r/2, cy);
            this.ctx.lineTo(cx, cy);
            this.ctx.closePath();
            this.ctx.fillStyle = '#fff8';
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw mushroom (jedovaté jídlo)
        if (this.mushroom) {
            const cx = this.mushroom.x * this.gridSize + this.gridSize / 2;
            const cy = this.mushroom.y * this.gridSize + this.gridSize / 2;
            const r = this.gridSize / 2 - 3;
            // Tělo muchomůrky
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.shadowColor = '#b91c1c';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            // Bílé tečky
            this.ctx.fillStyle = '#fff';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * 2 * Math.PI;
                const dotR = r / 4.5;
                const dotCx = cx + Math.cos(angle) * (r / 1.7);
                const dotCy = cy + Math.sin(angle) * (r / 1.7);
                this.ctx.beginPath();
                this.ctx.arc(dotCx, dotCy, dotR, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            // Středová tečka
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r / 4, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw bolt (blesk)
        if (this.bolt) {
            const cx = this.bolt.x * this.gridSize + this.gridSize / 2;
            const cy = this.bolt.y * this.gridSize + this.gridSize / 2;
            const r = this.gridSize / 2 - 3;
            this.ctx.save();
            // Černý podklad
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#111';
            this.ctx.globalAlpha = 0.85;
            this.ctx.shadowBlur = 0;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.beginPath();
            // Stylizovaný blesk (polygon)
            this.ctx.moveTo(cx, cy - r + 2);
            this.ctx.lineTo(cx + r * 0.2, cy);
            this.ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
            this.ctx.lineTo(cx, cy + r - 2);
            this.ctx.lineTo(cx - r * 0.2, cy);
            this.ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
            this.ctx.closePath();
            this.ctx.fillStyle = '#fde047';
            this.ctx.shadowColor = '#facc15';
            this.ctx.shadowBlur = 14;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
        }

        // Draw wall (zeď)
        if (this.wall) {
            this.ctx.save();
            this.wall.forEach((seg, idx) => {
                // Černý čtverec
                this.ctx.fillStyle = '#111';
                this.ctx.beginPath();
                this.ctx.rect(seg.x * this.gridSize + 1, seg.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
                this.ctx.fill();
                // Bílé písmeno
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(seg.letter,
                    seg.x * this.gridSize + this.gridSize / 2,
                    seg.y * this.gridSize + this.gridSize / 2
                );
            });
            this.ctx.restore();
        }
    }

    generateFood() {
        // Najdi volné pole
        let newFood;
        let attempts = 0;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
            // Ochrana proti nekonečné smyčce
            if (attempts > 1000) {
                console.error('Nepodařilo se najít volné místo pro jídlo!');
                return {x: 0, y: 0}; // fallback
            }
        } while (
            this.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y) ||
            (this.wall && this.wall.some(seg => seg.x === newFood.x && seg.y === newFood.y))
        );
        console.log('generateFood:', newFood);
        return newFood;
    }

    generateDiamond() {
        let diamond;
        do {
            diamond = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (
            this.snake.some(segment => segment.x === diamond.x && segment.y === diamond.y) ||
            (this.food && diamond.x === this.food.x && diamond.y === this.food.y)
        );
        return diamond;
    }

    generateMushroom() {
        let mushroom;
        do {
            mushroom = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (
            this.snake.some(segment => segment.x === mushroom.x && segment.y === mushroom.y) ||
            (this.food && mushroom.x === this.food.x && mushroom.y === this.food.y) ||
            (this.diamond && mushroom.x === this.diamond.x && mushroom.y === this.diamond.y)
        );
        return mushroom;
    }

    generateBolt() {
        let bolt;
        do {
            bolt = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (
            this.snake.some(segment => segment.x === bolt.x && segment.y === bolt.y) ||
            (this.food && bolt.x === this.food.x && bolt.y === this.food.y) ||
            (this.diamond && bolt.x === this.diamond.x && bolt.y === this.diamond.y) ||
            (this.mushroom && bolt.x === this.mushroom.x && bolt.y === this.mushroom.y)
        );
        return bolt;
    }

    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.pauseBtn.textContent = 'Pauza';
        this.stopMusic(); // Zastav hudbu při game over

        // Update high score (místní, pouze pro zobrazení)
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }

        // Ulož do online žebříčku
        let nickname = this.nicknameInput.value.trim() || "Hráč";
        saveHighscoreOnline(nickname, this.score);

        // Show game over screen
        this.finalScoreElement.textContent = this.score;
        let msgTitle = '';
        let msgText = '';
        if (this.wallCrash) {
            msgTitle = '';
            msgText = 'Ale ne! Hlavou Notino neprorazíš!';
            this.wallCrash = false;
        } else if (this.score <= 50) {
            msgTitle = 'Totální tragédie';
            msgText = 'Gratuluju! Takhle špatnej výsledek by nedal ani had bez hlavy.';
        } else if (this.score <= 150) {
            msgTitle = 'Ještě trochu potrénuj';
            msgText = 'Slušný, ale k mistrovství máš zatím tak daleko jako žížala k anakondě.';
        } else if (this.score <= 250) {
            msgTitle = 'Ale ono to půjde, ne že ne!';
            msgText = 'Ty jo! Ten had by si tě možná už i najal jako navigaci. Ale zatím jen na okresky.';
        } else if (this.score <= 500) {
            msgTitle = 'Geniální výkon';
            msgText = 'Skvělý! Ale už jdi radši pracovat. Ten had z tebe bude mít vyhřezlý střevo.';
        } else if (this.score <= 1000) {
            msgTitle = 'Mistr hadího světa';
            msgText = 'Úžasný výkon! Ten had by si tě už najal jako konzultanta.';
        } else {
            msgTitle = 'Liga mistrů';
            msgText = 'S takovým výsledkem už pošilháváš po křesle pro CEO, co?';
        }
        const msgDiv = this.gameOverElement.querySelector('.game-over-message');
        if (msgDiv) {
            msgDiv.innerHTML = `<strong>${msgTitle}</strong><br><span>${msgText}</span>`;
        }
        this.gameOverElement.classList.add('show');
        
        // Přehrá pouze hlášku po konci hry
        this.playRandomGameOverSound();
    }

    updateHighScore() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }

    updateLettersCollected() {
        // odstraněno
    }
    
    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }

    // Funkce pro resetování dat
    resetAllData() {
        console.log('Spouštím reset dat...');
        
        // Vynuluj nejlepší skóre
        localStorage.removeItem('snakeHighScore');
        this.highScore = 0;
        this.updateHighScore();
        console.log('Nejlepší skóre vynulováno');
        
        // Vynuluj top 10 hráčů
        // localStorage.removeItem('vivahadHighscores'); // Odstraněno
        // this.highscores = []; // Odstraněno
        // this.renderHighscores(); // Odstraněno
        console.log('Top 10 hráčů vynulováno');
        
        // Zkontroluj, jestli se data skutečně smazala
        const remainingHighScore = localStorage.getItem('snakeHighScore');
        // const remainingHighscores = localStorage.getItem('vivahadHighscores'); // Odstraněno
        console.log('Zbývající data:', { remainingHighScore });
        
        // Vynuluj také aktuální stav
        this.scoreElement.textContent = '0';
        this.highScoreElement.textContent = '0';
        this.highscoresBody.innerHTML = '';
        
        console.log('Všechna data byla vynulována');
    }
}

// ZDE VLOŽ SVŮJ URL GOOGLE APPS SCRIPT (viz návod níže)
const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbwPEKODqC_7zK_k3WJxpxhlm7tXY0TWSxaxAaFMhVOmxWeEIMDaRCG0-pIXNk6ZUKv-/exec";

function saveHighscoreOnline(nickname, score) {
    // Zkus JSONP přístup pro Google Apps Script
    const script = document.createElement('script');
    const callbackName = 'saveScoreCallback_' + Date.now();
    
    // Vytvoř globální callback funkci
    window[callbackName] = function(response) {
        console.log("Výsledek uložen do Google Sheets:", response);
        loadHighscoresOnline();
        // Vyčisti callback
        delete window[callbackName];
        document.head.removeChild(script);
    };
    
    // Vytvoř JSONP URL
    const jsonpUrl = `${SHEETS_API_URL}?callback=${callbackName}&action=save&nickname=${encodeURIComponent(nickname)}&score=${score}`;
    script.src = jsonpUrl;
    
    // Timeout pro JSONP
    setTimeout(() => {
        if (window[callbackName]) {
            console.error("JSONP timeout - použití localStorage fallback");
            delete window[callbackName];
            document.head.removeChild(script);
            saveHighscoreLocal(nickname, score);
            loadHighscoresLocal();
        }
    }, 5000);
    
    // Přidej script tag
    document.head.appendChild(script);
}

function loadHighscoresOnline() {
    // Zkus JSONP přístup pro načítání
    const script = document.createElement('script');
    const callbackName = 'loadScoresCallback_' + Date.now();
    
    // Vytvoř globální callback funkci
    window[callbackName] = function(data) {
        try {
            if (!Array.isArray(data) || data.length < 2) {
                console.error("Chybná data z Google Sheets:", data);
                loadHighscoresLocal();
                return;
            }
            // data je pole řádků, první řádek jsou hlavičky
            const rows = data.slice(1);
            // Seřadit podle skóre (sestupně)
            rows.sort((a, b) => Number(b[1]) - Number(a[1]));
            // Vzít top 10
            const top10 = rows.slice(0, 10);
            // Vykreslit do tabulky
            const tbody = document.getElementById('highscoresBody');
            tbody.innerHTML = '';
            top10.forEach((row, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${idx + 1}.</td><td>${row[0]}</td><td>${row[1]}</td>`;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("Chyba při zpracování dat:", error);
            loadHighscoresLocal();
        }
        
        // Vyčisti callback
        delete window[callbackName];
        document.head.removeChild(script);
    };
    
    // Vytvoř JSONP URL
    const jsonpUrl = `${SHEETS_API_URL}?callback=${callbackName}&action=load`;
    script.src = jsonpUrl;
    
    // Timeout pro JSONP
    setTimeout(() => {
        if (window[callbackName]) {
            console.error("JSONP timeout - použití localStorage fallback");
            delete window[callbackName];
            document.head.removeChild(script);
            loadHighscoresLocal();
        }
    }, 5000);
    
    // Přidej script tag
    document.head.appendChild(script);
}

// Fallback: localStorage žebříček (pouze pokud Google Sheets selže)
function saveHighscoreLocal(nickname, score) {
    let highscores = JSON.parse(localStorage.getItem('vivahadHighscores') || '[]');
    highscores.push([nickname, score]);
    highscores.sort((a, b) => Number(b[1]) - Number(a[1]));
    highscores = highscores.slice(0, 10);
    localStorage.setItem('vivahadHighscores', JSON.stringify(highscores));
}
function loadHighscoresLocal() {
    let highscores = JSON.parse(localStorage.getItem('vivahadHighscores') || '[]');
    const tbody = document.getElementById('highscoresBody');
    tbody.innerHTML = '';
    highscores.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx + 1}.</td><td>${row[0]}</td><td>${row[1]}</td>`;
        tbody.appendChild(tr);
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // Jednorázové vynulování dat (odkomentujte pro reset)
    // game.resetAllData();
    // Diamant
    const d = document.getElementById('legendDiamond');
    if (d && d.getContext) {
        const ctx = d.getContext('2d');
        const cx = 14, cy = 14, r = 10;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        // Lesk
        ctx.beginPath();
        ctx.moveTo(cx, cy - r + 2);
        ctx.lineTo(cx + r/2, cy);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fillStyle = '#fff8';
        ctx.fill();
    }
    // Muchomůrka
    const m = document.getElementById('legendMushroom');
    if (m && m.getContext) {
        const ctx = m.getContext('2d');
        const cx = 14, cy = 14, r = 10;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#b91c1c';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Bílé tečky
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI;
            const dotR = r / 4.5;
            const dotCx = cx + Math.cos(angle) * (r / 1.7);
            const dotCy = cy + Math.sin(angle) * (r / 1.7);
            ctx.beginPath();
            ctx.arc(dotCx, dotCy, dotR, 0, 2 * Math.PI);
            ctx.fill();
        }
        // Středová tečka
        ctx.beginPath();
        ctx.arc(cx, cy, r / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    // Blesk
    const b = document.getElementById('legendBolt');
    if (b && b.getContext) {
        const ctx = b.getContext('2d');
        const cx = 14, cy = 14, r = 10;
        ctx.save();
        // Černý podklad
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#111';
        ctx.globalAlpha = 0.85;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.globalAlpha = 1;
        // Blesk
        ctx.beginPath();
        ctx.moveTo(cx, cy - r + 2);
        ctx.lineTo(cx + r * 0.2, cy);
        ctx.lineTo(cx + r * 0.5, cy - r * 0.1);
        ctx.lineTo(cx, cy + r - 2);
        ctx.lineTo(cx - r * 0.2, cy);
        ctx.lineTo(cx - r * 0.5, cy + r * 0.1);
        ctx.closePath();
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
});