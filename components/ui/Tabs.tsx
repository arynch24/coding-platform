import React from 'react';

interface Tab {
  label: string;
  id: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(index)}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === index
                ? 'border-navy-500 text-navy-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};