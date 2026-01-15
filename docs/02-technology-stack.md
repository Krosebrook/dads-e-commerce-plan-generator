# AI-Native Technology Stack for E-commerce SaaS MVP

## Overview
This document outlines the recommended technology stack for the LLM-powered E-commerce Plan Generator SaaS MVP, with a focus on AI-native capabilities, prompt management, vector search, and production-ready infrastructure.

---

## Current Stack Analysis

### Existing Technologies (Already Implemented)
```json
{
  "frontend": {
    "framework": "React 19.2.0",
    "language": "TypeScript 5.8.2",
    "buildTool": "Vite 6.2.0",
    "styling": "Tailwind CSS 4.1.17"
  },
  "llm": {
    "provider": "Google Gemini",
    "sdk": "@google/genai 1.26.0",
    "models": ["gemini-1.5-flash", "gemini-1.5-pro"]
  },
  "backend": {
    "database": "Supabase 2.90.1",
    "storage": "localStorage (fallback)",
    "authentication": "Supabase Auth"
  },
  "ui": {
    "components": "Blink SDK 0.18.7",
    "icons": "lucide-react 0.553.0"
  },
  "export": {
    "pdf": "jspdf 2.5.1",
    "screenshot": "html2canvas 1.4.1"
  }
}
```

**Strengths:**
- ✅ Modern React with TypeScript for type safety
- ✅ Google Gemini integration with native SDK
- ✅ Fast development with Vite
- ✅ Supabase for backend (Auth + Database + Storage)
- ✅ Export functionality for generated plans

**Gaps:**
- ❌ No prompt versioning or management system
- ❌ No vector database for RAG (Retrieval-Augmented Generation)
- ❌ No LLM observability or monitoring
- ❌ No prompt testing framework
- ❌ No billing/subscription management
- ❌ Limited production deployment infrastructure

---

## Recommended Technology Stack

### 1. LLM Prompting & Reasoning Workflows

#### Primary LLM Provider: **Google Gemini** (Current)
**Status:** ✅ Already Implemented

**Recommendation:** Continue with Gemini, add fallback providers
```typescript
// Recommended architecture
interface LLMProvider {
  name: 'gemini' | 'openai' | 'anthropic';
  models: string[];
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    jsonMode: boolean;
    vision: boolean;
    grounding: boolean;
  };
}

// Fallback strategy
const providers = [
  { primary: 'gemini-1.5-flash', fallback: 'gemini-1.5-pro' },
  { primary: 'gemini', fallback: 'gpt-4o-mini' }, // Cross-provider fallback
];
```

**Reasons:**
- Cost-effective for MVP ($0.075/$0.30 per 1M tokens)
- Built-in Google Search grounding for competitive analysis
- Fast response times with Flash model
- Strong JSON mode for structured outputs
- Native multimodal support (text + images)

**Enhancement:** Add **Vercel AI SDK** for provider abstraction
```bash
npm install ai @ai-sdk/google @ai-sdk/openai
```

**Benefits:**
- Unified API across LLM providers
- Built-in streaming support
- Easy provider switching
- Type-safe function calling

```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const result = await generateText({
  model: google('models/gemini-1.5-flash'),
  prompt: 'Generate SMART goals for: organic dog treats',
  temperature: 0.7,
});
```

---

#### Prompt Management: **Promptfoo** + Custom Versioning
**Status:** ❌ Not Implemented (HIGH PRIORITY)

**Recommendation:** Implement Promptfoo for prompt testing + Git-based versioning

**Installation:**
```bash
npm install -D promptfoo
```

**Directory Structure:**
```
/prompts/
  /templates/
    smart-goals.yaml
    product-plan.yaml
    competitor-analysis.yaml
  /tests/
    smart-goals.test.yaml
    product-plan.test.yaml
  /versions/
    v1.0/
    v1.1/
  promptfoo.config.yaml
```

**Example Prompt Template (YAML):**
```yaml
# prompts/templates/smart-goals.yaml
version: "1.2.0"
model: "gemini-1.5-flash"
temperature: 0.7
lastUpdated: "2024-01-15"
author: "prompt-team"

systemPrompt: |
  You are a business strategy expert helping entrepreneurs define SMART goals for their e-commerce ventures.
  
  SMART criteria:
  - Specific: Clear, well-defined goal
  - Measurable: Quantifiable metrics
  - Achievable: Realistic given resources
  - Relevant: Aligned with business objectives
  - Time-bound: Specific deadline or timeframe

userPrompt: |
  Product idea: {{productIdea}}
  Brand voice: {{brandVoice}}
  
  Generate SMART goals for launching this e-commerce product. Return as JSON:
  {
    "specific": {"title": "", "description": ""},
    "measurable": {"title": "", "description": ""},
    "achievable": {"title": "", "description": ""},
    "relevant": {"title": "", "description": ""},
    "timeBound": {"title": "", "description": ""}
  }

validation:
  - type: "json-schema"
    schema: "./schemas/smart-goals.json"
  - type: "keyword-presence"
    required: ["specific", "measurable", "achievable", "relevant", "timeBound"]
  - type: "max-length"
    field: "description"
    maxChars: 200
```

**Test Configuration:**
```yaml
# prompts/tests/smart-goals.test.yaml
description: "SMART Goals Generation Tests"
prompts:
  - file://templates/smart-goals.yaml

providers:
  - id: google:gemini-1.5-flash
    config:
      temperature: 0.7

tests:
  - vars:
      productIdea: "organic dog treats"
      brandVoice: "Witty & Humorous Dad"
    assert:
      - type: is-json
      - type: contains
        value: "specific"
      - type: javascript
        value: "output.specific.description.length > 20"
      
  - vars:
      productIdea: "AI-powered fitness app"
      brandVoice: "Professional"
    assert:
      - type: is-json
      - type: latency
        threshold: 5000  # 5 seconds
```

**Running Tests:**
```bash
# Run all prompt tests
npx promptfoo eval -c prompts/promptfoo.config.yaml

# Compare prompt versions
npx promptfoo eval --compare v1.0:v1.1

# Generate test report
npx promptfoo eval --output ./reports/prompt-test-results.html
```

---

### 2. Vector Search & Retrieval-Augmented Generation (RAG)

#### Vector Database: **Supabase pgvector**
**Status:** ⚠️ Partially Available (Supabase supports pgvector)

**Recommendation:** Implement pgvector for semantic search and RAG

**Use Cases:**
1. **Document retrieval**: Search past venture plans for similar products
2. **Semantic FAQ**: Match user questions to relevant help articles
3. **Competitive intelligence**: Store and retrieve market research
4. **Prompt context**: Pull relevant examples for few-shot prompting

**Implementation:**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ventures embeddings table
CREATE TABLE venture_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venture_id UUID REFERENCES ventures(id),
  content TEXT,
  embedding vector(768),  -- Gemini embedding dimension
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON venture_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**TypeScript Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/genai';

// Generate embeddings using Gemini
async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'embedding-001' });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Store venture with embeddings
async function indexVenture(venture: SavedVenture) {
  const supabase = createClient(/* config */);
  
  // Create searchable content
  const content = `
    ${venture.name}
    ${venture.data.productIdea}
    ${venture.data.plan?.description}
    ${venture.data.analysis?.marketSummary}
  `.trim();
  
  const embedding = await generateEmbedding(content);
  
  await supabase.from('venture_embeddings').insert({
    venture_id: venture.id,
    content,
    embedding,
    metadata: {
      category: venture.data.plan?.tags[0],
      createdAt: venture.lastModified
    }
  });
}

// Semantic search
async function findSimilarVentures(query: string, limit = 5) {
  const supabase = createClient(/* config */);
  const queryEmbedding = await generateEmbedding(query);
  
  const { data, error } = await supabase.rpc('match_ventures', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  });
  
  return data;
}
```

**Alternative Option: Pinecone** (if Supabase pgvector limitations)
```bash
npm install @pinecone-database/pinecone
```

**Pros of Pinecone:**
- Specialized vector database
- Better performance at scale
- Managed infrastructure
- Built-in filtering and metadata

**Cons:**
- Additional service to manage
- Extra cost ($70/month starter)
- Data lives outside Supabase ecosystem

**Recommendation:** Start with Supabase pgvector (free tier), migrate to Pinecone if scaling beyond 100k ventures.

---

### 3. Backend Services Architecture

#### Current: **Supabase** (Database + Auth + Storage)
**Status:** ✅ Implemented

**Enhancement:** Add **Supabase Edge Functions** for server-side LLM calls

**Why Server-Side LLM Calls?**
- 🔒 Protect API keys from client exposure
- 💰 Better rate limiting and cost control
- ⚡ Streaming responses with SSE (Server-Sent Events)
- 🛡️ Input validation and sanitization
- 📊 Centralized logging and monitoring

**Implementation:**
```typescript
// supabase/functions/generate-smart-goals/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

