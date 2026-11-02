const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const restartButton = document.getElementById("restart");

// Representação inicial das peças
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

let position = initialPosition.map(row => [...row]);
let selectedSquare = null;

function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            const isLight = (row + col) % 2 === 1;

            square.classList.add(isLight ? "light" : "dark");

            const piece = position[row][col];

            if (piece) {
                square.textContent = piece;

                const isWhite = "♙♖♘♗♕♔".includes(piece);

                square.classList.add(
                    isWhite ? "white-piece" : "black-piece"
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

function selectSquare(row, col) {
    const piece = position[row][col];

    if (piece) {
        selectedSquare = { row, col };
    } else {
        selectedSquare = null;
    }

    renderBoard();
}

function restartGame() {
    position = initialPosition.map(row => [...row]);
    selectedSquare = null;
    turnDisplay.textContent = "Turno: Brancas";

    renderBoard();
}

restartButton.addEventListener("click", restartGame);

renderBoard();
