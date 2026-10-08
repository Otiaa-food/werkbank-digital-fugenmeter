"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { PROFILES, evalFormula, fmt, type BrancheKey } from "@/lib/branches";
import { addEntryAction, type AddEntryState } from "../_actions/actions";

const ALL_UNITS = ["m", "m²", "m³", "Stück", "Std."];
const initialState: AddEntryState = undefined;

export function EntryForm({
  projectId,
  branche,
  etagenVorschlaege,
  raeumeVorschlaege,
}: {
  projectId: string;
  branche: BrancheKey;
  etagenVorschlaege: string[];
  raeumeVorschlaege: string[];
}) {
  const profile = PROFILES[branche];
  const action = addEntryAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [position, setPosition] = useState("");
  const [einheit, setEinheit] = useState(profile.positions[0]?.unit ?? "m");
  const [formel, setFormel] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState("");

  useEffect(() => {
    // Bequemlichkeit pro Gerät: letztes Kürzel vorbelegen (bewusst erst nach dem
    // ersten Render, um Server/Client-Hydration nicht zu verwerfen).
    try {
      const last = localStorage.getItem("masswerk_last_mitarbeiter");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- gewollte Hydration aus localStorage
      if (last) setMitarbeiter(last);
    } catch {}
  }, []);

  const preview = evalFormula(formel);

  useEffect(() => {
    if (state === undefined && formRef.current) {
      // Nach erfolgreichem Speichern: nur Position/Formel leeren, Etage/Raum bleiben stehen
      setPosition("");
      setFormel("");
      if (mitarbeiter) {
        try {
          localStorage.setItem("masswerk_last_mitarbeiter", mitarbeiter);
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#587064]">
            {profile.etageLabel}
          </span>
          <input
            name="etage"
            list="etage-list"
            placeholder={`z. B. ${etagenVorschlaege[0] ?? ""}`}
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
          />
          <datalist id="etage-list">
            {etagenVorschlaege.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </label>
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#587064]">
            {profile.raumLabel}
          </span>
          <input
            name="raum"
            list="raum-list"
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
          />
          <datalist id="raum-list">
            {raeumeVorschlaege.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#587064] block mb-1.5">
          Position
        </span>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {profile.positions.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPosition(p.name);
                setEinheit(p.unit);
              }}
              className={`text-xs font-[family-name:var(--font-display)] font-bold tracking-wide px-3 py-1.5 rounded-full border ${
                position === p.name
                  ? "bg-[#1F6B58] border-[#1F6B58] text-white"
                  : "bg-white border-[#C3D8CC] text-[#587064]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <input
          name="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder={`z. B. ${profile.positions[0]?.name ?? ""}`}
          className="w-full border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
        />
      </div>

      <div className="flex gap-2">
        <label className="flex-[2] flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#587064]">
            Menge (Rechnung wie auf dem Zettel)
          </span>
          <input
            name="formel"
            value={formel}
            onChange={(e) => setFormel(e.target.value)}
            inputMode="decimal"
            placeholder="4.65 x 2 + 3.86 x 2"
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base font-[family-name:var(--font-mono)] font-semibold focus:outline-none focus:border-[#1F6B58]"
          />
        </label>
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#587064]">
            Einheit
          </span>
          <select
            name="einheit"
            value={einheit}
            onChange={(e) => setEinheit(e.target.value)}
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
          >
            {ALL_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p
        className={`text-sm font-[family-name:var(--font-mono)] font-semibold -mt-1 ${
          preview !== null ? "text-[#1F7A4D]" : "text-[#587064]"
        }`}
      >
        {formel.trim() === ""
          ? " "
          : preview !== null
          ? `= ${fmt(preview)} ${einheit}`
          : "Formel prüfen …"}
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#587064]">
          Kürzel / Name
        </span>
        <input
          name="mitarbeiterName"
          value={mitarbeiter}
          onChange={(e) => setMitarbeiter(e.target.value)}
          placeholder="z. B. T.K."
          className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-[#B3261E]" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-[#1F6B58] text-white font-[family-name:var(--font-display)] font-bold tracking-wide text-lg rounded-lg py-3.5 disabled:opacity-50"
      >
        {pending ? "Speichert …" : "+ Position hinzufügen"}
      </button>
    </form>
  );
}
