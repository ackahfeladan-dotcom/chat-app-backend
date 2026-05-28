import { useState } from 'react';

export default function UniversalProfile({ isOpen, onClose, currentProfile, onSave }) {
  // Local form states initialized cleanly from parent props
  const [name, setName] = useState(currentProfile?.displayName || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [status, setStatus] = useState(currentProfile?.statusEmoji || '💬');

  // If the control state is false, render absolutely nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-white shadow-2xl">
        
        {/* Dynamic Header Layout */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-400">Profile Settings</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body Context */}
        <div className="space-y-5">
          {/* Universal Avatar Module */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner relative">
              {status}
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border border-zinc-950 rounded-full flex items-center justify-center text-[10px] shadow">✓</span>
            </div>
            <p className="text-[10px] text-zinc-500 tracking-tight text-center">Your details are saved universally on this browser</p>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="Type name like WhatsApp..." 
              maxLength={25}
            />
          </div>

          {/* Status Bio Field */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">About Status</label>
            <input 
              type="text" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="Hey there! I am using this chat app." 
              maxLength={60}
            />
          </div>

          {/* Emoji Preset Selection Array */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Profile Mood Status</label>
            <div className="flex gap-2 justify-between">
              {['💬', '🚀', '🎧', '🔋', '💼', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setStatus(emoji)}
                  className={`p-2 rounded-lg border text-lg transition flex-1 text-center cursor-pointer ${
                    status === emoji ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-900 bg-zinc-900/40 hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Controls Actions Footer */}
        <div className="flex gap-2 mt-6">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-2 text-xs font-semibold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800/60 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              if (!name.trim()) return alert("Please enter a valid profile name.");
              onSave({ displayName: name.trim(), bio: bio.trim(), statusEmoji: status });
            }}
            className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-md cursor-pointer shadow-emerald-950/20"
          >
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}