import { useEffect, useState } from 'react';
import api from '../api/axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emptyForm = {
    name: '', age: '', gender: '', contact: '', medicalHistory: '', admissionStatus: '',
  };
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise = editing this id

  useEffect(() => {
    fetchPatients();
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, age: Number(formData.age) };

      if (editingId) {
        // UPDATE existing patient
        await api.put(`/patients/${editingId}`, payload);
      } else {
        // CREATE new patient
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
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      medicalHistory: patient.medicalHistory,
      admissionStatus: patient.admissionStatus,
    });
    setEditingId(patient.id);
  };

  const handleCancelEdit = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      setError('Failed to delete patient');
    }
  };

  if (loading) return <p>Loading patients...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Patients</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h3>{editingId ? 'Edit Patient' : 'Add New Patient'}</h3>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} required />
        <input name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
        <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} />
        <input name="medicalHistory" placeholder="Medical History" value={formData.medicalHistory} onChange={handleChange} />
        <input name="admissionStatus" placeholder="Status (OPD/Admitted)" value={formData.admissionStatus} onChange={handleChange} />
        <button type="submit">{editingId ? 'Update Patient' : 'Add Patient'}</button>
        {editingId && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
      </form>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
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
              <td>{p.admissionStatus}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>{' '}
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Patients;