serve(async (req) => {
  const { productIdea, brandVoice } = await req.json();
  
  // Input validation
  if (!productIdea || productIdea.length < 5) {
    return new Response('Invalid input', { status: 400 });
  }
  
  // Rate limiting (check user request count)
  const userId = req.headers.get('x-user-id');
  const isRateLimited = await checkRateLimit(userId);
  if (isRateLimited) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Generate with LLM
  const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY'));
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Generate SMART goals for: ${productIdea}...`;
  const result = await model.generateContent(prompt);
  
  // Log usage
  await logLLMUsage({
    userId,
    model: 'gemini-1.5-flash',
    promptTokens: result.usage?.promptTokens,
    completionTokens: result.usage?.completionTokens,
    cost: calculateCost(result.usage)
  });
  
  return new Response(result.response.text(), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Deployment:**
```bash
# Deploy edge function
supabase functions deploy generate-smart-goals

# Call from frontend
const { data } = await supabase.functions.invoke('generate-smart-goals', {
  body: { productIdea, brandVoice }
});
```

---

### 4. Authentication, Billing, and Deployment

#### Authentication: **Supabase Auth** (Current)
**Status:** ✅ Implemented

**Enhancements Needed:**
```typescript
// Add role-based access control
enum UserRole {
  FREE = 'free',          // 5 ventures, basic features
  STARTER = 'starter',    // 25 ventures, all features
  PRO = 'pro',           // Unlimited ventures, priority support
  ADMIN = 'admin'        // Full access + analytics dashboard
}

// Feature flags based on subscription
interface FeatureAccess {
  maxVentures: number;
  advancedAnalytics: boolean;
  exportPDF: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

const planFeatures: Record<UserRole, FeatureAccess> = {
  free: {
    maxVentures: 5,
    advancedAnalytics: false,
    exportPDF: true,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false
  },
  starter: {
    maxVentures: 25,
    advancedAnalytics: true,
    exportPDF: true,
    customBranding: true,
    apiAccess: false,
    prioritySupport: false
  },
  pro: {
    maxVentures: Infinity,
    advancedAnalytics: true,
    exportPDF: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true
  }
};
```

---

#### Billing: **Stripe** (Recommended)
**Status:** ❌ Not Implemented (HIGH PRIORITY for monetization)

**Installation:**
```bash
npm install @stripe/stripe-js stripe
```

**Pricing Tiers:**
```typescript
const pricingPlans = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 venture plans',
      'Basic AI generation',
      'PDF export',
      'Community support'
    ]
  },
  starter: {
    name: 'Starter',
    price: 19,  // $19/month
    priceId: 'price_starter_monthly',
    features: [
      '25 venture plans',
      'Advanced AI features',
      'Competitor analysis with grounding',
      'Custom branding',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 49,  // $49/month
    priceId: 'price_pro_monthly',
    features: [
      'Unlimited ventures',
      'Priority AI processing',
      'API access',
      'Custom export templates',
      'Priority support',
      'Early access to new features'
    ]
  }
};
```

**Supabase + Stripe Integration:**
```typescript
// supabase/functions/create-checkout-session/index.ts
import Stripe from 'https://esm.sh/stripe@12.0.0';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
    apiVersion: '2023-10-16',
  });
  
  const { priceId, userId } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    customer_email: req.headers.get('x-user-email'),
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${req.headers.get('origin')}/dashboard?success=true`,
    cancel_url: `${req.headers.get('origin')}/pricing`,
    metadata: { userId }
  });
  
  return new Response(JSON.stringify({ url: session.url }));
});

// Webhook for subscription events
// supabase/functions/stripe-webhook/index.ts
serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')
  );
  
  switch (event.type) {
    case 'customer.subscription.created':
      await updateUserSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await downgradeUser(event.data.object);
      break;
  }
  
  return new Response(JSON.stringify({ received: true }));
});
```

---

#### Deployment: **Vercel** (Recommended)
**Status:** ❌ Not Implemented

