import Link from "next/link";

/**
 * Maßwerk-Logo: ein „M“ aus einem aufgeklappten Zollstock.
 * `currentColor` steuert die Farbe des Zollstocks, `tickColor` die Skala und Nieten
 * (am besten die Farbe des Untergrunds).
 */
export function LogoMark({
  className,
  tickColor = "#FFFFFF",
}: {
  className?: string;
  tickColor?: string;
}) {
  return (
    <svg
      viewBox="90 70 420 360"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points="130,410 130,160 300,350 470,160 470,410"
        fill="none"
        stroke="currentColor"
        strokeWidth="54"
        strokeMiterlimit="10"
      />
      <line x1="157.0" y1="394.0" x2="139.7" y2="394.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="378.0" x2="139.7" y2="378.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="362.0" x2="139.7" y2="362.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="346.0" x2="139.7" y2="346.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="330.0" x2="130.0" y2="330.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="314.0" x2="139.7" y2="314.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="298.0" x2="139.7" y2="298.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="282.0" x2="139.7" y2="282.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="266.0" x2="139.7" y2="266.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="157.0" y1="250.0" x2="130.0" y2="250.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="163.2" y1="237.6" x2="183.3" y2="219.6" stroke={tickColor} strokeWidth="2.6" />
      <line x1="173.9" y1="249.5" x2="186.8" y2="238.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="184.6" y1="261.5" x2="197.4" y2="249.9" stroke={tickColor} strokeWidth="2.6" />
      <line x1="195.2" y1="273.4" x2="208.1" y2="261.9" stroke={tickColor} strokeWidth="2.6" />
      <line x1="205.9" y1="285.3" x2="218.8" y2="273.8" stroke={tickColor} strokeWidth="2.6" />
      <line x1="216.6" y1="297.2" x2="236.7" y2="279.2" stroke={tickColor} strokeWidth="2.6" />
      <line x1="227.2" y1="309.2" x2="240.1" y2="297.6" stroke={tickColor} strokeWidth="2.6" />
      <line x1="373.5" y1="308.4" x2="353.3" y2="290.4" stroke={tickColor} strokeWidth="2.6" />
      <line x1="384.1" y1="296.5" x2="371.3" y2="284.9" stroke={tickColor} strokeWidth="2.6" />
      <line x1="394.8" y1="284.5" x2="381.9" y2="273.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="405.5" y1="272.6" x2="392.6" y2="261.1" stroke={tickColor} strokeWidth="2.6" />
      <line x1="416.1" y1="260.7" x2="403.3" y2="249.2" stroke={tickColor} strokeWidth="2.6" />
      <line x1="426.8" y1="248.8" x2="406.7" y2="230.8" stroke={tickColor} strokeWidth="2.6" />
      <line x1="437.5" y1="236.8" x2="424.6" y2="225.3" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="240.0" x2="470.0" y2="240.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="256.0" x2="460.3" y2="256.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="272.0" x2="460.3" y2="272.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="288.0" x2="460.3" y2="288.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="304.0" x2="460.3" y2="304.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="320.0" x2="470.0" y2="320.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="336.0" x2="460.3" y2="336.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="352.0" x2="460.3" y2="352.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="368.0" x2="460.3" y2="368.0" stroke={tickColor} strokeWidth="2.6" />
      <line x1="443.0" y1="384.0" x2="460.3" y2="384.0" stroke={tickColor} strokeWidth="2.6" />
      <circle cx="130" cy="160" r="7" fill={tickColor} />
      <circle cx="300" cy="350" r="7" fill={tickColor} />
      <circle cx="470" cy="160" r="7" fill={tickColor} />
    </svg>
  );
}

/** Großes Logo (Marke + Schriftzug) für Login und Registrierung. */
export function LogoFull({ className }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center text-[#1F6B58] ${className ?? ""}`}>
      <LogoMark className="w-28 h-auto" />
      <span className="mt-2 text-2xl font-medium tracking-[0.3em] pl-[0.3em]">MAßWERK</span>
    </span>
  );
}

/** Kleines Icon oben rechts, sobald man eingeloggt ist. Führt zur Projektübersicht. */
export function LogoBadge() {
  return (
    <Link
      href="/dashboard"
      aria-label="Maßwerk – zur Projektübersicht"
      className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1F6B58] text-white"
    >
      <LogoMark className="w-7 h-auto" tickColor="#1F6B58" />
    </Link>
  );
}
