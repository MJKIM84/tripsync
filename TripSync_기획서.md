# TripSync — 여행 관리 앱 기획서

> 여행하는 사람, 동행자, 가족, 가이드, 친구 모두가 함께 보고 기록하는 여행 플랫폼

---

## 1. 프로젝트 개요

### 1.1 앱 이름: **TripSync**

### 1.2 핵심 가치
- **함께 보는 여행**: 여행자, 동행자, 가족, 가이드, 친구 등 다양한 역할이 하나의 여행을 실시간으로 공유
- **체계적 관리**: 폴더 구조로 여행별 일정, 기록, 사진을 깔끔하게 정리
- **실시간 동기화**: 누군가 일정을 수정하면 모든 참여자에게 즉시 반영

### 1.3 대상 사용자 (역할 정의)

| 역할 | 설명 | 권한 |
|------|------|------|
| **Owner** (여행 주최자) | 여행을 생성하고 관리하는 사람 | 모든 권한 (생성/수정/삭제/초대/역할관리) |
| **Traveler** (동행자) | 함께 여행하는 사람 | 일정 수정, 사진 업로드, 기록 작성, 채팅 |
| **Family** (가족) | 집에서 여행을 지켜보는 가족 | 읽기 전용 + 댓글/응원 메시지 + 위치 확인 |
| **Guide** (가이드) | 현지에서 도와주는 가이드 | 일정 제안, 장소 추천, 메모 작성, 채팅 |
| **Friend** (친구) | 여행 소식을 공유받는 친구 | 읽기 전용 + 댓글 |

### 1.4 역할별 권한 매트릭스 (RBAC)

| 기능 | Owner | Traveler | Guide | Family | Friend |
|------|:-----:|:--------:|:-----:|:------:|:------:|
| **여행 설정 수정/삭제** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **참여자 초대/역할 변경** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **참여자 제거** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **일정 생성/수정/삭제** | ✅ | ✅ | ✅ (제안) | ❌ | ❌ |
| **일정 보기** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **기록(저널) 작성** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **기록 보기** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **사진 업로드** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **사진 보기/다운로드** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **사진 삭제** | ✅ (전체) | ✅ (본인) | ✅ (본인) | ❌ | ❌ |
| **장소 추가/수정** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **장소 보기** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **경비 추가/수정** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **경비 보기** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **체크리스트 생성/수정** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **체크리스트 항목 체크** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **체크리스트 보기** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **문서 업로드** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **문서 보기** | ✅ | ✅ | ✅ | visibility에 따름 | ❌ |
| **채팅 참여** | ✅ | ✅ | ✅ | ✅ (읽기+응원) | ❌ |
| **댓글 작성** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **위치 공유** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **위치 확인** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **지도 보기** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **활동 피드 보기** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **내보내기** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **긴급 정보 보기** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **SOS 발신** | ✅ | ✅ | ✅ | ❌ | ❌ |

> **권한 원칙**: Owner는 모든 권한 보유. Traveler는 여행 설정/멤버 관리를 제외한 거의 모든 쓰기 권한. Guide는 일정/장소/체크리스트에 특화된 쓰기 권한. Family는 안심 목적의 읽기 위주. Friend는 피드/댓글만 가능.

---

## 2. 기능 정의 — 릴리즈 단계별

### ═══════════════════════════════════════
### MVP (v1.0) — 핵심 기능
### ═══════════════════════════════════════

### 2.1 여행 폴더 관리 (Trip Folders)
```
내 여행 목록
├── 🇯🇵 2026 오사카 벚꽃여행 (진행중)
│   ├── 📅 일정 (Schedule)
│   ├── 📝 여행 기록 (Journal)
│   ├── 📸 사진 갤러리 (Gallery)
│   ├── 📍 장소 목록 (Places)
│   ├── 💰 경비 (Budget)
│   ├── ✅ 체크리스트 (Checklist)        ← NEW
│   ├── 📎 문서 보관함 (Documents)       ← NEW
│   ├── 👥 참여자 (Members)
│   └── 💬 채팅 (Chat)                  ← NEW
├── 🇮🇹 2025 이탈리아 신혼여행 (완료)
└── 🇹🇭 2026 태국 가족여행 (계획중)
```

- 여행 생성/수정/삭제/복제
- 상태 관리: 계획중 → 진행중 → 완료
- 여행 표지 이미지 설정
- 태그 및 검색 기능

### 2.2 일정 관리 (Schedule)
- **Day-by-Day 타임라인**: 날짜별로 시간대 일정 관리
- **드래그 앤 드롭**: 일정 순서 변경
- **장소 연동**: 장소명 입력 시 지도 연결
- **실시간 수정**: 동행자가 일정을 수정하면 즉시 반영
- **알림**: 다음 일정 30분 전 알림
- **카테고리 구분**: 교통/식사/관광/숙소/쇼핑 아이콘

### 2.3 여행 기록 (Journal)
- **날짜별 일기**: 텍스트 + 사진 조합 기록
- **위치 태그**: 기록에 장소 정보 첨부
- **감정 태그**: 오늘의 기분 이모지 선택
- **공동 작성**: 여러 동행자가 같은 날 각자 기록 가능

### 2.4 사진 갤러리 (Gallery)
- **사진 업로드**: 드래그 앤 드롭 / 파일 선택 업로드
- **자동 분류**: 날짜별, 장소별 자동 그룹핑
- **갤러리 뷰**: 그리드 / 타임라인 / 슬라이드쇼
- **사진 상세**: EXIF 정보, 위치, 촬영 시간
- **다운로드**: 개별/일괄 다운로드
- **용량 관리**: 썸네일 자동 생성, 원본 보관

### 2.5 참여자 관리 (Members)
- **초대**: 이메일 또는 초대 링크로 참여자 초대
- **역할 지정**: Owner / Traveler / Family / Guide / Friend
- **권한 관리**: 역할별 읽기/쓰기/관리 권한 차등
- **실시간 접속 상태**: 현재 접속 중인 사람 표시

### 2.6 경비 관리 (Budget)
- 항목별 지출 기록
- 참여자간 정산 (더치페이)
- 통화 변환
- 카테고리별 통계 (파이 차트)

### 2.7 체크리스트 (Checklist) ← NEW
```
준비물 체크리스트
├── ✅ 여권 (Joshua)
├── ✅ 항공권 e-ticket 출력 (Joshua)
├── ⬜ 와이파이 도시락 예약 (미지정)
├── ⬜ 환전 (Mina)
├── ✅ 여행자보험 가입 (Joshua)
└── ⬜ 숙소 체크인 정보 확인 (Guide Kim)

할일 체크리스트
├── ⬜ 캐리어 무게 체크
├── ⬜ 국제운전면허증 발급
└── ✅ 비자 확인
```

- **공유 체크리스트**: 모든 참여자가 함께 체크
- **담당자 지정**: 각 항목에 담당자 배정
- **카테고리 분류**: 준비물 / 할일 / 예약확인 / 기타
- **템플릿 제공**: "해외여행 기본 준비물", "일본 여행 체크리스트" 등
- **완료율 표시**: 프로그레스 바로 준비 진행률 시각화

### 2.8 문서 보관함 (Documents Vault) ← NEW
```
문서 보관함
├── 📄 항공권
│   ├── 인천→간사이_e-ticket.pdf
│   └── 간사이→인천_e-ticket.pdf
├── 🏨 숙소
│   ├── 호텔_예약확인서.pdf
│   └── 에어비앤비_체크인_안내.png
├── 🛡️ 보험
│   └── 여행자보험_증권.pdf
├── 📋 기타
│   ├── 여권사본.jpg
│   └── 국제운전면허증.jpg
```

- **파일 업로드**: PDF, 이미지, 문서 파일 업로드
- **카테고리 분류**: 항공/숙소/보험/비자/교통/기타
- **오프라인 접근**: 중요 문서는 로컬 캐싱
- **빠른 접근**: 여행 중 한 탭으로 예약 확인서 즉시 확인
- **공유 범위 설정**: 전체 공개 / Traveler만 / 나만 보기

### 2.9 지도 뷰 (Map View) ← NEW
```
┌─────────────────────────────────────────┐
│           [지도 전체 화면]               │
│                                         │
│     📍1 공항 ─── 📍2 호텔               │
│         │              │                │
│     📍3 이치란 ── 📍4 오사카성          │
│         │              │                │
│     📍5 도톤보리 ─ 📍6 신사이바시       │
│                                         │
│  Day: [1] [2] [3] [4] [전체]           │
│  표시: [일정] [장소] [사진] [동선]      │
└─────────────────────────────────────────┘
```

- **일정 핀**: Day별 일정을 지도 위 핀으로 표시
- **동선 시각화**: 일정 순서대로 경로 라인 표시
- **장소 핀**: 저장한 장소/맛집/관광지 표시
- **사진 핀**: 촬영 위치에 사진 썸네일 표시
- **Day 필터**: Day별 또는 전체 보기 전환
- **클릭 상세**: 핀 클릭 시 상세 정보 팝업

### 2.10 활동 피드 (Activity Feed) ← NEW
```
오늘
  🕐 14:32  Joshua가 Day 2 일정에 "이치란 라멘"을 추가했습니다
  🕐 14:15  Mina가 사진 5장을 업로드했습니다
  🕐 13:50  Guide Kim이 Day 3 일정을 수정했습니다
  🕐 12:00  Mom이 댓글을 남겼습니다: "맛있겠다!"

어제
  🕐 22:10  Joshua가 여행 기록을 작성했습니다
  🕐 18:00  Mina가 경비 "저녁식사 ¥4,500"을 추가했습니다
```

