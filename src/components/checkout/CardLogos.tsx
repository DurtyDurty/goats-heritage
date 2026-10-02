export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export function detectCardBrand(digits: string): CardBrand | null {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";
  return null;
}

const frame = "h-7 w-11 rounded-[4px] border border-black/10 shadow-sm";

function Visa() {
  return (
    <svg viewBox="0 0 44 28" className={frame} role="img" aria-label="Visa">
      <rect width="44" height="28" fill="#fff" />
      <text x="22" y="19.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="0.5">
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 44 28" className={frame} role="img" aria-label="Mastercard">
      <rect width="44" height="28" fill="#fff" />
      <circle cx="17.5" cy="14" r="8" fill="#EB001B" />
      <circle cx="26.5" cy="14" r="8" fill="#F79E1B" />
      <path d="M22 7.4a8 8 0 0 1 0 13.2 8 8 0 0 1 0-13.2z" fill="#FF5F00" />
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 44 28" className={frame} role="img" aria-label="American Express">
      <rect width="44" height="28" fill="#1F72CD" />
      <text x="22" y="18" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="9.5" fontWeight="900" fill="#fff" letterSpacing="0.3">
        AMEX
      </text>
    </svg>
  );
}

function Discover() {
  return (
    <svg viewBox="0 0 44 28" className={frame} role="img" aria-label="Discover">
      <rect width="44" height="28" fill="#fff" />
      <path d="M44 16v12H14c14-1.5 24-6 30-12z" fill="#F47216" />
      <text x="4" y="15" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.4" fontWeight="700" fill="#231F20" letterSpacing="0.2">
        DISC
      </text>
      <circle cx="24.6" cy="12.7" r="3.3" fill="#F47216" />
      <text x="28.6" y="15" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.4" fontWeight="700" fill="#231F20" letterSpacing="0.2">
        VER
      </text>
    </svg>
  );
}

const LOGOS: Record<CardBrand, () => JSX.Element> = {
  visa: Visa,
  mastercard: Mastercard,
  amex: Amex,
  discover: Discover,
};

export function CardLogo({ brand }: { brand: CardBrand }) {
  const Logo = LOGOS[brand];
  return <Logo />;
}

/** Row of accepted cards. When a brand is detected, the others dim. */
export default function CardLogos({ active }: { active?: CardBrand | null }) {
  return (
    <div className="flex items-center gap-1.5">
      {(Object.keys(LOGOS) as CardBrand[]).map((brand) => (
        <span key={brand} className={`transition-opacity ${active && active !== brand ? "opacity-25" : "opacity-100"}`}>
          <CardLogo brand={brand} />
        </span>
      ))}
    </div>
  );
}
