import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}
interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="relative">{children}</div>;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children, align = 'start', className }: DropdownMenuContentProps) {
  return (
    <div
      className={cn(
        "absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background p-1 text-foreground shadow-lg",
        align === 'end' && "right-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, ...props }: DropdownMenuItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}