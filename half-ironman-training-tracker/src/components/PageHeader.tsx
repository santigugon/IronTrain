"use client";

import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  right,
  stacked = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Title + subtitle on top; optional `right` on the next row (full width). */
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <header className="mb-4 flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right ? <div className="w-full min-w-0">{right}</div> : null}
      </header>
    );
  }

  return (
    <header className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

