# PLANS.md

이 문서는 Simple RTS AI 프로젝트의 단계별 개발 계획입니다.

목표는 한 번에 완성형 게임을 만드는 것이 아니라, 각 단계마다 실행 가능한 작은 프로토타입을 만들면서 최종적으로 자연어 명령 기반 AI 게이머 구조까지 확장하는 것입니다.

---

## 0. Final Vision

최종적으로 만들고 싶은 게임은 다음과 같습니다.

- 웹 기반 2D 전술 게임
- 아군 5부대 vs 적군 5부대
- 플레이어는 처음에는 마우스로 아군 부대를 직접 조작
- 적군은 아군 시야 안에 들어오기 전까지 보이지 않음
- 적 발견 시 자동 공격
- 이후 AI 게이머 모드를 추가
- 사용자가 자연어로 목표를 입력
- AI가 목표를 해석해 작전 JSON 생성
- 작전 JSON이 Command 객체로 변환
- 아군 부대들이 자동으로 움직이고 교전

핵심은 다음입니다.

```text
모든 입력은 Command 객체로 통일한다.
```

---

## 1. Global Architecture

전체 구조는 다음 흐름을 기준으로 합니다.

```text
Input
→ Command
→ Game State
→ Systems Update
→ Render
```

입력은 두 종류가 있습니다.

```text
Player mouse input
→ Command

Future natural language input
→ AI parser
→ Command
```

게임 로직은 입력이 마우스에서 왔는지, AI에서 왔는지 몰라도 됩니다.  
게임 로직은 오직 Command를 실행합니다.

---

## 2. Update Cycle Plan

게임의 갱신 주기는 분리합니다.

```js
const UPDATE_INTERVALS = {
  movement: 100,
  combat: 250,
  vision: 500,
  unitAI: 1000,
  commanderAI: 10000
};
```

### Rendering

- 30~60fps
- 화면을 부드럽게 보여주는 역할
- 게임 판단 로직과 분리

### Movement

- 0.1초마다 갱신
- 유닛이 현재 Command의 target으로 이동

### Combat

- 0.25초마다 갱신
- 사거리 안의 적에게 데미지 적용
- hp가 0 이하인 유닛 제거

### Vision

- 0.5초마다 갱신
- 아군 시야 안에 있는 적 표시
- 시야 밖의 적 숨김 또는 lastKnownPosition 처리

### Unit AI

- 1초마다 갱신
- 개별 부대의 자동 판단
- 적 발견, 타겟 지정, 접근, 공격, 후퇴

### Commander AI

- 10초마다 갱신
- AI 게이머의 전체 작전 판단
- 자연어 목표 기반 명령 재분배
- 초기에는 비활성화 가능

---

## 3. Phase 1: Basic Canvas and Units

### Goal

브라우저에서 실행되는 기본 화면과 유닛 배치를 만든다.

### Scope

구현할 것:

- `index.html`
- `style.css`
- `src/main.js`
- `src/game.js`
- `src/unit.js`
- `src/render.js`
- Canvas 생성
- 맵 배경 표시
- 아군 5개 생성
- 적군 5개 생성
- 유닛을 단순 도형으로 표시
- 유닛 이름 또는 id 표시 가능

구현하지 않을 것:

- 이동
- 선택
- 시야
- 전투
- AI
- 자연어 입력

### Acceptance Criteria

- 브라우저에서 Canvas가 보인다.
- 아군 5개와 적군 5개가 보인다.
- 콘솔 에러가 없다.
- 유닛 데이터가 코드에서 명확히 관리된다.

---

## 4. Phase 2: Selection and Movement

### Goal

플레이어가 아군 부대를 클릭으로 선택하고, 위치를 클릭해 이동시킬 수 있게 한다.

### Scope

구현할 것:

- `src/command.js`
- `src/input.js`
- 아군 유닛 클릭 선택
- 선택된 유닛 강조 표시
- 맵 클릭 시 이동 Command 생성
- Game이 Command를 받아 currentCommand로 저장
- 유닛이 target 위치로 이동

권장 조작:

- 좌클릭: 아군 유닛 선택
- 우클릭 또는 맵 클릭: 선택된 유닛 이동

중요:

- input.js에서 유닛 위치를 직접 바꾸면 안 된다.
- 반드시 move Command를 생성해야 한다.

### Acceptance Criteria

