
const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const restartButton = document.getElementById("restart");

const initialPosition = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

// Informações das peças
const pieceNames = {
    "♙": "Peão",
    "♖": "Torre",
    "♘": "Cavalo",
    "♗": "Bispo",
    "♕": "Rainha",
    "♔": "Rei",
    "♟": "Peão",
    "♜": "Torre",
    "♞": "Cavalo",
    "♝": "Bispo",
    "♛": "Rainha",
    "♚": "Rei"
};

let position = initialPosition.map(row => [...row]);

let selectedSquare = null;
let currentTurn = "white";

// Identifica a cor de uma peça
function getPieceColor(piece) {
    if (!piece) return null;

    return "♙♖♘♗♕♔".includes(piece)
        ? "white"
        : "black";
}

// Identifica as informações da peça
function getPieceInfo(piece) {
    if (!piece) return null;

    return {
        name: pieceNames[piece],
        color: getPieceColor(piece)
    };
}

// Renderiza o tabuleiro
function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            const isLight = (row + col) % 2 === 1;

            square.classList.add(
                isLight ? "light" : "dark"
            );

            const piece = position[row][col];

            if (piece) {
                square.textContent = piece;

                const color = getPieceColor(piece);

                square.classList.add(
                    color === "white"
                        ? "white-piece"
                        : "black-piece"
                );
            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            square.addEventListener("click", () => {
                selectSquare(row, col);
            });

            board.appendChild(square);
        }
    }
}

// Seleciona uma peça
function selectSquare(row, col) {

    const piece = position[row][col];

    if (!piece) {
        turnDisplay.textContent =
            "Selecione uma peça válida.";
        return;
    }

    const info = getPieceInfo(piece);

    // Verifica se pertence ao jogador atual
    if (info.color !== currentTurn) {
        turnDisplay.textContent =
            "Não é sua vez de movimentar essa peça.";
        return;
    }

    selectedSquare = { row, col };

    turnDisplay.textContent =
        `Brancas jogam | Selecionada: ${info.name}`;

    renderBoard();
}

// Reinicia a partida
function restartGame() {
    position = initialPosition.map(row => [...row]);

    selectedSquare = null;
    currentTurn = "white";

    turnDisplay.textContent = "Turno: Brancas";

    renderBoard();
}

restartButton.addEventListener("click", restartGame);

renderBoard();

