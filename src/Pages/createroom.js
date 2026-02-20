import React, { useState, useEffect, useRef } from "react";
import { Check, Copy, Sparkles, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  padding: "24px",
  boxSizing: "border-box",
};

const containerStyle = {
  width: "100%",
  maxWidth: "420px",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
};

const mascotStyle = {
  fontSize: "48px",
  marginBottom: "16px",
  display: "inline-block",
  transition: "transform 0.3s ease",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: 900,
  color: "#1f2937",
  margin: "0 0 8px 0",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "8px 0 0 0",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
  border: "1px solid #f3f4f6",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  transformStyle: "preserve-3d",
  position: "relative",
};

const formGroupStyle = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#9ca3af",
  marginBottom: "8px",
  marginLeft: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 16px",
  borderRadius: "16px",
  border: "2px solid #f3f4f6",
  fontSize: "14px",
  background: "#f9fafb",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  outline: "none",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "16px",
};

const infoBoxStyle = {
  padding: "12px 16px",
  background: "#f3e8ff",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "13px",
  color: "#6d28d9",
  marginBottom: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "none",
  background: "#9333ea",
  color: "white",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 8px 16px rgba(147, 51, 234, 0.3)",
};

const successPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(to bottom right, #fce7f3, #faf5ff, #cffafe)",
  padding: "24px",
  boxSizing: "border-box",
};

const successContainerStyle = {
  width: "100%",
  maxWidth: "480px",
};

const successCardStyle = {
  background: "#ffffff",
  borderRadius: "32px",
  padding: "40px",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
  border: "1px solid #ffffff",
  textAlign: "center",
};

const iconWrapStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "#10b981",
  margin: "0 auto 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
};

const successTitleStyle = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#1f2937",
  margin: "0 0 12px 0",
};

const successSubtitleStyle = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 24px 0",
};

const pinBoxStyle = {
  background: "#f9fafb",
  borderRadius: "20px",
  padding: "32px",
  marginBottom: "24px",
  border: "2px dashed #d5b3ff",
};

const pinLabelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  color: "#a855f7",
  textTransform: "uppercase",
  marginBottom: "12px",
  letterSpacing: "1px",
};

const pinStyle = {
  fontSize: "48px",
  fontWeight: 900,
  color: "#a855f7",
  letterSpacing: "4px",
  margin: "0",
};

const copyButtonStyle = {
  marginTop: "16px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#a855f7",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0",
};

const backButtonStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "none",
  background: "#1f2937",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
};

const cameraButtonStyle = {
  padding: "12px 16px",
  borderRadius: "16px",
  border: "2px solid #a855f7",
  background: "white",
  color: "#a855f7",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s",
  marginTop: "8px",
};

const cameraPreviewStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "black",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const videoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const captureButtonsStyle = {
  position: "absolute",
  bottom: "40px",
  display: "flex",
  gap: "16px",
};

