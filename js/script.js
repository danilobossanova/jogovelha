document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");
    const gameStatus = document.getElementById("gameStatus");
    const restartButton = document.getElementById("restartButton");
    const playerScoreElement = document.getElementById("playerScore");
    const aiScoreElement = document.getElementById("aiScore");
    const tieScoreElement = document.getElementById("tieScore");
    const moveAnalysis = document.getElementById("moveAnalysis");

    let board, playerScore = 0, aiScore = 0, tieScore = 0;
    const player = "X";
    const ai = "O";
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Inicia o jogo ao clicar no botão reiniciar
    restartButton.addEventListener("click", startGame);

    // Função para iniciar o jogo
    function startGame() {
        // Inicializa o tabuleiro com valores de 0 a 8
        board = Array.from(Array(9).keys());
        gameStatus.innerText = "";
        moveAnalysis.innerText = "";
        gameBoard.innerHTML = "";

        // Cria as células do tabuleiro e adiciona eventos de clique
        for (let i = 0; i < 9; i++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = i;
            cell.addEventListener("click", handleTurnClick, false);
            gameBoard.appendChild(cell);
        }
    }

    // Função que lida com o clique do jogador
    function handleTurnClick(event) {
        let index = event.target.dataset.index;
        if (typeof board[index] === 'number') {
            // Jogada do jogador
            takeTurn(index, player);
            // Jogada da IA se o jogo não estiver ganho ou empatado
            if (!checkWin(board, player) && !checkTie()) takeTurn(bestSpot(), ai);
        }
    }

    // Função que executa uma jogada
    function takeTurn(index, currentPlayer) {
        board[index] = currentPlayer;
        document.querySelector(`[data-index='${index}']`).innerText = currentPlayer;
        let gameWon = checkWin(board, currentPlayer);
        if (gameWon) endGame(gameWon);
    }

    // Função que verifica se houve um vencedor
    function checkWin(board, player) {
        let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
        let gameWon = null;
        for (let [index, win] of winCombos.entries()) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {index: index, player: player};
                break;
            }
        }
        return gameWon;
    }

    // Função que finaliza o jogo
    function endGame(gameWon) {
        for (let index of winCombos[gameWon.index]) {
            document.querySelector(`[data-index='${index}']`).style.backgroundColor =
                gameWon.player === player ? "blue" : "red";
        }
        gameBoard.removeEventListener("click", handleTurnClick, false);
        declareWinner(gameWon.player === player ? "Você ganhou!" : "Você perdeu.");
        updateScore(gameWon.player);
        if (gameWon.player === ai) analyzeBestMove();
    }

    // Função que declara o vencedor
    function declareWinner(who) {
        gameStatus.innerText = who;
    }

    // Função que atualiza o placar
    function updateScore(winner) {
        if (winner === player) {
            playerScore++;
            playerScoreElement.innerText = playerScore;
        } else if (winner === ai) {
            aiScore++;
            aiScoreElement.innerText = aiScore;
        }
    }

    // Função que retorna as células vazias
    function emptySquares() {
        return board.filter(s => typeof s === 'number');
    }

    // Função que retorna a melhor jogada da IA
    function bestSpot() {
        return minimax(board, ai).index;
    }

    // Função que verifica se houve um empate
    function checkTie() {
        if (emptySquares().length === 0) {
            for (let cell of document.querySelectorAll(".cell")) {
                cell.style.backgroundColor = "green";
                cell.removeEventListener("click", handleTurnClick, false);
            }
            declareWinner("Empate!");
            updateTieScore(); // Atualiza o placar de empates
            return true;
        }
        return false;
    }

    // Função que atualiza o placar de empates
    function updateTieScore() {
        tieScore++;
        tieScoreElement.innerText = tieScore;
    }

    // Algoritmo minimax para determinar a melhor jogada
    function minimax(newBoard, currentPlayer) {
        let availSpots = emptySquares();

        if (checkWin(newBoard, player)) {
            return {score: -10};
        } else if (checkWin(newBoard, ai)) {
            return {score: 10};
        } else if (availSpots.length === 0) {
            return {score: 0};
        }

        let moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            let move = {};
            move.index = newBoard[availSpots[i]];
            newBoard[availSpots[i]] = currentPlayer;

            if (currentPlayer === ai) {
                let result = minimax(newBoard, player);
                move.score = result.score;
            } else {
                let result = minimax(newBoard, ai);
                move.score = result.score;
            }

            newBoard[availSpots[i]] = move.index;
            moves.push(move);
        }

        let bestMove;
        if (currentPlayer === ai) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    // Função que analisa a melhor jogada que o jogador poderia ter feito
    function analyzeBestMove() {
        // Copia do tabuleiro para análise
        let analysisBoard = board.slice();
        let bestMove = null;
        let bestScore = -10000;

        // Analisa todas as jogadas possíveis do jogador
        for (let i = 0; i < 9; i++) {
            if (typeof analysisBoard[i] === 'number') {
                analysisBoard[i] = player;
                let score = minimax(analysisBoard, ai).score;
                analysisBoard[i] = i;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        // Exibe a análise da jogada
        if (bestMove !== null) {
            moveAnalysis.innerText = `A melhor jogada que você poderia ter feito foi na posição ${bestMove}.`;
        } else {
            moveAnalysis.innerText = `Nenhuma jogada possível poderia ter mudado o resultado.`;
        }
    }

    // Inicia o jogo pela primeira vez
    startGame();
});
