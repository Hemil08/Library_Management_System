import React, { useState } from 'react';

const UserManagement = ({ users, onUserUpdate, apiBase }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setUserForm({ name: '', email: '', phone: '' });
        setShowAddUser(false);
        onUserUpdate();
        alert('User added successfully!');
      } else {
        const error = await response.json();
        alert(`Error adding user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditForm({ ...user });
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/users/${editingUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingUser(null);
        onUserUpdate();
      } else {
        alert('Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${apiBase}/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onUserUpdate();
        } else {
          alert('Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>👥 User Management</h2>
        <button 
          onClick={() => setShowAddUser(!showAddUser)}
          className="add-user-btn"
        >
          {showAddUser ? '❌ Cancel' : '➕ Add New User'}
        </button>
      </div>

      {showAddUser && (
        <div className="add-user-form">
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? '🔄 Adding...' : '➕ Add User'}
              </button>
              <button 
                type="button" 
                onClick={() => setUserForm({ name: '', email: '', phone: '' })}
                className="clear-btn"
              >
                🗑️ Clear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-section">
        <h3>
          Registered Users 
          <span className="count">({users.length})</span>
        </h3>
        
        {users.length === 0 ? (
          <div className="no-users">
            <p>No users registered yet. Add some users to get started!</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                {editingUser === user.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                    />
                    <div className="edit-actions">
                      <button onClick={handleUpdateUser} className="save-btn">
                        💾 Save
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)} 
                        className="cancel-btn"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <p className="user-email">📧 {user.email}</p>
                      {user.phone && (
                        <p className="user-phone">📞 {user.phone}</p>
                      )}
                      <p className="user-joined">
                        📅 Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="user-actions">
                      <button 
                        onClick={() => handleEditUser(user)} 
                        className="edit-btn"
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="delete-btn"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="user-stats">
        <h3>📊 User Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length}
            </span>
            <span className="stat-label">New This Month</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{users.filter(u => u.phone).length}</span>
            <span className="stat-label">With Phone Numbers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;