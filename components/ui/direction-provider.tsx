"use client";

import * as React from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useTranslation } from "@/hooks/useTranslation";

export function RtlDirectionProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useTranslation();
  return (
    <DirectionProvider dir={lang === "ku" ? "rtl" : "ltr"}>
      {children}
    </DirectionProvider>
  );
}
