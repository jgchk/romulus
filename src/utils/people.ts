import { DefaultPerson } from '../server/db/person/outputs'
import { isNotNull } from './types'

export const toNameString = (
  person: Pick<DefaultPerson, 'firstName' | 'middleName' | 'lastName'>
) =>
  [person.firstName, person.middleName, person.lastName]
    .filter(isNotNull)
    .join(' ')
