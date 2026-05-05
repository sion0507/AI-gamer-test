# Simple RTS AI

웹 기반 2D 초간단 RTS 전술 게임 프로젝트입니다.

이 프로젝트의 목표는 스타크래프트 같은 RTS의 핵심 요소 중 일부만 단순화해서 구현하고, 최종적으로는 자연어 명령을 이해하는 AI 게이머를 붙이는 것입니다.

처음에는 플레이어가 마우스로 아군 부대 5개를 직접 조작합니다. 이후에는 플레이어 조작 모드와 AI 게이머 모드를 전환할 수 있게 만들고, AI 게이머 모드에서는 사용자가 자연어로 목표를 입력하면 AI가 이를 해석해 아군 부대들을 자동 지휘하게 하는 것을 목표로 합니다.

---

## 1. Project Goal

최종 목표는 다음과 같습니다.

> 사용자가 “왼쪽으로 정찰 보내고, 적을 발견하면 나머지 부대가 합류해서 공격해” 같은 자연어 명령을 입력하면, AI 게이머가 이를 구조화된 작전 명령으로 바꾸고 아군 부대들이 자동으로 수행하는 웹 게임을 만든다.

초기 버전에서는 자연어 AI를 바로 붙이지 않습니다. 먼저 게임의 기본 구조를 안정적으로 만든 뒤, 나중에 AI 게이머를 붙일 수 있도록 설계합니다.

---

## 2. Core Concept

게임은 2D 탑다운 전술 화면으로 구성됩니다.

- 아군 부대 5개
- 적군 부대 5개
- 단대호 하나를 하나의 전투 유닛으로 취급
- 처음에는 아군만 보임
- 적군은 아군 시야 안에 들어오면 보임
- 아군은 마우스 클릭으로 이동
- 적을 발견하면 자동 공격
- 체력이 0이 되면 제거
- 적 전멸 시 승리
- 아군 전멸 시 패배

---

## 3. Game Modes

이 프로젝트는 처음부터 두 가지 모드를 고려합니다.

### Player Control Mode

플레이어가 직접 마우스로 아군 부대를 선택하고 이동시킵니다.

초기 구현 목표입니다.

### AI Commander Mode

플레이어가 자연어로 목표를 입력하면 AI 게이머가 명령을 해석하고 아군 부대를 자동 지휘합니다.

최종 확장 목표입니다.

---

## 4. Key Design Principle

가장 중요한 설계 원칙은 다음과 같습니다.

> 모든 입력은 Command 객체로 통일한다.

즉, 플레이어가 마우스로 이동 명령을 내려도 내부적으로는 Command 객체가 생성되어야 합니다. 나중에 AI 게이머가 자연어 명령을 해석해도 똑같은 Command 객체를 생성해야 합니다.

예시:

```js
{
  type: "move",
  unitIds: ["ally1", "ally2"],
  target: { x: 400, y: 300 }
}
```

이 구조를 지켜야 나중에 AI 게이머를 붙일 때 기존 게임 로직을 크게 바꾸지 않아도 됩니다.

---

## 5. Planned Features

### Initial Prototype

- HTML5 Canvas 기반 웹 게임
- Vanilla JavaScript 사용
- 외부 라이브러리 없이 시작
- 아군 5부대와 적군 5부대 배치
- 아군 부대 클릭 선택
- 클릭 위치로 이동
- 적군 시야 은폐
- 적 발견 시 자동 공격
- 체력바 표시
- 승패 판정

### Later Features

- 드래그 다중 선택
- attackMove 명령
- 적군 순찰 AI
- 플레이어 조작 모드와 AI 게이머 모드 전환
- 규칙 기반 텍스트 명령
- LLM 기반 자연어 명령 해석
- 자연어 명령을 JSON Command로 변환
- AI 지휘관이 10초 단위로 작전 판단

---

## 6. Update Cycle Design

게임은 가볍게 유지하되, 화면 자체는 부드럽게 보이도록 갱신 주기를 분리합니다.

```js
const UPDATE_INTERVALS = {
  movement: 100,
  combat: 250,
  vision: 500,
  unitAI: 1000,
  commanderAI: 10000
};
```

의미는 다음과 같습니다.

- 화면 렌더링: 30~60fps
- 이동 갱신: 0.1초마다
- 전투 판정: 0.25초마다
- 시야 갱신: 0.5초마다
- 개별 유닛 AI 판단: 1초마다
- AI 게이머 작전 판단: 10초마다

전체 시뮬레이션을 10초마다만 갱신하지 않습니다. 유닛 이동과 전투는 짧은 주기로 처리하고, AI 게이머의 전략 판단만 긴 주기로 처리합니다.

---

## 7. Recommended File Structure

초기 구현은 다음 구조를 기준으로 합니다.

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

파일 수를 너무 늘리지 않고, 나중에 확장할 수 있을 정도로만 분리합니다.

---

## 8. How to Run

초기 버전은 정적 웹 파일로 구성합니다.

로컬 실행 방법 예시:

```bash
python -m http.server 8000
```

그 후 브라우저에서 다음 주소를 엽니다.

```text
http://localhost:8000
```

단순한 정적 파일 구조라면 `index.html`을 직접 열어도 되지만, 이후 모듈 import를 사용할 가능성을 고려해 로컬 서버 실행을 권장합니다.

---

## 9. Development Approach

한 번에 전체 기능을 만들지 않습니다.

권장 순서:

1. 기본 화면과 유닛 표시
2. 유닛 선택과 이동
3. 시야 시스템
4. 자동 전투와 적군 AI
5. 다중 선택과 attackMove
6. 모드 전환 UI
7. 간단한 텍스트 명령
8. AI 지휘관
9. LLM 기반 자연어 명령

각 Phase는 `PLANS.md`에 자세히 정리합니다.

---

## 10. Future AI Integration

최종 자연어 AI 구조는 다음과 같습니다.

```text
Natural language input
→ NaturalLanguageParser
→ structured JSON plan
→ CommanderAI
→ unit-level Command objects
→ GameEngine execution
```

브라우저에 API 키를 직접 넣지 않습니다.

최종적으로 LLM을 붙일 때는 다음 구조를 권장합니다.

```text
Browser game
→ backend server
→ LLM API
→ JSON command response
→ game execution
```

---

## 11. Current Status

초기 기획 및 개발 문서 작성 단계입니다.

먼저 Phase 1부터 구현합니다.
