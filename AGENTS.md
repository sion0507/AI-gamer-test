# AGENTS.md

This file defines the implementation rules for coding agents working on **Simple RTS AI**.

Read this file before modifying the project.

## Project Summary

Simple RTS AI is a browser-based 2D tactical RTS prototype.

The initial game has:

- 5 allied units
- 5 enemy units
- Mouse-based allied control
- Hidden enemies until discovered by allied vision
- Automatic combat after detection
- Basic enemy AI

The long-term goal is an **AI Commander Mode**, where the player gives natural-language instructions and the AI converts them into executable game commands.

## Non-Negotiable Architecture Rule

All player input and all future AI-generated actions must be represented as **Command objects**.

Do not hard-code mouse behavior directly into unit behavior.

Correct flow:

```text
Mouse input
→ Command object
→ command execution system
→ unit state changes
```

Future flow:

```text
Natural-language input
→ AI parser / commander
→ Command object or command list
→ command execution system
→ unit state changes
```

The game logic must not care whether a command came from mouse input, a rule-based text parser, or a future LLM-based commander.

## Current Technical Stack

Use:

- HTML5
- CSS
- Vanilla JavaScript
- HTML5 Canvas

Do not add external libraries unless explicitly requested.

## Target File Structure

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

## File Responsibilities

### `index.html`

Responsible for:

- Canvas element
- Basic UI containers
- Script loading

Should not contain game logic.

### `style.css`

Responsible for:

- Layout
- Canvas styling
- UI styling

Should not contain game state assumptions beyond class names and element IDs.

### `src/main.js`

Responsible for:

- Bootstrapping the game
- Creating the canvas context
- Initializing game systems
- Starting the main loop

Should remain small.

### `src/game.js`

Responsible for:

- Central game state
- Main update loop
- System scheduling
- Win/loss checks
- Command dispatching

Should not contain rendering implementation details.

### `src/unit.js`

Responsible for:

- Unit class or factory
- Unit default stats
- Unit-related helper functions
- Distance checks and basic unit utilities

Should not directly read mouse events.

### `src/command.js`

Responsible for:

- Command object definitions
- Command factory helpers
- Command validation
- Supported command types

All player and AI actions should pass through this structure.

### `src/input.js`

Responsible for:

- Mouse events
- Selection logic
- Translating input into Command objects
- Player control mode input behavior

Should not directly mutate unit movement except through Command creation and dispatch.

### `src/render.js`

Responsible for:

- Drawing the map
- Drawing units
- Drawing selection indicators
- Drawing health bars
- Drawing vision/debug overlays
- Drawing UI state if needed

Must be read-only with respect to game state.

### `src/ai.js`

Responsible for:

- Basic unit AI
- Basic enemy AI
- Future commander AI
- Rule-based text command parser
- Future natural-language command integration boundary

Should create or request Command objects rather than directly teleporting or mutating units.

## Command Types

Supported command types should include, at minimum:

```text
move
attackMove
hold
scout
defend
retreat
```

Initial implementation may only support:

```text
move
attackMove
```

But the structure should allow the others to be added later.

Example Command:

```json
{
  "type": "move",
  "unitIds": ["ally1", "ally2"],
  "target": { "x": 400, "y": 300 }
}
```

## Game Modes

The project should support this mode structure:

```text
PLAYER_MODE
AI_COMMAND_MODE
```

Initial phases can implement only `PLAYER_MODE`, but the code should avoid assumptions that make `AI_COMMAND_MODE` difficult to add later.

## Update Timing Policy

This section is the single source of truth for update timing constants.

Use separated update intervals instead of updating every system every frame.

Recommended constants:

```js
const UPDATE_INTERVALS = {
  movement: 100,       // 0.1 seconds
  combat: 250,         // 0.25 seconds
  vision: 500,         // 0.5 seconds
  unitAI: 1000,        // 1 second
  commanderAI: 10000   // 10 seconds
};
```

Rules:

