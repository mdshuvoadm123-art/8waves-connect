"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/materials", label: "Materials" },
  { href: "/ostotorongo", label: "Ostotorongo" },
  { href: "/faculty", label: "Faculty" },
  { href: "/admin", label: "Admin" },
];

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 16c2 -8 4 -8 6 0s4 8 6 0s4 -8 6 0s4 8 6 0s4 -8 6 0"
        stroke="url(#g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="32" y2="0">
          <stop offset="0" stopColor="#2DD4BF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <BrandMark />
          8WAVES CONNECT
        </Link>

        <nav className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href ? "is-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="nav-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`nav-mobile ${open ? "is-open" : ""}`}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-mobile-link ${pathname === l.href ? "is-active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
