import { GAME_MODES, setGameMode } from './game.js';

export function setupModeControls(gameState) {
  const playerModeButton = document.getElementById('player-mode-button');
  const aiModeButton = document.getElementById('ai-mode-button');
  const aiCommanderPanel = document.getElementById('ai-commander-panel');
  const currentModeLabel = document.getElementById('current-mode-label');

  if (!playerModeButton || !aiModeButton || !aiCommanderPanel || !currentModeLabel) {
    throw new Error('Mode control UI elements were not found.');
  }

  playerModeButton.addEventListener('click', () => {
    setGameMode(gameState, GAME_MODES.PLAYER_MODE);
    updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel);
  });

  aiModeButton.addEventListener('click', () => {
    setGameMode(gameState, GAME_MODES.AI_COMMAND_MODE);
    updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel);
  });

  updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel);
}

function updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel) {
  const isPlayerMode = gameState.mode === GAME_MODES.PLAYER_MODE;

  playerModeButton.classList.toggle('mode-controls__button--active', isPlayerMode);
  playerModeButton.setAttribute('aria-pressed', String(isPlayerMode));

  aiModeButton.classList.toggle('mode-controls__button--active', !isPlayerMode);
  aiModeButton.setAttribute('aria-pressed', String(!isPlayerMode));

  aiCommanderPanel.hidden = isPlayerMode;
  currentModeLabel.textContent = isPlayerMode ? 'Player Control Mode' : 'AI Commander Mode';
}
