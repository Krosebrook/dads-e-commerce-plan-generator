import React from 'react';
import { UserPersonaId } from '../types';
import { getPersonaById } from '@/src/lib/personas';
import { Card } from './ui/Card';
import { Info, CheckCircle2 } from 'lucide-react';

interface PersonaGuideProps {
  personaId: UserPersonaId;
  currentStep: number;
}

const PersonaGuide: React.FC<PersonaGuideProps> = ({ personaId, currentStep }) => {
  const persona = getPersonaById(personaId);
  if (!persona) return null;

  const stepGains = [
    {
      step: 1,
      focus: "Strategic Alignment",
      advice: "Focus on defining clear S.M.A.R.T. goals that match your lifestyle objectives."
    },
    {
      step: 2,
      focus: "Product Foundations",
      advice: personaId === 'dropshipping_newbie' 
        ? "Prioritize product variations and SKU management for your digital storefront."
        : "Focus on materials and brand identity to establish a premium feel."
    },
    {
      step: 3,
      focus: "Market Positioning",
      advice: personaId === 'amazon_fba'
        ? "Dive deep into competitive analysis to find your 'Blue Ocean' niche."
        : "Perfect your customer persona to tailor your marketing message."
    },
    {
      step: 4,
      focus: "Execution & Scale",
      advice: personaId === 'tech_savvy_genz'
        ? "Automate as much as possible with Shopify integration and social media scheduling."
        : "Refine your financial projections and legal checklist before the official launch."
    }
  ];

  const currentAdvice = stepGains.find(s => s.step === currentStep);

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <Card className="border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-900/30 overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          <div className="bg-indigo-600 rounded-full p-2 text-white">
            <Info className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100">
                {persona.name} Guide: {currentAdvice?.focus}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                Persona Workflow
              </span>
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
              {currentAdvice?.advice}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.workflow.filter(w => w.startsWith(`Step${currentStep}`) || currentStep === 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  {item.replace('Card', '').replace('Step', 'Phase ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonaGuide;
