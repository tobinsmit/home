console.log("yep")
var newChanges = true;
var tensor = [];
resetTensor();

function resetTensor() {
  tensor = [];
  for(var i = 0; i < 9; i++) {
      tensor[i] = [];
      for(var j=0; j<9; j++) {
          tensor[i][j] = new Array(9).fill(true);
      }
  }
}

for (var row = 0; row < 9; row++) {
  $('#grid').append(`
    <tr data-row="${row}">
      <td data-col="0"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="1"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="2"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="3"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="4"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="5"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="6"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="7"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
      <td data-col="8"><input inputmode="numeric" pattern="[0-9]*" type="text" class="in"></td>
    </tr>
  `)
}

showMatrix([
[0, 0, 6, 0, 0, 5, 0, 0, 3],
[2, 8, 0, 3, 0, 0, 0, 0, 0],
[0, 4, 0, 6, 1, 0, 8, 0, 0],
[5, 2, 0, 0, 7, 0, 0, 0, 0],
[0, 7, 0, 2, 0, 4, 0, 8, 0],
[0, 0, 0, 0, 3, 0, 7, 0, 2],
[0, 0, 2, 0, 6, 3, 0, 7, 0],
[0, 0, 0, 0, 0, 0, 0, 1, 8],
[4, 0, 0, 1, 0, 0, 5, 0, 0]])


$('#solve').click(solve);

$('#simpleSolve').click(solveSimple)

$('#clear').click(function() {
  console.log("clearing")
  showMatrix([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]])
});

function solve() {

  solveSimple();

  backtrack();

}

function solveSimple() {
  console.log('Simple Solving...');

  resetTensor();

  // Read input numbers
  $('.in').each(function() {
    if (1 <= $(this).val() && $(this).val() <= 9) {
      processNumber($(this).parent().parent().attr('data-row'), $(this).parent().data('col'), $(this).val());
    }
  })

  newChanges = true;
  while (newChanges == true) {
    newChanges = false;
    enterAnyValInAnyCol();
    enterAnyValInAnyRow();
    enterAnyValInAnyBox();
    enterAnyValInAnyCell();
  }
}

function processNumber(row, col, val) {
  console.log(`processNumber(row ${row}, col ${col}, val ${val})`);

  for (var i = 0; i < 9; i++) {
    // Clear row
    tensor[row][i][val-1] = false;

    // Clear col
    tensor[i][col][val-1] = false;

    // Clear box
    tensor[Math.floor(row / 3) * 3 + Math.floor(i / 3)][Math.floor(col / 3) * 3 + i % 3][val-1] = false;

    // Clear cell
    tensor[row][col][i] = false;
  }
  fillOps();
}

function addNumber(row, col, val) {
  console.log("Adding number")
  $("#grid").find(`[data-row='${row}']`).find(`[data-col='${col}']`).find('.in').val(val)
  // $("#grid").find(`[data-row='${row}']`).find(`[data-col='${col}']`).css('color','red')
  processNumber(row, col, val);
  newChanges = true;
}

/*
          ███████╗██╗███╗   ███╗██████╗ ██╗     ███████╗    ███████╗ ██████╗ ██╗    ██╗   ██╗███████╗██████╗ 
          ██╔════╝██║████╗ ████║██╔══██╗██║     ██╔════╝    ██╔════╝██╔═══██╗██║    ██║   ██║██╔════╝██╔══██╗
          ███████╗██║██╔████╔██║██████╔╝██║     █████╗      ███████╗██║   ██║██║    ██║   ██║█████╗  ██████╔╝
          ╚════██║██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝      ╚════██║██║   ██║██║    ╚██╗ ██╔╝██╔══╝  ██╔══██╗
          ███████║██║██║ ╚═╝ ██║██║     ███████╗███████╗    ███████║╚██████╔╝███████╗╚████╔╝ ███████╗██║  ██║
          ╚══════╝╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝    ╚══════╝ ╚═════╝ ╚══════╝ ╚═══╝  ╚══════╝╚═╝  ╚═╝                                                                                                 
*/

function checkForSingleValInSingleRow(row, val) {
  var col = -1;
  for (var i = 0; i < 9; i++) {
    if (tensor[row][i][val-1] == true) {
      if (col == -1) {
        col = i;
      } else {
        return -1;
      }
    }
  }
  return col;
}

