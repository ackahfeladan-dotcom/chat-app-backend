import { useState } from 'react';

export default function UniversalProfile({ isOpen, onClose, currentProfile, onSave }) {
  const [name, setName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || 'Hey there! I am using this chat app.');
  const [status, setStatus] = useState(currentProfile?.statusEmoji || '💬');
  const [avatar, setAvatar] = useState(currentProfile?.avatarUrl || '');
  const [phone, setPhone] = useState(currentProfile?.phoneNumber || '+1 (555) 000-0000');

  if (!isOpen) return null;

  // Handle local picture uploads
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setAvatar(localUrl); // Previews image instantly in the UI
    }
  };

  // Extract first letter of name for the WhatsApp fallback avatar
  const getInitial = () => {
    return name ? name.trim().charAt(0).toUpperCase() : 'C';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 20, 26, 0.85)', // Deep WhatsApp Midnight Overlay
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#111b21', // Authentic WhatsApp Dark Panel
        border: '1px solid #222e35',
        borderRadius: '20px',
        padding: '24px',
        color: '#e9edef',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
      }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', tracking: '0.05em', color: '#00a884' }}>
            PROFILE SETTINGS
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', fontSize: '18px' }}
          >
            ✕
          </button>
        </div>

        {/* 1. WHATSAPP AVATAR SELECTION AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <label style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#00a884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            border: '2px solid #222e35'
          }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            
            {avatar ? (
              <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>{getInitial()}</span>
            )}

            {/* Hover overlay indicator */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600'
            }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0}>
              CHANGE PHOTO
            </div>
          </label>
          <span style={{ fontSize: '11px', color: '#8696a0' }}>Tap image workspace container to upload</span>
        </div>

        {/* 2. SPECIFIC SECTION CONTAINER CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Display Name Row */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '6px', fontWeight: '600' }}>
              Your Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Name visible to your contacts..."
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '8px',
                backgroundColor: '#202c33', border: '1px solid #2a3942', color: '#e9edef',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* About Status Row */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '6px', fontWeight: '600' }}>
              About (Status Status)
            </label>
            <input 
              type="text" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '8px',
                backgroundColor: '#202c33', border: '1px solid #2a3942', color: '#e9edef',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Phone Number Field Metadata */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '6px', fontWeight: '600' }}>
              Phone Number
            </label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '8px',
                backgroundColor: '#202c33', border: '1px solid #2a3942', color: '#e9edef',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Mood Selection Matrix Row */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '8px', fontWeight: '600' }}>
              Profile Presence Mode
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['💬', '🚀', '🎧', '🔋', '💼', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setStatus(emoji)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px', fontSize: '16px',
                    border: status === emoji ? '1px solid #00a884' : '1px solid #2a3942',
                    backgroundColor: status === emoji ? 'rgba(0, 168, 132, 0.1)' : '#202c33',
                    color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600', borderRadius: '8px',
              backgroundColor: 'transparent', border: '1px solid #2a3942', color: '#8696a0', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (!name.trim()) return alert("Please specify a Display Name.");
              onSave({ displayName: name.trim(), bio: bio.trim(), statusEmoji: status, avatarUrl: avatar, phoneNumber: phone });
            }}
            style={{
              flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600', borderRadius: '8px',
              backgroundColor: '#00a884', border: 'none', color: '#111b21', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 168, 132, 0.2)'
            }}
          >
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}