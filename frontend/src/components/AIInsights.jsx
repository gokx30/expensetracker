import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

const AIInsights = ({ insights, loading, onRegenerate }) => {
  // Helper to split string into emoji + text if applicable
  const parseInsight = (text) => {
    // Check if the suggestion starts with an emoji (regex matches emoji ranges)
    const emojiRegex = /^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/;
    const match = text.match(emojiRegex);
    
    if (match) {
      const emoji = match[0];
      const content = text.slice(emoji.length).trim();
      return { emoji, content };
    }
    
    return { emoji: '💡', content: text };
  };

  return (
    <div className="glass-card" style={{ boxShadow: '0 8px 32px 0 rgba(99, 102, 241, 0.05), var(--card-shadow)' }}>
      <div className="card-header">
        <h2 style={{ color: 'var(--color-primary)', textShadow: '0 0 10px rgba(99, 102, 241, 0.1)' }}>
          <Sparkles size={18} />
          AI spending suggestions
        </h2>
        <button 
          className={`btn btn-secondary ${loading ? 'disabled' : ''}`}
          onClick={onRegenerate}
          disabled={loading}
          title="Regenerate Insights"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
        </button>
      </div>

      <div className="ai-suggest-list">
        {loading ? (
          // Shimmer loading skeletons
          <>
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" style={{ marginBottom: 0 }} />
          </>
        ) : insights.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <p style={{ fontSize: '0.85rem' }}>No suggestions. Add income/expense transactions to unlock insights.</p>
          </div>
        ) : (
          insights.map((insight, idx) => {
            const { emoji, content } = parseInsight(insight);
            return (
              <div key={idx} className="ai-suggest-item">
                <div className="ai-suggest-icon">{emoji}</div>
                <div className="ai-suggest-content">{content}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Embedded Spinner Keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AIInsights;
