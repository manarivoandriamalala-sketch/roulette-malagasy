// Configuration des symboles et leurs probabilités
const symbols = [
    { name: '7', emoji: '7️⃣', weight: 5 },
    { name: 'DIAMANT', emoji: '💎', weight: 5 },
    { name: 'TRIPLE BAR', emoji: '🍒🍒🍒', weight: 10 },
    { name: 'DOUBLE BAR', emoji: '🍒🍒', weight: 15 },
    { name: 'BAR', emoji: '🍒', weight: 20 },
    { name: 'CERISE', emoji: '🍒', weight: 25 },
    { name: 'ORANGE', emoji: '🍊', weight: 25 },
    { name: 'CITRON', emoji: '🍋', weight: 25 },
    { name: 'PRUNE', emoji: '🍇', weight: 25 }
];

// Tableaux des gains
const payouts = {
    'DIAMANT-DIAMANT-DIAMANT': 500,
    'TRIPLE BAR-TRIPLE BAR-TRIPLE BAR': 200,
    'DOUBLE BAR-DOUBLE BAR-DOUBLE BAR': 100,
    'BAR-BAR-BAR': 50,
    'CERISE-CERISE-CERISE': 30,
    'ORANGE-ORANGE-ORANGE': 20,
    'CITRON-CITRON-CITRON': 15,
    'PRUNE-PRUNE-PRUNE': 10,
    'CERISE-CERISE': 5
};

// Variables de jeu
let credits = 1000;
const bet = 10;
let isSpinning = false;

// Éléments DOM
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const creditsDisplay = document.getElementById('credits');
const winMessage = document.getElementById('win-message');
const resultMessage = document.getElementById('result-message');
const spinButton = document.getElementById('spin-button');

// Initialisation
creditsDisplay.textContent = credits;

// Sélection aléatoire d'un symbole basé sur les poids
function getRandomSymbol() {
    const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    for (let symbol of symbols) {
        random -= symbol.weight;
        if (random <= 0) return symbol;
    }
    return symbols[symbols.length - 1];
}

// Lancement du spin
spinButton.addEventListener('click', () => {
    if (isSpinning || credits < bet) {
        if (credits < bet) {
            resultMessage.textContent = 'Solde insuffisant !';
        }
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    credits -= bet;
    creditsDisplay.textContent = credits;
    winMessage.textContent = '';
    resultMessage.textContent = '';

    // Animation de secousse
    reels.forEach(reel => reel.classList.add('shake'));
    setTimeout(() => reels.forEach(reel => reel.classList.remove('shake')), 200);

    // Rotation des rouleaux
    const results = [];
    reels.forEach((reel, index) => {
        reel.style.animation = `spin ${1.5 + index * 0.5}s ease-out`;
        setTimeout(() => {
            reel.style.animation = '';
            const symbol = getRandomSymbol();
            reel.textContent = symbol.emoji;
            results.push(symbol.name);
            if (index === 2) {
                checkWin(results);
                isSpinning = false;
                spinButton.disabled = false;
            }
        }, (1500 + index * 500));
    });
});

// Vérification des gains
function checkWin(results) {
    const key = results.join('-');
    let winAmount = 0;

    // Vérifier les combinaisons de 3 symboles
    if (payouts[key]) {
        winAmount = payouts[key];
    }
    // Vérifier les 2 cerises
    else if (results[0] === 'CERISE' && results[1] === 'CERISE') {
        winAmount = payouts['CERISE-CERISE'];
    }

    if (winAmount > 0) {
        credits += winAmount;
        creditsDisplay.textContent = credits;
        winMessage.textContent = `VOUS AVEZ GAGNÉ : ${winAmount} jetons`;
        winMessage.classList.add('pulse');
        resultMessage.textContent = 'Bravo !';
        setTimeout(() => winMessage.classList.remove('pulse'), 2000);
    } else {
        resultMessage.textContent = 'Essayez encore !';
    }
}