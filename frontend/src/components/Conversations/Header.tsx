import React from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  sentimentFilter: string;
  setSentimentFilter: (filter: string) => void;
  colors: any;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  sentimentFilter,
  setSentimentFilter,
  colors
}) => {
  const options = [
    { value: 'all', label: 'All Time' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '1y', label: 'Last 1 Year' }
  ];

  const sentimentOptions = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ];

  return (
    <div className="p-4 border-b" style={{ borderColor: colors.border }}>
      <h1 className="font-semibold mb-4 conversations-container">Conversations</h1>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by number, name, etc."
          className="w-[300px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent conversations-search"
          style={{ 
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.text
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Listbox value={filter} onChange={setFilter}>
          {({ open }) => (
            <div className="relative w-52 time-filter-conversations">
              <ListboxButton 
                className="w-full px-3 py-2 border rounded-lg bg-white hover:border-gray-400 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <span>{options.find((o) => o.value === filter)?.label}</span>
                <ChevronUpDownIcon
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </ListboxButton>
              <ListboxOptions 
                className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border
                }}
              >
                {options.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option.value}
                    className={"cursor-pointer select-none px-4 py-2"}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.inputBgHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.inputBg;
                    }}
                    style={{ backgroundColor: colors.inputBg, color: colors.text }}
                  >
                    {option.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          )}
        </Listbox>

        <Listbox value={sentimentFilter} onChange={setSentimentFilter}>
          {({ open }) => (
            <div className="relative w-52 sentiment-filter">
              <ListboxButton 
                className="w-full px-3 py-2 border rounded-lg bg-white hover:border-gray-400 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <span>{sentimentOptions.find((o) => o.value === sentimentFilter)?.label}</span>
                <ChevronUpDownIcon
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </ListboxButton>
              <ListboxOptions 
                className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                style={{ 
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border
                }}
              >
                {sentimentOptions.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option.value}
                    className={"cursor-pointer select-none px-4 py-2"}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.inputBgHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.inputBg;
                    }}
                    style={{ backgroundColor: colors.inputBg, color: colors.text }}
                  >
                    {option.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          )}
        </Listbox>
      </div>
    </div>
  );
};

export default Header;