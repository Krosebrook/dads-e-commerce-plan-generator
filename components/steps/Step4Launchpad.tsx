import React, { useState, useEffect, useCallback } from 'react';
import { trackPhaseCompletion } from '../../src/lib/blink';
import { getPersonaById } from '@/src/lib/personas';
// FIX: Correctly import types from the central types file.
import { ProductPlan, MarketingKickstart, FinancialProjections, FinancialScenario, NextStepItem, ChatMessage, CompetitiveAnalysis, CustomerPersona, SeoStrategy, ShopifyIntegration, SupplierQuote, AdCampaign, InfluencerMarketingPlan, CustomerSupportPlaybook, PackagingExperience, LegalChecklist, SupplierSuggestion, SocialMediaCalendar, ProductPhotographyPlan, ABTestPlan, EmailFunnel, PressRelease, UserPersonaId } from '../../types';
// FIX: Correctly import services from the geminiService file.
import { generateMarketingPlan, generateFinancialProjections, generateNextSteps, generateStorefrontMockup, generateAdCampaigns, generateInfluencerPlan, generatePackagingExperience, generateLegalChecklist } from '../../services/geminiService';

import MarketingKickstartCard from '../MarketingKickstartCard';
import FinancialProjectionsCard from '../FinancialProjectionsCard';
import NextStepsCard from '../NextStepsCard';
import ChatCard from '../ChatCard';
import ExportControls from '../ExportControls';
import StorefrontMockupCard from '../StorefrontMockupCard';
import SeoStrategyCard from '../SeoStrategyCard';
import ShopifyIntegrationCard from '../ShopifyIntegrationCard';
import SupplierTrackerCard from '../SupplierTrackerCard';
import AdCampaignGeneratorCard from '../AdCampaignGeneratorCard';
import InfluencerMarketingCard from '../InfluencerMarketingCard';
import CustomerSupportCard from '../CustomerSupportCard';
import PackagingExperienceCard from '../PackagingExperienceCard';
import LegalChecklistCard from '../LegalChecklistCard';
import SocialMediaCalendarCard from '../SocialMediaCalendarCard';
import ProductPhotographyCard from '../ProductPhotographyCard';
import ABTestingCard from '../ABTestingCard';
import EmailFunnelCard from '../EmailFunnelCard';
import PressReleaseCard from '../PressReleaseCard';


import { Button } from '../ui/Button';

interface Step4LaunchpadProps {
    productPlan: ProductPlan;
    brandVoice: string;
    selectedPersona: UserPersonaId | undefined;
    competitiveAnalysis: CompetitiveAnalysis | null;
    customerPersona: CustomerPersona | null;
    logoImageUrl: string | null;
    
    marketingPlan: MarketingKickstart | null;
    setMarketingPlan: React.Dispatch<React.SetStateAction<MarketingKickstart | null>>;
    
    financials: FinancialProjections | null;
    setFinancials: React.Dispatch<React.SetStateAction<FinancialProjections | null>>;

    nextSteps: NextStepItem[];
    setNextSteps: React.Dispatch<React.SetStateAction<NextStepItem[]>>;

    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

    storefrontMockupUrl: string | null;
    setStorefrontMockupUrl: React.Dispatch<React.SetStateAction<string | null>>;

    seoStrategy: SeoStrategy | null;
    setSeoStrategy: React.Dispatch<React.SetStateAction<SeoStrategy | null>>;
    
    shopifyIntegration: ShopifyIntegration | null;
    setShopifyIntegration: React.Dispatch<React.SetStateAction<ShopifyIntegration | null>>;

    supplierQuotes: SupplierQuote[];
    setSupplierQuotes: React.Dispatch<React.SetStateAction<SupplierQuote[]>>;

    supplierSuggestions: SupplierSuggestion[] | null;
    setSupplierSuggestions: React.Dispatch<React.SetStateAction<SupplierSuggestion[] | null>>;

    adCampaigns: AdCampaign[] | null;
    setAdCampaigns: React.Dispatch<React.SetStateAction<AdCampaign[] | null>>;

    influencerMarketingPlan: InfluencerMarketingPlan | null;
    setInfluencerMarketingPlan: React.Dispatch<React.SetStateAction<InfluencerMarketingPlan | null>>;

    customerSupportPlaybook: CustomerSupportPlaybook | null;
    setCustomerSupportPlaybook: React.Dispatch<React.SetStateAction<CustomerSupportPlaybook | null>>;

    packagingExperience: PackagingExperience | null;
    setPackagingExperience: React.Dispatch<React.SetStateAction<PackagingExperience | null>>;

