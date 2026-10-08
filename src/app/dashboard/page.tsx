import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PROFILES } from "@/lib/branches";
import { createProjectAction } from "./_actions/actions";
import Link from "next/link";
import { LogoBadge } from "@/components/Logo";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = (session?.user as { organizationId?: string } | undefined)
    ?.organizationId;
  if (!organizationId) redirect("/login");

  const [organization, projects] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId } }),
    prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { entries: true } } },
    }),
  ]);

  return (
    <main className="flex-1 max-w-xl w-full mx-auto p-4 pb-12">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] font-extrabold tracking-wide text-2xl inline-block bg-[#1F6B58] text-white rounded-xl px-4 py-1.5">
            Maßwerk
          </h1>
          <p className="text-sm text-[#587064]">{organization?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-sm text-[#1F6B58] underline">
              Abmelden
            </button>
          </form>
          <LogoBadge />
        </div>
      </header>

      <section className="bg-white border border-[#C3D8CC] rounded-2xl p-4 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#587064] mb-3">
          Neues Projekt anlegen
        </h2>
        <form action={createProjectAction} className="flex flex-col gap-3">
          <input
            name="name"
            required
            placeholder="z. B. Neubau Müller, Pforzheim"
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
          />
          <select
            name="branche"
            required
            defaultValue=""
            className="border border-[#C3D8CC] rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-[#1F6B58]"
          >
            <option value="" disabled>
              Branche wählen …
            </option>
            {Object.entries(PROFILES).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#1F6B58] text-white font-[family-name:var(--font-display)] font-bold tracking-wide rounded-lg py-3"
          >
            + Projekt anlegen
          </button>
        </form>
      </section>

      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#587064] mb-3">
        Projekte
      </h2>
      {projects.length === 0 ? (
        <p className="text-sm text-[#587064] text-center py-8">
          Noch keine Projekte angelegt.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/${p.id}`}
                className="block bg-white border border-[#C3D8CC] rounded-xl px-4 py-3 hover:border-[#1F6B58]"
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-[#1F6B58] uppercase font-semibold tracking-wide mt-0.5">
                  {PROFILES[p.branche as keyof typeof PROFILES].label}
                </div>
                <div className="text-xs text-[#587064] mt-0.5">
                  {p._count.entries} {p._count.entries === 1 ? "Position" : "Positionen"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
