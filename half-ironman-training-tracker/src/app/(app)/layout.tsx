"use client";

import * as React from "react";

import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-28 pt-6">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

