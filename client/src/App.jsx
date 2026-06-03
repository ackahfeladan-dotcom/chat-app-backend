import { useState, useEffect, useRef } from 'react';

import io from 'socket.io-client';
import './App.css';
import UniversalProfile from './UniversalProfile';

// Establishes the real-time websocket link to our backend
const socket = io.connect('https://chat-app-backend-osyn.onrender.com');

function App() {
const handleSearchSubmit = () => {
  if (searchQuery.trim() !== '') {
    // Send the query directly through your existing socket link
    socket.emit("meta_ai_query", { query: searchQuery });
    setSearchQuery(''); // Clear the input bar safely
  }
};
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [contactInput, setContactInput] = useState('');
  const [contacts, setContacts] = useState(["Meta AI"]);
  
  const [currentRoomId, setCurrentRoomId] =useState("Meta AI"); // Default to Meta AI chat on login
  const messagesEndRef = useRef(null);
  const [typingStatus, setTypingStatus] = useState("");
  const [onlineList, setOnlineList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // Tracks active bottom navigation tab
  const [searchQuery, setSearchQuery] = useState(''); // Handles list filtering query

  console.log(onlineList)
  // --- UNIVERSAL PROFILE STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [myUniversalProfile, setMyUniversalProfile] = useState(() => {
    const savedProfile = localStorage.getItem('universal_chat_profile');
    if (savedProfile) {
      try { return JSON.parse(savedProfile); } catch (e) { console.error(e); }
    }
    return {
      displayName: 'Anonymous User',
      bio: 'Hey there! I am using this chat app.',
      statusEmoji: '💬'
    };
  });
  // ---------------------------------

useEffect(() => {
    // 1. Listen for the backend confirming a chat link is active
    const handleChatJoined = ({ roomId, target }) => {
      console.log("Chat linked for room ID:", roomId);
      setCurrentRoomId(roomId);
      setActiveChat(target);
      
      setContacts((prev) => {
        if (!prev.includes(target)) {
          return [...prev, target];
        }
        return prev;
      });
    };

    // 2. Handle Meta AI responses
    const handleMetaAIResponse = (data) => {
      const aiMessage = {
        id: `meta-ai-${Date.now()}`,
        room: "Meta AI",
        author: "Meta AI",
        message: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessageList((list) => [...list, aiMessage]);
    };

    // 3. Handle normal user-to-user messages
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    // 4. Listen for incoming emoji reactions from your server
    const handleReceiveReaction = ({ messageId, reactorName, emoji }) => {
      setMessageList((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === messageId || msg.id === messageId) {
            const currentReactions = msg.reactions || {};
            currentReactions[reactorName] = emoji;
            return { ...msg, reactions: { ...currentReactions } };
          }
          return msg;
        })
      );
    };

 
socket.on("chat_joined", (data) => {
    if (typeof handleChatJoined === 'function') handleChatJoined(data);
});
socket.on("meta_ai_response", (data) => {
    if (typeof handleMetaAIResponse === 'function') handleMetaAIResponse(data);
});
socket.on("receive_message", (data) => {
    if (typeof handleReceiveMessage === 'function') handleReceiveMessage(data);
});
socket.on("receive_reaction", (data) => {
    if (typeof handleReceiveReaction === 'function') handleReceiveReaction(data);
});
    // 5. Keep your auto-scroll helper running smoothly whenever messages load
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // 6. Complete cleanup function to prevent memory leaks and layout bugs
    return () => {
  socket.off("chat_joined");
socket.off("meta_ai_response");
socket.off("receive_message");
socket.off("receive_reaction");
    };
  }, []);
