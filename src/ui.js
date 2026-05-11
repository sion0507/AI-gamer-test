import { parseCommanderTextCommand } from './ai.js';
import { GAME_MODES, setGameMode } from './game.js';

export function setupModeControls(gameState, dispatchCommand) {
  const playerModeButton = document.getElementById('player-mode-button');
  const aiModeButton = document.getElementById('ai-mode-button');
  const aiCommanderPanel = document.getElementById('ai-commander-panel');
  const currentModeLabel = document.getElementById('current-mode-label');
  const commanderForm = document.getElementById('commander-command-form');
  const commanderInput = document.getElementById('commander-command-input');
  const commanderFeedback = document.getElementById('commander-command-feedback');

  if (
    !playerModeButton ||
    !aiModeButton ||
    !aiCommanderPanel ||
    !currentModeLabel ||
    !commanderForm ||
    !(commanderInput instanceof HTMLTextAreaElement) ||
    !commanderFeedback
  ) {
    throw new Error('Mode control UI elements were not found.');
  }

  playerModeButton.addEventListener('click', () => {
    setGameMode(gameState, GAME_MODES.PLAYER_MODE);
    updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel);
  });

  aiModeButton.addEventListener('click', () => {
    setGameMode(gameState, GAME_MODES.AI_COMMAND_MODE);
    updateModeControls(gameState, playerModeButton, aiModeButton, aiCommanderPanel, currentModeLabel);
    commanderInput.focus();
  });

  commanderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (gameState.mode !== GAME_MODES.AI_COMMAND_MODE) {
      commanderFeedback.textContent = 'Switch to AI Commander Mode before issuing text commands.';
      return;
    }

    const result = parseCommanderTextCommand(gameState, commanderInput.value);
    if (!result.command) {
      commanderFeedback.textContent = result.message;
      return;
    }

    const wasDispatched = dispatchCommand(gameState, result.command);
    commanderFeedback.textContent = wasDispatched ? result.message : 'Command could not be issued right now.';

    if (wasDispatched) {
      commanderInput.value = '';
    }
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
