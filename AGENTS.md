# AGENTS.md

이 문서는 Codex 또는 다른 코딩 에이전트가 이 저장소에서 작업할 때 반드시 따라야 하는 구현 지침입니다.

이 프로젝트는 웹 기반 2D 초간단 RTS 전술 게임입니다. 초기 목표는 플레이어가 마우스로 아군 부대 5개를 조작하는 것입니다. 최종 목표는 자연어 명령을 이해하는 AI 게이머를 붙이는 것입니다.

---

## 1. Highest Priority Rule

가장 중요한 규칙은 다음입니다.

> All player inputs and future AI-generated actions must be represented as Command objects.

절대 마우스 입력을 유닛 동작에 직접 연결하지 마세요.

잘못된 방식:

```js
unit.x = mouseX;
unit.y = mouseY;
```

권장 방식:

```js
const command = {
  type: "move",
  unitIds: [selectedUnit.id],
  target: { x: mouseX, y: mouseY }
};

game.issueCommand(command);
```

게임 로직은 Command를 실행해야 합니다.  
플레이어 입력도 Command를 만들고, 미래의 AI 게이머도 Command를 만들어야 합니다.

---

## 2. Project Purpose

이 프로젝트는 단순한 RTS 게임이 아니라, 자연어 기반 AI 게이머를 실험하기 위한 전술 시뮬레이션 플랫폼입니다.

초기 버전:

- Player Control Mode
- 마우스 클릭으로 아군 부대 이동
- 시야 안에 들어온 적 자동 공격

최종 버전:

- AI Commander Mode
- 자연어 목표 입력
- AI가 작전 JSON 생성
- JSON이 Command 객체로 변환됨
- 아군 부대들이 자동 수행

따라서 현재 구현할 때도 미래의 AI Commander Mode를 고려해야 합니다.

---

## 3. Technology Constraints

초기 구현에서는 다음을 지킵니다.

- Use HTML5 Canvas.
- Use vanilla JavaScript.
- Do not use external libraries unless explicitly requested.
- Keep the project runnable as a static web app.
- Use simple shapes instead of image assets for the first prototype.
- Keep the code readable and modular.

외부 그래픽 에셋, 빌드 도구, 프레임워크, 번들러는 초기에는 사용하지 않습니다.

---

## 4. Recommended File Structure

초기 구조는 다음과 같습니다.

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

각 파일 역할은 다음과 같습니다.

### index.html

- Canvas와 기본 UI를 포함합니다.
- 스크립트 로딩을 담당합니다.
- 게임 로직을 직접 작성하지 않습니다.

### style.css

- 화면 레이아웃
- Canvas 스타일
- 모드 전환 UI
- 명령 입력창 UI

### src/main.js

- 앱 시작점
- Canvas 초기화
- Game 인스턴스 생성
- 메인 루프 시작

### src/game.js

- 전체 게임 상태 관리
- 유닛 목록 관리
- Command 발행 및 실행
- 업데이트 주기 관리
- 승패 판정

### src/unit.js

- Unit 클래스 또는 유닛 생성 함수
- 위치, 체력, 공격력, 시야, 이동 속도 등 유닛 데이터 정의
- 유닛 자체의 순수 상태와 기본 동작 보조 함수

### src/command.js

- Command 타입 정의
- Command 생성 함수
- Command 유효성 검사
- move, attackMove, hold, scout, defend, retreat 구조 정의

### src/input.js

- 마우스 입력 처리
- 유닛 선택
- 이동 명령 생성
- 직접 유닛 상태를 바꾸지 말고 Command를 생성해야 함

### src/render.js

- Canvas 렌더링 전담
- 맵 그리기
- 유닛 그리기
- 체력바 그리기
- 시야 표시
- 선택 표시

### src/ai.js

- 개별 유닛 AI
- 적군 간단 AI
- 미래 CommanderAI 자리
- 미래 NaturalLanguageParser 자리

---

## 5. Game Data Model

유닛은 최소한 다음 정보를 가져야 합니다.

```js
{
  id: "ally1",
  team: "ally",
  name: "Ally Squad 1",

  x: 100,
  y: 200,

  hp: 100,
  maxHp: 100,

  attackDamage: 10,
  attackRange: 70,
  visionRange: 180,
  moveSpeed: 80,

  currentCommand: null,
  targetEnemyId: null,

  isSelected: false,
  isVisible: true,
  lastKnownPosition: null
}
```

적군도 같은 구조를 사용합니다.

단대호 하나를 하나의 전투 유닛으로 취급합니다.  
병사 개별 시뮬레이션은 구현하지 않습니다.

---

## 6. Command Types

Command는 최소한 다음 타입을 고려합니다.

```text
move
attackMove
hold
scout
defend
retreat
```

초기 구현에서는 `move`와 `attackMove`만 실제 동작해도 됩니다.  
나머지 타입은 이후 확장을 고려해 구조상 자리를 남겨둡니다.

Command 예시:

```js
{
  type: "move",
  unitIds: ["ally1", "ally2"],
  target: { x: 400, y: 300 }
}
```

