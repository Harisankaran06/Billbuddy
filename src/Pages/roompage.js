import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { 
  Hash, CheckCircle, AlertCircle, Users, Phone
} from "lucide-react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

export default function RoomView({ roomName = "Dream House" }) {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [isOpening, setIsOpening] = useState(true);
  const [roomLabel, setRoomLabel] = useState(roomName);
  const [receiptUrl, setReceiptUrl] = useState("");
  const receiptRetryRef = useRef(0);
  const [paymentDueAt, setPaymentDueAt] = useState("");
  const [dueInput, setDueInput] = useState("");
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [dueStatus, setDueStatus] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const [members, setMembers] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [numberOfMembers, setNumberOfMembers] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [balances, setBalances] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    memberIds: []
  });
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    category: "General"
  });

  // Logic to calculate share per person
  const shareCount = members.length > 0 ? members.length : Number(numberOfMembers || 0);
  const individualShare = shareCount > 0 ? (totalAmount / shareCount).toFixed(2) : "0.00";

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toLocalInputValue = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const formatRemaining = (targetIso) => {
    if (!targetIso) return "";
    const diffMs = new Date(targetIso).getTime() - nowTick;
    if (Number.isNaN(diffMs)) return "";
    if (diffMs <= 0) return "Overdue";
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const refreshMembers = useCallback(async () => {
    if (!roomId) return;

    const { data: memberData, error: memberError } = await supabase
      .from("room_members")
      .select(`
        user_id,
        has_paid,
        paid_at,
        profiles (
          id,
          display_name,
          username,
          phone
        )
      `)
      .eq("room_id", roomId);

    if (memberError) {
      console.error("Error fetching members:", memberError);
      return;
    }

    const colors = ["#7c3aed", "#5865f2", "#f59e0b", "#10b981", "#ec4899", "#f97316"];

    const formattedMembers = (memberData || []).map((member, index) => ({
      id: member.user_id,
      name: member.profiles?.display_name || member.profiles?.username || "User",
      phone: member.profiles?.phone || "",
      hasPaid: Boolean(member.has_paid),
      paidAt: member.paid_at,
      color: colors[index % colors.length]
    }));

    setMembers(formattedMembers);
  }, [roomId]);

  const refreshBalances = useCallback(async (expenseData) => {
    if (!roomId) return;
    if (!members.length) {
      setBalances([]);
      return;
    }

    const currentExpenses = expenseData || expenses;
    if (!currentExpenses.length) {
      setBalances(members.map(member => ({
        id: member.id,
        name: member.name,
        totalPaid: 0,
        totalOwed: 0,
        net: 0
      })));
      return;
    }

    const expenseIds = currentExpenses.map(expense => expense.id);
    const { data: splitData, error: splitError } = await supabase
      .from("expense_splits")
      .select("expense_id, user_id, split_amount")
      .in("expense_id", expenseIds);

    if (splitError) {
      console.error("Error fetching splits:", splitError);
      return;
    }

    const paidTotals = new Map();
    currentExpenses.forEach(expense => {
      const prev = paidTotals.get(expense.paid_by) || 0;
      paidTotals.set(expense.paid_by, prev + Number(expense.amount));
    });

    const owedTotals = new Map();
    (splitData || []).forEach(split => {
      const prev = owedTotals.get(split.user_id) || 0;
      owedTotals.set(split.user_id, prev + Number(split.split_amount));
    });

    setBalances(members.map(member => {
      const totalPaid = paidTotals.get(member.id) || 0;
      const totalOwed = owedTotals.get(member.id) || 0;
      return {
        id: member.id,
        name: member.name,
        totalPaid,
        totalOwed,
        net: Number((totalPaid - totalOwed).toFixed(2))
      };
    }));
  }, [roomId, members, expenses]);

  const refreshExpenses = useCallback(async () => {
    if (!roomId) return;

    setExpensesLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, description, category, created_at, paid_by")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      setExpensesLoading(false);
      return;
    }

    const nameById = new Map(members.map(member => [member.id, member.name]));
    const formatted = (data || []).map(expense => ({
      ...expense,
      paidByName: nameById.get(expense.paid_by) || "Member"
    }));

    setExpenses(formatted);
    setExpensesLoading(false);
    await refreshBalances(formatted);
  }, [roomId, members, refreshBalances]);

  const refreshGroups = useCallback(async () => {
    if (!roomId) return;

    setGroupsLoading(true);
    const { data, error } = await supabase
      .from("groups")
      .select(`
        id,
        group_name,
        created_by,
        group_members (
          user_id,
          profiles (
            display_name,
            username,
            phone
          )
        )
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
      setGroupsLoading(false);
      return;
    }

    const formatted = (data || []).map(group => ({
      id: group.id,
      name: group.group_name,
      createdBy: group.created_by,
      members: (group.group_members || []).map(member => ({
        id: member.user_id,
        name: member.profiles?.display_name || member.profiles?.username || "User",
        phone: member.profiles?.phone || ""
      }))
    }));

    setGroups(formatted);
    setGroupsLoading(false);
  }, [roomId]);

  const openGroupModal = () => {
    // Auto-select the logged-in user when opening the modal
    if (user?.id && !groupForm.memberIds.includes(user.id)) {
      setGroupForm(prev => ({
        ...prev,
        memberIds: [user.id]
      }));
    }
    setIsGroupOpen(true);
  };
  const closeGroupModal = () => {
    setIsGroupOpen(false);
    setGroupForm({ name: "", memberIds: [] });
  };

  const handleGroupChange = (field, value) => {
    setGroupForm(prev => ({ ...prev, [field]: value }));
  };

  const handleGroupMembersChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map(option => option.value);
    if (user?.id && !selected.includes(user.id)) {
      selected.unshift(user.id);
    }
    handleGroupChange("memberIds", selected);
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Please log in to create a group.");
      return;
    }
    if (!roomId) {
      alert("Missing room information.");
      return;
    }

    const groupName = groupForm.name.trim();
    if (!groupName) {
      alert("Please enter a group name.");
      return;
    }

    const { data: groupData, error } = await supabase
      .from("groups")
      .insert({
        room_id: roomId,
        group_name: groupName,
        created_by: user.id
      })
      .select("id")
      .single();

    if (error || !groupData) {
      alert(error?.message || "Failed to create group.");
      return;
    }

    const uniqueMemberIds = Array.from(new Set([user.id, ...groupForm.memberIds]));
    const groupRows = uniqueMemberIds.map(memberId => ({
      group_id: groupData.id,
      user_id: memberId
    }));

    const { error: memberError } = await supabase
      .from("group_members")
      .insert(groupRows);

    if (memberError) {
      alert(memberError.message || "Failed to add group members.");
      return;
    }

    setGroupForm({ name: "", memberIds: [] });
    setIsGroupOpen(false);
    refreshGroups();
  };

  // Fetching room data from Supabase
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("room_name, description, receipt_url, payment_due_at, created_by")
        .eq("id", roomId)
        .single();

      if (roomError || !roomData) {
        console.error("Error fetching room:", roomError);
        return;
      }

      setRoomLabel(roomData.room_name || roomName);
      setReceiptUrl(roomData.receipt_url || "");
      setPaymentDueAt(roomData.payment_due_at || "");
      setDueInput(toLocalInputValue(roomData.payment_due_at || ""));
      setIsRoomOwner(Boolean(user?.id && roomData.created_by === user.id));
      
      // Parse description to get total amount and number of members
      try {
        const parsed = JSON.parse(roomData.description);
        setTotalAmount(parsed.totalAmount || 0);
        setNumberOfMembers(parsed.numberOfMembers || 0);
      } catch (e) {
        console.error("Error parsing room description:", e);
      }

      // Ensure current user is registered as a room member
      if (user?.id) {
        const { error: joinError } = await supabase
          .from("room_members")
          .upsert([{ room_id: roomId, user_id: user.id }], {
            onConflict: "room_id,user_id"
          });

        if (joinError) {
          console.error("Failed to join room members:", joinError);
        }
      }

      await refreshMembers();
    };

    fetchRoomData();
  }, [roomId, roomName, user?.id, refreshMembers]);

  const handleSaveDueAt = async () => {
    if (!roomId) return;
    if (!dueInput) {
      setDueStatus("Pick a deadline first.");
      return;
    }
    const isoDue = new Date(dueInput).toISOString();
    const { error } = await supabase
      .from("rooms")
      .update({ payment_due_at: isoDue })
      .eq("id", roomId);

    if (error) {
      setDueStatus(error.message || "Unable to save deadline.");
      return;
    }

    setPaymentDueAt(isoDue);
    setDueStatus("Deadline saved.");
    setTimeout(() => setDueStatus(""), 2000);
  };

  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  useEffect(() => {
    if (!roomId) return;
    if (receiptUrl) return;

    let isActive = true;

    const fetchReceipt = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("receipt_url")
        .eq("id", roomId)
        .single();

      if (!isActive) return;

      if (!error && data?.receipt_url) {
        setReceiptUrl(data.receipt_url);
        return;
      }

      if (receiptRetryRef.current < 4) {
        receiptRetryRef.current += 1;
        setTimeout(fetchReceipt, 1500);
      }
    };

    receiptRetryRef.current = 0;
    fetchReceipt();

    return () => {
      isActive = false;
    };
  }, [roomId, receiptUrl]);

  const handlePaid = async () => {
    if (!user?.id) {
      alert("Please log in to mark payment.");
      return;
    }
    if (!roomId) {
      alert("Missing room information.");
      return;
    }

    const { error } = await supabase
      .from("room_members")
      .update({ has_paid: true, paid_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message || "Failed to record payment.");
      return;
    }

    setMembers(prev => prev.map(m => 
      m.id === user.id ? { ...m, hasPaid: true, paidAt: new Date().toISOString() } : m
    ));
    setPaymentStatus("Success! Your share of ₹" + individualShare + " has been recorded.");
  };

  const openExpenseModal = () => {
    const fallbackPaidBy = members.find(m => m.id === user?.id)?.id || members[0]?.id || "";
    setExpenseForm(prev => ({ ...prev, paidBy: prev.paidBy || fallbackPaidBy }));
    setIsExpenseOpen(true);
  };
  const closeExpenseModal = () => setIsExpenseOpen(false);

  const handleExpenseChange = (field, value) => {
    setExpenseForm(prev => ({ ...prev, [field]: value }));
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Please log in to add an expense.");
      return;
    }

    if (!roomId) {
      alert("Missing room information.");
      return;
    }

    const amountValue = Number(expenseForm.amount);
    if (!expenseForm.description.trim() || Number.isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    if (!members.length) {
      alert("Room members are still loading. Please try again in a moment.");
      return;
    }

    const paidById = expenseForm.paidBy || user?.id;
    if (!paidById) {
      alert("Please select who paid for this expense.");
      return;
    }

    const { data: expenseData, error } = await supabase
      .from("expenses")
      .insert([
        {
          room_id: roomId,
          paid_by: paidById,
          amount: amountValue,
          description: expenseForm.description.trim(),
          category: expenseForm.category || "General"
        }
      ])
      .select("id")
      .single();

    if (error) {
      alert(error.message || "Failed to add expense.");
      return;
    }

    const splitAmount = Number((amountValue / members.length).toFixed(2));
    const splitRows = members.map(member => ({
      expense_id: expenseData.id,
      user_id: member.id,
      split_amount: splitAmount
    }));

    const { error: splitError } = await supabase
      .from("expense_splits")
      .insert(splitRows);

    if (splitError) {
      alert(splitError.message || "Expense saved, but splits failed.");
      return;
    }

    setExpenseForm({ description: "", amount: "", paidBy: "", category: "General" });
    setIsExpenseOpen(false);
    refreshExpenses();
  };

  return (
    <div className="room-container">
      <style>{`
        :root {
          --bg-sidebar: rgba(255, 255, 255, 0.95);
          --bg-channels: #ffffff;
          --bg-chat: #f3f4f6;
          --accent-purple: #667eea;
          --discord-blue: #5865f2;
          --text-main: #1f2937;
          --text-muted: #6b7280;
          --success: #10b981;
          --danger: #ef4444;
          --border-color: rgba(255, 255, 255, 0.3);
        }

        .room-container { 
          width: 100%; 
          min-height: 100vh; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: var(--text-main); 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          overflow: auto;
          position: relative;
          perspective: 1200px;
        }
        
        .door-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          display: flex; 
          z-index: 9999; 
          pointer-events: none; 
        }
        
        .panel { 
          flex: 1; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          height: 100%; 
          transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1); 
        }
        
        .panel-left { 
          border-right: 1px solid rgba(255,255,255,0.2); 
          transform: translateX(0); 
        }
        
        .panel-right { 
          transform: translateX(0); 
        }
        
        .doors-open .panel-left { 
          transform: translateX(-100%); 
        }
        
        .doors-open .panel-right { 
          transform: translateX(100%); 
        }
        
        .layout { 
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
        }
        
        .sidebar { 
          background: var(--bg-sidebar);
          backdrop-filter: blur(20px);
          display: flex; 
          flex-direction: column; 
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          transform-style: preserve-3d;
          animation: slideInLeft 0.6s ease-out;
        }

        .sidebar:hover {
          transform: rotateY(-3deg) translateX(-6px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
        }
        
        .main-content { 
          background: var(--bg-sidebar);
          backdrop-filter: blur(20px);
          display: flex; 
          flex-direction: column; 
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          transform-style: preserve-3d;
          animation: slideInRight 0.6s ease-out;
          position: relative;
        }

        .main-content:hover {
          transform: rotateY(3deg) translateX(6px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
        }

        /* Sidebar Members */
        .member-item { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          padding: 10px 12px; 
          border-radius: 12px; 
          margin: 6px 12px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .member-item:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateX(6px);
        }
        
        .status-dot { 
          width: 10px; 
          height: 10px; 
          border-radius: 50%; 
          margin-left: auto;
          box-shadow: 0 0 8px currentColor;
        }

        /* Summary Card */
        .summary-card { 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px; 
          padding: 24px; 
          border: 1px solid rgba(102, 126, 234, 0.15);
          margin-bottom: 20px; 
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transition: all 0.4s ease;
          transform-style: preserve-3d;
        }

        .summary-card:hover {
          transform: translateY(-6px) rotateX(3deg);
          box-shadow: 0 16px 40px rgba(102, 126, 234, 0.2);
        }
        
        .debt-line { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .debt-line:last-child {
          border-bottom: none;
        }

        .payment-box { 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          margin: 0 20px 20px; 
          padding: 20px; 
          border-radius: 16px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border: 1px solid rgba(102, 126, 234, 0.15);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .payment-box:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
        }
        
        .pay-btn { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          border: none; 
          padding: 12px 28px; 
          border-radius: 12px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .pay-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .expense-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .expense-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.5);
        }

        .timer-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(102, 126, 234, 0.12);
          color: #4338ca;
          font-size: 12px;
          font-weight: 700;
        }

        .timer-overdue {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }

        .timer-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .timer-input {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(102, 126, 234, 0.2);
          background: rgba(255, 255, 255, 0.95);
          font-size: 12px;
        }

        .timer-save {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          border: none;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .timer-status {
          font-size: 12px;
          color: var(--text-muted);
        }

        .receipt-proof {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 84px;
          height: 84px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid #10b981;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
          z-index: 5;
          background: #ffffff;
        }

        .receipt-proof img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .receipt-proof span {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #ffffff;
          text-align: center;
          padding: 4px 2px;
          background: linear-gradient(to top, rgba(16, 185, 129, 0.95), transparent);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: fadeIn 0.3s ease;
        }

        .modal-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          border: 1px solid rgba(255, 255, 255, 0.8);
          animation: scaleIn 0.3s ease;
          transform-style: preserve-3d;
        }

        .modal-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .modal-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 2px solid rgba(102, 126, 234, 0.2);
          background: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .modal-input:focus {
          border-color: var(--accent-purple);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .secondary-btn {
          background: #e5e7eb;
          color: #111827;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: #d1d5db;
          transform: translateY(-2px);
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className={`door-overlay ${!isOpening ? "doors-open" : ""}`}>
        <div className="panel panel-left"></div>
        <div className="panel panel-right"></div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div style={{
            padding: '16px', 
            fontWeight: 'bold', 
            borderBottom: '2px solid var(--border-color)',
            fontSize: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            {roomLabel}
          </div>
          <div style={{padding: '20px 16px'}}>
            <div style={{
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: 'var(--text-muted)', 
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ROOMMATES ({members.length}/{numberOfMembers})
            </div>
            {members.length === 0 ? (
              <div style={{fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0'}}>
                Loading members...
              </div>
            ) : (
              members.map(m => (
                <div key={m.id} className="member-item">
                  <div style={{
                    width: 30, 
                    height: 30, 
                    background: m.color, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{fontSize: '14px', color: 'var(--text-main)', fontWeight: '500', flex: 1}}>{m.name}</div>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} style={{color: '#667eea', marginRight: '8px'}} title="Call">
                      <Phone size={16} />
                    </a>
                  )}
                  <div className="status-dot" style={{background: m.hasPaid ? 'var(--success)' : 'var(--danger)'}}></div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="main-content">
          {receiptUrl && (
            <a
              className="receipt-proof"
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Receipt proof"
            >
              <img src={receiptUrl} alt="Receipt proof" />
              <span>Proof</span>
            </a>
          )}
          <header style={{
            height: '56px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 20px', 
            borderBottom: '1px solid var(--border-color)',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Hash size={20} color="#7c3aed" /> 
              <span style={{fontWeight: 'bold', marginLeft: '8px', color: 'var(--text-main)'}}>
                {roomLabel} · expense-ledger
              </span>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="expense-btn" onClick={openGroupModal}>
                Create Group
              </button>
              <button className="expense-btn" onClick={openExpenseModal}>
                Add Expense
              </button>
            </div>
          </header>

          <div className="messages-area" style={{padding: '20px', background: 'var(--bg-chat)', flex: 1, overflowY: 'auto'}}>
            {/* Room Summary Card */}
            <div className="summary-card" style={{marginBottom: '16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <Hash size={20} color="var(--accent-purple)" />
                <b style={{fontSize: '16px', color: 'var(--text-main)'}}>Room Details</b>
              </div>
              <div className="debt-line" style={{alignItems: 'center'}}>
                <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Payment Deadline</span>
                {paymentDueAt ? (
                  <span className={`timer-chip ${formatRemaining(paymentDueAt) === 'Overdue' ? 'timer-overdue' : ''}`}>
                    {formatRemaining(paymentDueAt)}
                  </span>
                ) : (
                  <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Not set</span>
                )}
              </div>
              {paymentDueAt && (
                <div className="debt-line" style={{borderBottom: 'none'}}>
                  <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Due At</span>
                  <span style={{color: 'var(--text-main)', fontWeight: '600'}}>
                    {new Date(paymentDueAt).toLocaleString()}
                  </span>
                </div>
              )}
              {isRoomOwner && (
                <div className="timer-row">
                  <input
                    className="timer-input"
                    type="datetime-local"
                    value={dueInput}
                    onChange={(e) => setDueInput(e.target.value)}
                  />
                  <button className="timer-save" type="button" onClick={handleSaveDueAt}>
                    Save Deadline
                  </button>
                  {dueStatus && <span className="timer-status">{dueStatus}</span>}
                </div>
              )}
              <div className="debt-line">
                <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Total Amount</span>
                <span style={{color: 'var(--accent-purple)', fontWeight: 'bold', fontSize: '16px'}}>₹{totalAmount}</span>
              </div>
              <div className="debt-line">
                <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Number of Members</span>
                <span style={{color: 'var(--accent-purple)', fontWeight: 'bold', fontSize: '16px'}}>{numberOfMembers}</span>
              </div>
              <div className="debt-line" style={{borderBottom: 'none'}}>
                <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>Share per Person</span>
                <span style={{color: 'var(--success)', fontWeight: 'bold', fontSize: '16px'}}>₹{individualShare}</span>
              </div>
            </div>

            {/* Payment Tracking Card */}
            <div className="summary-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <AlertCircle size={20} color="var(--accent-purple)" />
                <b style={{fontSize: '16px', color: 'var(--text-main)'}}>Payment Tracking</b>
              </div>
              {members.length === 0 ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  Loading members...
                </div>
              ) : (
                members.map(m => (
                  <div key={m.id} className="debt-line">
                    <span style={{color: 'var(--text-main)', fontWeight: '500'}}>{m.name}</span>
                    <span style={{color: m.hasPaid ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold'}}>
                      {m.hasPaid ? "✓ Settled" : `₹${individualShare}`}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Member Balances */}
            <div className="summary-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <Users size={20} color="var(--accent-purple)" />
                <b style={{fontSize: '16px', color: 'var(--text-main)'}}>Member Balances</b>
              </div>
              {balances.length === 0 ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  No balance data yet
                </div>
              ) : (
                balances.map(balance => (
                  <div key={balance.id} className="debt-line" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '6px'}}>
                    <div style={{fontWeight: '600', color: 'var(--text-main)', fontSize: '14px'}}>{balance.name}</div>
                    <div style={{display: 'flex', gap: '16px', fontSize: '12px'}}>
                      <span>Paid: <strong style={{color: 'var(--success)'}}>₹{balance.totalPaid.toFixed(2)}</strong></span>
                      <span>Owed: <strong style={{color: 'var(--danger)'}}>₹{balance.totalOwed.toFixed(2)}</strong></span>
                      <span>Net: <strong style={{color: balance.net >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                        {balance.net >= 0 ? '+' : ''}₹{balance.net.toFixed(2)}
                      </strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Groups */}
            <div className="summary-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <Users size={20} color="var(--accent-purple)" />
                <b style={{fontSize: '16px', color: 'var(--text-main)'}}>Groups</b>
              </div>
              {groupsLoading ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  Loading groups...
                </div>
              ) : groups.length === 0 ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  No groups yet. Create one to organize roommates.
                </div>
              ) : (
                groups.map(group => (
                  <div key={group.id} className="debt-line" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px'}}>
                    <div style={{fontWeight: '600', color: 'var(--text-main)', fontSize: '14px'}}>{group.name}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}: {group.members.slice(0, 3).map(m => m.name).join(', ')}
                      {group.members.length > 3 && ` +${group.members.length - 3} more`}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent Expenses */}
            <div className="summary-card">
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px'}}>
                <Hash size={20} color="var(--accent-purple)" />
                <b style={{fontSize: '16px', color: 'var(--text-main)'}}>Recent Expenses</b>
              </div>
              {expensesLoading ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  Loading expenses...
                </div>
              ) : expenses.length === 0 ? (
                <div style={{color: 'var(--text-muted)', fontSize: '14px', padding: '10px 0'}}>
                  No expenses yet. Add one to get started.
                </div>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="debt-line" style={{alignItems: 'center'}}>
                    <div>
                      <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{expense.description}</div>
                      <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                        {expense.category || 'General'} • paid by {expense.paidByName}
                      </div>
                    </div>
                    <div style={{fontWeight: '700', color: 'var(--accent-purple)'}}>
                      ₹{Number(expense.amount).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {paymentStatus && (
              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--success)', 
                padding: '12px 16px',
                background: '#d1fae5',
                borderRadius: '8px',
                marginTop: '16px',
                border: '1px solid #a7f3d0'
              }}>
                <CheckCircle size={18} /> 
                <span style={{fontWeight: '500'}}>{paymentStatus}</span>
              </div>
            )}

            {isGroupOpen && (
              <div className="modal-overlay" onClick={closeGroupModal}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div style={{fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px'}}>
                    Create New Group
                  </div>
                  <form onSubmit={handleGroupSubmit}>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Group Name</label>
                      <input
                        className="modal-input"
                        type="text"
                        value={groupForm.name}
                        onChange={(e) => handleGroupChange('name', e.target.value)}
                        placeholder="Study buddies, Movie night..."
                        required
                      />
                    </div>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Select Members</label>
                      <select
                        className="modal-input"
                        multiple
                        value={groupForm.memberIds}
                        onChange={handleGroupMembersChange}
                        size={Math.min(6, Math.max(3, members.length || 3))}
                      >
                        {members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}{member.id === user?.id ? " (You)" : ""}
                          </option>
                        ))}
                      </select>
                      <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple members.
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-btn" onClick={closeGroupModal}>
                        Cancel
                      </button>
                      <button type="submit" className="expense-btn">
                        Create Group
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isExpenseOpen && (
              <div className="modal-overlay" onClick={closeExpenseModal}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div style={{fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px'}}>
                    Add New Expense
                  </div>
                  <form onSubmit={handleExpenseSubmit}>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Paid By</label>
                      <select
                        className="modal-input"
                        value={expenseForm.paidBy}
                        onChange={(e) => handleExpenseChange('paidBy', e.target.value)}
                      >
                        <option value="" disabled>Select member</option>
                        {members.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}{member.id === user?.id ? " (You)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Description</label>
                      <input
                        className="modal-input"
                        type="text"
                        value={expenseForm.description}
                        onChange={(e) => handleExpenseChange('description', e.target.value)}
                        placeholder="Dinner, groceries, cab..."
                        required
                      />
                    </div>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Amount</label>
                      <input
                        className="modal-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={(e) => handleExpenseChange('amount', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="modal-row">
                      <label style={{fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)'}}>Category</label>
                      <select
                        className="modal-input"
                        value={expenseForm.category}
                        onChange={(e) => handleExpenseChange('category', e.target.value)}
                      >
                        <option value="General">General</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-btn" onClick={closeExpenseModal}>
                        Cancel
                      </button>
                      <button type="submit" className="expense-btn">
                        Save Expense
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="payment-box">
            <div>
              <div style={{fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500'}}>YOUR PERSONAL SHARE</div>
              <div style={{fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-purple)'}}>₹{individualShare}</div>
            </div>
            <button className="pay-btn" onClick={handlePaid}>
              Mark as Paid
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}