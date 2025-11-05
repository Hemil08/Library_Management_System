import React, { useState } from 'react';

const SearchBooks = ({ apiBase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      
      const response = await fetch(`${apiBase}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        alert('Error searching books');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      alert('Error searching books');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="search-books">
      <h2>🔍 Smart Book Search</h2>
      
      <div className="search-info">
        <p>🤖 Our AI-powered search understands context, themes, and concepts beyond just keywords!</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, genre, themes, or describe what you're looking for..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>
      </form>

      {searchQuery && (
        <div className="search-actions">
          <button onClick={clearSearch} className="clear-search-btn">
            🗑️ Clear Search
          </button>
        </div>
      )}

      {loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>🤖 AI is analyzing your search query...</p>
        </div>
      )}

      {hasSearched && !loading && (
        <div className="search-results">
          <h3>
            Search Results for "{searchQuery}" 
            <span className="result-count">({searchResults.length} found)</span>
          </h3>
          
          {searchResults.length === 0 ? (
            <div className="no-results">
              <p>😔 No books found matching your search.</p>
              <div className="search-tips">
                <h4>💡 Search Tips:</h4>
                <ul>
                  <li>Try different keywords or synonyms</li>
                  <li>Search by genre, themes, or concepts</li>
                  <li>Use partial author names or book titles</li>
                  <li>Describe the type of book you're looking for</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="results-grid">
              {searchResults.map((book, index) => (
                <div key={book.id} className="search-result-card">
                  <div className="result-rank">#{index + 1}</div>
                  
                  <div className="result-content">
                    <h4 
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(book.title, searchQuery)
                      }}
                    />
                    
                    <p className="result-author">
                      by <span 
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(book.author, searchQuery)
                        }}
                      />
                    </p>
                    
                    {book.genre && (
                      <p className="result-genre">
                        Genre: <span 
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(book.genre, searchQuery)
                          }}
                        />
                      </p>
                    )}
                    
                    <p className="result-year">Published: {book.publication_year}</p>
                    
                    <p className={`result-availability ${book.available ? 'available' : 'borrowed'}`}>
                      {book.available ? '✅ Available' : '📖 Currently Borrowed'}
                    </p>
                    
                    {book.description && (
                      <div className="result-description">
                        <p 
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(
                              book.description.length > 150 
                                ? book.description.substring(0, 150) + '...'
                                : book.description,
                              searchQuery
                            )
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="search-examples">
        <h3>🎯 Example Searches</h3>
        <div className="example-queries">
          <button 
            onClick={() => setSearchQuery('mystery detective novels')}
            className="example-btn"
          >
            "mystery detective novels"
          </button>
          <button 
            onClick={() => setSearchQuery('science fiction space exploration')}
            className="example-btn"
          >
            "science fiction space exploration"
          </button>
          <button 
            onClick={() => setSearchQuery('classic literature 19th century')}
            className="example-btn"
          >
            "classic literature 19th century"
          </button>
          <button 
            onClick={() => setSearchQuery('books about friendship and adventure')}
            className="example-btn"
          >
            "books about friendship and adventure"
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBooks;