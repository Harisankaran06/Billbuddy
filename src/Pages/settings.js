import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [profileData, setProfileData] = useState({
    display_name: "",
    username: "",
    phone: "",
    avatar_url: ""
  });
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, username, phone, avatar_url")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfileData({
          display_name: data.display_name || "",
          username: data.username || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || ""
        });
      }
    };
    
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setSaveStatus("Saving...");
    
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profileData.display_name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url
      })
      .eq("id", user.id);
    
    if (error) {
      setSaveStatus("Error: " + error.message);
    } else {
      setSaveStatus("Changes saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    perspective: "1200px"
  };

  const wrapperStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    gap: "30px"
  };

  const backButtonStyle = {
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1f2937",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  };

  const sidebarStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "12px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.8)"
  };

  const sectionButtonStyle = {
    padding: "12px 16px",
    textAlign: "left",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6b7280",
    borderLeft: "3px solid transparent",
    transition: "all 0.3s ease",
    borderRadius: "8px"
  };

  const activeSectionStyle = {
    ...sectionButtonStyle,
    backgroundColor: "#667eea",
    color: "white",
    borderLeftColor: "#667eea",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
  };

  const contentStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.25)",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    transformStyle: "preserve-3d",
    border: "1px solid rgba(255, 255, 255, 0.8)"
  };

  const sectionHeaderStyle = {
    marginBottom: "24px"
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0"
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0"
  };

  const formGroupStyle = {
    marginBottom: "20px"
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
    color: "#1f2937"
  };

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s"
  };

  const saveBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#667eea",
    color: "white",
    marginTop: "24px",
    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease"
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div>
            <div style={sectionHeaderStyle}>
              <h2 style={titleStyle}>Account Information</h2>
              <p style={subtitleStyle}>Manage your personal profile and contact details.</p>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Display Name</label>
              <input 
                type="text" 
                value={profileData.display_name} 
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                style={inputStyle} 
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Username</label>
              <input 
                type="text" 
                value={profileData.username} 
                disabled
                style={{...inputStyle, backgroundColor: "#e5e7eb", cursor: "not-allowed"}} 
              />
              <p style={{fontSize: "12px", color: "#6b7280", marginTop: "4px"}}>Username cannot be changed</p>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                value={user?.email || ""} 
                disabled
                style={{...inputStyle, backgroundColor: "#e5e7eb", cursor: "not-allowed"}} 
              />
              <p style={{fontSize: "12px", color: "#6b7280", marginTop: "4px"}}>Email cannot be changed</p>
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input 
                type="tel" 
                value={profileData.phone} 
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                style={inputStyle} 
              />
            </div>
            {saveStatus && (
              <div style={{
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: saveStatus.includes("Error") ? "#fee2e2" : "#d1fae5",
                color: saveStatus.includes("Error") ? "#991b1b" : "#065f46",
                marginBottom: "16px",
                fontSize: "14px"
              }}>
                {saveStatus}
              </div>
            )}
            <button 
              style={saveBtnStyle}
              onClick={handleSaveProfile}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 28px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
              }}
            >
              Save Changes
            </button>
          </div>
        );
      case "notifications":
        return (
          <div>
            <div style={sectionHeaderStyle}>
              <h2 style={titleStyle}>Notifications</h2>
              <p style={subtitleStyle}>Manage your notification preferences.</p>
            </div>
            <div style={{ ...formGroupStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={labelStyle}>Email Notifications</label>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
            </div>
            <div style={{ ...formGroupStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={labelStyle}>Push Notifications</label>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
            </div>
            <div style={{ ...formGroupStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={labelStyle}>Expense Alerts</label>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
            </div>
            <button 
              style={saveBtnStyle}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              Save Changes
            </button>
          </div>
        );
      case "appearance":
        return (
          <div>
            <div style={sectionHeaderStyle}>
              <h2 style={titleStyle}>Appearance</h2>
              <p style={subtitleStyle}>Customize your visual experience.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={{
                padding: "16px",
                borderRadius: "12px",
                border: "2px solid #d1d5db",
                textAlign: "center",
                cursor: "pointer"
              }}>
                <div style={{ width: "100%", height: "80px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "12px" }}></div>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>Light Mode</span>
              </div>
              <div style={{
                padding: "16px",
                borderRadius: "12px",
                border: "2px solid #d1d5db",
                textAlign: "center",
                cursor: "pointer"
              }}>
                <div style={{ width: "100%", height: "80px", backgroundColor: "#1f2937", borderRadius: "8px", marginBottom: "12px" }}></div>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>Dark Mode</span>
              </div>
            </div>
            <button 
              style={saveBtnStyle}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              Save Changes
            </button>
          </div>
        );
      default:
        return (
          <div style={sectionHeaderStyle}>
            <h2 style={titleStyle}>Coming Soon</h2>
            <p style={subtitleStyle}>Settings for this section are coming soon.</p>
          </div>
        );
    }
  };

  return (
    <>
    <style>{`
      @keyframes slideIn {
        0% { opacity: 0; transform: translateX(30px); }
        100% { opacity: 1; transform: translateX(0); }
      }
    `}</style>
    <div style={containerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/main")}
          style={backButtonStyle}
          onMouseEnter={(e) => e.target.style.opacity = "0.7"}
          onMouseLeave={(e) => e.target.style.opacity = "1"}
        >
          <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div style={wrapperStyle}>
          <div style={sidebarStyle}>
            {["account", "notifications", "appearance"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={activeSection === section ? activeSectionStyle : sectionButtonStyle}
                onMouseEnter={(e) => {
                  if (activeSection !== section) {
                    e.target.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          <div 
            style={{...contentStyle, animation: "slideIn 0.5s ease-out"}}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateX(3deg) rotateY(-3deg) translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 40px 80px rgba(0, 0, 0, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.25)";
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}