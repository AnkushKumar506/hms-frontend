import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emptyForm = { name: '', specialization: '', contact: '', availability: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingId) {
        await api.put(`/doctors/${editingId}`, payload);
      } else {
        await api.post('/doctors', payload);
      }
      setFormData(emptyForm);
      setEditingId(null);
      fetchDoctors();
    } catch (err) {
      setError(editingId ? 'Failed to update doctor' : 'Failed to add doctor');
    }
  };

  const handleEdit = (doctor) => {
    setFormData({
      name: doctor.name, specialization: doctor.specialization,
      contact: doctor.contact, availability: doctor.availability,
    });
    setEditingId(doctor.id);
  };

  const handleCancelEdit = () => { setFormData(emptyForm); setEditingId(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      setError('Failed to delete doctor');
    }
  };

  if (loading) return <Layout><p>Loading doctors...</p></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h2>Doctors</h2>
        <p>Manage doctor profiles, specializations, and availability.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {isAdmin && (
        <div className="card">
          <h3>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
              <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required />
              <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} />
              <input name="availability" placeholder="Availability" value={formData.availability} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Doctor' : 'Add Doctor'}</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Specialization</th><th>Contact</th><th>Availability</th>{isAdmin && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.specialization}</td>
                <td>{d.contact}</td>
                <td>{d.availability}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-edit btn-sm" onClick={() => handleEdit(d)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Doctors;