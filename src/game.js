import { createUnit, getDistance } from './unit.js';
import { COMMAND_TYPES, isValidCommand } from './command.js';

export const UPDATE_INTERVALS = {
  movement: 100,
  combat: 250,
  vision: 500,
  unitAI: 1000,
  commanderAI: 10000
};

export const GAME_MODES = {
  PLAYER_MODE: 'PLAYER_MODE',
  AI_COMMAND_MODE: 'AI_COMMAND_MODE'
};

const GAME_STATUS = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

function spawnTeam(team, count, startX, startY, spacingX, spacingY) {
  const units = [];

  for (let i = 0; i < count; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;

    units.push(
      createUnit({
        id: `${team}${i + 1}`,
        team,
        name: `${team === 'ally' ? 'Ally' : 'Enemy'} ${i + 1}`,
        x,
        y,
        isVisible: team === 'ally'
      })
    );
  }

  return units;
}

export function createGameState() {
  const alliedUnits = spawnTeam('ally', 5, 120, 140, 70, 80);
  const enemyUnits = spawnTeam('enemy', 5, 700, 140, 70, 80);

  return {
    mode: GAME_MODES.PLAYER_MODE,
    status: GAME_STATUS.PLAYING,
    statusMessage: '',
    units: [...alliedUnits, ...enemyUnits],
    commandQueue: [],
    selectionDrag: null,
    movementAccumulatorMs: 0,
    combatAccumulatorMs: 0,
    visionAccumulatorMs: 0
  };
}

export function setGameMode(gameState, mode) {
  if (!Object.values(GAME_MODES).includes(mode)) {
    return false;
  }

  gameState.mode = mode;
  gameState.selectionDrag = null;
  return true;
}

export function dispatchCommand(gameState, command) {
  if (!isValidCommand(command) || gameState.status !== GAME_STATUS.PLAYING) {
    return false;
  }

  gameState.commandQueue.push(command);
  return true;
}

export function updateGameState(gameState) {
  if (gameState.status !== GAME_STATUS.PLAYING) {
    return;
  }

  while (gameState.commandQueue.length > 0) {
    const command = gameState.commandQueue.shift();
    applyCommand(gameState, command);
  }

  gameState.movementAccumulatorMs += 16.67;
  gameState.combatAccumulatorMs += 16.67;
  gameState.visionAccumulatorMs += 16.67;

  while (gameState.movementAccumulatorMs >= UPDATE_INTERVALS.movement) {
    updateUnitMovement(gameState, UPDATE_INTERVALS.movement / 1000);
    gameState.movementAccumulatorMs -= UPDATE_INTERVALS.movement;
  }

  while (gameState.combatAccumulatorMs >= UPDATE_INTERVALS.combat) {
    updateCombat(gameState);
    gameState.combatAccumulatorMs -= UPDATE_INTERVALS.combat;
  }

  while (gameState.visionAccumulatorMs >= UPDATE_INTERVALS.vision) {
    updateVision(gameState);
    gameState.visionAccumulatorMs -= UPDATE_INTERVALS.vision;
  }

  removeInactiveUnits(gameState);
  updateWinLossState(gameState);
}

function applyCommand(gameState, command) {
  const movementCommandTypes = [
    COMMAND_TYPES.MOVE,
    COMMAND_TYPES.ATTACK_MOVE,
    COMMAND_TYPES.SCOUT,
    COMMAND_TYPES.DEFEND,
    COMMAND_TYPES.RETREAT
  ];

  if (!movementCommandTypes.includes(command.type) || !command.target) {
    return;
  }

  command.unitIds.forEach((unitId, index) => {
    const unit = findActiveUnitById(gameState, unitId);
    if (!unit) {
      return;
    }

    const formationOffset = command.metadata?.formationOffsets?.[index] ?? { x: 0, y: 0 };
    const target = applyFormationOffset(command.target, formationOffset);

    unit.currentCommand = {
      type: command.type,
      target,
      formationOffset,
      targetEnemyId: command.metadata?.targetEnemyId ?? null
    };
  });
}

function applyFormationOffset(target, offset) {
  return {
    x: target.x + offset.x,
    y: target.y + offset.y
  };
}

