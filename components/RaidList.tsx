"use client";
import { useState } from "react";
import { Character, Raid, Progress } from "@/types";
import { calcBestCombo } from "@/lib/store";

interface Props {
  character: Character;
  raids: Raid[];
  progress: Progress;
  onToggle: (charId: string, raidId: string) => void;
  onToggleExtra: (charId: string, raidId: string) => void;
}

export default function RaidList({
  character,
  raids,
  progress,
  onToggle,
  onToggleExtra,
}: Props) {
  const [showExtra, setShowExtra] = useState(false);

  const ilvl = character.ilvl;

  // 입장 가능한 레이드
  const available = raids.filter((r) => r.minIlvl && ilvl >= r.minIlvl);

  // 레이드 이름별 최고 난이도만 추출
  const raidGroups: { [name: string]: Raid[] } = {};
  available.forEach((r) => {
    if (!raidGroups[r.name]) raidGroups[r.name] = [];
    raidGroups[r.name].push(r);
  });

  const topRaids = Object.values(raidGroups).map((group) =>
    group.reduce((best, r) => (r.gold > best.gold ? r : best)),
  );

  // 하위 난이도 (최고 난이도 제외한 나머지)
  const topRaidIds = new Set(topRaids.map((r) => r.id));
  const subRaids = available.filter((r) => !topRaidIds.has(r.id));

  // 상위 3개 골드 슬롯
  const combo = calcBestCombo(ilvl, raids);
  const goldSlotIds = new Set(combo.raids.map((r) => r.id));

  // 골드 계산 (상위 3개만 골드 반영)
  const earned = [...topRaids, ...(showExtra ? subRaids : [])].reduce(
    (a, r) => {
      const s = progress[character.id]?.[r.id];
      if (!s?.done) return a;
      if (!goldSlotIds.has(r.id)) return a;
      const extra = s.extra ? (r.extraCost ?? 0) : 0;
      return a + r.gold - extra;
    },
    0,
  );

  const earnedBound = [...topRaids, ...(showExtra ? subRaids : [])].reduce(
    (a, r) => {
      if (!r.bound) return a;
      const s = progress[character.id]?.[r.id];
      if (!s?.done) return a;
      if (!goldSlotIds.has(r.id)) return a;
      const extra = s.extra ? (r.extraCost ?? 0) : 0;
      return a + r.gold - extra;
    },
    0,
  );

  function renderRaidRow(r: Raid, isGoldSlot: boolean) {
    const s = progress[character.id]?.[r.id];
    const done = !!s?.done;
    const extra = !!s?.extra;
    const netGold = r.gold - (extra ? (r.extraCost ?? 0) : 0);

    const diffColor =
      r.diff === "하드" || r.diff === "나이트메어"
        ? "text-orange-400"
        : r.bound
          ? "text-blue-400"
          : "text-gray-400";

    return (
      <div
        key={r.id}
        className={[
          "rounded-lg border overflow-hidden",
          done ? "opacity-60" : "",
          r.bound ? "border-blue-100" : "border-gray-200",
        ].join(" ")}
      >
        <div
          onClick={() => onToggle(character.id, r.id)}
          className={[
            "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
            done
              ? r.bound
                ? "bg-blue-50"
                : "bg-green-50"
              : r.bound
                ? "bg-blue-50"
                : "bg-white",
          ].join(" ")}
        >
          <div
            className={[
              "w-5 h-5 rounded flex items-center justify-center border flex-shrink-0",
              done
                ? r.bound
                  ? "bg-blue-100 border-blue-400"
                  : "bg-green-100 border-green-400"
                : r.bound
                  ? "border-blue-300"
                  : "border-gray-300",
            ].join(" ")}
          >
            {done && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <polyline
                  points="1.5,5 4,7.5 8.5,2.5"
                  stroke={r.bound ? "#60a5fa" : "#22c55e"}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div
              className={`text-sm font-medium ${done ? "text-gray-400 line-through" : "text-gray-800"}`}
            >
              {r.name}
            </div>
            <div className={`text-xs mt-0.5 ${diffColor}`}>{r.diff}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {r.bound && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-500">
                귀속
              </span>
            )}
            {!isGoldSlot ? (
              <span className="text-xs text-gray-300">0 G</span>
            ) : (
              <div
                className={`text-sm font-medium ${done ? "text-gray-400" : r.bound ? "text-blue-500" : "text-amber-600"}`}
              >
                {done ? netGold.toLocaleString() : r.gold.toLocaleString()} G
              </div>
            )}
          </div>
        </div>

        {done && isGoldSlot && r.extraCost && (
          <div
            onClick={() => onToggleExtra(character.id, r.id)}
            className={[
              "flex items-center gap-2 px-3 py-1.5 border-t cursor-pointer text-xs",
              extra
                ? "bg-red-50 border-red-100 text-red-400"
                : "bg-gray-50 border-gray-100 text-gray-400",
            ].join(" ")}
          >
            <div
              className={[
                "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0",
                extra ? "bg-red-100 border-red-400" : "border-gray-300",
              ].join(" ")}
            >
              {extra && (
                <svg width="8" height="8" viewBox="0 0 10 10">
                  <polyline
                    points="1.5,5 4,7.5 8.5,2.5"
                    stroke="#f87171"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span>
              더보기 구매{" "}
              {extra
                ? `(-${(r.extraCost ?? 0).toLocaleString()} G 차감)`
                : `(${(r.extraCost ?? 0).toLocaleString()} G)`}
            </span>
          </div>
        )}
      </div>
    );
  }

  const normalTop = topRaids.filter((r) => !r.bound);
  const boundTop = topRaids.filter((r) => r.bound);
  const normalSub = subRaids.filter((r) => !r.bound);
  const boundSub = subRaids.filter((r) => r.bound);

  if (available.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-10">
        아이템 레벨이 낮아 입장 가능한 레이드가 없어요
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">전체 골드</div>
          <div className="text-lg font-medium text-gray-800">
            {earned.toLocaleString()}
            <span className="text-xs text-gray-400 ml-1">G</span>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-xs text-amber-400 mb-1">일반 골드</div>
          <div className="text-lg font-medium text-amber-600">
            {(earned - earnedBound).toLocaleString()}
            <span className="text-xs text-amber-300 ml-1">G</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-400 mb-1">귀속 골드</div>
          <div className="text-lg font-medium text-blue-500">
            {earnedBound.toLocaleString()}
            <span className="text-xs text-blue-300 ml-1">G</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {normalTop.map((r) => renderRaidRow(r, goldSlotIds.has(r.id)))}
      </div>

      {boundTop.length > 0 && (
        <>
          <div className="text-xs font-medium text-blue-400 mb-2 tracking-wide">
            귀속 골드 컨텐츠
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {boundTop.map((r) => renderRaidRow(r, goldSlotIds.has(r.id)))}
          </div>
        </>
      )}

      {subRaids.length > 0 && (
        <>
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:bg-gray-50 mb-3"
          >
            {showExtra
              ? "▲ 하위 난이도 접기"
              : `▼ 하위 난이도 보기 (${subRaids.length}개)`}
          </button>

          {showExtra && (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {normalSub.map((r) => renderRaidRow(r, goldSlotIds.has(r.id)))}
              </div>
              {boundSub.length > 0 && (
                <>
                  <div className="text-xs font-medium text-blue-400 mb-2 tracking-wide">
                    귀속 골드 컨텐츠
                  </div>
                  <div className="flex flex-col gap-2">
                    {boundSub.map((r) =>
                      renderRaidRow(r, goldSlotIds.has(r.id)),
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
