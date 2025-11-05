import React, { useState } from 'react';

const BorrowManagement = ({ books, users, borrowRecords, onBorrowUpdate, apiBase }) => {
  const [activeTab, setActiveTab] = useState('borrow');
  const [borrowForm, setBorrowForm] = useState({
    book_id: '',
    user_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableBooks = books.filter(book => book.available);
  const filteredRecords = borrowRecords.filter(record => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      record.book.title.toLowerCase().includes(searchLower) ||
      record.user.name.toLowerCase().includes(searchLower) ||
      record.user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleBorrowBook = async (e) => {
    e.preventDefault();
    
    if (!borrowForm.book_id || !borrowForm.user_id) {
      alert('Please select both a book and a user');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrowForm),
      });

      if (response.ok) {
        setBorrowForm({ book_id: '', user_id: '' });
        onBorrowUpdate();
        alert('Book borrowed successfully!');
      } else {
        const error = await response.json();
        alert(`Error borrowing book: ${error.error}`);
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Error borrowing book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (recordId) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ record_id: recordId }),
        });

        if (response.ok) {
          onBorrowUpdate();
          alert('Book returned successfully!');
        } else {
          const error = await response.json();
          alert(`Error returning book: ${error.error}`);
        }
      } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysOverdue = (borrowDate) => {
    const borrowDateObj = new Date(borrowDate);
    const dueDate = new Date(borrowDateObj.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days loan period
    const today = new Date();
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="borrow-management">
      <div className="section-header">
        <h2>📖 Borrow & Return Management</h2>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'borrow' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrow')}
          >
            📤 Borrow Books
          </button>
          <button 
            className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            📋 Borrow Records
          </button>
        </div>
      </div>

      {activeTab === 'borrow' && (
        <div className="borrow-section">
          <div className="borrow-form-container">
            <h3>📤 Borrow a Book</h3>
            <form onSubmit={handleBorrowBook} className="borrow-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="book_id">Select Book *</label>
                  <select
                    id="book_id"
                    value={borrowForm.book_id}
                    onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}
                    required
                  >
                    <option value="">Choose an available book...</option>
                    {availableBooks.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} by {book.author} ({book.genre})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="user_id">Select User *</label>
                  <select
                    id="user_id"
                    value={borrowForm.user_id}
                    onChange={(e) => setBorrowForm({ ...borrowForm, user_id: e.target.value })}
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="borrow-btn">
                {loading ? '🔄 Processing...' : '📤 Borrow Book'}
              </button>
            </form>
          </div>

          <div className="availability-info">
            <h3>📊 Availability Summary</h3>
            <div className="availability-stats">
              <div className="stat-card">
                <span className="stat-number">{availableBooks.length}</span>
                <span className="stat-label">Available Books</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{books.length - availableBooks.length}</span>
                <span className="stat-label">Currently Borrowed</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Registered Users</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="records-section">
          <div className="records-header">
            <h3>📋 Borrow Records</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by book title, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="no-records">
              <p>📄 No borrow records found.</p>
            </div>
          ) : (
            <div className="records-list">
              {filteredRecords.map((record) => {
                const overdueDays = getDaysOverdue(record.borrow_date);
                const isOverdue = !record.returned && overdueDays > 0;
                
                return (
                  <div 
                    key={record.id} 
                    className={`record-card ${record.returned ? 'returned' : 'active'} ${isOverdue ? 'overdue' : ''}`}
                  >
                    <div className="record-info">
                      <div className="book-info">
                        <h4>{record.book.title}</h4>
                        <p>by {record.book.author}</p>
                        <span className="genre-tag">{record.book.genre}</span>
                      </div>

                      <div className="user-info">
                        <h5>👤 {record.user.name}</h5>
                        <p>{record.user.email}</p>
                      </div>

                      <div className="date-info">
                        <div className="date-item">
                          <span className="date-label">Borrowed:</span>
                          <span className="date-value">{formatDate(record.borrow_date)}</span>
                        </div>
                        
                        {record.returned && record.return_date && (
                          <div className="date-item">
                            <span className="date-label">Returned:</span>
                            <span className="date-value">{formatDate(record.return_date)}</span>
                          </div>
                        )}

                        {!record.returned && (
                          <div className="due-info">
                            <span className="date-label">Due Date:</span>
                            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                              {formatDate(new Date(new Date(record.borrow_date).getTime() + (14 * 24 * 60 * 60 * 1000)))}
                            </span>
                            {isOverdue && (
                              <span className="overdue-badge">
                                ⚠️ {overdueDays} days overdue
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="record-status">
                        <span className={`status-badge ${record.returned ? 'returned' : 'borrowed'}`}>
                          {record.returned ? '✅ Returned' : '📖 Borrowed'}
                        </span>
                      </div>
                    </div>

                    {!record.returned && (
                      <div className="record-actions">
                        <button
                          onClick={() => handleReturnBook(record.id)}
                          className="return-btn"
                          disabled={loading}
                        >
                          📥 Return Book
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="records-summary">
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-number">
                  {borrowRecords.filter(r => !r.returned).length}
                </span>
                <span className="summary-label">Currently Borrowed</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">
                  {borrowRecords.filter(r => r.returned).length}
                </span>
                <span className="summary-label">Total Returned</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">
                  {borrowRecords.filter(r => !r.returned && getDaysOverdue(r.borrow_date) > 0).length}
                </span>
                <span className="summary-label">Overdue</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowManagement;
