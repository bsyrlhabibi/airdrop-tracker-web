import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function deslugify(slug: string): string {
  return slug.replace(/-/g, " ")
}

/**
 * Format date string (YYYY-MM-DD) to user's local timezone.
 * Avoids UTC midnight shift that causes off-by-one in negative UTC offsets.
 */
export function formatLocalDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-").map(Number)
  const localDate = new Date(year, month - 1, day)
  return localDate.toLocaleDateString(locale, options)
}
