import React, { useState } from 'react';

const BookList = ({ books, onBookUpdate, apiBase }) => {
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSummary, setBookSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleEdit = (book) => {
    setEditingBook(book.id);
    setEditForm({ ...book });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${apiBase}/books/${editingBook}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingBook(null);
        onBookUpdate();
      } else {
        alert('Error updating book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book');
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`${apiBase}/books/${bookId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onBookUpdate();
        } else {
          alert('Error deleting book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
      }
    }
  };

  const generateSummary = async (bookId) => {
    try {
      setLoadingSummary(true);
      const response = await fetch(`${apiBase}/book/${bookId}/summary`);
      const data = await response.json();
      setBookSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setBookSummary('Error generating summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setBookSummary('');
  };

  return (
    <div className="book-list">
      <h2>📚 Book Library</h2>
      
      {books.length === 0 ? (
        <p>No books available. Add some books to get started!</p>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              {editingBook === book.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editForm.author || ''}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    placeholder="Author"
                  />
                  <input
                    type="text"
                    value={editForm.genre || ''}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                    placeholder="Genre"
                  />
                  <input
                    type="number"
                    value={editForm.publication_year || ''}
                    onChange={(e) => setEditForm({ ...editForm, publication_year: parseInt(e.target.value) })}
                    placeholder="Year"
                  />
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSave} className="save-btn">💾 Save</button>
                    <button onClick={() => setEditingBook(null)} className="cancel-btn">❌ Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">by {book.author}</p>
                  <p className="genre">{book.genre}</p>
                  <p className="year">{book.publication_year}</p>
                  <p className={`availability ${book.available ? 'available' : 'borrowed'}`}>
                    {book.available ? '✅ Available' : '📖 Borrowed'}
                  </p>
                  
                  <div className="book-actions">
                    <button onClick={() => handleViewDetails(book)} className="view-btn">
                      👁️ View Details
                    </button>
                    <button onClick={() => handleEdit(book)} className="edit-btn">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(book.id)} className="delete-btn">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBook.title}</h2>
              <button onClick={() => setSelectedBook(null)} className="close-btn">❌</button>
            </div>
            
            <div className="modal-body">
              <div className="book-details">
                <p><strong>Author:</strong> {selectedBook.author}</p>
                <p><strong>ISBN:</strong> {selectedBook.isbn}</p>
                <p><strong>Genre:</strong> {selectedBook.genre}</p>
                <p><strong>Publication Year:</strong> {selectedBook.publication_year}</p>
                <p><strong>Status:</strong> {selectedBook.available ? 'Available' : 'Borrowed'}</p>
                
                {selectedBook.description && (
                  <div className="description">
                    <strong>Description:</strong>
                    <p>{selectedBook.description}</p>
                  </div>
                )}
              </div>

              <div className="ai-summary-section">
                <button 
                  onClick={() => generateSummary(selectedBook.id)}
                  disabled={loadingSummary}
                  className="generate-summary-btn"
                >
                  {loadingSummary ? '🤖 Generating...' : '🤖 Generate AI Summary'}
                </button>
                
                {bookSummary && (
                  <div className="ai-summary">
                    <h4>🤖 AI-Generated Summary:</h4>
                    <div className="summary-content">
                      {bookSummary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;