- **타임라인 형식**: 최신순 활동 내역 표시
- **필터링**: 전체 / 일정 / 사진 / 기록 / 경비 / 멤버
- **사용자 필터**: 특정 참여자의 활동만 보기
- **링크 연결**: 활동 항목 클릭 시 해당 상세 페이지로 이동
- **읽음 표시**: 새로운 활동에 뱃지 표시

### 2.11 사용자 설정 (User Settings) ← NEW (검토 반영)
```
┌─────────────────────────────────────┐
│  ⚙️ 설정                            │
├─────────────────────────────────────┤
│                                     │
│  👤 프로필                           │
│     이름: Joshua Kim                │
│     이메일: joshua@email.com        │
│     프로필 사진: [변경]             │
│                                     │
│  🔐 보안                            │
│     비밀번호 변경                    │
│     이메일 변경                      │
│                                     │
│  🔔 알림 설정                        │
│     일정 변경 알림    [ON]          │
│     새 사진 업로드    [ON]          │
│     채팅 메시지       [ON]          │
│     댓글/멘션         [ON]          │
│     경비 변경         [OFF]         │
│     위치 관련         [ON]          │
│     이메일 알림       [OFF]         │
│                                     │
│  🌐 일반                            │
│     언어: 한국어                     │
│     시간대: Asia/Seoul (자동)       │
│     통화 기본값: KRW                │
│                                     │
│  🚨 비상 정보 (v2.0)                │
│     혈액형, 알레르기, 비상연락처     │
│                                     │
│  🗑️ 계정                            │
│     계정 삭제 (데이터 영구 삭제)     │
│                                     │
└─────────────────────────────────────┘
```

- **프로필 관리**: 이름, 프로필 사진, 이메일 변경
- **비밀번호 변경**: 기존 비밀번호 확인 후 변경
- **알림 설정**: 카테고리별 푸시/이메일 알림 ON/OFF
- **일반 설정**: 언어, 시간대, 기본 통화
- **비상 정보**: 혈액형, 알레르기, 비상 연락처 (v2.0 긴급정보 연동)
- **계정 삭제**: 모든 데이터 영구 삭제 (30일 유예기간)

### ═══════════════════════════════════════
### v1.1 — 사용 경험 강화
### ═══════════════════════════════════════

### 2.12 채팅 (Trip Chat) ← NEW
```
┌─────────────────────────────────────┐
│  💬 오사카 벚꽃여행 채팅      👥 4  │
├─────────────────────────────────────┤
│                                     │
│  Joshua (14:32)                     │
│  이치란 라멘 줄이 엄청 길대...       │
│  점심 일정 바꿀까?                   │
│                                     │
│  Mina (14:33)                       │
│  그러자! 먼저 오사카성 가고 나중에    │
│  가면 줄 줄어들지 않을까?             │
│                                     │
│  Guide Kim (14:35)                  │
│  오후 3시 이후면 대기가 짧아요 👍    │
│  📎 [일정 수정 제안: Day 2]         │
│                                     │
│  Mom (14:40)                        │
│  맛있는 거 많이 먹어! ❤️            │
│                                     │
├─────────────────────────────────────┤
│  [메시지 입력...]          [전송]   │
└─────────────────────────────────────┘
```

- **그룹 채팅**: 여행 단위 그룹 채팅방 자동 생성
- **실시간 메시지**: Socket.io 기반 즉시 전달
- **미디어 공유**: 사진/파일 전송 가능
- **일정 연동**: 채팅에서 일정 링크 공유 + 수정 제안
- **읽음 확인**: 메시지 읽은 사람 수 표시
- **알림 설정**: 채팅방별 알림 ON/OFF
- **메시지 검색**: 채팅 내 키워드 검색
- **고정 메시지**: 중요 메시지 상단 고정 (핀)

### 2.13 날씨 정보 (Weather) ← NEW
```
┌─────────────────────────────────────┐
│  🌤️ 오사카 날씨 예보                │
├─────────────────────────────────────┤
│  Day 1 (3/20)  ☀️ 맑음  12°/22°   │
│  Day 2 (3/21)  ⛅ 구름  10°/18°   │
│  Day 3 (3/22)  🌧️ 비    8°/15°   │ ⚠️ 우산 챙기세요!
│  Day 4 (3/23)  ☀️ 맑음  11°/20°   │
│  Day 5 (3/24)  ☀️ 맑음  13°/23°   │
└─────────────────────────────────────┘
```

- **여행지 날씨**: 일정 기간의 날씨 예보 표시
- **일정 옆 표시**: 각 Day 타임라인에 날씨 아이콘 통합
- **날씨 알림**: 비/눈 예보 시 자동 알림 + 준비물 제안
- **외부 API 연동**: OpenWeatherMap API
- **과거 날씨**: 완료된 여행은 실제 날씨 기록 저장

### 2.14 여행 리포트 / 내보내기 (Export) ← NEW
```
내보내기 옵션:
┌─────────────────────────────────────┐
│  📊 여행 리포트 생성                 │
├─────────────────────────────────────┤
│                                     │
│  📑 PDF 포토북                      │
│     일정 + 사진 + 기록을 예쁜       │
│     PDF 포토북으로 생성              │
│                                     │
│  🔗 공유 웹 링크                     │
│     읽기 전용 웹 페이지로 공유       │
│     (비회원도 열람 가능)             │
│                                     │
│  📊 통계 리포트                      │
│     총 경비, 이동거리, 방문장소 등   │
│     여행 통계 요약                   │
│                                     │
│  💾 데이터 백업                      │
│     전체 데이터 JSON 내보내기        │
│                                     │
└─────────────────────────────────────┘
```

- **PDF 포토북**: 일정 + 사진 + 기록 조합 PDF 자동 생성
- **공유 웹 링크**: 비회원도 볼 수 있는 읽기 전용 공유 페이지
- **통계 리포트**: 총 경비, 이동 거리, 방문 장소 수, 사진 수 등
- **데이터 백업**: 전체 여행 데이터 JSON/ZIP 내보내기
- **SNS 공유**: 요약 카드 이미지 자동 생성 (OG 이미지)

### ═══════════════════════════════════════
### v2.0 — 차별화 기능
### ═══════════════════════════════════════

### 2.15 실시간 위치 공유 (Live Location) ← NEW
```
┌─────────────────────────────────────┐
│  📡 실시간 위치                      │
├─────────────────────────────────────┤
│                                     │
│        [지도]                        │
│                                     │
│    🔵 Joshua — 도톤보리 근처         │
│        5분 전 업데이트               │
│                                     │
│    🟢 Mina — 신사이바시              │
│        방금 전                       │
│                                     │
│    ⚫ Guide Kim — 오프라인           │
│        1시간 전                      │
│                                     │
│  [내 위치 공유: 🟢 ON]              │
│  공유 대상: [전체 참여자 ▼]          │
│  배터리 절약 모드: [OFF]             │
│                                     │
└─────────────────────────────────────┘
```

- **선택적 공유**: ON/OFF 토글로 본인 결정
- **공유 대상 설정**: 전체 / Family만 / 특정 사용자
- **배터리 절약 모드**: 업데이트 주기 조절 (1분/5분/15분)
- **위치 기록**: 이동 경로 타임라인으로 기록 (선택적)
- **근접 알림**: 동행자가 근처에 있을 때 알림
- **안심 기능**: Family 역할 사용자가 여행자 위치 확인 가능
- **SOS 버튼**: 긴급 상황 시 모든 참여자에게 현재 위치 공유

### 2.16 오프라인 모드 (Offline Support) ← NEW
```
오프라인 지원 범위:
┌──────────────────┬────────┬─────────┐
│ 기능              │ 읽기   │ 쓰기    │
├──────────────────┼────────┼─────────┤
│ 일정 보기/수정    │  ✅    │  ✅*    │
│ 여행 기록 보기    │  ✅    │  ✅*    │
│ 사진 보기 (캐시)  │  ✅    │  ❌     │
│ 문서 보관함       │  ✅    │  ❌     │
│ 체크리스트        │  ✅    │  ✅*    │
│ 지도 (캐시)       │  ✅    │  ❌     │
│ 채팅              │  ✅    │  ✅*    │
│ 경비 추가         │  ✅    │  ✅*    │
├──────────────────┴────────┴─────────┤
│ * 오프라인 수정은 큐에 저장 후       │
│   온라인 복귀 시 자동 동기화         │
└─────────────────────────────────────┘
```

- **미리 다운로드**: 여행 출발 전 일정/지도/문서 사전 다운로드
- **오프라인 수정 큐**: 오프라인에서 수정한 내용을 큐에 저장
- **자동 동기화**: 네트워크 복귀 시 자동 동기화 + 충돌 해결
- **지도 캐싱**: 여행지 지역 지도 타일 사전 다운로드
- **사진 캐싱**: 최근 사진 썸네일 로컬 캐싱
- **동기화 상태**: 동기화 대기중/완료 상태 표시

