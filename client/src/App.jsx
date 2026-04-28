import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import Bidding from './pages/Bidding';
import ApiKeys from './pages/ApiKeys';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}
      
      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alumni" element={<AlumniDirectory />} />
        <Route path="/bids" element={<Bidding />} />
        <Route path="/api-keys" element={<ApiKeys />} />
      </Route>
    </Routes>
  );
}

export default App;
