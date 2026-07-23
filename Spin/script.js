class RouletteWheel {
    constructor() {
        this.numbers = [
            { number: '0', color: 'green' },
            { number: '32', color: 'red' },
            { number: '15', color: 'black' },
            { number: '19', color: 'red' },
            { number: '4', color: 'black' },
            { number: '21', color: 'red' },
            { number: '2', color: 'black' },
            { number: '25', color: 'red' },
            { number: '17', color: 'black' },
            { number: '34', color: 'red' },
            { number: '6', color: 'black' },
            { number: '27', color: 'red' },
            { number: '13', color: 'black' },
            { number: '36', color: 'red' },
            { number: '11', color: 'black' },
            { number: '30', color: 'red' },
            { number: '8', color: 'black' },
            { number: '23', color: 'red' },
            { number: '10', color: 'black' },
            { number: '5', color: 'red' },
            { number: '24', color: 'black' },
            { number: '16', color: 'red' },
            { number: '33', color: 'black' },
            { number: '1', color: 'red' },
            { number: '20', color: 'black' },
            { number: '14', color: 'red' },
            { number: '31', color: 'black' },
            { number: '9', color: 'red' },
            { number: '22', color: 'black' },
            { number: '18', color: 'red' },
            { number: '29', color: 'black' },
            { number: '7', color: 'red' },
            { number: '28', color: 'black' },
            { number: '12', color: 'red' },
            { number: '35', color: 'black' },
            { number: '3', color: 'red' },
            { number: '26', color: 'black' }
        ];
        
        this.isSpinning = false;
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentRotation = 0;
        
        this.drawWheel();
        this.setupEventListeners();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
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
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
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
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(numObj.number, 0, 0);
            this.ctx.restore();
        });
    }

    setupEventListeners() {
        document.getElementById('spinBtn').addEventListener('click', () => {
            this.spin();
        });
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

    async spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;
        document.getElementById('result').textContent = "La roue tourne...";
        
        const wheel = document.querySelector('.wheel');
        const spinDuration = 4000;
        
        const extraRotations = 5 + Math.floor(Math.random() * 3);
        const randomEndAngle = Math.floor(Math.random() * 360);
        const targetAngle = 360 * extraRotations + randomEndAngle;
        
        wheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.1, 0.9)`;
        wheel.style.transform = `rotate(${targetAngle}deg)`;
        
        await new Promise(resolve => {
            setTimeout(resolve, spinDuration + 200);
        });
        
        const finalRotation = targetAngle % 360;
        const winningNumberObj = this.getNumberAtPosition(finalRotation);
        
        const colorText = winningNumberObj.color === 'red' ? 'ROUGE' : 
                        winningNumberObj.color === 'black' ? 'NOIR' : 'VERT';
        
        document.getElementById('result').innerHTML = 
            `Numéro gagnant : <span class="winning-number">${winningNumberObj.number}</span> (${colorText})`;
        
        this.isSpinning = false;
        spinBtn.disabled = false;
        
        this.currentRotation = finalRotation;
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${this.currentRotation}deg)`;
        void wheel.offsetWidth;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RouletteWheel();
});