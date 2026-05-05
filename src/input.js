import { COMMAND_TYPES, createCommand } from './command.js';

const UNIT_SELECTION_RADIUS = 14;

export function setupInput(canvas, gameState, dispatchCommand) {
  canvas.addEventListener('click', (event) => {
    const clickPosition = getCanvasCoordinates(canvas, event);
    const clickedAlliedUnit = findClickedAlliedUnit(gameState, clickPosition);

    if (clickedAlliedUnit) {
      setSelectedUnit(gameState, clickedAlliedUnit.id);
      return;
    }

    const selectedUnit = gameState.units.find((unit) => unit.isSelected && unit.team === 'ally');
    if (!selectedUnit) {
      return;
    }

    const moveCommand = createCommand(COMMAND_TYPES.MOVE, [selectedUnit.id], clickPosition);
    dispatchCommand(gameState, moveCommand);
  });
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
    if (unit.team !== 'ally') {
      return false;
    }

    const distance = Math.hypot(unit.x - clickPosition.x, unit.y - clickPosition.y);
    return distance <= UNIT_SELECTION_RADIUS;
  });
}

function setSelectedUnit(gameState, unitId) {
  gameState.units.forEach((unit) => {
    unit.isSelected = unit.id === unitId;
  });
}
