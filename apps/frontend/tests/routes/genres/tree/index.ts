import { test } from '../../../fixtures'
import emptyStateTests from './empty-state'
import expansionTests from './expansion'
import linksTests from './links'
import operationsTests from './operations'

export default function treeTests() {
  test.describe('tree', () => {
    emptyStateTests()
    expansionTests()
    linksTests()
    operationsTests()
  })
}
