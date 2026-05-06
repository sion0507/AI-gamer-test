import { COMMAND_TYPES, createCommand } from './command.js';
import { UPDATE_INTERVALS } from './game.js';
import { getDistance } from './unit.js';

const PATROL_RADIUS = 44;
const PATROL_OFFSETS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

let unitAIAccumulatorMs = 0;

export function updateAI(gameState, dispatchCommand) {
  if (gameState.status !== 'playing') {
    return;
  }

  unitAIAccumulatorMs += 16.67;
  if (unitAIAccumulatorMs < UPDATE_INTERVALS.unitAI) {
    return;
  }

  unitAIAccumulatorMs -= UPDATE_INTERVALS.unitAI;
  updateEnemyAI(gameState, dispatchCommand);
}

function updateEnemyAI(gameState, dispatchCommand) {
  const enemyUnits = gameState.units.filter((unit) => unit.isActive && unit.team === 'enemy');
  const alliedUnits = gameState.units.filter((unit) => unit.isActive && unit.team === 'ally');

  enemyUnits.forEach((enemyUnit) => {
    const detectedAlly = findNearestDetectedAlly(enemyUnit, alliedUnits);

    if (detectedAlly) {
      const attackMoveCommand = createCommand(
        COMMAND_TYPES.ATTACK_MOVE,
        [enemyUnit.id],
        { x: detectedAlly.x, y: detectedAlly.y },
        { targetEnemyId: detectedAlly.id, source: 'enemyAI' }
      );
      dispatchCommand(gameState, attackMoveCommand);
      return;
    }

    if (!enemyUnit.currentCommand) {
      dispatchCommand(gameState, createPatrolCommand(enemyUnit));
    }
  });
}

function findNearestDetectedAlly(enemyUnit, alliedUnits) {
  const detectedAllies = alliedUnits.filter((allyUnit) => getDistance(enemyUnit, allyUnit) <= enemyUnit.visionRange);

  if (detectedAllies.length === 0) {
    return null;
  }

  detectedAllies.sort((a, b) => getDistance(enemyUnit, a) - getDistance(enemyUnit, b));
  return detectedAllies[0];
}

function createPatrolCommand(enemyUnit) {
  const patrolOffset = PATROL_OFFSETS[enemyUnit.patrolIndex % PATROL_OFFSETS.length];
  enemyUnit.patrolIndex += 1;

  return createCommand(
    COMMAND_TYPES.MOVE,
    [enemyUnit.id],
    {
      x: enemyUnit.homeX + patrolOffset.x * PATROL_RADIUS,
      y: enemyUnit.homeY + patrolOffset.y * PATROL_RADIUS
    },
    { source: 'enemyAI', behavior: 'patrol' }
  );
}
