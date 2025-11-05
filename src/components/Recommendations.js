import React, { useState } from 'react';

const Recommendations = ({ apiBase }) => {
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    
    if (!preferences.trim()) {
      alert('Please describe your reading preferences');
      return;
    }

    try {
      setLoading(true);
      setHasRecommendations(true);
      
      const response = await fetch(`${apiBase}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        const error = await response.json();
        alert(`Error getting recommendations: ${error.error || 'Unknown error'}`);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Error getting recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const stars = Math.round(rating);
    return '⭐'.repeat(Math.min(Math.max(stars, 0), 10));
  };

  const clearRecommendations = () => {
    setPreferences('');
    setRecommendations([]);
    setHasRecommendations(false);
  };

  const presetPreferences = [
    "I love mystery and thriller novels with complex characters",
    "I enjoy science fiction books about space exploration and technology",
    "I prefer classic literature with deep philosophical themes",
    "I like romance novels with strong female protagonists",
    "I enjoy fantasy books with magic systems and world-building",
    "I prefer non-fiction books about history and biography",
    "I like contemporary fiction dealing with social issues"
  ];

  return (
    <div className="recommendations">
      <h2>🤖 AI Book Recommendations</h2>
      
      <div className="recommendations-intro">
        <p>Tell our AI about your reading preferences, and we'll recommend the perfect books from our available collection!</p>
      </div>

      <form onSubmit={handleGetRecommendations} className="preferences-form">
        <div className="form-group">
          <label htmlFor="preferences">What kind of books do you enjoy? 📚</label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Describe your reading preferences... (e.g., 'I love mystery novels with psychological twists, books set in Victorian era, or stories with strong female protagonists')"
            rows="4"
            className="preferences-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="recommend-btn">
            {loading ? '🤖 Analyzing Preferences...' : '🤖 Get AI Recommendations'}
          </button>
          
          {hasRecommendations && (
            <button type="button" onClick={clearRecommendations} className="clear-btn">
              🗑️ Clear
            </button>
          )}
        </div>
      </form>

      <div className="preset-preferences">
        <h3>💡 Quick Preference Examples</h3>
        <div className="preset-buttons">
          {presetPreferences.map((preset, index) => (
            <button
              key={index}
              onClick={() => setPreferences(preset)}
              className="preset-btn"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>🤖 AI is analyzing your preferences and finding the best matches...</p>
        </div>
      )}

      {hasRecommendations && !loading && (
        <div className="recommendations-results">
          <h3>
            🎯 Personalized Recommendations 
            <span className="result-count">({recommendations.length} books)</span>
          </h3>
          
          {recommendations.length === 0 ? (
            <div className="no-recommendations">
              <p>😔 No recommendations found based on your preferences.</p>
              <div className="recommendation-tips">
                <h4>💡 Tips for Better Recommendations:</h4>
                <ul>
                  <li>Be specific about genres, themes, or authors you like</li>
                  <li>Mention elements you enjoy (plot twists, character development, etc.)</li>
                  <li>Include time periods, settings, or topics of interest</li>
                  <li>Try different preference descriptions</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div key={rec.book.id} className="recommendation-card">
                  <div className="recommendation-rank">
                    <span className="rank-number">#{index + 1}</span>
                    <div className="rating">
                      <span className="rating-stars">{getRatingStars(rec.rating)}</span>
                      <span className="rating-score">{rec.rating}/10</span>
                    </div>
                  </div>
                  
                  <div className="recommendation-content">
                    <h4>{rec.book.title}</h4>
                    <p className="rec-author">by {rec.book.author}</p>
                    
                    <div className="rec-details">
                      {rec.book.genre && <span className="rec-genre">📚 {rec.book.genre}</span>}
                      <span className="rec-year">📅 {rec.book.publication_year}</span>
                      <span className={`rec-availability ${rec.book.available ? 'available' : 'borrowed'}`}>
                        {rec.book.available ? '✅ Available' : '📖 Borrowed'}
                      </span>
                    </div>

                    <div className="ai-reason">
                      <h5>🤖 Why This Book?</h5>
                      <p>{rec.reason}</p>
                    </div>

                    {rec.book.description && (
                      <div className="rec-description">
                        <h5>📖 Description</h5>
                        <p>{rec.book.description.length > 200 
                           ? rec.book.description.substring(0, 200) + '...'
                           : rec.book.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="ai-features-info">
        <h3>🚀 AI Recommendation Features</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">🧠</span>
            <div>
              <h4>Smart Analysis</h4>
              <p>AI analyzes your preferences against book themes, genres, and content</p>
            </div>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div>
              <h4>Personalized Matching</h4>
              <p>Each recommendation includes a personalized reason and rating</p>
            </div>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <div>
              <h4>Relevance Scoring</h4>
              <p>Books are ranked by how well they match your specific interests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Recommendations;