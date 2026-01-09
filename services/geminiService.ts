// Use Blink SDK for AI functionality instead of @google/genai directly
// This handles authentication and API keys securely on the server side
import { blink } from '../src/lib/blink';
import { getPersonaById } from '@/src/lib/personas';
import { 
    ProductPlan, 
    ProductVariant, 
    RegenerateableSection, 
    SMARTGoals,
    CompetitiveAnalysis,
    SWOTAnalysis,
    CustomerPersona,
    BrandIdentityKit,
    MarketingKickstart,
    FinancialProjections,
    FinancialScenario,
    NextStepItem,
    ProductScoutResult,
    SeoStrategy,
    GroundingSource,
    LaunchEmail,
    AdCampaign,
    InfluencerMarketingPlan,
    CustomerSupportPlaybook,
    PackagingExperience,
    LegalChecklist,
    SupplierSuggestion,
    SocialMediaCalendar,
    ProductPhotographyPlan,
    ABTestPlan,
    EmailFunnel,
    PressRelease,
    UserPersonaId
} from '../types';

// Helper to get persona-specific instructions
const getPersonaInstructions = (personaId?: UserPersonaId): string => {
    if (!personaId) return '';
    const persona = getPersonaById(personaId);
    if (!persona) return '';
    return `\n\nThe target user persona is the "${persona.name}". Objective: ${persona.objective}. ${persona.description} Please tailor the output to specifically help this persona achieve their objective.`;
};


// Helper to safely parse JSON from model response
const parseJson = <T>(jsonString: string | undefined): T | null => {
    if (!jsonString) return null;
    try {
        const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedString) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", e, "Original string:", jsonString);
        // Fallback for malformed JSON
        try {
            const startIndex = jsonString.indexOf('{');
            const endIndex = jsonString.lastIndexOf('}');
            const arrayStartIndex = jsonString.indexOf('[');
            const arrayEndIndex = jsonString.lastIndexOf(']');

            let finalJsonString = '';

            if (startIndex !== -1 && endIndex !== -1 && (arrayStartIndex === -1 || startIndex < arrayStartIndex)) {
                finalJsonString = jsonString.substring(startIndex, endIndex + 1);
            } else if (arrayStartIndex !== -1 && arrayEndIndex !== -1) {
                finalJsonString = jsonString.substring(arrayStartIndex, arrayEndIndex + 1);
            }
            if (finalJsonString) {
                return JSON.parse(finalJsonString) as T;
            }
        } catch (e2) {
            console.error("Fallback JSON parsing failed:", e2);
        }
        return null;
    }
};

// Schemas for consistent JSON output (for Blink SDK generateObject)
const productPlanSchema = {
    type: 'object' as const,
    properties: {
        productTitle: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        priceCents: { type: 'number' },
        currency: { type: 'string' },
        sku: { type: 'string' },
        stock: { type: 'number' },
        variants: { 
            type: 'array', 
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    sku: { type: 'string' },
                    priceCents: { type: 'number' },
                    stock: { type: 'number' },
                }
            }
        },
        tags: { type: 'array', items: { type: 'string' } },
        materials: { type: 'array', items: { type: 'string' } },
        dimensions: { type: 'string' },
        weightGrams: { type: 'number' },
    },
};

// Flattened SMART goals schema to avoid depth issues
const smartGoalsSchema = {
    type: 'object' as const,
    properties: {
        specificTitle: { type: 'string' },
        specificDescription: { type: 'string' },
        measurableTitle: { type: 'string' },
        measurableDescription: { type: 'string' },
        achievableTitle: { type: 'string' },
        achievableDescription: { type: 'string' },
        relevantTitle: { type: 'string' },
        relevantDescription: { type: 'string' },
        timeBoundTitle: { type: 'string' },
        timeBoundDescription: { type: 'string' },
    },
    required: ['specificTitle', 'specificDescription', 'measurableTitle', 'measurableDescription', 
               'achievableTitle', 'achievableDescription', 'relevantTitle', 'relevantDescription',
               'timeBoundTitle', 'timeBoundDescription']
};


