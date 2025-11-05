from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure Gemini AI - SECURITY WARNING: Use environment variable instead!
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')  # Use environment variable
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY environment variable not set!")
    print("Set it using: export GEMINI_API_KEY=your_api_key_here")
    # Fallback to hardcoded key (NOT RECOMMENDED for production)
    GEMINI_API_KEY = "AIzaSyD5x6qDThBLZ6KFsKhAgkS6tn-hodZ2ixk"

genai.configure(api_key=GEMINI_API_KEY)
# Updated model name - using the latest stable Gemini 2.5 Flash
model = genai.GenerativeModel('gemini-2.5-flash')

# Database Models
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    genre = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    description = db.Column(db.Text)
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'genre': self.genre,
            'publication_year': self.publication_year,
            'description': self.description,
            'available': self.available,
            'created_at': self.created_at.isoformat()
        }
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }

class BorrowRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    borrow_date = db.Column(db.DateTime, default=datetime.utcnow)
    return_date = db.Column(db.DateTime)
    returned = db.Column(db.Boolean, default=False)
    
    book = db.relationship('Book', backref='borrow_records')
    user = db.relationship('User', backref='borrow_records')
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'user_id': self.user_id,
            'borrow_date': self.borrow_date.isoformat(),
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'returned': self.returned,
            'book': self.book.to_dict(),
            'user': self.user.to_dict()
        }

# AI Helper Functions with improved error handling
def get_ai_book_recommendation(user_preferences, available_books):
    """Get AI-powered book recommendations based on user preferences."""
    try:
        # Limit books to prevent token limit issues
        books_subset = available_books[:20]  # O 
        prompt = f"""
        Based on the user preferences: {user_preferences}
        
        And these available books: {json.dumps([book.to_dict() for book in books_subset], default=str)}
        
        Recommend the top 3 books that would best match the user's preferences. 
        Consider genre, author style, themes, and publication year.
        
        Return response in JSON format:
        {{
            "recommendations": [
                {{
                    "book_id": int,
                    "reason": "string explaining why this book is recommended",
                    "rating": int (1-10)
                }}
            ]
        }}
        """
        
        response = model.generate_content(prompt)
        # Clean up the response text to extract JSON
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
            
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"error": f"AI service error: {str(e)}"}

def generate_book_summary(book_data):
    """ """
    try:
        prompt = f"""
        Create a comprehensive summary for this book:
        Title: {book_data['title']}
        Author: {book_data['author']}
        Genre: {book_data.get('genre', 'Unknown')}
        Description: {book_data.get('description', 'No description available')}
        
        Generate a detailed summary that includes:
        1. Main themes
        2. Target audience
        3. Key takeaways
        4. Similar books users might enjoy
        
        Keep it engaging and informative.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def smart_search_books(query, books):
    """Perform AI-powered smart search of books."""
    try:
        # Limit books to prevent token limit issues
        books_subset = books[:30]  # Only use first 30 books
        
        prompt = f"""
        Search query: "{query}"
        
        Available books: {json.dumps([book.to_dict() for book in books_subset], default=str)}
        
        Find books that match the search query. Consider:
        - Title matches
        - Author matches  
        - Genre matches
        - Description/theme matches
        - Similar concepts or synonyms
        
        Return book IDs that match, ranked by relevance (most relevant first).
        Return as JSON: {{"book_ids": [int, int, ...]}}
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]
            
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        return {"book_ids": []}
    except Exception as e:
        return {"book_ids": []}

# API Routes
@app.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([book.to_dict() for book in books])

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json()
    
    # Generate AI description if not provided
    if not data.get('description'):
        data['description'] = generate_book_summary(data)
    
    book = Book(
        title=data['title'],
        author=data['author'],
        isbn=data['isbn'],
        genre=data.get('genre'),
        publication_year=data.get('publication_year'),
        description=data['description']
    )
    
    try:
        db.session.add(book)
        db.session.commit()
        return jsonify(book.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    book.title = data.get('title', book.title)
    book.author = data.get('author', book.author)
    book.isbn = data.get('isbn', book.isbn)
    book.genre = data.get('genre', book.genre)
    book.publication_year = data.get('publication_year', book.publication_year)
    book.description = data.get('description', book.description)
    book.available = data.get('available', book.available)
    
    try:
        db.session.commit()
        return jsonify(book.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    try:
        db.session.delete(book)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/search', methods=['POST'])
def search_books():
    data = request.get_json()
    query = data.get('query', '')
    
    all_books = Book.query.all()
    
    if not query:
        return jsonify([book.to_dict() for book in all_books])
    
    # Use AI for smart search
    ai_results = smart_search_books(query, all_books)
    book_ids = ai_results.get('book_ids', [])
    
    # Get books in order of AI ranking
    ordered_books = []
    for book_id in book_ids:
        book = Book.query.get(book_id)
        if book:
            ordered_books.append(book)
    
    return jsonify([book.to_dict() for book in ordered_books])

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    preferences = data.get('preferences', '')
    
    available_books = Book.query.filter_by(available=True).all()
    
    if not available_books:
        return jsonify({'recommendations': []})
    
    ai_recommendations = get_ai_book_recommendation(preferences, available_books)
    
    if 'error' in ai_recommendations:
        return jsonify({'error': ai_recommendations['error']}), 500
    
    # Enrich recommendations with book data
    enriched_recommendations = []
    for rec in ai_recommendations.get('recommendations', []):
        book = Book.query.get(rec['book_id'])
        if book:
            enriched_recommendations.append({
                **rec,
                'book': book.to_dict()
            })
    
    return jsonify({'recommendations': enriched_recommendations})

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone')
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/borrow', methods=['POST'])
def borrow_book():
    data = request.get_json()
    book_id = data['book_id']
    user_id = data['user_id']
    
    book = Book.query.get_or_404(book_id)
    user = User.query.get_or_404(user_id)
    
    if not book.available:
        return jsonify({'error': 'Book is not available'}), 400
    
    borrow_record = BorrowRecord(book_id=book_id, user_id=user_id)
    book.available = False
    
    try:
        db.session.add(borrow_record)
        db.session.commit()
        return jsonify(borrow_record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/return', methods=['POST'])
def return_book():
    data = request.get_json()
    record_id = data['record_id']
    
    record = BorrowRecord.query.get_or_404(record_id)
    
    if record.returned:
        return jsonify({'error': 'Book already returned'}), 400
    
    record.returned = True
    record.return_date = datetime.utcnow()
    record.book.available = True
    
    try:
        db.session.commit()
        return jsonify(record.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/borrow-records', methods=['GET'])
def get_borrow_records():
    records = BorrowRecord.query.all()
    return jsonify([record.to_dict() for record in records])

@app.route('/api/book/<int:book_id>/summary', methods=['GET'])
def get_book_summary(book_id):
    book = Book.query.get_or_404(book_id)
    summary = generate_book_summary(book.to_dict())
    return jsonify({'summary': summary})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_books = Book.query.count()
    available_books = Book.query.filter_by(available=True).count()
    borrowed_books = Book.query.filter_by(available=False).count()
    total_users = User.query.count()
    active_borrows = BorrowRecord.query.filter_by(returned=False).count()
    
    return jsonify({
        'total_books': total_books,
        'available_books': available_books,
        'borrowed_books': borrowed_books,
        'total_users': total_users,
        'active_borrows': active_borrows
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API and AI service status."""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        
        # Test AI service
        test_response = model.generate_content("Hello, respond with 'AI service working'")
        ai_working = "working" in test_response.text.lower()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'ai_service': 'working' if ai_working else 'error',
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Add sample data if database is empty
        if Book.query.count() == 0:
            sample_books = [
                Book(title="The Great Gatsby", author="F. Scott Fitzgerald", 
                     isbn="978-0-7432-7356-5", genre="Classic Fiction", 
                     publication_year=1925,
                     description="A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream."),
                Book(title="To Kill a Mockingbird", author="Harper Lee", 
                     isbn="978-0-06-112008-4", genre="Classic Fiction", 
                     publication_year=1960,
                     description="A powerful story of racial injustice and childhood innocence in the American South."),
                Book(title="1984", author="George Orwell", 
                     isbn="978-0-452-28423-4", genre="Dystopian Fiction", 
                     publication_year=1949,
                     description="A dystopian social science fiction novel about totalitarianism and surveillance."),
                Book(title="Pride and Prejudice", author="Jane Austen", 
                     isbn="978-0-14-143951-8", genre="Romance", 
                     publication_year=1813,
                     description="A romantic novel that critiques the British landed gentry at the end of the 18th century."),
                Book(title="The Catcher in the Rye", author="J.D. Salinger", 
                     isbn="978-0-316-76948-0", genre="Coming-of-age Fiction", 
                     publication_year=1951,
                     description="A controversial novel about teenage rebellion and alienation in post-war America."),
            ]
            
            for book in sample_books:
                db.session.add(book)
            
            # Add sample user
            sample_user = User(name="John Doe", email="john.doe@example.com", phone="123-456-7890")
            db.session.add(sample_user)
            
            db.session.commit()
            print("Sample data added successfully!")
    
    print("Starting Flask Library Management System...")
    print("API endpoints available at http://localhost:5000/api/")
    print("Health check: http://localhost:5000/api/health")
    app.run(debug=True)