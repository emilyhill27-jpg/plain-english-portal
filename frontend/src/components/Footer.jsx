import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/about", label: "About" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-frame bg-frame-bg">
      <div className="page-container py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Left — brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="no-underline">
              <img src="/logo-plainly.png" alt="Plainly" className="h-8" />
            </Link>
            <p className="text-sm text-ink-soft">
              Governed plain-language explanations for organisations.
            </p>
            <p className="text-sm text-ink-faint">
              Built in Aotearoa New Zealand
            </p>
          </div>

          {/* Right — links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-ink-soft no-underline transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <span className="text-frame">|</span>
            <Link
              to="/portal/sign-in"
              className="text-sm text-ink-faint no-underline transition-colors hover:text-ink-soft"
            >
              Admin sign in
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-frame pt-6">
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} Plainly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
