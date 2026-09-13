import { NavLink, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  {role === 'ADMIN' && <button className="btn btn-danger">Delete</button>}

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">🏥 HMS</div>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/patients" className={({ isActive }) => isActive ? 'active' : ''}>Patients</NavLink>
        <NavLink to="/doctors" className={({ isActive }) => isActive ? 'active' : ''}>Doctors</NavLink>
        <NavLink to="/appointments" className={({ isActive }) => isActive ? 'active' : ''}>Appointments</NavLink>
        <button onClick={handleLogout} style={{ marginTop: 'auto' }}>Logout ({role})</button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;