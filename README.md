프로젝트 요약

이 저장소는 LOA Tracker(Next.js + TypeScript) 앱의 초기 작업입니다. 현재 UI 컴포넌트와 상태 관리 기본 구조를 갖추었으며, 개발용 로컬 서버에서 확인할 수 있습니다.

지금까지 한 작업

- 프로젝트 초기 구조: Next.js 앱 템플릿 기반
- 주요 컴포넌트 추가:
  - [components/RaidList.tsx](components/RaidList.tsx)
  - [components/SettingsPanel.tsx](components/SettingsPanel.tsx)
  - [components/SummaryAll.tsx](components/SummaryAll.tsx)
- 앱 구조 파일:
  - [app/layout.tsx](app/layout.tsx)
  - [app/page.tsx](app/page.tsx)
- 상태 관리 / 유틸리티:
  - [lib/store.ts](lib/store.ts)
- 타입 정의:
  - [types/index.ts](types/index.ts)

구현 상태

- UI 컴포넌트 스켈레톤 생성: 목록, 설정 패널, 요약 컴포넌트
- 전역 레이아웃 및 기본 스타일 (`app/globals.css`) 적용
- 기본 상태 관리(store) 초기화

로컬에서 실행하기

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 시작:

```bash
npm run dev
```

3. 브라우저 열기: http://localhost:3000

다음 권장 작업

- `components/RaidList.tsx`에 실제 데이터 바인딩 및 API 연동 추가
- 상태(store)에서 raid 항목 CRUD 구현 및 persistence(로컬스토리지/백엔드)
- 폼 검증 및 설정 패널 기능 완성
- 필요한 유닛 테스트 추가

참고: 주요 소스 파일은 루트의 `components/`, `app/`, `lib/` 폴더에서 확인하세요.