    legalChecklist: LegalChecklist | null;
    setLegalChecklist: React.Dispatch<React.SetStateAction<LegalChecklist | null>>;

    socialMediaCalendar: SocialMediaCalendar | null;
    setSocialMediaCalendar: React.Dispatch<React.SetStateAction<SocialMediaCalendar | null>>;

    photographyPlan: ProductPhotographyPlan | null;
    setPhotographyPlan: React.Dispatch<React.SetStateAction<ProductPhotographyPlan | null>>;

    abTestPlan: ABTestPlan | null;
    setAbTestPlan: React.Dispatch<React.SetStateAction<ABTestPlan | null>>;

    emailFunnel: EmailFunnel | null;
    setEmailFunnel: React.Dispatch<React.SetStateAction<EmailFunnel | null>>;

    pressRelease: PressRelease | null;
    setPressRelease: React.Dispatch<React.SetStateAction<PressRelease | null>>;

    onPlanModified: () => void;
    onBack: () => void;
}

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex justify-center items-center flex-col gap-4 p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 R-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
    </div>
);


const Step4Launchpad: React.FC<Step4LaunchpadProps> = (props) => {
    const {
        productPlan,
        brandVoice,
        selectedPersona,
        competitiveAnalysis,
        customerPersona,
        logoImageUrl,
        marketingPlan, setMarketingPlan,
        financials, setFinancials,
        nextSteps, setNextSteps,
        chatHistory, setChatHistory,
        storefrontMockupUrl, setStorefrontMockupUrl,
        seoStrategy, setSeoStrategy,
        shopifyIntegration, setShopifyIntegration,
        supplierQuotes, setSupplierQuotes,
        supplierSuggestions, setSupplierSuggestions,
        adCampaigns, setAdCampaigns,
        influencerMarketingPlan, setInfluencerMarketingPlan,
        customerSupportPlaybook, setCustomerSupportPlaybook,
        packagingExperience, setPackagingExperience,
        legalChecklist, setLegalChecklist,
        socialMediaCalendar, setSocialMediaCalendar,
        photographyPlan, setPhotographyPlan,
        abTestPlan, setAbTestPlan,
        emailFunnel, setEmailFunnel,
        pressRelease, setPressRelease,
        onPlanModified, onBack
    } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
    const [isRegeneratingFinancials, setIsRegeneratingFinancials] = useState(false);

    const isDataMissing = !marketingPlan || !financials || nextSteps.length === 0 || !adCampaigns || !influencerMarketingPlan || !packagingExperience || !legalChecklist;

    const isCardHighlighted = (cardName: string) => {
        if (!selectedPersona) return false;
        const persona = getPersonaById(selectedPersona);
        return persona?.workflow.includes(cardName);
    };

    useEffect(() => {
        const fetchLaunchpadData = async () => {
            if (productPlan && customerPersona && marketingPlan && isDataMissing) {
                setIsLoading(true);
                try {
                    const [
                        financial, 
                        steps,
                        campaigns,
                        influencerPlan,
                        packaging,
                        legal
                    ] = await Promise.all([
                        financials ? Promise.resolve(financials) : generateFinancialProjections(productPlan, 'Realistic'),
                        nextSteps.length > 0 ? Promise.resolve(nextSteps) : generateNextSteps(productPlan, brandVoice),
                        adCampaigns ? Promise.resolve(adCampaigns) : generateAdCampaigns(productPlan, customerPersona, marketingPlan),
                        influencerMarketingPlan ? Promise.resolve(influencerMarketingPlan) : generateInfluencerPlan(productPlan, customerPersona, brandVoice),
                        packagingExperience ? Promise.resolve(packagingExperience) : generatePackagingExperience(productPlan, brandVoice),
                        legalChecklist ? Promise.resolve(legalChecklist) : generateLegalChecklist(productPlan)
                    ]);
                    
                    setFinancials(financial);
                    setNextSteps(steps);
                    setAdCampaigns(campaigns);
                    setInfluencerMarketingPlan(influencerPlan);
                    setPackagingExperience(packaging);
                    setLegalChecklist(legal);
                    
                    // Track analytics for generated content
                    if (!financials) trackPhaseCompletion('financial_projections_generated', { scenario: 'Realistic' });
                    if (nextSteps.length === 0) trackPhaseCompletion('next_steps_generated');
                    if (!adCampaigns) trackPhaseCompletion('ad_campaigns_generated');
                    if (!influencerMarketingPlan) trackPhaseCompletion('influencer_plan_generated');
                    if (!packagingExperience) trackPhaseCompletion('packaging_experience_generated');
                    if (!legalChecklist) trackPhaseCompletion('legal_checklist_generated');

                    onPlanModified();
                } catch (error) {
                    console.error("Failed to generate launchpad data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const fetchInitialMarketingData = async () => {
            if (productPlan && customerPersona && !marketingPlan) {
                 setIsLoading(true);
                 try {
                     const marketing = await generateMarketingPlan(productPlan, brandVoice, customerPersona, selectedPersona);
                     setMarketingPlan(marketing);
                     onPlanModified();
                 } catch(e) {
                     console.error("Failed to generate marketing plan", e);
                 } finally {
                     setIsLoading(false);
                 }
            }
        }
        
        fetchInitialMarketingData();
        fetchLaunchpadData();
        
    }, [productPlan, customerPersona, marketingPlan, brandVoice, onPlanModified]);

    const handleGenerateMockup = useCallback(async () => {
        if (!productPlan || !logoImageUrl) return;
        setIsGeneratingMockup(true);
        try {
            const url = await generateStorefrontMockup(productPlan, logoImageUrl);
            setStorefrontMockupUrl(url);
            onPlanModified();
        } catch (error) {
            console.error("Failed to generate mockup:", error);
        } finally {
            setIsGeneratingMockup(false);
        }
    }, [productPlan, logoImageUrl, setStorefrontMockupUrl, onPlanModified]);
    
    const handleScenarioChange = useCallback(async (scenario: FinancialScenario) => {
        setIsRegeneratingFinancials(true);
        try {
            const newFinancials = await generateFinancialProjections(productPlan, scenario);
            setFinancials(newFinancials);
            trackPhaseCompletion('financial_scenario_changed', { scenario });
            onPlanModified();
        } catch (error) {
            console.error("Failed to regenerate financials:", error);
        } finally {
            setIsRegeneratingFinancials(false);
        }
    }, [productPlan, setFinancials, onPlanModified]);

    const handleToggleNextStep = (index: number) => {
        const newSteps = [...nextSteps];
        newSteps[index].completed = !newSteps[index].completed;
        setNextSteps(newSteps);
        onPlanModified();
    };

    const handleAddTask = (text: string, category: string, priority: 'High' | 'Medium' | 'Low') => {
        setNextSteps([...nextSteps, { text, completed: false, category, priority }]);
        onPlanModified();
    };

    const handleEditTask = (index: number, text: string) => {
        const newSteps = [...nextSteps];
        newSteps[index].text = text;
        setNextSteps(newSteps);
        onPlanModified();
    };

    const handleDeleteTask = (index: number) => {
        setNextSteps(nextSteps.filter((_, i) => i !== index));
        onPlanModified();
    };

    const handleSupplierQuotesChange = (newQuotes: SupplierQuote[]) => {
        setSupplierQuotes(newQuotes);
        onPlanModified();
    };
    
    const handleSupplierSuggestionsChange = (newSuggestions: SupplierSuggestion[]) => {
        setSupplierSuggestions(newSuggestions);
        onPlanModified();
    };


    if (isLoading || isDataMissing) {
        return <div className="w-full max-w-4xl space-y-8"><LoadingSpinner message="Building your advanced launchpad assets..." /></div>;
    }

    return (
        <div className="w-full max-w-4xl space-y-8">
            {marketingPlan && (
                <div className={isCardHighlighted('MarketingKickstartCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <MarketingKickstartCard
                        marketingPlan={marketingPlan}
                        productPlan={productPlan}
                        brandVoice={brandVoice}
                        onUpdate={(newPlan) => {
                            setMarketingPlan(newPlan);
                            onPlanModified();
                        }}
                    />
                </div>
            )}
            {financials && (
                <div className={isCardHighlighted('FinancialProjectionsCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <FinancialProjectionsCard financials={financials} onFinancialsChange={(f) => { setFinancials(f); onPlanModified(); }} currency={productPlan.currency} onScenarioChange={handleScenarioChange} isRegenerating={isRegeneratingFinancials} />
                </div>
            )}
            {customerPersona && (
                <div className={isCardHighlighted('SeoStrategyCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <SeoStrategyCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} seoStrategy={seoStrategy} setSeoStrategy={setSeoStrategy} onPlanModified={onPlanModified} />
                </div>
            )}
            {adCampaigns && (
                <div className={isCardHighlighted('AdCampaignGeneratorCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <AdCampaignGeneratorCard campaigns={adCampaigns} />
                </div>
            )}
            {influencerMarketingPlan && (
                <div className={isCardHighlighted('InfluencerMarketingCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <InfluencerMarketingCard plan={influencerMarketingPlan} />
                </div>
            )}
            <div className={isCardHighlighted('SocialMediaCalendarCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <SocialMediaCalendarCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} calendar={socialMediaCalendar} setCalendar={setSocialMediaCalendar} onPlanModified={onPlanModified} />
            </div>
            <div className={isCardHighlighted('EmailFunnelCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <EmailFunnelCard productPlan={productPlan} customerPersona={customerPersona} brandVoice={brandVoice} funnel={emailFunnel} setFunnel={setEmailFunnel} onPlanModified={onPlanModified} />
            </div>
            <div className={isCardHighlighted('ABTestingCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <ABTestingCard productPlan={productPlan} customerPersona={customerPersona} testPlan={abTestPlan} setTestPlan={setAbTestPlan} onPlanModified={onPlanModified} />
            </div>
            <div className={isCardHighlighted('ProductPhotographyCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <ProductPhotographyCard productPlan={productPlan} brandVoice={brandVoice} plan={photographyPlan} setPlan={setPhotographyPlan} onPlanModified={onPlanModified} />
            </div>
            <div className={isCardHighlighted('PressReleaseCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <PressReleaseCard productPlan={productPlan} brandVoice={brandVoice} release={pressRelease} setRelease={setPressRelease} onPlanModified={onPlanModified} />
            </div>
            <div className={isCardHighlighted('CustomerSupportCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <CustomerSupportCard 
                    productPlan={productPlan}
                    brandVoice={brandVoice}
                    playbook={customerSupportPlaybook}
                    setPlaybook={setCustomerSupportPlaybook}
                    onPlanModified={onPlanModified}
                />
            </div>
            {packagingExperience && (
                <div className={isCardHighlighted('PackagingExperienceCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <PackagingExperienceCard experience={packagingExperience} />
                </div>
            )}
            <div className={isCardHighlighted('StorefrontMockupCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <StorefrontMockupCard onGenerate={handleGenerateMockup} isGenerating={isGeneratingMockup} mockupUrl={storefrontMockupUrl} />
            </div>
            <div className={isCardHighlighted('SupplierTrackerCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <SupplierTrackerCard 
                    quotes={supplierQuotes} 
                    onQuotesChange={handleSupplierQuotesChange} 
                    currency={productPlan.currency}
                    productPlan={productPlan}
                    customerPersona={customerPersona}
                    suggestions={supplierSuggestions}
                    onSuggestionsChange={handleSupplierSuggestionsChange}
                />
            </div>
            <div className={isCardHighlighted('ShopifyIntegrationCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                <ShopifyIntegrationCard 
                    productPlan={productPlan} 
                    logoImageUrl={logoImageUrl}
                    storefrontMockupUrl={storefrontMockupUrl}
                    integrationConfig={shopifyIntegration}
                    setIntegrationConfig={setShopifyIntegration}
                    onPlanModified={onPlanModified}
                />
            </div>
            {legalChecklist && (
                <div className={isCardHighlighted('LegalChecklistCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <LegalChecklistCard checklist={legalChecklist} />
                </div>
            )}
            {nextSteps.length > 0 && (
                <div className={isCardHighlighted('NextStepsCard') ? 'ring-2 ring-indigo-500 rounded-xl p-1 shadow-lg' : ''}>
                    <NextStepsCard items={nextSteps} onToggle={handleToggleNextStep} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
                </div>
            )}
            <ChatCard productPlan={productPlan} brandVoice={brandVoice} history={chatHistory} onHistoryChange={(h) => { setChatHistory(h); onPlanModified(); }} />
            <ExportControls 
                productPlan={productPlan} 
                logoImageUrl={logoImageUrl} 
                analysis={competitiveAnalysis} 
                marketingPlan={marketingPlan} 
                financials={financials} 
                nextSteps={nextSteps}
                seoStrategy={seoStrategy}
                adCampaigns={adCampaigns}
                influencerMarketingPlan={influencerMarketingPlan}
                customerSupportPlaybook={customerSupportPlaybook}
                packagingExperience={packagingExperience}
                legalChecklist={legalChecklist}
                socialMediaCalendar={socialMediaCalendar}
                photographyPlan={photographyPlan}
                abTestPlan={abTestPlan}
                emailFunnel={emailFunnel}
                pressRelease={pressRelease}
            />
            
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                {/* No 'next' button, this is the final step */}
            </div>
        </div>
    );
};

export default Step4Launchpad;