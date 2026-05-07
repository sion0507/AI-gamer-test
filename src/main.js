import { createGameState, dispatchCommand, updateGameState } from './game.js';
import { setupInput } from './input.js';
import { renderGame } from './render.js';
import { updateAI } from './ai.js';
import { setupModeControls } from './ui.js';

function bootstrap() {
  const canvas = document.getElementById('battlefield');

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element #battlefield was not found.');
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create 2D canvas context.');
  }

  const gameState = createGameState();
  setupModeControls(gameState);
  setupInput(canvas, gameState, dispatchCommand);

  function gameLoop() {
    updateAI(gameState, dispatchCommand);
    updateGameState(gameState);
    renderGame(ctx, gameState);
    window.requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

bootstrap();
