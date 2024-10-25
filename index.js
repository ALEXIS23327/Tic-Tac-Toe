const board = document.querySelectorAll('.cell');
let playerTurn = true;
let gameActive = true;
let startTime;
let interval;

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
];

const bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || [];
displayBestTimes();

const selectPlayerButton = document.getElementById('select-player');
const restartButton = document.getElementById('restart');
const toggleBestTimesButton = document.getElementById('toggle-best-times');
const bestTimesContainer = document.getElementById('best-times-container');

// Seleccionar jugador
selectPlayerButton.addEventListener('click', () => {
    let playerName = prompt('Ingresa tu nombre:');
    document.getElementById('status').textContent = `Turno de ${playerName}`;
});

// Mostrar u ocultar la tabla de mejores tiempos
toggleBestTimesButton.addEventListener('click', () => {
    if (bestTimesContainer.style.display === 'none') {
        bestTimesContainer.style.display = 'block';
        toggleBestTimesButton.textContent = 'Ocultar Mejores Tiempos';
    } else {
        bestTimesContainer.style.display = 'none';
        toggleBestTimesButton.textContent = 'Mostrar Mejores Tiempos';
    }
});

// Reiniciar la partida
restartButton.addEventListener('click', restartGame);

board.forEach(cell => {
    cell.addEventListener('click', handleClick);
});

function handleClick(e) {
    if (!gameActive || e.target.textContent) return;
    e.target.textContent = 'X';
    e.target.classList.add('x'); 
    if (!startTime) {
        startTime = new Date();
        interval = setInterval(updateTime, 1000);
    }
    playerTurn = false;
    checkGameStatus();
    if (gameActive) {
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    if (!gameActive) return;
    let emptyCells = Array.from(board).filter(cell => !cell.textContent);
    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        randomCell.textContent = 'O';
        randomCell.classList.add('o'); 
        playerTurn = true;
        checkGameStatus();
    }
}

function checkGameStatus() {
    const currentBoard = Array.from(board).map(cell => cell.textContent);
    for (let combo of winningCombos) {
        let [a, b, c] = combo;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            gameActive = false;
            clearInterval(interval);
            if (currentBoard[a] === 'X') {
                let timeTaken = Math.floor((new Date() - startTime) / 1000);
                let playerName = prompt('¡Ganaste! Ingresa tu nombre:');
                saveBestTime(playerName, timeTaken);
            } else {
                alert('Perdiste. Mejor suerte la próxima vez.');
            }
            return;
        }
    }
    if (currentBoard.every(cell => cell)) {
        gameActive = false;
        clearInterval(interval);
        alert('Es un empate.');
    }
}

function saveBestTime(playerName, time) {
    const newTime = { name: playerName, time, date: new Date().toLocaleString() };
    bestTimes.push(newTime);
    bestTimes.sort((a, b) => a.time - b.time);
    if (bestTimes.length > 10) {
        bestTimes.pop();
    }
    localStorage.setItem('bestTimes', JSON.stringify(bestTimes));
    displayBestTimes();
}

function displayBestTimes() {
    const bestTimesTableBody = document.querySelector('#best-times tbody');
    bestTimesTableBody.innerHTML = bestTimes.map(time => 
        `<tr>
            <td>${time.name}</td>
            <td>${time.time}</td>
            <td>${time.date}</td>
        </tr>`
    ).join('');
}

function updateTime() {
    const elapsedTime = Math.floor((new Date() - startTime) / 1000);
    document.getElementById('status').textContent = `Tiempo: ${elapsedTime} segundos`;
}

function restartGame() {
    gameActive = true;
    playerTurn = true;
    startTime = null;
    clearInterval(interval);
    board.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    document.getElementById('status').textContent = 'Comenzar partida';
}
