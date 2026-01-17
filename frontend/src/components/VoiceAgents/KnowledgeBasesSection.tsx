import React from 'react';
import { RefreshCw } from 'lucide-react';

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  knowledge_base_sources?: any[];
}

interface Source {
  type: string;
  title?: string;
  filename?: string;
  url?: string;
  content_length?: number;
  file_size?: number;
}

interface KnowledgeBasesSectionProps {
  // List mode props
  knowledgebases?: KnowledgeBase[];
  selectedKnowledgebase?: string | null;
  onSelectKnowledgebase?: (knowledgebaseName: string) => void;
  onCreateKnowledgebase?: () => void;
  
  // Detail mode props
  selectedKnowledgebase?: string | null;
  knowledgebaseSources?: Source[];
  knowledgebaseLoading?: boolean;
  onAddTextSource?: () => void;
  onAddFileSource?: () => void;
  onAddUrlSource?: () => void;
  onDeleteKnowledgebase?: (knowledgebaseName: string) => void;
  onDeleteSource?: (type: string, sourceName: string) => void;
  
  // Shared props
  colors: any;
}

const KnowledgeBasesSection: React.FC<KnowledgeBasesSectionProps> = ({
  // List props
  knowledgebases,
  selectedKnowledgebase,
  onSelectKnowledgebase,
  onCreateKnowledgebase,
  
  // Detail props
  knowledgebaseSources,
  knowledgebaseLoading,
  onAddTextSource,
  onAddFileSource,
  onAddUrlSource,
  onDeleteKnowledgebase,
  onDeleteSource,
  
  // Shared
  colors
}) => {
  // If we have knowledgebases array, render the list view
  if (knowledgebases) {
    return (
      <div 
        className="p-6 rounded-lg border knowledge-bases-card"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
        data-onboarding="knowledge-bases-overview"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Knowledge Bases</h2>
          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.border, color: colors.textSecondary }}>
            {knowledgebases.length} bases
          </span>
        </div>
        
        <div className="space-y-3">
          {knowledgebases.length === 0 ? (
            <div className="text-center py-4" style={{ color: colors.textSecondary }}>
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No knowledge bases yet</p>
            </div>
          ) : (
            knowledgebases.map(kb => (
              <div
                key={kb.knowledge_base_id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedKnowledgebase === kb.knowledge_base_name ? 'ring-2' : ''}`}
                style={{
                  backgroundColor: selectedKnowledgebase === kb.knowledge_base_name ? colors.accent + '20' : colors.border + '20',
                  borderColor: selectedKnowledgebase === kb.knowledge_base_name ? colors.accent : colors.border,
                  borderWidth: '1px',
                  color: colors.text
                }}
                onClick={() => onSelectKnowledgebase?.(kb.knowledge_base_name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.success + '20' }}>
                      <svg className="w-4 h-4" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{kb.knowledge_base_name}</div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {kb.knowledge_base_sources?.length || 0} sources
                      </div>
                    </div>
                  </div>
                  <svg className="flex-shrink-0 w-5 h-5 md:w-4 md:h-4" style={{ color: colors.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onCreateKnowledgebase}
          data-onboarding="create-knowledgebase-button"
          className="w-full mt-4 px-4 py-2 rounded-lg border border-dashed transition-colors hover:border-solid"
          style={{ 
            borderColor: colors.border,
            color: colors.textSecondary,
            backgroundColor: colors.cardBg
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Knowledge Base
          </div>
        </button>
      </div>
    );
  }

  // Otherwise render the detail view
  return (
    <div className="space-y-6">
      <div 
        className="p-6 rounded-lg border knowledge-base-details-card"
        style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">{selectedKnowledgebase}</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {knowledgebaseSources?.length || 0} sources
            </p>
          </div>
          <div className="flex gap-2 justify-end flex-wrap">
            <button
              onClick={onAddTextSource}
              data-onboarding="add-text-source"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border font-medium text-sm sm:text-base"
              style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="whitespace-nowrap">Add Text</span>
              </div>
            </button>
            <button
              onClick={onAddFileSource}
              data-onboarding="upload-file-source"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border font-medium text-sm sm:text-base"
              style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="whitespace-nowrap">Upload File</span>
              </div>
            </button>
            <button
              onClick={onAddUrlSource}
              data-onboarding="add-url-source"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border font-medium text-sm sm:text-base"
              style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.cardBg }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="whitespace-nowrap">Add URL</span>
              </div>
            </button>
            <button
              onClick={() => onDeleteKnowledgebase?.(selectedKnowledgebase!)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border font-medium text-sm sm:text-base"
              style={{ borderColor: colors.danger, color: colors.danger }}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="whitespace-nowrap">Remove</span>
              </div>
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="sources-list-section">
          <h3 className="font-semibold mb-3">Sources</h3>
          {knowledgebaseLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" style={{ color: colors.textSecondary }} />
              <p style={{ color: colors.textSecondary }}>Loading sources...</p>
            </div>
          ) : knowledgebaseSources?.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                No sources yet. Add text, files, or URLs to build your knowledge base.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgebaseSources?.map((source, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{ backgroundColor: colors.border + '10', borderColor: colors.border }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      source.type === 'text' ? 'bg-blue-100' : 
                      source.type === 'document' ? 'bg-green-100' : 
                      'bg-purple-100'
                    }`}>
                      {source.type === 'text' && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                      {source.type === 'document' && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      )}
                      {source.type === 'url' && (
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {source.title || source.filename || source.url}
                      </div>
                      <div className="text-sm capitalize" style={{ color: colors.textSecondary }}>
                        {source.type} 
                        {source.type === 'text' && ` •  ${source.content_length} characters`}
                        {source.type === 'document' && ` • ${(source.file_size / 1024).toFixed(0)} KB`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteSource?.(
                      source.type,
                      source.title || source.filename || source.url || ''
                    )}
                    className="p-2 rounded hover:bg-opacity-20"
                    style={{ color: colors.danger }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasesSection;