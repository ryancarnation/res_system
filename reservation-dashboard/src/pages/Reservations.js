import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography,
  TextField, Button, Box, CircularProgress, MenuItem
} from '@mui/material';
import { useSnackbar } from 'notistack';

const Reservations = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [newReservation, setNewReservation] = useState({
    property_id: '',
    guest_name: '',
    source_platform: '',
    check_in: '',
    check_out: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchProperties(); // Needed for property_id dropdown
  }, []);

  const fetchReservations = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/reservations')
      .then(res => setReservations(res.data))
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to load reservations', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const fetchProperties = () => {
    axios.get('http://localhost:5000/api/properties')
      .then(res => setProperties(res.data))
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to load properties', { variant: 'error' });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReservation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);

    const endpoint = editMode
      ? `http://localhost:5000/api/reservations/${editId}`
      : `http://localhost:5000/api/reservations`;

    const method = editMode ? axios.put : axios.post;

    method(endpoint, newReservation)
      .then(() => {
        enqueueSnackbar(editMode ? 'Reservation updated' : 'Reservation added', { variant: 'success' });
        resetForm();
        fetchReservations();
      })
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to save reservation', { variant: 'error' });
      })
      .finally(() => setFormLoading(false));
  };

  const handleEditClick = (reservation) => {
    setEditMode(true);
    setEditId(reservation.id);
    setNewReservation({
      property_id: reservation.property_id,
      guest_name: reservation.guest_name,
      source_platform: reservation.source_platform,
      check_in: reservation.check_in,
      check_out: reservation.check_out
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;

    setLoading(true);
    axios.delete(`http://localhost:5000/api/reservations/${id}`)
      .then(() => {
        enqueueSnackbar('Reservation deleted', { variant: 'success' });
        fetchReservations();
      })
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to delete reservation', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setNewReservation({
      property_id: '',
      guest_name: '',
      source_platform: '',
      check_in: '',
      check_out: ''
    });
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Reservations
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Guest Name"
          name="guest_name"
          value={newReservation.guest_name}
          onChange={handleChange}
          sx={{ mr: 2 }}
          required
        />
        <TextField
          label="Source Platform"
          name="source_platform"
          value={newReservation.source_platform}
          onChange={handleChange}
          sx={{ mr: 2 }}
          required
        />
        <TextField
          label="Check In"
          name="check_in"
          type="date"
          value={newReservation.check_in}
          onChange={handleChange}
          sx={{ mr: 2 }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Check Out"
          name="check_out"
          type="date"
          value={newReservation.check_out}
          onChange={handleChange}
          sx={{ mr: 2 }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          select
          label="Property"
          name="property_id"
          value={newReservation.property_id}
          onChange={handleChange}
          sx={{ mr: 2, minWidth: 200 }} // optional: ensures width is readable
          required
          InputLabelProps={{ shrink: true }} // ensures label shrinks
        >
          {properties.length === 0 ? (
            <MenuItem disabled>No properties found</MenuItem>
          ) : (
            properties.map((prop) => (
              <MenuItem key={prop.id} value={prop.id}>
                {prop.title}
              </MenuItem>
            ))
          )}
        </TextField>

        <Button type="submit" variant="contained" color="primary" disabled={formLoading}>
          {formLoading ? 'Saving...' : editMode ? 'Update Reservation' : 'Add Reservation'}
        </Button>

        {editMode && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetForm}
            sx={{ ml: 2 }}
          >
            Cancel Edit
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Guest Name</TableCell>
                <TableCell>Source Platform</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell>{res.id}</TableCell>
                  <TableCell>{res.guest_name}</TableCell>
                  <TableCell>{res.source_platform}</TableCell>
                  <TableCell>{res.check_in}</TableCell>
                  <TableCell>{res.check_out}</TableCell>
                  <TableCell>{properties.find(p => p.id === res.property_id)?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditClick(res)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(res.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Layout>
  );
};

export default Reservations;
