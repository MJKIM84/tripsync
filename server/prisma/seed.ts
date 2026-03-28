import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...\n');

  // ============================================
  // 1. 사용자 생성
  // ============================================
  const passwordHash = await bcrypt.hash('password123', 10);

  const userJuho = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'juho@example.com',
      passwordHash,
      name: '김주호',
      avatarUrl: null,
      bloodType: 'A+',
      allergies: '땅콩',
      emergencyContactName: '김민수',
      emergencyContactPhone: '010-1234-5678',
    },
  });

  const userSoyeon = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'soyeon@example.com',
      passwordHash,
      name: '박소연',
      avatarUrl: null,
      bloodType: 'B+',
      allergies: null,
      emergencyContactName: '박지영',
      emergencyContactPhone: '010-9876-5432',
    },
  });

  const userMinwoo = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'minwoo@example.com',
      passwordHash,
      name: '이민우',
      avatarUrl: null,
      bloodType: 'O+',
      allergies: '갑각류',
      emergencyContactName: '이정환',
      emergencyContactPhone: '010-5555-1234',
    },
  });

  const userHayoung = await prisma.user.create({
    data: {
      id: uuid(),
      email: 'hayoung@example.com',
      passwordHash,
      name: '최하영',
      avatarUrl: null,
      bloodType: 'AB+',
      allergies: null,
      emergencyContactName: '최수진',
      emergencyContactPhone: '010-3333-7890',
    },
  });

  console.log('✅ 사용자 4명 생성 완료');

  // ============================================
  // 2. 여행 생성 - 오사카 3박 4일 (완료된 여행)
  // ============================================
  const tripOsaka = await prisma.trip.create({
    data: {
      id: uuid(),
      ownerId: userJuho.id,
      title: '오사카 먹방 여행 🍣',
      description:
        '친구들과 함께한 오사카 3박 4일 먹방 & 관광 여행! 도톤보리부터 교토까지, 맛있는 음식과 아름다운 풍경으로 가득한 여행이었습니다.',
      coverImage: null,
      country: '일본',
      city: '오사카',
      startDate: new Date('2025-11-15'),
      endDate: new Date('2025-11-18'),
      status: 'completed',
      tags: ['일본', '오사카', '먹방', '친구여행', '도톤보리', '교토'],
      timezone: 'Asia/Tokyo',
      shareToken: 'osaka-trip-share-2025',
    },
  });

  console.log('✅ 여행 "오사카 먹방 여행" 생성 완료');

  // ============================================
  // 3. 여행 멤버 추가
  // ============================================
  await prisma.tripMember.createMany({
    data: [
      { id: uuid(), tripId: tripOsaka.id, userId: userJuho.id, role: 'owner' },
      { id: uuid(), tripId: tripOsaka.id, userId: userSoyeon.id, role: 'traveler' },
      { id: uuid(), tripId: tripOsaka.id, userId: userMinwoo.id, role: 'traveler' },
      { id: uuid(), tripId: tripOsaka.id, userId: userHayoung.id, role: 'friend' },
    ],
  });

  console.log('✅ 여행 멤버 4명 추가 완료');

  // ============================================
  // 4. 일정 (Schedule) - DAY 1 ~ DAY 4
  // ============================================

  // --- DAY 1: 오사카 도착 & 도톤보리 ---
  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 1,
        date: new Date('2025-11-15'),
        title: '인천공항 출발',
        description: '제2터미널 피치항공 MM312편. 탑승구 앞에서 10시까지 집합!',
        startTime: '10:30',
        endTime: '12:30',
        locationName: '인천국제공항 제2터미널',
        latitude: 37.4602,
        longitude: 126.4407,
        category: 'transport',
        sortOrder: 0,
        createdBy: userJuho.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 1,
        date: new Date('2025-11-15'),
        title: '간사이공항 도착 & 호텔 체크인',
        description: '난카이 라피트로 난바역 이동 → 호텔 체크인. 호텔: 크로스호텔 오사카',
        startTime: '14:30',
        endTime: '16:00',
        locationName: '크로스호텔 오사카',
        latitude: 34.6687,
        longitude: 135.5010,
        category: 'accommodation',
        sortOrder: 1,
        createdBy: userJuho.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 1,
        date: new Date('2025-11-15'),
        title: '도톤보리 거리 산책 & 글리코상',
        description: '도톤보리 강변 산책하며 네온사인 구경. 글리코 러닝맨 앞에서 인증샷 필수!',
        startTime: '16:30',
        endTime: '17:30',
        locationName: '도톤보리',
        latitude: 34.6687,
        longitude: 135.5027,
        category: 'sightseeing',
        sortOrder: 2,
        createdBy: userSoyeon.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 1,
        date: new Date('2025-11-15'),
        title: '이치란 라멘 저녁',
        description: '도톤보리 이치란 본점에서 돈코츠 라멘! 면 굵기: 보통, 기름 양: 많이, 마늘: 반쪽',
        startTime: '18:00',
        endTime: '19:00',
        locationName: '이치란 라멘 도톤보리점',
        latitude: 34.6689,
        longitude: 135.5020,
        category: 'food',
        sortOrder: 3,
        createdBy: userMinwoo.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 1,
        date: new Date('2025-11-15'),
        title: '신사이바시 쇼핑',
        description: '돈키호테에서 쇼핑! 면세 가능 (5,000엔 이상). 약국에서 아이템 구매도 잊지 말기',
        startTime: '19:30',
        endTime: '21:30',
        locationName: '신사이바시 돈키호테',
        latitude: 34.6722,
        longitude: 135.5017,
        category: 'shopping',
        sortOrder: 4,
        createdBy: userHayoung.id,
      },
    }),

    // --- DAY 2: 유니버설 스튜디오 재팬 ---
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 2,
        date: new Date('2025-11-16'),
        title: '유니버설 스튜디오 재팬',
        description:
          '하루 종일 USJ! 해리포터 위저딩 월드 → 슈퍼 닌텐도 월드 → 미니언 파크 순서로. 익스프레스 패스 4 구매 완료.',
        startTime: '09:00',
        endTime: '20:00',
        locationName: '유니버설 스튜디오 재팬',
        latitude: 34.6654,
        longitude: 135.4323,
        category: 'sightseeing',
        sortOrder: 0,
        createdBy: userJuho.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 2,
        date: new Date('2025-11-16'),
        title: 'USJ 내 버터비어 & 간식',
        description: '해리포터 에리어에서 버터비어 마시기! 터키레그도 하나씩 나눠 먹기',
        startTime: '12:00',
        endTime: '12:45',
        locationName: '위저딩 월드 오브 해리포터',
        latitude: 34.6660,
        longitude: 135.4318,
        category: 'food',
        sortOrder: 1,
        createdBy: userSoyeon.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 2,
        date: new Date('2025-11-16'),
        title: '우메다 공중정원 야경',
        description: '우메다 스카이빌딩 꼭대기에서 오사카 야경 감상. 일몰 시간: 16:50',
        startTime: '21:00',
        endTime: '22:30',
        locationName: '우메다 스카이빌딩',
        latitude: 34.7052,
        longitude: 135.4906,
        category: 'sightseeing',
        sortOrder: 2,
        createdBy: userMinwoo.id,
      },
    }),

    // --- DAY 3: 교토 당일치기 ---
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 3,
        date: new Date('2025-11-17'),
        title: 'JR로 교토 이동',
        description: '난바에서 JR 쾌속으로 교토역까지 약 50분. 이코카 카드 사용',
        startTime: '08:00',
        endTime: '09:00',
        locationName: 'JR 난바역',
        latitude: 34.6654,
        longitude: 135.5007,
        category: 'transport',
        sortOrder: 0,
        createdBy: userJuho.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 3,
        date: new Date('2025-11-17'),
        title: '후시미이나리 신사',
        description:
          '천 개의 도리이 터널 걷기! 정상까지는 왕복 2시간 정도. 중간 쉼터에서 유부초밥 간식 추천',
        startTime: '09:30',
        endTime: '12:00',
        locationName: '후시미이나리 타이샤',
        latitude: 34.9671,
        longitude: 135.7727,
        category: 'sightseeing',
        sortOrder: 1,
        createdBy: userSoyeon.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 3,
        date: new Date('2025-11-17'),
        title: '니시키 시장에서 점심',
        description:
          '교토의 부엌! 다코야끼, 말차 아이스크림, 유바(두부피) 요리, 교토 절임 시식 등',
        startTime: '12:30',
        endTime: '14:00',
        locationName: '니시키 시장',
        latitude: 34.9988,
        longitude: 135.7647,
        category: 'food',
        sortOrder: 2,
        createdBy: userMinwoo.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 3,
        date: new Date('2025-11-17'),
        title: '아라시야마 대나무숲',
        description: '대나무숲 산책 → 토게츠교 → 원숭이 공원. 단풍 시즌이라 경치 최고!',
        startTime: '14:30',
        endTime: '17:00',
        locationName: '아라시야마 대나무숲',
        latitude: 35.0094,
        longitude: 135.6722,
        category: 'sightseeing',
        sortOrder: 3,
        createdBy: userHayoung.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 3,
        date: new Date('2025-11-17'),
        title: '교토 가이세키 요리 저녁',
        description:
          '전통 가이세키 코스 요리. 예약 완료 (19시, 4인). 기모노 입고 가면 할인!',
        startTime: '19:00',
        endTime: '21:00',
        locationName: '기온 가이세키 미소노',
        latitude: 35.0036,
        longitude: 135.7756,
        category: 'food',
        sortOrder: 4,
        createdBy: userJuho.id,
      },
    }),

    // --- DAY 4: 오사카성 & 귀국 ---
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 4,
        date: new Date('2025-11-18'),
        title: '호텔 체크아웃 & 짐 보관',
        description: '11시 체크아웃. 캐리어는 호텔 프론트에 맡기기',
        startTime: '10:30',
        endTime: '11:00',
        locationName: '크로스호텔 오사카',
        latitude: 34.6687,
        longitude: 135.5010,
        category: 'accommodation',
        sortOrder: 0,
        createdBy: userJuho.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 4,
        date: new Date('2025-11-18'),
        title: '오사카성 관광',
        description: '오사카성 천수각 입장 (600엔). 8층 전망대에서 시내 조망. 성 주변 공원도 산책',
        startTime: '11:30',
        endTime: '13:30',
        locationName: '오사카성',
        latitude: 34.6873,
        longitude: 135.5262,
        category: 'sightseeing',
        sortOrder: 1,
        createdBy: userSoyeon.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 4,
        date: new Date('2025-11-18'),
        title: '쿠로몬 시장 마지막 먹방',
        description:
          '참치 사시미, 성게알 밥, 와규 꼬치, 딸기 다이후쿠로 마지막 먹방 피날레!',
        startTime: '14:00',
        endTime: '15:30',
        locationName: '쿠로몬 시장',
        latitude: 34.6625,
        longitude: 135.5065,
        category: 'food',
        sortOrder: 2,
        createdBy: userMinwoo.id,
      },
    }),
    prisma.schedule.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        dayNumber: 4,
        date: new Date('2025-11-18'),
        title: '간사이공항 이동 & 출국',
        description: '난카이 라피트로 공항 이동. 면세점에서 마지막 쇼핑 후 탑승',
        startTime: '16:00',
        endTime: '20:30',
        locationName: '간사이 국제공항',
        latitude: 34.4320,
        longitude: 135.2304,
        category: 'transport',
        sortOrder: 3,
        createdBy: userJuho.id,
      },
    }),
  ]);

  console.log(`✅ 일정 ${schedules.length}개 생성 완료`);

  // ============================================
  // 5. 여행 기록 (Journal) - 매일 기록
  // ============================================
  const journal1 = await prisma.journal.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      authorId: userJuho.id,
      date: new Date('2025-11-15'),
      title: '드디어 오사카 도착!',
      content: `비행기에서 내리자마자 느껴지는 일본 특유의 공기! 간사이공항에서 난카이 라피트를 타고 난바역까지 이동했다. 열차 안에서부터 설레는 마음을 감출 수가 없었다.

호텔에 짐을 풀자마자 바로 도톤보리로 출동! 글리코 러닝맨 앞에서 다 같이 똑같은 포즈로 사진 찍었는데 민우가 가장 싱크로율이 높았다 ㅋㅋ

첫 끼는 역시 이치란 라멘. 30분 정도 줄 섰지만 그만한 가치가 있었다. 면 굵기 보통, 국물 진하게, 마늘 반쪽으로 주문했는데 역시 본점 맛은 다르다! 소연이가 추가 면 두 번이나 시켰다.

돈키호테에서 쇼핑하다가 시간 가는 줄 몰랐다. 하영이가 마스크팩을 거의 20장은 산 듯. 나도 로이스 초콜릿이랑 눈깔사탕 왕창 샀다. 첫날부터 이러면 캐리어가 감당이 될지...`,
      mood: 'excited',
      locationName: '도톤보리',
      latitude: 34.6687,
      longitude: 135.5027,
    },
  });

  const journal2 = await prisma.journal.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      authorId: userSoyeon.id,
      date: new Date('2025-11-16'),
      title: 'USJ 완전 정복한 날',
      content: `오늘은 유니버설 스튜디오 재팬! 익스프레스 패스 4를 미리 사두길 정말 잘했다. 안 샀으면 해리포터 2시간 넘게 기다렸을 듯...

위저딩 월드에서 버터비어 마시면서 지팡이도 샀다. 올리밴더에서 지팡이가 나를 선택하는 체험은 영화 속에 들어온 기분! 주호 오빠는 호그와트 로브까지 샀다 (덕후 인증)

슈퍼 닌텐도 월드는 정말 대박이었다. 파워업 밴드로 동전 모으고 쿠파 주니어 파이널 배틀까지 클리어! 민우가 최고 점수 달성해서 자랑을 얼마나 하던지 ㅋㅋ

저녁에 우메다 스카이빌딩 올라가서 본 야경은 진짜 숨 막혔다. 바람이 많이 불어서 추웠지만, 360도로 펼쳐지는 오사카 시내 야경은 정말 잊을 수 없을 것 같다.`,
      mood: 'happy',
      locationName: '유니버설 스튜디오 재팬',
      latitude: 34.6654,
      longitude: 135.4323,
    },
  });

  const journal3 = await prisma.journal.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      authorId: userMinwoo.id,
      date: new Date('2025-11-17'),
      title: '교토의 가을, 단풍이 물들다',
      content: `교토 당일치기. 후시미이나리 신사의 도리이 터널은 사진으로 보던 것보다 훨씬 압도적이었다. 아침 일찍 가서 사람이 적을 때 사진 잔뜩 찍었다. 정상까지 올라가니 다리가 풀렸지만 경치가 보상해줬다.

니시키 시장에서 먹방 투어! 다코야끼, 말차 소프트크림, 유바 만쥬... 시장 한 바퀴 돌면서 배가 터질 뻔했다. 특히 교토 절임이 정말 맛있어서 선물용으로 여러 개 샀다.

아라시야마 대나무숲은 단풍 시즌이라 빨강, 노랑 단풍과 초록 대나무가 어우러져서 정말 아름다웠다. 하영이가 이 풍경 보면서 감동받아서 눈물 글썽거렸다 ㅎㅎ

저녁은 가이세키 요리! 코스 하나하나가 예술 작품 같았다. 가격은 좀 했지만 교토에서 이런 경험 한 번쯤은 해야지.`,
      mood: 'peaceful',
      locationName: '교토',
      latitude: 35.0116,
      longitude: 135.7681,
    },
  });

  const journal4 = await prisma.journal.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      authorId: userHayoung.id,
      date: new Date('2025-11-18'),
      title: '안녕 오사카, 또 올게!',
      content: `마지막 날이라 아쉬운 마음으로 시작. 오사카성은 생각보다 훨씬 웅장했고, 천수각 꼭대기에서 바라본 전경이 정말 멋졌다. 가을 단풍과 성이 어우러진 풍경은 잊을 수 없을 듯.

쿠로몬 시장에서 마지막 먹방! 참치 사시미가 입에서 녹았고, 와규 꼬치는 모두가 인정한 이번 여행 최고의 음식이었다. 민우 오빠가 성게알 밥을 혼자 3개나 먹었다 ㅋㅋ

공항에서 면세점 쇼핑까지 마치고, 비행기 타면서 모두 아쉬워했다. 3박 4일이 어떻게 이렇게 빨리 갔는지... 다음엔 도쿄로 가자고 벌써 약속!

이 여행에서 가장 좋았던 건 맛있는 음식도, 아름다운 풍경도 있지만, 결국은 좋은 사람들과 함께했기 때문이 아닐까. 고마워 친구들!`,
      mood: 'love',
      locationName: '오사카',
      latitude: 34.6937,
      longitude: 135.5023,
    },
  });

  console.log('✅ 여행 기록 4개 생성 완료');

  // ============================================
  // 6. 장소 (Place) - 추천 장소 모음
  // ============================================
  const places = await Promise.all([
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '이치란 라멘 도톤보리점',
        address: '7-18 Soemoncho, Chuo Ward, Osaka',
        latitude: 34.6689,
        longitude: 135.5020,
        category: 'food',
        notes: '돈코츠 라멘 맛집. 대기 30분 정도. 혼자 먹는 칸막이 자리가 특색!',
        rating: 5,
        addedBy: userMinwoo.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '유니버설 스튜디오 재팬',
        address: '2-1-33 Sakurajima, Konohana Ward, Osaka',
        latitude: 34.6654,
        longitude: 135.4323,
        category: 'sightseeing',
        notes: '익스프레스 패스 필수! 평일에도 사람 많음. 슈퍼닌텐도월드 & 해리포터 꼭 가기',
        rating: 5,
        addedBy: userJuho.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '후시미이나리 타이샤',
        address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
        latitude: 34.9671,
        longitude: 135.7727,
        category: 'sightseeing',
        notes: '아침 일찍(9시 전) 가면 사람 없어서 사진 찍기 좋음. 정상까지 왕복 2시간',
        rating: 5,
        addedBy: userSoyeon.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '아라시야마 대나무숲',
        address: 'Sagaogurayama Tabuchiyamacho, Ukyo Ward, Kyoto',
        latitude: 35.0094,
        longitude: 135.6722,
        category: 'sightseeing',
        notes: '가을 단풍 시즌(11월 중순) 최고! 토게츠교 근처 카페도 좋음',
        rating: 4,
        addedBy: userHayoung.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '쿠로몬 시장',
        address: '2-4-1 Nipponbashi, Chuo Ward, Osaka',
        latitude: 34.6625,
        longitude: 135.5065,
        category: 'food',
        notes: '참치 사시미, 와규 꼬치, 성게알 밥 강추! 현금 준비 필요한 가게도 있음',
        rating: 5,
        addedBy: userMinwoo.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '우메다 스카이빌딩',
        address: '1-1-88 Oyodonaka, Kita Ward, Osaka',
        latitude: 34.7052,
        longitude: 135.4906,
        category: 'sightseeing',
        notes: '일몰 전에 올라가서 야경까지 보는 게 포인트. 바람 많이 부니 따뜻하게 입기',
        rating: 4,
        addedBy: userMinwoo.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '크로스호텔 오사카',
        address: '2-5-15 Shinsaibashisuji, Chuo Ward, Osaka',
        latitude: 34.6687,
        longitude: 135.5010,
        category: 'accommodation',
        notes: '위치 최고! 도톤보리 도보 3분. 조식 뷔페도 괜찮음. 트윈룸 2개 예약',
        rating: 4,
        addedBy: userJuho.id,
      },
    }),
    prisma.place.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        name: '오사카성',
        address: '1-1 Osakajo, Chuo Ward, Osaka',
        latitude: 34.6873,
        longitude: 135.5262,
        category: 'sightseeing',
        notes: '입장료 600엔. 8층 전망대 꼭 올라가기. 성 주변 공원 산책도 좋음',
        rating: 4,
        addedBy: userSoyeon.id,
      },
    }),
  ]);

  console.log(`✅ 장소 ${places.length}개 생성 완료`);

  // ============================================
  // 7. 경비 (Budget) - 상세 경비 내역
  // ============================================
  const allUserIds = [userJuho.id, userSoyeon.id, userMinwoo.id, userHayoung.id];

  const budgets = await Promise.all([
    // 교통
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userJuho.id,
        title: '피치항공 왕복 항공권 (4인)',
        amount: 1200000,
        currency: 'KRW',
        category: 'transport',
        date: new Date('2025-11-15'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userMinwoo.id,
        title: '난카이 라피트 왕복 (4인)',
        amount: 80000,
        currency: 'KRW',
        category: 'transport',
        date: new Date('2025-11-15'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userSoyeon.id,
        title: 'JR 교토 왕복 (4인)',
        amount: 48000,
        currency: 'KRW',
        category: 'transport',
        date: new Date('2025-11-17'),
        splitAmong: allUserIds,
      },
    }),

    // 숙박
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userJuho.id,
        title: '크로스호텔 오사카 3박 (트윈룸 2개)',
        amount: 960000,
        currency: 'KRW',
        category: 'accommodation',
        date: new Date('2025-11-15'),
        splitAmong: allUserIds,
      },
    }),

    // 관광
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userSoyeon.id,
        title: 'USJ 입장권 (4인)',
        amount: 420000,
        currency: 'KRW',
        category: 'sightseeing',
        date: new Date('2025-11-16'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userSoyeon.id,
        title: 'USJ 익스프레스 패스 4 (4인)',
        amount: 320000,
        currency: 'KRW',
        category: 'sightseeing',
        date: new Date('2025-11-16'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userMinwoo.id,
        title: '우메다 스카이빌딩 입장 (4인)',
        amount: 24000,
        currency: 'KRW',
        category: 'sightseeing',
        date: new Date('2025-11-16'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userHayoung.id,
        title: '오사카성 입장 (4인)',
        amount: 8000,
        currency: 'KRW',
        category: 'sightseeing',
        date: new Date('2025-11-18'),
        splitAmong: allUserIds,
      },
    }),

    // 식비
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userMinwoo.id,
        title: '이치란 라멘 저녁 (4인)',
        amount: 52000,
        currency: 'KRW',
        category: 'food',
        date: new Date('2025-11-15'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userJuho.id,
        title: 'USJ 내 버터비어 & 간식',
        amount: 36000,
        currency: 'KRW',
        category: 'food',
        date: new Date('2025-11-16'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userHayoung.id,
        title: '니시키 시장 점심 (4인)',
        amount: 64000,
        currency: 'KRW',
        category: 'food',
        date: new Date('2025-11-17'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userJuho.id,
        title: '교토 가이세키 저녁 (4인)',
        amount: 280000,
        currency: 'KRW',
        category: 'food',
        date: new Date('2025-11-17'),
        splitAmong: allUserIds,
      },
    }),
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userMinwoo.id,
        title: '쿠로몬 시장 마지막 먹방',
        amount: 88000,
        currency: 'KRW',
        category: 'food',
        date: new Date('2025-11-18'),
        splitAmong: allUserIds,
      },
    }),

    // 쇼핑
    prisma.budget.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        paidBy: userHayoung.id,
        title: '돈키호테 공동구매 (과자, 화장품)',
        amount: 120000,
        currency: 'KRW',
        category: 'shopping',
        date: new Date('2025-11-15'),
        splitAmong: allUserIds,
      },
    }),
  ]);

  console.log(`✅ 경비 ${budgets.length}개 생성 완료`);

  // ============================================
  // 8. 체크리스트 (Checklist)
  // ============================================

  // 짐싸기 체크리스트
  const checklistPacking = await prisma.checklist.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      title: '짐싸기 체크리스트',
      category: 'packing',
      sortOrder: 0,
      createdBy: userJuho.id,
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '여권 & 여권 사본',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-14T20:00:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 0,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '항공권 e-티켓 (인쇄본)',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-14T20:05:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 1,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '호텔 예약 확인서',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-14T20:10:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 2,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '여행자 보험 가입증',
        isChecked: true,
        checkedBy: userSoyeon.id,
        checkedAt: new Date('2025-11-14T19:30:00Z'),
        assignedTo: userSoyeon.id,
        sortOrder: 3,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '포켓와이파이 수령 (공항)',
        isChecked: true,
        checkedBy: userMinwoo.id,
        checkedAt: new Date('2025-11-15T08:00:00Z'),
        assignedTo: userMinwoo.id,
        sortOrder: 4,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '멀티어댑터 (일본용 필요없음, 110V 확인)',
        isChecked: true,
        checkedBy: userHayoung.id,
        checkedAt: new Date('2025-11-14T21:00:00Z'),
        assignedTo: userHayoung.id,
        sortOrder: 5,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '상비약 (소화제, 진통제, 밴드)',
        isChecked: true,
        checkedBy: userSoyeon.id,
        checkedAt: new Date('2025-11-14T18:00:00Z'),
        assignedTo: userSoyeon.id,
        sortOrder: 6,
      },
      {
        id: uuid(),
        checklistId: checklistPacking.id,
        title: '엔화 환전 (1인당 5만엔)',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-13T15:00:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 7,
      },
    ],
  });

  // 예약 확인 체크리스트
  const checklistBooking = await prisma.checklist.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      title: '예약 확인 체크리스트',
      category: 'booking',
      sortOrder: 1,
      createdBy: userSoyeon.id,
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: '피치항공 왕복 항공권 예약 확인',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-10T10:00:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 0,
      },
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: '크로스호텔 오사카 3박 예약 확인',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-10T10:30:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 1,
      },
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: 'USJ 입장권 & 익스프레스 패스 구매',
        isChecked: true,
        checkedBy: userSoyeon.id,
        checkedAt: new Date('2025-11-08T14:00:00Z'),
        assignedTo: userSoyeon.id,
        sortOrder: 2,
      },
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: '포켓와이파이 예약 (공항 수령)',
        isChecked: true,
        checkedBy: userMinwoo.id,
        checkedAt: new Date('2025-11-05T12:00:00Z'),
        assignedTo: userMinwoo.id,
        sortOrder: 3,
      },
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: '교토 가이세키 레스토랑 예약 (19시, 4인)',
        isChecked: true,
        checkedBy: userHayoung.id,
        checkedAt: new Date('2025-11-12T16:00:00Z'),
        assignedTo: userHayoung.id,
        sortOrder: 4,
      },
      {
        id: uuid(),
        checklistId: checklistBooking.id,
        title: '여행자 보험 가입 (4인 모두)',
        isChecked: true,
        checkedBy: userSoyeon.id,
        checkedAt: new Date('2025-11-11T09:00:00Z'),
        assignedTo: userSoyeon.id,
        sortOrder: 5,
      },
    ],
  });

  // 여행 후 할 일
  const checklistAfter = await prisma.checklist.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      title: '여행 후 할 일',
      category: 'general',
      sortOrder: 2,
      createdBy: userJuho.id,
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      {
        id: uuid(),
        checklistId: checklistAfter.id,
        title: '경비 정산하기',
        isChecked: true,
        checkedBy: userJuho.id,
        checkedAt: new Date('2025-11-20T12:00:00Z'),
        assignedTo: userJuho.id,
        sortOrder: 0,
      },
      {
        id: uuid(),
        checklistId: checklistAfter.id,
        title: '사진 공유 앨범 정리',
        isChecked: true,
        checkedBy: userSoyeon.id,
        checkedAt: new Date('2025-11-22T15:00:00Z'),
        assignedTo: userSoyeon.id,
        sortOrder: 1,
      },
      {
        id: uuid(),
        checklistId: checklistAfter.id,
        title: '여행 기록 완성하기',
        isChecked: true,
        checkedBy: userMinwoo.id,
        checkedAt: new Date('2025-11-25T20:00:00Z'),
        assignedTo: userMinwoo.id,
        sortOrder: 2,
      },
      {
        id: uuid(),
        checklistId: checklistAfter.id,
        title: '다음 여행 투표하기 (도쿄 vs 후쿠오카)',
        isChecked: true,
        checkedBy: userHayoung.id,
        checkedAt: new Date('2025-11-30T10:00:00Z'),
        assignedTo: userHayoung.id,
        sortOrder: 3,
      },
    ],
  });

  console.log('✅ 체크리스트 3개 (아이템 18개) 생성 완료');

  // ============================================
  // 9. 댓글 (Comment) - 일정/기록에 대한 댓글
  // ============================================
  const comments = await Promise.all([
    // 일정에 대한 댓글
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userSoyeon.id,
        targetType: 'schedule',
        targetId: schedules[3].id, // 이치란 라멘
        content: '추가면 무료래! 꼭 시키자 ㅎㅎ',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userMinwoo.id,
        targetType: 'schedule',
        targetId: schedules[3].id,
        content: '차슈 토핑 추가도 가능한가? 가격이 얼마지?',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        targetType: 'schedule',
        targetId: schedules[5].id, // USJ
        content: '해리포터 에리어는 개장 직후에 바로 가야 해. 시간 지나면 입장 제한 걸릴 수 있음!',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userHayoung.id,
        targetType: 'schedule',
        targetId: schedules[12].id, // 아라시야마
        content: '대나무숲에서 기모노 입고 사진 찍고 싶다! 근처에 대여점 있나?',
      },
    }),

    // 기록에 대한 댓글
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userSoyeon.id,
        targetType: 'journal',
        targetId: journal1.id,
        content: '추가면 두 번 시킨 건 비밀로 해줘 ㅋㅋㅋ',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userMinwoo.id,
        targetType: 'journal',
        targetId: journal2.id,
        content: '슈퍼닌텐도월드 최고점 기록은 영원히 내 것 😎',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        targetType: 'journal',
        targetId: journal3.id,
        content: '가이세키 요리 진짜 예술이었어. 다음엔 더 비싼 코스 도전해볼까?',
      },
    }),
    prisma.comment.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userMinwoo.id,
        targetType: 'journal',
        targetId: journal4.id,
        content: '성게알 3개는 사실이지만 후회 없어 ㅋㅋ 다음엔 도쿄 가자!',
      },
    }),
  ]);

  console.log(`✅ 댓글 ${comments.length}개 생성 완료`);

  // ============================================
  // 10. 활동 로그 (ActivityLog) - 피드용
  // ============================================
  const now = new Date();
  const activityLogs = await Promise.all([
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'created',
        targetType: 'trip',
        targetId: tripOsaka.id,
        description: '새 여행 "오사카 먹방 여행 🍣"을 만들었습니다.',
        createdAt: new Date('2025-10-20T10:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'created',
        targetType: 'member',
        description: '박소연님을 여행에 초대했습니다.',
        createdAt: new Date('2025-10-20T10:05:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'created',
        targetType: 'member',
        description: '이민우님을 여행에 초대했습니다.',
        createdAt: new Date('2025-10-20T10:06:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'created',
        targetType: 'member',
        description: '최하영님을 여행에 초대했습니다.',
        createdAt: new Date('2025-10-20T10:07:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userSoyeon.id,
        action: 'created',
        targetType: 'schedule',
        targetId: schedules[2].id,
        description: '일정 "도톤보리 거리 산책 & 글리코상"을 추가했습니다.',
        createdAt: new Date('2025-10-25T14:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userSoyeon.id,
        action: 'created',
        targetType: 'checklist',
        targetId: checklistBooking.id,
        description: '체크리스트 "예약 확인 체크리스트"를 만들었습니다.',
        createdAt: new Date('2025-10-28T09:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userMinwoo.id,
        action: 'created',
        targetType: 'place',
        targetId: places[0].id,
        description: '장소 "이치란 라멘 도톤보리점"을 추가했습니다.',
        createdAt: new Date('2025-11-01T20:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'updated',
        targetType: 'trip',
        targetId: tripOsaka.id,
        description: '여행 상태를 "진행중"으로 변경했습니다.',
        createdAt: new Date('2025-11-15T08:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'created',
        targetType: 'journal',
        targetId: journal1.id,
        description: '기록 "드디어 오사카 도착!"을 작성했습니다.',
        createdAt: new Date('2025-11-15T22:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userSoyeon.id,
        action: 'created',
        targetType: 'journal',
        targetId: journal2.id,
        description: '기록 "USJ 완전 정복한 날"을 작성했습니다.',
        createdAt: new Date('2025-11-16T23:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userMinwoo.id,
        action: 'created',
        targetType: 'budget',
        targetId: budgets[8].id,
        description: '경비 "이치란 라멘 저녁 (4인)" ₩52,000을 추가했습니다.',
        createdAt: new Date('2025-11-15T19:30:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userHayoung.id,
        action: 'created',
        targetType: 'journal',
        targetId: journal4.id,
        description: '기록 "안녕 오사카, 또 올게!"를 작성했습니다.',
        createdAt: new Date('2025-11-18T23:00:00Z'),
      },
    }),
    prisma.activityLog.create({
      data: {
        id: uuid(),
        tripId: tripOsaka.id,
        userId: userJuho.id,
        action: 'updated',
        targetType: 'trip',
        targetId: tripOsaka.id,
        description: '여행 상태를 "완료"로 변경했습니다.',
        createdAt: new Date('2025-11-19T10:00:00Z'),
      },
    }),
  ]);

  console.log(`✅ 활동 로그 ${activityLogs.length}개 생성 완료`);

  // ============================================
  // 11. 채팅 메시지 (ChatMessage)
  // ============================================
  const chatMsg1 = await prisma.chatMessage.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      senderId: userJuho.id,
      content: '다들 여권 챙겼지?! 내일 10시까지 2터미널 집합!',
      messageType: 'text',
      isPinned: true,
      readBy: allUserIds,
      createdAt: new Date('2025-11-14T21:00:00Z'),
    },
  });

  const chatMsg2 = await prisma.chatMessage.create({
    data: {
      id: uuid(),
      tripId: tripOsaka.id,
      senderId: userSoyeon.id,
      content: '넹~ 다 챙겼어요! 설렌다 ㅎㅎ',
      messageType: 'text',
      replyToId: chatMsg1.id,
      readBy: allUserIds,
      createdAt: new Date('2025-11-14T21:02:00Z'),
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userMinwoo.id,
        content: '환전 다 했어? 나 5만엔 했는데 부족하려나',
        messageType: 'text',
        replyToId: chatMsg1.id,
        readBy: allUserIds,
        createdAt: new Date('2025-11-14T21:05:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userHayoung.id,
        content: '카드도 되니까 5만엔이면 충분할 듯!',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-14T21:07:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userJuho.id,
        content: '도톤보리 도착!! 글리코 러닝맨 앞이야 빨리 와~',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-15T16:35:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userSoyeon.id,
        content: '이치란 줄이 생각보다 길다... 30분은 기다려야 할듯 😅',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-15T17:45:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userMinwoo.id,
        content: '라멘 진짜 역대급이다... 추가면 시키는 중',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-15T18:30:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userJuho.id,
        content: 'USJ 해리포터 에리어 지금 대기 10분! 지금 바로 가자!',
        messageType: 'text',
        isPinned: true,
        readBy: allUserIds,
        createdAt: new Date('2025-11-16T09:15:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userHayoung.id,
        content: '아라시야마 단풍 진짜 미쳤다... 이게 실화냐',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-17T15:00:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userMinwoo.id,
        content: '쿠로몬 시장 와규 꼬치 이건 진짜 인생 음식...',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-18T14:30:00Z'),
      },
      {
        id: uuid(),
        tripId: tripOsaka.id,
        senderId: userSoyeon.id,
        content: '다들 고마워! 최고의 여행이었어 💕 다음엔 도쿄 가자!',
        messageType: 'text',
        readBy: allUserIds,
        createdAt: new Date('2025-11-18T22:00:00Z'),
      },
    ],
  });

  console.log('✅ 채팅 메시지 11개 생성 완료');

  // ============================================
  // 12. 알림 (Notification)
  // ============================================
  await prisma.notification.createMany({
    data: [
      {
        id: uuid(),
        userId: userSoyeon.id,
        tripId: tripOsaka.id,
        type: 'invite',
        title: '여행 초대',
        message: '김주호님이 "오사카 먹방 여행 🍣"에 초대했습니다.',
        isRead: true,
      },
      {
        id: uuid(),
        userId: userMinwoo.id,
        tripId: tripOsaka.id,
        type: 'invite',
        title: '여행 초대',
        message: '김주호님이 "오사카 먹방 여행 🍣"에 초대했습니다.',
        isRead: true,
      },
      {
        id: uuid(),
        userId: userHayoung.id,
        tripId: tripOsaka.id,
        type: 'invite',
        title: '여행 초대',
        message: '김주호님이 "오사카 먹방 여행 🍣"에 초대했습니다.',
        isRead: true,
      },
      {
        id: uuid(),
        userId: userJuho.id,
        tripId: tripOsaka.id,
        type: 'journal',
        title: '새 기록',
        message: '박소연님이 "USJ 완전 정복한 날" 기록을 작성했습니다.',
        isRead: true,
      },
      {
        id: uuid(),
        userId: userJuho.id,
        tripId: tripOsaka.id,
        type: 'comment',
        title: '새 댓글',
        message: '이민우님이 "이치란 라멘 저녁" 일정에 댓글을 달았습니다.',
        isRead: true,
      },
      {
        id: uuid(),
        userId: userJuho.id,
        tripId: tripOsaka.id,
        type: 'budget',
        title: '경비 추가',
        message: '최하영님이 "돈키호테 공동구매" ₩120,000 경비를 추가했습니다.',
        isRead: true,
      },
    ],
  });

  console.log('✅ 알림 6개 생성 완료');

  // ============================================
  // 완료!
  // ============================================
  console.log('\n🎉 시드 데이터 생성 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 생성된 데이터 요약:');
  console.log('   👤 사용자: 4명 (김주호, 박소연, 이민우, 최하영)');
  console.log('   ✈️  여행: 1개 (오사카 먹방 여행 - 완료)');
  console.log('   👥 멤버: 4명 (owner 1 + traveler 2 + friend 1)');
  console.log(`   📅 일정: ${schedules.length}개 (4일간)`);
  console.log('   📔 기록: 4개 (매일 1개씩, 감정 포함)');
  console.log(`   📍 장소: ${places.length}개 (맛집, 관광지, 숙소)`);
  console.log(`   💰 경비: ${budgets.length}개 (교통/숙박/관광/식비/쇼핑)`);
  console.log('   ✅ 체크리스트: 3개 (아이템 18개, 모두 완료)');
  console.log(`   💬 댓글: ${comments.length}개`);
  console.log(`   📋 활동 로그: ${activityLogs.length}개`);
  console.log('   🗨️  채팅: 11개 (답장, 고정 메시지 포함)');
  console.log('   🔔 알림: 6개');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔑 로그인 정보:');
  console.log('   이메일: juho@example.com / 비밀번호: password123');
  console.log('   이메일: soyeon@example.com / 비밀번호: password123');
  console.log('   이메일: minwoo@example.com / 비밀번호: password123');
  console.log('   이메일: hayoung@example.com / 비밀번호: password123');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
