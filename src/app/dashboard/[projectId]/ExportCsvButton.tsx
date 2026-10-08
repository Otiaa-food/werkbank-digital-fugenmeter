"use client";

import { fmt } from "@/lib/branches";

type EntryRow = {
  etage: string;
  raum: string;
  position: string;
  formel: string;
  menge: number;
  einheit: string;
  mitarbeiterName: string | null;
  datum: string;
};

export function ExportCsvButton({
  projectName,
  brancheLabel,
  entries,
}: {
  projectName: string;
  brancheLabel: string;
  entries: EntryRow[];
}) {
  function handleExport() {
    const header = "Projekt;Branche;Etage;Raum;Position;Formel;Menge;Einheit;Mitarbeiter;Datum\n";
    const body = entries
      .map((e) =>
        [
          projectName,
          brancheLabel,
          e.etage,
          e.raum,
          e.position,
          e.formel,
          fmt(e.menge).replace(".", ","),
          e.einheit,
          e.mitarbeiterName ?? "",
          e.datum,
        ]
          .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\n");
    const csv = "﻿" + header + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/[^a-z0-9]+/gi, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={entries.length === 0}
      className="w-full border border-[#1F6B58] text-[#1F6B58] font-semibold rounded-lg py-2.5 disabled:opacity-40"
    >
      Als CSV exportieren
    </button>
  );
}
