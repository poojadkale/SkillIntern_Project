// src/components/admin/ContactMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiTrash2, FiCheckCircle, FiClock, FiSearch, FiUsers, FiBriefcase, FiSend, FiMessageSquare, FiInbox, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './ContactMessages.css';

const ContactMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [starterFilter, setStarterFilter] = useState('all');
  const [showMobileList, setShowMobileList] = useState(true);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState('STUDENT');
  const [directSubject, setDirectSubject] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const [userInfoCache, setUserInfoCache] = useState({});

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    filterConversations();
  }, [activeFilter, roleFilter, starterFilter, searchTerm, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserInfo = async (userId) => {
    if (!userId) return null;
    if (userInfoCache[userId]) return userInfoCache[userId];
    
    try {
      const user = users.find(u => u.originalId === userId);
      if (user) {
        setUserInfoCache(prev => ({ ...prev, [userId]: user }));
        return user;
      }
      
      const response = await api.get(`/users/${userId}`);
      if (response.data) {
        const userData = {
          name: response.data.fullName || response.data.name,
          role: response.data.role,
          email: response.data.email
        };
        setUserInfoCache(prev => ({ ...prev, [userId]: userData }));
        return userData;
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    }
    return null;
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contact/user/8/conversations`);
      console.log('Raw conversations:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const enhancedConversations = await Promise.all(response.data.map(async (conv) => {
          const messagesResponse = await api.get(`/contact/conversation/${conv.conversationId || conv.id}/messages`);
          const allMessages = messagesResponse.data || [];
          
          const sortedMessages = [...allMessages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          const firstMessage = sortedMessages[0];
          
          // DETERMINE WHO STARTED THE CONVERSATION
          let startedBy = 'unknown';
          
          if (firstMessage) {
            // Check if first message is from admin
            if (firstMessage.userId === 8) {
              startedBy = 'admin';
            } 
            // Check if first message has admin as sender
            else if (firstMessage.name === 'System Administrator' || firstMessage.email === 'admin@skillintern.com') {
              startedBy = 'admin';
            }
            // Check if first message source indicates admin
            else if (firstMessage.source === 'ADMIN_INITIATED' || firstMessage.isDirectMessage === true) {
              startedBy = 'admin';
            }
            // Otherwise it's from user
            else {
              startedBy = 'user';
            }
          }
          
          // Also check conversation source as fallback
          if (startedBy === 'unknown') {
            if (conv.source === 'ADMIN_INITIATED' || conv.isDirectMessage === true) {
              startedBy = 'admin';
            } else {
              startedBy = 'user';
            }
          }
          
          console.log(`Conversation ${conv.id} - First message from user ${firstMessage?.userId}, Started by: ${startedBy}`);
          
          let participantId = null;
          let participantName = 'User';
          let participantRole = 'USER';
          let participantEmail = '';
          
          // Find the other participant (not admin)
          if (firstMessage && firstMessage.userId === 8) {
            // Admin sent first message, recipient is the other party
            if (firstMessage.recipientId) {
              participantId = firstMessage.recipientId;
              participantRole = firstMessage.recipientRole;
              participantName = firstMessage.recipientName;
              participantEmail = firstMessage.recipientEmail;
            }
          }
          
          // If not found, check other messages
          if (!participantId) {
            const otherMessage = sortedMessages.find(m => m.userId !== 8);
            if (otherMessage) {
              participantId = otherMessage.userId;
              participantRole = otherMessage.recipientRole;
              participantName = otherMessage.name;
              participantEmail = otherMessage.email;
            }
          }
          
          // Fetch actual user info
          if (participantId) {
            const userInfo = await fetchUserInfo(participantId);
            if (userInfo && userInfo.name) {
              participantName = userInfo.name;
              participantRole = userInfo.role;
            }
          }
          
          const normalizedRole = participantRole ? participantRole.toUpperCase() : 
                                (participantId && participantId < 10 ? 'STUDENT' : 'COMPANY');
          
          return {
            ...conv,
            allMessages: sortedMessages,
            lastMessage: lastMessage,
            firstMessage: firstMessage,
            startedBy: startedBy,
            participantId: participantId,
            participantName: participantName || (normalizedRole === 'STUDENT' ? 'Student' : 'Company'),
            participantRole: normalizedRole === 'STUDENT' ? 'STUDENT' : 'COMPANY',
            participantEmail: participantEmail,
            lastMessageTime: lastMessage?.createdAt || conv.createdAt,
            lastMessageText: lastMessage?.message || conv.message
          };
        }));
        
        setConversations(enhancedConversations);
        if (enhancedConversations.length > 0 && !selectedConversation) {
          handleSelectConversation(enhancedConversations[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await api.get(`/contact/conversation/${conversationId}/messages`);
      
      if (response.data && Array.isArray(response.data)) {
        const sortedMessages = [...response.data].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        const enhancedMessages = await Promise.all(sortedMessages.map(async (msg) => {
          if (msg.userId !== 8 && msg.userId) {
            const userInfo = await fetchUserInfo(msg.userId);
            if (userInfo && userInfo.name) {
              return { 
                ...msg, 
                displayName: userInfo.name,
                displayRole: userInfo.role
              };
            }
          }
          if (msg.userId === 8) {
            return { 
              ...msg, 
              displayName: 'You (Admin)',
              displayRole: 'ADMIN'
            };
          }
          return { 
            ...msg, 
            displayName: msg.name || (msg.recipientRole === 'STUDENT' ? 'Student' : 'Company'),
            displayRole: msg.recipientRole || 'USER'
          };
        }));
        
        setConversationMessages(enhancedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/contact/admin/users-list');
      const usersList = response.data.data.all.map(user => ({
        ...user,
        uniqueId: `${user.role}_${user.id}`,
        originalId: user.id,
        originalRole: user.role,
        role: user.role,
        roleDisplay: user.role === 'STUDENT' ? 'Student' : 'Company'
      }));
      setUsers(usersList);
      
      usersList.forEach(user => {
        setUserInfoCache(prev => ({ 
          ...prev, 
          [user.originalId]: { name: user.name, role: user.role, email: user.email }
        }));
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterConversations = () => {
    let filtered = [...conversations];
    
    // Filter by status
    if (activeFilter === 'pending') {
      filtered = filtered.filter(conv => conv.status !== 'REPLIED');
    } else if (activeFilter === 'replied') {
      filtered = filtered.filter(conv => conv.status === 'REPLIED');
    }
    
    // Filter by participant role
    if (roleFilter === 'student') {
      filtered = filtered.filter(conv => conv.participantRole === 'STUDENT');
    } else if (roleFilter === 'company') {
      filtered = filtered.filter(conv => conv.participantRole === 'COMPANY');
    }
    
    // Filter by who started the conversation
    if (starterFilter === 'admin') {
      filtered = filtered.filter(conv => conv.startedBy === 'admin');
    } else if (starterFilter === 'user') {
      filtered = filtered.filter(conv => conv.startedBy === 'user');
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(conv => 
        conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    console.log(`Filtered conversations - Total: ${filtered.length}, Starter filter: ${starterFilter}`);
    setFilteredConversations(filtered);
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileList(false);
    await fetchConversationMessages(conversation.conversationId || conversation.id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter your reply');
      return;
    }

    if (!selectedConversation) return;

    try {
      const replyData = {
        response: replyText,
        status: 'REPLIED'
      };
      
      await api.post(`/contact/admin/messages/${selectedConversation.id}/reply`, replyData);
      
      toast.success('Reply sent successfully');
      setReplyText('');
      await fetchConversationMessages(selectedConversation.conversationId || selectedConversation.id);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleSendDirectMessage = async () => {
    if (!selectedUser) {
      toast.error('Please select a recipient');
      return;
    }
    if (!directSubject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!directMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const requestData = {
      recipientId: Number(selectedUser.originalId),
      recipientRole: selectedUser.role,
      subject: directSubject,
      message: directMessage
    };

    try {
      await api.post('/contact/admin/direct-message', requestData);
      toast.success(`Message sent to ${selectedUser.name} successfully`);
      setShowDirectMessageModal(false);
      setSelectedUser(null);
      setDirectSubject('');
      setDirectMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  };

  const handleDeleteConversation = async (id) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/contact/admin/messages/${id}`);
        toast.success('Conversation deleted successfully');
        fetchConversations();
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
      }
    }
  };

  const handleBackToList = () => {
    setShowMobileList(true);
    setSelectedConversation(null);
    setConversationMessages([]);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatConversationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  };

  const getStarterIcon = (startedBy) => {
    if (startedBy === 'admin') {
      return <FiUserCheck size={12} />;
    }
    return <FiUserPlus size={12} />;
  };

  const getStarterText = (startedBy) => {
    return startedBy === 'admin' ? 'Admin Started' : 'User Started';
  };

  const filteredUsers = users.filter(user =>
    (user.role === userType) &&
    (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="admin-messages-container">
      <div className="messages-header">
        <h1>Message Center</h1>
        <p>Manage conversations with students and companies</p>
      </div>

      <div className="action-buttons">
        <button 
          className="new-message-btn"
          onClick={() => setShowDirectMessageModal(true)}
        >
          <FiSend /> New Message
        </button>
      </div>

      <div className="messages-layout">
        {/* Conversation List Sidebar */}
        <div className={`conversation-list ${showMobileList ? 'active' : ''}`}>
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Who Started Filters - Top priority */}
          <div className="filter-section">
            <div className="filter-label">Started By</div>
            <div className="starter-filters">
              <button 
                className={`starter-filter-btn ${starterFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStarterFilter('all')}
              >
                📋 All
              </button>
              <button 
                className={`starter-filter-btn ${starterFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setStarterFilter('admin')}
              >
                👤 Admin Started
              </button>
              <button 
                className={`starter-filter-btn ${starterFilter === 'user' ? 'active' : ''}`}
                onClick={() => setStarterFilter('user')}
              >
                👥 User Started
              </button>
            </div>
          </div>

          {/* Role Filters */}
          <div className="filter-section">
            <div className="filter-label">User Type</div>
            <div className="role-filters">
              <button 
                className={`role-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                <FiMessageSquare /> All
              </button>
              <button 
                className={`role-filter-btn ${roleFilter === 'student' ? 'active' : ''}`}
                onClick={() => setRoleFilter('student')}
              >
                <FiUsers /> Students
              </button>
              <button 
                className={`role-filter-btn ${roleFilter === 'company' ? 'active' : ''}`}
                onClick={() => setRoleFilter('company')}
              >
                <FiBriefcase /> Companies
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="filter-section">
            <div className="filter-label">Status</div>
            <div className="status-filters">
              <button 
                className={`status-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                📋 All
              </button>
              <button 
                className={`status-filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                ⏳ Pending
              </button>
              <button 
                className={`status-filter-btn ${activeFilter === 'replied' ? 'active' : ''}`}
                onClick={() => setActiveFilter('replied')}
              >
                ✅ Replied
              </button>
            </div>
          </div>

          <div className="conversations">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <FiInbox size={48} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isStudent = conv.participantRole === 'STUDENT';
                const displayName = conv.participantName || (isStudent ? 'Student' : 'Company');
                const isAdminStarted = conv.startedBy === 'admin';
                
                return (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="conv-avatar">
                      {isStudent ? <FiUsers size={22} /> : <FiBriefcase size={22} />}
                    </div>
                    <div className="conv-details">
                      <div className="conv-header">
                        <span className="conv-name">{displayName}</span>
                        <span className="conv-time">{formatConversationTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="conv-subject">{conv.subject}</div>
                      <div className="conv-preview">
                        {conv.lastMessageText?.substring(0, 50)}...
                      </div>
                      <div className="conv-footer">
                        <span className={`starter-badge ${isAdminStarted ? 'admin-started' : 'user-started'}`}>
                          {getStarterIcon(conv.startedBy)} {getStarterText(conv.startedBy)}
                        </span>
                        <span className={`role-badge ${isStudent ? 'student-badge' : 'company-badge'}`}>
                          {isStudent ? 'Student' : 'Company'}
                        </span>
                        {conv.status !== 'REPLIED' && (
                          <span className="pending-badge-small">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area - Same as before */}
        <div className={`chat-area ${!showMobileList ? 'active' : ''}`}>
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <button className="mobile-back" onClick={handleBackToList}>←</button>
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedConversation.participantRole === 'STUDENT' ? <FiUsers size={28} /> : <FiBriefcase size={28} />}
                  </div>
                  <div className="chat-title">
                    <h3>{selectedConversation.participantName}</h3>
                    <p>
                      {selectedConversation.participantRole === 'STUDENT' ? 'Student' : 'Company'} • {selectedConversation.subject}
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="delete-chat-btn" onClick={() => handleDeleteConversation(selectedConversation.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="messages-list">
                {messagesLoading ? (
                  <div className="messages-loading">
                    <div className="small-spinner"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : conversationMessages.length === 0 ? (
                  <div className="no-messages">
                    <FiMail size={48} />
                    <p>No messages in this conversation</p>
                  </div>
                ) : (
                  conversationMessages.map((msg, index) => {
                    const isAdminMessage = msg.userId === 8;
                    const showDate = index === 0 || new Date(msg.createdAt).toDateString() !== 
                      new Date(conversationMessages[index - 1]?.createdAt).toDateString();
                    
                    let senderName;
                    if (isAdminMessage) {
                      senderName = 'You (Admin)';
                    } else {
                      senderName = msg.displayName || selectedConversation.participantName;
                    }
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="date-divider">
                            <span>{new Date(msg.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        )}
                        <div className={`message ${isAdminMessage ? 'admin-message' : 'user-message'}`}>
                          <div className="message-bubble">
                            <div className="message-sender">
                              <strong>{senderName}</strong>
                              <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
                            </div>
                            <div className="message-text">
                              <p>{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Type your reply to ${selectedConversation.participantName}...`}
                  rows="2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button className="send-btn" onClick={handleSendReply} disabled={!replyText.trim()}>
                  <FiSend />
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <FiMessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Direct Message Modal */}
      {showDirectMessageModal && (
        <div className="modal-overlay" onClick={() => setShowDirectMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="modal-close" onClick={() => setShowDirectMessageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Send to:</label>
                <div className="user-type-buttons">
                  <button 
                    className={`type-btn ${userType === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => { setUserType('STUDENT'); setSelectedUser(null); }}
                  >
                    <FiUsers /> Students
                  </button>
                  <button 
                    className={`type-btn ${userType === 'COMPANY' ? 'active' : ''}`}
                    onClick={() => { setUserType('COMPANY'); setSelectedUser(null); }}
                  >
                    <FiBriefcase /> Companies
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Search recipient:</label>
                <input
                  type="text"
                  placeholder={`Search ${userType === 'STUDENT' ? 'students' : 'companies'}...`}
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              <div className="users-list">
                {filteredUsers.map(user => (
                  <div
                    key={user.uniqueId}
                    className={`user-item ${selectedUser?.uniqueId === user.uniqueId ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-avatar">
                      {user.role === 'STUDENT' ? <FiUsers /> : <FiBriefcase />}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    {selectedUser?.uniqueId === user.uniqueId && <FiCheckCircle className="selected-icon" />}
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="no-users">No {userType === 'STUDENT' ? 'students' : 'companies'} found</div>
                )}
              </div>

              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={directSubject}
                  onChange={(e) => setDirectSubject(e.target.value)}
                  placeholder="Enter subject..."
                />
              </div>

              <div className="form-group">
                <label>Message:</label>
                <textarea
                  rows="4"
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  placeholder="Type your message..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDirectMessageModal(false)}>Cancel</button>
              <button 
                className="send-btn" 
                onClick={handleSendDirectMessage}
                disabled={!selectedUser || !directSubject.trim() || !directMessage.trim()}
              >
                <FiSend /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;