export async function generateProductPlan(productIdea: string, brandVoice: string, existingVariants: ProductVariant[], personaId?: UserPersonaId): Promise<ProductPlan> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are an e-commerce expert creating a detailed product plan. The brand voice is "${brandVoice}".${personaInstructions} Your entire response must be a single JSON object matching the provided schema, and nothing else.`;
    
    let prompt = `Create a comprehensive product plan for: "${productIdea}". Include a compelling product title, slug, a detailed and engaging product description that focuses on the benefits for its target audience, a base price in cents (USD), a base SKU, total stock, at least 3 relevant product variants, marketing tags, a list of primary materials, product dimensions (e.g., "15cm x 10cm x 5cm"), and weight in grams.`;
    if (existingVariants.length > 0) {
        prompt += `\n\nThe user has updated the variants. Please regenerate the plan based on these new variants, updating the total stock and average price accordingly: ${JSON.stringify(existingVariants)}`;
    }

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: productPlanSchema
    });

    const parsed = object as ProductPlan;
    if (!parsed) throw new Error("Failed to generate product plan");
    
    // Ensure calculated fields are correct
    if(parsed.variants && parsed.variants.length > 0) {
        parsed.stock = parsed.variants.reduce((acc, v) => acc + v.stock, 0);
        parsed.priceCents = Math.round(parsed.variants.reduce((acc, v) => acc + v.priceCents, 0) / parsed.variants.length);
    }
    
    return parsed;
}

// Interface for the flattened schema response
interface FlatSmartGoalsResponse {
    specificTitle: string;
    specificDescription: string;
    measurableTitle: string;
    measurableDescription: string;
    achievableTitle: string;
    achievableDescription: string;
    relevantTitle: string;
    relevantDescription: string;
    timeBoundTitle: string;
    timeBoundDescription: string;
}

export async function generateSmartGoals(productIdea: string, brandVoice: string, personaId?: UserPersonaId): Promise<SMARTGoals> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a business strategist creating S.M.A.R.T. goals for a new e-commerce venture. The brand voice is "${brandVoice}".${personaInstructions} Generate goals with a clear title and detailed description for each category.`;
    const prompt = `Generate S.M.A.R.T. goals for a new e-commerce business selling "${productIdea}". The goals should cover the first 6 months of operation. Focus on launch, initial sales, and brand awareness. Provide a concise title and detailed description for each: Specific, Measurable, Achievable, Relevant, and Time-Bound.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: smartGoalsSchema
    });
    
    const flat = object as FlatSmartGoalsResponse;
    if (!flat || !flat.specificTitle) throw new Error("Failed to generate SMART goals");
    
    // Transform flat response to nested SMARTGoals interface
    const result: SMARTGoals = {
        specific: { title: flat.specificTitle, description: flat.specificDescription },
        measurable: { title: flat.measurableTitle, description: flat.measurableDescription },
        achievable: { title: flat.achievableTitle, description: flat.achievableDescription },
        relevant: { title: flat.relevantTitle, description: flat.relevantDescription },
        timeBound: { title: flat.timeBoundTitle, description: flat.timeBoundDescription }
    };
    
    return result;
}


export async function regeneratePlanSection(productIdea: string, currentPlan: ProductPlan, section: RegenerateableSection, brandVoice: string): Promise<Partial<ProductPlan>> {
    const systemInstruction = `You are an e-commerce copywriter. The brand voice is "${brandVoice}". Your response must be a JSON object containing only the regenerated section, and nothing else.`;
    
    let prompt = `For the product "${productIdea}", regenerate the "${section}" section. Current plan for context: ${JSON.stringify(currentPlan)}`;
    let responseSchema: any = {};

    switch(section) {
        case 'description':
            prompt = `For the product "${productIdea}", regenerate the "description" section. Make the new description more engaging and benefit-oriented for the target audience. Current description for context: "${currentPlan.description}"`;
            responseSchema = { type: 'object', properties: { description: { type: 'string' }}};
            break;
        case 'variants':
            responseSchema = { 
                type: 'object', 
                properties: { 
                    variants: { 
                        type: 'array', 
                        items: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                sku: { type: 'string' },
                                priceCents: { type: 'number' },
                                stock: { type: 'number' },
                            }
                        }
                    }
                }
            };
            break;
        case 'tags':
            responseSchema = { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' }}}};
            break;
        case 'materials':
            responseSchema = { type: 'object', properties: { materials: { type: 'array', items: { type: 'string' }}}};
            break;
    }

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: responseSchema
    });

    const parsed = object as Partial<ProductPlan>;
    if (!parsed) throw new Error(`Failed to regenerate ${section}`);
    return parsed;
}

export async function generateLogo(productTitle: string, style: string, color: string): Promise<string> {
    const prompt = `A ${style} logo for a product called "${productTitle}". The logo should be simple, clean, and memorable. ${color !== 'Default' ? `Use a ${color} color palette.` : ''} The logo must be on a white background.`;
    
    const { data } = await blink.ai.generateImage({
        prompt,
        model: 'fal-ai/nano-banana-pro',
        n: 1,
        size: '1024x1024',
    });

    return data[0].url;
}

export async function generateBrandIdentity(plan: ProductPlan, brandVoice: string, personaId?: UserPersonaId): Promise<BrandIdentityKit> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a brand strategist creating a brand identity kit. The brand voice is "${brandVoice}".${personaInstructions} Your response must be a single JSON object.`;
    const prompt = `Create a brand identity kit for the product: "${plan.productTitle}". Description: "${plan.description}". Generate a color palette (primary, secondary, accent hex codes), typography pairing (heading and body font names from Google Fonts), and a concise mission statement.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                colorPalette: { 
                    type: 'object', 
                    properties: { 
                        primary: { type: 'string' }, 
                        secondary: { type: 'string' }, 
                        accent: { type: 'string' }
                    }
                },
                typography: { 
                    type: 'object', 
                    properties: { 
                        headingFont: { type: 'string' }, 
                        bodyFont: { type: 'string' }
                    }
                },
                missionStatement: { type: 'string' },
            }
        }
    });
    
    const parsed = object as BrandIdentityKit;
    if (!parsed) throw new Error("Failed to generate brand identity");
    return parsed;
}

export async function generateCompetitiveAnalysis(productIdea: string, brandVoice: string, personaId?: UserPersonaId): Promise<CompetitiveAnalysis> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a market research analyst with a ${brandVoice} tone.${personaInstructions} Your response must be a JSON object.`;
    const prompt = `Conduct a competitive analysis for a new e-commerce product: "${productIdea}". Provide an opportunity score (1-10), a market summary, details on 3 main competitors (name, price range, strengths, weaknesses), and 3-4 key differentiation strategies.`;
    
    const { text, sources } = await blink.ai.generateText({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        search: true
    });

    const parsed = parseJson<CompetitiveAnalysis>(text);
    if (!parsed) throw new Error("Failed to generate competitive analysis");

    if (sources && sources.length > 0) {
        parsed.sources = sources.map((source: any) => ({ 
            uri: source.url || source.uri, 
            title: source.title || source.name 
        })) as GroundingSource[];
    }
    
    return parsed;
}

