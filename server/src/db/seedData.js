const seedCards = [
  // --- Limit Over Collection -THE HEROES- ---
  {
    name: "엘리멘틀 히어로 네오스",
    rarity: "Overframe Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/28754358.jpg",
    card_type: "Monster",
    level: 7,
    attribute: "LIGHT",
    attack: 2500,
    defense: 2000,
    description: "네오 스페이스에서 온 새로운 엘리멘틀 히어로. 네오 스페이시언과 콘택트 융합을 함으로써 숨겨진 힘을 발휘한다!"
  },
  {
    name: "스타더스트 드래곤",
    rarity: "Overframe Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/44508024.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "WIND",
    attack: 2500,
    defense: 2000,
    description: "튜너 + 튜너 이외의 몬스터 1장 이상\n①: 필드의 카드를 파괴하는 마법 / 함정 / 몬스터의 효과가 발동했을 때, 이 카드를 릴리스하고 발동할 수 있다. 그 발동을 무효로 하고 파괴한다."
  },
  {
    name: "No.39 희망황 호프",
    rarity: "Ultra Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/84013237.jpg",
    card_type: "Monster",
    level: 4,
    attribute: "LIGHT",
    attack: 2500,
    defense: 2000,
    description: "레벨 4 몬스터 x 2\n①: 자신 또는 상대 몬스터의 공격 선언시, 이 카드의 엑시즈 소재를 1개 제거하고 발동할 수 있다. 그 몬스터의 공격을 무효로 한다."
  },
  {
    name: "오드아이즈 펜듈럼 드래곤",
    rarity: "Ultra Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/16178681.jpg",
    card_type: "Monster",
    level: 7,
    attribute: "DARK",
    attack: 2500,
    defense: 2000,
    description: "①: 이 카드가 상대 몬스터와 전투를 실행할 경우, 상대에게 주는 전투 데미지는 배가 된다."
  },
  {
    name: "파이어월 드래곤",
    rarity: "Super Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/1861629.jpg",
    card_type: "Monster",
    level: 4,
    attribute: "LIGHT",
    attack: 2500,
    defense: 0,
    description: "효과 몬스터 2-4장\n①: 이 카드가 필드에 앞면 표시로 존재하는 한 1번만, 서로의 필드/묘지의 몬스터를 이 카드와 상호 링크하고 있는 몬스터의 수만큼 대상으로 하고 발동할 수 있다. 그 몬스터를 주인의 패로 되돌린다."
  },
  {
    name: "날개 크리보",
    rarity: "Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/57116033.jpg",
    card_type: "Monster",
    level: 1,
    attribute: "LIGHT",
    attack: 300,
    defense: 200,
    description: "①: 필드의 이 카드가 파괴되어 묘지로 보내졌을 때 발동한다. 이 턴에 자신이 받는 전투 데미지는 전부 0이 된다."
  },
  {
    name: "정크 싱크론",
    rarity: "Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/63977036.jpg",
    card_type: "Monster",
    level: 3,
    attribute: "DARK",
    attack: 1300,
    defense: 500,
    description: "①: 이 카드가 일반 소환에 성공했을 때, 자신 묘지의 레벨 2 이하의 몬스터 1장을 대상으로 하고 발동할 수 있다. 그 몬스터를 효과를 무효로 하고 수비 표시로 특수 소환한다."
  },
  {
    name: "가가가 매지션",
    rarity: "Super Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/47819246.jpg",
    card_type: "Monster",
    level: 4,
    attribute: "DARK",
    attack: 1500,
    defense: 1000,
    description: "①: 1턴에 1번, 1~8까지의 임의의 레벨을 선언하고 발동할 수 있다. 이 카드의 레벨은 턴 종료시까지 선언한 레벨이 된다."
  },
  {
    name: "디코드 토커",
    rarity: "Super Rare",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/1861629.jpg",
    card_type: "Monster",
    level: 3,
    attribute: "DARK",
    attack: 2300,
    defense: 0,
    description: "효과 몬스터 2장 이상\n①: 이 카드의 공격력은 이 카드의 링크 앞의 몬스터의 수 × 500 올린다."
  },
  {
    name: "하리보테 구룡",
    rarity: "Common",
    booster_pack: "Limit Over Collection -THE HEROES-",
    image_url: "https://images.ygoprodeck.com/images/cards/15028680.jpg",
    card_type: "Monster",
    level: 2,
    attribute: "EARTH",
    attack: 550,
    defense: 550,
    description: "종이 껍데기로 용을 본뜬 목마. 겉모습은 꽤 그럴듯해 보이지만 속은 비어 있어 약하다."
  },

  // --- Limit Over Collection -THE RIVALS- ---
  {
    name: "푸른 눈의 백룡",
    rarity: "Overframe Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "LIGHT",
    attack: 3000,
    defense: 2500,
    description: "높은 공격력을 자랑하는 전설의 드래곤. 어떠한 상대라도 분쇄해 버리는 파괴력은 상상을 초월한다."
  },
  {
    name: "레드 데몬즈 드래곤",
    rarity: "Overframe Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/70902743.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "DARK",
    attack: 3000,
    defense: 2000,
    description: "튜너 + 튜너 이외의 몬스터 1장 이상\n①: 이 카드가 상대의 수비 표시 몬스터를 공격한 데미지 계산 후에 발동한다. 상대 필드의 수비 표시 몬스터를 전부 파괴한다."
  },
  {
    name: "갤럭시아이즈 포톤 드래곤",
    rarity: "Ultra Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/31801517.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "LIGHT",
    attack: 3000,
    defense: 2500,
    description: "①: 이 카드는 자신 필드의 공격력 2000 이상의 몬스터 2장을 릴리스하고 패에서 특수 소환할 수 있다."
  },
  {
    name: "DDD 사도왕 헬 암게돈",
    rarity: "Ultra Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/46796664.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "DARK",
    attack: 3000,
    defense: 1000,
    description: "①: 1턴에 1번, 자신 필드의 몬스터가 전투 / 효과로 파괴되었을 때, 이 카드의 공격력을 턴 종료시까지 파괴된 몬스터의 원래 공격력만큼 올릴 수 있다."
  },
  {
    name: "바렐로드 드래곤",
    rarity: "Super Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/31833038.jpg",
    card_type: "Monster",
    level: 4,
    attribute: "DARK",
    attack: 3000,
    defense: 0,
    description: "효과 몬스터 3장 이상\n①: 이 카드는 몬스터 효과의 대상이 되지 않는다.\n②: 1턴에 1번, 공격 표시 몬스터 1장을 대상으로 하고 발동할 수 있다. 그 몬스터의 공격력/수비력을 500 내린다."
  },
  {
    name: "푸른 눈의 아백룡",
    rarity: "Super Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/29432363.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "LIGHT",
    attack: 3000,
    defense: 2500,
    description: "이 카드는 통상 소환할 수 없다. 패의 '푸른 눈의 백룡' 1장을 상대에게 보여준 경우에 특수 소환할 수 있다. ①: 1턴에 1번, 상대 필드의 몬스터 1장을 대상으로 하고 발동할 수 있다. 그 몬스터를 파괴한다."
  },
  {
    name: "레조네이터 콜",
    rarity: "Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/94820622.jpg",
    card_type: "Spell",
    description: "①: 덱에서 '레조네이터' 몬스터 1장을 패에 넣는다."
  },
  {
    name: "성스러운 방어막 거울의 힘",
    rarity: "Rare",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/44095762.jpg",
    card_type: "Trap",
    description: "①: 상대 몬스터의 공격 선언시에 발동할 수 있다. 상대 필드의 공격 표시 몬스터를 전부 파괴한다."
  },
  {
    name: "카이바맨",
    rarity: "Common",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/34627841.jpg",
    card_type: "Monster",
    level: 3,
    attribute: "LIGHT",
    attack: 200,
    defense: 700,
    description: "①: 이 카드를 릴리스하고 발동할 수 있다. 패에서 '푸른 눈의 백룡' 1장을 특수 소환한다."
  },
  {
    name: "어둠의 유혹",
    rarity: "Common",
    booster_pack: "Limit Over Collection -THE RIVALS-",
    image_url: "https://images.ygoprodeck.com/images/cards/1475311.jpg",
    card_type: "Spell",
    description: "①: 자신은 덱에서 2장 드로우하고, 그 후 패의 어둠 속성 몬스터 1장을 제외한다. 패에 어둠 속성 몬스터가 없을 경우, 패를 전부 묘지로 보낸다."
  },

  // --- Chaos Origins ---
  {
    name: "카오스 솔저 -개벽-",
    rarity: "Prismatic Secret Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/72869073.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "LIGHT",
    attack: 3000,
    defense: 2500,
    description: "이 카드는 통상 소환할 수 없다. 자신 묘지에서 빛 속성과 어둠 속성 몬스터를 1장씩 제외했을 경우에만 특수 소환할 수 있다.\n①: 1턴에 1번, 필드의 몬스터 1장을 대상으로 하고 제외할 수 있다. 이 효과를 발동하는 턴에 이 카드는 공격할 수 없다."
  },
  {
    name: "카오스 엠페러 드래곤 -종언-",
    rarity: "Ultra Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/61052896.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "DARK",
    attack: 3000,
    defense: 2500,
    description: "이 카드는 통상 소환할 수 없다. 자신 묘지의 빛 속성과 어둠 속성 몬스터를 1장씩 제외했을 경우에만 특수 소환할 수 있다.\n①: 1000 라이프 포인트를 지불하고 발동할 수 있다. 서로의 패/필드의 카드를 전부 묘지로 보낸다. 그 후, 이 효과로 상대 묘지로 보낸 카드의 수 × 300 데미지를 상대에게 준다."
  },
  {
    name: "초뇌룡 - 썬더 드래곤",
    rarity: "Super Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/48829465.jpg",
    card_type: "Monster",
    level: 8,
    attribute: "DARK",
    attack: 2600,
    defense: 2400,
    description: "'썬더 드래곤' 몬스터 + 번개족 몬스터\n①: 이 카드가 몬스터 존에 존재하는 한, 상대는 드로우 이외의 방법으로 덱에서 카드를 패에 넣을 수 없다."
  },
  {
    name: "라이트펄서 드래곤",
    rarity: "Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/99365553.jpg",
    card_type: "Monster",
    level: 6,
    attribute: "LIGHT",
    attack: 2500,
    defense: 1500,
    description: "①: 이 카드가 필드에서 묘지로 보내졌을 때, 자신 묘지의 레벨 5 이상의 어둠 속성/드래곤족 몬스터 1장을 대상으로 하고 발동할 수 있다. 그 몬스터를 특수 소환한다."
  },
  {
    name: "다크플레어 드래곤",
    rarity: "Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/14463863.jpg",
    card_type: "Monster",
    level: 5,
    attribute: "DARK",
    attack: 2400,
    defense: 1200,
    description: "①: 1턴에 1번, 패에서 드래곤족 몬스터 1장과 번개족 몬스터 1장을 묘지로 보내고 발동할 수 있다. 덱에서 드래곤족 몬스터 1장을 묘지로 보낸다."
  },
  {
    name: "카오스 소서러",
    rarity: "Common",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/95961265.jpg",
    card_type: "Monster",
    level: 6,
    attribute: "DARK",
    attack: 2300,
    defense: 2000,
    description: "이 카드는 통상 소환할 수 없다. 자신 묘지에서 빛 속성과 어둠 속성 몬스터를 1장씩 제외했을 경우에만 특수 소환할 수 있다. ①: 1턴에 1번, 필드의 앞면 표시 몬스터 1장을 대상으로 하고 발동할 수 있다. 그 앞면 표시 몬스터를 제외한다."
  },
  {
    name: "식인 곤충",
    rarity: "Common",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/37970940.jpg",
    card_type: "Monster",
    level: 2,
    attribute: "EARTH",
    attack: 450,
    defense: 600,
    description: "리버스: 필드 위의 몬스터 1장을 선택하고 파괴한다."
  },
  {
    name: "욕망의 항아리",
    rarity: "Common",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/55144522.jpg",
    card_type: "Spell",
    description: "①: 자신은 덱에서 2장 드로우한다."
  },
  {
    name: "번개",
    rarity: "Rare",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/12580477.jpg",
    card_type: "Spell",
    description: "①: 상대 필드의 몬스터를 전부 파괴한다."
  },
  {
    name: "싸이클론",
    rarity: "Common",
    booster_pack: "Chaos Origins",
    image_url: "https://images.ygoprodeck.com/images/cards/5318639.jpg",
    card_type: "Spell",
    description: "①: 필드의 마법 / 함정 카드 1장을 대상으로 하고 발동할 수 있다. 그 카드를 파괴한다."
  }
];

module.exports = seedCards;