### 2.17 여행 템플릿 (Trip Templates) ← NEW
```
┌─────────────────────────────────────┐
│  📋 여행 템플릿                      │
├─────────────────────────────────────┤
│                                     │
│  🔥 인기 템플릿                      │
│  ┌──────────┐ ┌──────────┐         │
│  │ 🇯🇵 3박4일 │ │ 🇹🇭 4박5일 │         │
│  │ 오사카    │ │ 방콕     │         │
│  │ 기본코스  │ │ 맛집투어 │         │
│  │ ★4.8 320│ │ ★4.6 245│         │
│  └──────────┘ └──────────┘         │
│                                     │
│  📌 내 템플릿                        │
│  ┌──────────┐                       │
│  │ 🇮🇹 7일   │  ← 완료된 여행에서    │
│  │ 이탈리아  │    템플릿화            │
│  │ 신혼여행  │                       │
│  └──────────┘                       │
│                                     │
│  [+ 템플릿 만들기]                   │
└─────────────────────────────────────┘
```

- **공식 템플릿**: 인기 여행지별 추천 일정 템플릿
- **커뮤니티 템플릿**: 다른 사용자가 공유한 여행 템플릿
- **내 템플릿**: 완료된 여행을 템플릿으로 저장
- **템플릿 적용**: 한 클릭으로 새 여행에 일정/장소/체크리스트 복사
- **평점/리뷰**: 템플릿에 평점 및 후기
- **커스터마이즈**: 템플릿 적용 후 자유롭게 수정

### 2.18 긴급 정보 (Emergency Info) ← NEW
```
┌─────────────────────────────────────┐
│  🚨 긴급 정보 — 일본 오사카          │
├─────────────────────────────────────┤
│                                     │
│  📞 긴급 전화                        │
│     경찰: 110                       │
│     소방/구급: 119                   │
│     관광경찰: 03-3501-0110          │
│                                     │
│  🏛️ 한국 대사관/영사관              │
│     주오사카 총영사관                │
│     06-6213-1401                    │
│     오사카시 주오구 니시신사이바시... │
│     [지도에서 보기]                  │
│                                     │
│  🏥 가까운 병원                      │
│     오사카 종합의료센터 (2.3km)      │
│     06-6929-1221                    │
│     [지도에서 보기] [전화걸기]       │
│                                     │
│  🛡️ 여행자 보험                     │
│     삼성화재 해외여행보험             │
│     증권번호: XXXX-XXXX             │
│     긴급연락처: 1588-5114           │
│     [보험증서 보기]                  │
│                                     │
│  📋 개인 비상 연락처                 │
│     비상연락인: 어머니 010-XXXX      │
│     혈액형: A+                      │
│     알레르기: 없음                   │
│                                     │
│  [SOS 긴급 공유]                    │
│  → 모든 참여자에게 현재 위치 전송    │
└─────────────────────────────────────┘
```

- **국가별 긴급 번호**: 여행지 국가의 경찰/소방/구급 번호 자동 표시
- **대사관 정보**: 가장 가까운 한국 대사관/영사관 연락처 + 위치
- **근처 병원**: 현재 위치 기반 가까운 병원 표시
- **보험 정보**: 여행자 보험 증서 연동 (문서 보관함)
- **개인 비상 정보**: 혈액형, 알레르기, 비상 연락처
- **SOS 기능**: 긴급 시 모든 참여자에게 위치 + 알림 전송
- **오프라인 접근**: 긴급 정보는 항상 오프라인에서도 접근 가능

---

## 3. 기술 아키텍처

### 3.1 Tech Stack

```
┌──────────────────────────────────────────────────┐
│                    Frontend                       │
│  React 18 + TypeScript + Tailwind CSS             │
│  Zustand (상태관리) + React Query (서버상태)       │
│  Socket.io-client (실시간)                        │
│  Mapbox GL JS (지도)                    ← NEW     │
│  Service Worker + IndexedDB (오프라인)   ← NEW     │
└───────────────────┬──────────────────────────────┘
                    │ REST API + WebSocket
┌───────────────────┴──────────────────────────────┐
│                    Backend                        │
│  Node.js + Express + TypeScript                   │
│  Socket.io (실시간 동기화 + 채팅)                 │
│  Multer + Sharp (이미지 처리)                     │
│  JWT (인증)                                       │
│  node-cron (스케줄 작업)                ← NEW     │
│  PDFKit (리포트 생성)                   ← NEW     │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────┴──────────────────────────────┐
│                  Database & Storage               │
│  PostgreSQL (메인 DB)                             │
│  Prisma ORM                                       │
│  Redis (세션/캐시/실시간 상태/채팅 메시지 큐)     │
│  Local FileSystem or S3 (파일/사진/문서 저장)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                 External APIs                     │
│  OpenWeatherMap (날씨)                  ← NEW     │
│  Mapbox / Google Maps (지도/지오코딩)   ← NEW     │
│  Nodemailer (이메일 초대)                         │
│  외교부 API (대사관 정보)               ← NEW     │
└──────────────────────────────────────────────────┘
```

### 3.2 주요 기술 선택 이유

| 기술 | 선택 이유 |
|------|----------|
| **React + TypeScript** | 컴포넌트 재사용, 타입 안정성, 생태계 |
| **Tailwind CSS** | 미니멀 디자인 빠른 구현, 일관된 스타일 |
| **Express** | 가볍고 유연한 API 서버 |
| **Socket.io** | 안정적 실시간 양방향 통신 (일정 동기화 + 채팅) |
| **PostgreSQL** | 관계형 데이터에 최적, JSON/PostGIS 지원 |
| **Prisma** | 타입 안전한 ORM, 마이그레이션 관리 |
| **Redis** | 실시간 접속 상태, 세션 캐시, 채팅 메시지 큐 |
| **Sharp** | 빠른 이미지 리사이즈/썸네일 생성 |
| **Mapbox GL JS** | 고성능 벡터 맵, 오프라인 지도 지원, 커스텀 스타일 |
| **IndexedDB** | 오프라인 데이터 저장, 대용량 지원 |
| **PDFKit** | 서버 사이드 PDF 포토북 생성 |

---

## 4. 데이터베이스 스키마

### 4.1 ERD 구조

```
Users ──┐
        ├──< TripMembers >──┤
Trips ──┘                   │
  │                         │
  ├──< Schedules            │
  ├──< Journals ──< JournalPhotos
  ├──< Photos               │
  ├──< Places               │
  ├──< Budgets              │
  ├──< Comments             │
  ├──< Checklists ──< ChecklistItems    ← NEW
  ├──< Documents                        ← NEW
  ├──< ChatMessages                     ← NEW
  └──< LocationShares                   ← NEW
                            │
Notifications ──────────────┘
ActivityLogs ───────────────            ← NEW
TripTemplates ──────────────            ← NEW
EmergencyInfos ─────────────            ← NEW
```

### 4.2 테이블 상세

```sql
-- ============================================
-- 기존 테이블 (v1.0 기본)
-- ============================================

-- 사용자
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  blood_type    VARCHAR(5),                              -- ← NEW (v2.0 긴급정보)
  allergies     TEXT,                                     -- ← NEW
  emergency_contact_name  VARCHAR(100),                   -- ← NEW
  emergency_contact_phone VARCHAR(20),                    -- ← NEW
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 여행 (폴더)
CREATE TABLE trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  country       VARCHAR(100),
  city          VARCHAR(100),
  start_date    DATE,
  end_date      DATE,
  status        VARCHAR(20) DEFAULT 'planning',
  tags          TEXT[],
  share_token   VARCHAR(64) UNIQUE,                      -- ← NEW (v1.1 공유링크)
  is_template   BOOLEAN DEFAULT FALSE,                   -- ← NEW (v2.0 템플릿)
  template_source_id UUID REFERENCES trips(id),          -- ← NEW
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 여행 참여자
CREATE TABLE trip_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- 일정
CREATE TABLE schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number    INT NOT NULL,
  date          DATE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  start_time    TIME,
  end_time      TIME,
  location_name VARCHAR(200),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  category      VARCHAR(50),
  sort_order    INT DEFAULT 0,
  weather_icon  VARCHAR(20),                             -- ← NEW (v1.1 날씨)
  weather_temp_min DECIMAL(4,1),                         -- ← NEW
  weather_temp_max DECIMAL(4,1),                         -- ← NEW
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 여행 기록 (저널)
CREATE TABLE journals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES users(id),
  date          DATE NOT NULL,
  title         VARCHAR(200),
  content       TEXT,
  mood          VARCHAR(20),
  location_name VARCHAR(200),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 사진
CREATE TABLE photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  uploader_id   UUID REFERENCES users(id),
  journal_id    UUID REFERENCES journals(id),
  file_path     TEXT NOT NULL,
  thumbnail_path TEXT,
  medium_path   TEXT,                                    -- ← NEW (중간 사이즈)
  file_name     VARCHAR(255),
  file_size     BIGINT,
  mime_type     VARCHAR(50),
  width         INT,
  height        INT,
  taken_at      TIMESTAMPTZ,
  location_name VARCHAR(200),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 장소
CREATE TABLE places (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  address       TEXT,
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  category      VARCHAR(50),
  notes         TEXT,
  rating        SMALLINT,
  added_by      UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 경비
CREATE TABLE budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  paid_by       UUID REFERENCES users(id),
  title         VARCHAR(200) NOT NULL,
  amount        DECIMAL(12, 2) NOT NULL,
  currency      VARCHAR(3) DEFAULT 'KRW',
  category      VARCHAR(50),
  date          DATE,
  split_among   UUID[],
  receipt_photo_id UUID REFERENCES photos(id),           -- ← NEW (영수증 사진)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글
CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  target_type   VARCHAR(20) NOT NULL,
  target_id     UUID NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 알림
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id       UUID REFERENCES trips(id),
  type          VARCHAR(50) NOT NULL,
  title         VARCHAR(200),
  message       TEXT,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 신규 테이블 (MVP 추가분)
-- ============================================

-- 체크리스트
CREATE TABLE checklists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,                   -- "준비물", "할일", "예약확인"
  category      VARCHAR(50) DEFAULT 'general',           -- packing, todo, reservation, etc
  sort_order    INT DEFAULT 0,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 체크리스트 항목
CREATE TABLE checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID REFERENCES checklists(id) ON DELETE CASCADE,
  title         VARCHAR(300) NOT NULL,
  is_checked    BOOLEAN DEFAULT FALSE,
  checked_by    UUID REFERENCES users(id),
  checked_at    TIMESTAMPTZ,
  assigned_to   UUID REFERENCES users(id),               -- 담당자
  due_date      DATE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 문서 보관함
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  uploader_id   UUID REFERENCES users(id),
  title         VARCHAR(200) NOT NULL,
  file_path     TEXT NOT NULL,
  file_name     VARCHAR(255),
  file_size     BIGINT,
  mime_type     VARCHAR(50),
  category      VARCHAR(50),                             -- flight, hotel, insurance, visa, transport, etc
  visibility    VARCHAR(20) DEFAULT 'all',               -- all, travelers, private
  is_cached     BOOLEAN DEFAULT FALSE,                   -- 오프라인 캐시 여부
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 활동 로그
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  action        VARCHAR(50) NOT NULL,                    -- created, updated, deleted, uploaded, joined, etc
  target_type   VARCHAR(30) NOT NULL,                    -- schedule, journal, photo, member, budget, checklist, etc
  target_id     UUID,
  description   TEXT,                                    -- 사람이 읽을 수 있는 설명
  metadata      JSONB,                                   -- 추가 데이터 (변경 전/후 등)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 신규 테이블 (v1.1 추가분)
-- ============================================

-- 채팅 메시지
CREATE TABLE chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  sender_id     UUID REFERENCES users(id),
  content       TEXT,
  message_type  VARCHAR(20) DEFAULT 'text',              -- text, image, file, schedule_link, system
  attachment_url TEXT,
  reply_to_id   UUID REFERENCES chat_messages(id),       -- 답장 대상
  is_pinned     BOOLEAN DEFAULT FALSE,
  read_by       UUID[] DEFAULT '{}',                     -- 읽은 사용자 ID 배열
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 날씨 캐시
CREATE TABLE weather_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  location_name VARCHAR(200),
  latitude      DECIMAL(10, 8),
  longitude     DECIMAL(11, 8),
  icon          VARCHAR(20),                             -- sunny, cloudy, rainy, snowy, etc
  temp_min      DECIMAL(4, 1),
  temp_max      DECIMAL(4, 1),
  humidity      INT,
  description   VARCHAR(200),
  fetched_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, date)
);

-- 공유 링크
CREATE TABLE share_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  token         VARCHAR(64) UNIQUE NOT NULL,
  link_type     VARCHAR(20) NOT NULL,                    -- invite (초대) / view (읽기전용 공유)
  role          VARCHAR(20),                             -- invite일 경우 부여할 역할
  expires_at    TIMESTAMPTZ,
  max_uses      INT,
  use_count     INT DEFAULT 0,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 신규 테이블 (v2.0 추가분)
-- ============================================

-- 실시간 위치 공유
CREATE TABLE location_shares (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  latitude      DECIMAL(10, 8) NOT NULL,
  longitude     DECIMAL(11, 8) NOT NULL,
  accuracy      DECIMAL(8, 2),                           -- 정확도 (미터)
  is_sharing     BOOLEAN DEFAULT TRUE,
  share_scope   VARCHAR(20) DEFAULT 'all',               -- all, family, custom
  share_with    UUID[],                                  -- custom일 때 대상 목록
  battery_saver BOOLEAN DEFAULT FALSE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 위치 히스토리 (이동 경로 기록)
CREATE TABLE location_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  latitude      DECIMAL(10, 8) NOT NULL,
  longitude     DECIMAL(11, 8) NOT NULL,
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 여행 템플릿 메타데이터
CREATE TABLE trip_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_trip_id UUID REFERENCES trips(id),              -- 원본 여행
  created_by    UUID REFERENCES users(id),
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  country       VARCHAR(100),
  city          VARCHAR(100),
  duration_days INT,
  cover_image   TEXT,
  tags          TEXT[],
  is_public     BOOLEAN DEFAULT FALSE,                   -- 커뮤니티 공개 여부
  is_official   BOOLEAN DEFAULT FALSE,                   -- 공식 템플릿 여부
  rating_avg    DECIMAL(2, 1) DEFAULT 0,
  rating_count  INT DEFAULT 0,
  use_count     INT DEFAULT 0,                           -- 사용 횟수
  template_data JSONB NOT NULL,                          -- 일정/장소/체크리스트 스냅샷
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 템플릿 리뷰
CREATE TABLE template_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES trip_templates(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- 긴급 정보
CREATE TABLE emergency_infos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  country       VARCHAR(100) NOT NULL,
  police_number VARCHAR(20),
  fire_number   VARCHAR(20),
  ambulance_number VARCHAR(20),
  tourist_police VARCHAR(20),
  embassy_name  VARCHAR(200),
  embassy_phone VARCHAR(20),
  embassy_address TEXT,
  embassy_latitude  DECIMAL(10, 8),
  embassy_longitude DECIMAL(11, 8),
  insurance_info JSONB,                                  -- 보험 정보 JSON
  custom_contacts JSONB,                                 -- 추가 비상연락처 JSON
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 오프라인 동기화 큐 (서버 사이드 추적용)
CREATE TABLE sync_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id       UUID REFERENCES trips(id) ON DELETE CASCADE,
  action        VARCHAR(20) NOT NULL,                    -- create, update, delete
  target_type   VARCHAR(30) NOT NULL,
  target_id     UUID,
  payload       JSONB NOT NULL,
  client_timestamp TIMESTAMPTZ NOT NULL,                 -- 클라이언트 수정 시각
  synced_at     TIMESTAMPTZ,                             -- 서버 동기화 시각
  conflict      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 인덱스
-- ============================================

CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON trip_members(user_id);
CREATE INDEX idx_schedules_trip_day ON schedules(trip_id, day_number);
CREATE INDEX idx_journals_trip_date ON journals(trip_id, date);
CREATE INDEX idx_photos_trip ON photos(trip_id);
CREATE INDEX idx_photos_taken_at ON photos(taken_at);
CREATE INDEX idx_budgets_trip ON budgets(trip_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX idx_documents_trip ON documents(trip_id);
CREATE INDEX idx_activity_logs_trip ON activity_logs(trip_id, created_at DESC);
CREATE INDEX idx_chat_messages_trip ON chat_messages(trip_id, created_at);
CREATE INDEX idx_location_shares_trip ON location_shares(trip_id);
CREATE INDEX idx_location_history_trip_user ON location_history(trip_id, user_id, recorded_at);
CREATE INDEX idx_trip_templates_public ON trip_templates(is_public, rating_avg DESC);
CREATE INDEX idx_sync_queue_user ON sync_queue(user_id, synced_at NULLS FIRST);
```

---

## 5. API 설계

### 5.1 인증 (Auth)
```
POST   /api/auth/register           회원가입
POST   /api/auth/login              로그인
POST   /api/auth/logout             로그아웃
GET    /api/auth/me                 내 정보
PUT    /api/auth/me                 내 정보 수정 (비상정보 포함)
POST   /api/auth/refresh            토큰 갱신
POST   /api/auth/forgot-password    비밀번호 재설정 메일 발송 ← NEW (#3)
POST   /api/auth/reset-password     비밀번호 재설정 (토큰 기반) ← NEW (#3)
POST   /api/auth/verify-email       이메일 인증 확인 ← NEW (#3)
POST   /api/auth/resend-verification 이메일 인증 재발송 ← NEW (#3)
PUT    /api/auth/change-password    비밀번호 변경 (로그인 상태) ← NEW (#2)
DELETE /api/auth/account            계정 삭제 요청 (30일 유예) ← NEW (#2)
```

### 5.1.1 사용자 설정 (User Settings) ← NEW (#2)
```
GET    /api/settings/profile         프로필 조회
PUT    /api/settings/profile         프로필 수정 (이름/아바타)
PUT    /api/settings/email           이메일 변경 (재인증 필요)
GET    /api/settings/notifications   알림 설정 조회
PUT    /api/settings/notifications   알림 설정 변경
GET    /api/settings/preferences     일반 설정 조회 (언어/시간대/통화)
PUT    /api/settings/preferences     일반 설정 변경
POST   /api/settings/avatar          프로필 사진 업로드
```

### 5.2 여행 (Trips)
```
GET    /api/trips                 내 여행 목록
POST   /api/trips                 여행 생성
GET    /api/trips/:id             여행 상세
PUT    /api/trips/:id             여행 수정
DELETE /api/trips/:id             여행 삭제
POST   /api/trips/:id/duplicate   여행 복제
PUT    /api/trips/:id/status      상태 변경
GET    /api/trips/:id/feed        활동 피드 ← NEW
GET    /api/trips/:id/stats       여행 통계 ← NEW
```

