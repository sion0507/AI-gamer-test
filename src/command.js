export const COMMAND_TYPES = {
  MOVE: 'move',
  ATTACK_MOVE: 'attackMove',
  HOLD: 'hold',
  SCOUT: 'scout',
  DEFEND: 'defend',
  RETREAT: 'retreat'
};

export function createCommand(type, unitIds, target = null, metadata = {}) {
  return {
    type,
    unitIds,
    target,
    metadata
  };
}

export function isValidCommand(command) {
  if (!command || typeof command !== 'object') {
    return false;
  }

  const validTypes = Object.values(COMMAND_TYPES);
  if (!validTypes.includes(command.type)) {
    return false;
  }

  return Array.isArray(command.unitIds);
}
