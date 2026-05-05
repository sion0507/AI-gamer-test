import { createUnit } from './unit.js';
import { isValidCommand } from './command.js';

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
    commandQueue: []
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
    gameState.commandQueue.shift();
  }
}