export async function generateSWOTAnalysis(productIdea: string, brandVoice: string, personaId?: UserPersonaId): Promise<SWOTAnalysis> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a business consultant with a ${brandVoice} tone.${personaInstructions} Your response must be a JSON object.`;
    const prompt = `Create a SWOT analysis for a new e-commerce product: "${productIdea}". Identify 3-4 key points for each category: Strengths, Weaknesses, Opportunities, and Threats.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                strengths: { type: 'array', items: { type: 'string' }},
                weaknesses: { type: 'array', items: { type: 'string' }},
                opportunities: { type: 'array', items: { type: 'string' }},
                threats: { type: 'array', items: { type: 'string' }},
            }
        }
    });

    const parsed = object as SWOTAnalysis;
    if (!parsed) throw new Error("Failed to generate SWOT analysis");
    return parsed;
}

export async function generateCustomerPersona(productIdea: string, targetAudience: string, brandVoice: string, personaId?: UserPersonaId): Promise<CustomerPersona> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a marketing expert with a ${brandVoice} tone, specializing in creating customer personas.${personaInstructions} Your response must be a JSON object.`;
    const prompt = `Create a detailed customer persona for the target audience of "${productIdea}". The target audience is described as: "${targetAudience}". Include a name, age, occupation, a direct quote, background story, demographics, motivations, goals, pain points, and a visual prompt for an avatar image.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                name: { type: 'string' },
                age: { type: 'number' },
                occupation: { type: 'string' },
                quote: { type: 'string' },
                background: { type: 'string' },
                demographics: { type: 'array', items: { type: 'string' }},
                motivations: { type: 'array', items: { type: 'string' }},
                goals: { type: 'array', items: { type: 'string' }},
                painPoints: { type: 'array', items: { type: 'string' }},
                avatarPrompt: { type: 'string' },
            }
        }
    });

    const parsed = object as CustomerPersona;
    if (!parsed) throw new Error("Failed to generate customer persona");
    return parsed;
}

