"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { en } from "@/locales/en";
import { ku } from "@/locales/ku";

type Dictionary = typeof en;

export function useTranslation() {
  const { lang, setLang } = useLanguage();

  const t: Dictionary = lang === "ku" ? ku : en;

  return { t, lang, setLang };
}
