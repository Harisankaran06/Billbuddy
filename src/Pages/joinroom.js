import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

export function JoinRoom() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePinChange = (value) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setPin(numericValue);
    if (error) {
      setError("");
    }
  };

  const validatePin = () => {
    if (!pin) {
      setError("Please enter a PIN");
      return false;
    }
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePin()) {
      return;
    }

    if (!user?.id) {
      setError("Please login again to join a room");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id, pin_code")
        .eq("pin_code", pin)
        .single();

      if (roomError || !room) {
        setError("Room not found for this PIN");
        setIsSubmitting(false);
        return;
      }

      const { error: joinError } = await supabase
        .from("room_members")
        .upsert([{ room_id: room.id, user_id: user.id }], {
          onConflict: "room_id,user_id"
        });

      if (joinError) {
        throw joinError;
      }

      setJoinedRoomId(room.id);
      setSuccess(true);
    } catch (joinErr) {
      setError(joinErr.message || "Failed to join room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (success) {
      setSuccess(false);
      setPin("");
      setJoinedRoomId(null);
    } else {
      navigate("/main");
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundImage: "linear-gradient(135deg, #f0f9ff 0%, #f3f4f6 50%, #faf5ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px"
  };

  const containerStyle = {
    width: "100%",
    maxWidth: "448px"
  };

  const backButtonStyle = {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1f2937",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    opacity: 1,
    transition: "opacity 0.2s"
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    transformStyle: "preserve-3d"
  };

  const checkIconStyle = {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#06b6d4",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px"
  };

  const headingStyle = {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1f2937"
  };

  const descriptionStyle = {
    color: "#6b7280",
    fontSize: "14px"
  };

  const listStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontSize: "14px"
  };

  const listItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: error ? "2px solid #dc2626" : "1px solid #d1d5db",
    backgroundColor: "white",
    fontSize: "24px",
    letterSpacing: "8px",
    fontFamily: "monospace",
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box"
  };

  const inputFocusStyle = {
    outline: "none",
    backgroundColor: "white",
    borderColor: error ? "#dc2626" : "#06b6d4"
  };

  const errorStyle = {
    marginTop: "6px",
    fontSize: "12px",
    color: "#dc2626",
    textAlign: "center"
  };

  const infoBoxStyle = {
    backgroundImage: "linear-gradient(90deg, #ecf5ff 0%, #e0f2ff 100%)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px"
  };

  const infoParagraphStyle = {
    fontWeight: "500",
    marginBottom: "12px",
    color: "#1f2937"
  };

  const submitButtonStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "#06b6d4",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.5 : 1,
    transition: "background-color 0.2s",
    marginTop: "24px"
  };

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <button
            onClick={handleBack}
            style={backButtonStyle}
            onMouseEnter={(e) => e.target.style.opacity = "0.7"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            <svg
              style={{ width: "20px", height: "20px" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateX(4deg) rotateY(-4deg) translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 24px 36px rgba(15, 23, 42, 0.16)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={checkIconStyle}>
                <Check style={{ width: "32px", height: "32px", color: "white" }} />
              </div>
              <h1 style={headingStyle}>Successfully Joined!</h1>
              <p style={descriptionStyle}>You're now part of the room</p>
            </div>

            <div style={listStyle}>
              <div style={listItemStyle}>
                <Check style={{ width: "20px", height: "20px", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={descriptionStyle}>You can now see all room details</p>
              </div>
              <div style={listItemStyle}>
                <Check style={{ width: "20px", height: "20px", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={descriptionStyle}>Chat with other members</p>
              </div>
              <div style={listItemStyle}>
                <Check style={{ width: "20px", height: "20px", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={descriptionStyle}>View shared expenses</p>
              </div>
              <div style={listItemStyle}>
                <Check style={{ width: "20px", height: "20px", color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                <p style={descriptionStyle}>Play games together</p>
              </div>
            </div>

            <button
              onClick={() => joinedRoomId && navigate(`/room/${joinedRoomId}`)}
              style={{
                width: "100%",
                padding: "12px 16px",
                marginTop: "24px",
                borderRadius: "8px",
                backgroundColor: "#06b6d4",
                color: "white",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              Enter Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <button
          onClick={handleBack}
          style={backButtonStyle}
          onMouseEnter={(e) => e.target.style.opacity = "0.7"}
          onMouseLeave={(e) => e.target.style.opacity = "1"}
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotateX(4deg) rotateY(-4deg) translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 24px 36px rgba(15, 23, 42, 0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1 style={headingStyle}>Join a Room</h1>
            <p style={descriptionStyle}>
              Enter the 6-digit PIN from the room owner to join and start sharing expenses.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="pin" style={{ display: "block", marginBottom: "8px", textAlign: "center", fontWeight: "500", color: "#1f2937" }}>
                6-Digit Room PIN
              </label>
              <input
                id="pin"
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "#dc2626" : "#d1d5db";
                  e.target.style.outline = "none";
                }}
                placeholder="000000"
                maxLength={6}
              />
              {error && <p style={errorStyle}>{error}</p>}
            </div>

            

            <button
              type="submit"
              disabled={isSubmitting}
              style={submitButtonStyle}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = "#0891b2")}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = "#06b6d4")}
            >
              {isSubmitting ? "Joining Room..." : "Join Room"}
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
            Don't have a PIN? Ask the room owner to share one with you.
          </p>
        </div>
      </div>
    </div>
  );
}
