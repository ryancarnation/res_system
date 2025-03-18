import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

const Properties = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [newProperty, setNewProperty] = useState({
    user_id: 1, // Default to 1 for now
    title: '',
    description: '',
    location: ''
  });

  const fetchProperties = useCallback(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/properties')
      .then(res => setProperties(res.data))
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to load properties', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]); // Dependencies here 

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
  
    const endpoint = editMode
      ? `http://localhost:5000/api/properties/${editId}`
      : `http://localhost:5000/api/properties`;
  
    const method = editMode ? axios.put : axios.post;
  
    method(endpoint, newProperty)
      .then(() => {
        enqueueSnackbar(editMode ? 'Property updated' : 'Property added', { variant: 'success' });
        setEditMode(false);
        setEditId(null);
        setNewProperty({ user_id: 1, title: '', description: '', location: '' });
        fetchProperties();
      })
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to save property', { variant: 'error' });
      })
      .finally(() => {
        setFormLoading(false);
      });
  };  

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const handleEditClick = (property) => {
    setEditMode(true);
    setEditId(property.id);
    setNewProperty({
      user_id: property.user_id,
      title: property.title,
      description: property.description,
      location: property.location
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure?')) return;

    axios.delete(`http://localhost:5000/api/properties/${id}`)
      .then(() => {
        enqueueSnackbar('Property deleted', { variant: 'success' });
        fetchProperties();
      })
      .catch(err => {
        console.error(err);
        enqueueSnackbar('Failed to delete property', { variant: 'error' });
      });
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Properties
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Title"
          name="title"
          value={newProperty.title}
          onChange={handleChange}
          sx={{ mr: 2 }}
          required
        />
        <TextField
          label="Description"
          name="description"
          value={newProperty.description}
          onChange={handleChange}
          sx={{ mr: 2 }}
          required
        />
        <TextField
          label="Location"
          name="location"
          value={newProperty.location}
          onChange={handleChange}
          sx={{ mr: 2 }}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={formLoading}
        >
          {formLoading ? 'Saving...' : (editMode ? 'Update Property' : 'Add Property')}
        </Button>
        {editMode && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setEditMode(false);
              setEditId(null);
              setNewProperty({ user_id: 1, title: '', description: '', location: '' });
            }}
            sx={{ ml: 2 }}
          >
            Cancel Edit
          </Button>
        )}
      </Box>

      {/* Loading spinner */}
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
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Location</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {properties.map((prop) => (
                <TableRow key={prop.id}>
                    <TableCell>{prop.id}</TableCell>
                    <TableCell>{prop.title}</TableCell>
                    <TableCell>{prop.description}</TableCell>
                    <TableCell>{prop.location}</TableCell>
                    <TableCell>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditClick(prop)}
                        sx={{ mr: 1 }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(prop.id)}
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

export default Properties;
