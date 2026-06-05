import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReaderToggle } from "@/components/ReaderSupport";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/for-organisations", label: "For organisations" },
  { to: "/security", label: "Security & trust" },
];

export default function Nav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-frame bg-white/95 backdrop-blur-sm shadow-nav">
      <nav className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo-plainly.png" alt="Plainly" className="h-9" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-medium no-underline transition-colors duration-150",
                location.pathname === link.to
                  ? "text-accent"
                  : "text-ink-mid hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ReaderToggle />
          <Button size="sm" asChild>
            <Link to="/request-pilot">Request a pilot</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-frame bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium no-underline transition-colors",
                  location.pathname === link.to
                    ? "bg-accent-light text-accent"
                    : "text-ink-mid hover:bg-frame-light hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 px-3">
              <ReaderToggle />
            </div>
            <Button className="mt-3" asChild>
              <Link to="/request-pilot" onClick={() => setMobileOpen(false)}>
                Request a pilot
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
