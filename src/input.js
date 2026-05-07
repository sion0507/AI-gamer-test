import { COMMAND_TYPES, createCommand } from './command.js';

const UNIT_SELECTION_RADIUS = 14;
const DRAG_SELECTION_THRESHOLD = 6;
const FORMATION_SPACING = 34;

export function setupInput(canvas, gameState, dispatchCommand) {
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  canvas.addEventListener('mousedown', (event) => {
    if (gameState.status !== 'playing') {
      return;
    }

    if (event.button === 0) {
      startLeftMouseInput(canvas, gameState, event);
      return;
    }

    if (event.button === 2) {
      const targetPosition = getCanvasCoordinates(canvas, event);
      issueCommandToSelectedUnits(gameState, dispatchCommand, COMMAND_TYPES.ATTACK_MOVE, targetPosition);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    updateDragSelection(canvas, gameState, event);
  });

  canvas.addEventListener('mouseup', (event) => {
    if (event.button !== 0 || !gameState.selectionDrag?.isActive) {
      return;
    }

    finishLeftMouseInput(canvas, gameState, dispatchCommand, event);
  });

  canvas.addEventListener('mouseleave', () => {
    clearSelectionDrag(gameState);
  });
}

function startLeftMouseInput(canvas, gameState, event) {
  const startPosition = getCanvasCoordinates(canvas, event);
  gameState.selectionDrag = {
    isActive: true,
    isDragging: false,
    start: startPosition,
    current: startPosition
  };
}

function updateDragSelection(canvas, gameState, event) {
  const selectionDrag = gameState.selectionDrag;
  if (!selectionDrag?.isActive) {
    return;
  }

  const currentPosition = getCanvasCoordinates(canvas, event);
  selectionDrag.current = currentPosition;

  const dragDistance = Math.hypot(
    currentPosition.x - selectionDrag.start.x,
    currentPosition.y - selectionDrag.start.y
  );

  if (dragDistance >= DRAG_SELECTION_THRESHOLD) {
    selectionDrag.isDragging = true;
  }
}

function finishLeftMouseInput(canvas, gameState, dispatchCommand, event) {
  const selectionDrag = gameState.selectionDrag;
  const endPosition = getCanvasCoordinates(canvas, event);
  selectionDrag.current = endPosition;

  if (selectionDrag.isDragging) {
    selectUnitsInDragBox(gameState, getDragBox(selectionDrag));
    clearSelectionDrag(gameState);
    return;
  }

  clearSelectionDrag(gameState);
  handleClickInput(gameState, dispatchCommand, endPosition);
}

function handleClickInput(gameState, dispatchCommand, clickPosition) {
  const clickedAlliedUnit = findClickedAlliedUnit(gameState, clickPosition);

  if (clickedAlliedUnit) {
    setSelectedUnits(gameState, [clickedAlliedUnit.id]);
    return;
  }

  const clickedEnemyUnit = findClickedVisibleEnemyUnit(gameState, clickPosition);
  const selectedUnitIds = getSelectedAlliedUnitIds(gameState);
  if (selectedUnitIds.length === 0) {
    return;
  }

  if (clickedEnemyUnit) {
    issueCommandToSelectedUnits(gameState, dispatchCommand, COMMAND_TYPES.ATTACK_MOVE, clickPosition, {
      targetEnemyId: clickedEnemyUnit.id
    });
    return;
  }

  issueCommandToSelectedUnits(gameState, dispatchCommand, COMMAND_TYPES.MOVE, clickPosition);
}

function issueCommandToSelectedUnits(gameState, dispatchCommand, commandType, targetPosition, metadata = {}) {
  const selectedUnitIds = getSelectedAlliedUnitIds(gameState);
  if (selectedUnitIds.length === 0) {
    return;
  }

  const formationOffsets = createFormationOffsets(selectedUnitIds.length);
  const command = createCommand(commandType, selectedUnitIds, targetPosition, {
    ...metadata,
    formationOffsets
  });

  dispatchCommand(gameState, command);
}

function createFormationOffsets(unitCount) {
  if (unitCount <= 1) {
    return [{ x: 0, y: 0 }];
  }

  const columns = Math.ceil(Math.sqrt(unitCount));
  const rows = Math.ceil(unitCount / columns);
  const offsets = [];

  for (let index = 0; index < unitCount; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    offsets.push({
      x: (col - (columns - 1) / 2) * FORMATION_SPACING,
      y: (row - (rows - 1) / 2) * FORMATION_SPACING
    });
  }

  return offsets;
}

function getCanvasCoordinates(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function findClickedAlliedUnit(gameState, clickPosition) {
  return gameState.units.find((unit) => {
    if (!unit.isActive || unit.team !== 'ally') {
      return false;
    }

    const distance = Math.hypot(unit.x - clickPosition.x, unit.y - clickPosition.y);
    return distance <= UNIT_SELECTION_RADIUS;
  });
}

function findClickedVisibleEnemyUnit(gameState, clickPosition) {
  return gameState.units.find((unit) => {
    if (!unit.isActive || unit.team !== 'enemy' || !unit.isVisible) {
      return false;
    }

    const distance = Math.hypot(unit.x - clickPosition.x, unit.y - clickPosition.y);
    return distance <= UNIT_SELECTION_RADIUS;
  });
}

function selectUnitsInDragBox(gameState, dragBox) {
  const selectedUnitIds = gameState.units
    .filter((unit) => {
      return unit.isActive && unit.team === 'ally' && isUnitInsideDragBox(unit, dragBox);
    })
    .map((unit) => unit.id);

  setSelectedUnits(gameState, selectedUnitIds);
}

function isUnitInsideDragBox(unit, dragBox) {
  return unit.x >= dragBox.x &&
    unit.x <= dragBox.x + dragBox.width &&
    unit.y >= dragBox.y &&
    unit.y <= dragBox.y + dragBox.height;
}

function getDragBox(selectionDrag) {
  const x = Math.min(selectionDrag.start.x, selectionDrag.current.x);
  const y = Math.min(selectionDrag.start.y, selectionDrag.current.y);
  const width = Math.abs(selectionDrag.current.x - selectionDrag.start.x);
  const height = Math.abs(selectionDrag.current.y - selectionDrag.start.y);

  return { x, y, width, height };
}

function setSelectedUnits(gameState, unitIds) {
  const selectedUnitIds = new Set(unitIds);
  gameState.units.forEach((unit) => {
    unit.isSelected = unit.team === 'ally' && selectedUnitIds.has(unit.id);
  });
}

function getSelectedAlliedUnitIds(gameState) {
  return gameState.units
    .filter((unit) => unit.isActive && unit.isSelected && unit.team === 'ally')
    .map((unit) => unit.id);
}

function clearSelectionDrag(gameState) {
  gameState.selectionDrag = null;
}
