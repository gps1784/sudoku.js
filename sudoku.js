class Sudoku {
  static Grid = class Grid {
    constructor(cells, size = 9) {
      let _expectedCellCount = size**2;
      let _sqrt = Math.sqrt(size) >> 0; // force integer

      if(cells.length != _expectedCellCount) {
        throw(`Expected ${_expectedCellCount} cells, found ${cells.length} instead`);
      }
      if(_sqrt**2 != size) {
        throw(`Cannot calculate region size of grid size ${size}`);
      }

      this.cells = new Array(_expectedCellCount);
      this.size  = size;
      this.regionSize = _sqrt; // TODO rename? weird name
      for(let [_idx, _val] of cells.entries()) {
        let _row = (_idx / this.size) >> 0;
        let _col = (_idx % this.size);
        this.cells[_idx] = new Sudoku.Cell(_row, _col, _val);
      }
    } // TODO: make param size not a magic number

    clone() {
      let _cells = Array.from(this.cells, _cell => _cell.value);
      let _grid  = new Grid(_cells, this.size);
      _grid.resetGuesses();
      return _grid;
    }

    toArray() {
      return this.cells.map(_cell => _cell.value);
    }

    replace(cell) {
      let _idx = (cell.row * this.size) + cell.col;
      this.cells[_idx] = cell;
      return this;
    } // TODO: could we do better than replace?

    neighbors(cell) {
      let _regRow = cell.regionRow(this.regionSize);
      let _regCol = cell.regionCol(this.regionSize);
      return this.cells.filter( _neighbor => {
        let _nRegRow = _neighbor.regionRow(this.regionSize);
        let _nRegCol = _neighbor.regionCol(this.regionSize);
        if(_neighbor === cell) {
          return false;
        } else if(_neighbor.row === cell.row) {
          return true;
        } else if(_neighbor.col === cell.col) {
          return true;
        } else if((_nRegRow === _regRow) && (_nRegCol === _regCol)) {
          return true;
        } else {
          return false;
        }
      });

    }

    resetGuesses() {
      let _guesses = Array.from({length: this.size}, (_, _idx) => _idx + 1);
      for(let _cell of this.cells) {
        _cell.guesses = _guesses.slice(); // JS Array doesn't have dup()
        this.replace(_cell);
      }
      for(let _cell of this.cells) {
        if(!isNaN(_cell.value)) {
          this.setGuessesOfNeighbors(_cell);
        }
      }
    }

    setGuessesOfNeighbors(cell) {
      for(let _neighbor of this.neighbors(cell)) {
        _neighbor.guesses = _neighbor.guesses.filter(_guess => _guess != cell.value);
        this.replace(_neighbor);
      }
    }
  } // class Grid

  static Cell = class Cell {
    constructor(row, col, val = NaN, guesses = new Array()) {
      this.row = row;
      this.col = col;
      this.value = this.sanitizeValue(val);
      this.guesses = guesses.map(_guess => this.sanitizeValue(_guess));
    }

    regionRow(regionSize) {
      return (this.row / regionSize) >> 0;
    }

    regionCol(regionSize) {
      return (this.col / regionSize) >> 0;
    }

    sanitizeValue(val) {
      switch(typeof val) {
        case "number":
        case "string":
          return parseInt(val);
          break;
        default:
          throw(`Cell value ${val} is not valid.`)
      }
    }
  } // class Cell

  static Solver = class Solver {
    constructor(grid) {
      this.grid = grid;
      this.solutions = new Array();
      this.invokes = 0;
    }

    solve(callback = this.fillThenGuess) {
      this.invokes = 0;
      this.grid.resetGuesses();
      let timeStart = performance.now();
      callback.call(this);
      let timeEnd   = performance.now();
      this.timeMs   = timeEnd - timeStart;
      console.debug(`Found ${this.solutions.length} solves after running ${callback.name}() ${this.invokes} times in ${this.timeMs}ms`);
      console.debug(this.solutions);
      return this;
    }

    isValid(mustBeComplete = false) {
      for(let _cell of this.grid.cells) {
        if(isNaN(_cell.value)) {
          if(mustBeComplete) {
            return false; // cell is empty
          }
        } else {
          for(let _neighbor of this.grid.neighbors(_cell)) {
            if(_neighbor.value === _cell.value) {
              return false; // two neighbors match
            }
          }
        }
      }
      return true; // no cells failed
    }

    fillThenGuess() {
      this.invokes++;
      let _filledIn = false;
      if(!this.isValid()) {
        return;
      }
      for(let _cell of this.grid.cells) {
        if(isNaN(_cell.value) && (_cell.guesses.length === 1)) {
          // console.debug(`Filling in ${_cell.guesses[0]} at r${_cell.row}c${_cell.col}.`, this.grid.clone());
          _filledIn   = true;
          _cell.value = _cell.guesses[0];
          this.grid.replace(_cell);
          this.grid.setGuessesOfNeighbors(_cell);
        }
      }
      if(this.isValid(true)) {
        this.solutions.push(this.grid.toArray());
      } else if(_filledIn) {
        this.fillThenGuess();
      } else {
        // console.debug("Forced to guess.", this.grid.clone());
        for(let _cell of this.grid.cells) {
          if(isNaN(_cell.value)) {
            // if guesses lead to fill-ins, those fill-ins are hard to revert
            // instead, we bleach the grid back to the last known good state
            let _grid = this.grid.clone();
            for(let _guess of _cell.guesses) {
              // console.debug(`Guessing ${_guess} for r${_cell.row}c${_cell.col}.`, this.grid.clone());
              _cell.value = _guess;
              this.grid.replace(_cell); // insert guess
              this.grid.setGuessesOfNeighbors(_cell); // update neighbors
              this.fillThenGuess(); // try to continue filling
              this.grid = _grid.clone();
            }
          }
        }
      }
    }
  } // class Solver
}
