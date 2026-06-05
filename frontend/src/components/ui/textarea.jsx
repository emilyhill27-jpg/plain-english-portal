import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-frame bg-frame-white px-3 py-2.5 text-sm text-ink resize-y",
        "placeholder:text-ink-faint",
        "focus:border-accent focus:ring-2 focus:ring-accent-ring focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
