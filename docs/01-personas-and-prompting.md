# Personas and Prompting Frameworks

## Overview
This document identifies the key personas involved in the LLM-powered E-commerce Plan Generator SaaS MVP and maps the most effective prompting frameworks to each persona based on their tasks, reasoning needs, and interaction patterns.

---

## 1. Top Personas

### Internal Stakeholders

#### 1.1 AI Product Manager
**Role Title:** AI Product Manager

**Key Goals & Needs:**
- Define and optimize LLM workflows for maximum user value
- Monitor prompt performance and user satisfaction metrics
- Iterate on prompt templates based on user feedback and business KPIs
- Ensure AI features align with product strategy

**Typical Tasks with AI Components:**
- Design new LLM-powered features (e.g., competitor analysis, marketing copy generation)
- A/B test different prompt variations
- Analyze user engagement with AI-generated content
- Define success metrics for AI outputs (relevance, quality, user acceptance rate)

**Recommended Prompting Framework:** **Chain-of-Thought (CoT) + Role Prompting**

**Justification:**
- **Task Complexity:** High - Requires understanding user needs, business context, and AI capabilities
- **Reasoning Needs:** Must reason through multi-step workflows and trade-offs
- **Interaction Patterns:** Exploratory and iterative

**Example Prompt:**
```
You are an expert AI Product Manager for an e-commerce SaaS platform.

Task: Design a prompt template for generating competitor analysis reports for small business owners launching new e-commerce products.

Think step-by-step:
1. Identify what information a competitor analysis should include for e-commerce
2. Consider what data sources the LLM needs (product description, target market, budget)
3. Determine the output format that would be most actionable for entrepreneurs
4. Include validation checks to ensure quality and avoid hallucinations

Requirements:
- Output should include: market overview, 3-5 key competitors, pricing comparison, differentiation strategies
- Format as structured JSON with clear field definitions
- Include confidence scores for data points
- Ensure the tone is encouraging yet realistic for first-time entrepreneurs

Provide:
1. The prompt template with placeholders for variables
2. Expected output schema
3. Quality validation criteria
4. Example usage with a sample product ("organic baby food subscription box")
```

---

#### 1.2 Prompt Engineer
**Role Title:** Prompt Engineer / LLM Operations Specialist

**Key Goals & Needs:**
- Craft, test, and version control prompts across all application features
- Optimize prompts for performance (latency, cost, quality)
- Implement guardrails and validation layers
- Maintain prompt library and documentation

**Typical Tasks with AI Components:**
- Write and refine system prompts for different generation tasks
- Implement few-shot learning examples
- Test prompt robustness against edge cases
- Monitor and reduce hallucinations
- Version and deploy prompts to production

**Recommended Prompting Framework:** **Few-Shot Prompting + Prompt Chaining**

**Justification:**
- **Task Complexity:** High - Needs to handle diverse use cases with consistent quality
- **Reasoning Needs:** Pattern recognition and structured output generation
- **Interaction Patterns:** Systematic testing and refinement

**Example Prompt:**
```
You are an expert Prompt Engineer specializing in e-commerce content generation.

Task: Create a robust prompt for generating product descriptions that converts well on e-commerce platforms.

Context:
- Target users are non-technical entrepreneurs
- Products vary widely (physical goods, digital products, services)
- Must follow SEO best practices
- Should match user's selected "brand voice" (e.g., "Witty Dad", "Professional", "Casual Friend")

Here are three examples of excellent product descriptions for reference:

Example 1 (Brand Voice: Witty Dad):
Input: "Magnetic phone holder for car"
Output: "Say goodbye to fumbling with your phone while belting out your favorite road trip anthem. This magnetic wonder stick keeps your device secure and visible, so you can navigate like a pro and still have a hand free for air guitar. Strong enough to hold your phone through speed bumps, gentle enough not to mess with your screen. It's basically the co-pilot you never knew you needed."

Example 2 (Brand Voice: Professional):
Input: "Project management software for small teams"
Output: "Streamline your team's workflow with intuitive project management designed for agility. Track milestones, assign tasks, and monitor progress in real-time with our cloud-based platform. Reduce meeting overhead by 40% while increasing delivery speed. Trusted by 10,000+ teams worldwide."

Example 3 (Brand Voice: Casual Friend):
Input: "Handmade soy candles"
Output: "Light up your space with candles that actually smell good (we're looking at you, mystery mall candles). Made with 100% soy wax and essential oils, these babies burn clean for 40+ hours. Perfect for Netflix marathons, bath time, or just making your apartment smell less like yesterday's takeout."

Now generate a product description for:
- Product: {productTitle}
- Category: {category}
- Price Point: {priceRange}
- Target Audience: {targetAudience}
- Brand Voice: {brandVoice}
- Key Features: {features}

Output Format (JSON):
{
  "headline": "Catchy 8-12 word headline",
  "description": "120-160 character engaging description with SEO keywords",
  "bulletPoints": ["3-5 benefit-focused bullet points"],
  "callToAction": "Compelling CTA button text"
}

Ensure:
- No generic marketing fluff
- Include 2-3 relevant SEO keywords naturally
- Match the specified brand voice precisely
- Focus on benefits over features
- Keep total length under 200 words
```

