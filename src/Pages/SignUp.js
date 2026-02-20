import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '16px',
  boxSizing: 'border-box',
  perspective: '1200px',
};

const containerStyle = {
  width: '100%',
  maxWidth: '420px',
  position: 'relative',
  zIndex: 10,
  animation: 'floatIn 0.8s ease-out',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '24px',
};

const mascotStyle = {
  fontSize: '56px',
  marginBottom: '12px',
  display: 'block',
  transition: 'transform 0.3s ease',
  animation: 'bounce 2s ease-in-out infinite',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const subtitleStyle = {
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '8px 0 0 0',
  fontWeight: 500,
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 1)',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.25)',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  transformStyle: 'preserve-3d',
  position: 'relative',
};

const formGroupStyle = {
  marginBottom: '16px',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '8px',
  marginLeft: '4px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px',
  borderRadius: '16px',
  border: '2px solid #e2e8f0',
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  outline: 'none',
  background: 'rgba(255, 255, 255, 0.9)',
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '16px',
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
};

const mascotLevelStyle = {
  fontSize: '10px',
  color: '#94a3b8',
  marginTop: '8px',
  marginLeft: '4px',
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: '1px',
};

const footerStyle = {
  marginTop: '24px',
  paddingTop: '16px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center',
  fontSize: '14px',
  color: '#64748b',
};

const linkStyle = {
  color: '#3b82f6',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
};

const blobStyle = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(80px)',
  opacity: 0.35,
  zIndex: 0,
};

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mascot, setMascot] = useState('🧐');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { signUp, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (password.length === 0) setMascot('🧐');
    else if (password.length < 6) setMascot('🤨');
    else if (password.length < 12) setMascot('😮');
    else setMascot('😎');
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setMessage('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setMessage(error.message || 'Sign up failed. Please try again.');
        setMascot('😢');
      } else {
        setMascot('🚀');
        setMessage("Account created! Redirecting to login...");
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setMessage(err.message || 'An error occurred');
      setMascot('😢');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <style>{`
      @keyframes floatIn {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `}</style>
    <div style={pageStyle}>
      {/* Background Blobs */}
      <div style={{ ...blobStyle, background: 'rgba(233, 213, 255, 0.3)', width: '400px', height: '400px', top: '-100px', right: '-50px' }} />
      <div style={{ ...blobStyle, background: 'rgba(207, 250, 254, 0.3)', width: '500px', height: '500px', bottom: '-100px', left: '-50px' }} />

      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <span style={mascotStyle}>{mascot}</span>
          <h1 style={titleStyle}>Don't be a stranger!</h1>
          <p style={subtitleStyle}>It only takes 30 seconds (we timed it).</p>
        </div>

        {/* Card */}
        <div 
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotateX(5deg) rotateY(-5deg) translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 40px 80px rgba(0, 0, 0, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.25)";
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                style={inputStyle}
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@awesome.com"
                style={inputStyle}
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p style={mascotLevelStyle}>
                {password.length > 0 ? `Mascot Level: ${mascot}` : 'Make it spicy!'}
              </p>
            </div>

            {message && (
              <p style={{...mascotLevelStyle, textAlign: 'center', marginBottom: '12px', color: message.includes('failed') || message.includes('must be') ? '#ef4444' : '#22c55e'}}>
                {message}
              </p>
            )}
            {authError && (
              <p style={{...mascotLevelStyle, textAlign: 'center', marginBottom: '12px', color: '#ef4444'}}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...buttonStyle,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 12px 28px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
              }}
            >
              {isSubmitting ? 'Doing Magic...' : 'Create My Account! ✨'}
            </button>
          </form>

          <div style={footerStyle}>
            <p>
              Already have an account?{' '}
              <Link to="/" style={linkStyle}>
                Log in and high-five us!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;