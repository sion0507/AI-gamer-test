# PLANS.md

This document defines the development roadmap for **Simple RTS AI**.

The project should be implemented phase by phase. Do not attempt to build the full final game in one pass.

## Core Goal

Build a browser-based 2D tactical RTS prototype that can later support natural-language AI commander control.

Initial game:

```text
5 allied units vs 5 enemy units
Mouse-based allied control
Vision-based enemy discovery
Automatic combat
Basic enemy AI
```

Final direction:

```text
Natural-language goal
→ AI interpretation
→ structured operation plan
→ Command objects
→ unit execution
```

## Important Reference

Implementation rules, file boundaries, and update interval constants are defined in **AGENTS.md**.

Do not duplicate timing constants here. When implementing phases, follow the `UPDATE_INTERVALS` policy in AGENTS.md.

## Phase 1: Basic Canvas and Units

### Goal

Create the first visual prototype.

### Requirements

- Create the file structure
- Add `index.html`
- Add `style.css`
- Add the `src/` JavaScript files
- Create a canvas
- Draw a simple battlefield background
- Spawn 5 allied units
- Spawn 5 enemy units
- Use simple shapes only
- Store unit stats such as hp, maxHp, position, attack range, vision range, move speed
- No movement yet
- No combat yet
- No fog of war yet

### Expected Result

Opening the game shows a simple 2D map with 5 allied units and 5 enemy units.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 1 only.

Goal:
- Create a browser-based 2D RTS prototype using HTML5 Canvas and vanilla JavaScript.
- Show a simple battlefield map.
- Spawn 5 allied units and 5 enemy units.
- Use simple shapes, not image assets.
- Create the initial file structure described in AGENTS.md.
- Give each unit basic stats: id, team, name, x, y, hp, maxHp, attackDamage, attackRange, visionRange, moveSpeed, currentCommand, targetEnemyId, isSelected, isVisible, and lastKnownPosition.

Important:
- Preserve the Command-based architecture even if commands are not fully used yet.
- Keep the code modular.
- Do not add external libraries.
- Do not implement movement, combat, fog of war, or AI yet.
- After implementation, explain how to run it locally.
```

## Phase 2: Selection and Movement

### Goal

Allow the player to select allied units and move them.

### Requirements

- Click an allied unit to select it
- Visually highlight selected unit
- Click a map location to move the selected unit
- Mouse input must create a Command object
- Unit movement must be caused by command execution, not direct input mutation
- Movement should feel responsive
- No combat yet
- No fog of war yet

### Expected Result

The player can select an allied unit and move it around the map.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 2 only.

Add:
- Allied unit selection with mouse click.
- Selected unit visual highlight.
- Map click movement for the selected allied unit.
- Mouse input must create Command objects.
- Units should move toward their command target through the command execution system.

Important:
- Do not make input.js directly change unit positions.
- Do not put rendering logic in game.js.
- Do not mutate game state from render.js.
- Do not implement combat, fog of war, enemy AI, or natural-language commands yet.
- Preserve all Phase 1 behavior.
```

## Phase 3: Vision and Enemy Hiding

### Goal

Add basic fog-of-war behavior.

### Requirements

- Enemy units should be hidden at the start
- Allied units should reveal enemy units within vision range
- Revealed enemies should become visible on the canvas
- If an enemy leaves allied vision, either hide it again or show only a last-known marker
- Keep the first implementation simple
- Vision calculation should use the timing policy in AGENTS.md
- Do not update vision every frame unless necessary

### Expected Result

The player initially sees only allied units. Enemy units appear only when an allied unit gets close enough.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 3 only.

Add a basic vision system:
- Enemy units are hidden at game start.
- Allied units reveal enemy units when enemies enter allied vision range.
- Visible enemies should be drawn normally.
- Hidden enemies should not be drawn as normal enemy units.
- Store or update lastKnownPosition if useful, but keep the implementation simple.

