import { createUnit } from './unit.js';
import { isValidCommand } from './command.js';

const UPDATE_INTERVALS = {
  movement: 100
};

const MODE = {
  PLAYER_MODE: 'PLAYER_MODE',
  AI_COMMAND_MODE: 'AI_COMMAND_MODE'
};

function spawnTeam(team, count, startX, startY, spacingX, spacingY) {
  const units = [];

  for (let i = 0; i < count; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    units.push(
      createUnit({
        id: `${team}${i + 1}`,
        team,
        name: `${team === 'ally' ? 'Ally' : 'Enemy'} ${i + 1}`,
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        isVisible: true
      })
    );
  }

  return units;
}

export function createGameState() {
  const alliedUnits = spawnTeam('ally', 5, 120, 140, 70, 80);
  const enemyUnits = spawnTeam('enemy', 5, 700, 140, 70, 80);

  return {
    mode: MODE.PLAYER_MODE,
    units: [...alliedUnits, ...enemyUnits],
    commandQueue: [],
    movementAccumulatorMs: 0
  };
}

export function dispatchCommand(gameState, command) {
  if (!isValidCommand(command)) {
    return false;
  }

  gameState.commandQueue.push(command);
  return true;
}

export function updateGameState(gameState) {
  while (gameState.commandQueue.length > 0) {
    const command = gameState.commandQueue.shift();
    applyCommand(gameState, command);
  }

  gameState.movementAccumulatorMs += 16.67;
  while (gameState.movementAccumulatorMs >= UPDATE_INTERVALS.movement) {
    updateUnitMovement(gameState, UPDATE_INTERVALS.movement / 1000);
    gameState.movementAccumulatorMs -= UPDATE_INTERVALS.movement;
  }
}

function applyCommand(gameState, command) {
  if (command.type !== 'move' || !command.target) {
    return;
  }

  command.unitIds.forEach((unitId) => {
    const unit = gameState.units.find((candidate) => candidate.id === unitId);
    if (!unit || unit.team !== 'ally') {
      return;
    }

    unit.currentCommand = {
      type: command.type,
      target: { x: command.target.x, y: command.target.y }
    };
  });
}

function updateUnitMovement(gameState, deltaSeconds) {
  gameState.units.forEach((unit) => {
    if (!unit.currentCommand || unit.currentCommand.type !== 'move') {
      return;
    }

    const { target } = unit.currentCommand;
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const distanceToTarget = Math.hypot(dx, dy);

    if (distanceToTarget < 1) {
      unit.x = target.x;
      unit.y = target.y;
      unit.currentCommand = null;
      return;
    }

    const moveDistance = unit.moveSpeed * deltaSeconds;
    if (moveDistance >= distanceToTarget) {
      unit.x = target.x;
      unit.y = target.y;
      unit.currentCommand = null;
      return;
    }

    unit.x += (dx / distanceToTarget) * moveDistance;
    unit.y += (dy / distanceToTarget) * moveDistance;
  });
}