function enterAnyValInAnyRow() {
  console.log("enterAnyValInAnyRow");
  for (var row = 0; row < 9; row++) {
    for (var val = 1; val < 10; val++) {
      let col = checkForSingleValInSingleRow(row, val);
      if (col != -1) {
        console.log(`FOUND enterAnyValInAnyRow row ${row} col ${col} val ${val}`)
        addNumber(row, col, val);
      }
    }
  }
}

function checkForSingleValInSingleCol(col, val) {
  var row = -1;
  for (var i = 0; i < 9; i++) {
    if (tensor[i][col][val-1] == true) {
      if (row == -1) {
        row = i;
      } else {
        return -1;
      }
    }
  }
  return row;
}

function enterAnyValInAnyCol() {
  console.log("enterAnyValInAnyCol");
  for (var col = 0; col < 9; col++) {
    for (var val = 1; val < 10; val++) {
      let row = checkForSingleValInSingleCol(col, val)
      if (row != -1) {
        console.log(`FOUND enterAnyValInAnyCol row ${row} col ${col} val ${val}`)
        addNumber(row, col, val)
      }
    }
  }
}

function checkForSingleValInSingleBox(box, val) {
  var coords = {row:-1, col:-1}
  for (var i = 0; i < 9; i++) {
    let tempRow = Math.floor(box/3)*3 + Math.floor(i/3);
    let tempCol = (box%3)*3 + (i%3);
    if (tensor[tempRow][tempCol][val-1] == true) {
      if (JSON.stringify(coords) == JSON.stringify({row:-1, col:-1})) {
        coords.row = tempRow;
        coords.col = tempCol;
      } else {
        return {row:-1, col:-1}
      }
    }
  }
  return coords;
}

function enterAnyValInAnyBox() {
  console.log("enterAnyValInAnyBox");
  for (var box = 0; box < 9; box++) {
    for (var val = 1; val < 10; val++) {
      let res = checkForSingleValInSingleBox(box, val)
      if (JSON.stringify(res) != JSON.stringify({row:-1, col:-1})) {
        console.log(`FOUND enterAnyValInAnyBox row ${res.row} col ${res.col} val ${val} box ${box}`)
        addNumber(res.row, res.col, val)
      }
    }
  }
}

function checkForSingleValInSingleCell(row, col) {
  var val = -1;
  for (var i = 1; i < 10; i++) {
    if (tensor[row][col][i-1] == true) {
      if (val == -1) {
        val = i;
      } else {
        return -1;
      }
    }
  }
  return val;
}

function enterAnyValInAnyCell() {
  console.log("enterAnyValInAnyCell");
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      let val = checkForSingleValInSingleCell(row, col)
      if (val != -1) {
        console.log(`FOUND enterAnyValInAnyCell row ${row} col ${col} val ${val}`)
        addNumber(row, col, val)
      }
    }
  }
}

/*
          ██████╗  █████╗  ██████╗██╗  ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗
          ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
          ██████╔╝███████║██║     █████╔╝    ██║   ██████╔╝███████║██║     █████╔╝ 
          ██╔══██╗██╔══██║██║     ██╔═██╗    ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
          ██████╔╝██║  ██║╚██████╗██║  ██╗   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
          ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
*/
// Set up matricies
var origMatrix = [];
var workMatrix = [];
resetOrigMatrix();
resetWorkMatrix();
function resetOrigMatrix() {
  origMatrix = [];
  for (var i = 0; i < 9; i++) {
    origMatrix[i] = new Array(9).fill(0)
  }
}
function resetWorkMatrix() {
  workMatrix = [];
  for (var i = 0; i < 9; i++) {
    workMatrix[i] = new Array(9).fill(0)
  }
}

$('#backtrack').click(backtrack)

