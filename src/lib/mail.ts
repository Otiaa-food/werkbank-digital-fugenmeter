// Versand über Resend (https://resend.com) per REST – keine zusätzliche Abhängigkeit.
// Ohne RESEND_API_KEY wird der Versand übersprungen, die App funktioniert trotzdem.

const FROM = process.env.MAIL_FROM ?? "Maßwerk <onboarding@resend.dev>";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export async function sendRegistrationMail(opts: {
  to: string;
  firma: string;
  name?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY fehlt – Bestätigungsmail wird nicht versendet.");
    return;
  }

  const base = process.env.APP_URL ?? "";
  const loginUrl = base ? `${base}/login` : "";
  const hallo = opts.name ? `Hallo ${escapeHtml(opts.name)}` : "Hallo";
  const firma = escapeHtml(opts.firma);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#12261D">
      <h1 style="font-size:22px;margin:0 0 12px">Willkommen bei Maßwerk</h1>
      <p>${hallo},</p>
      <p>dein Betrieb <strong>${firma}</strong> wurde erfolgreich angelegt. Du kannst dich ab sofort mit dieser E-Mail-Adresse anmelden und dein erstes Aufmaß erfassen.</p>
      ${
        loginUrl
          ? `<p><a href="${loginUrl}" style="display:inline-block;background:#1F6B58;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Jetzt anmelden</a></p>`
          : ""
      }
      <p style="color:#587064;font-size:13px">Du hast dich nicht selbst registriert? Dann kannst du diese Mail ignorieren.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: "Willkommen bei Maßwerk – dein Betrieb ist angelegt",
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Resend-Fehler", res.status, await res.text());
    }
  } catch (err) {
    console.error("Mailversand fehlgeschlagen", err);
  }
}
