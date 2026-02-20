import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const containerStyle = {
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
	padding: "24px",
	perspective: "1200px",
};

const cardStyle = {
	width: "100%",
	maxWidth: "420px",
	background: "rgba(255, 255, 255, 0.95)",
	backdropFilter: "blur(20px)",
	borderRadius: "24px",
	padding: "40px",
	boxShadow: "0 30px 60px rgba(0, 0, 0, 0.25)",
	transition: "transform 0.4s ease, box-shadow 0.4s ease",
	transformStyle: "preserve-3d",
	position: "relative",
	border: "1px solid rgba(255, 255, 255, 0.8)",
	animation: "floatCard 3s ease-in-out infinite",
};

const titleStyle = {
	margin: 0,
	marginBottom: "8px",
	fontSize: "1.75rem",
	fontWeight: 700,
	color: "#1f2937",
};

const subtitleStyle = {
	margin: 0,
	marginBottom: "24px",
	color: "#6b7280",
	fontSize: "0.95rem",
};

const labelStyle = {
	display: "block",
	marginBottom: "6px",
	fontWeight: 600,
	color: "#374151",
	fontSize: "0.9rem",
};

const inputStyle = {
	width: "100%",
	padding: "12px 16px",
	borderRadius: "12px",
	border: "2px solid #e5e7eb",
	marginBottom: "16px",
	fontSize: "0.95rem",
	boxSizing: "border-box",
	transition: "all 0.3s ease",
	background: "rgba(255, 255, 255, 0.9)",
};

const buttonStyle = {
	width: "100%",
	padding: "14px 16px",
	borderRadius: "12px",
	border: "none",
	background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
	color: "#ffffff",
	fontWeight: 700,
	fontSize: "1rem",
	cursor: "pointer",
	transition: "all 0.3s ease",
	boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
};

const helperStyle = {
	marginTop: "14px",
	textAlign: "center",
	color: "#6b7280",
	fontSize: "0.9rem",
};

const signupRowStyle = {
	marginTop: "16px",
	textAlign: "center",
	color: "#6b7280",
	fontSize: "0.9rem",
};

const signupLinkStyle = {
	marginLeft: "6px",
	color: "#2563eb",
	fontWeight: 600,
	textDecoration: "none",
};

function Login() {
	const navigate = useNavigate();
	const { signIn, error: authError } = useAuth();
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.email || !formData.password) {
			setMessage("Please enter both email and password.");
			return;
		}

		setLoading(true);
		setMessage("");
		try {
			const { error } = await signIn(formData.email, formData.password);
			if (error) {
				// Better error messages
				let errorMsg = error.message || "Login failed. Please check your credentials.";
				
				if (error.message?.includes("Email not confirmed")) {
					errorMsg = "Please confirm your email first. Check your inbox for a verification link.";
				} else if (error.message?.includes("Invalid login credentials")) {
					errorMsg = "Invalid email or password. Try again or sign up for a new account.";
				} else if (error.message?.includes("User not found")) {
					errorMsg = "No account found with this email. Please sign up first.";
				}
				
				setMessage(errorMsg);
			} else {
				setMessage("Login successful! Redirecting...");
				setTimeout(() => navigate("/main"), 500);
			}
		} catch (err) {
			setMessage(err.message || "An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
		<style>{`
			@keyframes floatCard {
				0%, 100% { transform: translateY(0px) rotateX(0deg); }
				50% { transform: translateY(-10px) rotateX(2deg); }
			}
			@keyframes shimmer {
				0% { background-position: -200% center; }
				100% { background-position: 200% center; }
			}
		`}</style>
		<div style={containerStyle}>
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
				<h1 style={titleStyle}>Welcome Back</h1>
				<p style={subtitleStyle}>Sign in to continue to your account.</p>
				<p style={{...subtitleStyle, fontSize: '0.85rem', marginBottom: '20px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe'}}>
					💡 Don't have an account? <Link to="/signup" style={{...signupLinkStyle, marginLeft: 0}}>Sign up first</Link>
				</p>

				<form onSubmit={handleSubmit}>
					<label htmlFor="email" style={labelStyle}>
						Email
					</label>
					<input
						id="email"
						name="email"
						type="email"
						value={formData.email}
						onChange={handleChange}
						style={inputStyle}
						placeholder="Enter your email"
						onFocus={(e) => {
							e.target.style.borderColor = "#667eea";
							e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
						}}
						onBlur={(e) => {
							e.target.style.borderColor = "#e5e7eb";
							e.target.style.boxShadow = "none";
						}}
					/>

					<label htmlFor="password" style={labelStyle}>
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						value={formData.password}
						onChange={handleChange}
						style={inputStyle}
						placeholder="Enter your password"
						onFocus={(e) => {
							e.target.style.borderColor = "#667eea";
							e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
						}}
						onBlur={(e) => {
							e.target.style.borderColor = "#e5e7eb";
							e.target.style.boxShadow = "none";
						}}
					/>

					<button 
						type="submit" 
						style={{...buttonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}} 
						disabled={loading}
						onMouseEnter={(e) => {
							if (!loading) {
								e.target.style.transform = "translateY(-2px)";
								e.target.style.boxShadow = "0 12px 28px rgba(102, 126, 234, 0.5)";
							}
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = "translateY(0)";
							e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
						}}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>

				{message && <p style={{...helperStyle, color: message.includes('success') ? '#22c55e' : '#ef4444'}}>{message}</p>}
			{authError && <p style={{...helperStyle, color: '#ef4444'}}>{authError}</p>}

				<p style={signupRowStyle}>
					Don't have an account?
					<Link to="/signup" style={signupLinkStyle}>
						Sign up
					</Link>
				</p>
			</div>
		</div>
		</>
	);
}

export default Login;