const handleAddContact = async () => {
    if (!contactInput.trim()) return;

    const cleanTarget = contactInput.toLowerCase().trim();
    const cleanMe = username.toLowerCase().trim();

    try {
      // 1. Save to your live Render database
      const response = await fetch('https://chat-app-backend-osyn.onrender.com/add-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: cleanMe,
          contactName: cleanTarget
        })
      });

      const data = await response.json();
      console.log("Logged in successfully:", data);

      // 2. Signal the live socket server to open the chat room
      socket.emit("access_chat", {
        currentUsername: cleanMe,
        targetUsername: cleanTarget
      });

      // 3. Update UI states
      setContacts((prev) => [...prev, cleanTarget]);
      setContactInput('');
    } catch (error) {
      console.error("Error adding contact:", error);
    }
  };
 const joinRoom = () => {
    if (username !== "") {
        const cleanName = username.toLowerCase().trim();
        
        // 💡 Added the arrow function callback at the end to prevent server crashes
        socket.emit("login_user", cleanName, (response) => {
            console.log("Logged in successfully:", response);
        });
        
        setJoined(true);
    }
};
const sendMessage = async () => {
  if (message !== "" && currentRoomId !== "") {
    const messageData = {
      id: `${username}-${Date.now()}`,
      room: currentRoomId,
      author: username,
      recipient: activeChat,
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Instantly show your typed message in the chat room window
    setMessageList((list) => [...list, messageData]);
    setMessage('');

    // 2. CHECK IF THIS IS META AI
    if (currentRoomId === "Meta AI" || activeChat === "Meta AI") {
      // Send the query to your server's backend listener (line 127 in your server.js)
      await socket.emit('meta_ai_query', { query: message });
    } else {
      // 3. REGULAR CHAT: Send to regular sockets if not Meta AI
      await socket.emit('send_message', messageData);
    }
  }
};

  const deleteMessage = (messageId) => {
    // Tell your backend socket to delete it globally
    socket.emit('delete_message', { room: currentRoomId, id: messageId });
    // Instantly remove it from your own screen safely
    setMessageList((prevList) => prevList.filter((msg) => msg.id !== messageId));
  };

useEffect(() => {
    // Listen for incoming global messages
    socket.on('receive_message', (data) => {
      if (data.room === currentRoomId) {
        setMessageList((list) => [...list, data]);
      }
    });
    // Add this starting at line 55:
    socket.on("user_typing", (data) => {
        setTypingStatus(`${data.username} is typing...`);
    });

    socket.on("user_stop_typing", () => {
        setTypingStatus("");
    });

// Listen for database history logs initialization
    socket.on('chat_initialized', ({ roomId, history }) => {
      setCurrentRoomId(roomId);
      setMessageList(history);
      
      // 🌟 This must go INSIDE this block so it knows what roomId is!
      socket.emit('mark_as_read', { chatId: roomId });
    });

    socket.on('update_online_users', (users) => {
      setOnlineList(users);
    });

    // Listen for status updates on messages (Like read receipts)
    socket.on('messages_updated_status', ({ chatId, status }) => {
      if (chatId === currentRoomId) {
        setMessageList((prev) =>
          prev.map((msg) => ({ ...msg, status: status }))
        );
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('update_online_users');
      socket.off('chat_initialized');
      socket.off('user_typing');      // <-- Add this cleanup
      socket.off('user_stop_typing'); //<-- Add this cleanup
      socket.off('messages_updated_status');
    };
  }, [currentRoomId ,setOnlineList]);
return (
    <div className={`App ${activeChat ? 'has-active-chat' : ''}`}>
{!joined ? (
        <div className="login-container">
          <div className="login-card">
            <div className="login-logo">
              <svg viewBox="0 0 24 24" width="50" height="50" fill="currentColor">
                <path d="M12.003 21.13c-.417 0-.817-.072-1.196-.21a1.002 1.002 0 0 0-.796.066L7 22.5v-3.323a1 1 0 0 0-.317-.724A9.231 9.231 0 0 1 3.5 12c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9.13zM12 1a11 11 0 0 0-8.91 17.416L2 23l4.796-1.744A10.941 10.941 0 0 0 12 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
              </svg>
            </div>
            <h2>Welcome to ChatApp</h2>
            <p>Enter your username to launch your real-time chat dashboard.</p>
            
            <div className="login-form-group">
              <input 
                type="text" 
                placeholder="Your Name..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinRoom()}
              />
              <button onClick={joinRoom}>Login</button>
            </div>
          </div>
        </div>
      ) : (
 <div className="chat-container">
  <div>
 {/* WHATSAPP MASTER SIDEBAR COLUMN (Desktop: Fixed Width | Phone: Full Screen View) */}
<div className={`wa-sidebar-master ${activeChat ? 'hide-on-mobile' : ''}`}>
  
  {/* 1. FIXED TOP APP BAR BRAND HEADER */}
  <div className="wa-top-brand-header">
    <h1 className="wa-brand-title">eMa</h1>
    <div className="wa-header-actions-row">
      <button className="wa-header-icon-btn">📷</button>
      <button className="wa-header-icon-btn" onClick={() => setActiveTab(activeTab === 'chats' ? 'settings' : 'chats')}>⋮</button>
    </div>
  </div>

  {/* INTERCHANGEABLE ACTIVE COMPONENT TRACKER */}
  <div className="wa-tab-viewport-content">
    {activeTab === 'chats' && (
      <>
        {/* 2. ROUNDED SEARCH BAR FLOATING ROW */}
        <div className="wa-search-bar-wrapper">
          <div className="wa-search-pill-inner">
            <span className="wa-search-lens">🔍</span>
            <input 
              type="text" 
              placeholder="Ask Meta AI or Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
             onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }} 
            />
          </div>
        </div>

        {/* 3. PREMIUM THREAD FEED LIST SCROLL CONTAINER */}
        <div className="wa-threads-scrollable-feed">
          {contacts
            .filter(contact => contact.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((contact, idx) => (
       <div
      key={idx}
      className={`wa-thread-card-item ${activeChat === contact ? 'wa-item-selected' : ''}`}
      onClick={() => {
        setActiveChat(contact);
        setCurrentRoomId(contact); 
            }}
           >
                {/* Avatar Profile Circle */}
                <div className="wa-thread-avatar-circle">
                  {contact.charAt(0).toUpperCase()}
                </div>
                
                {/* Card Context Descriptions */}
                <div className="wa-thread-card-body-meta">
                  <div className="wa-thread-body-row-top">
                    <span className="wa-thread-contact-name">{contact}</span>
                    <span className="wa-thread-timestamp-text">Yesterday</span>
                  </div>
                  <div className="wa-thread-body-row-bottom">
                    <p className="wa-thread-message-snippet-text">Click to chat on live web link</p>
                    <div className="wa-unread-badge-pill">1</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

 {/* 4. COMPACT ADD CONTACT EXPANSION WRAPPER */}
<div className="wa-floating-action-container">
  <input 
    type="text" 
    placeholder="Add new user..." 
    value={contactInput} 
    onChange={(e) => setContactInput(e.target.value)}
    className="wa-add-user-input-box"
  />
  <button className="wa-floating-action-trigger-btn" onClick={handleAddContact} title="Add User">
    +
  </button>
</div>
      </>
    )}

    {activeTab === 'settings' && (
      /* Organized System Profile Configurations Menu Layer */
      <div className="wa-settings-view-panel" style={{ padding: '20px', color: '#e9edef' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Profile Settings</h3>
        <div style={{ background: '#202c33', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
          <div className="wa-thread-avatar-circle" style={{ margin: '0 16px 0 0', width: '50px', height: '50px' }}>U</div>
          <div>
            <h4 style={{ margin: 0 }}>{username || 'Connected Profile'}</h4>
            <span style={{ color: '#8696a0', fontSize: '14px' }}>Universal Universal Network Live</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('chats')}
          style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#00a884', border: 'none', borderRadius: '24px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}
        >
          Close Settings Menu
        </button>
      </div>
    )}
  </div>

  {/* 5. FIXED BOTTOM BAR TAB NAVIGATION DOCK */}
  <div className="wa-fixed-bottom-nav-dock">
    <button className={`wa-dock-tab-btn ${activeTab === 'chats' ? 'dock-tab-active' : ''}`} onClick={() => setActiveTab('chats')}>
      <span className="wa-dock-icon">💬</span>
      <span className="wa-dock-label-text">Chats</span>
      <div className="wa-dock-count-badge">26</div>
    </button>
    <button className={`wa-dock-tab-btn ${activeTab === 'updates' ? 'dock-tab-active' : ''}`} onClick={() => setActiveTab('updates')}>
      <span className="wa-dock-icon">⭕</span>
      <span className="wa-dock-label-text">Updates</span>
    </button>
    <button className={`wa-dock-tab-btn ${activeTab === 'community' ? 'dock-tab-active' : ''}`} onClick={() => setActiveTab('community')}>
      <span className="wa-dock-icon">👥</span>
      <span className="wa-dock-label-text">Communities</span>
    </button>
    <button className={`wa-dock-tab-btn ${activeTab === 'calls' ? 'dock-tab-active' : ''}`} onClick={() => setActiveTab('calls')}>
      <span className="wa-dock-icon">📞</span>
      <span className="wa-dock-label-text">Calls</span>
    </button>
  </div>

</div>
          
        </div>


    {/* MAIN CHAT SCREEN AREA */}
 <div className="chat-window flex flex-col h-full w-full min-h-0 overflow-hidden">
    {activeChat ? (
        <>
  <div className="sidebar-header" style={{ padding: '16px 24px', background: 'var(--...', display: 'flex', alignItems: 'center', gap: '12px' }}>
    {/* 👇 THIS IS YOUR NEW MOBILE BACK BUTTON */}
  <button className="mobile-back-btn" onClick={() => setActiveChat(null)}>
  ← Back
</button>
    <p style={{ margin: 0, fontWeight: 600 }}>
      Chatting with: <span className="username-text">{activeChat}</span>
    </p>
  </div>

          
 <div className="chat-body flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
  {console.log("Current Messages Data:", messageList, "Current Room:", currentRoomId, "Active Chat:", activeChat)}

{messageList
  .filter((content) => {
    // If we are looking at the Meta AI room view
    if (currentRoomId === "Meta AI" || activeChat === "Meta AI") {
      return content.room === "Meta AI" || content.author === "Meta AI" || content.recipient === "Meta AI";
    }
    // If we are looking at a regular user room view (like "dee")
    return content.room === currentRoomId || content.recipient === activeChat || content.author === activeChat;
  })
  .map((content, idx) => {
        const isOwnMessage = content.author === username;
        const isAnImage = content.isImage || (content.message && content.message.includes("cloudinary.com"));

        return (
          <div
            key={content.id || idx}
            className={isOwnMessage ? "message-bubble me" : "message-bubble them"}
            style={{
              position: 'relative',
              paddingBottom: '24px',
              alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
              marginBottom: '12px',
              maxWidth: '65%'
                  }} >
 {/* Modern Floating Hover Picker */}
  <div className="emoji-picker-popover">
    {['👍', '❤️', '😂', '🔥', '😮'].map((emoji) => (
      <button 
        key={emoji} 
        onClick={() => {
          // Use 'content' since that is what your map loop names each message object!
          const msgId = content._id || content.id;
          
          if (!msgId) {
            console.error("Missing unique message ID on this item!");
            return;
          }

          console.log("Sending reaction for message:", msgId, emoji);

          socket.emit('send_reaction', { 
            messageId: msgId, 
            reactorName: username || 'Anonymous', 
            emoji: emoji 
          });
        }}
      >
        {emoji}
      </button>
    ))}
  </div>
          
            {/* 1. Cloudinary Images */}
            {isAnImage ? (
              <img
                src={content.message}
                alt="Shared attachment"
                style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginTop: '4px' }}
              />
            ) : (
              <p style={{ margin: 0 }}>{content.message}</p>
            )}

            {/* 2. Timestamps & Status Receipts */}
            <span style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              position: 'absolute',
              bottom: '2px',
              right: isOwnMessage ? '26px' : '8px'
            }}>
              {content.time || (content.timestamp ? new Date(content.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
              {isOwnMessage && (content.status === 'read' ? ' ✓✓' : ' ✓')}
            </span>

            {/* 3. Trash Bin Delete Button */}
            {isOwnMessage && (
              <button 
                onClick={() => deleteMessage(content.id)}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  fontSize: '11px',
                  opacity: 0.8,
                  padding: '2px',
                  zIndex: 10
                }}
                title="Delete message"
              >
                🗑️
              </button>
            )}
 </div>
      );
    })}
    
    <div ref={messagesEndRef} />
  </div>

  {typingStatus && (
    <div style={{ padding: '5px 15px', fontSize: '13px', color: '#8696a0', fontStyle: 'italic' }}>
      {typingStatus}
    </div>
  )}
{/* Main Chat Panel Window Wrapper */}
<div style={{
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#111b21',
  boxSizing: 'border-box',
  overflow: 'hidden',
  flex: 1,
  minWidth: '0'
}}>

  {/* Chat Area/Messages Section */}
  <div style={{
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box'
  }}>
    {/* Keep your existing message-mapping array map code loop here */}
  </div>

  {/* Main Horizontal Bottom Input Bar Container Row */}
  <div style={{
 /* Update the style block starting at Line 551 to read exactly like this: */
display: 'flex',
flexDirection: 'row',
alignItems: 'center',
width: '100%',
flexShrink: 0,                /* FIX: Locks the bar height so it cannot slide away */
gap: '12px',
padding: '12px 16px',
backgroundColor: '#1f2c34',
borderTop: 'none',            /* FIX: Completely removes the tiny gray line */
boxSizing: 'border-box',
}}>
    
    {/* Modern Attachment Upload Icon Trigger */}
    <label style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', color: '#8696a0', flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
      </svg>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files;
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "chat_app_preset");

          try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dxk6jsrpc/image/upload", {
              method: "POST",
              body: formData
            });
            const data = await res.json();
            if (data.secure_url) {
              setMessage(data.secure_url);
            }
          } catch (err) {
            console.error("Upload failed:", err);
          }
        }}
      />
    </label>

    {/* Sleek, Full-Width Chat Message Input Field */}
    <input
      type="text"
      placeholder="Type a message..."
      value={message}
      style={{
        flexGrow: 1,
        minWidth: 0,
        backgroundColor: '#2a3942',
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '8px',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
      }}
      onChange={(e) => {
        setMessage(e.target.value);
        if (e.target.value !== "") {
          socket.emit("typing", { room: currentRoomId, username: username });
        } else {
          socket.emit("stop_typing", { room: currentRoomId });
        }
      }}
      onBlur={() => socket.emit("stop_typing", { room: currentRoomId })}
      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
    />

    {/* Premium Blue Send Message Button */}
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0084ff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        width: '42px',
        height: '42px',
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
      onClick={sendMessage}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '2px' }}>
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>

  </div>
</div>
      
  </>
) : (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h3>Select a contact to start chatting</h3>
  </div>
)}
</div>

{/* UNIVERSAL PROFILE MODAL COMPONENT */}
<UniversalProfile
  isOpen={isProfileModalOpen}
  onClose={() => setIsProfileModalOpen(false)}
  currentProfile={myUniversalProfile}
  onSave={(updatedProfile) => {
    setMyUniversalProfile(updatedProfile);
    localStorage.setItem('universal_chat_profile', JSON.stringify(updatedProfile));
    setIsProfileModalOpen(false);
  }}
/>
</div>
      )}
    </div>
  );
}

export default App;