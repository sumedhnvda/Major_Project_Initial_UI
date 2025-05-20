import React from 'react';
import { MessageSquare, Globe,  BookAIcon, Workflow,  GroupIcon, DatabaseIcon } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
    <div className="w-12 h-12 bg-light-red-100 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookAIcon className="h-6 w-6 text-light-red-500" />,
      title: "Pretrained on Native Tulu Literature",
      description: "Uses a carefully curated dataset of Tulu novels written in Kannada script and captures authentic grammar, vocabulary, and cultural expressions of the language"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-light-red-500" />,
      title: "General-Purpose Conversational Ability",
      description: "Finetuned on diverse Q&A pairs to enable natural, context-aware dialogue in Tulu and supports a wide range of everyday topics and use cases"
    },
    {
      icon: <Workflow className="h-6 w-6 text-light-red-500" />,
      title: "Built Entirely From Scratch",
      description: "Custom tokenizer and architecture, tailored for Tulu's linguistic structure and not a finetuned version of existing large models — it’s trained from the ground up"
    },
    {
      icon: <Globe className="h-6 w-6 text-light-red-500" />,
      title: "Language Preservation & Accessibility",
      description: "Helps preserve the Tulu language digitally and empowers regional communities through AI inclusivity."
    },
    {
      icon: <GroupIcon className="h-6 w-6 text-light-red-500" />,
      title: "Open Source and Community-Driven",
      description: "The entire project is open source, encouraging collaboration, reuse, and contribution from researchers and developers working on low-resource languages."
    },
    {
      icon: <DatabaseIcon className="h-6 w-6 text-light-red-500" />,
      title: "Creation of High-Quality Datasets",
      description: (
        <ul className="list-disc list-inside text-gray-600 space-y-1">
            Custom Tulu datasets created for:
            <ul className="list-disc list-inside ml-5">
              <li>Finetuning on general-purpose Q&A tasks</li>
              <li>Finetuning ASR (Speech-to-Text) models</li>
              <li>Finetuning TTS (Text-to-Speech) models</li>
            </ul>    
        </ul>
      )
    } 
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our advanced AI model provides a range of capabilities designed to make voice and text 
            interactions natural and efficient.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;