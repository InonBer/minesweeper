'use strict';
const EMPTY = `<img src="img/facingDown.png" />`;
const FLAGGED = `<img src="img/flagged.png" />`;
const MINE = `<img src="img/bomb.png" />`;
const Normal = '🙂';
const WIN = '😎';
const LOSE = '😵';

var gTimerInterval;

var gFlagged;
var gCountIsCount;
var gTime;
var gCells;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};
var gLevel;
var gBoard;

function initGame(levelNum) {
    gCells = [];
    gFlagged = 0;
    gCountIsCount = 0;
    gLevel = setLevel(levelNum);
    gBoard = buildBoard(gLevel.SIZE);
    // setMinesAroundCount(gBoard);
    renderBoard(gBoard);
    console.log('gBoard', gBoard);
}

function setLevel(num) {
    return {
        SIZE: num,
        MINES: num,
    };
}

function buildBoard(size) {
    // Create the Matrix
    var board = createMat(size, size);

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            };
            gCells.push({ i, j });
            // Add created cell to The game board
            board[i][j] = cell;
        }
    }
    return board;
}

function setMins(numOfMines, board, rowIdx, colIdx) {
    var availableSpots = [];

    for (var i = 0; i < gCells.length; i++) {
        if (gCells[i].i === rowIdx && gCells[i].j === colIdx) continue;
        availableSpots.push(gCells[i]);
    }
    for (var i = 0; i < numOfMines; i++) {
        var randomCell = getRandomInt(0, availableSpots.length);
        var availableSpot = availableSpots[randomCell];
        board[availableSpot.i][availableSpot.j].isMine = true;
        availableSpots.splice(randomCell, 1);
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var cellClass = getIdName({ i: i, j: j });

            strHTML += `<td id="${cellClass}"  
                            class="cell ${cellClass}"
                            oncontextmenu="rightClick(this,${i},${j})"
                            onclick="cellClicked(${i},${j})"  >
                            <img src="img/facingDown.png" /></td>`;
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(rowIdx, colIdx) {
    if (!gGame.isOn && gGame.shownCount === 0) {
        gGame.isOn = true;
        setMins(gLevel.MINES, gBoard, rowIdx, colIdx);
        setMinesAroundCount(gBoard);

        gTimerInterval = setInterval(timer, 10);
    } else if (gGame.shownCount > 0 && !gGame.isOn) return;

    if (gBoard[rowIdx][colIdx].isShown || gBoard[rowIdx][colIdx].isMarked) {
        return;
    }
    openCell(rowIdx, colIdx);

    if (
        gBoard[rowIdx][colIdx].minesAroundCount === 0 &&
        !gBoard[rowIdx][colIdx].isMine
    ) {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j > gBoard[i].length - 1) continue;
                if (i === rowIdx && j === colIdx) continue;
                if (gBoard[i][j].isMine) continue;
                if (gBoard[i][j].minesAroundCount === 0) cellClicked(i, j);
                if (gBoard[i][j].minesAroundCount > 0) openCell(i, j);
            }
        }
    }
}

function openCell(rowIdx, colIdx) {
    // if (gBoard[rowIdx][colIdx].isMine) return GameOver(rowIdx, colIdx);
    if (gBoard[rowIdx][colIdx].isShown) return;
    gCountIsCount++;
    checkGameOver(rowIdx, colIdx);
    gBoard[rowIdx][colIdx].isShown = true;
    gGame.shownCount++;
    // console.log(gBoard[rowIdx][colIdx].isShown);
    var cellIdName = getIdName({ i: rowIdx, j: colIdx });
    var elCell = document.getElementById(cellIdName);
    var cellElement = getCellElement(gBoard[rowIdx][colIdx]);

    elCell.innerHTML = cellElement;
}

function getCellElement(currCell) {
    if (currCell.isMine) return `<img src="img/mine-red.png" />`;
    var cellElement;

    switch (currCell.minesAroundCount) {
        case 0:
            cellElement = `<img src="img/0.png" />`;
            break;
        case 1:
            cellElement = `<img src="img/1.png" />`;
            break;
        case 2:
            cellElement = `<img src="img/2.png" />`;
            break;
        case 3:
            cellElement = `<img src="img/3.png" />`;
            break;
        case 4:
            cellElement = `<img src="img/4.png" />`;
            break;
        case 5:
            cellElement = `<img src="img/5.png" />`;
            break;
        case 6:
            cellElement = `<img src="img/6.png" />`;
            break;
        case 7:
            cellElement = `<img src="img/7.png" />`;
            break;
        case 8:
            cellElement = `<img src="img/8.png" />`;
            break;
    }
    return cellElement;
}

function renderCell(location, cellElement) {
    var cellSelector = '.' + getIdName(location);
    var elCell = document.querySelector(cellSelector);

    elCell.innerHTML = cellElement;
}

function setMinesAroundCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) continue;
            board[i][j].minesAroundCount = roundCount(board, i, j);
        }
    }
}

function roundCount(board, rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (board[i][j].isMine) count++;
        }
    }
    return count;
}

function rightClick(elCell, rowIdx, colIdx) {
    document.querySelector('div').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    if (!gGame.isOn) return;
    if (gBoard[rowIdx][colIdx].isShown) return;
    if (gBoard[rowIdx][colIdx].isMarked) {
        gBoard[rowIdx][colIdx].isMarked = false;
        gFlagged--;
        elCell.innerHTML = EMPTY;
    } else {
        gBoard[rowIdx][colIdx].isMarked = true;
        gFlagged++;
        elCell.innerHTML = FLAGGED;
    }
    var elFlagged = document.getElementById('flagged');
    elFlagged.innerHTML = gFlagged;
}

function checkGameOver(rowIdx, colIdx) {
    if (!gGame.isOn) return;

    if (gCountIsCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        gamerWin(rowIdx, colIdx);
    } else if (gBoard[rowIdx][colIdx].isMine) GameOver(rowIdx, colIdx);
}

function gamerWin(rowIdx, colIdx) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    console.log('Win');
    var elRestart = document.getElementById('restart');
    elRestart.innerHTML = WIN;
    unCoverMine(rowIdx, colIdx, FLAGGED);
}

function GameOver(rowIdx, colIdx) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    var cellClassName = getIdName({ i: rowIdx, j: colIdx });
    var elCell = document.getElementById(cellClassName);
    var cellElement = getCellElement(gBoard[rowIdx][colIdx]);
    elCell.innerHTML = cellElement;
    console.log('game over');
    var elRestart = document.getElementById('restart');
    elRestart.innerHTML = LOSE;
    unCoverMine(rowIdx, colIdx, MINE);
}

function unCoverMine(rowIdx, colIdx, element) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j] === gBoard[rowIdx][colIdx]) continue;
            if (gBoard[i][j].isMine) {
                renderCell({ i: i, j: j }, element);
            }
        }
    }
}

function restart(levelNum = gLevel.SIZE) {
    var elRestart = document.getElementById('restart');
    elRestart.innerHTML = Normal;
    gGame.isOn = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    second = 0;
    milliseconds = 0;
    minutes = 0;

    var elRestart = document.getElementById('time');
    elRestart.innerHTML = 0;
    var elRestart = document.getElementById('flagged');
    elRestart.innerHTML = 0;

    clearInterval(gTimerInterval);
    // console.log(levelNum);
    // gLevel.SIZE = levelNum;
    initGame(levelNum);
}
