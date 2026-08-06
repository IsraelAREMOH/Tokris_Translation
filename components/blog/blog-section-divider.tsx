/** Minimal branded rule used to separate a page's final section (e.g. the
 * newsletter CTA) from the content above — an editorial touch rather than a
 * plain margin, without introducing a heavier decorative element. */
export function BlogSectionDivider({ className = "my-14" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
