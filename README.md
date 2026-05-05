# Simple RTS AI

**Simple RTS AI** is a browser-based 2D tactical RTS prototype.

The game starts as a lightweight StarCraft-like tactical game where the player directly controls allied units with mouse input. The long-term goal is to add an **AI Commander Mode**, where the player gives natural-language goals and AI gamer agents interpret those goals into executable unit commands.

## Core Concept

- 2D top-down tactical battlefield
- 5 allied units vs 5 enemy units
- Allied units are visible from the beginning
- Enemy units are hidden until discovered by allied vision
- Player can select allied units and move them with mouse clicks
- Units automatically attack enemies when detected
- Each unit represents one tactical squad or symbol, not an individual soldier
- Future AI Commander Mode will accept natural-language instructions and convert them into game commands

## Long-Term Goal

The final direction of this project is not just a small RTS game. It is an experimental platform for testing **AI gamer behavior**.

The intended final flow is:

```text
Natural-language player instruction
→ AI command parser
→ structured operation plan
→ Command objects
→ unit-level execution
→ battlefield result
```

Example:

```text
Send one squad to scout the left side. If they find enemies, bring the rest of the squads forward and attack together.
```

This should eventually become structured commands such as:

```json
[
  {
    "type": "scout",
    "unitIds": ["ally1"],
    "targetArea": "left"
  },
  {
    "type": "hold",
    "unitIds": ["ally2", "ally3", "ally4", "ally5"],
    "condition": "until_enemy_spotted"
  },
  {
    "type": "attackMove",
    "unitIds": ["ally2", "ally3", "ally4", "ally5"],
    "target": "spotted_enemy_position"
  }
]
```

## Most Important Architecture Rule

All forms of input must become **Command objects**.

```text
Mouse input
→ Command object
→ game logic executes command
```

Later:

```text
Natural-language input
→ AI-generated Command object
→ game logic executes command
```

The game logic should not care whether a command came from the player, a rule-based parser, or a future LLM-based AI commander.

## Initial Game Features

The first playable version should include:

- HTML5 Canvas rendering
- 5 allied units
- 5 enemy units
- Mouse-based allied unit selection
- Movement commands through mouse input
- Fog-of-war style enemy hiding
- Vision-based enemy discovery
- Automatic combat when enemies are detected
- Health bars
- Win/loss conditions

## Game Modes

The project should be designed around two modes:

### Player Control Mode

The player directly controls allied units with mouse input.

Initial implementation focuses on this mode.

### AI Commander Mode

The player enters a natural-language goal. The AI commander interprets the goal and creates structured commands for allied units.

This mode does not need to be implemented in the first phase, but the architecture must leave room for it.

## Update Timing Policy

The game should separate rendering, simulation, vision, unit AI, and commander AI update frequencies.

The exact timing constants are defined in **AGENTS.md** as the single source of truth. README intentionally does not duplicate those values to avoid inconsistent documentation.

General principle:

- Rendering should remain smooth
- Movement and combat should update frequently enough to feel responsive
- Vision and unit AI can update less frequently
- Commander AI should make strategic decisions on a slower interval, around several seconds, rather than every frame

## Recommended Tech Stack

- HTML5
- CSS
- Vanilla JavaScript
- HTML5 Canvas
- No external libraries for the first prototype

This keeps the project simple, portable, and easy to deploy through GitHub Pages later.

## Recommended Project Structure

```text
simple-rts-ai/
  README.md
  AGENTS.md
  PLANS.md
  index.html
  style.css
  src/
    main.js
    game.js
    unit.js
    command.js
    input.js
    render.js
    ai.js
```

## File Roles

Detailed file role rules are maintained in **AGENTS.md**.

At a high level:

- `game.js` manages game state and the main simulation loop
- `unit.js` defines unit data and unit-level behavior helpers
- `command.js` defines the Command structure and command creation helpers
- `input.js` converts player input into Command objects
- `render.js` draws the current state only
- `ai.js` contains unit AI, enemy AI, future commander AI, and text command parsing logic

## Development Approach

Do not attempt to implement the full final game at once.

Recommended order:

1. Basic canvas and unit display
2. Mouse selection and movement
3. Vision and enemy hiding
4. Automatic combat and basic enemy AI
5. Multi-unit selection and group commands
6. Player mode / AI commander mode UI
7. Simple text command parser
8. AI commander behavior
9. LLM-based natural-language command interpretation

See **PLANS.md** for detailed phase-by-phase development instructions and Codex prompt examples.

## Running Locally

For the initial static version, open `index.html` directly in a browser.

If browser security restrictions appear later, use a simple local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes for Future AI Integration

The future LLM-based natural-language command system should not expose API keys in frontend code.

Recommended final architecture:

```text
Browser game
→ backend API
→ LLM provider
→ structured JSON command response
→ game executes Command objects
```

Do not place OpenAI, Claude, or other provider API keys directly in browser JavaScript.
