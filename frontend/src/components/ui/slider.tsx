import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Slider({ className, ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={cn(
        "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider",
        className
      )}
      {...props}
    />
  );
}