**Why Vercel:**
- ⚡ Optimized for React + Vite
- 🚀 Zero-config deployments
- 🌍 Global CDN (low latency)
- 🔄 Automatic preview deployments for PRs
- 📊 Built-in analytics
- 🔒 Free SSL certificates
- 💰 Generous free tier

**Alternative:** **Netlify** (similar features, slightly different DX)

**Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_GOOGLE_AI_API_KEY": "@google-ai-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

**Deployment Workflow:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

**GitHub Integration:**
- Automatically deploys on push to `main` (production)
- Creates preview URLs for pull requests
- Rollback to previous deployments in one click

---

### 5. Versioning, Testing, and Monitoring

#### Prompt Versioning: **Git + Promptfoo** (Recommended)
**Status:** ❌ Not Implemented

**Git-Based Versioning:**
```bash
/prompts/
  /v1.0.0/
    smart-goals.yaml
    product-plan.yaml
  /v1.1.0/
    smart-goals.yaml  # Updated with better examples
    competitor-analysis.yaml  # New prompt
  CHANGELOG.md
```

**Changelog Example:**
```markdown
# Prompt Changelog

## v1.1.0 (2024-01-15)
### Added
- Competitor analysis prompt with grounding sources
- Few-shot examples for marketing copy generation

### Changed
- SMART goals prompt now includes explicit token limits
- Improved JSON schema validation for product plans

### Fixed
- Reduced hallucinations in financial projections by adding constraints
```

**Version Deployment:**
```typescript
// services/promptRegistry.ts
const PROMPT_VERSION = '1.1.0';

async function loadPrompt(promptName: string): Promise<PromptTemplate> {
  const response = await fetch(
    `/prompts/${PROMPT_VERSION}/${promptName}.yaml`
  );
  return parseYAML(await response.text());
}
```

---

#### LLM Observability: **Langfuse** (Recommended)
**Status:** ❌ Not Implemented (CRITICAL for production)

**Why Langfuse:**
- 📊 Track every LLM call (latency, cost, tokens)
- 🐛 Debug failed generations
- 📈 Monitor prompt performance over time
- 💰 Cost analytics per user/feature
- ⭐ User feedback collection (thumbs up/down)

**Installation:**
```bash
npm install langfuse
```

**Integration:**
```typescript
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

async function generateWithObservability(
  promptName: string,
  inputs: Record<string, any>
) {
  const trace = langfuse.trace({
    name: promptName,
    userId: currentUser.id,
    metadata: { feature: 'smart-goals-generation' }
  });
  
  const generation = trace.generation({
    name: promptName,
    model: 'gemini-1.5-flash',
    modelParameters: { temperature: 0.7 },
    input: inputs,
  });
  
  try {
    const result = await callLLM(inputs);
    
    generation.end({
      output: result,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens
      },
      metadata: {
        cost: calculateCost(result.usage),
        latency: result.latencyMs
      }
    });
    
    return result;
  } catch (error) {
    generation.end({
      statusMessage: error.message,
      level: 'ERROR'
    });
    throw error;
  } finally {
    await langfuse.flushAsync();
  }
}

// Track user feedback
async function recordFeedback(generationId: string, score: number) {
  langfuse.score({
    traceId: generationId,
    name: 'user-feedback',
    value: score,  // 1 = thumbs up, 0 = thumbs down
    comment: 'User clicked regenerate button'
  });
}
```

**Dashboard Insights:**
- Average cost per generation: $0.003
- P95 latency: 4.2s
- Success rate: 96.8%
- Most expensive feature: Competitor Analysis ($0.012 per call)
- Error rate by prompt: SMART goals (2.1%), Product Plan (1.8%)

**Alternatives:**
- **LangSmith** (by LangChain) - Similar features, tighter LangChain integration
- **Helicone** - Simpler, proxy-based, good for multi-provider
- **Weights & Biases** - More ML-focused, steeper learning curve

---

#### Testing Framework: **Vitest + Promptfoo**
**Status:** ⚠️ No LLM-specific tests

**Add Vitest for Unit Tests:**
```bash
npm install -D vitest @vitest/ui
```

