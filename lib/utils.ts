import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

// infer the argument type of the default function so it stays in sync
export type ClassValue = Parameters<typeof clsx>[0]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}