import React, { useState, useEffect } from 'react';

const Dashboard = ({ apiBase }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>📊 Library Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.total_books || 0}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.available_books || 0}</h3>
            <p>Available Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{stats.borrowed_books || 0}</h3>
            <p>Borrowed Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total_users || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.active_borrows || 0}</h3>
            <p>Active Borrows</p>
          </div>
        </div>
      </div>

      <div className="dashboard-features">
        <h3>🤖 AI Features Available</h3>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <div>
              <h4>Smart Search</h4>
              <p>AI-powered book search that understands context and themes</p>
            </div>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <div>
              <h4>Personalized Recommendations</h4>
              <p>Get book suggestions based on your preferences using AI</p>
            </div>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <div>
              <h4>Auto-Generated Summaries</h4>
              <p>AI creates detailed book summaries and descriptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;