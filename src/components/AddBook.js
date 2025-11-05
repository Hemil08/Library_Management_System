import React, { useState } from 'react';

const AddBook = ({ onBookAdded, apiBase }) => {
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publication_year: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [generateAI, setGenerateAI] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) {
      alert('Please fill in required fields (Title, Author, ISBN)');
      return;
    }

    try {
      setLoading(true);
      
      const bookData = {
        ...bookForm,
        publication_year: bookForm.publication_year ? parseInt(bookForm.publication_year) : null,
      };

      // If generateAI is true and no description provided, let backend generate one
      if (generateAI && !bookForm.description.trim()) {
        delete bookData.description;
      }

      const response = await fetch(`${apiBase}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        setBookForm({
          title: '',
          author: '',
          isbn: '',
          genre: '',
          publication_year: '',
          description: ''
        });
        onBookAdded();
        alert('Book added successfully!');
      } else {
        const error = await response.json();
        alert(`Error adding book: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-book">
      <h2>➕ Add New Book</h2>
      
      <form onSubmit={handleSubmit} className="add-book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={bookForm.title}
            onChange={handleInputChange}
            required
            placeholder="Enter book title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={bookForm.author}
            onChange={handleInputChange}
            required
            placeholder="Enter author name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={bookForm.isbn}
              onChange={handleInputChange}
              required
              placeholder="978-0-123456-78-9"
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={bookForm.genre}
              onChange={handleInputChange}
              placeholder="Fiction, Science, etc."
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="publication_year">Publication Year</label>
          <input
            type="number"
            id="publication_year"
            name="publication_year"
            value={bookForm.publication_year}
            onChange={handleInputChange}
            placeholder="2023"
            min="1000"
            max="2030"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={bookForm.description}
            onChange={handleInputChange}
            placeholder="Enter book description (optional - AI can generate one)"
            rows="4"
          />
        </div>

        <div className="ai-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={generateAI}
              onChange={(e) => setGenerateAI(e.target.checked)}
            />
            <span className="checkmark"></span>
            🤖 Let AI generate description if empty
          </label>
          <p className="ai-help-text">
            If enabled and no description is provided, our AI will automatically generate a detailed description based on the book information.
          </p>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="add-btn"
          >
            {loading ? '🤖 Adding Book...' : '➕ Add Book'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setBookForm({
              title: '',
              author: '',
              isbn: '',
              genre: '',
              publication_year: '',
              description: ''
            })}
            className="clear-btn"
          >
            🗑️ Clear Form
          </button>
        </div>
      </form>

      <div className="add-book-tips">
        <h3>💡 Tips for Adding Books</h3>
        <ul>
          <li>📖 Make sure the ISBN is unique and correctly formatted</li>
          <li>🤖 Let AI generate descriptions for better book summaries</li>
          <li>🏷️ Use consistent genre naming for better categorization</li>
          <li>📅 Double-check the publication year</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBook;