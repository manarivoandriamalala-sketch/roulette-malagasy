class EuropeanRoulette {
    constructor() {
        this.numbers = [
            { number: '0', color: 'green' },
            { number: '32', color: 'red' }, { number: '15', color: 'black' },
            { number: '19', color: 'red' }, { number: '4', color: 'black' },
            { number: '21', color: 'red' }, { number: '2', color: 'black' },
            { number: '25', color: 'red' }, { number: '17', color: 'black' },
            { number: '34', color: 'red' }, { number: '6', color: 'black' },
            { number: '27', color: 'red' }, { number: '13', color: 'black' },
            { number: '36', color: 'red' }, { number: '11', color: 'black' },
            { number: '30', color: 'red' }, { number: '8', color: 'black' },
            { number: '23', color: 'red' }, { number: '10', color: 'black' },
            { number: '5', color: 'red' }, { number: '24', color: 'black' },
            { number: '16', color: 'red' }, { number: '33', color: 'black' },
            { number: '1', color: 'red' }, { number: '20', color: 'black' },
            { number: '14', color: 'red' }, { number: '31', color: 'black' },
            { number: '9', color: 'red' }, { number: '22', color: 'black' },
            { number: '18', color: 'red' }, { number: '29', color: 'black' },
            { number: '7', color: 'red' }, { number: '28', color: 'black' },
            { number: '12', color: 'red' }, { number: '35', color: 'black' },
            { number: '3', color: 'red' }, { number: '26', color: 'black' }
        ];
        
        this.credit = 200000;
        this.betAmount = 1;
        this.bets = new Map();
        this.isSpinning = false;
        this.lastBets = [];
        this.resultsHistory = [];
        this.betIdCounter = 0;
        
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentRotation = 0;
        
        this.initializeGame();
    }

    initializeGame() {
        this.drawWheel();
        this.setupNumberColors();
        this.setupEventListeners();
        this.updateDisplay();
        this.loadGameState();
    }

    setupNumberColors() {
        // Assigner les couleurs aux numéros dans la grille
        document.querySelectorAll('.number-cell').forEach(cell => {
            const number = cell.dataset.number;
            if (number === '0') {
                cell.classList.add('zero');
            } else {
                const numObj = this.numbers.find(n => n.number === number);
                if (numObj) {
                    cell.classList.add(numObj.color);
                }
            }
        });
    }

    setupEventListeners() {
        // Chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.betAmount = parseInt(e.target.dataset.amount);
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Numéros
        document.querySelectorAll('.number-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (this.isSpinning) return;
                this.placeNumberBet(e.target.dataset.number, e.target);
            });
        });

        // Paris extérieurs
        document.querySelectorAll('.outside-bet').forEach(bet => {
            bet.addEventListener('click', (e) => {
                if (this.isSpinning) return;
                this.placeOutsideBet(e.target.dataset.bet, e.target);
            });
        });

        // Contrôles
        document.getElementById('clearBets').addEventListener('click', () => {
            this.clearBets();
        });

        document.getElementById('repeatBet').addEventListener('click', () => {
            this.repeatLastBet();
        });

        document.getElementById('spinBtn').addEventListener('click', () => {
            this.spin();
        });
        document.getElementById('rechargeBtn').addEventListener('click', () => {
            this.rechargeCredit();
        });

        // Sauvegarder en quittant
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
    }

    placeNumberBet(number, element) {
        if (this.credit < this.betAmount) {
            this.showMessage("Solde insuffisant!", "error");
            return;
        }

        const betId = `number-${number}`;
        const currentAmount = this.bets.get(betId) || 0;
        this.bets.set(betId, currentAmount + this.betAmount);
        
        this.addChipToElement(element, currentAmount + this.betAmount);
        this.updateDisplay();
        this.playChipSound();
    }

    placeOutsideBet(betType, element) {
        if (this.credit < this.betAmount) {
            this.showMessage("Solde insuffisant!", "error");
            return;
        }

        const currentAmount = this.bets.get(betType) || 0;
        this.bets.set(betType, currentAmount + this.betAmount);
        
        this.addChipToElement(element, currentAmount + this.betAmount);
        this.updateDisplay();
        this.playChipSound();
    }
    rechargeCredit() {

    const amount = 100000; // montant ajouté

    this.credit += amount;

    this.updateDisplay();
    this.saveGameState();

    this.showMessage(
        `💰 Recharge de ${amount.toLocaleString('fr-FR')} Ar`,
        "success"
    );
}

    addChipToElement(element, amount) {
        // Retirer les anciennes chips
        element.querySelectorAll('.bet-chip').forEach(chip => chip.remove());
        
        // Ajouter nouvelle chip
        const chip = document.createElement('div');
        chip.className = 'bet-chip';
        chip.textContent = amount;
        chip.style.background = this.getChipColor(this.betAmount);
        
        element.style.position = 'relative';
        element.appendChild(chip);
    }

    getChipColor(amount) {
        const colors = {
            1: '#FF6B6B',
            5: '#4ECDC4', 
            25: '#45B7D1',
            100: '#96CEB4',
            500: '#FFEAA7'
        };
        return colors[amount] || '#d4af37';
    }

    clearBets() {
        this.bets.clear();
        document.querySelectorAll('.bet-chip').forEach(chip => chip.remove());
        this.updateDisplay();
        this.playClearSound();
    }

    repeatLastBet() {
        if (this.lastBets.length === 0) {
            this.showMessage("Aucun pari précédent!", "warning");
            return;
        }

        const lastBet = this.lastBets[this.lastBets.length - 1];
        const totalBet = Array.from(lastBet.values()).reduce((sum, amount) => sum + amount, 0);
        
        if (this.credit < totalBet) {
            this.showMessage("Solde insuffisant pour répéter le pari!", "error");
            return;
        }

        this.bets = new Map(lastBet);
        this.updateBetVisuals();
        this.updateDisplay();
        this.playChipSound();
    }

    updateBetVisuals() {
        // Nettoyer toutes les chips
        document.querySelectorAll('.bet-chip').forEach(chip => chip.remove());
        
        // Ajouter les chips selon les paris actuels
        this.bets.forEach((amount, betId) => {
            let element;
            
            if (betId.startsWith('number-')) {
                const number = betId.replace('number-', '');
                element = document.querySelector(`[data-number="${number}"]`);
            } else {
                element = document.querySelector(`[data-bet="${betId}"]`);
            }
            
            if (element) {
                this.addChipToElement(element, amount);
            }
        });
    }

    getTotalBet() {
        return Array.from(this.bets.values()).reduce((sum, amount) => sum + amount, 0);
    }

    updateDisplay() {
        const totalBet = this.getTotalBet();
        
        document.getElementById('credit').textContent = this.credit.toLocaleString();
        document.getElementById('totalBet').textContent = totalBet;
        
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = this.isSpinning || this.bets.size === 0 || this.credit < totalBet;
        
        // Animation du bouton
        if (!spinBtn.disabled) {
            spinBtn.style.animation = 'pulse 2s infinite';
        } else {
            spinBtn.style.animation = 'none';
        }
    }

    getNumberAtPosition(rotation) {
        const totalSegments = this.numbers.length;
        const segmentAngle = 360 / totalSegments;
        
        const relativeRotation = rotation % 360;
        const targetAngle = 270;
        const adjustedAngle = (targetAngle - relativeRotation + 360) % 360;
        const segmentIndex = Math.floor(adjustedAngle / segmentAngle);
        
        return this.numbers[segmentIndex];
    }

    calculateWin(winningNumberObj) {
        let totalWin = 0;
        const winningNumber = winningNumberObj.number;
        const winningColor = winningNumberObj.color;
        
        this.bets.forEach((amount, betId) => {
            const betType = betId.startsWith('number-') ? betId.replace('number-', '') : betId;
            
            if (this.isWinningBet(betType, winningNumber, winningColor)) {
                const multiplier = this.getPayoutMultiplier(betType);
                const win = amount * multiplier;
                totalWin += win;
                
                // Highlight winning bet
                this.highlightWinningBet(betId, true);
            } else {
                this.highlightWinningBet(betId, false);
            }
        });
        
        return totalWin;
    }

    isWinningBet(betType, winningNumber, winningColor) {
        const num = parseInt(winningNumber);
        
        switch(betType) {
            case winningNumber:
                return true;
                
            case 'red':
                return winningColor === 'red';
                
            case 'black':
                return winningColor === 'black';
                
            case 'even':
                return num !== 0 && num % 2 === 0;
                
            case 'odd':
                return num % 2 === 1;
                
            case '1-18':
                return num >= 1 && num <= 18;
                
            case '19-36':
                return num >= 19 && num <= 36;
                
            case '1-12':
                return num >= 1 && num <= 12;
                
            case '13-24':
                return num >= 13 && num <= 24;
                
            case '25-36':
                return num >= 25 && num <= 36;
                
            default:
                return false;
        }
    }

    highlightWinningBet(betId, isWinner) {
        let element;
        
        if (betId.startsWith('number-')) {
            const number = betId.replace('number-', '');
            element = document.querySelector(`[data-number="${number}"]`);
        } else {
            element = document.querySelector(`[data-bet="${betId}"]`);
        }
        
        if (element) {
            if (isWinner) {
                element.style.boxShadow = '0 0 20px #4CAF50';
                element.style.transform = 'scale(1.05)';
            } else {
                element.style.boxShadow = '';
                element.style.transform = '';
            }
        }
    }

    getPayoutMultiplier(betType) {
        const multipliers = {
            'number': 36,           // Plein (35:1 + mise initiale)
            'red': 2, 'black': 2,   // Couleur (1:1 + mise)
            'even': 2, 'odd': 2,    // Pair/Impair (1:1 + mise)
            '1-18': 2, '19-36': 2,  // Manque/Passe (1:1 + mise)
            '1-12': 3, '13-24': 3, '25-36': 3 // Douzaines (2:1 + mise)
        };
        
        for (const [key, multiplier] of Object.entries(multipliers)) {
            if (betType.includes(key) || betType === key) {
                return multiplier;
            }
        }
        
        return 36;
    }

    async spin() {
        const totalBet = this.getTotalBet();
        if (this.isSpinning || this.bets.size === 0 || this.credit < totalBet) return;
        
        this.isSpinning = true;
        this.lastBets.push(new Map(this.bets));
        this.credit -= totalBet;
        this.updateDisplay();
        
        this.showMessage("La roue tourne...", "info");
        this.playSpinSound();
        
        const wheel = document.querySelector('.wheel');
        const spinDuration = 4000;
        
        const extraRotations = 5 + Math.floor(Math.random() * 3);
        const randomEndAngle = Math.floor(Math.random() * 360);
        const targetAngle = 360 * extraRotations + randomEndAngle;
        
        wheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.1, 0.9)`;
        wheel.style.transform = `rotate(${targetAngle}deg)`;
        
        // Animation pendant le spin
        this.animateDuringSpin();
        
        await new Promise(resolve => {
            setTimeout(resolve, spinDuration + 200);
        });
        
        const finalRotation = targetAngle % 360;
        const winningNumberObj = this.getNumberAtPosition(finalRotation);
        const winAmount = this.calculateWin(winningNumberObj);
        this.credit += winAmount;
        
        this.updateResultsHistory(winningNumberObj);
        this.displayResult(winningNumberObj, winAmount, totalBet);
        this.saveGameState();
        
        // Réinitialiser après un délai
        setTimeout(() => {
            this.clearBets();
            this.resetBetHighlights();
        }, 3000);
        
        this.isSpinning = false;
        this.updateDisplay();
        
        this.currentRotation = finalRotation;
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${this.currentRotation}deg)`;
        void wheel.offsetWidth;
    }

    animateDuringSpin() {
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.textContent = "⏳ TOURNE...";
        spinBtn.style.background = '#6c757d';
    }

    resetBetHighlights() {
        document.querySelectorAll('.number-cell, .outside-bet').forEach(element => {
            element.style.boxShadow = '';
            element.style.transform = '';
        });
    }

    updateResultsHistory(winningNumberObj) {
        this.resultsHistory.unshift(winningNumberObj);
        if (this.resultsHistory.length > 10) this.resultsHistory.pop();
        
        const historyElement = document.getElementById('resultsHistory');
        historyElement.innerHTML = this.resultsHistory.map(num => 
            `<div class="result-number ${num.color}" title="${num.number} ${num.color}">${num.number}</div>`
        ).join('');
    }

    displayResult(winningNumberObj, winAmount, totalBet) {
        const resultElement = document.getElementById('gameResult');
        
        if (winAmount > 0) {
            resultElement.innerHTML = `🎉 GAGNÉ! ${winningNumberObj.number} ${winningNumberObj.color.toUpperCase()} - Gain: +${winAmount}Ariary`;
            resultElement.style.color = '#4CAF50';
            resultElement.style.fontWeight = 'bold';
            this.playWinSound();
        } else {
            resultElement.innerHTML = `❌ Perdu. ${winningNumberObj.number} ${winningNumberObj.color.toUpperCase()} - Mise: ${totalBet}Ariary`;
            resultElement.style.color = '#f44336';
            this.playLoseSound();
        }
        
        // Animation du résultat
        resultElement.style.animation = 'pulse 0.5s ease-in-out 3';
    }

    showMessage(message, type) {
        const resultElement = document.getElementById('gameResult');
        const colors = {
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3',
            success: '#4CAF50'
        };
        
        resultElement.textContent = message;
        resultElement.style.color = colors[type] || '#d4af37';
        
        setTimeout(() => {
            if (this.bets.size === 0) {
                resultElement.textContent = 'Placez vos mises';
                resultElement.style.color = '#d4af37';
            }
        }, 2000);
    }

    // Sons (simulés)
    playChipSound() {
        // Simuler un son de jeton
        const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
        audio.volume = 0.1;
        audio.play().catch(() => {});
    }

    playSpinSound() {
        // Simuler un son de roue
        console.log("🔊 Son de roue qui tourne");
    }

    playWinSound() {
        console.log("🎵 Son de victoire");
    }

    playLoseSound() {
        console.log("💸 Son de défaite");
    }

    playClearSound() {
        console.log("🗑️ Son de suppression");
    }

    // Sauvegarde
    saveGameState() {
        const gameState = {
            credit: this.credit,
            resultsHistory: this.resultsHistory,
            lastBets: this.lastBets.map(bet => Array.from(bet.entries()))
        };
        localStorage.setItem('rouletteGameState', JSON.stringify(gameState));
    }

loadGameState() {
    const saved = localStorage.getItem('rouletteGameState');

    if (saved) {
        try {
            const gameState = JSON.parse(saved);

            // Charger l'ancien crédit seulement s'il existe
            if (typeof gameState.credit === "number") {
                this.credit = gameState.credit;
            }

            this.resultsHistory = gameState.resultsHistory || [];

            this.lastBets = gameState.lastBets
                ? gameState.lastBets.map(entries => new Map(entries))
                : [];

            this.updateResultsHistoryDisplay();

        } catch (e) {
            console.log("Erreur chargement sauvegarde:", e);
        }
    }
}

    updateResultsHistoryDisplay() {
        const historyElement = document.getElementById('resultsHistory');
        historyElement.innerHTML = this.resultsHistory.map(num => 
            `<div class="result-number ${num.color}">${num.number}</div>`
        ).join('');
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 6;
        const segmentAngle = (2 * Math.PI) / this.numbers.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.numbers.forEach((numObj, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;

            this.ctx.fillStyle = numObj.color === 'red' ? '#c00' : 
                               numObj.color === 'black' ? '#000' : '#0a5c36';

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();

            // Séparateur
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + radius * Math.cos(startAngle),
                centerY + radius * Math.sin(startAngle)
            );
            this.ctx.stroke();

            // Texte
            const textAngle = startAngle + segmentAngle / 2;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngle);
            const textY = centerY + textRadius * Math.sin(textAngle);

            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(numObj.number, 0, 0);
            this.ctx.restore();
        });
    }
}

// Initialiser le jeu
document.addEventListener('DOMContentLoaded', () => {
    new EuropeanRoulette();
});

// Ajouter l'animation pulse au CSS global
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);