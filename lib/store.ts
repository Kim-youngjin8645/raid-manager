import { Character, Raid, Progress } from "@/types";

const DEFAULT_CHARS: Character[] = [
  { id: "c1", name: "캐릭터1", cls: "직업", ilvl: 1600 },
];

const DEFAULT_RAIDS: Raid[] = [
  {
    id: "4m_n",
    name: "4막 파멸의 성채",
    diff: "노말",
    gold: 33000,
    extraCost: 10500,
    minIlvl: 1700,
  },
  {
    id: "4m_h",
    name: "4막 파멸의 성채",
    diff: "하드",
    gold: 42000,
    extraCost: 13500,
    minIlvl: 1720,
  },
  {
    id: "jong_n",
    name: "종막 최후의 날",
    diff: "노말",
    gold: 40000,
    extraCost: 12800,
    minIlvl: 1710,
  },
  {
    id: "jong_h",
    name: "종막 최후의 날",
    diff: "하드",
    gold: 52000,
    extraCost: 16600,
    minIlvl: 1730,
  },
  {
    id: "serca_n",
    name: "세르카",
    diff: "노말",
    gold: 35000,
    extraCost: 11200,
    minIlvl: 1710,
  },
  {
    id: "serca_h",
    name: "세르카",
    diff: "하드",
    gold: 44000,
    extraCost: 14100,
    minIlvl: 1730,
  },
  {
    id: "serca_nm",
    name: "세르카",
    diff: "나이트메어",
    gold: 54000,
    extraCost: 17300,
    minIlvl: 1740,
  },
  {
    id: "jipy_1",
    name: "지평의 성당",
    diff: "1단계",
    gold: 30000,
    bound: true,
    extraCost: 9600,
    minIlvl: 1700,
  },
  {
    id: "jipy_2",
    name: "지평의 성당",
    diff: "2단계",
    gold: 40000,
    bound: true,
    extraCost: 12800,
    minIlvl: 1720,
  },
  {
    id: "jipy_3",
    name: "지평의 성당",
    diff: "3단계",
    gold: 50000,
    bound: true,
    extraCost: 16000,
    minIlvl: 1750,
  },
];

export function loadChars(): Character[] {
  try {
    const d = localStorage.getItem("loa_chars");
    return d ? JSON.parse(d) : DEFAULT_CHARS;
  } catch {
    return DEFAULT_CHARS;
  }
}

export function saveChars(chars: Character[]) {
  localStorage.setItem("loa_chars", JSON.stringify(chars));
}

export function loadRaids(): Raid[] {
  try {
    const d = localStorage.getItem("loa_raids");
    return d ? JSON.parse(d) : DEFAULT_RAIDS;
  } catch {
    return DEFAULT_RAIDS;
  }
}

export function saveRaids(raids: Raid[]) {
  localStorage.setItem("loa_raids", JSON.stringify(raids));
}

export function loadProgress(): Progress {
  try {
    const d = localStorage.getItem("loa_progress");
    return d ? JSON.parse(d) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress) {
  localStorage.setItem("loa_progress", JSON.stringify(progress));
}

export function checkWeeklyReset(progress: Progress): Progress {
  const lastReset = localStorage.getItem("loa_last_reset");
  const now = new Date();
  const lastWed = getLastWednesday();
  if (!lastReset || new Date(lastReset) < lastWed) {
    localStorage.setItem("loa_last_reset", now.toISOString());
    return {};
  }
  return progress;
}

function getLastWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day >= 3 ? day - 3 : day + 4;
  const wed = new Date(now);
  wed.setDate(now.getDate() - diff);
  wed.setHours(6, 0, 0, 0);
  return wed;
}

export interface BestCombo {
  raids: Raid[];
  totalGold: number;
  normalGold: number;
  boundGold: number;
}

export function calcBestCombo(ilvl: number, raids: Raid[]): BestCombo {
  const available = raids.filter((r) => r.minIlvl && ilvl >= r.minIlvl);

  // 같은 레이드 이름은 가장 높은 난이도만 선택 (노말/하드/나이트메어 중 하나)
  const raidGroups: { [name: string]: Raid[] } = {};
  available.forEach((r) => {
    if (!raidGroups[r.name]) raidGroups[r.name] = [];
    raidGroups[r.name].push(r);
  });

  // 각 레이드 그룹에서 골드 가장 높은 난이도 하나만 선택
  const candidates = Object.values(raidGroups).map((group) =>
    group.reduce((best, r) => (r.gold > best.gold ? r : best)),
  );

  // 골드 높은 순 정렬 후 상위 3개 선택 (주간 골드 지급 최대 3개)
  const top3 = candidates.sort((a, b) => b.gold - a.gold).slice(0, 3);

  const totalGold = top3.reduce((a, r) => a + r.gold, 0);
  const normalGold = top3
    .filter((r) => !r.bound)
    .reduce((a, r) => a + r.gold, 0);
  const boundGold = top3.filter((r) => r.bound).reduce((a, r) => a + r.gold, 0);

  return { raids: top3, totalGold, normalGold, boundGold };
}