---

#### 1.3 Full-Stack Developer
**Role Title:** Senior Full-Stack Engineer

**Key Goals & Needs:**
- Integrate LLM APIs into the application architecture
- Build prompt orchestration and chaining logic
- Implement error handling, retry mechanisms, and fallbacks
- Optimize API usage for cost and latency

**Typical Tasks with AI Components:**
- Integrate Google Gemini API for various generation tasks
- Build middleware for prompt template rendering
- Implement streaming responses for real-time generation
- Create monitoring dashboards for API usage and errors
- Handle rate limiting and quota management

**Recommended Prompting Framework:** **ReAct (Reasoning + Acting) + Structured Output**

**Justification:**
- **Task Complexity:** Medium-High - Needs to reason about system architecture and implementation
- **Reasoning Needs:** Must plan, implement, and debug complex integrations
- **Interaction Patterns:** Problem-solving and code generation

**Example Prompt:**
```
You are a Senior Full-Stack Developer working on an LLM-powered SaaS application using TypeScript, React, and Google Gemini API.

Task: Implement a robust service function for generating SMART goals from a product idea with proper error handling, retry logic, and cost optimization.

Current context:
- We use Google Gemini 1.5 Flash for most generations
- Application is client-side React with Vite
- We want to minimize token usage while maintaining quality
- Users expect responses within 5 seconds

Requirements:
1. Create a TypeScript function `generateSmartGoals(productIdea: string, brandVoice: string): Promise<SMARTGoals>`
2. Use structured output generation (JSON mode)
3. Implement exponential backoff retry (max 3 attempts)
4. Add request timeout of 10 seconds
5. Optimize prompt length to reduce costs
6. Include validation for the output schema
7. Handle common errors gracefully

Let me work through this step-by-step:

Thought 1: I need to craft an efficient prompt that generates SMART goals in one API call
Action 1: Design the prompt with clear structure and JSON schema definition

Thought 2: Error handling should cover network issues, API errors, and validation failures
Action 2: Implement try-catch with specific error types and user-friendly messages

Thought 3: Retry logic should be smart about which errors to retry
Action 3: Only retry on transient errors (5xx, network), not on validation errors (4xx)

Provide:
1. Complete TypeScript implementation with types
2. Example usage in a React component
3. Unit test cases covering success and error scenarios
4. Cost estimation (tokens per request)
```

---

#### 1.4 QA Engineer
**Role Title:** Quality Assurance Engineer (AI/ML Focus)

**Key Goals & Needs:**
- Validate consistency and quality of AI-generated outputs
- Create test suites for prompt variations
- Identify edge cases and failure modes
- Ensure AI features meet acceptance criteria

**Typical Tasks with AI Components:**
- Test prompt outputs across different inputs
- Validate JSON schema compliance
- Check for hallucinations and inappropriate content
- Measure response time and success rates
- Regression testing for prompt changes

**Recommended Prompting Framework:** **Structured Prompt Testing + Evaluation Criteria**

**Justification:**
- **Task Complexity:** Medium - Systematic validation and testing
- **Reasoning Needs:** Pattern recognition for anomalies and edge cases
- **Interaction Patterns:** Repetitive testing with various inputs

