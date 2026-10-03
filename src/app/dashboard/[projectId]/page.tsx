import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PROFILES, sumByUnit, fmt, type BrancheKey } from "@/lib/branches";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { EntryForm } from "./EntryForm";
import { ExportCsvButton } from "./ExportCsvButton";
import { deleteEntryAction } from "../_actions/actions";

export default async function ProjectPage(props: PageProps<"/dashboard/[projectId]">) {
  const { projectId } = await props.params;

  const session = await auth();
  const organizationId = (session?.user as { organizationId?: string } | undefined)
    ?.organizationId;
  if (!organizationId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: { entries: { orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();

  const branche = project.branche as BrancheKey;
  const profile = PROFILES[branche];

  const etagenVorschlaege = [
    ...new Set([...profile.etagenVorschlaege, ...project.entries.map((e) => e.etage)]),
  ];
  const raeumeVorschlaege = [...new Set(project.entries.map((e) => e.raum))];

  // Gruppieren: Etage -> Raum -> Positionen (wie auf dem Papierzettel)
  const etageMap = new Map<string, Map<string, typeof project.entries>>();
  for (const e of project.entries) {
    if (!etageMap.has(e.etage)) etageMap.set(e.etage, new Map());
    const raumMap = etageMap.get(e.etage)!;
    if (!raumMap.has(e.raum)) raumMap.set(e.raum, []);
    raumMap.get(e.raum)!.push(e);
  }

  const totalSums = sumByUnit(project.entries);
  const raumCount = new Set(project.entries.map((e) => e.etage + "|" + e.raum)).size;

  return (
    <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-16">
      <Link href="/dashboard" className="text-sm text-[#4A6670] underline">
        ← Alle Projekte
      </Link>

      <header className="mt-2 mb-5">
        <h1 className="font-[family-name:var(--font-display)] font-extrabold uppercase tracking-wide text-2xl">
          {project.name}
        </h1>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-[#4A6670] border border-[#4A6670] rounded-full px-2.5 py-0.5 mt-1">
          {profile.label}
        </span>

        <div className="flex flex-wrap gap-4 items-baseline mt-4">
          {totalSums.length === 0 ? (
            <div className="font-[family-name:var(--font-mono)] font-bold text-3xl">0</div>
          ) : (
            totalSums.map((s) => (
              <div key={s.unit} className="flex flex-col">
                <span className="font-[family-name:var(--font-mono)] font-bold text-3xl leading-none">
                  {fmt(s.total)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#726C60]">
                  {s.unit}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-[#726C60] mt-1">
          {raumCount} {raumCount === 1 ? "Raum/Fläche" : "Räume/Flächen"} · {project.entries.length}{" "}
          {project.entries.length === 1 ? "Position" : "Positionen"}
        </p>
      </header>

      <section className="bg-white border border-[#DAD3C4] rounded-2xl p-4 mb-6">
        <EntryForm
          projectId={project.id}
          branche={branche}
          etagenVorschlaege={etagenVorschlaege}
          raeumeVorschlaege={raeumeVorschlaege}
        />
      </section>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#726C60] mb-3">
        Aufmaß
      </h2>

      {project.entries.length === 0 ? (
        <p className="text-sm text-[#726C60] text-center py-8">
          Noch kein Aufmaß erfasst.
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {[...etageMap.entries()].map(([etage, raumMap]) => {
            const etageEntries = [...raumMap.values()].flat();
            const etageSums = sumByUnit(etageEntries);
            return (
              <div key={etage}>
                <div className="flex justify-between items-baseline border-b-2 border-[#24211D] pb-1.5 mb-2">
                  <span className="font-[family-name:var(--font-display)] font-extrabold uppercase text-lg">
                    {etage}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] font-bold text-sm text-[#726C60]">
                    {etageSums.map((s) => `${fmt(s.total)} ${s.unit}`).join(" · ")}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {[...raumMap.entries()].map(([raum, posList]) => {
                    const raumSums = sumByUnit(posList);
                    return (
                      <div
                        key={raum}
                        className="bg-white border border-[#DAD3C4] rounded-xl p-3"
                      >
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="font-bold text-sm">{raum}</span>
                          <span className="font-[family-name:var(--font-mono)] font-bold text-xs text-[#4A6670]">
                            {raumSums.map((s) => `${fmt(s.total)} ${s.unit}`).join(" · ")}
                          </span>
                        </div>
                        {posList.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-2 py-1.5 border-t border-[#DAD3C4] first:border-t-0"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-[family-name:var(--font-display)] font-bold uppercase text-[#726C60]">
                                {p.position || "Position"}
                              </div>
                              <div className="font-[family-name:var(--font-mono)] text-sm break-words">
                                {p.formel}
                              </div>
                              <div className="text-xs text-[#726C60]">
                                {p.datum}
                                {p.mitarbeiterName ? ` · ${p.mitarbeiterName}` : ""}
                              </div>
                            </div>
                            <div className="font-[family-name:var(--font-mono)] font-bold text-sm whitespace-nowrap">
                              {fmt(p.menge)}
                              <span className="text-xs font-medium opacity-60 ml-0.5">
                                {p.einheit}
                              </span>
                            </div>
                            <form
                              action={async () => {
                                "use server";
                                await deleteEntryAction(project.id, p.id);
                              }}
                            >
                              <button
                                type="submit"
                                aria-label="Position löschen"
                                className="w-6 h-6 rounded-full border border-[#DAD3C4] text-[#B3261E] text-xs"
                              >
                                ✕
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExportCsvButton
        projectName={project.name}
        brancheLabel={profile.label}
        entries={project.entries}
      />
    </main>
  );
}
