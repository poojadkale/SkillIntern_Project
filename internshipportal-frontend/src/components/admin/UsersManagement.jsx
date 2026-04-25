import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { 
  FiSearch, 
  FiTrash2, 
  FiUser, 
  FiBriefcase,
  FiMail, 
  FiPhone, 
  FiAlertCircle,
  FiEye,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './UsersManagement.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      console.log('Users data:', data);
      
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
        setSelectedItems(selectedItems.filter(id => id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} user(s)?`)) {
      try {
        for (const id of selectedItems) {
          await adminService.deleteUser(id);
        }
        toast.success(`${selectedItems.length} user(s) deleted successfully`);
        fetchUsers();
        setSelectedItems([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error deleting users:', error);
        toast.error('Failed to delete some users');
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'ADMIN': return 'role-admin';
      case 'COMPANY': return 'role-company';
      case 'STUDENT': return 'role-student';
      default: return '';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <FiAlertCircle />;
      case 'COMPANY': return <FiBriefcase />;
      case 'STUDENT': return <FiUser />;
      default: return <FiUser />;
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    company: users.filter(u => u.role === 'COMPANY').length,
    student: users.filter(u => u.role === 'STUDENT').length
  };

  const exportToCSV = () => {
    const exportData = filteredUsers.map(user => ({
      ID: user.id,
      Name: user.fullName,
      Email: user.email,
      Phone: user.phone || 'N/A',
      Role: user.role
    }));

    const headers = Object.keys(exportData[0]);
    const csv = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Export completed');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Users Management</h2>
          <p className="subtitle">Manage all users across the platform</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <FiUser /> <span>{stats.total}</span> Total
          </div>
          <div className="stat-badge admin">
            <FiAlertCircle /> <span>{stats.admin}</span> Admin
          </div>
          <div className="stat-badge company">
            <FiBriefcase /> <span>{stats.company}</span> Companies
          </div>
          <div className="stat-badge student">
            <FiUser /> <span>{stats.student}</span> Students
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="COMPANY">Company</option>
            <option value="STUDENT">Student</option>
          </select>
          
          {selectedItems.length > 0 && (
            <button className="bulk-delete-btn" onClick={handleBulkDelete}>
              <FiTrash2 /> Delete Selected ({selectedItems.length})
            </button>
          )}
          <button className="export-btn" onClick={exportToCSV}>
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
             </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td className="checkbox-cell">
                  {user.role !== 'ADMIN' && (
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(user.id)}
                      onChange={() => handleSelectItem(user.id)}
                    />
                  )}
                </td>
                <td className="id-cell">{user.id}</td>
                <td className="name-cell">{user.fullName}</td>
                <td className="email-cell">{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleViewUser(user)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  {user.role !== 'ADMIN' && (
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Previous
            </button>
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button 
              className="page-btn" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal with Improved Close Button */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '24px',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  lineHeight: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4>Personal Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{selectedUser.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role</span>
                    <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#64748b',
                  transition: 'all 0.2s',
                  marginTop: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;