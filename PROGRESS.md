🌌 DuelVerse 프로젝트 진행 현황 및 로드맵 (PROGRESS.md)
이 문서는 13기 오버프레임 TCG 컬렉팅 웹 서비스 DuelVerse의 현재 개발 완료된 기능들과 향후 구현해야 할 추가 과제들을 정리하여 관리하기 위해 작성되었습니다.

📅 프로젝트 개요
서비스명: DuelVerse
주요 기능: 유희왕 OCG 13기 카드를 골드로 뽑고(Gacha), 수집률을 확인하며, 수집한 카드를 보관(Album) 및 유저 간 거래(Marketplace)하는 로컬 친화적 인터랙티브 TCG 웹 애플리케이션.
WOW 포인트: 3D 마우스 틸트(Tilt) 및 무지개 홀로그램 글레어(Glare) 반사 효과, IndexedDB 이미지 바이너리 로컬 캐싱을 통한 초고속 로딩.

✅ 1. 지금까지 완료된 작업 (Completed)
프론트엔드, 백엔드, 그리고 인프라/배포 환경 전반에 걸쳐 핵심 뼈대 및 고급 인터랙티브 효과가 구현 완료되었습니다.

💻 프론트엔드 (Vite + React)
3D 인터랙티브 카드 컴포넌트 (Card.jsx)
마우스 움직임에 반응하는 3D 마우스 틸트(Tilt) 효과.
광원 각도에 따른 무지개 홀로그램 글레어(Glare) 반사 효과.
오프라인 친화적 로딩을 위한 IndexedDB 카드 이미지 바이너리 캐싱 모듈 (indexedDB.js).
대시보드 (Dashboard.jsx)
전체 수집률 및 팩별 수집 진행도(ProgressBar) 대시보드 시각화.
부스터 팩 상점 (Shop.jsx & GachaReveal.jsx)
부스터 팩 3종 판매 기능 및 골드 차감 연동.
팩 찢기 연출 및 뽑은 카드 개별 탭 오픈 이펙트(Gacha Animation) 구현.
듀얼 앨범 도감 (Album.jsx)
수집 완료/미수집 카드 필터링 및 이름, 팩, 타입별 검색 기능.
보유한 카드를 클릭 시 상세 스펙 및 효과를 볼 수 있는 상세 카드 모달 창 구현.
로그인 & 스타일링 (Login.jsx & index.css)
게스트 로그인 양식 및 구글 OAuth 연동 SDK 호출.
다크 모드, 네온 컬러 토큰, 3D CSS 효과를 지원하는 완성도 높은 테마 스타일 정의.

⚙️ 백엔드 (Node.js + Express)
SQLite 데이터베이스 셋업 (db/index.js & schema.sql & seedData.js)
users, cards, user_cards, marketplace 테이블 정의 및 인덱스 설정.
부스터 팩 3종에 해당하는 30개 에이스 카드 정보 시드 데이터 삽입.
사용자 인증 및 세션 API (middleware/auth.js & routes/auth.js)
게스트 및 구글 로그인 검증 및 JWT 토큰 기반 세션 관리.
카드 팩 드로우 API (routes/gacha.js)
무작위 가중치 롤링 알고리즘 적용 및 안전한 드로우 처리를 위한 SQLite ACID 트랜잭션 보장.
도감 및 인벤토리 API (routes/album.js)
유저별 보유 카드 인벤토리 조회 및 수집률 백분율 통계 산출.
거래소 백엔드 API (routes/market.js)
활성 판매 리스트 조회, 카드 판매 등록, 판매 등록 취소, 카드 구매 처리 완료.
골드 차감 및 카드 소유권 이전을 SQLite 트랜잭션(BEGIN TRANSACTION)으로 처리하여 동시성 이슈 및 거래 정합성(ACID) 검증 완료 (verify_transactions.js 테스트 통과).

🚀 인프라 및 배포 (Docker & Nginx & CI/CD)
로컬 및 배포용 컨테이너 아키텍처
Nginx 정적 서빙 및 API 요청 백엔드 프록시 포워딩 설정 (nginx/nginx.conf).
로컬 개발을 위한 다중 컨테이너 빌드 파일 (docker-compose.yml).
클라우드(Render.com) 배포용 통합 Nginx + Node + SQLite 단일 컨테이너 빌드 설정 (Dockerfile & start.sh).
CI/CD 파이프라인 (.github/workflows/deploy.yml)
GitHub push 시 빌드 성공 검증 테스트 수행 및 Render 배포 자동화 웹훅 연동.

🚀 2. 이제 해야 할 작업 (Todo / Backlog)
모든 1순위 및 2순위 개발 할 일이 성공적으로 완료되었습니다! 🎉

🎯 1순위: 거래소(Marketplace) 프론트엔드 완전 연동 (완료)
* [x] App.jsx 메인 네비게이션 연동
  - [x] Marketplace.jsx 임포트 및 view === 'market' 라우팅 분기 추가.
  - [x] 네비게이션 헤더 바에 '카드 거래소' 탭을 노출시켜 유저가 진입할 수 있도록 구현.
* [x] Album.jsx 도감 모달 내 "판매 등록" 기능 구현
  - [x] 도감 내 상세 보기 모달 창에 "거래소에 판매 등록" 버튼 추가.
  - [x] 판매 등록 클릭 시 판매 가격을 입력할 수 있는 입력 창(Modal/Form) 노출.
  - [x] /album/inventory API를 활용하여 사용자가 보유한 구체적인 중복 카드의 user_card_id를 획득한 후, POST /market/sell API와 연동하여 실제 판매 등록이 처리되도록 구현.
* [x] 글로벌 상태 & 골드 연동 최적화
  - [x] 거래소에서 카드를 구매하거나 자신이 올린 판매 글을 취소할 때, 상단 헤더의 골드 잔액과 도감 데이터가 즉시 갱신되도록 상태 관리 연동.

🎨 2순위: 사용자 경험(UX) 및 디테일 개선 (완료)
* [x] 판매 중인 카드의 시각적 격리
  - [x] 현재 판매 등록된 카드는 인벤토리에 그대로 노출되고 있습니다. 거래소에 올려진 카드는 도감이나 앨범 리스트에서 '판매 중(On Sale)' 마크를 띄우고, 판매 완료 전까지는 도감 장수에서 임시 제외 처리 및 중복 판매를 방지하는 프론트엔드 검증 구현 완료.
* [x] 모바일 및 반응형 뷰 튜닝
  - [x] 3D 틸트 카드 효과가 모바일 환경(Touch/Gyro)에서도 자연스럽게 보이도록 CSS 미디어 쿼리 및 폴백(Fallback) 모션 보완.
  - [x] 카드 그리드 뷰가 태블릿, 모바일 기기 크기에 맞춰 최적화된 1열/2열 형태로 유연하게 축소되도록 반응형 보정.

🛠️ 3. 향후 유지보수 제안 사항 (Future Improvements)
실시간 알림 기능 (SSE / WebSockets): 다른 사람이 내 카드를 구매했을 때 실시간으로 골드가 충전되고 알림이 오는 기능.
카드 등급별 시각 효과 차별화: Super Rare, Ultra Rare, Overframe Rare 등 등급에 따라 글레어 반사 강도나 카드 테두리 애니메이션을 다르게 주어 가치를 체감할 수 있게 함.
골드 충전소 (미니 게임 또는 일일 퀘스트): 기본 제공 골드 소진 시 추가 골드를 획득할 수 있는 클릭커 미니 게임이나 일일 출석 체크 기능 추가.

