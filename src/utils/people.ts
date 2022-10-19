import { DefaultPerson } from '../server/db/person/outputs'
import { isNotNull } from './types'

export type PersonNameStringArg = Pick<
  DefaultPerson,
  'firstName' | 'middleName' | 'lastName'
>

export const toPersonNameString = (person: PersonNameStringArg) =>
  [person.firstName, person.middleName, person.lastName]
    .filter(isNotNull)
    .join(' ')