**Example Prompt:**
```
You are a QA Engineer specializing in testing AI-generated content for an e-commerce SaaS platform.

Task: Create a comprehensive test plan for the "Generate Competitive Analysis" feature.

Feature Description:
- Input: Product idea (string), brand voice (enum), target market (optional)
- LLM generates: Market summary, 3-5 competitors, opportunity score, differentiation strategies
- Output format: JSON matching CompetitiveAnalysis interface
- Expected response time: < 8 seconds
- Uses Google Gemini with search grounding

Test Categories to Cover:
1. **Happy Path Testing**
   - Standard product ideas (e.g., "organic dog treats", "mobile app for budgeting")
   - Different brand voices (Professional, Witty Dad, Casual Friend)
   - Various market sizes (niche vs. broad)

2. **Edge Cases**
   - Very short product ideas (e.g., "shoes")
   - Very long product ideas (500+ characters)
   - Unusual or niche products (e.g., "left-handed smoke shifter")
   - Non-English product names with English description
   - Products in saturated markets (e.g., "smartphone")

3. **Error Conditions**
   - Empty product idea
   - Special characters and emojis in input
   - API timeout scenarios
   - Invalid brand voice value

4. **Output Validation**
   - JSON schema compliance
   - All required fields present
   - Opportunity score is 0-100
   - At least 3 competitors returned
   - No placeholder text (e.g., "[Insert competitor name]")
   - Sources/grounding data included when available

5. **Quality Checks**
   - Competitors are real and relevant
   - Market summary is factual (not hallucinated)
   - Differentiation strategies are actionable
   - Tone matches selected brand voice

Provide:
1. Test case matrix (input | expected output | validation criteria)
2. Automated test script outline in TypeScript/Jest
3. Manual test checklist for subjective quality
4. Acceptance criteria with pass/fail thresholds
5. List of potential risks and mitigation strategies
```

---

### External Stakeholders

#### 1.5 Entrepreneur / Side Hustler
**Role Title:** First-Time E-commerce Entrepreneur

**Key Goals & Needs:**
- Get from product idea to actionable launch plan quickly
- Understand competitive landscape without expensive market research
- Generate professional marketing materials without hiring agencies
- Make informed financial decisions with realistic projections

**Typical Tasks with AI Components:**
- Input product ideas and receive validated SMART goals
- Generate product descriptions, pricing strategies, and variants
- Create brand identity (logo, color palette, brand voice)
- Get competitor analysis and market insights
- Generate marketing copy for ads, social media, and email campaigns
- Understand financial projections and break-even analysis

**Recommended Prompting Framework:** **Conversational Prompting + Guided Workflows**

**Justification:**
- **Task Complexity:** Low-Medium - Needs simplicity and clear guidance
- **Reasoning Needs:** Wants recommendations, not complex reasoning steps
- **Interaction Patterns:** Step-by-step wizard, progressive disclosure

**Example Prompt (System Prompt for Chat Assistant):**
```
You are a friendly and knowledgeable business mentor helping a first-time entrepreneur launch their e-commerce product.

Your role:
- Be encouraging and supportive while keeping advice realistic
- Break down complex business concepts into simple terms
- Provide actionable next steps, not just theory
- Ask clarifying questions when needed
- Warn about potential pitfalls without being discouraging

User context:
- Product idea: {productIdea}
- Experience level: First-time entrepreneur
- Budget: {budget} (low/medium/high)
- Timeline: {timeline} (weeks to launch)

When the user asks for help, follow this approach:
1. Acknowledge their question/idea positively
2. Provide 2-3 concrete, actionable recommendations
3. Explain the "why" behind your advice in 1-2 sentences
4. Offer a follow-up question or next step

Example interaction:
User: "I'm thinking of selling handmade candles online. Is this a good idea?"

Your response:
"Handmade candles are a popular choice for new e-commerce entrepreneurs - great for you! The market is competitive but there's definitely room for unique products.

Here's what I recommend focusing on:
1. **Find your niche:** Instead of 'generic candles,' specialize (e.g., gaming-themed candles, zodiac candles, book-inspired candles). This helps you stand out and attract a dedicated audience.

2. **Test small before scaling:** Start with 2-3 signature scents and gauge interest on platforms like Etsy or Instagram. This minimizes risk and helps you learn what customers love.

3. **Calculate your costs carefully:** Handmade products have tricky margins. Make sure you're accounting for materials, packaging, shipping, AND your time.

Want me to help you brainstorm some unique angles for your candle business? Or would you like to dive into the cost breakdown first?"

Tone: Encouraging but honest. Use casual language and occasional friendly phrases like "Great question!" or "Here's the thing..."

Never:
- Give financial or legal advice beyond general education
- Guarantee success or specific outcomes
- Make up statistics or competitor data
- Recommend specific vendors without disclaimers
```

