# Multi-Agent Coordination

The Cline SDK supports two models for multi-agent work: sub-agents (parent-child) and teams (peer-to-peer).

## Sub-Agents vs Teams

| Feature | Sub-Agents | Teams |
|---------|-----------|-------|
| Enable with | `enableSpawnAgent: true` | `enableAgentTeams: true` |
| Persistence | Result returned to parent only | Across sessions |
| Coordination | Parent-child hierarchy | Peer-to-peer |
| Shared state | None | Task board, mailbox, mission log |
| Best for | One-off delegation | Complex multi-session projects |

## Sub-Agents

Sub-agents are spawned by a parent agent during a run. The current `spawn_agent` tool runs the delegated task synchronously and returns the sub-agent's result to the parent tool call.

### Enabling Sub-Agents

```typescript
const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  prompt: "Refactor the auth module and update tests",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You are a helpful coding agent.",
    enableSpawnAgent: true,
    enableAgentTeams: false,
    enableTools: true,
  },
})
```

When `enableSpawnAgent` is true, the agent gets access to sub-agent tools:

| Tool | Description |
|------|-------------|
| `spawn_agent` | Run a delegated task with a focused sub-agent |

Each defined agent profile also appears as its own `subagent_<name>` tool (see "Configured Agents" below).

### How Sub-Agents Work

1. The parent agent decides a subtask can be delegated
2. It calls `spawn_agent` with a focused system prompt and task description
3. The sub-agent runs the delegated task with its own focused prompt
4. The tool returns the sub-agent text, iteration count, finish reason, and token usage
5. The parent incorporates that result into its own run

## Configured Agents (Agent Profiles)

Configured agents are predefined sub-agents declared as files instead of spawned ad hoc. Each one becomes its own dedicated sub-agent tool, so the model can delegate to a named specialist ("the reviewer", "the migrator") rather than describing a fresh sub-agent every time.

### Defining an Agent Profile

Agent profiles are YAML-frontmatter files (`.yml` / `.yaml`) placed in an `agents/` directory:

- `<workspace>/.cline/agents/` -- project-scoped profiles.
- `~/.cline/agents/` -- user-scoped profiles.

```yaml
---
name: Reviewer
description: Reviews a diff for bugs, missing tests, and migration risk.
tools: read_files, search_codebase            # optional, restrict built-in tools
skills: code-review                            # optional, scope to specific skills
providerId: anthropic                          # optional, override provider
modelId: claude-sonnet-4-6                     # optional, override model
maxIterations: 12                              # optional, cap the sub-agent loop
---

You are a meticulous code reviewer. Inspect the diff, then report
findings ranked by severity, followed by any open questions.
```

The markdown body is the agent's system prompt. Only `name` and `description` are required; `tools`/`skills` accept a comma-separated string or a YAML array.

### Loading and Use

Profiles load automatically when `enableSpawnAgent: true` -- no extra config field. Each profile is exposed as a sub-agent tool named `subagent_<name>` (sanitized, with a short hash suffix on collisions), invoked with `{ prompt }`:

```typescript
await cline.start({
  prompt: "Have the reviewer look at the staged changes, then summarize.",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You coordinate specialist sub-agents.",
    enableSpawnAgent: true,
    enableTools: true,
  },
})
```

Behavior notes:

- `tools` restricts which built-in tools the sub-agent may use; omit it to inherit the default suite. `skills` scopes the sub-agent to specific skills.
- `providerId` / `modelId` override the model for that agent only; otherwise it inherits the parent's.
- Profiles are deduplicated by `name` (case-insensitive); workspace profiles take precedence over user profiles. A malformed file is skipped and reported, not fatal.
- Configured agents complement the generic `spawn_agent` tool -- both are available when `enableSpawnAgent` is true.

## Teams

Teams provide persistent, cross-session coordination between agents.

### Enabling Teams

```typescript
await cline.start({
  prompt: "Coordinate the auth sprint",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    cwd: process.cwd(),
    systemPrompt: "You coordinate a team of agents.",
    enableSpawnAgent: true,
    enableAgentTeams: true,
    teamName: "auth-sprint",
    enableTools: true,
  },
})
```

### Team Tools

When `enableAgentTeams` is true, the coordinator agent gets:

| Tool | Description |
|------|-------------|
| `team_spawn_teammate` | Create a new agent with a role and task |
| `team_shutdown_teammate` | Shut down a teammate agent |
| `team_task` | Create, update, or inspect team tasks |
| `team_run_task` | Start a run for a teammate task |
| `team_cancel_run` | Cancel a teammate run |
| `team_status` | Inspect team and teammate status |
| `team_list_runs` | List teammate runs |
| `team_await_runs` | Wait for selected runs |
| `team_send_message` | Send a mailbox message |
| `team_broadcast` | Broadcast a mailbox message |
| `team_read_mailbox` | Read team mailbox messages |
| `team_mission_log` | Append or read mission log entries |
| `team_cleanup` | Clean up team state |
| `team_create_outcome` | Create an outcome record |
| `team_attach_outcome_fragment` | Attach a fragment to an outcome |
| `team_review_outcome_fragment` | Review an outcome fragment |
| `team_finalize_outcome` | Finalize an outcome |
| `team_list_outcomes` | List outcome records |

### Team Persistence

Teams store shared state in:

```
~/.cline/data/
```

Team state is persisted by the ClineCore session and team stores. Treat the storage layout as an implementation detail and use the team tools or session APIs instead of reading files directly.

### CLI Team Access

```bash
cline --team-name auth-sprint "Continue the auth refactor"
```

## Choosing Between Sub-Agents and Teams

Use sub-agents when:
- You need one-off delegation within a single session
- Tasks are independent and don't need to communicate with each other
- Results only matter to the parent agent

Use teams when:
- Work spans multiple sessions over time
- Agents need to coordinate and share progress
- Tasks have dependencies between them
- You want a persistent record of multi-agent collaboration

## Patterns

### Focused Research with Sub-Agents

A parent agent can call `spawn_agent` for focused subtasks and then synthesize the returned results. Each `spawn_agent` tool call waits for that delegated run to finish before the parent receives the result:

```typescript
await cline.start({
  prompt: `Research these three topics:
    1. Current best practices for JWT auth
    2. OAuth 2.0 provider comparison
    3. Session management patterns
    Use spawn_agent for each topic, then synthesize the returned results.`,
  config: {
    enableSpawnAgent: true,
    enableAgentTeams: false,
    enableTools: true,
    // ...
  },
})
```

### Team Sprint

A coordinator manages a multi-session project:

```typescript
await cline.start({
  prompt: `You are the coordinator for the auth-sprint team.
    Review the task board and delegate the next highest-priority task
    to a teammate. Check status on any in-progress tasks.`,
  config: {
    enableAgentTeams: true,
    enableSpawnAgent: true,
    teamName: "auth-sprint",
    enableTools: true,
    // ...
  },
})
```

## See Also

- `../clinecore/REFERENCE.md` - ClineCore runtime
- `../clinecore/api.md` - Session config for teams
- `../tools/REFERENCE.md` - Tool system
- `../plugins/REFERENCE.md` - Plugin system