function backtrack() {
  resetOrigMatrix();
  resetWorkMatrix();

  // Read input numbers
  $('.in').each(function() {
    if (1 <= $(this).val() && $(this).val() <= 9) {
      origMatrix[$(this).parent().parent().attr('data-row')][$(this).parent().data('col')] = eval($(this).val())
      workMatrix[$(this).parent().parent().attr('data-row')][$(this).parent().data('col')] = eval($(this).val())
    }
  })

  if (checkWorkMatrixValid(origMatrix) == false) {
    alert("Sudoku is invalid")
    return
  }

  var spot = {r: 0, c: 0, v:1};
  while (checkWorkMatrixComplete(workMatrix) == false) {
    // sleep(10);

    // Keep moving if on orig number
    while (origMatrix[spot.r][spot.c] >= 1) {
      console.log("Kept moving")
      moveSpot(spot);
    }

    // Update value
    // console.log(`Spot r${spot.r} c${spot.c} vel${spot.v} val${workMatrix[spot.r][spot.c]}. matrixValidity = ${checkWorkMatrixValid()}`)
    if (workMatrix[spot.r][spot.c] < 9) {
      workMatrix[spot.r][spot.c]++;
      if (checkWorkMatrixValid() == true) {
        spot.v = 1
      } else {
        spot.v = 0
      }
      
    } else {
      workMatrix[spot.r][spot.c] = 0
      spot.v = -1
    }

    // Update spot
    moveSpot(spot);

    // showMatrix(workMatrix);
    // console.log(workMatrix, origMatrix);

    checkWorkMatrixComplete(workMatrix);
  }


  showMatrix(workMatrix)

}

function checkWorkMatrixValid() {
  for (var val = 1; val < 10; val++) {
    // Check val in row
    for (var r = 0; r < 9; r++) {
      var count = 0;
      for (var i = 0; i < 9; i++) {
        if (workMatrix[r][i] == val) count++;
      }
      if (count >= 2) return false;
    }
    

    // Check val in col
    for (var c = 0; c < 9; c++) {
      var count = 0;
      for (var i = 0; i < 9; i++) {
        if (workMatrix[i][c] == val) count++;
      }
      if (count >= 2) return false;
    }

    // Check val in box
    for (var b = 0; b < 9; b++) {
      var count = 0;
      for (var i = 0; i < 9; i++) {
        if (workMatrix[Math.floor(b/3)*3 + Math.floor(i/3)][(b%3)*3 + (i%3)] == val) count++;
      }
      if (count >= 2) return false;
    }
  }
  return true;
}

function checkWorkMatrixComplete() {
  if (checkWorkMatrixValid == false) return false;

  for (var r = 0; r < 9; r++) {
    for (var c = 0; c < 9; c++) {
      if (!(1 <= workMatrix[r][c] && workMatrix[r][c] <= 9)) return false;
    }
  }
}

function moveSpot(spot) {
  if (spot.v == 1) {
    incrementSpot(spot);
  } else if (spot.v == -1) {
    decrementSpot(spot);
  }
}
function incrementSpot(spot) {
  if (spot.c < 8) {
    spot.c ++;
  } else {
    spot.r ++;
    spot.c = 0;
  }
}
function decrementSpot(spot) {
  if (spot.c > 0) {
    spot.c --;
  } else {
    spot.r --;
    spot.c = 8;
  }
}

function showMatrix(matrix) {
  $('.in').each(function() {
    row = $(this).parent().parent().attr('data-row');
    col = $(this).parent().attr('data-col');
    val = matrix[row][col]
    $(this).val(val ? val : "");
  })
}


/*
  ██████╗ ██████╗ ██╗███╗   ██╗████████╗███████╗
  ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝██╔════╝
  ██████╔╝██████╔╝██║██╔██╗ ██║   ██║   ███████╗
  ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║   ╚════██║
  ██║     ██║  ██║██║██║ ╚████║   ██║   ███████║
  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
*/

