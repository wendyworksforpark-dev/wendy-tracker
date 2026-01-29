// GitHub API integration for fetching IDEAS.md and other data

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

// Fetch raw file content - use local public folder since clawd is private
export async function fetchRawFile(path: string): Promise<string> {
  // Try local public folder first (for IDEAS.md)
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
  
  // Fallback to GitHub raw (for public repos)
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
    url: item.html_url
  }))
}

// Fetch GitHub issues
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
      enabled: true
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
