import { useEffect, useState } from 'react';
import api from '../api/axios';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

   const emptyForm = {
    name: '', specialization: '', contact: '', availability: '',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise = editing this id

  useEffect(() => {
    fetchDoctors();
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (editingId) {
        // UPDATE existing doctor
        await api.put(`/doctors/${editingId}`, payload);
      } else {
        // CREATE new doctors
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
      name: doctor.name,
      specialization: doctor.specialization,
      contact: doctor.contact,
      availability: doctor.availability,
    });
    setEditingId(doctor.id);
  };

  const handleCancelEdit = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchPatients();
    } catch (err) {
      setError('Failed to delete doctor');
    }
  };

  if (loading) return <p>Loading doctors...</p>;

   return (
    <div style={{ padding: '20px' }}>
      <h2>Doctors</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

  <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h3>{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="specialization" placeholder="specialization"  value={formData.specialization} onChange={handleChange} required />
        <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} />
        <input name="availability" placeholder="availability" value={formData.availability} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update Doctor' : 'Add Doctor'}</button>
        {editingId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Specialization</th>
      <th>Contact</th>
      <th>Availability</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {doctors.map((d) => (
      <tr key={d.id}>
        <td>{d.id}</td>
        <td>{d.name}</td>
        <td>{d.specialization}</td>
        <td>{d.contact}</td>
        <td>{d.availability}</td>
        <td>
          <button onClick={() => handleEdit(d)}>Edit</button>{' '}
          <button onClick={() => handleDelete(d.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}
export default Doctors;