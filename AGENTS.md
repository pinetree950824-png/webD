# DuelVerse 프로젝트 소개 및 구조 명세 (AGENTS.md)

이 문서는 웹 프로그래밍 과제 수행을 위해 구축된 **DuelVerse** 프로젝트의 서비스 목적과 폴더 구조, 그리고 핵심 기술 요소를 소개하기 위해 작성되었습니다.

---

## 1. 서비스 목적 및 소개
*   **서비스명**: DuelVerse (13기 오버프레임 TCG 컬렉팅 웹 서비스)
*   **목적**: 유희왕 OCG 13기 카드를 웹상에서 골드를 소모해 뽑고(Gacha), 수집률을 대시보드로 확인하며, 획득한 카드들을 개인 가방(도감 앨범)에 저장해 두는 인터랙티브 웹 애플리케이션입니다.
*   **기획적 차별성 (WOW 포인트)**:
    *   마우스의 움직임에 따라 유연하게 카드가 기울어지는 **3D 마우스 틸트(Tilt)** 효과 적용.
    *   빛이 비치는 각도에 따라 빛나는 **무지개 홀로그램 글레어(Glare) 반사** 효과 구현.
    *   Vite 번들러 컴파일 성공 검증 및 IndexedDB 로컬 캐싱을 이용한 오프라인 친화적(Local-first)인 빠른 로딩 구현.

---

## 2. 프로젝트 폴더 구조 및 파일 역할

현재 `webD` 폴더는 프론트엔드와 백엔드가 한 레포지토리 내에서 조화롭게 구동되는 **모노레포(Monorepo)** 형식으로 안전하게 설계되어 있습니다.

```
webD/
├── client/                     # 프론트엔드 (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx       # 게스트 로그인 양식 및 구글 OAuth 연동 (테스트용 우회 기능 포함)
│   │   │   ├── Dashboard.jsx   # 전체 및 팩별 수집 진행도(ProgressBar) 대시보드
│   │   │   ├── Shop.jsx        # 부스터 팩 상점 (팩 1개/10개 무작위 드로우 처리)
│   │   │   ├── Album.jsx       # 가방 도감 (수집 카드/미수집 카드 필터링 및 상세 스펙 카드 모달)
│   │   │   ├── Card.jsx        # 마우스 틸트, 글레어, 카드 뒤집기 애니메이션을 지원하는 3D 카드 컴포넌트
│   │   │   └── GachaReveal.jsx # 부스터 팩 찢기 연출 및 뽑은 카드 개별 탭 오픈 이펙트
│   │   ├── utils/
│   │   │   └── indexedDB.js    # IndexedDB 연동 카드 이미지 바이너리 로컬 캐싱 모듈
│   │   ├── App.jsx             # 전체 상태 관리, Toast 알림 및 서브 뷰 라우터
│   │   └── index.css           # 다크 모드, 네온 컬러 토큰, 3D CSS 및 글레어 효과 CSS
│   ├── index.html              # 구글 폰트 및 구글 GSI 소셜 로그인 SDK 호출
│   └── Dockerfile              # 프론트엔드 빌드 후 Nginx 정적 서빙 컨테이너 생성 Dockerfile
│
├── server/                     # 백엔드 (Node.js + Express)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js        # SQLite DB 연결 설정 및 schema/seed 자동 셋업
│   │   │   ├── schema.sql      # DB 테이블(users, cards, user_cards) 스키마 정의
│   │   │   └── seedData.js     # 부스터 팩 3종에 해당하는 30개 에이스 카드 정보 팩 데이터
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT 토큰 해독 및 유저 세션 인증 미들웨어
│   │   └── routes/
│   │       ├── auth.js         # 게스트 로그인 등록 및 구글 ID 토큰 검증 API
│   │       ├── gacha.js        # 팩 드로우 처리 (무작위 가중치 롤링 및 ACID 트랜잭션 보장)
│   │       └── album.js        # 유저 보유 인벤토리 반환 및 수집 퍼센트 통계 산출 API
│   ├── index.js                # 백엔드 엔트리포인트 (CORS 구성, DB 로드, 포트 5000 실행)
│   ├── verify_transactions.js  # 거래 트랜잭션 작동 테스트용 파일 (검증 통과)
│   └── Dockerfile              # 백엔드 서버 구동 Dockerfile
│
├── nginx/                      # Nginx 프록시 설정
│   └── nginx.conf              # 80포트 Nginx 서빙 및 /api 요청을 백엔드로 프록시 포워딩
│
├── docker-compose.yml          # 로컬 개발 및 컨테이너 연동 다중 서비스 테스트 설정
├── Dockerfile                  # 배포(Render.com) 환경용 Nginx + Node + SQLite 통합 단일 Dockerfile
└── start.sh                    # Render 단일 포트 구동을 위해 Nginx와 Node를 함께 실행하는 부트 쉘 스크립트
```

---

## 3. 과제 기술 요구사항 충족 현황

*   **Docker & Nginx**: 
    *   로컬 테스트용 멀티 컨테이너 아키텍처(`docker-compose.yml`)와 클라우드 배포 전용 통합 아키텍처(`Dockerfile`)를 동시에 구현하여 완벽히 대응했습니다. Nginx가 static 자원을 최속으로 뿌려주고 `/api`는 뒤에 있는 Node로 우회 프록시합니다.
*   **Web Storage 활용**:
    *   `localStorage`: 자동 로그인을 보장하는 JWT 인증 세션 정보 저장.
    *   `IndexedDB`: 카드의 고화질 이미지를 로컬 바이너리 Blob으로 보관하여, 뽑기 오픈 시의 깜빡임 현상을 제거하고 오프라인 가독성을 확보했습니다.
*   **DBMS 활용**:
    *   `SQLite` 관계형 데이터베이스를 탑재하여 유저 컬렉션과 재화 데이터를 디렉토리에 persistent하게 격리 저장 및 쿼리합니다.
*   **CI/CD 자동 배포**:
    *   깃허브 푸시 시 실행되는 `.github/workflows/deploy.yml`을 갖추어, 빌드 성공 여부를 테스트하고 클라우드(Render) 웹훅으로 연동 배포 자동화를 수립했습니다.
