# Model Providers

The Cline SDK provider layer lives in `@cline/llms`. The `@cline/sdk` package re-exports it as the `Llms` namespace through `@cline/core`.

## Supported Providers

| Provider ID | Models |
|-------------|--------|
| `"anthropic"` | Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 |
| `"openai-native"` | OpenAI API models |
| `"openai-codex"` | OpenAI ChatGPT subscription models through OAuth |
| `"openai-codex-cli"` | Local Codex CLI provider |
| `"gemini"` | Google Gemini API models |
| `"vertex"` | Google Vertex AI models |
| `"bedrock"` | AWS Bedrock models |
| `"mistral"` | Mistral models |
| `"openai-compatible"` | Generic OpenAI-compatible endpoint |
| `"openrouter"`, `"cline"`, `"deepseek"`, `"xai"`, `"together"`, `"fireworks"`, `"groq"`, `"cerebras"`, `"sambanova"`, `"nebius"`, `"baseten"`, `"requesty"`, `"litellm"`, `"ollama"`, `"lmstudio"` | Common built-in compatible provider presets |
| `"huggingface"`, `"vercel-ai-gateway"`, `"v0"`, `"aihubmix"`, `"hicap"`, `"nousResearch"`, `"huawei-cloud-maas"`, `"qwen"`, `"qwen-code"`, `"doubao"`, `"zai"`, `"zai-coding-plan"`, `"moonshot"`, `"wandb"`, `"xiaomi"`, `"kilo"`, `"asksage"`, `"minimax"` | Additional built-in compatible provider presets |
| `"claude-code"`, `"opencode"`, `"dify"`, `"oca"`, `"sapaicore"` | Additional built-in provider families and integrations |

Provider and model catalogs change over time. Prefer `Llms.getProviderIds()`, `Llms.getProvider(id)`, and `Llms.getModelsForProvider(id)` over hardcoding lists in generated code.

## Basic Configuration

### With Agent

```typescript
import { Agent } from "@cline/sdk"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: "You are a helpful assistant.",
  tools: [],
})
```

### With ClineCore

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  prompt: "Hello",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    cwd: process.cwd(),
    systemPrompt: "You are a helpful assistant.",
    enableTools: false,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})
```

## Provider-Specific Configuration

### Anthropic

```typescript
{
  providerId: "anthropic",
  modelId: "claude-opus-4-7",  // or "claude-sonnet-4-6", "claude-haiku-4-5"
  apiKey: process.env.ANTHROPIC_API_KEY,
}
```

### OpenAI

```typescript
{
  providerId: "openai-native",
  modelId: "gpt-5.4",
  apiKey: process.env.OPENAI_API_KEY,
}
```

### Google (Gemini)

```typescript
{
  providerId: "gemini",
  modelId: "gemini-3.1-pro-preview",
  apiKey: process.env.GOOGLE_API_KEY,
}
```

### Google (Vertex AI)

```typescript
{
  providerId: "vertex",
  modelId: "gemini-3.1-pro-preview",
  // Uses application default credentials or service account
}
```

### AWS Bedrock

```typescript
{
  providerId: "bedrock",
  modelId: "anthropic.claude-sonnet-4-6",
  // Uses AWS credential chain (env vars, config file, IAM role)
  // Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
}
```

### Mistral

```typescript
{
  providerId: "mistral",
  modelId: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
}
```

### OpenAI-Compatible

For any provider with an OpenAI-compatible API:

```typescript
{
  providerId: "openai-compatible",
  modelId: "my-model",
  apiKey: process.env.API_KEY,
  baseUrl: "https://api.together.xyz/v1",
}
```

Works with: vLLM, Together AI, Fireworks, Groq, Ollama, LiteLLM, etc.

## Custom Base URL

Override the API endpoint for any provider:

```typescript
{
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.API_KEY,
  baseUrl: "https://my-proxy.example.com/v1",
}
```

## Custom Headers

Pass additional headers to API requests:

```typescript
{
  providerId: "openai-native",
  modelId: "gpt-5.4",
  apiKey: process.env.API_KEY,
  headers: {
    "X-Custom-Header": "value",
  },
}
```

## Gateway API

For advanced multi-provider setups, use the Gateway directly:

```typescript
import { Agent, Llms } from "@cline/sdk"

const gateway = Llms.createGateway({
  providerConfigs: [
    { providerId: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY },
    { providerId: "openai-native", apiKey: process.env.OPENAI_API_KEY },
  ],
})

// Create a model for a specific provider
const model = gateway.createAgentModel({
  providerId: "anthropic",
  modelId: "claude-opus-4-7",
})

// Use with Agent
const agent = new Agent({ model, systemPrompt: "...", tools: [] })
```

### Gateway Methods

```typescript
gateway.registerProvider(registration)   // add a custom provider
gateway.configureProvider(config)        // update provider settings
gateway.listProviders()                  // list available providers
gateway.listModels(providerId?)          // list available models
gateway.createAgentModel(selection)      // create model for agent
gateway.stream(request)                  // raw streaming (AsyncIterable)
```

## Provider Registry

Query and register providers programmatically:

```typescript
import { Llms } from "@cline/sdk"

// List all registered providers
const providers = await Llms.getAllProviders()

// Get models for a provider
const models = await Llms.getModelsForProvider("anthropic")

// Register a custom provider in the model catalog
Llms.registerProvider({
  provider: {
    id: "my-provider",
    name: "My Custom Provider",
    defaultModelId: "my-model",
    client: "custom",
    source: "file",
  },
  models: {
    "my-model": {
      id: "my-model",
      name: "My Model",
      contextWindow: 128000,
    },
  },
})
```

## Model Metadata

Access model info (context window, pricing, capabilities):

```typescript
import { Llms } from "@cline/sdk"

const models = await Llms.getModelsForProvider("anthropic")
for (const [modelId, model] of Object.entries(models)) {
  console.log(`${modelId}: context=${model.contextWindow}, input=$${model.pricing?.input}/MTok`)
}
```

## Cost Tracking

Track per-request and cumulative costs:

```typescript
// Via events
agent.subscribe((event) => {
  if (event.type === "usage-updated") {
    console.log(`Cost: $${event.usage.totalCost?.toFixed(4)}`)
  }
})

// Via result
const result = await agent.run("...")
console.log(`Total cost: $${result.usage.totalCost?.toFixed(4)}`)

// Via ClineCore accumulated usage
const usage = await cline.getAccumulatedUsage(sessionId)
```

## See Also

- `../agent/REFERENCE.md` - Using providers with Agent
- `../clinecore/REFERENCE.md` - Using providers with ClineCore
- `../production/REFERENCE.md` - Cost control in production