export async function generatePersonaAvatar(prompt: string): Promise<string> {
    const { data } = await blink.ai.generateImage({
        prompt: `${prompt}, realistic photo, headshot, plain background`,
        model: 'fal-ai/nano-banana-pro',
        n: 1,
        size: '1024x1024',
    });

    return data[0].url;
}

export async function generateMarketingPlan(plan: ProductPlan, brandVoice: string, customerPersona: CustomerPersona, personaId?: UserPersonaId): Promise<MarketingKickstart> {
    const personaInstructions = getPersonaInstructions(personaId);
    const systemInstruction = `You are a digital marketing specialist with a ${brandVoice} tone.${personaInstructions} Your response must be a JSON object.`;
    const prompt = `Create a marketing kickstart plan for "${plan.productTitle}".
Description: "${plan.description}".
The target customer persona is:
- Name: ${customerPersona.name}, Age: ${customerPersona.age}, Occupation: ${customerPersona.occupation}
- Motivations: ${customerPersona.motivations.join(', ')}
- Goals: ${customerPersona.goals.join(', ')}
- Pain Points: ${customerPersona.painPoints.join(', ')}

Generate social media posts for platforms like Instagram, Facebook, and X (formerly Twitter). For each platform, provide 3 distinct post text variations. Each post should also include relevant hashtags and a creative visual prompt.
Also, generate ad copy for Google Ads. Provide 3 distinct ad variations. Each ad variation must have 3 headlines and 2 descriptions. Include detailed audience targeting suggestions (demographics, interests, keywords) based on the customer persona.
Finally, create a product launch email.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                socialMediaPosts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            platform: { type: 'string' },
                            postTextVariations: { type: 'array', items: { type: 'string' } },
                            hashtags: { type: 'array', items: { type: 'string' }},
                            visualPrompt: { type: 'string' },
                        },
                    }
                },
                adCopy: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            platform: { type: 'string' },
                            variations: { 
                                type: 'array', 
                                items: {
                                    type: 'object',
                                    properties: {
                                        headlines: { type: 'array', items: { type: 'string' } },
                                        descriptions: { type: 'array', items: { type: 'string' } },
                                    }
                                }
                            },
                            audienceTargeting: {
                                type: 'object',
                                properties: {
                                    demographics: { type: 'array', items: { type: 'string' } },
                                    interests: { type: 'array', items: { type: 'string' } },
                                    keywords: { type: 'array', items: { type: 'string' } },
                                },
                            }
                        },
                    }
                },
                launchEmail: {
                    type: 'object',
                    properties: {
                        subject: { type: 'string' },
                        body: { type: 'string' },
                    },
                }
            },
        }
    });

    const parsed = object as MarketingKickstart;
    if (!parsed) throw new Error("Failed to generate marketing plan");
    return parsed;
}

export async function regenerateLaunchEmail(plan: ProductPlan, brandVoice: string): Promise<LaunchEmail> {
    const systemInstruction = `You are an expert email marketer with a ${brandVoice} tone. Your response must be a single JSON object with 'subject' and 'body' keys.`;
    const prompt = `Compose a new, engaging launch email for the product "${plan.productTitle}".
    Product Description for context: "${plan.description}".
    The email must clearly state the product's key benefits and create excitement for the launch.
    Crucially, invent a compelling and specific launch day offer (e.g., a 20% discount code like LAUNCH20, free shipping for the first 24 hours, or a small bonus gift for the first 100 orders).
    Generate a catchy, high-conversion subject line and a full email body.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                subject: { type: 'string' },
                body: { type: 'string' },
            },
            required: ['subject', 'body']
        }
    });

    const parsed = object as LaunchEmail;
    if (!parsed) throw new Error("Failed to generate launch email");
    return parsed;
}


