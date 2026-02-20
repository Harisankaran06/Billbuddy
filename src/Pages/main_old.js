import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Get user name from Supabase user metadata
    if (user?.user_metadata?.display_name) {
      setUserName(user.user_metadata.display_name);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  }, [user]);

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .dashboard-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8f9fc;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #334155;
        }

        /* Ambient Background Gradients */
        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          z-index: 0;
        }
        .bg-blob.purple {
          background: #d8b4fe;
          width: 500px; 
          height: 500px;
          top: -150px; 
          left: -150px;
        }
        .bg-blob.cyan {
          background: #a5f3fc;
          width: 500px; 
          height: 500px;
          top: 20%; 
          right: -150px;
        }

        /* Layout */
        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px 60px;
          position: relative;
          z-index: 10;
        }

        /* Navbar */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
        }
        .logo-box {
          width: 40px; 
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #d946ef, #9333ea);
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .user-dropdown {
          display: flex; 
          align-items: center; 
          gap: 8px;
          background: white;
          padding: 6px 12px 6px 6px;
          border-radius: 50px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          cursor: pointer;
          position: relative;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 180px;
          z-index: 1000;
          overflow: hidden;
        }
        .dropdown-menu a,
        .dropdown-menu button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          color: #334155;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s;
          text-align: left;
        }
        .dropdown-menu a:hover,
        .dropdown-menu button:hover {
          background-color: #f1f5f9;
        }
        .dropdown-menu button.logout {
          color: #dc2626;
        }
        .dropdown-menu button.logout:hover {
          background-color: #fee2e2;
        }
        .dropdown-icon {
          width: 16px;
          height: 16px;
        }
        .user-avatar {
          width: 32px; 
          height: 32px;
          border-radius: 50%;
          background-color: #9333ea;
          color: white;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-weight: 600; 
          font-size: 14px;
        }
        .user-name { 
          font-weight: 500; 
          font-size: 14px; 
        }

        /* Header Area */
        .header-section { 
          text-align: center; 
          margin: 40px 0 60px; 
        }
        .header-title { 
          font-size: 36px; 
          font-weight: 700; 
          margin-bottom: 12px; 
          color: #1e293b; 
        }
        .text-gradient {
          background: linear-gradient(to right, #d946ef, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header-subtitle { 
          color: #64748b; 
          font-size: 16px; 
          max-width: 600px; 
          margin: 0 auto; 
          line-height: 1.5; 
        }

        /* 3-Column Action Cards */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }
        .card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          display: flex; 
          flex-direction: column; 
          align-items: center;
          border: 1px solid rgba(255,255,255,0.8);
        }
        .icon-wrapper {
          width: 64px; 
          height: 64px;
          border-radius: 16px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          margin-bottom: 20px;
        }
        .icon-create { 
          background: linear-gradient(135deg, #e879f9, #a855f7); 
          box-shadow: 0 8px 16px rgba(168, 85, 247, 0.2); 
        }
        .icon-enter { 
          background: #22d3ee; 
          box-shadow: 0 8px 16px rgba(34, 211, 238, 0.2); 
        }
        .icon-play { 
          background: linear-gradient(135deg, #a855f7, #6366f1); 
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2); 
        }
        
        .card-title { 
          font-size: 20px; 
          font-weight: 700; 
          margin-bottom: 12px; 
          color: #1e293b; 
        }
        .card-desc { 
          color: #64748b; 
          font-size: 14px; 
          margin-bottom: 24px; 
          flex-grow: 1; 
          line-height: 1.5; 
        }
        
        .btn {
          padding: 10px 24px;
          border-radius: 50px;
          border: none;
          color: white;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s ease-in-out;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn:hover { opacity: 0.85; }
        .btn-purple { 
          background: linear-gradient(to right, #d946ef, #a855f7); 
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); 
        }
        .btn-cyan { 
          background: #22d3ee; 
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3); 
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        .friends-panel {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow: 0 10px 32px rgba(0,0,0,0.05);
          padding: 18px;
          position: sticky;
          top: 18px;
        }

        .friends-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .friends-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
          margin-bottom: 12px;
        }

        .friends-search {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          margin-bottom: 10px;
          outline: none;
        }

        .friends-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin: 12px 0 8px;
        }

        .friend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 12px;
          background: #f8fafc;
          margin-bottom: 8px;
        }

        .friend-main {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .friend-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .friend-username {
          font-size: 12px;
          color: #64748b;
        }

        .tiny-btn {
          border: none;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(to right, #9333ea, #6366f1);
        }

        .tiny-btn.accept {
          background: linear-gradient(to right, #10b981, #14b8a6);
        }

        .status-note {
          font-size: 12px;
          color: #7c3aed;
          margin: 8px 0;
        }

        .empty-note {
          font-size: 12px;
          color: #94a3b8;
          padding: 4px 0;
        }

        @media (max-width: 1080px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          .friends-panel {
            position: static;
          }
        }
      `}</style>

      {/* Background Blobs */}
      <div className="bg-blob purple"></div>
      <div className="bg-blob cyan"></div>

      {/* Content */}
      <div className="content-wrapper">
        {/* Navbar */}
        <div className="navbar">
          <div className="logo-box">✨</div>
          <div className="user-dropdown" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <span className="user-name">{userName}</span>
            {showDropdown && (
              <div className="dropdown-menu">
                <a href="#settings" onClick={(e) => { e.preventDefault(); setShowDropdown(false); navigate('/settings'); }}>
                  <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                <button className="logout" onClick={handleLogout}>
                  <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="header-section">
          <h1 className="header-title">
            Welcome to Your <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="header-subtitle">
            Explore amazing features and grow your productivity. Get started today!
          </p>
        </div>

        {/* Action Cards */}
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
    </div>
  );
};

export default Dashboard;