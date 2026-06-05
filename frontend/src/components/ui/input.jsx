import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-frame bg-frame-white px-3 py-2.5 text-sm text-ink",
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
Input.displayName = "Input";

export { Input };
