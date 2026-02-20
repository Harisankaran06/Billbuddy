import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState('User');
  
  // --- NEW AI STATES ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your BillBuddy Assistant. Need help calculating expenses or creating a group?' }
  ]);
  const chatEndRef = useRef(null);
  // ---------------------

  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user?.user_metadata?.display_name) {
      setUserName(user.user_metadata.display_name);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  }, [user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // --- AI LOGIC FUNCTION ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    const inputClean = chatInput.toLowerCase();
    setChatInput('');

    // Simulate AI Thinking
    setTimeout(() => {
      let response = "I'm still learning! You can ask me to 'calculate' numbers or 'create a group'.";

      // 1. Expense Calculation Logic
      if (inputClean.includes('calculate') || inputClean.includes('total') || inputClean.includes('add')) {
        const numbers = inputClean.match(/\d+/g);
        if (numbers) {
          const sum = numbers.map(Number).reduce((a, b) => a + b, 0);
          response = `I've totaled those expenses for you: $${sum}. Shall I split this among your group?`;
        } else {
          response = "Please provide some numbers for me to calculate!";
        }
      } 
      // 2. Group Creation Logic
      else if (inputClean.includes('group') || inputClean.includes('room')) {
        response = "I can help with that! I'm opening the Room Creator for you now...";
        setTimeout(() => navigate('/createroom'), 1500);
      }
      // 3. Greeting
      else if (inputClean.includes('hi') || inputClean.includes('hello')) {
        response = `Hi ${userName}! How can I help you manage your bills today?`;
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 600);
  };
  // -------------------------

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .dashboard-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fc;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #334155;
        }
        .bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; z-index: 0; }
        .bg-blob.purple { background: #d8b4fe; width: 500px; height: 500px; top: -150px; left: -150px; }
        .bg-blob.cyan { background: #a5f3fc; width: 500px; height: 500px; top: 20%; right: -150px; }
        .content-wrapper { max-width: 1000px; margin: 0 auto; padding: 0 24px 60px; position: relative; z-index: 10; }
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; }
        .logo-box { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #d946ef, #9333ea); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .user-dropdown { display: flex; align-items: center; gap: 8px; background: white; padding: 6px 12px 6px 6px; border-radius: 50px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; position: relative; }
        .dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 180px; z-index: 1000; overflow: hidden; }
        .dropdown-menu a, .dropdown-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border: none; background: none; text-decoration: none; color: #334155; font-size: 14px; cursor: pointer; text-align: left; font-family: inherit; }
        .dropdown-menu a:hover, .dropdown-menu button:hover { background: #f1f5f9; }
        .dropdown-icon { width: 18px; height: 18px; }
        .dropdown-menu .logout { color: #e11d48; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #a855f7, #ec4899); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; }
        .user-name { font-weight: 600; font-size: 14px; color: #1e293b; }
        .header-section { text-align: center; margin-bottom: 48px; }
        .header-title { font-size: 44px; font-weight: 900; color: #1f2937; margin-bottom: 12px; line-height: 1.1; }
        .text-gradient { background: linear-gradient(135deg, #a855f7, #d946ef, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header-subtitle { color: #64748b; font-size: 16px; line-height: 1.5; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; perspective: 1200px; }
        .card { background: rgba(255,255,255,0.88); backdrop-filter: blur(12px); padding: 32px; border-radius: 24px; transition: transform 0.35s ease, box-shadow 0.35s ease; text-align: center; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); display: flex; flex-direction: column; align-items: center; border: 1px solid rgba(255,255,255,0.8); transform-style: preserve-3d; position: relative; overflow: hidden; transform: translateZ(0); }
        .card:hover { transform: rotateX(6deg) rotateY(-6deg) translateY(-6px) translateZ(8px); box-shadow: 0 22px 40px rgba(15, 23, 42, 0.16); }
        .icon-wrapper { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .icon-create { background: linear-gradient(135deg, #e879f9, #a855f7); }
        .icon-enter { background: #22d3ee; }
        .icon-play { background: linear-gradient(135deg, #a855f7, #6366f1); }
        .card-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
        .card-desc { color: #64748b; font-size: 14px; margin-bottom: 24px; flex-grow: 1; line-height: 1.5; }
        .btn { padding: 10px 24px; border-radius: 50px; border: none; color: white; font-weight: 500; font-size: 14px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .btn-purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
        .btn-cyan { background: #22d3ee; }

        /* --- CHATBOT ENHANCEMENTS --- */
        .chat-trigger { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #9333ea, #d946ef); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; cursor: pointer; box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4); z-index: 2000; transition: transform 0.3s; }
        .chat-window { position: fixed; bottom: 100px; right: 30px; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; z-index: 2000; border: 1px solid #f1f5f9; }
        .chat-header { padding: 16px; background: linear-gradient(135deg, #9333ea, #d946ef); color: white; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; padding: 16px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 10px; }
        .chat-msg { padding: 10px 14px; border-radius: 15px; max-width: 85%; line-height: 1.4; font-size: 14px; }
        .ai-msg { background: #e2e8f0; align-self: flex-start; border-bottom-left-radius: 2px; color: #1e293b; }
        .user-msg { background: #9333ea; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
        .chat-input-area { padding: 12px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; }
        .chat-input { flex: 1; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 25px; outline: none; font-size: 14px; }
      `}</style>

      <div className="bg-blob purple"></div>
      <div className="bg-blob cyan"></div>

      <div className="content-wrapper">
        <div className="navbar">
          <div className="logo-box">✨</div>
          <div className="user-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <span className="user-name">{userName}</span>
            {showDropdown && (
              <div className="dropdown-menu">
                <a href="#settings" onClick={(e) => { e.preventDefault(); setShowDropdown(false); navigate('/settings'); }}>Settings</a>
                <button className="logout" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <div className="header-section">
          <h1 className="header-title">Welcome to <span className="text-gradient">BillBuddy</span> Dashboard</h1>
          <p className="header-subtitle">Explore amazing features and grow your productivity. Get started today!</p>
        </div>

        <div className="cards-grid">
          <div className="card">
            <div className="icon-wrapper icon-create">📝</div>
            <h3 className="card-title">Create Room</h3>
            <p className="card-desc">Build something new and amazing with our powerful tools</p>
            <Link to="/createroom" className="btn btn-purple" style={{ textDecoration: 'none', color: 'white' }}>Get Started</Link>
          </div>
          <div className="card">
            <div className="icon-wrapper icon-enter">🚀</div>
            <h3 className="card-title">Join Room</h3>
            <p className="card-desc">Discover new resources, templates, and inspirations</p>
            <Link to="/joinroom" className="btn btn-cyan" style={{ textDecoration: 'none', color: 'white' }}>Join</Link>
          </div>
          <div className="card">
            <div className="icon-wrapper icon-play">⚡</div>
            <h3 className="card-title">Game Arena</h3>
            <p className="card-desc">Boost your workflow and achieve success faster</p>
            <a href="https://poki.com/en/multiplayer" target="_blank" rel="noopener noreferrer" className="btn btn-purple" style={{ textDecoration: 'none', color: 'white' }}>Dive In</a>
          </div>
        </div>
        <Outlet />
      </div>

      {/* --- WORKING CHATBOT --- */}
      <div className="chat-trigger" onClick={() => setShowChat(!showChat)}>
        {showChat ? '✕' : '💬'}
      </div>

      {showChat && (
        <div className="chat-window">
          <div className="chat-header">
            <span>BillBuddy AI</span>
            <small>Online</small>
          </div>
          <div className="chat-body">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Type 'Calculate 50 + 20'..." 
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="btn btn-purple" 
              style={{padding: '5px 15px'}}
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;