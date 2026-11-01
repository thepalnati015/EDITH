
import { useState } from 'react';

function AIAssistant() {
  const [complaint, setComplaint] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const analyzeComplaint = async () => {
    if (!complaint.trim()) return;

    setLoading(true);
    setError('');
    setAnalysis(null);
    setReply('');
    setCopied(false);

    try {
      const response = await fetch(
        'http://localhost:5000/api/ai/analyze-complaint',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const draftReply = async () => {
    if (!complaint.trim()) return;

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await fetch(
        'http://localhost:5000/api/ai/draft-reply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            complaint,
            tone: 'professional',
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Drafting failed');

      setReply(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyReply = async () => {
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
    } catch {
      setError('Unable to copy. Please select and copy the reply manually.');
    }
  };

  return (
    <section className="edith-ai">
      <div className="edith-ai-header">
        <div>
          <span className="edith-ai-eyebrow">INTELLIGENCE / AUTOMATION</span>
          <h2>AI Operations Assistant</h2>
          <p>Understand customer concerns. Create thoughtful responses.</p>
        </div>

        <div className="edith-ai-symbol">✦</div>
      </div>

      <div className="edith-ai-divider" />

      <div className="edith-ai-content">
        <div className="edith-ai-label-row">
          <label htmlFor="edith-complaint">CUSTOMER COMPLAINT</label>
          <span>INPUT / 01</span>
        </div>

        <textarea
          id="edith-complaint"
          className="edith-ai-textarea"
          rows={7}
          placeholder="Paste the customer's complaint here..."
          value={complaint}
          onChange={(event) => setComplaint(event.target.value)}
        />

        <div className="edith-ai-hint">
          Provide the complaint details to begin your analysis.
        </div>

        <div className="edith-ai-actions">
          <button
            className="edith-ai-primary"
            onClick={analyzeComplaint}
            disabled={loading || !complaint.trim()}
          >
            {loading ? 'Processing...' : '✦ Analyse Complaint'}
          </button>

          <button
            className="edith-ai-secondary"
            onClick={draftReply}
            disabled={loading || !complaint.trim()}
          >
            Draft Customer Reply
          </button>
        </div>

        {loading && (
          <div className="edith-ai-status">
            <span className="edith-ai-loader" />
            EDITH is processing your request...
          </div>
        )}

        {error && (
          <div className="edith-ai-error">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        {analysis && (
          <div className="edith-ai-result">
            <div className="edith-ai-result-heading">
              <div>
                <span className="edith-ai-eyebrow">ANALYSIS / 01</span>
                <h3>Complaint Analysis</h3>
              </div>
              <span className="edith-ai-result-icon">✦</span>
            </div>

            <div className="edith-ai-result-grid">
              <div className="edith-ai-result-item">
                <span>CATEGORY</span>
                <strong>{analysis.category}</strong>
              </div>

              <div className="edith-ai-result-item">
                <span>PRIORITY</span>
                <strong>{analysis.priority}</strong>
              </div>
            </div>

            <div className="edith-ai-result-section">
              <span>SUMMARY</span>
              <p>{analysis.summary}</p>
            </div>

            <div className="edith-ai-result-section">
              <span>RECOMMENDED ACTION</span>
              <p>{analysis.recommendedAction}</p>
            </div>
          </div>
        )}

        {reply && (
          <div className="edith-ai-result">
            <div className="edith-ai-result-heading">
              <div>
                <span className="edith-ai-eyebrow">RESPONSE / 01</span>
                <h3>Suggested Customer Reply</h3>
              </div>
              <span className="edith-ai-result-icon">✉</span>
            </div>

            <p className="edith-ai-reply">{reply}</p>

            <button
              className="edith-ai-copy"
              onClick={copyReply}
            >
              {copied ? '✓ Copied to clipboard' : 'Copy Reply'}
            </button>
          </div>
        )}
      </div>

      <div className="edith-ai-footer">
        <span>EDITH INTELLIGENCE</span>
        <span>YOUR BUSINESS. YOUR CONTROL.</span>
      </div>
    </section>
  );
}

export default AIAssistant;
