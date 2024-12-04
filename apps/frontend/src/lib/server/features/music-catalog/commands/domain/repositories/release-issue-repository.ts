import type { ReleaseIssue } from '../aggregates/release-issue'

export type ReleaseIssueRepository = {
  create(releaseIssue: ReleaseIssue): Promise<number>
}
