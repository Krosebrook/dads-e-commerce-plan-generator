import { UserPersona } from '../../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'side_hustle_dad',
    name: "Side-Hustle Dad",
    description: "Balancing a 9-5 and family, looking for low-maintenance e-commerce opportunities.",
    objective: "Launch a profitable product with minimal daily management.",
    workflow: ['Step1Idea', 'ProductPlanCard', 'MarketingKickstartCard', 'Step4Launchpad'],
    recommendedVoice: "Witty & Humorous Dad"
  },
  {
    id: 'dropshipping_newbie',
    name: "Dropshipping Newbie",
    description: "Starting with zero inventory and looking to test product-market fit quickly.",
    objective: "Identify a viral product and set up a high-converting dropshipping store.",
    workflow: ['ProductScoutCard', 'Step2Blueprint', 'AdCampaignGeneratorCard', 'ShopifyIntegrationCard'],
    recommendedVoice: "Energetic Growth Hacker"
  },
  {
    id: 'artisan_maker',
    name: "The Artisan Maker",
    description: "Creating unique, handmade goods and needing a professional brand identity.",
    objective: "Transform a hobby into a premium, recognizable brand.",
    workflow: ['BrandIdentityCard', 'PackagingExperienceCard', 'ProductPhotographyCard', 'SeoStrategyCard'],
    recommendedVoice: "Elegant & Sophisticated"
  },
  {
    id: 'amazon_fba',
    name: "Amazon FBA Private Labeler",
    description: "Focused on sourcing products from manufacturers to sell under their own brand on Amazon.",
    objective: "Source a high-quality product with strong margins and low competition.",
    workflow: ['ProductScoutCard', 'SupplierTrackerCard', 'CompetitiveAnalysisCard', 'LegalChecklistCard'],
    recommendedVoice: "Professional & Precise"
  },
  {
    id: 'niche_passionate',
    name: "Niche Passionate",
    description: "Building a business around a specific hobby or community they love.",
    objective: "Create a community-driven brand that resonates with enthusiasts.",
    workflow: ['CustomerPersonaCard', 'SocialMediaCalendarCard', 'InfluencerMarketingCard', 'ContentStrategyCard'],
    recommendedVoice: "Authentic Community Leader"
  },
  {
    id: 'financial_planner',
    name: "The Financial Planner",
    description: "Data-driven entrepreneur focused on margins, ROI, and long-term sustainability.",
    objective: "Validate the business model with rigorous financial modeling.",
    workflow: ['FinancialProjectionsCard', 'SWOTAnalysisCard', 'SmartGoalsCard', 'PriceHistoryChart'],
    recommendedVoice: "Analytical & Strategic"
  },
  {
    id: 'marketing_strategist',
    name: "Marketing Strategist",
    description: "Focused on building complex funnels and high-ROI advertising campaigns.",
    objective: "Develop a robust, multi-channel marketing engine for the product.",
    workflow: ['CustomerPersonaCard', 'AdCampaignGeneratorCard', 'EmailFunnelCard', 'AnalyticsDashboard'],
    recommendedVoice: "Persuasive & Results-Oriented"
  },
  {
    id: 'solopreneur_mom',
    name: "Solopreneur Mom",
    description: "Building a scalable business that offers flexibility for family life.",
    objective: "Establish automated systems and clear customer support processes.",
    workflow: ['Step1Idea', 'CustomerSupportCard', 'PackagingExperienceCard', 'NextStepsCard'],
    recommendedVoice: "Empathetic & Organized"
  },
  {
    id: 'legacy_retiree',
    name: "Legacy Brand Retiree",
    description: "Starting a high-quality business to build a legacy or stay active in retirement.",
    objective: "Create a reputable brand with a strong mission and public presence.",
    workflow: ['BrandIdentityCard', 'PressReleaseCard', 'LegalChecklistCard', 'SeoStrategyCard'],
    recommendedVoice: "Trustworthy & Wise"
  },
  {
    id: 'serial_entrepreneur',
    name: "Serial Entrepreneur",
    description: "Rapidly prototyping and validating multiple e-commerce concepts.",
    objective: "Validate product viability with minimal viable assets as fast as possible.",
    workflow: ['ProductScoutCard', 'ABTestingCard', 'SmartGoalsCard', 'Step4Launchpad'],
    recommendedVoice: "Direct & Fast-Paced"
  },
  {
    id: 'supply_chain_manager',
    name: "Supply Chain Manager",
    description: "Focused on sourcing, logistics, and vendor management.",
    objective: "Optimize the supply chain for maximum reliability and profit.",
    workflow: ['Step2Blueprint', 'SupplierTrackerCard', 'FinancialProjectionsCard', 'LegalChecklistCard'],
    recommendedVoice: "Logical & Detailed"
  },
  {
    id: 'branding_visualist',
    name: "Branding Visualist",
    description: "Obsessed with the aesthetics and sensory experience of the brand.",
    objective: "Craft a visually stunning brand experience that wows customers.",
    workflow: ['BrandIdentityCard', 'ProductPhotographyCard', 'StorefrontMockupCard', 'PackagingExperienceCard'],
    recommendedVoice: "Creative & Inspired"
  },
  {
    id: 'tech_savvy_genz',
    name: "Tech-Savvy Gen Z",
    description: "Leveraging the latest tech trends, social media, and AI automation.",
    objective: "Achieve viral growth through social trends and seamless tech integration.",
    workflow: ['InfluencerMarketingCard', 'SocialMediaCalendarCard', 'ShopifyIntegrationCard', 'AdCampaignGeneratorCard'],
    recommendedVoice: "Trendy & Bold"
  },
  {
    id: 'brick_and_mortar',
    name: "Brick-and-Mortar Transformer",
    description: "Moving an existing physical retail business into the digital e-commerce space.",
    objective: "Successfully transition offline customers and inventory to an online store.",
    workflow: ['Step2Blueprint', 'SeoStrategyCard', 'ShopifyIntegrationCard', 'MarketingKickstartCard'],
    recommendedVoice: "Reliable & Growth-Focused"
  },
  {
    id: 'influencer_merch',
    name: "Influencer (Merch Brand)",
    description: "Using an existing audience to launch custom merchandise.",
    objective: "Monetize an existing community with products they truly want.",
    workflow: ['Step1Idea', 'BrandIdentityCard', 'SocialMediaCalendarCard', 'ShopifyIntegrationCard'],
    recommendedVoice: "Charismatic & Influential"
  }
];

export const getPersonaById = (id: string) => USER_PERSONAS.find(p => p.id === id);
