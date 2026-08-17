# Scheduling and Automation

The Cline SDK supports scheduled, one-off, and event-driven agent execution through the automation subsystem in `@cline/core`.

## Overview

Three trigger types:

| Trigger | Description |
|---------|-------------|
| `schedule` | Recurring jobs via cron expressions |
| `one_off` | Single execution tasks |
| `event` | Triggered by external events (GitHub, Linear, custom) |

## CLI Schedule Management

```bash
# Create a recurring schedule
cline schedule create "Daily standup" \
  --cron "0 9 * * MON-FRI" \
  --prompt "Summarize open PRs and blockers" \
  --workspace /path/to/project \
  --model anthropic/claude-sonnet-4-6

# List schedules
cline schedule list

# View one schedule
cline schedule get <schedule-id>

# Trigger a schedule immediately
cline schedule trigger <schedule-id>

# Pause/resume
cline schedule pause <schedule-id>
cline schedule resume <schedule-id>

# Delete
cline schedule delete <schedule-id>

# View past executions
cline schedule history <schedule-id>

# Other management commands
cline schedule active
cline schedule upcoming
cline schedule stats <schedule-id>
cline schedule update <schedule-id> --prompt "New prompt"
cline schedule export <schedule-id> --to ./schedule.yaml
cline schedule import ./schedules.json
```

## Cron Expressions

| Expression | Meaning |
|-----------|---------|
| `0 9 * * MON-FRI` | 9 AM weekdays |
| `0 */6 * * *` | Every 6 hours |
| `0 8 * * MON` | Mondays at 8 AM |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 1 * *` | First of every month |

## File-Based Specs

Create Markdown files in `~/.cline/cron/` (global) or `.cline/cron/` (workspace). Trigger kind is inferred from the filename:

- `*.cron.md` is recurring.
- `events/*.event.md` is event-driven.
- `*.md` without `.cron` under `.cline/cron/` is one-off.

### Recurring Schedule

```markdown
---
id: daily-dependency-check
title: Daily Dependency Check
workspaceRoot: /path/to/project
schedule: "0 9 * * MON-FRI"
timezone: America/New_York
mode: act
modelSelection:
  providerId: anthropic
  modelId: claude-sonnet-4-6
tools: run_commands,read_files
enabled: true
---

Additional context or instructions for the agent go in the body.
```

### One-Off Task

```markdown
---
id: coverage-report
title: Generate a comprehensive test coverage report
workspaceRoot: /path/to/project
mode: plan
modelSelection:
  providerId: anthropic
  modelId: claude-sonnet-4-6
---
```

### Event-Driven

```markdown
---
id: pr-review
title: Review New Pull Requests
workspaceRoot: /path/to/project
event: github.pull_request.opened
filters:
  repository: myorg/myrepo
debounceSeconds: 5
cooldownSeconds: 60
maxParallel: 2
mode: act
modelSelection:
  providerId: anthropic
  modelId: claude-sonnet-4-6
---
```

## CronSpec Types

```typescript
interface CronSpecCommonFields {
  id?: string
  title?: string
  prompt?: string
  workspaceRoot: string         // required in parsed file specs
  mode?: "act" | "plan" | "yolo"
  systemPrompt?: string
  modelSelection?: { providerId: string; modelId?: string }
  maxIterations?: number
  timeoutSeconds?: number
  tools?: string[]
  extensions?: Array<"rules" | "skills" | "plugins">
  source?: string
  tags?: string[]
  enabled?: boolean
  metadata?: Record<string, unknown>
}

interface CronScheduleSpec extends CronSpecCommonFields {
  triggerKind: "schedule"
  schedule: string              // cron expression
  timezone?: string
}

interface CronOneOffSpec extends CronSpecCommonFields {
  triggerKind: "one_off"
}

interface CronEventSpec extends CronSpecCommonFields {
  triggerKind: "event"
  event: string                 // e.g., "github.pull_request.opened"
  filters?: Record<string, unknown>
  debounceSeconds?: number
  dedupeWindowSeconds?: number
  cooldownSeconds?: number
  maxParallel?: number
}
```

## Programmatic Automation API

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  automation: true,
})

// Start automation service
await cline.automation.start()

// Ingest an external event
cline.automation.ingestEvent({
  eventId: "evt-123",
  eventType: "github.pull_request.opened",
  source: "github",
  occurredAt: new Date().toISOString(),
  payload: { pr: { number: 42, title: "..." } },
})

// List specs, runs, events
const specs = cline.automation.listSpecs()
const runs = cline.automation.listRuns()
const events = cline.automation.listEvents()

// Reconcile specs from the configured cron directory
await cline.automation.reconcileNow()

// Stop automation
await cline.automation.stop()
```

## Event Ingestion from Plugins

Plugins can declare and emit automation events:

```typescript
import type { AgentPlugin } from "@cline/sdk"

const webhookPlugin: AgentPlugin = {
  name: "webhook-events",
  manifest: { capabilities: ["automationEvents"] },
  setup(api, ctx) {
    api.registerAutomationEventType({
      eventType: "webhook.received",
      source: "custom",
      description: "External webhook received",
    })

    ctx.automation?.ingestEvent({
      eventId: "evt-456",
      eventType: "webhook.received",
      source: "custom",
      occurredAt: new Date().toISOString(),
      payload: { ... },
    })
  },
}
```

## Event Concurrency Control

| Field | Behavior |
|------|----------|
| `debounceSeconds` | Delay before queueing to allow related events to arrive |
| `dedupeWindowSeconds` | Suppress duplicate events for a period |
| `cooldownSeconds` | Wait after a matched run before queueing another |
| `maxParallel` | Limit concurrent runs for an event spec |

## Run Reports

Completed runs can write Markdown reports under the resolved cron specs directory with:
- Run metadata (spec, trigger, timing)
- Summary of agent output
- Usage (tokens, cost)
- Tool calls made
- Trigger event context (for event-driven runs)

## Use Cases

- Daily standup summaries
- Automated dependency update checks
- PR review on open
- Codebase health reports
- Scheduled security scans
- Event-driven CI/CD workflows

## See Also

- `../clinecore/REFERENCE.md` - ClineCore runtime
- `../clinecore/api.md` - Automation API details
- `../plugins/REFERENCE.md` - Plugin events
- `../production/REFERENCE.md` - Production deployment
