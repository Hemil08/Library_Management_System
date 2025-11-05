import React, { useState, useEffect } from 'react';
import Dashboard from './components/dashboard';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import SearchBooks from './components/SearchBooks';
import Recommendations from './components/Recommendations';
import UserManagement from './components/UserManagement';
import BorrowManagement from './components/BorrowManagement';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const API_BASE = 'http://localhost:5000/api';

  // Fetch data functions
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/borrow-records`);
      const data = await response.json();
      setBorrowRecords(data);
    } catch (error) {
      console.error('Error fetching borrow records:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBooks();
    fetchUsers();
    fetchBorrowRecords();
  }, []);

  const handleBookUpdate = () => {
    fetchBooks();
    fetchBorrowRecords();
  };

  const handleUserUpdate = () => {
    fetchUsers();
    fetchBorrowRecords();
  };

  const handleBorrowUpdate = () => {
    fetchBooks();
    fetchBorrowRecords();
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'books', label: '📚 Books', icon: '📚' },
    { id: 'add-book', label: '➕ Add Book', icon: '➕' },
    { id: 'search', label: '🔍 Search', icon: '🔍' },
    { id: 'recommendations', label: '🤖 Recommendations', icon: '🤖' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'borrow', label: '📖 Borrow/Return', icon: '📖' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard apiBase={API_BASE} />;
      case 'books':
        return (
          <BookList 
            books={books} 
            onBookUpdate={handleBookUpdate} 
            apiBase={API_BASE}
          />
        );
      case 'add-book':
        return (
          <AddBook 
            onBookAdded={handleBookUpdate} 
            apiBase={API_BASE}
          />
        );
      case 'search':
        return <SearchBooks apiBase={API_BASE} />;
      case 'recommendations':
        return <Recommendations apiBase={API_BASE} />;
      case 'users':
        return (
          <UserManagement 
            users={users}
            onUserUpdate={handleUserUpdate}
            apiBase={API_BASE}
          />
        );
      case 'borrow':
        return (
          <BorrowManagement 
            books={books}
            users={users}
            borrowRecords={borrowRecords}
            onBorrowUpdate={handleBorrowUpdate}
            apiBase={API_BASE}
          />
        );
      default:
        return <Dashboard apiBase={API_BASE} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 AI Library Management System</h1>
          <p>Intelligent book management with AI-powered recommendations and search</p>
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        <div className="main-content">
          {loading && activeTab === 'books' ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading books...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2024 AI Library Management System | Powered by AI</p>
          <div className="footer-features">
            <span>🤖 AI Recommendations</span>
            <span>🔍 Smart Search</span>
            <span>📊 Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;