import { useState } from 'react';

export default function UniversalProfile({ isOpen, onClose, currentProfile, onSave }) {
  const [name, setName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [status, setStatus] = useState(currentProfile?.statusEmoji || '💬');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        backgroundColor: '#0c0c0e',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '24px',
        color: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        fontFamily: 'sans-serif'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', tracking: '0.1em', uppercase: 'true', color: '#a1a1aa' }}>
            PROFILE SETTINGS
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>

        {/* Avatar Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            position: 'relative'
          }}>
            {status}
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#000',
              fontWeight: 'bold'
            }}>✓</span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#52525b', textAlign: 'center' }}>
            Saved directly to your browser storage
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '6px' }}>
              Your Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Name like WhatsApp..."
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '6px' }}>
              About Bio
            </label>
            <input 
              type="text" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              placeholder="Hey there! I am using this chat app."
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Emojis grid */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '8px' }}>
              Profile Mood Vibe
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              {['💬', '🚀', '🎧', '🔋', '💼', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setStatus(emoji)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '18px',
                    border: status === emoji ? '1px solid #10b981' : '1px solid #27272a',
                    backgroundColor: status === emoji ? 'rgba(16, 185, 129, 0.1)' : '#18181b',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              color: '#a1a1aa',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!name.trim()) return alert("Please enter your name.");
              onSave({ displayName: name.trim(), bio: bio.trim(), statusEmoji: status });
            }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: '#059669',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
            }}
          >
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}