'use strict';

function Game() {

  const dom = {};
  let cells = [];
  let max;
  let gridSize;
  let values;
  let level;
  let moves;

  const settings = {
    1: {
      grid: 100,
      max: 12,
      values: [0, 1, 2, 3]
    },
    2: {
      grid: 100,
      max: 15,
      values: [0, 1, 2, 3, 4]
    },
    3: {
      grid: 100,
      max: 18,
      values: [0, 1, 2, 3, 4, 5]
    },
    4: {
      grid: 100,
      max: 21,
      values: [0, 1, 2, 3, 4, 5, 6]
    },
    5: {
      grid: 169,
      max: 15,
      values: [0, 1, 2, 3]
    },
    6: {
      grid: 169,
      max: 21,
      values: [0, 1, 2, 3, 4]
    },
    7: {
      grid: 169,
      max: 27,
      values: [0, 1, 2, 3, 4, 5]
    },
    8: {
      grid: 169,
      max: 35,
      values: [0, 1, 2, 3, 4, 5, 6]
    },
    9: {
      grid: 225,
      max: 18,
      values: [0, 1, 2, 3]
    },
    10: {
      grid: 225,
      max: 25,
      values: [0, 1, 2, 3, 4]
    },
    11: {
      grid: 225,
      max: 30,
      values: [0, 1, 2, 3, 4, 5]
    },
    12: {
      grid: 225,
      max: 39,
      values: [0, 1, 2, 3, 4, 5, 6]
    },
    13: {
      grid: 324,
      max: 18,
      values: [0, 1, 2, 3]
    },
    14: {
      grid: 324,
      max: 27,
      values: [0, 1, 2, 3, 4]
    },
    15: {
      grid: 324,
      max: 36,
      values: [0, 1, 2, 3, 4, 5]
    },
    16: {
      grid: 324,
      max: 45,
      values: [0, 1, 2, 3, 4, 5, 6]
    },
  }

  let checkedPositions = [];

  function init() {
    setLevel(1);
    cacheDOM();
    bindEvents();
    start();
  }

  function setLevel(newLevel) {
    level = newLevel;
    max = settings[level].max;
    gridSize = settings[level].grid;
    values = settings[level].values;
    moves = 0;
  }

  function start() {
    createGrid();
    updateNeighbors(); // @todo infect the same values!
    dom.grid.dataset.size = gridSize;
    render();
  }

  function cacheDOM() {
    dom.game = document.getElementById('game');
    dom.grid = document.getElementById('grid');
    dom.cells = grid.getElementsByTagName('div');
    dom.colors = document.getElementById('colors');
    dom.level = document.getElementById('level');
    dom.moves = document.getElementById('moves');
    dom.max = document.getElementById('max');
  }

  function bindEvents() {
    dom.colors.addEventListener('click', handleClick);
  }

  function createGrid() {
    cells = [];
    for (let i = 0; i < gridSize; i++) {
      let value = random(0, values.length - 1);
      let cell = Cell(value, i);
      cells.push(cell);
    }
  }

  function render() {
    dom.grid.innerHTML = '';
    let fragment = document.createDocumentFragment();
    for (let i = 0; i < cells.length; i++) {
      let cell = cells[i].render();
      fragment.appendChild(cell);
    }
    dom.grid.appendChild(fragment);

    dom.colors.innerHTML = '';
    fragment = document.createDocumentFragment();
    for (let i = 0; i < values.length; i++) {
      let color = document.createElement('li');
      color.dataset.value = values[i];
      fragment.appendChild(color);
    }
    dom.colors.appendChild(fragment);
    dom.level.textContent = level;
    dom.max.textContent = max;
  }

  function update() {
    for (let i = 0; i < cells.length; i++) {
      dom.cells[i].dataset.value = cells[i].value();
    }
    dom.moves.textContent = moves;
  }

  function handleClick(event) {
    if (!event.target.dataset.value) {
      return;
    }
    checkedPositions = [];
    moves += 1;
    infectNeighbors(0, event.target.dataset.value);
    update();
    if (isDone()) {
      setLevel(level + 1);
      start();
    }
  }

  function isDone() {
    for (let i = 0; i < gridSize; i++) {
      if (cells[0].value() !== cells[i].value()) {
        return false;
      }
    }
    return true;
  }

  function infectNeighbors(position, value) {
    value = value * 1;
    cells[position].infect(value);
    let neighbors = cells[position].neighbors;

    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (checkedPositions.indexOf(neighbor.position()) < 0) {
        if (neighbor.value() === value || neighbor.isInfected()) {
          neighbor.infect(value);
          checkedPositions.push(neighbor.position());
          infectNeighbors(neighbor.position(), value);
        }
      }
    }
  }

  function getNeighbors(cell) {
    let pos = cell.position();
    let neighbors = [];

    // top
    if (pos >= Math.sqrt(gridSize)) {
      neighbors.push(cells[pos - Math.sqrt(gridSize)]);
    }

    // right
    if(pos % Math.sqrt(gridSize) !== Math.sqrt(gridSize) - 1) {
      neighbors.push(cells[pos + 1]);
    }

    // bottom
    if (pos < gridSize - Math.sqrt(gridSize)) {
      neighbors.push(cells[pos + Math.sqrt(gridSize)]);
    }

    // left
    if (pos % Math.sqrt(gridSize) > 0) {
      neighbors.push(cells[pos - 1]);
    }

    cell.neighbors = neighbors;
  }

  function updateNeighbors() {
    for (let i = 0; i < cells.length; i++) {
      cells[i].setNeighbors(getNeighbors(cells[i]));
    }
  }

  function wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return {
    init: init
  }
}

function Cell(v, pos) {

  let color; // ?
  let infected = false;
  let position = pos;
  let value = v;
  let neighbors = [];

  function render() {
    let div = document.createElement('div');
    div.dataset.position = position;
    div.dataset.value = value;
    div.id = '_' + position;
    return div;
  }

  function setNeighbors(n) {
    neighbors = n;
  }

  function infect(newValue) {
    value = newValue;
    infected = true;
  }

  return {
    position: _ => position,
    value: _ => value,
    setNeighbors,
    neighbors,
    infect,
    isInfected: _ => infected,
    render
  }
}

document.addEventListener("DOMContentLoaded", function(e) {
  const game = Game();
  game.init();
});