attackMove 예시:

```js
{
  type: "attackMove",
  unitIds: ["ally1", "ally2", "ally3"],
  target: { x: 700, y: 250 }
}
```

---

## 7. Update Cycle Design

업데이트 주기를 분리합니다.

권장 기본값:

```js
const UPDATE_INTERVALS = {
  movement: 100,
  combat: 250,
  vision: 500,
  unitAI: 1000,
  commanderAI: 10000
};
```

각 주기의 의미:

- movement: 유닛 이동 처리
- combat: 공격 판정과 데미지 처리
- vision: 시야 계산과 적 표시 여부 갱신
- unitAI: 개별 유닛 자동 판단
- commanderAI: AI 게이머의 전체 작전 판단

주의:

- 전체 시뮬레이션을 10초마다만 갱신하지 마세요.
- 이동과 전투는 짧은 주기로 처리해야 합니다.
- AI Commander의 전략 판단만 10초 단위로 처리합니다.

---

## 8. Enemy AI Requirement

적군이 가만히 서 있는 상태로만 구현되면 안 됩니다.

Phase 4부터 최소한 다음 행동을 넣습니다.

- 기본 위치 주변 순찰
- 아군 발견 시 공격
- 사거리 밖이면 접근
- 체력이 낮으면 약간 후퇴

초기 적군 AI는 단순해도 됩니다.  
목표는 AI 게이머를 테스트할 수 있는 움직이는 상대를 만드는 것입니다.

---

## 9. Rendering Rules

초기에는 이미지를 사용하지 않습니다.

권장 표현:

- 아군: 파란색 계열 원 또는 사각형
- 적군: 빨간색 계열 원 또는 사각형
- 선택된 유닛: 테두리 또는 강조 표시
- 체력바: 유닛 위 작은 막대
- 시야: 선택된 유닛 주변 반투명 원
- 적군: 아군 시야 안에 있을 때만 표시

그래픽 퀄리티보다 게임 로직과 AI 확장 구조가 우선입니다.

---

## 10. AI Commander Architecture

미래 AI Commander Mode는 다음 흐름을 따라야 합니다.

```text
Natural language input
→ NaturalLanguageParser
→ structured plan JSON
→ CommanderAI
→ unit-level Command objects
→ Game execution
```

LLM이 직접 유닛을 움직이면 안 됩니다.  
LLM은 구조화된 JSON을 생성해야 하고, 게임은 그 JSON을 검증한 뒤 Command로 실행해야 합니다.

예상 JSON 예시:

```json
{
  "intent": "scout_then_attack",
  "priority": "minimize_casualties",
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

---

## 11. Rule-Based Parser Warning

Phase 7의 규칙 기반 텍스트 파서는 너무 복잡하게 만들지 않습니다.

허용 범위:

- “중앙 공격”
- “왼쪽 정찰”
- “후퇴”
- “방어”
- “전체 공격”

복잡한 조건부 자연어 명령은 규칙 기반 파서로 깊게 구현하지 않습니다.

예:

```text
왼쪽으로 정찰 보내고 적 발견하면 중앙 부대가 합류해서 공격해
```

이런 문장은 규칙 기반으로 억지 구현하지 말고, 나중에 LLM 기반 자연어 해석 단계에서 처리합니다.

---

## 12. Security Rule for LLM Integration

브라우저 코드에 LLM API 키를 직접 넣지 마세요.

미래 LLM 통합은 다음 구조를 사용합니다.

```text
Browser game
→ backend server
→ LLM API
→ JSON command response
→ browser game
```

초기 정적 웹 게임에는 API 연동을 넣지 않습니다.

---

## 13. Development Process

한 번에 전체 Phase를 구현하지 마세요.

작업은 반드시 작은 단계로 나눕니다.

권장 순서:

1. Phase 1 only
2. Phase 2 only
3. Phase 3 only
4. Phase 4 only
5. 이후 확장

각 Phase가 끝나면 다음을 확인합니다.

- 브라우저에서 실행되는가
- 콘솔 에러가 없는가
- 해당 Phase의 기능만 구현되었는가
- Command 중심 구조가 유지되는가
- 기존 기능이 깨지지 않았는가

---

## 14. Definition of Done

각 작업의 완료 기준은 다음입니다.

- 로컬 브라우저에서 실행 가능
- 콘솔 에러 없음
- 새 기능이 기존 기능을 깨지 않음
- 입력은 Command 구조를 통해 처리됨
- 코드가 파일 역할에 맞게 분리됨
- 외부 라이브러리 추가 없음
- README 또는 PLANS와 충돌하는 설계 변경 없음

---

## 15. First Task Recommendation

처음 작업은 Phase 1만 구현합니다.

첫 작업 범위:

- index.html 생성
- style.css 생성
- src 파일 구조 생성
- Canvas 표시
- 아군 5개, 적군 5개 초기 배치
- 유닛을 단순 도형으로 렌더링
- 아직 이동, 전투, 시야, AI는 구현하지 않음

그다음 Phase 2에서 선택과 이동을 구현합니다.
