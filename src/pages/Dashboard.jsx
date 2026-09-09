import { Link } from 'react-router-dom';

function Dashboard() {
  const role = localStorage.getItem('role');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome, {role}</h2>
      <p><Link to="/patients">View Patients</Link></p>
    </div>
  );
}

export default Dashboard;