export async function generateFinancialProjections(plan: ProductPlan, scenario: FinancialScenario): Promise<FinancialProjections> {
    const systemInstruction = `You are a financial analyst for e-commerce startups. Provide a JSON response based on the scenario.`;
    const prompt = `Generate ${scenario} financial projections for "${plan.productTitle}" which sells for ${plan.priceCents / 100} USD. 
- Estimate the cost of goods sold (COGS) per unit.
- Estimate monthly sales in units.
- Suggest a suitable monthly marketing budget.
- Provide at least two common shipping options (e.g., 'Standard Shipping', 'Express Shipping') with their estimated costs per unit and delivery times.
- Include a standard transaction fee percentage (e.g., 2.9 for credit cards).
- Estimate any other typical monthly fixed costs (like platform fees).
Provide all monetary values in cents.`;

     const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                costOfGoodsSoldCents: { type: 'number' },
                estimatedMonthlySales: { type: 'number' },
                monthlyMarketingBudgetCents: { type: 'number' },
                shippingOptions: { 
                    type: 'array', 
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            costCents: { type: 'number' },
                            deliveryTime: { type: 'string' },
                        }
                    }
                },
                transactionFeePercent: { type: 'number' },
                monthlyFixedCostsCents: { type: 'number' },
            }
        }
    });

    const parsed = object as Omit<FinancialProjections, 'sellingPriceCents' | 'scenario'>;
    if (!parsed) throw new Error("Failed to generate financial projections");

    return {
        ...parsed,
        scenario,
        sellingPriceCents: plan.priceCents,
        shippingOptions: parsed.shippingOptions || [],
    };
}

export async function generateNextSteps(plan: ProductPlan, brandVoice: string): Promise<NextStepItem[]> {
    const systemInstruction = `You are a business mentor with a ${brandVoice} tone. Create a checklist as a JSON object with a "steps" array.`;
    const prompt = `You are creating a launch checklist for an e-commerce entrepreneur. It is absolutely critical that every step is specific, actionable, and directly helpful. Avoid generic advice. The steps MUST be tailored specifically to this product and its unique characteristics.

Product Information for Context:
- Product Name: "${plan.productTitle}"
- Description: "${plan.description}"
- Key Materials: "${plan.materials.join(', ')}"

Based on this product, generate a prioritized checklist of 10-12 highly specific and actionable next steps for a successful launch.

Instructions:
1.  **Prioritization is Key:** The final list must be ordered from highest to lowest priority.
2.  **Be Specific:** Each step must be a concrete task. Do not use vague verbs. Every step must start with a strong action verb (e.g., 'Research', 'File', 'Design', 'Purchase').
3.  **Examples of Good vs. Bad Steps:**
    - BAD: "Look into legal requirements."
    - GOOD: "File for a DBA ('Doing Business As') with your local county clerk's office."
    - BAD: "Source materials."
    - GOOD: "Request quotes from 3 potential suppliers for '${plan.materials[0] || 'your primary material'}' found on Alibaba or ThomasNet."
    - BAD: "Do marketing."
    - GOOD: "Draft 5 announcement posts for Instagram showcasing the product's unique features, and schedule them to go live on launch day."
4.  **Categorize and Prioritize Each Step:** For each step, you must assign:
    - A 'priority' ('High', 'Medium', 'Low').
    - A 'category' from this exact list: "Legal & Compliance", "Sourcing & Production", "Marketing & Sales", or "Launch Prep".

Generate the response as a JSON object with a "steps" array, ordered by priority.`;
    
    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                steps: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string' },
                            completed: { type: 'boolean' },
                            category: { type: 'string' },
                            priority: { type: 'string' },
                        },
                    }
                }
            }
        }
    });

    const parsed = object as { steps: NextStepItem[] };
    if (!parsed || !parsed.steps) throw new Error("Failed to generate next steps");
    return parsed.steps;
}

export async function scoutTrendingProducts(category: string): Promise<ProductScoutResult[]> {
    const systemInstruction = 'You are an Amazon market research expert. Your response must be a JSON object with a "products" array of product scout results.';
    const prompt = `Find 3 trending, high-potential products in the "${category}" category on Amazon. For each product, provide its name, a short description, a trend score (1-10), a brief sales forecast, 2 potential supplier ideas (e.g., Alibaba, ThomasNet) with notes, and an Amazon selling strategy (key services like FBA/FBM, shipping recommendations, and a compliance checklist).`;

    const { text, sources } = await blink.ai.generateText({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        search: true
    });

    const parsed = parseJson<{ products: ProductScoutResult[] } | ProductScoutResult[]>(text);
    if (!parsed) throw new Error("Failed to scout products");
    
    // Handle both formats: { products: [...] } or [...]
    return Array.isArray(parsed) ? parsed : (parsed.products || []);
}

