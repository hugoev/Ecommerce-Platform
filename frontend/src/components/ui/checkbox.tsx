import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <div className="relative">
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-border bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-foreground data-[state=checked]:text-background",
          className
        )}
        {...props}
      />
      <Check className="absolute left-0 top-0 h-4 w-4 opacity-0 peer-checked:opacity-100 text-background" />
    </div>
  );
}