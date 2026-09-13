import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Dashboard() {
  const role = localStorage.getItem('role');
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointmentsToday: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get('/patients'),
        api.get('/doctors'),
        api.get('/appointments'),
      ]);

      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const todaysAppointments = appointmentsRes.data.filter((a) =>
        a.appointmentDateTime?.startsWith(today)
      );

      setStats({
        patients: patientsRes.data.length,
        doctors: doctorsRes.data.length,
        appointmentsToday: todaysAppointments.length,
      });
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>Welcome back, {role}</h2>
        <p>Here's what's happening at your hospital today.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="stat-value">{stats.doctors}</div>
          <div className="stat-label">Total Doctors</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="stat-value">{stats.appointmentsToday}</div>
          <div className="stat-label">Appointments Today</div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;