const captureBtnStyle = {
  padding: "12px 24px",
  borderRadius: "50%",
  border: "none",
  background: "#10b981",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

const cancelBtnStyle = {
  padding: "12px 24px",
  borderRadius: "50%",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
};

const capturedImageStyle = {
  width: "100%",
  maxHeight: "200px",
  borderRadius: "16px",
  marginTop: "12px",
  objectFit: "contain",
};

const receiptProofStyle = {
  position: "absolute",
  top: "16px",
  right: "16px",
  width: "80px",
  height: "80px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  border: "3px solid #10b981",
  cursor: "pointer",
  transition: "transform 0.2s ease",
  zIndex: 10,
};

const receiptProofImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const receiptBadgeStyle = {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  background: "linear-gradient(to top, rgba(16, 185, 129, 0.95), transparent)",
  color: "white",
  fontSize: "9px",
  fontWeight: "700",
  textAlign: "center",
  padding: "4px 2px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export function CreateRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    roomName: "",
    totalAmount: "",
    numberOfMembers: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPin, setGeneratedPin] = useState(null);
  const [createdRoomId, setCreatedRoomId] = useState(null);
  const [mascot, setMascot] = useState("🏠");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [pinCopied, setPinCopied] = useState(false);
  const [paymentDueAt, setPaymentDueAt] = useState("");

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraActive(true);
      
      // Small delay to ensure state updates before accessing ref
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera access denied. Please check browser permissions.\n\nError: " + error.message);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video dimensions are loaded
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
      } else {
        alert("Video not ready yet. Please try again.");
      }
    } else {
      alert("Camera reference not available.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const clearPhoto = () => {
    setCapturedImage(null);
  };

  const uploadReceipt = async (roomId) => {
    if (!capturedImage) return null;

    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const filePath = `${roomId}/receipt-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase
      .storage
      .from("receipts")
      .upload(filePath, blob, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from("receipts")
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  };

  useEffect(() => {
    if (Number(formData.totalAmount) > 10000) setMascot("💰");
    else if (Number(formData.numberOfMembers) > 5) setMascot("👨‍👩‍👧‍👦");
    else if (formData.roomName.length > 0) setMascot("✍️");
    else setMascot("🏠");
  }, [formData]);

  const generatePin = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomName.trim())
      newErrors.roomName = "Give your castle a name!";
    if (!formData.totalAmount || Number(formData.totalAmount) <= 0)
      newErrors.totalAmount = "Enter a valid amount.";
    if (!formData.numberOfMembers || Number(formData.numberOfMembers) < 1)
      newErrors.numberOfMembers = "Need at least 1 person.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user?.id) {
      setErrors({ roomName: "Please login again to create a room." });
      return;
    }

    setIsSubmitting(true);

    try {
      let createdRoom = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const pin = generatePin();
        const { data, error } = await supabase
          .from("rooms")
          .insert({
            room_name: formData.roomName.trim(),
            pin_code: pin,
            created_by: user.id,
            payment_due_at: paymentDueAt ? new Date(paymentDueAt).toISOString() : null,
            description: JSON.stringify({
              totalAmount: Number(formData.totalAmount),
              numberOfMembers: Number(formData.numberOfMembers),
              notes: "Created from Billbuddy room form",
            }),
          })
          .select("id, pin_code")
          .single();

        if (!error && data) {
          createdRoom = data;
          break;
        }

        if (error && error.code !== "23505") {
          throw error;
        }
      }

      if (!createdRoom) {
        throw new Error("Unable to generate a unique PIN. Please try again.");
      }

      const { error: memberInsertError } = await supabase
        .from("room_members")
        .insert([{ room_id: createdRoom.id, user_id: user.id }]);

      if (memberInsertError && memberInsertError.code !== "23505") {
        throw memberInsertError;
      }

      if (capturedImage) {
        try {
          const receiptUrl = await uploadReceipt(createdRoom.id);
          if (receiptUrl) {
            const { error: receiptUpdateError } = await supabase
              .from("rooms")
              .update({ receipt_url: receiptUrl })
              .eq("id", createdRoom.id);

            if (receiptUpdateError) {
              console.error("Receipt URL update failed:", receiptUpdateError);
            }
          }
        } catch (uploadError) {
          console.error("Receipt upload failed:", uploadError);
        }
      }

      setCreatedRoomId(createdRoom.id);
      setGeneratedPin(createdRoom.pin_code);
    } catch (error) {
      setErrors({ roomName: error.message || "Failed to create room." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (cameraActive) {
    return (
      <div style={cameraPreviewStyle}>
        <video
          ref={videoRef}
          style={videoStyle}
          autoPlay
          playsInline
          muted
          // @ts-ignore
          webkit-playsinline="true"
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={captureButtonsStyle}>
          <button
            onClick={capturePhoto}
            style={captureBtnStyle}
            type="button"
          >
            📸
          </button>
          <button
            onClick={stopCamera}
            style={cancelBtnStyle}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (generatedPin) {
    return (
      <div style={successPageStyle}>
        <div style={successContainerStyle}>
          <div style={successCardStyle}>
            <div style={iconWrapStyle}>
              <Check size={40} color="white" />
            </div>
            <h1 style={successTitleStyle}>Room Created!</h1>
            <p style={successSubtitleStyle}>
              Share this PIN with your roommates.
            </p>

            <div style={pinBoxStyle}>
              <p style={pinLabelStyle}>Room PIN</p>
              <p style={pinStyle}>{generatedPin}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPin);
                  setPinCopied(true);
                  setTimeout(() => setPinCopied(false), 1500);
                }}
                style={copyButtonStyle}
              >
                <Copy size={16} /> Copy PIN
              </button>
              {pinCopied && (
                <div style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#10b981",
                  fontWeight: 600
                }}>
                  Copied to clipboard
                </div>
              )}
            </div>

            <button
              onClick={() => createdRoomId && navigate(`/room/${createdRoomId}`)}
              style={{...backButtonStyle, background: '#9333ea', marginBottom: '12px'}}
            >
              Enter Room
            </button>

            <button
              onClick={() => {
                setGeneratedPin(null);
                setFormData({
                  roomName: "",
                  totalAmount: "",
                  numberOfMembers: "",
                });
                setCreatedRoomId(null);
              }}
              style={backButtonStyle}
            >
              Back to Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={mascotStyle}>{mascot}</div>
          <h1 style={titleStyle}>Create a Room</h1>
          <p style={subtitleStyle}>Set up your shared expenses</p>
        </div>

        <div
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotateX(4deg) rotateY(-4deg) translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 30px 50px rgba(15, 23, 42, 0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.08)";
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Room Name</label>
              <input
                type="text"
                value={formData.roomName}
                onChange={(e) => handleChange("roomName", e.target.value)}
                placeholder="e.g. Summer Trip 2024 "
                style={{
                  ...inputStyle,
                  borderColor: errors.roomName ? "#fca5a5" : "#f3f4f6",
                }}
              />
              {errors.roomName && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px", marginBottom: 0 }}>
                  {errors.roomName}
                </p>
              )}
            </div>

            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Total (₹)</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange("totalAmount", e.target.value)}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Members</label>
                <input
                  type="number"
                  value={formData.numberOfMembers}
                  onChange={(e) =>
                    handleChange("numberOfMembers", e.target.value)
                  }
                  placeholder="1"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Payment Due Date</label>
              <input
                type="datetime-local"
                value={paymentDueAt}
                onChange={(e) => setPaymentDueAt(e.target.value)}
                style={inputStyle}
              />
            </div>

            {!capturedImage && (
              <button
                type="button"
                onClick={startCamera}
                style={cameraButtonStyle}
              >
                <Camera size={18} /> Snap Receipt
              </button>
            )}

            {capturedImage && (
              <>
                <div style={receiptProofStyle} title="Receipt captured - Click to remove">
                  <img src={capturedImage} alt="Receipt Proof" style={receiptProofImageStyle} />
                  <div style={receiptBadgeStyle}>✓ Proof</div>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  >
                    ×
                  </button>
                </div>
                <div style={{ 
                  marginTop: "16px", 
                  padding: "12px", 
                  background: "#f0fdf4", 
                  borderRadius: "12px",
                  border: "1px solid #86efac",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#15803d",
                  fontWeight: "600"
                }}>
                  <span style={{ fontSize: "16px" }}>✓</span>
                  Receipt captured successfully
                </div>
              </>
            )}

            {formData.totalAmount && formData.numberOfMembers > 0 && (
              <div style={infoBoxStyle}>
                <Sparkles size={16} />
                <span>
                  Each pays:{" "}
                  <b>
                    ₹
                    {(
                      Number(formData.totalAmount) /
                      Number(formData.numberOfMembers)
                    ).toFixed(2)}
                  </b>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...buttonStyle,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Building Room..." : "Launch Room 🚀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}