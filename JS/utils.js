'use strict';
function createMat(ROWS, COLS) {
    var mat = [];
    for (var i = 0; i < ROWS; i++) {
        var row = [];
        for (var j = 0; j < COLS; j++) {
            row.push('');
        }
        mat.push(row);
    }
    return mat;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// Returns the class name for a specific cell
function getIdName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

var second = 0;
var milliseconds = 0;
var minutes = 0;

function timer() {
    milliseconds += 10; // Another 10 millisec interval has passed

    // Seconds is the number of round 1000 milliseconds that has passed
    second = Math.floor(milliseconds / 1000);

    // Calculate the residue of the millisecs after reducing the seconds
    // var millSec = milliseconds - second * 1000;

    // Calculate the minutes that have passed
    minutes = Math.floor(second / 60);
    var displaySecond = second - minutes * 60;
    // var strHTML = `${minutes}:${displaySecond}:${millSec}`;
    var strHTML = `${displaySecond}`;

    var elTimer = document.getElementById('time');
    elTimer.innerHTML = strHTML;
}

// todo :
// fix time after minutes
// on first click its not be mines
