class SudokuGUI {

  static TABLE_SEARCH_STR = "table#sudoku";
  static TR_PRE_STR = "sudoku-row-";
  static TD_PRE_STR = "sudoku-col-";
  static INPUT_CLASS_STR = "sudoku-field";
  static INPUT_SEARCH_STR = this.TABLE_SEARCH_STR + " input." + this.INPUT_CLASS_STR;
  static SOLVE_SEARCH_STR = "div#sudoku-solutions";
  static SESSTORE_STR = "sudoku-cells";
  static DEFAULT_SIZE = 9;

  static onReady(jQuery, size = this.DEFAULT_SIZE) {
    this.createGUI(size);
    this.loadSessionStorage();
  }

  static createGUI(size) {
    const _suffixes = Array.from({length: size}, (_, _idx) => _idx+1);
    let   _table    = $(this.TABLE_SEARCH_STR);
    let   _tbody    = $("<tbody>"); // new object
    _table.append(_tbody);

    for(let _row of _suffixes) {
      const _rowName = this.TR_PRE_STR + _row.toString();
      let   _tr      = $("<tr>"); // new object
      _tbody.append(_tr);

      for(let _col of _suffixes) {
        const _colName = this.TD_PRE_STR + _col.toString();
        let   _td      = $("<td>").
          addClass(_rowName).
          addClass(_colName).
          addClass(this.backgroundClassColor(_row, _col)); // new object
        let   _input   = $("<input>",
          {
            "name": _rowName.toString() + "_" + _colName.toString(),
            "type": "number",
            "min": "1",
            "max": size.toString(),
            "onchange": "SudokuGUI.saveSessionStorage()"
          }).addClass(this.INPUT_CLASS_STR); // new object
        _tr.append(_td);
        _td.append(_input);
      }
    }
  }

  static solve(size = 9) {
    let _values = $(this.INPUT_SEARCH_STR).toArray().map(_val => _val.value);
    let _grid   = new Sudoku.Grid(_values, size);
    let _solver = new Sudoku.Solver(_grid).solve();
    this.emptySolutions();
    for(let _solution of _solver.solutions) {
      this.appendSolution(_solution, size);
    }
  }

  static emptySolutions() {
    $(this.SOLVE_SEARCH_STR).empty();
  }

  static appendSolution(solution, size) {
    let _solutionDiv = $(this.SOLVE_SEARCH_STR);
    let _table = $("<table>").
      addClass("mb-3"); // new object
    let _tbody = $("<tbody>"); // new object
    _solutionDiv.append(_table);
    _table.append(_tbody);

    for(let _row = 0; _row < size; _row++) {
      let _tr = $("<tr>").
        addClass("p-2"); // new object
      _tbody.append(_tr);

      for(let _col = 0; _col < size; _col++) {
        let _val = solution[(_row * size) + _col];
        let _td = $("<td>").
          addClass("p-2").
          addClass(this.backgroundClassColor(_row + 1, _col + 1)).
          text(_val); // new object
        _tr.append(_td);
      }
    }
  }

  static reset() {
    $(this.INPUT_SEARCH_STR).val("");
  }

  static loadSessionStorage() {
    let _guiCells = $(this.INPUT_SEARCH_STR).toArray();
    let _values   = JSON.parse(sessionStorage.getItem(this.SESSTORE_STR)) || new Array();
    for(let _idx = 0; _idx < _guiCells.length; _idx++) {
      _guiCells[_idx].value = _values[_idx];
    }
  }

  static saveSessionStorage() {
    let _values = $(this.INPUT_SEARCH_STR).toArray().map(_val => _val.value);
    sessionStorage.setItem(SESSTORE_STR, JSON.stringify(_values));
  }

  static backgroundClassColor(row, col) {
    if(this.isBetween(row, 4, 6)) {
      return (this.isBetween(col, 4, 6) ? "bg-secondary text-white" : "bg-light");
    } else {
      return (this.isBetween(col, 4, 6) ? "bg-light" : "bg-secondary text-white");
    }
  }

  static isBetween(x, a, b) {
    let low, high;
    if(a < b) {
      low = a, high = b;
    } else {
      low = b, high = a;
    }
    return (x >= low && x <= high);
  }
} // class SudokuGUI

$(document).ready(SudokuGUI.onReady.bind(SudokuGUI));