- Rendering may run with `requestAnimationFrame`.
- Movement should update frequently enough to feel responsive.
- Combat should update frequently enough for readable feedback.
- Vision does not need to update every frame.
- Unit AI should not make expensive decisions every frame.
- Commander AI should make strategic decisions slowly, approximately every 10 seconds.
- If these values need to change, update them here first and then update code accordingly.

## Basic Enemy AI Requirement

Enemy units should not remain completely passive.

From the automatic combat phase onward, enemy units should have simple behavior such as:

- Patrol around their initial area
- Detect allied units in vision range
- Move toward detected allied units
- Attack if in range
- Optionally retreat slightly when low on health

Keep enemy AI simple. It exists to create a useful test environment for the future AI commander.

## Natural-Language AI Commander Direction

The future AI commander should follow this architecture:

```text
Natural-language instruction
→ parser / LLM integration
→ structured operation JSON
→ CommanderAI
→ Command objects
→ game execution
```

The natural-language system should not directly modify units.

Example future parser output:

```json
{
  "intent": "scout_then_attack",
  "priority": "minimize_losses",
  "commands": [
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
}
```

## Do Not

These restrictions are important.

### Architecture Restrictions

- Do not bypass the Command system for player control.
- Do not bypass the Command system for AI control.
- Do not make mouse input directly change unit positions.
- Do not make natural-language parsing directly change unit positions.
- Do not hard-code one-off behavior that prevents future AI Commander Mode.
- Do not implement future phases while working on the current requested phase.

### File Boundary Restrictions

- Do not put rendering code inside `game.js`.
- Do not put rendering code inside `unit.js`.
- Do not mutate unit state inside `render.js`.
- Do not handle mouse events inside `unit.js`.
- Do not handle mouse events inside `render.js`.
- Do not place command parsing logic inside `render.js`.
- Do not place AI decision logic inside `input.js`.
- Do not place UI styling inside JavaScript unless it is unavoidable.
- Do not let `ai.js` directly teleport, damage, or remove units. It should create or dispatch commands whenever possible.

### Dependency and Security Restrictions

- Do not add external libraries unless explicitly requested.
- Do not add a framework such as React, Vue, Phaser, or Pixi unless explicitly requested.
- Do not store API keys in frontend code.
- Do not call OpenAI, Claude, or any LLM provider directly from browser JavaScript with a secret key.
- Do not add backend code unless the current phase explicitly requests it.

### Scope Restrictions

- Do not implement resource gathering.
- Do not implement buildings.
- Do not implement unit production.
- Do not implement upgrades.
- Do not implement complex pathfinding unless explicitly requested.
- Do not add image assets in early phases; use simple shapes first.

## Implementation Style

Prefer:

- Small functions
- Clear naming
- Modular files
- Simple data structures
- Readable code over clever code
- Constants for tunable values
- Comments only where they clarify architecture or non-obvious decisions

Avoid:

- Over-engineering
- Large monolithic files
- Deep inheritance trees
- Premature optimization
- Complex AI before the basic game loop is stable


## Manual Documentation Policy

Every phase implementation that changes user-facing behavior must update `MANUAL.md` in the same phase PR.

When updating `MANUAL.md`:

- Add a section for the newly implemented phase.
- Describe the implemented features in user-facing language.
- Document any new controls, UI panels, mode switches, or gameplay rules.
- Update the current implementation / out-of-scope lists so they do not contradict the new phase.
- Keep the manual practical for a player who wants to run and test the game.

## Suggested Completion Criteria Per Phase

Before considering a phase complete:

- The game opens in a browser
- No console errors appear during normal play
- The requested phase behavior works visibly
- The Command architecture is preserved
- File responsibilities remain separated
- Existing features from previous phases still work

## Manual Test Checklist

At minimum, test:

- Page loads successfully
- Canvas displays correctly
- Allied units appear
- Enemy units appear or hide according to the current phase
- Clicking/selecting works when implemented
- Movement works when implemented
- Vision works when implemented
- Combat works when implemented
- Dead units are removed or marked inactive
- Win/loss state appears when implemented

## How to Run

For early static versions:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Directly opening `index.html` is acceptable if no browser restrictions occur.
