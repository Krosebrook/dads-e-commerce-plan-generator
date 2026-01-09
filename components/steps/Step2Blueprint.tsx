

import React, { useState, useCallback } from 'react';
import { ProductPlan, ProductVariant, RegenerateableSection, BrandIdentityKit, UserPersonaId } from '../../types';
import { generateLogo, regeneratePlanSection, generateProductPlan, generateBrandIdentity } from '../../services/geminiService';
import ProductPlanCard from '../ProductPlanCard';
import BrandIdentityCard from '../BrandIdentityCard';
import { Button } from '../ui/Button';
import { trackPhaseCompletion } from '../../src/lib/blink';

interface Step2BlueprintProps {
    plan: ProductPlan;
    productIdea: string;
    brandVoice: string;
    selectedPersona: UserPersonaId | undefined;
    onPlanChange: (updatedPlan: ProductPlan) => void;
    logoImageUrl: string | null;
    setLogoImageUrl: (url: string | null) => void;
    brandKit: BrandIdentityKit | null;
    setBrandKit: (kit: BrandIdentityKit | null) => void;
    onSavePlan: () => void;
    isPlanSaved: boolean;
    onNavigateToMarket: () => void;
    onBack: () => void;
}

const Step2Blueprint: React.FC<Step2BlueprintProps> = ({
    plan,
    productIdea,
    brandVoice,
    selectedPersona,
    onPlanChange,
    logoImageUrl,
    setLogoImageUrl,
    brandKit,
    setBrandKit,
    onSavePlan,
    isPlanSaved,
    onNavigateToMarket,
    onBack,
}) => {
    const [isGeneratingLogo, setIsGeneratingLogo] = useState<boolean>(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [logoStyle, setLogoStyle] = useState<string>('Minimalist');
    const [logoColor, setLogoColor] = useState<string>('Default');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isRegenerating, setIsRegenerating] = useState<Record<RegenerateableSection, boolean>>({
        description: false,
        variants: false,
        tags: false,
        materials: false,
    });
    const [isGeneratingKit, setIsGeneratingKit] = useState<boolean>(false);
    const [regenerateError, setRegenerateError] = useState<string | null>(null);
    const [brandKitError, setBrandKitError] = useState<string | null>(null);

    const handleGenerateLogo = useCallback(async () => {
        if (!plan || isGeneratingLogo) return;

        setIsGeneratingLogo(true);
        setLogoError(null);
        try {
            const imageUrl = await generateLogo(plan.productTitle, logoStyle, logoColor);
            setLogoImageUrl(imageUrl);
            trackPhaseCompletion('logo_generated', { style: logoStyle, color: logoColor });
        } catch (err) {
            console.error(err);
            setLogoError('Logo generation failed. Please try again.');
        } finally {
            setIsGeneratingLogo(false);
        }
    }, [plan, isGeneratingLogo, logoStyle, logoColor, setLogoImageUrl]);

    const handleGenerateKit = useCallback(async () => {
        if (!plan || isGeneratingKit) return;
        setIsGeneratingKit(true);
        setBrandKitError(null);
        try {
            const kit = await generateBrandIdentity(plan, brandVoice, selectedPersona);
            setBrandKit(kit);
            trackPhaseCompletion('brand_kit_generated', { productTitle: plan.productTitle });
        } catch (err) {
            console.error(err);
            setBrandKitError('Brand kit generation failed. Please try again.');
        } finally {
            setIsGeneratingKit(false);
        }
    }, [plan, isGeneratingKit, brandVoice, setBrandKit, selectedPersona]);

    const handleRegenerateSection = useCallback(async (section: RegenerateableSection) => {
        if (!plan) return;
        setIsRegenerating(prev => ({ ...prev, [section]: true }));
        setRegenerateError(null);
        try {
            const regeneratedPart = await regeneratePlanSection(productIdea, plan, section, brandVoice);
            const newPlan = { ...plan, ...regeneratedPart };
            if (section === 'variants' && newPlan.variants) {
                newPlan.stock = newPlan.variants.reduce((acc, v) => acc + v.stock, 0);
                if (newPlan.variants.length > 0) {
                    newPlan.priceCents = newPlan.variants.reduce((acc, v) => acc + v.priceCents, 0) / newPlan.variants.length;
                }
            }
            onPlanChange(newPlan);
            trackPhaseCompletion('plan_section_regenerated', { section, productTitle: plan.productTitle });
        } catch (err) {
            console.error(`Failed to regenerate ${section}:`, err);
            setRegenerateError(`Failed to regenerate ${section}. Please try again.`);
        } finally {
            setIsRegenerating(prev => ({ ...prev, [section]: false }));
        }
    }, [plan, productIdea, onPlanChange, brandVoice]);
    
    const handleUpdatePlan = useCallback(async (updatedVariants: ProductVariant[]) => {
    if (!productIdea.trim()) return;

    setIsUpdating(true);
    setLogoError(null);

    try {
      const newPlan = await generateProductPlan(productIdea, brandVoice, updatedVariants, selectedPersona);
      onPlanChange(newPlan);
    } catch (err) {
      console.error(err);
      // You might want to show an error to the user here
    } finally {
      setIsUpdating(false);
    }
  }, [productIdea, onPlanChange, brandVoice, selectedPersona]);


    return (
        <div className="w-full max-w-4xl space-y-8">
            <div className="flex justify-end">
                <Button onClick={onSavePlan} disabled={isPlanSaved} variant={isPlanSaved ? "outline" : "default"} className="px-4 py-2 text-sm">
                    {isPlanSaved ? '✔ Plan Saved' : 'Save Plan'}
                </Button>
            </div>
            
            {/* Error Messages */}
            {regenerateError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">{regenerateError}</p>
                </div>
            )}
            {brandKitError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200">{brandKitError}</p>
                </div>
            )}
            <ProductPlanCard
                plan={plan}
                logoImageUrl={logoImageUrl}
                isLoading={isUpdating}
                isGeneratingLogo={isGeneratingLogo}
                isRegenerating={isRegenerating}
                logoError={logoError}
                onGenerateLogo={handleGenerateLogo}
                onUpdatePlan={handleUpdatePlan}
                onPlanChange={onPlanChange}
                onRegenerateSection={handleRegenerateSection}
                logoStyle={logoStyle}
                onLogoStyleChange={setLogoStyle}
                logoColor={logoColor}
                onLogoColorChange={setLogoColor}
            />

            {logoImageUrl && !brandKit && (
                 <div className="text-center">
                    <Button onClick={handleGenerateKit} disabled={isGeneratingKit}>
                         {isGeneratingKit ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Kit...
                            </>
                        ) : (
                            '✨ Generate Brand Identity Kit'
                        )}
                    </Button>
                </div>
            )}
           
            {brandKit && <BrandIdentityCard brandKit={brandKit} />}

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button onClick={onNavigateToMarket}>{'Next: Analyze Market'}</Button>
            </div>
        </div>
    );
};

export default Step2Blueprint;