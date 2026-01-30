// GitHub API integration for fetching IDEAS.md, issues, commits, cron

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'wendyworksforpark-dev'
const REPO_NAME = 'clawd'

export interface GitHubCommit {
  sha: string
  message: string
  date: string
  author: string
  url: string
}

export interface CronJob {
  id: string
  name: string
  schedule: string
  nextRun: string
  lastRun?: string
  lastStatus?: 'ok' | 'error'
  enabled: boolean
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  labels: { name: string; color: string }[]
  created_at: string
}

export interface RepoIssues {
  repo: string
  displayName: string
  issues: GitHubIssue[]
}

// Multi-repo config
const REPOS = [
  { owner: 'zinan92', name: 'ashare', displayName: '📦 ashare' },
  { owner: 'wendyworksforpark-dev', name: 'wendy-tracker', displayName: '📋 wendy-tracker' },
]

// Fetch raw file content
export async function fetchRawFile(path: string): Promise<string> {
  if (path === 'IDEAS.md') {
    const localUrl = `${import.meta.env.BASE_URL}data/ideas.md`
    console.log('Fetching IDEAS.md from:', localUrl)
    try {
      const response = await fetch(localUrl)
      if (response.ok) {
        const text = await response.text()
        console.log('Fetched IDEAS.md, length:', text.length)
        return text
      }
    } catch (e) {
      console.error('Failed to fetch local ideas.md:', e)
    }
  }

  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`
  console.log('Fetching from GitHub:', url)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`)
  }
  return response.text()
}

// Fetch recent commits
export async function fetchRecentCommits(limit = 10): Promise<GitHubCommit[]> {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${limit}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch commits: ${response.status}`)
  }
  const data = await response.json()
  return data.map((item: any) => ({
    sha: item.sha.slice(0, 7),
    message: item.commit.message.split('\n')[0],
    date: new Date(item.commit.author.date).toLocaleString('zh-CN'),
    author: item.commit.author.name,
    url: item.html_url,
  }))
}

// Fetch ALL issues (open + closed) from a single repo
async function fetchAllIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
  const issues: GitHubIssue[] = []

  // Fetch open issues
  try {
    const openResp = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=100`
    )
    if (openResp.ok) issues.push(...(await openResp.json()))
  } catch (e) {
    console.error(`Failed to fetch open issues for ${owner}/${repo}:`, e)
  }

  // Fetch closed issues
  try {
    const closedResp = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/issues?state=closed&per_page=100`
    )
    if (closedResp.ok) issues.push(...(await closedResp.json()))
  } catch (e) {
    console.error(`Failed to fetch closed issues for ${owner}/${repo}:`, e)
  }

  // Filter out pull requests (GitHub API returns PRs as issues too)
  const filtered = issues.filter(i => !(i as any).pull_request)

  // Sort by number descending
  return filtered.sort((a, b) => b.number - a.number)
}

// Fetch issues for all repos
export async function fetchAllRepoIssues(): Promise<RepoIssues[]> {
  return Promise.all(
    REPOS.map(async r => ({
      repo: r.name,
      displayName: r.displayName,
      issues: await fetchAllIssues(r.owner, r.name),
    }))
  )
}

// Legacy single-repo fetch (kept for backward compat)
export async function fetchIssues(repo: string = 'wendy-tracker'): Promise<any[]> {
  const url = `${GITHUB_API}/repos/${REPO_OWNER}/${repo}/issues?state=open&per_page=20`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch issues: ${response.status}`)
  }
  return response.json()
}

// Fetch real cron status from JSON file
export async function fetchCronStatus(): Promise<CronJob[]> {
  const url = `${import.meta.env.BASE_URL}data/cron-status.json`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch cron status')
    const data = await response.json()

    return Object.entries(data.jobs).map(([id, job]: [string, any]) => ({
      id,
      name: job.name,
      schedule: '',
      nextRun: job.time,
      lastRun: job.lastRun,
      lastStatus: job.lastStatus,
      enabled: true,
    }))
  } catch (e) {
    console.error('Failed to fetch cron status:', e)
    return []
  }
}

// Legacy mock function (deprecated)
export function getMockCronJobs(): CronJob[] {
  return []
}
