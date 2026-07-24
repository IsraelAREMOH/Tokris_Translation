export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-4 text-center">
      <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
