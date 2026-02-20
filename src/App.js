import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import Login from "./Pages/login";
import SignUp from "./Pages/SignUp";
import Dashboard from "./Pages/main";
import { CreateRoom } from "./Pages/createroom";
import { JoinRoom } from "./Pages/joinroom";
import { Settings } from "./Pages/settings";
import RoomPage from "./Pages/roompage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/main" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/createroom" element={<PrivateRoute><CreateRoom /></PrivateRoute>} />
          <Route path="/joinroom" element={<PrivateRoute><JoinRoom /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/room" element={<PrivateRoute><RoomPage /></PrivateRoute>} />
          <Route path="/room/:roomId" element={<PrivateRoute><RoomPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
