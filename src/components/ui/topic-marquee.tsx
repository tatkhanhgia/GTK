interface TopicMarqueeProps {
  eyebrow: string
  items: string[]
}

export function TopicMarquee({ eyebrow, items }: TopicMarqueeProps) {
  const visibleItems = items.filter(Boolean)

  if (visibleItems.length === 0) return null

  return (
    <section className="border-t border-border bg-background px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <div
          className="motion-marquee group rounded-xl border border-border/70 bg-card/70 py-3"
          tabIndex={0}
        >
          <div className="motion-marquee-track">
            {[...visibleItems, ...visibleItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="mx-3 inline-flex rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
                aria-hidden={index >= visibleItems.length}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
