import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Auth/Signup";
import "./App.css"
import Login from "./components/Auth/Login";
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from "./components/Dashboard/Dashboard";

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
  );
};

export default App;