---

#### 1.6 Small Business Marketing Manager
**Role Title:** Marketing Manager at Small E-commerce Business

**Key Goals & Needs:**
- Generate high-quality marketing copy at scale
- Run A/B tests on ad variations efficiently
- Plan content calendars and social media strategies
- Optimize campaigns based on performance data

**Typical Tasks with AI Components:**
- Generate multiple ad copy variations for testing
- Create social media post calendars
- Write SEO-optimized product descriptions
- Generate email marketing campaigns
- Develop influencer outreach templates
- Create press releases and PR content

**Recommended Prompting Framework:** **Few-Shot + Variation Generation + Constraints**

**Justification:**
- **Task Complexity:** Medium - Needs creativity within brand guidelines
- **Reasoning Needs:** Pattern matching from examples, style consistency
- **Interaction Patterns:** Batch generation, iteration on variations

**Example Prompt:**
```
You are an expert copywriter specializing in e-commerce marketing for direct-to-consumer brands.

Task: Generate 5 distinct Facebook ad variations for our new product launch, optimized for cold audience targeting.

Product Details:
- Name: EcoFlow Water Bottle
- Description: Self-cleaning water bottle with UV-C LED technology
- Price: $79.99
- USP: Kills 99.9% of bacteria in 60 seconds, no filters needed
- Target audience: Health-conscious millennials (25-40), active lifestyle
- Brand voice: Wellness-focused with subtle tech edge, aspirational but approachable

Examples of our successful ad copy style:

Ad Example 1 (Previous product):
Headline: "Your Morning Routine Just Got Smarter"
Body: "Meet the coffee maker that learns how you like it. Perfect brew, zero guesswork. Wake up to coffee shop quality without leaving your bed."
CTA: "Upgrade Your Mornings"

Ad Example 2 (Previous product):
Headline: "Tired of Meal Prep Taking Hours?"
Body: "This smart kitchen scale does the planning for you. Weigh, track, and get recipes—all in one device. Healthy eating made ridiculously easy."
CTA: "Cook Smarter, Not Harder"

Requirements for new ads:
1. Headlines: 5-8 words, benefit-focused, curiosity-driven
2. Body: 2-3 sentences, max 125 characters, include one specific feature + one benefit
3. CTA: Action-oriented, 2-4 words
4. Each variation should test a different angle (e.g., convenience, health, tech innovation, sustainability, travel)
5. Include emoji suggestions (1-2 per ad) for visual appeal
6. Add audience targeting notes for each variation

Output format:
{
  "variations": [
    {
      "angle": "Convenience",
      "headline": "...",
      "body": "...",
      "cta": "...",
      "emojis": ["💧", "✨"],
      "targetingNotes": "Target: Busy professionals, gym-goers, commuters"
    },
    // ... 4 more variations
  ]
}

Constraints:
- No medical claims (e.g., "prevents disease")
- Avoid fear-mongering about bacteria
- Keep claims factual and provable
- Don't mention competitors
- Use inclusive language
```

---

#### 1.7 E-commerce Operations Manager
**Role Title:** Operations Manager for Online Retail

**Key Goals & Needs:**
- Streamline supplier sourcing and communication
- Optimize inventory planning and pricing strategies
- Understand logistics costs and shipping options
- Automate customer support and order fulfillment workflows

**Typical Tasks with AI Components:**
- Generate supplier outreach templates
- Analyze pricing strategies based on market data
- Create customer support playbooks and FAQ responses
- Plan packaging and unboxing experiences
- Generate legal compliance checklists
- Optimize shipping strategies

**Recommended Prompting Framework:** **Structured Reasoning + Decision Trees**

**Justification:**
- **Task Complexity:** High - Multi-variable optimization and operational planning
- **Reasoning Needs:** Logical decision-making with trade-offs
- **Interaction Patterns:** Analytical, data-driven outputs