**Test Structure:**
```typescript
// services/__tests__/geminiService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateSmartGoals } from '../geminiService';

describe('generateSmartGoals', () => {
  it('should generate valid SMART goals', async () => {
    const result = await generateSmartGoals(
      'organic dog treats',
      'Witty & Humorous Dad'
    );
    
    expect(result).toHaveProperty('specific');
    expect(result.specific.title).toBeTruthy();
    expect(result.specific.description.length).toBeGreaterThan(20);
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock API failure
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('API timeout')
    );
    
    await expect(
      generateSmartGoals('test product', 'Professional')
    ).rejects.toThrow();
  });
  
  it('should validate output schema', async () => {
    const result = await generateSmartGoals('test', 'Professional');
    
    const requiredKeys = [
      'specific', 'measurable', 'achievable', 'relevant', 'timeBound'
    ];
    requiredKeys.forEach(key => {
      expect(result).toHaveProperty(key);
      expect(result[key]).toHaveProperty('title');
      expect(result[key]).toHaveProperty('description');
    });
  });
});
```

**Run Tests:**
```bash
npm run test          # Run all tests
npm run test:ui       # Visual test interface
npm run test:coverage # Coverage report
```

---

## Complete Stack Summary

| Category | Technology | Status | Priority |
|----------|-----------|--------|----------|
| **Frontend** | React 19 + TypeScript + Vite | ✅ Implemented | - |
| **Styling** | Tailwind CSS 4 | ✅ Implemented | - |
| **LLM Provider** | Google Gemini 1.5 | ✅ Implemented | - |
| **LLM Abstraction** | Vercel AI SDK | ❌ Not Implemented | Medium |
| **Prompt Management** | Promptfoo + YAML | ❌ Not Implemented | **HIGH** |
| **Vector Database** | Supabase pgvector | ⚠️ Available, not used | Medium |
| **Backend** | Supabase (DB + Auth + Storage) | ✅ Implemented | - |
| **Edge Functions** | Supabase Edge Functions | ❌ Not Implemented | **HIGH** |
| **Authentication** | Supabase Auth | ✅ Implemented | - |
| **Billing** | Stripe | ❌ Not Implemented | **HIGH** |
| **Deployment** | Vercel | ❌ Not Implemented | **HIGH** |
| **Observability** | Langfuse | ❌ Not Implemented | **CRITICAL** |
| **Testing** | Vitest + Promptfoo | ⚠️ Partial | Medium |
| **Monitoring** | Sentry (errors) | ❌ Not Implemented | Medium |
| **Analytics** | PostHog / Mixpanel | ⚠️ Custom implementation | Low |

---

## Implementation Priority

### Phase 1: Production Readiness (Week 1-2)
1. ✅ Migrate LLM calls to Supabase Edge Functions
2. ✅ Implement Stripe billing integration
3. ✅ Set up Vercel deployment pipeline
4. ✅ Add Langfuse observability

### Phase 2: Prompt Engineering (Week 3-4)
5. ✅ Set up Promptfoo testing framework
6. ✅ Create YAML-based prompt templates
7. ✅ Implement Git-based prompt versioning
8. ✅ Add comprehensive prompt test suites

### Phase 3: Advanced Features (Week 5-6)
9. ✅ Implement Supabase pgvector for RAG
10. ✅ Add semantic search for similar ventures
11. ✅ Build few-shot prompting with retrieved examples
12. ✅ Implement Vercel AI SDK for provider abstraction

### Phase 4: Optimization (Week 7-8)
13. ✅ Optimize prompts based on Langfuse metrics
14. ✅ Implement caching for repeated queries
15. ✅ Add rate limiting per subscription tier
16. ✅ Build cost monitoring dashboard

---

## Cost Estimation

### Monthly Costs (1000 Active Users)

| Service | Usage | Cost |
|---------|-------|------|
| **Google Gemini** | ~500k API calls, 100M tokens | $300 |
| **Supabase** | 10GB DB, 20GB bandwidth | $25 (Pro plan) |
| **Vercel** | Hobby plan + bandwidth | $20 (Pro plan) |
| **Stripe** | 500 paying customers @ 2.9% + $0.30 | ~$450 |
| **Langfuse** | Cloud plan | $99 |
| **Promptfoo** | Self-hosted (free) | $0 |
| **Domain + SSL** | Included in Vercel | $0 |
| **Total** | | **~$894/month** |

**Revenue** (500 paying @ $19/mo avg): **$9,500/month**  
**Gross Margin**: ~91% (excellent for SaaS)

---

## Next Steps

Proceed to:
- LLM workflow definitions (`03-llm-workflows.md`)
- Documentation structure (`04-documentation-structure.md`)
- Rollout plan and best practices (`05-rollout-plan.md`)
