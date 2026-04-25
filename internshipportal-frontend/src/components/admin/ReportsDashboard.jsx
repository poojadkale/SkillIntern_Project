import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiBarChart2, 
  FiDownload, 
  FiRefreshCw,
  FiUsers,
  FiBriefcase,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const [reportType, setReportType] = useState('INTERNSHIPS');
  const [dateRange, setDateRange] = useState('MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Set default date range
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    setStartDate(monthAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const getDateRangeValues = () => {
    const today = new Date();
    let start = new Date();
    
    switch(dateRange) {
      case 'TODAY':
        start = today;
        break;
      case 'WEEK':
        start.setDate(today.getDate() - 7);
        break;
      case 'MONTH':
        start.setDate(today.getDate() - 30);
        break;
      case 'YEAR':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'CUSTOM':
        return { startDate, endDate };
      default:
        start.setDate(today.getDate() - 30);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let payload = {
        reportType: reportType,
        dateRange: dateRange,
        format: 'JSON'
      };
      
      if (dateRange === 'CUSTOM') {
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates');
          setLoading(false);
          return;
        }
        payload.startDate = startDate;
        payload.endDate = endDate;
      } else {
        const dates = getDateRangeValues();
        payload.startDate = dates.startDate;
        payload.endDate = dates.endDate;
      }
      
      const response = await api.post('/admin/reports/generate', payload);
      setReportData(response.data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      let payload = {
        reportType: reportType,
        dateRange: dateRange,
        format: 'CSV'
      };
      
      if (dateRange === 'CUSTOM') {
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates');
          setDownloading(false);
          return;
        }
        payload.startDate = startDate;
        payload.endDate = endDate;
      } else {
        const dates = getDateRangeValues();
        payload.startDate = dates.startDate;
        payload.endDate = dates.endDate;
      }
      
      const response = await api.post('/admin/reports/download', payload, {
        responseType: 'blob'
      });
      
      const filename = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;
    
    const summary = reportData.summary;
    return (
      <div className="summary-cards">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="summary-card">
            <div className="summary-card-title">{key}</div>
            <div className="summary-card-value">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailsTable = () => {
    if (!reportData?.details || reportData.details.length === 0) return null;
    
    const headers = Object.keys(reportData.details[0]);
    
    return (
      <div className="details-table-container">
        <h3>Detailed Report</h3>
        <div className="table-responsive">
          <table className="details-table">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.details.map((row, idx) => (
                <tr key={idx}>
                  {headers.map(header => (
                    <td key={header}>{row[header] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getReportTypeName = () => {
    const names = {
      'INTERNSHIPS': 'Internships Report',
      'APPLICATIONS': 'Applications Report',
      'USERS': 'Users Report',
      'COMPANIES': 'Companies Report',
      'STUDENTS': 'Students Report',
      'ACTIVITY': 'Activity Report'
    };
    return names[reportType] || reportType;
  };

  return (
    <div className="reports-dashboard">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and analyze system reports</p>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="INTERNSHIPS">Internships Report</option>
            <option value="APPLICATIONS">Applications Report</option>
            <option value="USERS">Users Report</option>
            <option value="COMPANIES">Companies Report</option>
            <option value="STUDENTS">Students Report</option>
            <option value="ACTIVITY">Activity Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
            <option value="YEAR">Last 12 Months</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>

        {dateRange === 'CUSTOM' && (
          <div className="control-group">
            <label>Custom Range</label>
            <div className="date-range">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        )}

        <div className="control-group">
          <label>Actions</label>
          <div className="action-buttons">
            <button onClick={generateReport} disabled={loading} className="generate-btn">
              <FiRefreshCw className={loading ? 'spin' : ''} /> Generate Report
            </button>
            <button onClick={downloadCSV} disabled={downloading} className="download-btn">
              <FiDownload /> Download CSV
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      )}

      {reportData && !loading && (
        <div className="report-results">
          <div className="report-header-info">
            <h2>{getReportTypeName()}</h2>
            <div className="report-meta">
              <span>📅 Generated: {new Date(reportData.generatedAt).toLocaleString()}</span>
              <span>👤 By: {reportData.generatedBy}</span>
              <span>📆 Period: {reportData.dateRange}</span>
            </div>
          </div>

          {renderSummaryCards()}
          {renderDetailsTable()}
        </div>
      )}

      {!reportData && !loading && (
        <div className="no-data">
          <FiBarChart2 className="no-data-icon" />
          <h3>No Report Generated</h3>
          <p>Select report parameters and click "Generate Report" to view analytics</p>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;