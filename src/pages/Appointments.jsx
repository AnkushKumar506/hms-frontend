import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emptyForm = { patientId: '', doctorId: '', appointmentDateTime: '', status: 'Scheduled' };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [apptRes, patientRes, doctorRes] = await Promise.all([
        api.get('/appointments'), api.get('/patients'), api.get('/doctors'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patientRes.data);
      setDoctors(doctorRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patient: { id: Number(formData.patientId) },
        doctor: { id: Number(formData.doctorId) },
        appointmentDateTime: formData.appointmentDateTime,
        status: formData.status,
      };
      if (editingId) {
        await api.put(`/appointments/${editingId}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      setFormData(emptyForm);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError(editingId ? 'Failed to update appointment' : 'Failed to add appointment');
    }
  };

  const handleEdit = (appt) => {
    setFormData({
      patientId: appt.patient?.id ?? '', doctorId: appt.doctor?.id ?? '',
      appointmentDateTime: appt.appointmentDateTime, status: appt.status,
    });
    setEditingId(appt.id);
  };

  const handleCancelEdit = () => { setFormData(emptyForm); setEditingId(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAll();
    } catch (err) {
      setError('Failed to delete appointment');
    }
  };

  const statusBadge = (status) => {
    const map = { Scheduled: 'badge-scheduled', Completed: 'badge-completed', Cancelled: 'badge-cancelled' };
    return <span className={`badge ${map[status] || 'badge-scheduled'}`}>{status}</span>;
  };

  if (loading) return <Layout><p>Loading appointments...</p></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h2>Appointments</h2>
        <p>Schedule and track patient visits.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>{editingId ? 'Edit Appointment' : 'Add New Appointment'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select name="patientId" value={formData.patientId} onChange={handleChange} required>
              <option value="">Select Patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
              <option value="">Select Doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="datetime-local" name="appointmentDateTime" value={formData.appointmentDateTime} onChange={handleChange} required />
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Appointment' : 'Add Appointment'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date/Time</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.patient?.name ?? 'N/A'}</td>
                <td>{a.doctor?.name ?? 'N/A'}</td>
                <td>{a.appointmentDateTime}</td>
                <td>{statusBadge(a.status)}</td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => handleEdit(a)}>Edit</button>{' '}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Appointments;