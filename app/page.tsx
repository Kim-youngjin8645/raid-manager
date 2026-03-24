"use client";
import { useState, useEffect } from "react";
import { Character, Raid, Progress } from "@/types";
import {
  loadChars,
  saveChars,
  loadRaids,
  saveRaids,
  loadProgress,
  saveProgress,
  checkWeeklyReset,
} from "@/lib/store";
import RaidList from "@/components/RaidList";
import SummaryAll from "@/components/SummaryAll";
import SettingsPanel from "@/components/SettingsPanel";

type Tab = "raid" | "all" | "settings";

export default function Home() {
  const [chars, setChars] = useState<Character[]>([]);
  const [raids, setRaids] = useState<Raid[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [activeChar, setActiveChar] = useState(0);
  const [tab, setTab] = useState<Tab>("raid");
  const [resetTimer, setResetTimer] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const c = loadChars();
    const r = loadRaids();
    const p = checkWeeklyReset(loadProgress());
    setChars(c);
    setRaids(r);
    setProgress(p);
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date();
      const day = now.getDay();
      const daysUntilWed = (3 - day + 7) % 7 || 7;
      next.setDate(now.getDate() + daysUntilWed);
      next.setHours(6, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setResetTimer(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function updateChars(c: Character[]) {
    setChars(c);
    saveChars(c);
  }

  function updateRaids(r: Raid[]) {
    setRaids(r);
    saveRaids(r);
  }

  function toggleRaid(charId: string, raidId: string) {
    const s = progress[charId]?.[raidId] ?? { gold: false, done: false };
    const slots = raids.filter((r) => progress[charId]?.[r.id]?.gold).length;
    let next = { ...s };
    if (!s.gold && !s.done) {
      if (slots < 3) next = { gold: true, done: false };
      else next = { gold: false, done: true };
    } else if (s.gold && !s.done) {
      next = { gold: false, done: true };
    } else {
      next = { gold: false, done: false };
    }
    const updated = {
      ...progress,
      [charId]: { ...progress[charId], [raidId]: next },
    };
    setProgress(updated);
    saveProgress(updated);
  }
  function toggleExtra(charId: string, raidId: string) {
    const s = progress[charId]?.[raidId] ?? { gold: false, done: false };
    const updated = {
      ...progress,
      [charId]: {
        ...progress[charId],
        [raidId]: { ...s, extra: !s.extra },
      },
    };
    setProgress(updated);
    saveProgress(updated);
  }

  if (!mounted) return null;

  const currentChar = chars[activeChar];

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-medium text-gray-800">로아 골드 트래커</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-md">
          주간초기화 {resetTimer}
        </span>
      </div>

      <div className="flex gap-2 mb-5">
        {(["raid", "all", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "text-sm px-4 py-1.5 rounded-lg border transition-all",
              tab === t
                ? "bg-blue-50 text-blue-600 border-blue-200 font-medium"
                : "text-gray-500 border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {t === "raid" ? "레이드" : t === "all" ? "전체 요약" : "설정"}
          </button>
        ))}
      </div>

      {tab === "raid" && (
        <>
          <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
            {chars.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setActiveChar(i)}
                className={[
                  "min-w-[80px] flex-shrink-0 text-center px-3 py-2 rounded-xl border cursor-pointer",
                  i === activeChar
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                ].join(" ")}
              >
                <div className="text-xs text-gray-400">{c.cls}</div>
                <div
                  className={`text-sm font-medium ${i === activeChar ? "text-blue-600" : "text-gray-800"}`}
                >
                  {c.name}
                </div>
                <div className="text-xs text-gray-400">
                  {c.ilvl.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {currentChar ? (
            <RaidList
              character={currentChar}
              raids={raids}
              progress={progress}
              onToggle={toggleRaid}
              onToggleExtra={toggleExtra}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">
              설정에서 캐릭터를 추가해주세요
            </p>
          )}
        </>
      )}

      {tab === "all" && (
        <SummaryAll chars={chars} raids={raids} progress={progress} />
      )}

      {tab === "settings" && (
        <SettingsPanel
          chars={chars}
          raids={raids}
          onUpdateChars={updateChars}
          onUpdateRaids={updateRaids}
        />
      )}
    </main>
  );
}