function updateVision(gameState) {
  const alliedUnits = getActiveUnits(gameState, 'ally');
  const enemyUnits = getActiveUnits(gameState, 'enemy');

  enemyUnits.forEach((enemyUnit) => {
    const isDetected = alliedUnits.some((allyUnit) => {
      return getDistance(allyUnit, enemyUnit) <= allyUnit.visionRange;
    });

    enemyUnit.isVisible = isDetected;
    if (isDetected) {
      enemyUnit.lastKnownPosition = { x: enemyUnit.x, y: enemyUnit.y };
    }
  });
}

function updateUnitMovement(gameState, deltaSeconds) {
  getActiveUnits(gameState).forEach((unit) => {
    if (!unit.currentCommand || !isMovementCommandType(unit.currentCommand.type)) {
      return;
    }

    if ([COMMAND_TYPES.ATTACK_MOVE, COMMAND_TYPES.SCOUT].includes(unit.currentCommand.type)) {
      const targetEnemy = getCommandTargetEnemy(gameState, unit);
      if (targetEnemy) {
        if (getDistance(unit, targetEnemy) <= unit.attackRange) {
          return;
        }

        unit.currentCommand.target = applyFormationOffset(
          targetEnemy,
          unit.currentCommand.formationOffset ?? { x: 0, y: 0 }
        );
      }
    }

    moveUnitTowardCurrentCommand(unit, deltaSeconds);
  });
}

function isMovementCommandType(commandType) {
  return [
    COMMAND_TYPES.MOVE,
    COMMAND_TYPES.ATTACK_MOVE,
    COMMAND_TYPES.SCOUT,
    COMMAND_TYPES.DEFEND,
    COMMAND_TYPES.RETREAT
  ].includes(commandType);
}

function moveUnitTowardCurrentCommand(unit, deltaSeconds) {
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
}

function updateCombat(gameState) {
  getActiveUnits(gameState).forEach((unit) => {
    if (!unit.isActive) {
      return;
    }

    const target = chooseTargetForUnit(gameState, unit);
    unit.targetEnemyId = target?.id ?? null;

    if (!target || getDistance(unit, target) > unit.attackRange) {
      unit.engagedTargetId = null;
      return;
    }

    unit.engagedTargetId = target.id;
    target.hp = Math.max(0, target.hp - unit.attackDamage);
    if (target.hp <= 0) {
      target.isActive = false;
      target.isSelected = false;
      target.currentCommand = null;
      target.targetEnemyId = null;
      target.engagedTargetId = null;
    }
  });
}

function chooseTargetForUnit(gameState, unit) {
  const opposingTeam = unit.team === 'ally' ? 'enemy' : 'ally';
  const candidates = getActiveUnits(gameState, opposingTeam).filter((candidate) => isValidCombatTarget(unit, candidate));

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => getDistance(unit, a) - getDistance(unit, b));
  return candidates[0];
}

function isValidCombatTarget(unit, target) {
  const distance = getDistance(unit, target);
  if (distance <= unit.attackRange) {
    return true;
  }

  if (unit.team === 'ally') {
    return target.isVisible && distance <= unit.visionRange;
  }

  return distance <= unit.visionRange;
}

function getCommandTargetEnemy(gameState, unit) {
  const commandedTargetId = unit.currentCommand.targetEnemyId;
  if (commandedTargetId) {
    const target = findActiveUnitById(gameState, commandedTargetId);
    if (target && target.team !== unit.team) {
      return target;
    }
  }

  return chooseTargetForUnit(gameState, unit);
}

function removeInactiveUnits(gameState) {
  gameState.units = gameState.units.filter((unit) => unit.isActive);
}

function updateWinLossState(gameState) {
  const alliesAlive = getActiveUnits(gameState, 'ally').length > 0;
  const enemiesAlive = getActiveUnits(gameState, 'enemy').length > 0;

  if (!enemiesAlive) {
    gameState.status = GAME_STATUS.WON;
    gameState.statusMessage = 'Victory! All enemy units have been eliminated.';
    return;
  }

  if (!alliesAlive) {
    gameState.status = GAME_STATUS.LOST;
    gameState.statusMessage = 'Defeat. All allied units have been eliminated.';
  }
}

function getActiveUnits(gameState, team = null) {
  return gameState.units.filter((unit) => unit.isActive && (!team || unit.team === team));
}

function findActiveUnitById(gameState, unitId) {
  return gameState.units.find((unit) => unit.id === unitId && unit.isActive);
}
