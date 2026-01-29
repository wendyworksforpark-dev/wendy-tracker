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

// Mock cron jobs data (will be replaced with real API)
export function getMockCronJobs(): CronJob[] {
  return [
    { id: '1', name: 'market-0935', schedule: '35 9 * * 1-5', nextRun: '09:35', enabled: true, lastStatus: 'ok' },
    { id: '2', name: 'market-1000', schedule: '0 10 * * 1-5', nextRun: '10:00', enabled: true, lastStatus: 'ok' },
    { id: '3', name: 'market-1030', schedule: '30 10 * * 1-5', nextRun: '10:30', enabled: true, lastStatus: 'ok' },
    { id: '4', name: 'market-1100', schedule: '0 11 * * 1-5', nextRun: '11:00', enabled: true },
    { id: '5', name: 'market-1130', schedule: '30 11 * * 1-5', nextRun: '11:30', enabled: true },
    { id: '6', name: 'market-1300', schedule: '0 13 * * 1-5', nextRun: '13:00', enabled: true },
    { id: '7', name: 'market-1330', schedule: '30 13 * * 1-5', nextRun: '13:30', enabled: true },
    { id: '8', name: 'market-1400', schedule: '0 14 * * 1-5', nextRun: '14:00', enabled: true },
    { id: '9', name: 'market-1430', schedule: '30 14 * * 1-5', nextRun: '14:30', enabled: true },
    { id: '10', name: 'market-close', schedule: '5 15 * * 1-5', nextRun: '15:05', enabled: true },
  ]
}
