"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Container } from "@/components/common/container"

interface AdminStatus {
  articles: { total: number; processed: number }
  publishing: { queue: number; published: number }
  trending: { items: number }
  sources: { tracked: number; cacheEntries: number }
  analytics: { articlesTracked: number }
}

interface QueueItem {
  slug: string
  title: string
  category: string
  priority: number
  queuedAt: string
  breaking?: boolean
}

interface HealthItem {
  label: string
  score: number
  healthy: boolean
  lastFetch: string | null
  lastError: string | null
  totalFetches: number
}

export default function AdminPage() {
  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [health, setHealth] = useState<HealthItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statusRes, queueRes, healthRes] = await Promise.all([
          fetch("/api/admin/status").then((r) => r.json()),
          fetch("/api/admin/queue").then((r) => r.json()),
          fetch("/api/admin/health").then((r) => r.json()),
        ])
        setStatus(statusRes)
        setQueue(queueRes.queue || [])
        setHealth(healthRes.sources || [])
      } catch (err) {
        console.error("Failed to load admin data", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          News automation system overview
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Articles"
          value={status?.articles.total ?? 0}
        />
        <StatCard
          label="Queue"
          value={status?.publishing.queue ?? 0}
          highlight={(status?.publishing.queue ?? 0) > 0}
        />
        <StatCard
          label="Published"
          value={status?.publishing.published ?? 0}
        />
        <StatCard
          label="Trending"
          value={status?.trending.items ?? 0}
        />
        <StatCard
          label="Sources Tracked"
          value={status?.sources.tracked ?? 0}
        />
        <StatCard
          label="Cache Entries"
          value={status?.sources.cacheEntries ?? 0}
        />
        <StatCard
          label="Articles with Metrics"
          value={status?.analytics.articlesTracked ?? 0}
        />
        <StatCard
          label="Processed URLs"
          value={status?.articles.processed ?? 0}
        />
      </div>

      {/* Source Health */}
      <div className="mb-8">
        <h2 className="mb-4 font-headline text-xl font-bold">
          Source Health
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Source</th>
                <th className="px-4 py-2 text-left font-medium">Health</th>
                <th className="px-4 py-2 text-left font-medium">Score</th>
                <th className="px-4 py-2 text-left font-medium">Last Fetch</th>
              </tr>
            </thead>
            <tbody>
              {health.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No source data yet. Run the pipeline to collect data.
                  </td>
                </tr>
              )}
              {health.slice(0, 20).map((source) => (
                <tr key={source.label} className="border-t border-border">
                  <td className="px-4 py-2.5">{source.label}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        source.healthy
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          source.healthy
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      {source.healthy ? "Healthy" : "Unhealthy"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{source.score}%</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {source.lastFetch
                      ? new Date(source.lastFetch).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue */}
      <div className="mb-8">
        <h2 className="mb-4 font-headline text-xl font-bold">
          Publishing Queue ({queue.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Title</th>
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-left font-medium">Priority</th>
                <th className="px-4 py-2 text-left font-medium">Queued</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No articles in queue. Run the pipeline to fetch articles.
                  </td>
                </tr>
              )}
              {queue.slice(0, 10).map((item) => (
                <tr key={item.slug} className="border-t border-border">
                  <td className="max-w-xs truncate px-4 py-2.5">
                    {item.breaking && (
                      <span className="mr-1.5 text-red-500">&#9679;</span>
                    )}
                    {item.title}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {item.category}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-medium ${
                        item.priority === 1
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.priority === 1 ? "Breaking" : "Standard"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(item.queuedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/article/${item.slug}`}
                      className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Controls */}
      <div>
        <h2 className="mb-4 font-headline text-xl font-bold">
          Pipeline Controls
        </h2>
        <div className="flex flex-wrap gap-3">
          <form action="/api/admin/ingest" method="POST" className="inline">
            <button
              type="submit"
              className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Run Ingestion
            </button>
          </form>
          <form action="/api/admin/publish" method="POST" className="inline">
            <button
              type="submit"
              className="rounded border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Process Queue
            </button>
          </form>
          <form action="/api/admin/trending/refresh" method="POST" className="inline">
            <button
              type="submit"
              className="rounded border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Refresh Trending
            </button>
          </form>
        </div>
      </div>
    </Container>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-headline text-2xl font-bold ${
          highlight ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
