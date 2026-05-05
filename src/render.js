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

function drawUnit(ctx, unit) {
  if (unit.isSelected) {
    ctx.beginPath();
    ctx.strokeStyle = '#ffe36e';
    ctx.lineWidth = 3;
    ctx.arc(unit.x, unit.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.fillStyle = unit.team === 'ally' ? '#4aa3ff' : '#ff5d5d';
  ctx.arc(unit.x, unit.y, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#09111b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#dce8ff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(unit.name, unit.x, unit.y - 20);
}

export function renderGame(ctx, gameState) {
  const { canvas } = ctx;
  drawBattlefield(ctx, canvas);

  gameState.units.forEach((unit) => {
    if (unit.isVisible) {
      drawUnit(ctx, unit);
    }
  });
}