Important:
- Follow the update timing policy in AGENTS.md for vision updates.
- Do not duplicate UPDATE_INTERVALS values in documentation.
- Do not mutate unit state inside render.js.
- Do not add combat yet.
- Do not add natural-language AI yet.
- Preserve Phase 1 and Phase 2 behavior.
```

## Phase 4: Automatic Combat and Basic Enemy AI

### Goal

Create the first playable tactical loop.

### Requirements

- Units automatically detect enemy units in vision or attack range
- Units choose a target enemy
- Units attack when the target is in attack range
- Units move closer if using attackMove and the target is outside attack range
- Health decreases when attacked
- Units with 0 hp are removed or marked dead
- Add win/loss conditions
- Add basic enemy AI

### Basic Enemy AI

Enemy units should:

- Patrol around their starting area or move within a small assigned zone
- Detect allied units
- Approach detected allied units
- Attack when in range
- Optionally retreat slightly when low on health

### Expected Result

The game becomes playable: allied and enemy units can discover each other, fight, die, and trigger win/loss conditions.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 4 only.

Add automatic combat:
- Units should detect enemies according to the existing vision/attack logic.
- Units should choose valid targets.
- Units should attack targets in range.
- Apply damage over time using the combat update interval policy from AGENTS.md.
- Units with 0 hp should be removed or marked inactive.
- Add visible health bars if not already present.
- Add win/loss conditions.

Add basic enemy AI:
- Enemy units should not remain completely passive.
- They should patrol around their starting area.
- They should approach allied units they detect.
- They should attack allied units in range.
- Keep this AI simple.

Important:
- AI decisions should create or use Command objects where appropriate.
- Do not let ai.js directly bypass the command architecture for movement decisions.
- Do not put AI logic in render.js or input.js.
- Do not add natural-language AI yet.
- Preserve all previous phase behavior.
```

## Phase 5: Multi-Unit Selection and Group Commands

### Goal

Make the game feel more like an RTS.

### Requirements

- Add drag selection box
- Allow selecting multiple allied units
- Issue group movement commands
- Spread selected units around the target point instead of stacking them exactly on one coordinate
- Add `attackMove` command if not already fully supported

### Expected Result

The player can control multiple allied squads together.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 5 only.

Add:
- Drag-box selection for allied units.
- Multiple selected units.
- Group movement commands.
- Formation-like target offsets so selected units do not stack on the same point.
- Basic attackMove command behavior if not already fully supported.

Important:
- Group orders must still be represented as Command objects.
- Do not rewrite the existing command architecture.
- Preserve previous phases.
```

## Phase 6: Game Mode UI

### Goal

Prepare the project for AI Commander Mode.

### Requirements

- Add mode state:
  - `PLAYER_MODE`
  - `AI_COMMAND_MODE`
- Add UI toggle buttons
- Player mode should keep current mouse control behavior
- AI command mode can initially show a placeholder panel
- Do not implement full natural-language AI yet

### Expected Result

The player can switch between direct control mode and placeholder AI commander mode.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 6 only.

Add:
- PLAYER_MODE and AI_COMMAND_MODE state.
- UI buttons or toggle controls for switching modes.
- Player mode keeps existing mouse controls.
- AI command mode shows a placeholder command input area, but does not need real AI behavior yet.

Important:
- Do not break direct player control.
- Do not add an LLM API call.
- Do not store API keys.
- Preserve previous phases.
```

## Phase 7: Simple Text Command Parser

### Goal

Add a lightweight text command system without using an LLM yet.

### Requirements

- Add a text input box in AI Commander Mode
- Add simple keyword-based parsing
- Convert parsed text into Command objects
- Keep the parser intentionally simple

Example mappings:

```text
"central attack" or "중앙 공격" → attackMove to center
"left scout" or "왼쪽 정찰" → scout toward left area
"retreat" or "후퇴" → retreat toward allied base
"defend" or "방어" → defend current/base position
```

