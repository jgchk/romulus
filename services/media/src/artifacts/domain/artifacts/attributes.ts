import { z } from 'zod'

import type { AttributeSchema } from '../artifact-schemas/attributes'

export function checkAttributeType(
  value: unknown,
  attributeType: AttributeSchema['type'],
): boolean {
  switch (attributeType) {
    case 'string':
      return isString(value)
    case 'number':
      return isNumber(value)
    case 'date':
      return isDate(value)
    case 'duration':
      return isDuration(value)
  }
}

function isString(value: unknown): value is string {
  return z.string().safeParse(value).success
}

function isNumber(value: unknown): value is number {
  return z.number().safeParse(value).success
}

function isDate(value: unknown): value is Date {
  return z.date().safeParse(value).success
}

const Duration = z.object({
  years: z.number().optional(),
  months: z.number().optional(),
  weeks: z.number().optional(),
  days: z.number().optional(),
  hours: z.number().optional(),
  minutes: z.number().optional(),
  seconds: z.number().optional(),
})

type Duration = z.infer<typeof Duration>

function isDuration(value: unknown): value is Duration {
  return Duration.safeParse(value).success
}
