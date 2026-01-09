import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';
import Step1Idea from '../components/steps/Step1Idea';
import Step2Blueprint from '../components/steps/Step2Blueprint';
import Step3Market from '../components/steps/Step3Market';
import Step4Launchpad from '../components/steps/Step4Launchpad';
import MyVenturesDashboard from '../components/MyVenturesDashboard';
import ProductScout from '../components/ProductScout';
import AuthModal from '../components/AuthModal';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { generateProductPlan, generateSmartGoals } from '../services/geminiService';
import { trackPhaseCompletion } from './lib/blink';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

import {
    ProductPlan,
    MarketingKickstart,
    FinancialProjections,
    NextStepItem,
    CompetitiveAnalysis,
    SWOTAnalysis,
    CustomerPersona,
    BrandIdentityKit,
    SMARTGoals,
    ChatMessage,
    SavedVenture,
    AppData,
    SeoStrategy,
    ShopifyIntegration,
    SupplierQuote,
    SupplierSuggestion,
    PriceHistoryPoint,
    AdCampaign,
    InfluencerMarketingPlan,
    CustomerSupportPlaybook,
    PackagingExperience,
    LegalChecklist,
    SocialMediaCalendar,
    ProductPhotographyPlan,
    ABTestPlan,
    EmailFunnel,
    PressRelease,
} from '../types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [productIdea, setProductIdea] = useState('');
    const [brandVoice, setBrandVoice] = useState('Witty & Humorous Dad');
    const [isLoading, setIsLoading] = useState(false);
    const [inputError, setInputError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    // State for all data generated throughout the steps
    const [ventureId, setVentureId] = useState<string | null>(null);
    const [ventureName, setVentureName] = useState('');
    const [smartGoals, setSmartGoals] = useState<SMARTGoals | null>(null);
    const [plan, setPlan] = useState<ProductPlan | null>(null);
    const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
    const [brandKit, setBrandKit] = useState<BrandIdentityKit | null>(null);
    const [analysis, setAnalysis] = useState<CompetitiveAnalysis | null>(null);
    const [swotAnalysis, setSwotAnalysis] = useState<SWOTAnalysis | null>(null);
    const [customerPersona, setCustomerPersona] = useState<CustomerPersona | null>(null);
    const [personaAvatarUrl, setPersonaAvatarUrl] = useState<string | null>(null);
    const [marketingPlan, setMarketingPlan] = useState<MarketingKickstart | null>(null);
    const [financials, setFinancials] = useState<FinancialProjections | null>(null);
    const [nextSteps, setNextSteps] = useState<NextStepItem[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [storefrontMockupUrl, setStorefrontMockupUrl] = useState<string | null>(null);
    const [seoStrategy, setSeoStrategy] = useState<SeoStrategy | null>(null);
    const [shopifyIntegration, setShopifyIntegration] = useState<ShopifyIntegration | null>(null);
    const [supplierQuotes, setSupplierQuotes] = useState<SupplierQuote[]>([]);
    const [supplierSuggestions, setSupplierSuggestions] = useState<SupplierSuggestion[] | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
    const [adCampaigns, setAdCampaigns] = useState<AdCampaign[] | null>(null);
    const [influencerMarketingPlan, setInfluencerMarketingPlan] = useState<InfluencerMarketingPlan | null>(null);
    const [customerSupportPlaybook, setCustomerSupportPlaybook] = useState<CustomerSupportPlaybook | null>(null);
    const [packagingExperience, setPackagingExperience] = useState<PackagingExperience | null>(null);
    const [legalChecklist, setLegalChecklist] = useState<LegalChecklist | null>(null);
    const [socialMediaCalendar, setSocialMediaCalendar] = useState<SocialMediaCalendar | null>(null);
    const [photographyPlan, setPhotographyPlan] = useState<ProductPhotographyPlan | null>(null);
    const [abTestPlan, setAbTestPlan] = useState<ABTestPlan | null>(null);
    const [emailFunnel, setEmailFunnel] = useState<EmailFunnel | null>(null);
    const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);


    const [isPlanSaved, setIsPlanSaved] = useState(false);
    const [savedVentures, setSavedVentures] = useState<SavedVenture[]>([]);
    const [showVentures, setShowVentures] = useState(false);
    const [showScout, setShowScout] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Auth state listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load ventures and theme
    useEffect(() => {
        const loadData = async () => {
            // Load theme from localStorage (stays local)
            const savedTheme = localStorage.getItem('theme') as Theme || 'light';
            setTheme(savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Load ventures from database if user is authenticated
            if (user?.id) {
                try {
                    const { data, error } = await supabase
                        .from('ventures')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('last_modified', { ascending: false });

                    if (error) throw error;
                    
                    if (data) {
                        const ventures: SavedVenture[] = data.map((v: any) => ({
                            id: v.id,
                            name: v.name,
                            lastModified: v.last_modified,
                            data: v.data
                        }));
                        
                        setSavedVentures(ventures);

                        // Migrate localStorage data to DB (one-time)
                        await migrateLocalStorageData(user.id, ventures);
                    }
                } catch (err) {
                    console.error('Failed to load ventures from database:', err);
                    // Fallback to localStorage
                    const localVentures = localStorage.getItem('dad-ecommerce-ventures');
                    if (localVentures) {
                        setSavedVentures(JSON.parse(localVentures));
                    }
                }
            } else {
                // Not authenticated - use localStorage
                const ventures = localStorage.getItem('dad-ecommerce-ventures');
                if (ventures) {
                    setSavedVentures(JSON.parse(ventures));
                }
            }
        };

        if (!authLoading) {
            loadData();
        }
    }, [user, authLoading]);

    // Migration function to move localStorage data to DB
    const migrateLocalStorageData = async (userId: string, existingVentures: SavedVenture[]) => {
        const localData = localStorage.getItem('dad-ecommerce-ventures');
        if (!localData) return;

        try {
            const ventures: SavedVenture[] = JSON.parse(localData);
            
            // Only migrate if ventures exist and haven't been migrated yet (simplified check)
            if (ventures.length > 0) {
                console.log('Migrating', ventures.length, 'ventures from localStorage to database...');
                
                for (const venture of ventures) {
                    const alreadyExists = existingVentures.some(v => v.name === venture.name);
                    if (!alreadyExists) {
                        await supabase.from('ventures').insert({
                            user_id: userId,
                            name: venture.name,
                            data: venture.data,
                            last_modified: venture.lastModified
                        });
                    }
                }

                // Clear localStorage after successful migration
                localStorage.removeItem('dad-ecommerce-ventures');
                console.log('Migration complete!');
                
                // Refresh list
                const { data } = await supabase
                    .from('ventures')
                    .select('*')
                    .eq('user_id', userId)
                    .order('last_modified', { ascending: false });
                
                if (data) {
                    setSavedVentures(data.map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        lastModified: v.last_modified,
                        data: v.data
                    })));
                }
            }
        } catch (err) {
            console.error('Migration failed:', err);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newTheme;
        });
    };

    const resetState = () => {
        setCurrentStep(1);
        setProductIdea('');
        setBrandVoice('Witty & Humorous Dad');
        setInputError(null);
        setVentureId(null);
        setVentureName('');
        setSmartGoals(null);
        setPlan(null);
        setLogoImageUrl(null);
        setBrandKit(null);
        setAnalysis(null);
        setSwotAnalysis(null);
        setCustomerPersona(null);
        setPersonaAvatarUrl(null);
        setMarketingPlan(null);
        setFinancials(null);
        setNextSteps([]);
        setIsPlanSaved(false);
        setChatHistory([]);
        setStorefrontMockupUrl(null);
        setSeoStrategy(null);
        setShopifyIntegration(null);
        setSupplierQuotes([]);
        setSupplierSuggestions(null);
        setPriceHistory([]);
        setAdCampaigns(null);
        setInfluencerMarketingPlan(null);
        setCustomerSupportPlaybook(null);
        setPackagingExperience(null);
        setLegalChecklist(null);
        setSocialMediaCalendar(null);
        setPhotographyPlan(null);
        setAbTestPlan(null);
        setEmailFunnel(null);
        setPressRelease(null);
    };
    
    const onPlanModified = useCallback(() => {
        setIsPlanSaved(false);
    }, []);

    const handleProductIdeaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductIdea(e.target.value);
        if (e.target.value.trim().length > 0) {
            setInputError(null);
        }
    };
    
    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productIdea.trim()) {
            setInputError('Please enter a product idea.');
            return;
        }

        setIsLoading(true);
        setInputError(null);

        try {
            const goals = await generateSmartGoals(productIdea, brandVoice);
            setSmartGoals(goals);
            trackPhaseCompletion('smart_goals_generated', { productIdea, brandVoice });
        } catch (err) {
            console.error(err);
            setInputError('Failed to generate SMART goals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToBlueprint = async () => {
        setIsLoading(true);
        try {
            // Phase 2: Generate product plan only
            const newPlan = await generateProductPlan(productIdea, brandVoice, []);
            setPlan(newPlan);
            
            const newVentureId = `venture_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            setVentureId(newVentureId);
            setVentureName(newPlan.productTitle);
            
            trackPhaseCompletion('product_plan_generated', { productTitle: newPlan.productTitle });
            setCurrentStep(2);
        } catch (err) {
            console.error(err);
            setInputError('Failed to generate the blueprint. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (prompt: string) => {
        setProductIdea(prompt);
        setInputError(null);
    };

    const updatePlan = (updatedPlan: ProductPlan) => {
        setPlan(updatedPlan);
        onPlanModified();

        // Update price history
        const today = new Date().toISOString().split('T')[0];
        const newHistory = [...priceHistory.filter(p => p.date !== today), { date: today, priceCents: updatedPlan.priceCents }];
        // Keep last 30 days
        if (newHistory.length > 30) {
            newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            newHistory.length = 30;
        }
        setPriceHistory(newHistory);
    };
    
    const handleSavePlan = async () => {
        if (!ventureId || !plan) return;

        const currentAppData: AppData = {
            productIdea, brandVoice, smartGoals, plan, logoImageUrl, brandKit,
            analysis, swotAnalysis, customerPersona, personaAvatarUrl, marketingPlan,
            financials, nextSteps, chatHistory, storefrontMockupUrl, seoStrategy,
            shopifyIntegration, supplierQuotes, supplierSuggestions, priceHistory, adCampaigns: adCampaigns ?? undefined,
            influencerMarketingPlan: influencerMarketingPlan ?? undefined,
            customerSupportPlaybook: customerSupportPlaybook ?? undefined,
            packagingExperience: packagingExperience ?? undefined,
            legalChecklist: legalChecklist ?? undefined,
            socialMediaCalendar: socialMediaCalendar ?? undefined,
            photographyPlan: photographyPlan ?? undefined,
            abTestPlan: abTestPlan ?? undefined,
            emailFunnel: emailFunnel ?? undefined,
            pressRelease: pressRelease ?? undefined
        };

        const currentVentureName = ventureName || plan.productTitle;
        const now = new Date().toISOString();

        // Save to database if user is authenticated
        if (user?.id) {
            try {
                // Determine if it's an existing venture (UUID)
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ventureId);

                const { data, error } = await supabase
                    .from('ventures')
                    .upsert({
                        ...(isUuid ? { id: ventureId } : {}),
                        user_id: user.id,
                        name: currentVentureName,
                        data: currentAppData,
                        last_modified: now
                    })
                    .select()
                    .single();

                if (error) throw error;
                
                if (data) {
                    setVentureId(data.id);
                    // Refresh the list to show the new/updated venture
                    const { data: listData } = await supabase
                        .from('ventures')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('last_modified', { ascending: false });
                    
                    if (listData) {
                        setSavedVentures(listData.map((v: any) => ({
                            id: v.id,
                            name: v.name,
                            lastModified: v.last_modified,
                            data: v.data
                        })));
                    }
                }
            } catch (err) {
                console.error('Failed to save venture to database:', err);
            }
        } else {
            // Not authenticated - use localStorage
            const newVenture: SavedVenture = {
                id: ventureId,
                name: currentVentureName,
                lastModified: now,
                data: currentAppData
            };
            const updatedVentures = savedVentures.filter(v => v.id !== ventureId);
            const finalVentures = [...updatedVentures, newVenture];
            setSavedVentures(finalVentures);
            localStorage.setItem('dad-ecommerce-ventures', JSON.stringify(finalVentures));
        }

        trackPhaseCompletion(!savedVentures.find(v => v.id === ventureId) ? 'venture_created' : 'venture_updated', {
            venture_name: currentVentureName
        });

        setIsPlanSaved(true);
    };

    const loadVenture = (ventureIdToLoad: string) => {
        const ventureToLoad = savedVentures.find(v => v.id === ventureIdToLoad);
        if (ventureToLoad) {
            // Track analytics event
            trackPhaseCompletion('venture_loaded', {
                venture_name: ventureToLoad.name
            });
            
            const { data } = ventureToLoad;
            setVentureId(ventureToLoad.id);
            setVentureName(ventureToLoad.name);
            setProductIdea(data.productIdea);
            setBrandVoice(data.brandVoice);
            setSmartGoals(data.smartGoals);

            const loadedPlan = data.plan;
            if (loadedPlan) {
                loadedPlan.materials = loadedPlan.materials ?? [];
                loadedPlan.dimensions = loadedPlan.dimensions ?? '';
                loadedPlan.weightGrams = loadedPlan.weightGrams ?? 0;
            }
            setPlan(loadedPlan);
            
            setLogoImageUrl(data.logoImageUrl);
            setBrandKit(data.brandKit);
            setAnalysis(data.analysis);
            setSwotAnalysis(data.swotAnalysis);
            setCustomerPersona(data.customerPersona);
            setPersonaAvatarUrl(data.personaAvatarUrl);

            const marketingData = data.marketingPlan;
            if (marketingData) {
                if (marketingData.adCopy) {
                    marketingData.adCopy = marketingData.adCopy.map((ad: any) => {
                        const migratedAd = {
                            ...ad,
                            audienceTargeting: ad.audienceTargeting ?? { demographics: [], interests: [], keywords: [] },
                        };
            
                        if (migratedAd.headlines && migratedAd.descriptions && !migratedAd.variations) {
                            migratedAd.variations = [{
                                headlines: migratedAd.headlines,
                                descriptions: migratedAd.descriptions,
                            }];
                            delete migratedAd.headlines;
                            delete migratedAd.descriptions;
                        } else {
                             migratedAd.variations = migratedAd.variations || [];
                        }
                        return migratedAd;
                    });
                }
            
                if (marketingData.socialMediaPosts) {
                    marketingData.socialMediaPosts = marketingData.socialMediaPosts.map((post: any) => {
                         const migratedPost = { ...post };
                         if (migratedPost.postText && !migratedPost.postTextVariations) {
                             migratedPost.postTextVariations = [migratedPost.postText];
                             delete migratedPost.postText;
                         } else {
                             migratedPost.postTextVariations = migratedPost.postTextVariations || [];
                         }
                         return migratedPost;
                    });
                }
            }
            setMarketingPlan(marketingData);
            
            const financialData = data.financials;
            if (financialData) {
                // Migration logic for shipping options
                if (financialData.shippingCostPerUnitCents && (!financialData.shippingOptions || financialData.shippingOptions.length === 0)) {
                    financialData.shippingOptions = [{
                        name: 'Standard Shipping',
                        costCents: financialData.shippingCostPerUnitCents,
                        deliveryTime: '5-7 business days'
                    }];
                }
                // Ensure shippingOptions is an array even if it's null/undefined from storage
                financialData.shippingOptions = financialData.shippingOptions || [];
                financialData.transactionFeePercent = financialData.transactionFeePercent ?? 2.9;
                financialData.monthlyFixedCostsCents = financialData.monthlyFixedCostsCents ?? 0;
            }
            setFinancials(financialData);

            setNextSteps(data.nextSteps?.map(step => ({ ...step, category: step.category || 'General', priority: (step as any).priority || 'Medium' })) || []);
            setChatHistory(data.chatHistory || []);
            setStorefrontMockupUrl(data.storefrontMockupUrl || null);
            setSeoStrategy(data.seoStrategy || null);
            setShopifyIntegration(data.shopifyIntegration || null);
            setSupplierQuotes(data.supplierQuotes || []);
            setSupplierSuggestions(data.supplierSuggestions || null);
            setPriceHistory(data.priceHistory || []);
            setAdCampaigns(data.adCampaigns || null);
            setInfluencerMarketingPlan(data.influencerMarketingPlan || null);
            setCustomerSupportPlaybook(data.customerSupportPlaybook || null);
            setPackagingExperience(data.packagingExperience || null);
            setLegalChecklist(data.legalChecklist || null);
            setSocialMediaCalendar(data.socialMediaCalendar || null);
            setPhotographyPlan(data.photographyPlan || null);
            setAbTestPlan(data.abTestPlan || null);
            setEmailFunnel(data.emailFunnel || null);
            setPressRelease(data.pressRelease || null);

            
            setIsPlanSaved(true);
            setCurrentStep(2); // Go to blueprint step after loading
            setShowVentures(false);
        }
    };
    
    const renameVenture = async (vId: string, newName: string) => {
        const now = new Date().toISOString();
        if (user?.id) {
            try {
                const { error } = await supabase
                    .from('ventures')
                    .update({ name: newName, last_modified: now })
                    .eq('id', vId);

                if (error) throw error;
                
                setSavedVentures(prev => prev.map(v => v.id === vId ? { ...v, name: newName, lastModified: now } : v));
            } catch (err) {
                console.error('Failed to rename venture in database:', err);
            }
        } else {
            const updatedVentures = savedVentures.map(v => v.id === vId ? { ...v, name: newName, lastModified: now } : v);
            setSavedVentures(updatedVentures);
            localStorage.setItem('dad-ecommerce-ventures', JSON.stringify(updatedVentures));
        }
        
        if (vId === ventureId) {
            setVentureName(newName);
        }
    };

    const deleteVenture = async (vId: string) => {
        if (user?.id) {
            try {
                const { error } = await supabase
                    .from('ventures')
                    .delete()
                    .eq('id', vId);

                if (error) throw error;
                
                setSavedVentures(prev => prev.filter(v => v.id !== vId));
            } catch (err) {
                console.error('Failed to delete venture from database:', err);
            }
        } else {
            const updatedVentures = savedVentures.filter(v => v.id !== vId);
            setSavedVentures(updatedVentures);
            localStorage.setItem('dad-ecommerce-ventures', JSON.stringify(updatedVentures));
        }

        if (vId === ventureId) {
            resetState();
        }
    };

    const handleSelectScoutIdea = (idea: string) => {
        setProductIdea(idea);
        setShowScout(false);
        setInputError(null);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        resetState();
    };

    const steps = ['Idea & Goals', 'Blueprint', 'Market Analysis', 'Launchpad'];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Header 
                onShowVentures={() => setShowVentures(true)} 
                hasVentures={savedVentures.length > 0}
                theme={theme}
                onToggleTheme={toggleTheme}
                onShowAuth={() => setShowAuthModal(true)}
                onShowAnalytics={() => setShowAnalytics(true)}
                user={user ? { email: user.email, displayName: user.user_metadata?.display_name } : null}
                onSignOut={handleSignOut}
            />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
                <ProgressBar currentStep={currentStep} steps={steps} />
                
                <div key={currentStep} className="w-full animate-fade-in-up">
                    {currentStep === 1 && (
                        <Step1Idea
                            productIdea={productIdea}
                            onProductIdeaChange={handleProductIdeaChange}
                            handleGeneratePlan={handleGeneratePlan}
                            isLoading={isLoading}
                            inputError={inputError}
                            handleExampleClick={handleExampleClick}
                            brandVoice={brandVoice}
                            setBrandVoice={setBrandVoice}
                            onShowScout={() => setShowScout(true)}
                            smartGoals={smartGoals}
                            onProceedToBlueprint={handleProceedToBlueprint}
                        />
                    )}
                    {currentStep === 2 && plan && (
                        <Step2Blueprint
                            plan={plan}
                            productIdea={productIdea}
                            brandVoice={brandVoice}
                            onPlanChange={updatePlan}
                            logoImageUrl={logoImageUrl}
                            setLogoImageUrl={(url) => { setLogoImageUrl(url); onPlanModified(); }}
                            brandKit={brandKit}
                            setBrandKit={(kit) => { setBrandKit(kit); onPlanModified(); }}
                            onSavePlan={handleSavePlan}
                            isPlanSaved={isPlanSaved}
                            onNavigateToMarket={() => setCurrentStep(3)}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}
                     {currentStep === 3 && plan && (
                        <Step3Market
                            productPlan={plan}
                            productIdea={productIdea}
                            brandVoice={brandVoice}
                            analysis={analysis}
                            setAnalysis={(a) => { setAnalysis(a); onPlanModified(); }}
                            swotAnalysis={swotAnalysis}
                            setSwotAnalysis={(s) => { setSwotAnalysis(s); onPlanModified(); }}
                            customerPersona={customerPersona}
                            setCustomerPersona={(p) => { setCustomerPersona(p); onPlanModified(); }}
                            personaAvatarUrl={personaAvatarUrl}
                            setPersonaAvatarUrl={(url) => { setPersonaAvatarUrl(url); onPlanModified(); }}
                            onNavigateToLaunchpad={() => setCurrentStep(4)}
                            onBack={() => setCurrentStep(2)}
                        />
                    )}
                    {currentStep === 4 && plan && (
                        <Step4Launchpad
                            productPlan={plan}
                            brandVoice={brandVoice}
                            competitiveAnalysis={analysis}
                            customerPersona={customerPersona}
                            logoImageUrl={logoImageUrl}
                            marketingPlan={marketingPlan}
                            setMarketingPlan={setMarketingPlan}
                            financials={financials}
                            setFinancials={setFinancials}
                            nextSteps={nextSteps}
                            setNextSteps={setNextSteps}
                            chatHistory={chatHistory}
                            setChatHistory={setChatHistory}
                            storefrontMockupUrl={storefrontMockupUrl}
                            setStorefrontMockupUrl={setStorefrontMockupUrl}
                            seoStrategy={seoStrategy}
                            setSeoStrategy={setSeoStrategy}
                            shopifyIntegration={shopifyIntegration}
                            setShopifyIntegration={setShopifyIntegration}
                            supplierQuotes={supplierQuotes}
                            setSupplierQuotes={setSupplierQuotes}
                            supplierSuggestions={supplierSuggestions}
                            setSupplierSuggestions={setSupplierSuggestions}
                            adCampaigns={adCampaigns}
                            setAdCampaigns={setAdCampaigns}
                            influencerMarketingPlan={influencerMarketingPlan}
                            setInfluencerMarketingPlan={setInfluencerMarketingPlan}
                            customerSupportPlaybook={customerSupportPlaybook}
                            setCustomerSupportPlaybook={setCustomerSupportPlaybook}
                            packagingExperience={packagingExperience}
                            setPackagingExperience={setPackagingExperience}
                            legalChecklist={legalChecklist}
                            setLegalChecklist={setLegalChecklist}
                            socialMediaCalendar={socialMediaCalendar}
                            setSocialMediaCalendar={setSocialMediaCalendar}
                            photographyPlan={photographyPlan}
                            setPhotographyPlan={setPhotographyPlan}
                            abTestPlan={abTestPlan}
                            setAbTestPlan={setAbTestPlan}
                            emailFunnel={emailFunnel}
                            setEmailFunnel={setEmailFunnel}
                            pressRelease={pressRelease}
                            setPressRelease={setPressRelease}
                            onPlanModified={onPlanModified}
                            onBack={() => setCurrentStep(3)}
                        />
                    )}
                </div>
            </main>
            <Footer />
            {showVentures && (
                <MyVenturesDashboard
                    ventures={savedVentures}
                    onLoad={loadVenture}
                    onRename={renameVenture}
                    onDelete={deleteVenture}
                    onClose={() => setShowVentures(false)}
                />
            )}
             {showScout && (
                <ProductScout
                    onClose={() => setShowScout(false)}
                    onSelectIdea={handleSelectScoutIdea}
                />
            )}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                />
            )}
            {showAnalytics && (
                <AnalyticsDashboard
                    onClose={() => setShowAnalytics(false)}
                />
            )}
        </div>
    );
};

export default App;
