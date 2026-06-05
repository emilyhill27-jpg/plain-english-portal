import { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const AccordionContext = createContext({});

function Accordion({ type = "single", defaultValue, className, children }) {
  const [openItems, setOpenItems] = useState(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  );

  const toggle = (value) => {
    setOpenItems((prev) => {
      if (type === "single") {
        return prev.includes(value) ? [] : [value];
      }
      return prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, className, children }) {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <div
      className={cn(
        "rounded-lg border border-frame bg-white overflow-hidden transition-colors",
        isOpen && "border-accent/20",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </div>
  );
}

function AccordionTrigger({ value, className, children }) {
  const { openItems, toggle } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      className={cn(
        "flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-ink transition-colors hover:bg-frame-light",
        className
      )}
      onClick={() => toggle(value)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

function AccordionContent({ value, className, children }) {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={cn("px-5 pb-4 text-sm leading-relaxed text-ink-mid", className)}>
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