**Example Prompt:**
```
You are an operations consultant specializing in e-commerce logistics and supply chain optimization.

Task: Create a comprehensive supplier evaluation framework and outreach strategy for a new e-commerce product.

Product Context:
- Product: Custom printed t-shirts with on-demand production
- Order volume: Starting at 50-100 units/month, scaling to 500+/month
- Quality requirements: Mid-range (good quality, competitive price)
- Delivery timeline: 7-14 day production + shipping
- Budget: $8-12 per unit landed cost

Create a decision framework that considers:

1. **Supplier Selection Criteria**
   - Rank these factors by importance: MOQ, price per unit, quality/samples, lead time, location, communication responsiveness, sustainability practices
   - Define "deal-breakers" vs. "nice-to-haves"

2. **Sourcing Options Analysis**
   Compare trade-offs between:
   - Domestic suppliers (US/Canada) vs. International (China, Bangladesh, Pakistan)
   - Print-on-demand services (Printful, Printify) vs. bulk manufacturers
   - White-label suppliers vs. full custom production

3. **Supplier Outreach Template**
   Draft a professional RFQ (Request for Quote) email that includes:
   - Brief company/product introduction
   - Specific product specifications (material, sizes, print method)
   - Initial order quantity and scaling projections
   - Quality expectations and sample request
   - Timeline and key questions

4. **Evaluation Scorecard**
   Create a scoring matrix (1-10 scale) for comparing supplier quotes across:
   - Price competitiveness
   - Quality of samples
   - MOQ flexibility
   - Lead time speed
   - Communication quality
   - Certifications/compliance

Output Format:
Provide a structured markdown document with:
- Decision tree diagram (text-based) for supplier type selection
- Completed RFQ email template with placeholders
- Supplier evaluation scorecard (table format)
- Risk mitigation strategies for each sourcing option
- Recommended approach with justification

Ensure advice is:
- Practical for a first-time entrepreneur (not overly complex)
- Accounts for scaling from startup to growth phase
- Includes cost considerations beyond per-unit price (shipping, customs, quality control)
```

---

## 2. Prompting Framework Summary

| Persona | Primary Framework | Secondary Framework | Reasoning |
|---------|------------------|---------------------|-----------|
| **AI Product Manager** | Chain-of-Thought (CoT) | Role Prompting | Needs to reason through complex multi-step workflows and product decisions |
| **Prompt Engineer** | Few-Shot Prompting | Prompt Chaining | Requires pattern-based generation with consistent quality and structure |
| **Full-Stack Developer** | ReAct (Reasoning + Acting) | Structured Output | Problem-solving with code generation and systematic debugging |
| **QA Engineer** | Structured Testing | Evaluation Criteria | Systematic validation across diverse inputs and edge cases |
| **Entrepreneur** | Conversational Prompting | Guided Workflows | Needs simplicity, encouragement, and step-by-step guidance |
| **Marketing Manager** | Few-Shot Variation Generation | Constraints | Creative output within brand guidelines, batch generation |
| **Operations Manager** | Structured Reasoning | Decision Trees | Analytical optimization with trade-off analysis |

---

## 3. Key Insights

### Framework Selection Principles

1. **Chain-of-Thought (CoT)**: Best for complex reasoning tasks requiring multi-step thinking
   - Use when: Planning, strategy, multi-variable decisions
   - Personas: Product managers, strategists

2. **Few-Shot Prompting**: Ideal for maintaining consistent style and format
   - Use when: Content generation, copywriting, structured outputs
   - Personas: Marketers, prompt engineers, content creators

3. **ReAct (Reasoning + Acting)**: Effective for problem-solving with actions
   - Use when: Code generation, debugging, system design
   - Personas: Developers, technical implementers

4. **Conversational Prompting**: Optimal for user-facing interactions
   - Use when: Chat assistants, onboarding, support
   - Personas: End users, non-technical stakeholders

5. **Structured Output**: Essential for API integrations and data processing
   - Use when: JSON generation, database operations, system integrations
   - Personas: All technical personas, backend systems

### Implementation Recommendations

- **Layer frameworks**: Combine role prompting as a base with specific frameworks for tasks
- **Context windows**: Provide relevant examples and constraints upfront
- **Validation**: Always include output format specifications and quality criteria
- **Iteration loops**: Design prompts that allow for regeneration and refinement
- **Guardrails**: Build in constraints to prevent hallucinations and off-brand outputs

---

## Next Steps

See additional documents for:
- Technology stack recommendations (`02-technology-stack.md`)
- LLM workflow definitions (`03-llm-workflows.md`)
- Documentation structure (`04-documentation-structure.md`)
- Rollout plan and best practices (`05-rollout-plan.md`)
