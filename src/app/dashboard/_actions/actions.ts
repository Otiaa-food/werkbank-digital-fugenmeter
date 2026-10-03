"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { evalFormula } from "@/lib/branches";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BrancheKey } from "@/lib/branches";

async function requireOrgId() {
  const session = await auth();
  const organizationId = (session?.user as { organizationId?: string } | undefined)
    ?.organizationId;
  if (!organizationId) redirect("/login");
  return organizationId;
}

export async function createProjectAction(formData: FormData) {
  const organizationId = await requireOrgId();
  const name = (formData.get("name") as string | null)?.trim();
  const branche = formData.get("branche") as BrancheKey | null;
  if (!name || !branche) return;

  const project = await prisma.project.create({
    data: { name, branche, organizationId },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${project.id}`);
}

export type AddEntryState = { error?: string } | undefined;

export async function addEntryAction(
  projectId: string,
  _prevState: AddEntryState,
  formData: FormData
): Promise<AddEntryState> {
  const organizationId = await requireOrgId();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  });
  if (!project) return { error: "Projekt nicht gefunden." };

  const etage = (formData.get("etage") as string | null)?.trim();
  const raum = (formData.get("raum") as string | null)?.trim();
  const position = (formData.get("position") as string | null)?.trim() || "";
  const formel = (formData.get("formel") as string | null)?.trim();
  const einheit = (formData.get("einheit") as string | null)?.trim() || "m";
  const mitarbeiterName = (formData.get("mitarbeiterName") as string | null)?.trim() || "";

  if (!etage) return { error: "Bitte Etage/Bereich angeben." };
  if (!raum) return { error: "Bitte Raum/Teilfläche angeben." };
  if (!formel) return { error: "Bitte Menge eingeben." };

  const menge = evalFormula(formel);
  if (menge === null) return { error: "Formel prüfen — z. B. 4.65 x 2 + 3.86" };

  await prisma.entry.create({
    data: {
      projectId,
      etage,
      raum,
      position,
      formel,
      menge,
      einheit,
      mitarbeiterId: userId ?? null,
      mitarbeiterName,
      datum: new Date().toLocaleDateString("de-DE"),
    },
  });

  revalidatePath(`/dashboard/${projectId}`);
  return undefined;
}

export async function deleteEntryAction(projectId: string, entryId: string) {
  const organizationId = await requireOrgId();
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  });
  if (!project) return;

  await prisma.entry.delete({ where: { id: entryId } });
  revalidatePath(`/dashboard/${projectId}`);
}
