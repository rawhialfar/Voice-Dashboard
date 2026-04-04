import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface ChangelogPopupProps {
  isOpen: boolean;
  changeLogData: {
    version: string;
    date: string;
    changes: string[];
  }[];
  onClose: () => void;
  colors: any;
}

const ChangelogPopup: React.FC<ChangelogPopupProps> = ({ isOpen, onClose, colors, changeLogData }) => {
  if (!isOpen) return null;

  return (
    <div
        className="fixed inset-0 flex items-center justify-center z-99 p-4"
        style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
        }}
    >
        <div 
            className="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            style={{ 
            backgroundColor: colors.bg,
            color: colors.text
            }}
        >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: colors.border }}
        >
            <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-10 h-10" style={{ color: colors.icon }} />
                <h2 className="text-4xl font-bold">Change log</h2>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-[100%] transition-colors"
                style={{ 
                    color: colors.text,
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = colors.border}
                onMouseOut={e => e.currentTarget.style.backgroundColor = colors.bg}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {changeLogData.map((release, index) => (
              <div key={index} className="border-l-4 pl-4" style={{ borderColor: colors.button }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-semibold">{release.version}</h3>
                  <span className="text-md opacity-75">{release.date}</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {release.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="text-md" style={{ color: colors.textSecondary }}>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogPopup;