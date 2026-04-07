import React from 'react';

interface CardProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  description?: string;
  title?: string;
  variant?: 'default' | 'elevated' | 'ghost';
}

export function Card({
  actions,
  children,
  className = '',
  description,
  title,
  variant = 'default',
}: CardProps) {
  const variantClassName =
    variant === 'elevated'
      ? 'bg-[var(--admin-bg-elevated)] shadow-[var(--admin-shadow-md)]'
      : variant === 'ghost'
        ? 'bg-transparent shadow-none'
        : 'bg-[var(--admin-bg-tertiary)] shadow-[var(--admin-shadow-sm)]';

  return (
    <div
      data-admin-card="true"
      className={`
        admin-card rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)]
        ${variantClassName} transition-all duration-200
        hover:-translate-y-0.5 hover:border-[var(--admin-border-strong)] hover:shadow-[var(--admin-shadow-md)]
        ${className}
      `}
    >
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-6 py-5">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-[var(--admin-text-primary)]">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{description}</p>
            )}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
