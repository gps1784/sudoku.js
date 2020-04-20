// TODO clean up and standardize this code

$(document).ready(sudokuGUI_onReady);

function sudokuGUI_onReady(jQuery) {
  sudokuGUI_initializeTable();
  sudokuGuI_loadFromSessionStorage();
} // onReady()

function sudokuGUI_initializeTable() {
  // initialize the table and the integer fields within
  const indexes = ["one","two","three","four","five","six","seven","eight","nine"];
  let table   = $("table#sudoku");
  let tbody   = $("<tbody>");
  table.append(tbody);
  $.each(indexes, function(idx_row, row) {
    let row_name = "sudoku-row-" + row;
    let tr       = $("<tr>");
    tbody.append(tr);
    $.each(indexes, function(idx_col, col) {
      let col_name = "sudoku-col-" + col;
      let td    = $("<td>").
        addClass(row_name).
        addClass(col_name).
        addClass(sudokuGUI_backgroundColorClass(idx_row, idx_col));
      let input = $("<input>",
      {
        "name":row_name + "_" + col_name,
        "type":"number",
        "min":"1",
        "max":"9",
        "onchange": "sudokuGUI_updateSessionStorage()"
      }).addClass("sudoku-field");
      tr.append(td);
      td.append(input);
    });
  });
}

function sudokuGuI_loadFromSessionStorage() {
  let ui_cells = $("table#sudoku input.sudoku-field").toArray();
  let cell_values = JSON.parse(sessionStorage.getItem("sudoku-cells")) || new Array();
  for(let idx = 0; idx < cell_values.length; idx++) {
    ui_cells[idx].value = cell_values[idx];
  }
}

function sudokuGUI_updateSessionStorage() {
  let cell_values = $("table#sudoku input.sudoku-field").toArray().map(input => input.value);
  sessionStorage.setItem("sudoku-cells", JSON.stringify(cell_values));
}

function sudokuGUI_reset() {
  let raw_grid = $("table#sudoku input.sudoku-field").val("");
}

function sudokuGUI_solve() {
  let raw_grid = $("table#sudoku input.sudoku-field").toArray().map(input => input.value);
  console.debug(raw_grid);
  let grid = new Sudoku.Grid(raw_grid);
  let solver = new Sudoku.Solver(grid).solve();
  console.debug(grid);
}

function sudokuGUI_backgroundColorClass(idx_row, idx_col) {
  if (isBetween(idx_row, 3, 5)) {
    // center rows; center cols, then edge cols
    return (isBetween(idx_col, 3, 5) ? "bg-secondary" : "bg-light");
  } else {
    // edge rows; center cols, then edge cols
    return (isBetween(idx_col, 3, 5) ? "bg-light" : "bg-secondary");
  }
} // sudokuBackgroundClassColor()

function isBetween(x, a, b) {
  if (a < b) {
    var lower = a, higher = b;
  } else {
    var lower = b, higher = a;
  }
  return ((x >= lower && x <= higher) ? true : false);
} // isBetween()
