"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendRegistrationMail } from "@/lib/mail";

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firma = (formData.get("firma") as string | null)?.trim();
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const password = formData.get("password") as string | null;

  if (!firma || !email || !password) {
    return { error: "Bitte Firma, E-Mail und Passwort ausfüllen." };
  }
  if (password.length < 8) {
    return { error: "Das Passwort muss mindestens 8 Zeichen haben." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Zu dieser E-Mail existiert bereits ein Zugang." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.organization.create({
    data: {
      name: firma,
      users: {
        create: {
          email,
          name: name || undefined,
          passwordHash,
          role: "owner",
        },
      },
    },
  });

  // Bestätigungsmail – ein Fehler hier darf die Registrierung nicht verhindern
  await sendRegistrationMail({ to: email, firma, name });

  redirect("/login?registered=1");
}