export async function generateStorefrontMockup(plan: ProductPlan, logoUrl: string): Promise<string> {
    const prompt = `Generate a realistic e-commerce product page mockup for "${plan.productTitle}". The page should feature a prominent product photo area, the product title, price (${(plan.priceCents / 100).toFixed(2)} ${plan.currency}), an "Add to Cart" button, and a snippet of the product description. The design should be clean, modern, and professional.`;

    // For storefront mockup, we'll use image generation
    const { data } = await blink.ai.generateImage({
        prompt,
        model: 'fal-ai/nano-banana-pro',
        n: 1,
        size: '1024x1024',
    });

    return data[0].url;
}

export async function generateSeoStrategy(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<SeoStrategy> {
    const systemInstruction = `You are a world-class SEO strategist and content marketing expert with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create an advanced SEO and content strategy for the product "${plan.productTitle}", targeting the customer persona "${persona.name}".
    
    1.  **Keyword Analysis**: Generate a list of at least 10 relevant keywords. For each, provide an estimated monthly search volume (as a string range, e.g., "1k-10k"), competition level ('Low', 'Medium', 'High'), and relevance ('High', 'Medium', 'Low').
    2.  **Strategy Summary**: Write a brief, actionable summary of the overall SEO strategy.
    3.  **Content Angle Ideas**: Propose 3 distinct content angle ideas that target the most promising keywords. Provide a compelling title and a short description for each.
    4.  **Content Calendar**: Create a 4-week content calendar with a theme for each week and 2-3 post ideas per week for relevant platforms (e.g., Blog, Instagram, Facebook).`;
    
    const { text, sources } = await blink.ai.generateText({
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
        ],
        search: true
    });
    
    const parsed = parseJson<SeoStrategy>(text);
    if (!parsed) throw new Error("Failed to generate SEO strategy");

    if (sources && sources.length > 0) {
        parsed.sources = sources.map((source: any) => ({ 
            uri: source.url || source.uri, 
            title: source.title || source.name 
        })) as GroundingSource[];
    }

    return parsed;
}

export async function generateAdCampaigns(plan: ProductPlan, persona: CustomerPersona, marketingPlan: MarketingKickstart): Promise<AdCampaign[]> {
    const systemInstruction = `You are a digital advertising strategist. Your response must be a JSON object with a "campaigns" array.`;
    const prompt = `Based on the product "${plan.productTitle}", the customer persona "${persona.name}", and the initial ad copy, create a structured ad campaign plan. Generate one campaign for Facebook Ads and one for Google Ads.
    For each campaign:
    - Define a clear objective (e.g., 'Brand Awareness', 'Conversions').
    - Create two distinct ad sets with different targeting approaches based on the persona.
    - For each ad set, provide a targeting summary, a suggested daily budget in cents (USD), and 2-3 creative notes that build on the existing ad copy.
    Initial Ad Copy for context: ${JSON.stringify(marketingPlan.adCopy)}`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                campaigns: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            platform: { type: 'string' },
                            campaignName: { type: 'string' },
                            objective: { type: 'string' },
                            adSets: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        adSetName: { type: 'string' },
                                        targetingSummary: { type: 'string' },
                                        dailyBudgetCents: { type: 'number' },
                                        adCreativeNotes: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as { campaigns: AdCampaign[] };
    if (!parsed || !parsed.campaigns) throw new Error("Failed to generate ad campaigns");
    return parsed.campaigns;
}

