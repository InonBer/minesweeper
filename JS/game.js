'use strict';
const EMPTY = `<img src="img/facingDown.png" />`;
const FLAGGED = `<img src="img/flagged.png" />`;
const MINE = `<img src="img/bomb.png" />`;
const Normal = '🙂';
const WIN = '😎';
const LOSE = '😵';
const LIFE = '❤️';
const SAFECLICKS = '💡'


var gMoves;
var gTimerInterval;
var gLifes = 3
var gFlagged;
var gCountIsCount;
var gTime;
var gCells;
var gHints;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};
var gLevel;
var gBoard;
var gSevenBoom = false
var gLevelNum;
function initGame(levelNum) {
    gLevelNum = levelNum
    gCells = [];
    gLifes = 3
    gFlagged = 0;
    gHints = 3
    var elHints = document.querySelector('.hints')
    elHints.innerText = lessHints()
    var elLifes = document.querySelector('.remain')
    elLifes.innerText = setLifesLeft()
    gMoves = []
    gCountIsCount = 0;
    gLevel = setLevel(levelNum);
    gBoard = buildBoard(gLevel.SIZE);
    // setMinesAroundCount(gBoard);
    renderBoard(gBoard);
    console.log('gBoard', gBoard);
}

function setLevel(num) {

    if (num === 6) {// for a normal game just cancel those...
        return {
            SIZE: 4,
            MINES: 2,
        };
    }
    return {
        SIZE: num,
        MINES: num,
    };
}

function buildBoard(size) {
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
            board[i][j] = cell;
        }
    }


    return board;
}

function setMines(numOfMines, board, rowIdx, colIdx) {
    var availableSpots = [];
    if (!gSevenBoom) {
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
    } else {
        var counter = 0;
        for (var x = 0; x < gBoard.length; x++) {
            for (var y = 0; y < gBoard[x].length; y++) {
                counter++;
                if (counter % 7 == 0 || counter.toString().includes("7")) {
                    gBoard[x][y].isMine = true
                }
            }
        }
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
                            onclick="clickCell(${i},${j})"  >
                            <img src="img/facingDown.png" /></td>`;
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function clickCell(i, j) {
    var affected = cellClicked(i, j);
    gMoves.push({ openCells: affected });
}

function cellClicked(rowIdx, colIdx) {
    if (!gGame.isOn && gGame.shownCount === 0) {
        gGame.isOn = true;
        setMines(gLevel.MINES, gBoard, rowIdx, colIdx);
        setMinesAroundCount(gBoard);

        gTimerInterval = setInterval(timer, 10);
    } else if (gGame.shownCount > 0 && !gGame.isOn) return [];

    if (gBoard[rowIdx][colIdx].isShown || gBoard[rowIdx][colIdx].isMarked) {
        return [];
    }
    openCell(rowIdx, colIdx);
    var affected = [{ i: rowIdx, j: colIdx }];
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
                if (gBoard[i][j].minesAroundCount === 0)
                    affected = affected.concat(cellClicked(i, j));
                if (gBoard[i][j].minesAroundCount > 0) {
                    openCell(i, j);
                    affected.push({ i, j });
                }
            }
        }
    }
    return affected;
}

function openCell(rowIdx, colIdx) {
    if (gBoard[rowIdx][colIdx].isShown) return [];
    if (!gBoard[rowIdx][colIdx].isMine) gCountIsCount++;
    checkGameOver(rowIdx, colIdx);
    gBoard[rowIdx][colIdx].isShown = true;
    gGame.shownCount++;
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
        gMoves.push({ "AddFlag": { i: rowIdx, j: colIdx } });
    } else {
        gBoard[rowIdx][colIdx].isMarked = true;
        gFlagged++;
        elCell.innerHTML = FLAGGED;
        gMoves.push({ "RemoveFlag": { i: rowIdx, j: colIdx } });
    }
    var elFlagged = document.getElementById('flagged');
    elFlagged.innerHTML = gFlagged;

}

function checkGameOver(rowIdx, colIdx) {
    if (!gGame.isOn) return;

    if (gCountIsCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        gamerWin(rowIdx, colIdx);
    } else if (gBoard[rowIdx][colIdx].isMine) {
        gLifes--
        var elLifes = document.querySelector('.remain')
        elLifes.innerText = setLifesLeft()
        if (!gLifes) GameOver(rowIdx, colIdx);
        console.log(gLifes);
    }
}
function setLifesLeft() {
    var strHTML = ''
    for (var i = 0; i < gLifes; i++) {
        strHTML += LIFE
    }
    return strHTML
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

function boomLevel() {
    // console.log(gSevenBoom);
    gSevenBoom = !gSevenBoom
    var elBoom = document.querySelector('.boom')
    if (gSevenBoom) {
        // elBoom.style.color = 'black'
        elBoom.style.backgroundColor = 'green'
        restart(gLevelNum)
    } else {
        restart(gLevelNum)
        elBoom.style.backgroundColor = 'white'
        // elBoom.style.color = 'black'
    }
    console.log(gSevenBoom);
}


function safeClick() {
    if (!gHints) return
    gHints--
    var i = getRandomInt(0, gBoard.length - 1)
    var j = getRandomInt(0, gBoard.length - 1)
    var hint = gBoard[i][j]
    hint.isShown = true
    var hintElement = getCellElement(hint)
    renderCell({ i, j }, hintElement)
    var elHints = document.querySelector('.hints')
    elHints.innerText = lessHints()

    setTimeout(() => {
        hint.isShown = false
        renderCell({ i, j }, EMPTY)
    }, 3000)
}

function lessHints() {
    var strHTML = ''
    for (var i = 0; i < gHints; i++) {
        strHTML += SAFECLICKS
    }
    return strHTML
}

function undo() {
    if (!gMoves.length) return;
    var lastTurn = gMoves.pop();
    var location = Object.values(lastTurn)[0];
    switch (Object.keys(lastTurn)[0]) {
        case 'RemoveFlag': // remove flag
            var cell = gBoard[location.i][location.j];
            renderCell(location, EMPTY);
            gGame.markedCount--;
            cell.isMarked = false;
            break;
        case 'AddFlag': // add flag
            var cell = gBoard[location.i][location.j];
            renderCell(location, FLAGGED);
            gGame.markedCount++;
            cell.isMarked = true;
            break;
        case 'openCells': // hind all cells
            for (let i = 0; i < location.length; i++) {
                undoCells(location[i]);
            }

            break;
    }

}
function undoCells(location) {
    var cell = gBoard[location.i][location.j];
    renderCell(location, EMPTY);
    cell.isShown = false;
    gGame.shownCount--;
    gCountIsCount--;
}


