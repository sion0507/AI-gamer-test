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

const COMMANDER_TARGETS = {
  center: { x: 480, y: 270 },
  leftScout: { x: 160, y: 270 },
  retreat: { x: 110, y: 270 },
  defend: { x: 180, y: 220 }
};

const FORMATION_SPACING = 34;

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

export function parseCommanderTextCommand(gameState, text) {
  const normalizedText = normalizeCommanderText(text);
  if (!normalizedText) {
    return {
      command: null,
      message: 'Enter a simple commander instruction first.'
    };
  }

  const unitIds = getCommanderUnitIds(gameState);
  if (unitIds.length === 0) {
    return {
      command: null,
      message: 'No active allied units are available for commander orders.'
    };
  }

  if (matchesAny(normalizedText, ['center attack', 'central attack', 'attack center', 'attack central', '중앙 공격', '중앙공격'])) {
    return createParsedCommandResult(
      COMMAND_TYPES.ATTACK_MOVE,
      unitIds,
      COMMANDER_TARGETS.center,
      'Attack-moving allied units toward the center.'
    );
  }

  if (matchesAny(normalizedText, ['left scout', 'scout left', '왼쪽 정찰', '좌측 정찰', '왼쪽정찰', '좌측정찰'])) {
    return createParsedCommandResult(
      COMMAND_TYPES.SCOUT,
      unitIds,
      COMMANDER_TARGETS.leftScout,
      'Scouting the left side with allied units.'
    );
  }

  if (matchesAny(normalizedText, ['retreat', 'fall back', 'fallback', '후퇴'])) {
    return createParsedCommandResult(
      COMMAND_TYPES.RETREAT,
      unitIds,
      COMMANDER_TARGETS.retreat,
      'Retreating allied units toward the starting area.'
    );
  }

  if (matchesAny(normalizedText, ['defend', 'defense', 'hold base', '방어'])) {
    return createParsedCommandResult(
      COMMAND_TYPES.DEFEND,
      unitIds,
      COMMANDER_TARGETS.defend,
      'Defending near the allied base area.'
    );
  }

  return {
    command: null,
    message: 'Command not recognized. Try: center attack, left scout, retreat, defend, 중앙 공격, 왼쪽 정찰, 후퇴, or 방어.'
  };
}

function normalizeCommanderText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function matchesAny(normalizedText, phrases) {
  return phrases.some((phrase) => normalizedText.includes(phrase));
}

function getCommanderUnitIds(gameState) {
  const selectedUnitIds = gameState.units
    .filter((unit) => unit.isActive && unit.team === 'ally' && unit.isSelected)
    .map((unit) => unit.id);

  if (selectedUnitIds.length > 0) {
    return selectedUnitIds;
  }

  return gameState.units
    .filter((unit) => unit.isActive && unit.team === 'ally')
    .map((unit) => unit.id);
}

function createParsedCommandResult(type, unitIds, target, message) {
  return {
    command: createCommand(type, unitIds, target, {
      source: 'ruleBasedCommander',
      formationOffsets: createFormationOffsets(unitIds.length)
    }),
    message
  };
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