### Warning

Do not overbuild this phase.

Conditional instructions such as “scout left, then attack when enemies appear” can become complex quickly. If the rule-based parser becomes messy, stop expanding it and move toward the LLM-based phase later.

### Expected Result

The player can type very simple commands and allied units will respond through Command objects.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 7 only.

Add:
- A simple text command input in AI_COMMAND_MODE.
- A rule-based parser for a few simple commands.
- Parsed commands must become Command objects.

Support at least:
- center attack
- left scout
- retreat
- defend

Also support simple Korean keywords if practical:
- 중앙 공격
- 왼쪽 정찰
- 후퇴
- 방어

Important:
- Keep the parser simple.
- Do not implement a complex natural-language system yet.
- Do not add external AI API calls.
- Do not bypass the Command system.
- Preserve previous phases.
```

## Phase 8: AI Commander Behavior

### Goal

Make AI Commander Mode feel like a simple AI gamer.

### Requirements

- Commander AI can assign different roles to allied units
- One unit can scout
- Other units can hold, defend, or attack later
- Commander AI should evaluate battlefield state on a slow interval
- Commander AI should create new Command objects when strategy changes

Example behavior:

```text
Goal: scout then attack
ally1 → scout left
ally2-ally5 → hold near base
if enemy spotted → ally2-ally5 attackMove toward spotted enemy
```

### Expected Result

The AI commander can control multiple allied units according to a simple strategy.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 8 only.

Add simple AI Commander behavior:
- The commander should assign roles to allied units.
- For a scout-then-attack command, one unit scouts while others hold.
- When an enemy is spotted, reserve units should receive attackMove commands.
- Commander decisions should follow the commanderAI update interval policy in AGENTS.md.

Important:
- Commander AI must create Command objects.
- Do not directly mutate unit positions from the commander.
- Do not add LLM API calls yet.
- Preserve previous phases.
```

## Phase 9: LLM-Based Natural-Language Command Interpretation

### Goal

Connect natural-language player instructions to structured game commands.

### Requirements

- Add a backend boundary for LLM calls
- Do not put API keys in frontend code
- Convert natural-language instructions into validated JSON
- Validate command JSON before execution
- Reject invalid or unsafe command outputs

### Recommended Architecture

```text
Browser game
→ backend endpoint
→ LLM provider
→ structured JSON response
→ validation
→ Command objects
→ game execution
```

### Expected Result

The player can type natural-language goals and the AI commander can convert them into executable game commands.

### Codex Prompt Example

```text
Read README.md, AGENTS.md, and PLANS.md first.

Plan Phase 9 before coding.

Goal:
- Add an LLM integration boundary for natural-language command interpretation.
- Do not place API keys in frontend JavaScript.
- Use a backend endpoint or clearly stub the backend if not implementing it yet.
- The LLM output must be structured JSON.
- Validate JSON before converting it to Command objects.

Important:
- Do not directly execute arbitrary LLM output.
- Do not store secrets in the repository.
- Do not break the existing rule-based parser.
- Preserve previous phases.
```

## General Codex Usage Strategy

Use Codex one phase at a time.

Recommended workflow:

```text
1. Ask Codex to read README.md, AGENTS.md, and PLANS.md.
2. Ask Codex to implement one phase only.
3. Review the result.
4. Run the game manually.
5. Fix bugs.
6. Commit.
7. Move to the next phase.
```

Avoid prompts like:

```text
Build the entire game.
```

Prefer prompts like:

```text
Implement Phase 3 only. Preserve previous phases. Do not implement combat yet.
```

## Project Success Criteria

The project is successful if:

- The player can control 5 allied units
- Enemy units are discovered through vision
- Allied and enemy units can fight automatically
- Enemy units have simple behavior
- The command architecture remains clean
- AI Commander Mode can eventually generate the same Command objects as player input
- Natural-language instructions can later be integrated without rewriting the core game logic
