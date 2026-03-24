"use client";
import { Character, Raid, Progress } from "@/types";
import { BestCombo, calcBestCombo } from "@/lib/store";

interface Props {
  chars: Character[];
  raids: Raid[];
  progress: Progress;
}

export default function SummaryAll({ chars, raids, progress }: Props) {
  const getEarned = (charId: string) =>
    raids.reduce((a, r) => {
      const s = progress[charId]?.[r.id];
      if (!s?.done) return a;
      const extra = s.extra ? (r.extraCost ?? 0) : 0;
      return a + r.gold - extra;
    }, 0);

  const totalEarned = chars.reduce((a, c) => a + getEarned(c.id), 0);
  const totalMaxAll = chars.reduce(
    (a, c) => a + calcBestCombo(c.ilvl, raids).totalGold,
    0,
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">전체 획득 골드</div>
          <div className="text-xl font-medium text-gray-800">
            {totalEarned.toLocaleString()}
            <span className="text-sm text-gray-400 ml-1">G</span>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="text-xs text-amber-400 mb-1">전체 최대 골드</div>
          <div className="text-xl font-medium text-amber-600">
            {totalMaxAll.toLocaleString()}
            <span className="text-sm text-amber-300 ml-1">G</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {chars.map((c) => {
          const earned = getEarned(c.id);
          const combo: BestCombo = calcBestCombo(c.ilvl, raids);
          const pct =
            combo.totalGold > 0
              ? Math.round((earned / combo.totalGold) * 100)
              : 0;

          return (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-800">
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {c.cls} · {c.ilvl.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-amber-600">
                  {earned.toLocaleString()}{" "}
                  <span className="text-xs text-gray-400">
                    / {combo.totalGold.toLocaleString()} G
                  </span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {combo.raids.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-400 mb-0.5">
                    최대 골드 조합
                  </div>
                  {combo.raids.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.bound ? "bg-blue-400" : "bg-amber-400"}`}
                        />
                        <span className="text-xs text-gray-600">
                          {r.name} {r.diff}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium ${r.bound ? "text-blue-500" : "text-amber-600"}`}
                      >
                        {r.gold.toLocaleString()} G
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-1 pt-1 border-t border-gray-100">
                    <div className="flex gap-3">
                      <span className="text-xs text-amber-500">
                        일반 {combo.normalGold.toLocaleString()} G
                      </span>
                      {combo.boundGold > 0 && (
                        <span className="text-xs text-blue-400">
                          귀속 {combo.boundGold.toLocaleString()} G
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-1">
                  입장 가능한 레이드 없음
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
