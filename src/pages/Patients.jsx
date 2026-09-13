import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emptyForm = { name: '', age: '', gender: '', contact: '', medicalHistory: '', admissionStatus: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, age: Number(formData.age) };
      if (editingId) {
        await api.put(`/patients/${editingId}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      setFormData(emptyForm);
      setEditingId(null);
      fetchPatients();
    } catch (err) {
      setError(editingId ? 'Failed to update patient' : 'Failed to add patient');
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      name: patient.name, age: patient.age, gender: patient.gender,
      contact: patient.contact, medicalHistory: patient.medicalHistory, admissionStatus: patient.admissionStatus,
    });
    setEditingId(patient.id);
  };

  const handleCancelEdit = () => { setFormData(emptyForm); setEditingId(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      setError('Failed to delete patient');
    }
  };

  const statusBadge = (status) => {
    const cls = status?.toLowerCase() === 'admitted' ? 'badge-admitted' : 'badge-opd';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (loading) return <Layout><p>Loading patients...</p></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h2>Patients</h2>
        <p>Manage patient records, admissions, and history.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {(isAdmin || editingId) && (
        <div className="card">
          <h3>{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
              <input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} required />
              <input name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
              <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} />
              <input name="medicalHistory" placeholder="Medical History" value={formData.medicalHistory} onChange={handleChange} />
              <input name="admissionStatus" placeholder="Status (OPD/Admitted)" value={formData.admissionStatus} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Patient' : 'Add Patient'}</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Contact</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.contact}</td>
                <td>{statusBadge(p.admissionStatus)}</td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => handleEdit(p)}>Edit</button>{' '}
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Patients;