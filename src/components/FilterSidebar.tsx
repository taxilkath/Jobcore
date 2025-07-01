import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    experience: true,
    salary: true,
    company: true,
    location: true
  });

  const [activeFilters, setActiveFilters] = useState({
    jobTypes: [] as string[],
    experienceLevels: [] as string[],
    salaryRanges: [] as string[],
    companies: [] as string[],
    locations: [] as string[]
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterToggle = (category: keyof typeof activeFilters, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = newFilters[category];
      
      if (currentValues.includes(value)) {
        newFilters[category] = currentValues.filter(item => item !== value);
      } else {
        newFilters[category] = [...currentValues, value];
      }
      
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      jobTypes: [],
      experienceLevels: [],
      salaryRanges: [],
      companies: [],
      locations: []
    };
    setActiveFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const CustomCheckbox = ({ checked, onChange, label, count }: any) => (
    <label className="flex items-center group cursor-pointer py-2 px-3 rounded-xl hover:bg-gray-50 transition-all">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-lg border-2 transition-all ${
          checked 
            ? 'bg-gradient-to-r from-teal-500 to-blue-600 border-transparent' 
            : 'border-gray-300 group-hover:border-gray-400'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <span className="ml-3 text-sm text-gray-700 font-medium flex-1">{label}</span>
      {count && (
        <span className="text-xs text-gray-400 font-medium">{count.toLocaleString()}</span>
      )}
    </label>
  );

  const FilterSection = ({ title, items, category, sectionKey }: any) => (
    <div className="border-b border-gray-100 pb-6 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-3 text-left group hover:bg-gray-50 rounded-xl px-3 transition-all"
      >
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <div className={`p-1 rounded-lg transition-all ${expandedSections[sectionKey] ? 'bg-teal-100 text-teal-600' : 'text-gray-400 group-hover:bg-gray-100'}`}>
          {expandedSections[sectionKey] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-1 animate-in slide-in-from-top duration-200">
          {items.map((item: any) => (
            <CustomCheckbox
              key={item.value}
              checked={activeFilters[category].includes(item.value)}
              onChange={() => handleFilterToggle(category, item.value)}
              label={item.label}
              count={item.count}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
        w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 overflow-y-auto custom-scrollbar
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        rounded-r-3xl lg:rounded-none
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mr-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearAllFilters}
                className="flex items-center text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6">
            <FilterSection
              title="Job Type"
              sectionKey="jobType"
              category="jobTypes"
              items={[
                { value: 'full-time', label: 'Full Time', count: 45234 },
                { value: 'part-time', label: 'Part Time', count: 12456 },
                { value: 'contract', label: 'Contract', count: 8765 },
                { value: 'remote', label: 'Remote', count: 23456 },
                { value: 'internship', label: 'Internship', count: 3456 }
              ]}
            />

            <FilterSection
              title="Experience Level"
              sectionKey="experience"
              category="experienceLevels"
              items={[
                { value: 'entry', label: 'Entry Level', count: 15234 },
                { value: 'mid', label: 'Mid Level', count: 32456 },
                { value: 'senior', label: 'Senior Level', count: 28765 },
                { value: 'executive', label: 'Executive', count: 5432 }
              ]}
            />

            <FilterSection
              title="Salary Range"
              sectionKey="salary"
              category="salaryRanges"
              items={[
                { value: '0-50k', label: '$0 - $50k', count: 12345 },
                { value: '50k-80k', label: '$50k - $80k', count: 23456 },
                { value: '80k-120k', label: '$80k - $120k', count: 34567 },
                { value: '120k-150k', label: '$120k - $150k', count: 15678 },
                { value: '150k+', label: '$150k+', count: 8765 }
              ]}
            />

            <FilterSection
              title="Top Companies"
              sectionKey="company"
              category="companies"
              items={[
                { value: 'google', label: 'Google', count: 234 },
                { value: 'microsoft', label: 'Microsoft', count: 187 },
                { value: 'amazon', label: 'Amazon', count: 156 },
                { value: 'apple', label: 'Apple', count: 143 },
                { value: 'meta', label: 'Meta', count: 128 }
              ]}
            />

            <FilterSection
              title="Location"
              sectionKey="location"
              category="locations"
              items={[
                { value: 'san-francisco', label: 'San Francisco, CA', count: 5432 },
                { value: 'new-york', label: 'New York, NY', count: 6543 },
                { value: 'seattle', label: 'Seattle, WA', count: 3456 },
                { value: 'austin', label: 'Austin, TX', count: 2345 },
                { value: 'remote', label: 'Remote', count: 12345 }
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;