- 아군 유닛을 선택할 수 있다.
- 선택된 유닛이 시각적으로 구분된다.
- 클릭한 위치로 유닛이 이동한다.
- 이동이 Command 객체를 통해 이루어진다.

---

## 5. Phase 3: Vision and Fog of War

### Goal

적군이 처음부터 보이지 않고, 아군 시야 안에 들어왔을 때만 보이게 한다.

### Scope

구현할 것:

- 유닛별 visionRange
- 아군 시야 계산
- 적군 visibility 갱신
- 시야 안의 적만 렌더링
- 선택된 아군의 시야 범위 표시

선택 구현:

- 적이 시야 밖으로 나가면 완전히 숨김
- 또는 lastKnownPosition을 희미하게 표시

초기에는 완전히 숨기는 방식으로 가도 된다.

### Acceptance Criteria

- 게임 시작 시 적군이 보이지 않는다.
- 아군이 가까이 가면 적군이 보인다.
- 적군이 시야 밖이면 다시 보이지 않는다.
- 시야 계산은 별도 주기로 실행된다.

---

## 6. Phase 4: Auto Combat and Enemy AI

### Goal

아군과 적군이 서로를 발견하면 자동으로 공격하게 한다. 적군도 간단히 움직이는 상대가 되게 한다.

### Scope

구현할 것:

- attackRange
- attackDamage
- combat update loop
- 자동 타겟 지정
- 사거리 안이면 공격
- 체력바 표시
- hp 0 이하 유닛 제거
- 승리/패배 판정
- 적군 간단 AI

적군 AI 최소 요구:

- 기본 위치 주변 순찰
- 아군 발견 시 공격
- 사거리 밖이면 접근
- 체력이 낮으면 약간 후퇴

### Acceptance Criteria

- 아군과 적군이 만나면 자동으로 공격한다.
- hp가 줄어드는 것이 체력바로 보인다.
- hp가 0이 되면 유닛이 사라진다.
- 적군이 가만히만 있지 않고 최소한 순찰 또는 접근 행동을 한다.
- 적 전멸 시 승리, 아군 전멸 시 패배가 표시된다.

---

## 7. Phase 5: Multi-Select and Squad Commands

### Goal

RTS 느낌을 강화하기 위해 여러 부대를 선택하고 동시에 명령할 수 있게 한다.

### Scope

구현할 것:

- 드래그 박스 선택
- 여러 아군 유닛 선택
- 선택된 모든 유닛에 Command 발행
- 목표 지점 주변으로 퍼져서 이동
- attackMove Command 추가

attackMove 동작:

- target 위치로 이동
- 이동 중 적을 발견하면 교전
- 적이 제거되면 원래 목표로 계속 이동

### Acceptance Criteria

- 드래그로 여러 아군을 선택할 수 있다.
- 선택된 여러 유닛이 함께 이동한다.
- 유닛들이 같은 좌표에 겹치지 않고 적당히 퍼진다.
- attackMove 명령이 작동한다.

---

## 8. Phase 6: Mode Toggle UI

### Goal

플레이어 조작 모드와 AI 게이머 모드를 전환할 수 있는 구조를 만든다.

### Scope

구현할 것:

- PLAYER_MODE
- AI_COMMAND_MODE
- 상단 UI 버튼
- 현재 모드 표시
- AI_COMMAND_MODE용 입력창 자리

초기에는 AI_COMMAND_MODE가 완전히 동작하지 않아도 된다.  
단, 구조는 만들어둔다.

### Acceptance Criteria

- UI에서 모드를 전환할 수 있다.
- 현재 모드가 화면에 표시된다.
- PLAYER_MODE에서는 기존 마우스 조작이 정상 작동한다.
- AI_COMMAND_MODE를 위한 입력창 또는 UI 영역이 있다.

---

## 9. Phase 7: Simple Text Command Parser

### Goal

LLM을 붙이기 전에 간단한 규칙 기반 텍스트 명령을 테스트한다.

### Scope

구현할 것:

- 텍스트 입력창
- submit 버튼 또는 Enter 입력
- 키워드 기반 명령 해석
- 해석 결과를 Command로 변환

지원 예시:

```text
중앙 공격
왼쪽 정찰
오른쪽 정찰
후퇴
방어
전체 공격
```

주의:

- 복잡한 조건부 자연어를 여기서 깊게 구현하지 않는다.
- 규칙 기반 파서는 LLM 전 단계의 임시 구조다.
- 이 단계에서 너무 오래 머물지 않는다.

