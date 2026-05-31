import { useState } from 'react';

export default function UniversalProfile({ isOpen, onClose, currentProfile, onSave }) {
  const [name, setName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || 'Hey there! I am using this chat app.');
  const [status] = useState(currentProfile?.statusEmoji || '💬');
  const [avatar, setAvatar] = useState(currentProfile?.avatarUrl || '');
  const [phone, setPhone] = useState(currentProfile?.phoneNumber || '+1 (555) 000-0000');
  
  const [presence, setPresence] = useState(currentProfile?.presenceMode || 'online'); 
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files;
    if (file && file[0]) {
      setAvatar(URL.createObjectURL(file[0]));
    }
  };

  const getInitial = () => name ? name.trim().charAt(0).toUpperCase() : 'C';

  const presenceColors = {
    online: '#10b981',
    away: '#f59e0b',
    dnd: '#ef4444'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(11, 20, 26, 0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', height: '90vh',
        backgroundColor: '#111b21', border: '1px solid #222e35',
        borderRadius: '24px', padding: '24px', color: '#e9edef',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)', fontFamily: 'sans-serif',
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
      }}>
        
      {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👤</span>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#00a884', letterSpacing: '0.5px' }}>
              Profile Settings
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8696a0', cursor: 'pointer', fontSize: '14px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Sub-container */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Avatar and Presence Indicator Layer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <label style={{
              width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#00a884',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              cursor: 'pointer', overflow: 'hidden', border: '2px solid #222e35'
            }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>{getInitial()}</span>
              )}
            </label>
            
            <button 
              type="button"
              onClick={() => setShowQR(!showQR)}
              style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#202c33', color: '#00a884', border: '1px solid #2a3942', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {showQR ? 'Hide Profile QR' : '🔗 Show Profile QR'}
            </button>
          </div>

          {/* DYNAMIC PROFILE QR CONTAINER CARD */}
          {showQR && (
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '140px', height: '140px', backgroundColor: '#202c33', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', height: '100%', border: '4px dashed #00a884', display: 'flex', flexWrap: 'wrap' }}>
                  {[...Array(16)].map((_, i) => (
                    <div key={i} style={{ width: '25%', height: '25%', backgroundColor: i % 3 === 0 ? '#fff' : 'transparent', border: '1px solid #111b21' }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#111b21', fontWeight: 'bold' }}>Scan to Chat with {name || 'User'}</span>
            </div>
          )}

          {/* PRESENCE STATE SWITCHER */}
          <div style={{ backgroundColor: '#202c33', padding: '14px', borderRadius: '12px', border: '1px solid #2a3942' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '8px', fontWeight: '600' }}>ACCOUNT PRESENCE STATE</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'online', label: 'Online', color: presenceColors.online },
                { key: 'away', label: 'Away', color: presenceColors.away },
                { key: 'dnd', label: 'Busy', color: presenceColors.dnd }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPresence(item.key)}
                  style={{
                    flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: presence === item.key ? 'rgba(255,255,255,0.05)' : '#111b21',
                    border: presence === item.key ? '1px solid ' + item.color : '1px solid transparent',
                    color: presence === item.key ? '#fff' : '#8696a0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* USER METADATA CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#202c33', padding: '14px', borderRadius: '12px', border: '1px solid #2a3942' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '4px' }}>Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', backgroundColor: '#111b21', border: '1px solid #2a3942', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '4px' }}>About Info</label>
              <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', backgroundColor: '#111b21', border: '1px solid #2a3942', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8696a0', marginBottom: '4px' }}>Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', backgroundColor: '#111b21', border: '1px solid #2a3942', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* ENCRYPTION & SECURITY AUDIT PANEL */}
          <div style={{ backgroundColor: 'rgba(0,168,132,0.05)', border: '1px dashed rgba(0,168,132,0.2)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div style={{ fontSize: '11px', color: '#8696a0', lineHeight: '1.4' }}>
              <strong style={{ color: '#e9edef', display: 'block', marginBottom: '2px' }}>End-to-End Encrypted Secure Profile</strong>
              Your text data metrics, presence configurations, and media uploads remain fully isolated in storage.
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: '600', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #2a3942', color: '#8696a0', cursor: 'pointer' }}>Cancel</button>
          <button 
            type="button" 
            onClick={() => {
              if (!name.trim()) return alert("Name field is mandatory.");
              onSave({ displayName: name.trim(), bio: bio.trim(), statusEmoji: status, avatarUrl: avatar, phoneNumber: phone, presenceMode: presence });
            }}
            style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: '600', borderRadius: '8px', backgroundColor: '#00a884', border: 'none', color: '#111b21', cursor: 'pointer' }}
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}