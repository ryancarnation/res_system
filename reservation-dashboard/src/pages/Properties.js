import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, TextField, Button, Box } from '@mui/material';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    user_id: 1, // Default to 1 for now
    title: '',
    description: '',
    location: ''
  });

  const fetchProperties = () => {
    axios.get('http://localhost:5000/api/properties')
      .then(res => setProperties(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (editMode) {
      axios.put(`http://localhost:5000/api/properties/${editId}`, newProperty)
        .then(() => {
          alert('Property updated!');
          setEditMode(false);
          setEditId(null);
          setNewProperty({ user_id: 1, title: '', description: '', location: '' });
          fetchProperties();
        })
        .catch(err => {
          console.error(err);
          alert('Failed to update property.');
        });
    } else {
      axios.post('http://localhost:5000/api/properties', newProperty)
        .then(() => {
          alert('Property added!');
          setNewProperty({ user_id: 1, title: '', description: '', location: '' });
          fetchProperties();
        })
        .catch(err => {
          console.error(err);
          alert('Failed to add property.');
        });
    }
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
    if (!window.confirm('Are you sure you want to delete this property?')) return;
  
    axios.delete(`http://localhost:5000/api/properties/${id}`)
      .then(() => {
        alert('Property deleted!');
        fetchProperties();
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete property.');
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
        <Button type="submit" variant="contained" color="primary">
          Add Property
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
    </Layout>
  );
};

export default Properties;