export async function generateInfluencerPlan(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<InfluencerMarketingPlan> {
    const systemInstruction = `You are an influencer marketing expert with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create an influencer marketing plan for "${plan.productTitle}" targeting the persona "${persona.name}".
    - Suggest which influencer tiers to target (e.g., Nano, Micro).
    - Write a friendly, concise outreach email template.
    - Propose 2 creative campaign ideas (e.g., unboxing, 'day in the life').
    - List 3-4 key KPIs to track for success.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                influencerTiers: { type: 'array', items: { type: 'string' } },
                outreachTemplate: { type: 'string' },
                campaignIdeas: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            ideaName: { type: 'string' },
                            description: { type: 'string' },
                        },
                    },
                },
                kpiToTrack: { type: 'array', items: { type: 'string' } },
            },
        },
    });

    const parsed = object as InfluencerMarketingPlan;
    if (!parsed) throw new Error("Failed to generate influencer plan");
    return parsed;
}

export async function generateCustomerSupportPlaybook(plan: ProductPlan, brandVoice: string): Promise<CustomerSupportPlaybook> {
    const systemInstruction = `You are a customer experience manager with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a customer support playbook for the product "${plan.productTitle}".
    - Define the support tone of voice.
    - Write a customer-friendly return policy summary (3-4 sentences).
    - Generate 4 common FAQs with answers.
    - Provide sample responses for two scenarios: 'Order has not arrived' and 'Customer is unhappy with the product'.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                faq: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            question: { type: 'string' },
                            answer: { type: 'string' },
                        },
                    },
                },
                returnPolicySummary: { type: 'string' },
                toneOfVoice: { type: 'string' },
                sampleResponses: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            scenario: { type: 'string' },
                            response: { type: 'string' },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as CustomerSupportPlaybook;
    if (!parsed) throw new Error("Failed to generate customer support playbook");
    return parsed;
}

export async function generatePackagingExperience(plan: ProductPlan, brandVoice: string): Promise<PackagingExperience> {
    const systemInstruction = `You are a branding and packaging designer with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Design a memorable packaging and unboxing experience for "${plan.productTitle}".
    - Suggest a creative theme.
    - Describe the shipping box (material, color, branding).
    - List 3-4 key elements to include inside the box (e.g., branded tissue paper, a thank you card with a dad joke, a sticker).
    - Add a brief note on potential sustainability improvements.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                theme: { type: 'string' },
                boxDescription: { type: 'string' },
                insideBoxElements: { type: 'array', items: { type: 'string' } },
                sustainabilityNotes: { type: 'string' },
            },
        },
    });

    const parsed = object as PackagingExperience;
    if (!parsed) throw new Error("Failed to generate packaging experience plan");
    return parsed;
}

export async function generateLegalChecklist(plan: ProductPlan): Promise<LegalChecklist> {
    const systemInstruction = `You are a helpful AI assistant providing a general information checklist for e-commerce. Your response must be a single JSON object.`;
    const prompt = `For a new e-commerce business selling a product like "${plan.productTitle}", generate a general legal and compliance checklist.
    - Include a clear disclaimer that this is for informational purposes only and not legal advice.
    - List 5-7 key checklist items (e.g., Business Registration, Privacy Policy, Terms of Service, Cookie Consent).
    - For each item, provide a brief description of what it is.
    - Mark items that are generally considered critical as true.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                disclaimer: { type: 'string' },
                checklistItems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            item: { type: 'string' },
                            description: { type: 'string' },
                            isCritical: { type: 'boolean' },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as LegalChecklist;
    if (!parsed) throw new Error("Failed to generate legal checklist");
    return parsed;
}

export async function generateSupplierSuggestions(plan: ProductPlan, persona: CustomerPersona): Promise<SupplierSuggestion[]> {
    const systemInstruction = `You are a sourcing and supply chain expert for e-commerce businesses. Your response must be a JSON object with a "suppliers" array.`;
    const prompt = `You are a world-class sourcing expert. Your goal is to provide a strategically diverse set of supplier options for a new e-commerce product.

Based on the following product, suggest 3 **distinct and strategically different types** of potential suppliers. This should give the entrepreneur a diverse range of sourcing options to consider, for example: a bulk overseas manufacturer, a local high-quality artisan, and a specialist in sustainable/niche materials.

Product Information:
- Product Title: "${plan.productTitle}"
- Primary Materials: "${plan.materials.join(', ')}"
- Target Audience Background: "${persona.background}"

For each of the 3 suggested suppliers, you MUST provide all of the following fields:
    - A plausible supplier name.
    - A general location (e.g., 'Vietnam', 'USA - West Coast').
    - A contact website (a link to a major sourcing platform or a manufacturer's domain).
    - Their specialty.
    - An estimated Minimum Order Quantity (MOQ) as an integer.
    - A plausible contact email (e.g., sales@suppliername.com). This field is mandatory.
    - A plausible contact phone number in a standard format. This field is mandatory.
    - Brief notes on why they represent a distinct strategic option for this product.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                suppliers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            supplierName: { type: 'string' },
                            location: { type: 'string' },
                            contactWebsite: { type: 'string' },
                            specialty: { type: 'string' },
                            notes: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            moq: { type: 'number' },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as { suppliers: SupplierSuggestion[] };
    if (!parsed || !parsed.suppliers) throw new Error("Failed to generate supplier suggestions");
    return parsed.suppliers;
}

// NEW FEATURES
export async function generateSocialMediaCalendar(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<SocialMediaCalendar> {
    const systemInstruction = `You are a social media manager with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a 4-week social media calendar for the launch of "${plan.productTitle}". Target the persona "${persona.name}".
    For each week, define a theme (e.g., "Teaser Week", "Launch Week", "User-Generated Content").
    For each week, provide 3-4 daily post ideas, specifying the platform (Instagram, Facebook, X), a creative idea, and a visual prompt.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                weeks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            weekNumber: { type: 'number' },
                            theme: { type: 'string' },
                            posts: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        day: { type: 'string' },
                                        platform: { type: 'string' },
                                        idea: { type: 'string' },
                                        visualPrompt: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as SocialMediaCalendar;
    if (!parsed) throw new Error("Failed to generate social media calendar");
    return parsed;
}