### 5.3 참여자 (Members)
```
GET    /api/trips/:id/members               참여자 목록
POST   /api/trips/:id/members/invite        초대 (이메일)
POST   /api/trips/:id/members/link          초대 링크 생성
POST   /api/trips/:id/members/join/:token   초대 링크로 참여
PUT    /api/trips/:id/members/:uid          역할 변경
DELETE /api/trips/:id/members/:uid          참여자 제거
POST   /api/trips/:id/members/leave         본인 여행 탈퇴 ← NEW (#6)
```

**초대 플로우 상세** ← NEW (#6)
```
이메일 초대:
  1. Owner가 POST /invite → 초대 이메일 발송
  2. 수신자가 이메일 링크 클릭
  3. 기존 회원 → 로그인 후 자동 참여
     비회원 → 회원가입 → 자동 참여
  4. 참여 완료 시 모든 멤버에게 알림

링크 초대:
  1. Owner가 POST /link → 초대 링크 생성 (만료시간/최대사용횟수 설정)
  2. 링크를 카카오톡 등으로 공유
  3. 수신자가 링크 클릭 → GET /api/invite/:token/info (역할/여행 정보 미리보기)
  4. 수락: POST /join/:token → 참여 완료
     거절: 아무 행동 안함 (별도 거절 API 불필요)
```

### 5.4 일정 (Schedules)
```
GET    /api/trips/:id/schedules              전체 일정
GET    /api/trips/:id/schedules?day=1        Day별 일정
POST   /api/trips/:id/schedules              일정 추가
PUT    /api/trips/:id/schedules/:sid         일정 수정
DELETE /api/trips/:id/schedules/:sid         일정 삭제
PUT    /api/trips/:id/schedules/reorder      순서 변경
```

### 5.5 기록 (Journals)
```
GET    /api/trips/:id/journals               기록 목록
POST   /api/trips/:id/journals               기록 작성
GET    /api/trips/:id/journals/:jid          기록 상세
PUT    /api/trips/:id/journals/:jid          기록 수정
DELETE /api/trips/:id/journals/:jid          기록 삭제
```

### 5.6 사진 (Photos)
```
GET    /api/trips/:id/photos                 사진 목록 (필터: 날짜/장소)
POST   /api/trips/:id/photos                 사진 업로드 (multipart)
GET    /api/trips/:id/photos/:pid            사진 상세
PUT    /api/trips/:id/photos/:pid            사진 수정 (캡션/위치태그) ← NEW (#7)
DELETE /api/trips/:id/photos/:pid            사진 삭제
GET    /api/trips/:id/photos/:pid/download   사진 다운로드
POST   /api/trips/:id/photos/bulk-download   일괄 다운로드
```

### 5.6.1 장소 (Places) ← NEW (#4)
```
GET    /api/trips/:id/places                 장소 목록 (카테고리 필터)
POST   /api/trips/:id/places                 장소 추가
GET    /api/trips/:id/places/:pid            장소 상세
PUT    /api/trips/:id/places/:pid            장소 수정
DELETE /api/trips/:id/places/:pid            장소 삭제
```

### 5.7 경비 (Budgets)
```
GET    /api/trips/:id/budgets                경비 목록
POST   /api/trips/:id/budgets                경비 추가
PUT    /api/trips/:id/budgets/:bid           경비 수정
DELETE /api/trips/:id/budgets/:bid           경비 삭제
GET    /api/trips/:id/budgets/summary        정산 요약
```

### 5.8 체크리스트 (Checklists) ← NEW
```
GET    /api/trips/:id/checklists                    체크리스트 목록
POST   /api/trips/:id/checklists                    체크리스트 생성
PUT    /api/trips/:id/checklists/:cid               체크리스트 수정
DELETE /api/trips/:id/checklists/:cid               체크리스트 삭제
POST   /api/trips/:id/checklists/:cid/items         항목 추가
PUT    /api/trips/:id/checklists/:cid/items/:iid    항목 수정 (체크/해제/담당자)
DELETE /api/trips/:id/checklists/:cid/items/:iid    항목 삭제
PUT    /api/trips/:id/checklists/:cid/items/reorder 항목 순서 변경
```

### 5.9 문서 보관함 (Documents) ← NEW
```
GET    /api/trips/:id/documents              문서 목록
POST   /api/trips/:id/documents              문서 업로드 (multipart)
GET    /api/trips/:id/documents/:did         문서 상세/다운로드
PUT    /api/trips/:id/documents/:did         문서 정보 수정
DELETE /api/trips/:id/documents/:did         문서 삭제
```

### 5.10 채팅 (Chat) ← NEW (v1.1)
```
GET    /api/trips/:id/chat/messages          메시지 목록 (페이지네이션)
GET    /api/trips/:id/chat/messages/search   메시지 검색
PUT    /api/trips/:id/chat/messages/:mid/pin 메시지 고정/해제
GET    /api/trips/:id/chat/pinned            고정 메시지 목록
```
*실시간 메시지 전송/수신은 WebSocket으로 처리*

### 5.11 날씨 (Weather) ← NEW (v1.1)
```
GET    /api/trips/:id/weather                여행 기간 날씨 예보
GET    /api/weather?lat=...&lon=...&date=... 특정 좌표/날짜 날씨
```

### 5.12 내보내기 (Export) ← NEW (v1.1)
```
POST   /api/trips/:id/export/pdf             PDF 포토북 생성
POST   /api/trips/:id/export/share-link      공유 웹 링크 생성
GET    /api/trips/:id/export/stats            통계 리포트
GET    /api/trips/:id/export/backup           전체 데이터 백업 (JSON)
GET    /api/share/:token                      공유 링크로 여행 열람
```

### 5.13 위치 공유 (Location) ← NEW (v2.0)
```
PUT    /api/trips/:id/location/share         위치 공유 설정 (ON/OFF/범위)
GET    /api/trips/:id/location/members       참여자 현재 위치
GET    /api/trips/:id/location/history/:uid  위치 히스토리
POST   /api/trips/:id/location/sos           SOS 긴급 공유
```
*실시간 위치 업데이트는 WebSocket으로 처리*

### 5.14 템플릿 (Templates) ← NEW (v2.0)
```
GET    /api/templates                        공개 템플릿 목록 (검색/필터)
GET    /api/templates/:tid                   템플릿 상세
POST   /api/templates                        내 여행에서 템플릿 생성
POST   /api/templates/:tid/apply             템플릿으로 새 여행 생성
POST   /api/templates/:tid/review            리뷰 작성
GET    /api/templates/my                     내 템플릿 목록
```

### 5.15 긴급 정보 (Emergency) ← NEW (v2.0)
```
GET    /api/trips/:id/emergency              긴급 정보 조회
PUT    /api/trips/:id/emergency              긴급 정보 수정
GET    /api/emergency/country/:code          국가별 기본 긴급 정보
GET    /api/emergency/hospitals?lat=&lon=    근처 병원 검색
```

### 5.16 오프라인 동기화 (Sync) ← NEW (v2.0)
```
POST   /api/sync/push                        오프라인 변경사항 서버로 전송
GET    /api/sync/pull?since=...              마지막 동기화 이후 변경사항 수신
GET    /api/sync/status                      동기화 상태 확인
```

### 5.17 댓글/알림
```
GET    /api/trips/:id/comments?target=...    댓글 목록
POST   /api/trips/:id/comments               댓글 작성
DELETE /api/trips/:id/comments/:cid          댓글 삭제 (본인만) ← NEW
GET    /api/notifications                    알림 목록
PUT    /api/notifications/:nid/read          읽음 처리
PUT    /api/notifications/read-all           전체 읽음 처리
DELETE /api/notifications/:nid               알림 삭제 ← NEW
```

### 5.18 검색 (Search) ← NEW (#14)
```
GET    /api/search?q=...&scope=...           통합 검색
       scope: trips | schedules | journals | places | photos | all
       예: GET /api/search?q=라멘&scope=all
GET    /api/trips/:id/search?q=...           여행 내 검색 (일정/기록/장소/사진 캡션)
```
- **검색 구현**: PostgreSQL Full-Text Search (to_tsvector/to_tsquery) 기반
- **한국어 지원**: pg_bigm 확장 또는 trigram 인덱스 사용
- **인덱싱 대상**: trips.title, schedules.title/description, journals.title/content, places.name/notes, photos.caption

---

## 6. 실시간 동기화 (WebSocket Events)

### 6.1 이벤트 설계

```javascript
// ── 연결 ──
socket.emit('join_trip', { tripId })
socket.emit('leave_trip', { tripId })

// ── 일정 ──
'schedule:created'
'schedule:updated'
'schedule:deleted'
'schedule:reordered'

// ── 기록 ──
'journal:created'
'journal:updated'

// ── 사진 ──
'photo:uploaded'
'photo:deleted'

// ── 참여자 ──
'member:joined'
'member:left'
'member:role_changed'

// ── 댓글 ──
'comment:created'

// ── 경비 ──
'budget:created'
'budget:updated'
'budget:deleted'

// ── 접속 상태 ──
'user:online'
'user:offline'

// ── 체크리스트 (MVP) ← NEW ──
'checklist:item_checked'
'checklist:item_unchecked'
'checklist:item_created'
'checklist:item_deleted'
'checklist:item_assigned'

// ── 문서 (MVP) ← NEW ──
'document:uploaded'
'document:deleted'

// ── 활동 피드 (MVP) ← NEW ──
'activity:new'                  // 새 활동 로그 발생 시 피드에 즉시 반영

// ── 채팅 (v1.1) ← NEW ──
'chat:message'                  // 새 메시지
'chat:typing'                   // 타이핑 중 표시
'chat:read'                     // 메시지 읽음
'chat:pinned'                   // 메시지 고정

// ── 위치 (v2.0) ← NEW ──
'location:update'               // 위치 업데이트
'location:sharing_started'      // 위치 공유 시작
'location:sharing_stopped'      // 위치 공유 중지
'location:sos'                  // SOS 긴급 알림

// ── 오프라인 동기화 (v2.0) ← NEW ──
'sync:conflict'                 // 동기화 충돌 발생
'sync:completed'                // 동기화 완료
```

### 6.2 동기화 전략
- **Optimistic Update**: UI 먼저 업데이트 후 서버 확인
- **Conflict Resolution**: Last Write Wins + 타임스탬프 기반
- **Reconnection**: 자동 재연결 시 마지막 동기화 이후 변경사항 일괄 수신
- **Offline Queue**: IndexedDB에 오프라인 변경 큐 저장 → 온라인 복귀 시 순차 전송 ← NEW
- **채팅 전송 보장**: Redis 메시지 큐를 통한 전달 보장 ← NEW

---

## 7. 프로젝트 구조

```
tripsync/
├── client/                              # Frontend
│   ├── public/
│   │   └── sw.js                        # Service Worker (오프라인) ← NEW
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Button, Modal, Input, Badge, Toast 등
│   │   │   ├── layout/                  # Header, Sidebar, Layout
│   │   │   ├── trip/                    # TripCard, TripList, TripFolder
│   │   │   ├── schedule/               # ScheduleTimeline, ScheduleCard
│   │   │   ├── journal/                # JournalEditor, JournalCard
│   │   │   ├── gallery/                # PhotoGrid, PhotoViewer, Upload
│   │   │   ├── members/                # MemberList, InviteModal, OnlineStatus
│   │   │   ├── budget/                 # BudgetTable, SplitCalculator, PieChart
│   │   │   ├── checklist/              # ChecklistGroup, ChecklistItem ← NEW
│   │   │   ├── documents/              # DocumentList, DocumentUpload ← NEW
│   │   │   ├── map/                    # MapView, MapPin, RouteLayer ← NEW
│   │   │   ├── feed/                   # ActivityFeed, FeedItem ← NEW
│   │   │   ├── chat/                   # ChatRoom, ChatMessage, ChatInput ← NEW (v1.1)
│   │   │   ├── weather/                # WeatherCard, WeatherBadge ← NEW (v1.1)
│   │   │   ├── export/                 # ExportModal, ShareLink ← NEW (v1.1)
│   │   │   ├── location/               # LiveMap, LocationToggle ← NEW (v2.0)
│   │   │   ├── templates/              # TemplateCard, TemplateGallery ← NEW (v2.0)
│   │   │   └── emergency/              # EmergencyPanel, SOSButton ← NEW (v2.0)
│   │   ├── pages/
│   │   │   ├── HomePage.tsx             # 여행 목록 (대시보드)
│   │   │   ├── TripPage.tsx             # 여행 상세 (폴더 뷰)
│   │   │   ├── SchedulePage.tsx         # 일정 관리
│   │   │   ├── JournalPage.tsx          # 여행 기록
│   │   │   ├── GalleryPage.tsx          # 사진 갤러리
│   │   │   ├── MembersPage.tsx          # 참여자 관리
│   │   │   ├── BudgetPage.tsx           # 경비 관리
│   │   │   ├── ChecklistPage.tsx        # 체크리스트 ← NEW
│   │   │   ├── DocumentsPage.tsx        # 문서 보관함 ← NEW
│   │   │   ├── MapPage.tsx              # 지도 뷰 ← NEW
│   │   │   ├── FeedPage.tsx             # 활동 피드 ← NEW
│   │   │   ├── ChatPage.tsx             # 채팅 ← NEW (v1.1)
│   │   │   ├── TemplateBrowsePage.tsx   # 템플릿 탐색 ← NEW (v2.0)
│   │   │   ├── EmergencyPage.tsx        # 긴급 정보 ← NEW (v2.0)
│   │   │   ├── ShareViewPage.tsx        # 공유 링크 열람 ← NEW (v1.1)
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── hooks/
│   │   │   ├── useTrips.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts              # ← NEW (v1.1)
│   │   │   ├── useLocation.ts          # ← NEW (v2.0)
│   │   │   ├── useOffline.ts           # ← NEW (v2.0)
│   │   │   └── useWeather.ts           # ← NEW (v1.1)
│   │   ├── stores/                      # Zustand stores
│   │   ├── services/                    # API 호출 함수
│   │   ├── socket/                      # Socket.io 연결 관리
│   │   ├── offline/                     # IndexedDB + Service Worker ← NEW (v2.0)
│   │   ├── types/                       # TypeScript 타입 정의
│   │   ├── utils/
│   │   └── App.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                              # Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── trip.controller.ts
│   │   │   ├── schedule.controller.ts
│   │   │   ├── journal.controller.ts
│   │   │   ├── photo.controller.ts
│   │   │   ├── budget.controller.ts
│   │   │   ├── member.controller.ts
│   │   │   ├── comment.controller.ts
│   │   │   ├── checklist.controller.ts  # ← NEW
│   │   │   ├── document.controller.ts   # ← NEW
│   │   │   ├── feed.controller.ts       # ← NEW
│   │   │   ├── chat.controller.ts       # ← NEW (v1.1)
│   │   │   ├── weather.controller.ts    # ← NEW (v1.1)
│   │   │   ├── export.controller.ts     # ← NEW (v1.1)
│   │   │   ├── location.controller.ts   # ← NEW (v2.0)
│   │   │   ├── template.controller.ts   # ← NEW (v2.0)
│   │   │   ├── emergency.controller.ts  # ← NEW (v2.0)
│   │   │   └── sync.controller.ts       # ← NEW (v2.0)
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── roleGuard.ts            # 역할 기반 권한 체크
│   │   │   ├── upload.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   │   ├── index.ts
│   │   │   ├── tripSync.ts
│   │   │   ├── chat.ts                  # ← NEW (v1.1)
│   │   │   └── location.ts             # ← NEW (v2.0)
│   │   ├── jobs/                        # ← NEW
│   │   │   ├── weatherFetch.ts          # 날씨 데이터 주기적 갱신
│   │   │   └── cleanupExpiredLinks.ts   # 만료된 공유링크 정리
│   │   ├── utils/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/
│   │   ├── photos/
│   │   └── documents/                   # ← NEW
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml                   # PostgreSQL + Redis
└── README.md
```

---

## 8. UI/UX 와이어프레임 (미니멀 스타일)

### 8.1 디자인 원칙
- **색상**: 화이트 베이스 + 네이비 포인트 (#1E3A5F) + 연한 블루 액센트 (#E8F0FE)
- **폰트**: Pretendard (한글) + Inter (영문)
- **간격**: 넉넉한 여백, 카드 기반 레이아웃
- **아이콘**: Lucide Icons (선형, 가벼운 느낌)
- **다크모드**: 차후 지원 고려한 CSS 변수 설계

### 8.2 주요 화면 구성

```
┌──────────────────────────────────────────────────────┐
│  🧭 TripSync          [🔍] [🔔 3] [👤 프로필]       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  내 여행                                [+ 새 여행]   │
│  [전체] [계획중] [진행중] [완료]                       │
│                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ 🇯🇵          │ │ 🇮🇹          │ │ 🇹🇭          │       │
│  │ [표지이미지] │ │ [표지이미지] │ │ [표지이미지] │       │
│  │             │ │             │ │             │       │
│  │ 오사카      │ │ 이탈리아    │ │ 태국        │       │
│  │ 벚꽃여행    │ │ 신혼여행    │ │ 가족여행    │       │
│  │ 3.20~3.25  │ │ 완료       │ │ 계획중      │       │
│  │ 👥4  📸32  │ │ 👥2  📸128 │ │ 👥6  📸0   │       │
│  │ ●● 진행중  │ │ ✓ 완료     │ │ ○ 계획중    │       │
│  └────────────┘ └────────────┘ └────────────┘       │
│                                                       │
│  ── 📋 템플릿으로 시작하기 ──────────────             │ ← NEW (v2.0)
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 3박4일   │ │ 5일     │ │ 4박5일   │             │
│  │ 오사카   │ │ 이탈리아 │ │ 방콕     │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  🇯🇵 2026 오사카 벚꽃여행    ● 진행중   [⚙ 설정]    │
├──────────┬───────────────────────────────────────────┤
│          │                                            │
│ 📅 일정   │  Day 1 — 3월 20일 (금)  ☀️ 12°/22°       │ ← 날씨 통합
│ 📝 기록   │                                            │
│ 📸 갤러리 │  09:00  ✈️ 인천→간사이                      │
│ 🗺️ 지도  │  12:00  🍜 이치란 라멘                      │ ← NEW
│ 📍 장소   │  14:00  🏯 오사카성                         │
│ 💰 경비   │  18:00  🛒 도톤보리                         │
│ ✅ 체크   │  20:00  🏨 호텔 체크인                      │ ← NEW
│ 📎 문서   │                                            │ ← NEW
│ 💬 채팅   │  Day 2 — 3월 21일 (토)  ⛅ 10°/18°       │ ← NEW
│ 👥 참여자 │  ...                                       │
│ 🚨 긴급   │                                            │ ← NEW (v2.0)
│          │                                            │
│ ── 상태 ──│  [활동 피드]                               │ ← NEW
│ 🟢 Joshua │  14:32 Joshua가 일정을 수정했습니다        │
│ 🟢 Mina   │  14:15 Mina가 사진 5장을 업로드했습니다    │
│ ⚫ Guide  │  13:50 Guide Kim이 장소를 추천했습니다     │
│ 🟢 Mom    │                                            │
│          │                                            │
└──────────┴───────────────────────────────────────────┘
```

---

## 9. 개발 단계 (로드맵)

### Phase 1: 기초 구축 (1~2주)
- [ ] 프로젝트 초기 설정 (React + Express + PostgreSQL + Redis + Docker)
- [ ] 사용자 인증 (회원가입/로그인/JWT)
- [ ] 기본 DB 마이그레이션 (Prisma)
- [ ] 여행 CRUD API + UI (폴더 목록/상세)

### Phase 2: 핵심 기능 (2~3주)
- [ ] 일정 관리 (타임라인 뷰 + CRUD + 드래그앤드롭)
- [ ] 여행 기록 (에디터 + 날짜별 뷰)
- [ ] 사진 업로드 + 갤러리 (그리드/타임라인 + 썸네일 생성)
- [ ] 참여자 초대 + 역할 관리

### Phase 3: MVP 확장 (2주)
- [ ] 체크리스트 (공유 체크, 담당자 지정) ← NEW
- [ ] 문서 보관함 (업로드/분류/열람) ← NEW
- [ ] 지도 뷰 (Mapbox 연동, 일정/장소 핀) ← NEW
- [ ] 활동 피드 (타임라인) ← NEW
- [ ] 경비 관리 + 정산

### Phase 4: 실시간 + 협업 (1~2주)
- [ ] Socket.io 실시간 동기화 (일정/체크리스트/피드)
- [ ] 접속 상태 표시
- [ ] 알림 시스템
- [ ] 댓글 기능

### Phase 5: v1.1 기능 (2~3주) ← NEW
- [ ] 채팅 (그룹 채팅 + 미디어 공유 + 읽음 확인)
- [ ] 날씨 정보 (OpenWeather API 연동 + 일정 통합)
- [ ] 여행 리포트/내보내기 (PDF 포토북 + 공유 링크 + 통계)
- [ ] 검색 + 필터 강화

### Phase 6: v2.0 기능 (3~4주) ← NEW
- [ ] 실시간 위치 공유 (ON/OFF + 범위 설정 + SOS)
- [ ] 오프라인 모드 (Service Worker + IndexedDB + 동기화)
- [ ] 여행 템플릿 (생성/탐색/적용 + 커뮤니티)
- [ ] 긴급 정보 (국가별 데이터 + 병원 검색 + SOS)

### Phase 7: 마무리 + 출시 (1~2주)
- [ ] 반응형 모바일 대응
- [ ] 성능 최적화 (이미지 lazy loading, 번들 최적화)
- [ ] 보안 점검 + 부하 테스트
- [ ] 배포 (AWS/Vercel + CI/CD)

---

## 10. 보안 고려사항

- **인증**: JWT Access Token (15분) + Refresh Token (7일, httpOnly cookie)
- **권한**: 미들웨어에서 역할 기반 접근 제어 (RBAC)
- **파일 업로드**: 파일 타입 검증, 크기 제한 (사진 10MB, 문서 20MB), 파일명 해시 처리
- **SQL Injection**: Prisma ORM 사용으로 파라미터 바인딩
- **XSS**: React 기본 이스케이프 + DOMPurify (채팅 메시지)
- **CORS**: 허용 도메인 제한
- **Rate Limiting**: API 요청 제한 (express-rate-limit)
- **위치 데이터**: 암호화 저장, 공유 종료 시 자동 삭제 옵션 ← NEW
- **공유 링크**: 만료 시간 + 사용 횟수 제한 + 랜덤 토큰 ← NEW
- **오프라인 데이터**: IndexedDB 암호화, 민감정보 로컬 저장 최소화 ← NEW
- **WebSocket 보안**: 연결 시 JWT 토큰 검증, trip 멤버 여부 확인, 이벤트별 역할 권한 체크, 악의적 대량 이벤트 방어 (throttling) ← NEW (#15)
- **이메일 인증**: 회원가입 시 이메일 확인 토큰 발송, 24시간 만료 ← NEW (#3)
- **비밀번호 재설정**: 1시간 만료 토큰, 사용 후 즉시 무효화 ← NEW (#3)
- **계정 삭제**: 30일 유예 후 영구 삭제, 유예 기간 내 복구 가능 ← NEW (#2)

---

## 11. 성능 최적화

- **이미지**: 업로드 시 썸네일(300px) + 중간(800px) + 원본 3단계 저장
- **페이지네이션**: 커서 기반 무한 스크롤
- **캐싱**: Redis로 자주 조회되는 여행 데이터 캐싱
- **번들**: Code splitting + Lazy loading (페이지별)
- **DB 인덱싱**: 자주 조회되는 컬럼에 인덱스 설정
- **지도 타일 캐싱**: 방문 지역 지도 타일 CDN 캐싱 ← NEW
- **채팅 최적화**: 가상 스크롤 + 메시지 페이지네이션 ← NEW
- **위치 업데이트 최적화**: 배터리 절약 모드, 이동 감지 시에만 전송 ← NEW
- **Service Worker**: 정적 자산 + API 응답 캐싱 (오프라인 지원) ← NEW
- **검색 최적화**: PostgreSQL GIN 인덱스 + trigram for 한국어 검색 ← NEW (#14)

---

## 12. 경비 정산 알고리즘 ← NEW (#8)

### 12.1 정산 로직
```
예시: 3명(A, B, C)이 여행, 총 경비 3건
  - A가 저녁 식사 ₩90,000 결제 (A, B, C 균등 분담)
  - B가 택시비 ₩30,000 결제 (A, B 분담)
  - C가 입장료 ₩60,000 결제 (A, B, C 균등 분담)

계산 과정:
  1. 각 항목별 1인당 부담액 계산
     저녁: 각 ₩30,000 / 택시: 각 ₩15,000 / 입장료: 각 ₩20,000
  2. 개인별 총 부담액 vs 총 결제액 비교
     A: 부담 ₩65,000, 결제 ₩90,000 → ₩25,000 받을 돈
     B: 부담 ₩65,000, 결제 ₩30,000 → ₩35,000 줄 돈
     C: 부담 ₩50,000, 결제 ₩60,000 → ₩10,000 받을 돈
  3. 최소 이체 횟수 알고리즘 (Greedy)
     → B가 A에게 ₩25,000, C에게 ₩10,000 = 2번 이체로 완료
```

- **알고리즘**: Greedy 기반 최소 이체 횟수 정산
- **다중 통화 처리**: 경비 입력 시 통화 선택, 정산 시 기준 통화로 환산
- **환율 소스**: Open Exchange Rates API (1일 1회 갱신, Redis 캐싱)
- **정산 결과 표시**: "B → A: ₩25,000", "B → C: ₩10,000" 형태로 표시
- **부분 정산**: 특정 항목만 선택하여 중간 정산 가능

---

## 13. API 응답 형식 및 에러 처리 ← NEW (#9)

### 13.1 표준 응답 형식
```json
// 성공 (단일 객체)
{
  "success": true,
  "data": { ... }
}

// 성공 (목록 + 페이지네이션)
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "nextCursor": "abc123"
  }
}

// 실패
{
  "success": false,
  "error": {
    "code": "TRIP_NOT_FOUND",
    "message": "요청한 여행을 찾을 수 없습니다.",
    "status": 404
  }
}

// 유효성 검증 실패
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "status": 400,
    "details": [
      { "field": "title", "message": "제목은 필수입니다." },
      { "field": "start_date", "message": "시작일은 오늘 이후여야 합니다." }
    ]
  }
}
```

### 13.2 HTTP 상태 코드 매핑

| 상태 코드 | 용도 |
|-----------|------|
| 200 | 성공 (조회/수정) |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (본문 없음) |
| 400 | 잘못된 요청 / 유효성 실패 |
| 401 | 인증 실패 (토큰 없음/만료) |
| 403 | 권한 없음 (역할 부족) |
| 404 | 리소스 없음 |
| 409 | 충돌 (이미 존재하는 이메일 등) |
| 413 | 파일 크기 초과 |
| 429 | Rate Limit 초과 |
| 500 | 서버 내부 오류 |

### 13.3 에러 코드 체계
```
AUTH_*          인증 관련 (AUTH_TOKEN_EXPIRED, AUTH_INVALID_CREDENTIALS, ...)
TRIP_*          여행 관련 (TRIP_NOT_FOUND, TRIP_ALREADY_COMPLETED, ...)
MEMBER_*        참여자 관련 (MEMBER_ALREADY_EXISTS, MEMBER_INVITE_EXPIRED, ...)
SCHEDULE_*      일정 관련
PHOTO_*         사진 관련 (PHOTO_SIZE_EXCEEDED, PHOTO_INVALID_TYPE, ...)
PERMISSION_*    권한 관련 (PERMISSION_DENIED, PERMISSION_ROLE_REQUIRED, ...)
VALIDATION_*    유효성 관련
SYNC_*          동기화 관련 (SYNC_CONFLICT, SYNC_OUTDATED, ...)
```

---

## 14. 시간대(Timezone) 처리 전략 ← NEW (#10)

### 14.1 원칙
```
저장: 모든 시간은 UTC로 DB에 저장 (TIMESTAMPTZ)
표시: 사용자의 설정 시간대 또는 여행지 시간대로 변환하여 표시
일정: 여행지 현지 시간 기준으로 입력/표시
```

### 14.2 상세 규칙

| 데이터 | 저장 형식 | 표시 형식 |
|--------|----------|----------|
| **일정 시간** | UTC + timezone 필드 | 여행지 현지 시간 |
| **채팅 메시지** | UTC | 사용자 설정 시간대 |
| **활동 피드** | UTC | 사용자 설정 시간대 |
| **알림** | UTC | 사용자 설정 시간대 |
| **사진 촬영 시간** | UTC (EXIF 변환) | 촬영지 현지 시간 |

### 14.3 구현 방식
- **trips 테이블에 timezone 컬럼 추가**: 여행지 시간대 (예: "Asia/Tokyo")
- **schedules의 start_time/end_time**: 현지 시간으로 입력, 서버에서 UTC 변환 저장
- **프론트엔드**: date-fns-tz 라이브러리로 시간대 변환
- **다중 시간대 여행**: 일정별로 timezone 오버라이드 가능 (예: 미국 횡단 시 Day별 시간대 다름)

### 14.4 다국어 지원 방향 (i18n)
- **v1.0**: 한국어 단일 언어
- **v1.1**: 영어 추가 (react-i18next)
- **v2.0**: 일본어, 중국어 간체 추가 검토
- **번역 구조**: `locales/{lang}/common.json`, `locales/{lang}/trip.json` 등 네임스페이스 분리

---

## 15. 파일 저장소 전략 ← NEW (#11)

### 15.1 환경별 저장소

| 환경 | 저장소 | URL 스키마 |
|------|--------|-----------|
| **개발** | Local FileSystem (`./uploads/`) | `/uploads/photos/{hash}.jpg` |
| **스테이징** | AWS S3 (단일 버킷) | `https://cdn.tripsync.com/photos/{hash}.jpg` |
| **프로덕션** | AWS S3 + CloudFront CDN | `https://cdn.tripsync.com/photos/{hash}.jpg` |

### 15.2 파일 구조
```
uploads/
├── photos/
│   ├── originals/     {tripId}/{uuid}.{ext}      원본
│   ├── medium/        {tripId}/{uuid}_800.{ext}   중간 (800px)
│   └── thumbnails/    {tripId}/{uuid}_300.{ext}   썸네일 (300px)
├── documents/         {tripId}/{uuid}.{ext}        문서
├── avatars/           {userId}/{uuid}.{ext}        프로필 사진
└── chat/              {tripId}/{uuid}.{ext}        채팅 첨부파일
```

### 15.3 파일 관리 정책
- **업로드**: 파일명을 UUID로 해시, 원본 파일명은 DB에 저장
- **삭제**: Soft Delete (DB에서 deleted_at 마킹 → 30일 후 배치 작업으로 물리 삭제)
- **용량 제한**: 사진 10MB/장, 문서 20MB/파일, 채팅 첨부 5MB/파일
- **허용 타입**: 사진(jpg/png/heic/webp), 문서(pdf/jpg/png), 채팅(jpg/png/pdf/doc)
- **CDN 캐싱**: 썸네일/중간 사이즈는 CDN 캐싱 (max-age: 1년), 원본은 서명된 URL로 접근

---

## 16. 배포/인프라 아키텍처 ← NEW (#12)

### 16.1 인프라 구성
```
┌─────────────────────────────────────────────────┐
│                   CloudFlare                     │
│              (DNS + DDoS 방어)                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────┐
│              AWS / Vercel                        │
│                                                  │
│  Frontend: Vercel (자동 배포 + CDN)              │
│  Backend: AWS EC2 or Railway                     │
│  DB: AWS RDS (PostgreSQL)                        │
│  Cache: AWS ElastiCache (Redis)                  │
│  Storage: AWS S3 + CloudFront                    │
│  이메일: AWS SES or Resend                       │
└──────────────────────────────────────────────────┘
```

### 16.2 CI/CD 파이프라인
```
GitHub Push → GitHub Actions
  ├── Lint + Type Check
  ├── Unit Tests
  ├── Build
  ├── (PR) → Preview Deploy (Vercel)
  └── (main merge) → Production Deploy
       ├── Frontend → Vercel 자동 배포
       ├── Backend → Docker Build → EC2/Railway 배포
       └── DB Migration → Prisma migrate deploy
```

### 16.3 환경 변수 관리
- **개발**: `.env.local` (gitignore)
- **스테이징/프로덕션**: GitHub Secrets + 배포 플랫폼 환경변수
- **필수 환경변수**: DATABASE_URL, REDIS_URL, JWT_SECRET, S3_BUCKET, MAPBOX_TOKEN, OPENWEATHER_KEY, SMTP 설정

### 16.4 모니터링 & 로깅
- **에러 추적**: Sentry (프론트엔드 + 백엔드)
- **로그**: Winston (서버) → CloudWatch Logs
- **성능**: Vercel Analytics (프론트엔드), 커스텀 API 응답시간 로깅
- **업타임**: UptimeRobot (무료) 또는 Better Uptime
- **DB 백업**: RDS 자동 스냅샷 (일 1회, 7일 보관)

---

## 17. 전체 기능 요약 매트릭스

| 기능 | MVP (v1.0) | v1.1 | v2.0 |
|------|:----------:|:----:|:----:|
| 여행 폴더 관리 | ✅ | | |
| 일정 관리 | ✅ | | |
| 여행 기록 | ✅ | | |
| 사진 갤러리 | ✅ | | |
| 참여자 관리 + 초대 플로우 | ✅ | | |
| 경비 관리 + 정산 | ✅ | | |
| 체크리스트 | ✅ | | |
| 문서 보관함 | ✅ | | |
| 지도 뷰 | ✅ | | |
| 활동 피드 | ✅ | | |
| 사용자 설정 + 프로필 | ✅ | | |
| 인증 (가입/로그인/비번재설정) | ✅ | | |
| 실시간 동기화 | ✅ | | |
| 댓글 + 알림 | ✅ | | |
| 장소 CRUD + 지도 연동 | ✅ | | |
| 통합 검색 | ✅ | | |
| 채팅 | | ✅ | |
| 날씨 정보 | | ✅ | |
| 여행 리포트/내보내기 | | ✅ | |
| 다국어 (영어) | | ✅ | |
| 실시간 위치 공유 | | | ✅ |
| 오프라인 모드 | | | ✅ |
| 여행 템플릿 | | | ✅ |
| 긴급 정보 | | | ✅ |
| 다국어 (일본어/중국어) | | | ✅ |

---

## 부록 A. DB 스키마 정오표 ← NEW (#13)

### 수정 1: ERD에서 JournalPhotos 제거
- ERD에 `JournalPhotos` 테이블이 별도로 표시되었으나, 실제로는 `photos.journal_id` FK로 연결하는 구조
- ERD를 다음과 같이 수정:
```
Trips ──< Journals
Trips ──< Photos (journal_id FK로 Journals와 선택적 연결)
```

### 수정 2: share_token 중복 제거
- `trips.share_token` 컬럼 삭제
- 공유 기능은 `share_links` 테이블로 일원화
- 이유: share_links 테이블이 만료시간, 사용횟수, 링크타입(초대/읽기전용) 등을 지원하므로 더 유연함

### 수정 3: trips 테이블에 timezone 추가 (#10)
```sql
ALTER TABLE trips ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Seoul';
```

### 수정 4: schedules 테이블에 timezone 오버라이드 추가 (#10)
```sql
ALTER TABLE schedules ADD COLUMN timezone_override VARCHAR(50);
-- NULL이면 trip의 timezone 사용, 값이 있으면 해당 일정만 별도 시간대
```

### 수정 5: users 테이블에 설정 컬럼 추가 (#2, #5)
```sql
ALTER TABLE users ADD COLUMN locale VARCHAR(10) DEFAULT 'ko';
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Seoul';
ALTER TABLE users ADD COLUMN default_currency VARCHAR(3) DEFAULT 'KRW';
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;  -- soft delete
```

### 수정 6: 알림 설정 테이블 추가 (#5)
```sql
CREATE TABLE notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  schedule_changes  BOOLEAN DEFAULT TRUE,
  new_photos        BOOLEAN DEFAULT TRUE,
  chat_messages     BOOLEAN DEFAULT TRUE,
  comments_mentions BOOLEAN DEFAULT TRUE,
  budget_changes    BOOLEAN DEFAULT TRUE,
  location_alerts   BOOLEAN DEFAULT TRUE,
  email_enabled     BOOLEAN DEFAULT FALSE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

*기획일: 2026년 3월 12일*
*버전: v2.0 (전체 로드맵 포함)*
*최종 검토: 2026년 3월 12일 — 누락 15건 반영 완료*
*총 예상 개발 기간: 14~20주*
