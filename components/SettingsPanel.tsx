"use client";
import { useState } from "react";
import { Character, Raid } from "@/types";
import { v4 as uuid } from "uuid";

interface Props {
  chars: Character[];
  raids: Raid[];
  onUpdateChars: (chars: Character[]) => void;
  onUpdateRaids: (raids: Raid[]) => void;
}

type ModalType =
  | { type: "char"; data: Character }
  | { type: "raid"; data: Raid }
  | null;

const emptyChar = (): Character => ({ id: uuid(), name: "", cls: "", ilvl: 0 });
const emptyRaid = (): Raid => ({ id: uuid(), name: "", diff: "노말", gold: 0 });

export default function SettingsPanel({
  chars,
  raids,
  onUpdateChars,
  onUpdateRaids,
}: Props) {
  const [modal, setModal] = useState<ModalType>(null);

  function saveChar(c: Character) {
    const exists = chars.find((x) => x.id === c.id);
    onUpdateChars(
      exists ? chars.map((x) => (x.id === c.id ? c : x)) : [...chars, c],
    );
    setModal(null);
  }

  function deleteChar(id: string) {
    onUpdateChars(chars.filter((c) => c.id !== id));
    setModal(null);
  }

  function saveRaid(r: Raid) {
    const exists = raids.find((x) => x.id === r.id);
    onUpdateRaids(
      exists ? raids.map((x) => (x.id === r.id ? r : x)) : [...raids, r],
    );
    setModal(null);
  }

  function deleteRaid(id: string) {
    onUpdateRaids(raids.filter((r) => r.id !== id));
    setModal(null);
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs font-medium text-gray-400 mb-2 tracking-wide">
          캐릭터 관리
        </div>
        <div className="flex flex-col gap-2 mb-3">
          {chars.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">
                  {c.name}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {c.cls} · {c.ilvl.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setModal({ type: "char", data: { ...c } })}
                className="text-xs px-3 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
              >
                편집
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setModal({ type: "char", data: emptyChar() })}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
        >
          + 캐릭터 추가
        </button>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-400 mb-2 tracking-wide">
          레이드 관리
        </div>
        <div className="flex flex-col gap-2 mb-3">
          {raids.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">
                  {r.name}
                </span>
                <span className="text-xs text-gray-400 ml-2">{r.diff}</span>
              </div>
              <span className="text-sm font-medium text-amber-600">
                {r.gold.toLocaleString()} G
              </span>
              <button
                onClick={() => setModal({ type: "raid", data: { ...r } })}
                className="text-xs px-3 py-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
              >
                편집
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setModal({ type: "raid", data: emptyRaid() })}
          className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
        >
          + 레이드 추가
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-sm">
            {modal.type === "char" ? (
              <CharForm
                data={modal.data}
                isNew={!chars.find((c) => c.id === modal.data.id)}
                onSave={saveChar}
                onDelete={() => deleteChar(modal.data.id)}
                onCancel={() => setModal(null)}
              />
            ) : (
              <RaidForm
                data={modal.data}
                isNew={!raids.find((r) => r.id === modal.data.id)}
                onSave={saveRaid}
                onDelete={() => deleteRaid(modal.data.id)}
                onCancel={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CharForm({
  data,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: {
  data: Character;
  isNew: boolean;
  onSave: (c: Character) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(data);
  return (
    <div>
      <div className="text-base font-medium text-gray-800 mb-4">
        {isNew ? "캐릭터 추가" : "캐릭터 편집"}
      </div>
      {[
        {
          label: "캐릭터 이름",
          key: "name",
          type: "text",
          placeholder: "이름",
        },
        { label: "직업", key: "cls", type: "text", placeholder: "직업" },
        {
          label: "아이템 레벨",
          key: "ilvl",
          type: "number",
          placeholder: "1600",
        },
      ].map((f) => (
        <div key={f.key} className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
          <input
            type={f.type}
            placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChange={(e) =>
              setForm({
                ...form,
                [f.key]:
                  f.type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300"
          />
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          취소
        </button>
        {!isNew && (
          <button
            onClick={onDelete}
            className="flex-1 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            삭제
          </button>
        )}
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-2 border border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50"
        >
          {isNew ? "추가" : "저장"}
        </button>
      </div>
    </div>
  );
}

function RaidForm({
  data,
  isNew,
  onSave,
  onDelete,
  onCancel,
}: {
  data: Raid;
  isNew: boolean;
  onSave: (r: Raid) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(data);
  return (
    <div>
      <div className="text-base font-medium text-gray-800 mb-4">
        {isNew ? "레이드 추가" : "레이드 편집"}
      </div>
      {[
        {
          label: "레이드 이름",
          key: "name",
          type: "text",
          placeholder: "레이드 이름",
        },
        {
          label: "난이도",
          key: "diff",
          type: "text",
          placeholder: "노말 / 하드",
        },
        { label: "골드", key: "gold", type: "number", placeholder: "0" },
        {
          label: "더보기 비용",
          key: "extraCost",
          type: "number",
          placeholder: "0",
        },
      ].map((f) => (
        <div key={f.key} className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
          <input
            type={f.type}
            placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChange={(e) =>
              setForm({
                ...form,
                [f.key]:
                  f.type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-300"
          />
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          취소
        </button>
        {!isNew && (
          <button
            onClick={onDelete}
            className="flex-1 py-2 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            삭제
          </button>
        )}
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-2 border border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50"
        >
          {isNew ? "추가" : "저장"}
        </button>
      </div>
    </div>
  );
}