function stringValLayer(val) {
  return `
  +-------+-------+-------+
  | ${tensor[0][0][val-1]?val:' '} ${tensor[0][1][val-1]?val:' '} ${tensor[0][2][val-1]?val:' '} | ${tensor[0][3][val-1]?val:' '} ${tensor[0][4][val-1]?val:' '} ${tensor[0][5][val-1]?val:' '} | ${tensor[0][6][val-1]?val:' '} ${tensor[0][7][val-1]?val:' '} ${tensor[0][8][val-1]?val:' '} |
  | ${tensor[1][0][val-1]?val:' '} ${tensor[1][1][val-1]?val:' '} ${tensor[1][2][val-1]?val:' '} | ${tensor[1][3][val-1]?val:' '} ${tensor[1][4][val-1]?val:' '} ${tensor[1][5][val-1]?val:' '} | ${tensor[1][6][val-1]?val:' '} ${tensor[1][7][val-1]?val:' '} ${tensor[1][8][val-1]?val:' '} |
  | ${tensor[2][0][val-1]?val:' '} ${tensor[2][1][val-1]?val:' '} ${tensor[2][2][val-1]?val:' '} | ${tensor[2][3][val-1]?val:' '} ${tensor[2][4][val-1]?val:' '} ${tensor[2][5][val-1]?val:' '} | ${tensor[2][6][val-1]?val:' '} ${tensor[2][7][val-1]?val:' '} ${tensor[2][8][val-1]?val:' '} |
  +-------+-------+-------+
  | ${tensor[3][0][val-1]?val:' '} ${tensor[3][1][val-1]?val:' '} ${tensor[3][2][val-1]?val:' '} | ${tensor[3][3][val-1]?val:' '} ${tensor[3][4][val-1]?val:' '} ${tensor[3][5][val-1]?val:' '} | ${tensor[3][6][val-1]?val:' '} ${tensor[3][7][val-1]?val:' '} ${tensor[3][8][val-1]?val:' '} |
  | ${tensor[4][0][val-1]?val:' '} ${tensor[4][1][val-1]?val:' '} ${tensor[4][2][val-1]?val:' '} | ${tensor[4][3][val-1]?val:' '} ${tensor[4][4][val-1]?val:' '} ${tensor[4][5][val-1]?val:' '} | ${tensor[4][6][val-1]?val:' '} ${tensor[4][7][val-1]?val:' '} ${tensor[4][8][val-1]?val:' '} |
  | ${tensor[5][0][val-1]?val:' '} ${tensor[5][1][val-1]?val:' '} ${tensor[5][2][val-1]?val:' '} | ${tensor[5][3][val-1]?val:' '} ${tensor[5][4][val-1]?val:' '} ${tensor[5][5][val-1]?val:' '} | ${tensor[5][6][val-1]?val:' '} ${tensor[5][7][val-1]?val:' '} ${tensor[5][8][val-1]?val:' '} |
  +-------+-------+-------+
  | ${tensor[6][0][val-1]?val:' '} ${tensor[6][1][val-1]?val:' '} ${tensor[6][2][val-1]?val:' '} | ${tensor[6][3][val-1]?val:' '} ${tensor[6][4][val-1]?val:' '} ${tensor[6][5][val-1]?val:' '} | ${tensor[6][6][val-1]?val:' '} ${tensor[6][7][val-1]?val:' '} ${tensor[6][8][val-1]?val:' '} |
  | ${tensor[7][0][val-1]?val:' '} ${tensor[7][1][val-1]?val:' '} ${tensor[7][2][val-1]?val:' '} | ${tensor[7][3][val-1]?val:' '} ${tensor[7][4][val-1]?val:' '} ${tensor[7][5][val-1]?val:' '} | ${tensor[7][6][val-1]?val:' '} ${tensor[7][7][val-1]?val:' '} ${tensor[7][8][val-1]?val:' '} |
  | ${tensor[8][0][val-1]?val:' '} ${tensor[8][1][val-1]?val:' '} ${tensor[8][2][val-1]?val:' '} | ${tensor[8][3][val-1]?val:' '} ${tensor[8][4][val-1]?val:' '} ${tensor[8][5][val-1]?val:' '} | ${tensor[8][6][val-1]?val:' '} ${tensor[8][7][val-1]?val:' '} ${tensor[8][8][val-1]?val:' '} |
  +-------+-------+-------+`
}

function fillOps() {
  $('#ops').html(`
    <div class="col-4">
      <pre>
        ${stringValLayer(1)}
        ${stringValLayer(4)}
        ${stringValLayer(7)}
      </pre>
    </div>
    <div class="col-4">
      <pre>
        ${stringValLayer(2)}
        ${stringValLayer(5)}
        ${stringValLayer(8)}
      </pre>
    </div>
    <div class="col-4">
      <pre>
        ${stringValLayer(3)}
        ${stringValLayer(6)}
        ${stringValLayer(9)}
      </pre>
    </div>

  `)
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// http://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=prints