### Acceptance Criteria

- 간단한 텍스트 명령을 입력할 수 있다.
- 텍스트 명령이 Command로 변환된다.
- 아군 부대들이 해당 Command를 수행한다.
- 복잡한 문장은 fallback 메시지를 표시한다.

---

## 10. Phase 8: Commander AI

### Goal

AI 게이머가 목표를 보고 여러 부대에게 역할을 나눠줄 수 있게 한다.

### Scope

구현할 것:

- CommanderAI 모듈
- 10초 단위 작전 판단
- 전장 상황 요약
- 부대 역할 분배
- 정찰 부대, 공격 부대, 대기 부대 구분
- 적 발견 시 전체 작전 변경

예시:

```text
목표: 왼쪽 정찰 후 공격
```

실행 방식:

```text
ally1 → left scout
ally2, ally3 → center hold
ally4, ally5 → rear hold
enemy spotted → all available units attackMove to spotted position
```

### Acceptance Criteria

- AI_COMMAND_MODE에서 AI가 부대별 명령을 배정한다.
- AI 판단은 매 프레임이 아니라 commanderAI 주기에 따라 실행된다.
- AI가 Command 객체를 통해서만 유닛을 제어한다.
- 전장 상황 변화에 따라 작전을 갱신할 수 있다.

---

## 11. Phase 9: LLM-Based Natural Language Commands

### Goal

사용자가 자유롭게 입력한 자연어 목표를 LLM이 구조화된 JSON으로 변환하고, 게임이 이를 실행하게 한다.

### Scope

구현할 것:

- NaturalLanguageParser 인터페이스
- LLM 응답 JSON 스키마 정의
- JSON 검증
- 잘못된 JSON 응답 처리
- JSON → Command 변환
- 백엔드 연동 구조

보안상 브라우저에 API 키를 넣지 않는다.

권장 구조:

```text
Browser game
→ backend server
→ LLM API
→ JSON command response
→ browser game
```

LLM 출력 예시:

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

### Acceptance Criteria

- 자연어 명령을 입력할 수 있다.
- LLM이 구조화된 JSON을 반환한다.
- 반환값이 검증된다.
- 유효한 명령만 게임에 반영된다.
- 잘못된 응답은 게임을 깨뜨리지 않는다.

---

## 12. Long-Term Improvements

Phase 9 이후에 고려할 수 있는 확장입니다.

- 맵 장애물
- 경로 탐색
- 여러 지형 타입
- 부대별 역할 차이
- 정찰병, 공격병, 지원병
- 전장의 마지막 발견 위치 표시
- AI 게이머 성과 평가
- 작전 로그 출력
- 전투 리플레이
- 여러 AI 지휘관 성격 비교
- 사용자의 자연어 목표와 실제 결과 비교

---

## 13. Suggested Codex Workflow

Codex에게 한 번에 전체 프로젝트를 맡기지 않습니다.

권장 방식:

1. `README.md`, `AGENTS.md`, `PLANS.md`를 먼저 저장소 루트에 추가
2. Codex에게 세 문서를 먼저 읽게 함
3. Phase 1만 구현 요청
4. 결과 확인
5. Phase 2만 구현 요청
6. 반복

첫 프롬프트 예시:

```text
Read README.md, AGENTS.md, and PLANS.md first.

Implement Phase 1 only.

Goal:
- Create a browser-based 2D RTS prototype using HTML5 Canvas and vanilla JavaScript.
- Show a map.
- Spawn 5 allied units and 5 enemy units.
- Use simple shapes, not image assets.
- Create the initial file structure described in AGENTS.md.
- Do not implement movement, combat, fog of war, or AI yet.

Important:
- Preserve the Command-based architecture.
- Keep the code modular.
- Do not add external libraries.
- After implementation, explain how to run it locally.
```

Phase 2 프롬프트 예시:

```text
Now implement Phase 2.

Add:
- allied unit selection with mouse click
- selected unit highlight
- right-click or map click movement
- mouse input should create Command objects
- units should move toward their command target

Do not implement combat yet.
```

---

## 14. Current Next Step

현재 다음 작업은 Phase 1 구현입니다.

Phase 1의 목표는 단순합니다.

- Canvas 띄우기
- 맵 그리기
- 아군 5개 표시
- 적군 5개 표시
- 파일 구조 만들기

이후 Phase 2에서 선택과 이동을 추가합니다.
