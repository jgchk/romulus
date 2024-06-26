import { test } from '../../../fixtures'
import chipsTests from './chips'
import emptyStateTests from './empty-state'
import expansionTests from './expansion'
import linksTests from './links'
import operationsTests from './operations'

export default function treeTests() {
  test.describe('tree', () => {
    chipsTests()
    emptyStateTests()
    expansionTests()
    linksTests()
    operationsTests()
  })
}
