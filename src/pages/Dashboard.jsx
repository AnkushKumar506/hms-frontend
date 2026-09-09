function Dashboard() {
  const role = localStorage.getItem('role');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome, {role}</h2>
      <p>Dashboard coming soon — Patients, Doctors, Appointments will go here.</p>
    </div>
  );
}

export default Dashboard;