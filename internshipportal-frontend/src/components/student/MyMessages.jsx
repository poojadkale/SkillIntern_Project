// src/components/student/MyMessages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  FiArrowLeft, FiSend, FiMessageSquare, FiInbox, FiSearch, 
  FiChevronLeft, FiMail, FiUser, FiStar, FiClock, FiCheckCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './MyMessages.css';

const MyMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    filterConversations();
  }, [activeFilter, searchTerm, conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations for the student
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contact/user/${user.id}/conversations`);
      console.log('Raw conversations:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Fetch full conversation details to determine who started it
        const enhancedConversations = await Promise.all(response.data.map(async (conv) => {
          // Fetch all messages in this conversation
          const messagesResponse = await api.get(`/contact/conversation/${conv.conversationId || conv.id}/messages`);
          const allMessages = messagesResponse.data || [];
          
          // Sort messages by date to find the first message
          const sortedMessages = [...allMessages].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          // First message in the conversation determines who started it
          const firstMessage = sortedMessages[0];
          
          // Determine conversation starter
          let startedBy = 'unknown';
          if (firstMessage) {
            if (firstMessage.userId === user.id) {
              startedBy = 'you';
            } else if (firstMessage.source === 'ADMIN_INITIATED' || firstMessage.isDirectMessage === true) {
              startedBy = 'admin';
            } else if (firstMessage.source === 'CONTACT_FORM') {
              startedBy = 'you';
            } else {
              startedBy = 'admin';
            }
          }
          
          return {
            ...conv,
            startedBy: startedBy,
            firstMessage: firstMessage,
            allMessages: sortedMessages,
            isAdminConversation: startedBy === 'admin',
            isMyConversation: startedBy === 'you',
            category: startedBy === 'admin' ? 'admin' : 'my'
          };
        }));
        
        console.log('Enhanced conversations:', enhancedConversations);
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

  // Filter conversations based on who started the conversation
  const filterConversations = () => {
    let filtered = [...conversations];
    
    // Apply category filter based on who started the conversation
    if (activeFilter === 'admin') {
      // Show conversations STARTED BY ADMIN
      filtered = filtered.filter(conv => conv.startedBy === 'admin');
    } else if (activeFilter === 'my') {
      // Show conversations STARTED BY ME (student)
      filtered = filtered.filter(conv => conv.startedBy === 'you');
    }
    // 'all' shows all conversations
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(conv => 
        conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredConversations(filtered);
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await api.get(`/contact/conversation/${conversationId}/messages`);
      console.log('Conversation messages:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const sortedMessages = [...response.data].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        setConversationMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileList(false);
    await fetchConversationMessages(conversation.conversationId || conversation.id);
  };

  // Handle sending a reply
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter your reply');
      return;
    }

    if (!selectedConversation) return;

    try {
      const replyData = {
        originalMessageId: selectedConversation.id,
        content: replyText,
        recipientId: 8,
        recipientRole: 'ADMIN',
        subject: selectedConversation.subject
      };
      
      console.log('Sending reply:', replyData);
      
      const response = await api.post(`/contact/user/${user.id}/reply`, replyData);
      
      if (response.data) {
        toast.success('Reply sent successfully');
        setReplyText('');
        
        await fetchConversationMessages(selectedConversation.conversationId || selectedConversation.id);
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.error || 'Failed to send reply');
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

  const getStatusBadge = (status) => {
    if (!status) return <span className="badge pending-badge"><FiClock size={10} /> Pending</span>;
    switch(status?.toUpperCase()) {
      case 'PENDING': return <span className="badge pending-badge"><FiClock size={10} /> Pending</span>;
      case 'REPLIED': return <span className="badge replied-badge"><FiCheckCircle size={10} /> Replied</span>;
      case 'RESOLVED': return <span className="badge resolved-badge"><FiStar size={10} /> Resolved</span>;
      default: return <span className="badge pending-badge"><FiClock size={10} /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <Link to="/student/dashboard" className="back-link">
          <FiArrowLeft /> Back to Dashboard
        </Link>
        <h1>My Messages</h1>
        <p>Chat with admin support team</p>
      </div>

      <div className="messages-layout">
        {/* Conversation List Sidebar */}
        <div className={`conversation-list ${showMobileList ? 'active' : ''}`}>
          {/* Search Bar */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              📋 All
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveFilter('admin')}
            >
              👤 Admin Started
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'my' ? 'active' : ''}`}
              onClick={() => setActiveFilter('my')}
            >
              👤 Me Started
            </button>
          </div>

          {/* Conversations List */}
          <div className="conversations">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <FiInbox size={48} />
                <p>No conversations found</p>
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="conv-avatar">
                    {conv.startedBy === 'admin' ? <FiUser /> : <FiMessageSquare />}
                  </div>
                  <div className="conv-details">
                    <div className="conv-header">
                      <span className="conv-subject">{conv.subject}</span>
                      <span className="conv-time">{formatConversationTime(conv.createdAt)}</span>
                    </div>
                    <div className="conv-preview">
                      <p>{conv.message?.substring(0, 50)}...</p>
                    </div>
                    <div className="conv-footer">
                      <span className={`message-type-badge ${conv.startedBy === 'admin' ? 'admin-type' : 'my-type'}`}>
                        {conv.startedBy === 'admin' ? 'Admin Started' : 'You Started'}
                      </span>
                      {getStatusBadge(conv.status)}
                      {conv.messageCount > 1 && (
                        <span className="message-count-badge">{conv.messageCount} msgs</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!showMobileList ? 'active' : ''}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="mobile-back" onClick={handleBackToList}>
                  ←
                </button>
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedConversation.startedBy === 'admin' ? <FiUser size={20} /> : <FiMessageSquare size={20} />}
                  </div>
                  <div className="chat-title">
                    <h3>{selectedConversation.subject}</h3>
                    <p>
                      {selectedConversation.startedBy === 'admin' ? 'Admin Started' : 'Started by You'} • {conversationMessages.length} messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
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
                    const isOwnMessage = msg.userId === user.id;
                    const showDate = index === 0 || new Date(msg.createdAt).toDateString() !== 
                      new Date(conversationMessages[index - 1]?.createdAt).toDateString();
                    
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
                        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                          <div className="message-bubble">
                            <div className="message-sender">
                              {!isOwnMessage && <strong>Admin</strong>}
                              {isOwnMessage && <strong>You</strong>}
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

              {/* Input Area */}
              <div className="chat-input">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message..."
                  rows="2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  title="Send Message"
                >
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
    </div>
  );
};

export default MyMessages;