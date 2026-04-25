import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { 
  FiSearch, 
  FiBriefcase, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiTrash2, 
  FiEye, 
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiUsers,
  FiGlobe,
  FiMail,
  FiPhone,
  FiUser,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './InternshipsManagement.css';

const InternshipsManagement = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllInternships();
      setInternships(data);
      toast.success(`Loaded ${data.length} internships`);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async (companyId) => {
    if (!companyId) return;
    
    try {
      setLoadingCompany(true);
      // First try to get company details from admin service
      const company = await adminService.getCompanyById(companyId);
      console.log('Company details fetched:', company);
      
      // The company object might have nested user data
      const formattedCompany = {
        companyName: company.companyName || company.name || 'N/A',
        email: company.email || company.user?.email || 'N/A',
        phone: company.phone || company.user?.phone || 'N/A',
        contactPerson: company.user?.fullName || company.contactPerson || 'N/A',
        website: company.website || 'N/A',
        location: company.location || 'N/A',
        description: company.description || 'N/A'
      };
      
      setCompanyDetails(formattedCompany);
    } catch (error) {
      console.error('Error fetching company details:', error);
      // Fallback to internship's company data
      if (selectedInternship?.company) {
        const fallbackCompany = {
          companyName: selectedInternship.company.companyName || 'N/A',
          email: selectedInternship.company.email || 'N/A',
          phone: selectedInternship.company.phone || selectedInternship.company.user?.phone || 'N/A',
          contactPerson: selectedInternship.company.user?.fullName || 'N/A',
          website: selectedInternship.company.website || 'N/A',
          location: selectedInternship.company.location || 'N/A'
        };
        setCompanyDetails(fallbackCompany);
      } else {
        setCompanyDetails(null);
      }
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    if (window.confirm('Are you sure you want to delete this internship? This will also delete all applications for this internship.')) {
      try {
        await adminService.deleteInternship(internshipId);
        await fetchInternships();
        toast.success('Internship deleted successfully');
        setSelectedItems(selectedItems.filter(id => id !== internshipId));
      } catch (error) {
        console.error('Error deleting internship:', error);
        toast.error('Failed to delete internship');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('No internships selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} internship(s)? This action cannot be undone.`)) {
      try {
        for (const id of selectedItems) {
          await adminService.deleteInternship(id);
        }
        await fetchInternships();
        setSelectedItems([]);
        setSelectAll(false);
        toast.success(`${selectedItems.length} internship(s) deleted successfully`);
      } catch (error) {
        console.error('Error deleting internships:', error);
        toast.error('Failed to delete some internships');
      }
    }
  };

  const handleViewInternship = async (internship) => {
    setSelectedInternship(internship);
    setCompanyDetails(null);
    setShowModal(true);
    
    // Fetch company details if available
    if (internship.companyId || internship.company?.id) {
      const companyId = internship.companyId || internship.company?.id;
      await fetchCompanyDetails(companyId);
    } else if (internship.company) {
      // Use data from internship if no separate company fetch needed
      setCompanyDetails({
        companyName: internship.company.companyName || 'N/A',
        email: internship.company.email || 'N/A',
        phone: internship.company.phone || internship.company.user?.phone || 'N/A',
        contactPerson: internship.company.user?.fullName || 'N/A',
        website: internship.company.website || 'N/A',
        location: internship.company.location || 'N/A'
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInternship(null);
    setCompanyDetails(null);
  };

  const handleExport = () => {
    try {
      const exportData = filteredInternships.map(internship => ({
        ID: internship.id,
        Title: internship.title,
        Company: internship.company?.companyName || 'N/A',
        ContactPerson: internship.company?.user?.fullName || 'N/A',
        ContactEmail: internship.company?.email || 'N/A',
        ContactPhone: internship.company?.phone || internship.company?.user?.phone || 'N/A',
        Location: internship.location || 'Remote',
        WorkType: internship.type || 'Online',
        Duration: internship.duration || 'N/A',
        Stipend: internship.stipend ? `₹${internship.stipend}` : 'Unpaid',
        Openings: internship.numberOfOpenings || 0,
        PostedDate: new Date(internship.postedAt).toLocaleDateString(),
        ApplyBy: new Date(internship.endDate).toLocaleDateString(),
        Description: internship.description || 'N/A',
        RequiredSkills: internship.requiredSkills || 'N/A'
      }));

      const csv = convertToCSV(exportData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `internships_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    return csvRows.join('\n');
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInternships.map(i => i.id));
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

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'open') return matchesSearch && internship.status === 'OPEN';
    if (filterStatus === 'closed') return matchesSearch && internship.status === 'CLOSED';
    return matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInternships.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const stats = {
    total: internships.length,
    open: internships.filter(i => i.status === 'OPEN').length,
    closed: internships.filter(i => i.status === 'CLOSED').length
  };

  const formatStipend = (stipend) => {
    if (!stipend) return 'Unpaid';
    return `₹${stipend.toLocaleString()}/month`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading internships...</p>
      </div>
    );
  }

  return (
    <div className="internships-management">
      {/* Header Section */}
      <div className="page-header">
        <h2>Internships Management</h2>
        <div className="header-stats">
          <div className="stat-chip">
            <FiBriefcase />
            <span>{stats.total}</span> Total
          </div>
          <div className="stat-chip open">
            <span>{stats.open}</span> Open
          </div>
          <div className="stat-chip closed">
            <span>{stats.closed}</span> Closed
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search internships by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'open' ? 'active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'closed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('closed')}
          >
            Closed
          </button>
        </div>
        {selectedItems.length > 0 && (
          <button className="bulk-delete-btn" onClick={handleBulkDelete}>
            <FiTrash2 /> Delete Selected ({selectedItems.length})
          </button>
        )}
        <button className="export-btn" onClick={handleExport}>
          <FiDownload /> Export
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {filteredInternships.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No internships found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <table className="internships-table">
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
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Stipend</th>
                  <th>Openings</th>
                  <th>Posted Date</th>
                  <th>Apply By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(internship => (
                  <tr key={internship.id}>
                    <td className="checkbox-cell">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(internship.id)}
                        onChange={() => handleSelectItem(internship.id)}
                      />
                    </td>
                    <td className="id-cell">{internship.id}</td>
                    <td className="title-cell">{internship.title}</td>
                    <td>{internship.company?.companyName || 'N/A'}</td>
                    <td>
                      <span className="location-badge">
                        <FiMapPin className="location-icon" />
                        {internship.location || 'Remote'}
                      </span>
                    </td>
                    <td>
                      <span className="duration-badge">
                        <FiClock className="duration-icon" />
                        {internship.duration || 'N/A'}
                      </span>
                    </td>
                    <td className="stipend-cell">
                      <FiDollarSign className="stipend-icon" />
                      {formatStipend(internship.stipend)}
                    </td>
                    <td className="openings-cell">
                      <FiUsers className="openings-icon" />
                      {internship.numberOfOpenings || 0}
                    </td>
                    <td className="date-cell">
                      <FiCalendar className="date-icon" />
                      {formatDate(internship.postedAt)}
                    </td>
                    <td className="date-cell">
                      <FiCalendar className="date-icon" />
                      {formatDate(internship.endDate)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewInternship(internship)}
                        title="View Full Details"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteInternship(internship.id)}
                        title="Delete Internship"
                      >
                        <FiTrash2 />
                      </button>
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
          </>
        )}
      </div>

      {/* Full Details Modal with Improved Close Button */}
      {showModal && selectedInternship && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content full-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Internship Full Details</h3>
              <button 
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* Basic Information */}
              <div className="modal-section">
                <h4>Basic Information</h4>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Internship ID</span>
                    <span className="modal-info-value">{selectedInternship.id}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Title</span>
                    <span className="modal-info-value">{selectedInternship.title}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Status</span>
                    <span className={`modal-status-badge ${selectedInternship.status === 'OPEN' ? 'status-open' : 'status-closed'}`}>
                      {selectedInternship.status || 'OPEN'}
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Work Type</span>
                    <span className="work-type-badge">{selectedInternship.type || 'Online'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Location</span>
                    <span className="modal-info-value">{selectedInternship.location || 'Remote'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Duration</span>
                    <span className="modal-info-value">{selectedInternship.duration || 'Not specified'}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Stipend</span>
                    <span className="modal-info-value">{formatStipend(selectedInternship.stipend)}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Openings</span>
                    <span className="modal-info-value">{selectedInternship.numberOfOpenings || 0}</span>
                  </div>
                </div>
              </div>

              {/* Company Information with Fetched Details */}
              <div className="modal-section">
                <h4><FiBriefcase /> Company Information</h4>
                {loadingCompany ? (
                  <div className="loading-company">
                    <div className="small-spinner"></div>
                    <p>Loading company details...</p>
                  </div>
                ) : (
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <span className="modal-info-label">Company Name</span>
                      <span className="modal-info-value">
                        {companyDetails?.companyName || selectedInternship.company?.companyName || 'N/A'}
                      </span>
                    </div>
            
                    <div className="modal-info-item">
                      <span className="modal-info-label">
                        <FiMail className="info-icon" /> Email
                      </span>
                      <span className="modal-info-value">
                        {companyDetails?.email || selectedInternship.company?.email || 'N/A'}
                      </span>
                    </div>
                   
                    {companyDetails?.website && companyDetails.website !== 'N/A' && (
                      <div className="modal-info-item">
                        <span className="modal-info-label">
                          <FiGlobe className="info-icon" /> Website
                        </span>
                        <a href={companyDetails.website} target="_blank" rel="noopener noreferrer" className="modal-info-value link">
                          {companyDetails.website}
                        </a>
                      </div>
                    )}
                    {companyDetails?.location && companyDetails.location !== 'N/A' && (
                      <div className="modal-info-item">
                        <span className="modal-info-label">
                          <FiMapPin className="info-icon" /> Company Location
                        </span>
                        <span className="modal-info-value">{companyDetails.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedInternship.description && (
                <div className="modal-section">
                  <h4>Description</h4>
                  <p className="modal-description">{selectedInternship.description}</p>
                </div>
              )}

              {/* Required Skills */}
              {selectedInternship.requiredSkills && (
                <div className="modal-section">
                  <h4>Required Skills</h4>
                  <div className="modal-skills">
                    {selectedInternship.requiredSkills.split(',').map((skill, idx) => (
                      <span key={idx} className="modal-skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="modal-section">
                <h4>Important Dates</h4>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <span className="modal-info-label">Posted Date</span>
                    <span className="modal-info-value">{formatDate(selectedInternship.postedAt)}</span>
                  </div>
                  <div className="modal-info-item">
                    <span className="modal-info-label">Application Deadline</span>
                    <span className="modal-info-value">{formatDate(selectedInternship.endDate)}</span>
                  </div>
                  {selectedInternship.startDate && (
                    <div className="modal-info-item">
                      <span className="modal-info-label">Start Date</span>
                      <span className="modal-info-value">{formatDate(selectedInternship.startDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {selectedInternship.perks && (
                <div className="modal-section">
                  <h4>Perks & Benefits</h4>
                  <p className="modal-description">{selectedInternship.perks}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-footer-close-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipsManagement;