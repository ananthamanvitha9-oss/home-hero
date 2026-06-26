import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export function ChatPanel({ bookingId, token, socket, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch message history
  useEffect(() => {
    if (!bookingId || !token) return;

    const timer = setTimeout(() => {
      setLoading(true);
    }, 0);

    let active = true;

    api.getBookingMessages(bookingId, token)
      .then(res => {
        if (active && res.success && res.messages) {
          setMessages(res.messages);
        }
      })
      .catch(err => console.error('[ChatPanel] History fetch error:', err))
      .finally(() => {
        if (active) {
          setLoading(false);
          // Wait briefly for DOM render before scrolling
          setTimeout(scrollToBottom, 50);
        }
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [bookingId, token]);

  // 2. Setup socket listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Scroll to bottom shortly after list updates
      setTimeout(scrollToBottom, 50);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

  // 3. Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !bookingId) return;

    socket.emit('send_message', {
      bookingId,
      message: inputText.trim()
    });

    setInputText('');
  };

  return (
    <div className="chat-panel-sidebar glass-card" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '380px',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.95)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
      borderLeft: '1px solid var(--border-slate)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      backdropFilter: 'blur(16px)',
      transition: 'transform 0.3s ease-in-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-slate)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>💬</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontFamily: 'var(--font-outfit)' }}>Service Chat</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--success-mint)' }}>● Real-time Telemetry Enabled</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-gray)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages list */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-gray)', fontSize: '0.9rem' }}>Loading messages history...</div>}
        
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-gray)', fontSize: '0.85rem', marginTop: '40px' }}>
            No messages yet. Send a message to coordinate coordinates, tools, or schedule adjustments.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUser?.id;
          return (
            <div 
              key={msg._id || idx} 
              style={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwn ? 'flex-end' : 'flex-start'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '4px', padding: '0 4px' }}>
                {isOwn ? 'You' : msg.senderName}
              </span>
              <div style={{
                background: isOwn ? 'var(--primary-indigo)' : 'rgba(255,255,255,0.08)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '12px',
                borderTopRightRadius: isOwn ? '2px' : '12px',
                borderTopLeftRadius: isOwn ? '12px' : '2px',
                fontSize: '0.9rem',
                wordBreak: 'break-word',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSendMessage}
        style={{
          padding: '20px',
          borderTop: '1px solid var(--border-slate)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '10px'
        }}
      >
        <input 
          type="text"
          placeholder="Type message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-slate)',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit"
          className="book-now-btn"
          style={{
            width: 'auto',
            padding: '0 20px',
            borderRadius: '8px',
            background: 'var(--primary-indigo)',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
export default ChatPanel;
