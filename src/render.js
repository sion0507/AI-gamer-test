function drawBattlefield(ctx, canvas) {
  ctx.fillStyle = '#354f2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawCombatLinks(ctx, gameState) {
  const visibleActiveUnits = gameState.units.filter((unit) => unit.isActive && unit.isVisible);
  const visibleUnitsById = new Map(visibleActiveUnits.map((unit) => [unit.id, unit]));
  const drawnLinks = new Set();

  visibleActiveUnits.forEach((unit) => {
    if (!unit.engagedTargetId) {
      return;
    }

    const target = visibleUnitsById.get(unit.engagedTargetId);
    if (!target) {
      return;
    }

    const linkKey = [unit.id, target.id].sort().join(':');
    if (drawnLinks.has(linkKey)) {
      return;
    }

    drawnLinks.add(linkKey);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 45, 45, 0.9)';
    ctx.lineWidth = 3;
    ctx.moveTo(unit.x, unit.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 190, 190, 0.65)';
    ctx.lineWidth = 1;
    ctx.moveTo(unit.x, unit.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  });
}

function drawUnit(ctx, unit) {
  if (unit.isSelected) {
    ctx.beginPath();
    ctx.strokeStyle = '#ffe36e';
    ctx.lineWidth = 3;
    ctx.arc(unit.x, unit.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (unit.targetEnemyId) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 236, 110, 0.45)';
    ctx.lineWidth = 2;
    ctx.arc(unit.x, unit.y, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = unit.team === 'ally' ? '#4aa3ff' : '#ff5d5d';
  ctx.arc(unit.x, unit.y, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#09111b';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawHealthBar(ctx, unit);

  ctx.fillStyle = '#dce8ff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(unit.name, unit.x, unit.y - 28);
}

function drawHealthBar(ctx, unit) {
  const width = 34;
  const height = 5;
  const x = unit.x - width / 2;
  const y = unit.y - 22;
  const healthRatio = Math.max(0, unit.hp / unit.maxHp);

  ctx.fillStyle = '#1b2530';
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = healthRatio > 0.45 ? '#59d36b' : '#ffbd4a';
  if (healthRatio <= 0.2) {
    ctx.fillStyle = '#ff4a4a';
  }
  ctx.fillRect(x, y, width * healthRatio, height);

  ctx.strokeStyle = '#09111b';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function drawStatusOverlay(ctx, gameState) {
  if (gameState.status === 'playing') {
    return;
  }

  const { canvas } = ctx;
  ctx.fillStyle = 'rgba(9, 17, 27, 0.72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = gameState.status === 'won' ? '#7dff9d' : '#ff8585';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(gameState.status === 'won' ? 'VICTORY' : 'DEFEAT', canvas.width / 2, canvas.height / 2 - 12);

  ctx.fillStyle = '#e8f0ff';
  ctx.font = '18px Arial';
  ctx.fillText(gameState.statusMessage, canvas.width / 2, canvas.height / 2 + 24);
}

export function renderGame(ctx, gameState) {
  const { canvas } = ctx;
  drawBattlefield(ctx, canvas);

  drawCombatLinks(ctx, gameState);

  gameState.units.forEach((unit) => {
    if (unit.isActive && unit.isVisible) {
      drawUnit(ctx, unit);
    }
  });

  drawStatusOverlay(ctx, gameState);
}