export async function generatePhotographyPlan(plan: ProductPlan, brandVoice: string): Promise<ProductPhotographyPlan> {
    const systemInstruction = `You are a professional product photographer and art director with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a product photography shot list for "${plan.productTitle}". Provide 5-7 distinct shots covering 'Studio', 'Lifestyle', and 'Detail' types. For each shot, give a clear description and creative direction.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                shotList: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string' },
                            description: { type: 'string' },
                            creativeDirection: { type: 'string' },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as ProductPhotographyPlan;
    if (!parsed) throw new Error("Failed to generate photography plan");
    return parsed;
}

export async function generateABTestingIdeas(plan: ProductPlan, persona: CustomerPersona): Promise<ABTestPlan> {
    const systemInstruction = `You are a conversion rate optimization (CRO) expert. Your response must be a single JSON object.`;
    const prompt = `Generate 3 high-impact A/B testing ideas for the product page of "${plan.productTitle}", targeting the persona "${persona.name}". For each test, specify the element to test, a clear hypothesis, and two variations (A and B).`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                tests: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            element: { type: 'string' },
                            hypothesis: { type: 'string' },
                            variations: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as ABTestPlan;
    if (!parsed) throw new Error("Failed to generate A/B testing ideas");
    return parsed;
}

export async function generateEmailFunnel(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<EmailFunnel> {
    const systemInstruction = `You are an expert email marketer with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create an automated email marketing funnel for "${plan.productTitle}" targeting "${persona.name}". The funnel should include:
1. A Welcome Email for new subscribers.
2. An Abandoned Cart recovery email.
3. A Post-Purchase Follow-up email.
For each email, provide a catchy subject line, the full email body, and the optimal timing for it to be sent.`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                emails: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            subject: { type: 'string' },
                            body: { type: 'string' },
                            timing: { type: 'string' },
                        },
                    },
                },
            },
        },
    });

    const parsed = object as EmailFunnel;
    if (!parsed) throw new Error("Failed to generate email funnel");
    return parsed;
}

export async function generatePressRelease(plan: ProductPlan, brandVoice: string): Promise<PressRelease> {
    const systemInstruction = `You are a public relations professional with a ${brandVoice} tone, but ensure the final output is professional and adheres to standard press release format. Your response must be a single JSON object.`;
    const prompt = `Write a press release for the launch of a new product: "${plan.productTitle}".
Product description for context: "${plan.description}".
The press release needs to include:
- A compelling headline.
- An informative subheadline.
- A dateline (use placeholders for city, state, date).
- A concise introduction (paragraph 1).
- A detailed body (2-3 paragraphs) highlighting the product's features, benefits, and target audience.
- A company boilerplate (a short "About Us" section).
- Contact information (use placeholders).`;

    const { object } = await blink.ai.generateObject({
        prompt: `${systemInstruction}\n\n${prompt}`,
        schema: {
            type: 'object' as const,
            properties: {
                headline: { type: 'string' },
                subheadline: { type: 'string' },
                dateline: { type: 'string' },
                introduction: { type: 'string' },
                body: { type: 'string' },
                boilerplate: { type: 'string' },
                contactInfo: { type: 'string' },
            },
        },
    });

    const parsed = object as PressRelease;
    if (!parsed) throw new Error("Failed to generate press release");
    return parsed;
}
