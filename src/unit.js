const DEFAULT_STATS = {
  hp: 100,
  maxHp: 100,
  attackDamage: 10,
  attackRange: 70,
  visionRange: 160,
  moveSpeed: 60
};

export function createUnit({ id, team, name, x, y, isVisible = true }) {
  return {
    id,
    team,
    name,
    x,
    y,
    homeX: x,
    homeY: y,
    hp: DEFAULT_STATS.hp,
    maxHp: DEFAULT_STATS.maxHp,
    attackDamage: DEFAULT_STATS.attackDamage,
    attackRange: DEFAULT_STATS.attackRange,
    visionRange: DEFAULT_STATS.visionRange,
    moveSpeed: DEFAULT_STATS.moveSpeed,
    currentCommand: null,
    targetEnemyId: null,
    engagedTargetId: null,
    isSelected: false,
    isVisible,
    isActive: true,
    patrolIndex: 0,
    lastKnownPosition: { x, y }
  };
}

export function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
