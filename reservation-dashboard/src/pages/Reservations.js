import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/reservations')
      .then(res => setReservations(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Reservations
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Guest Name</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Layout>
  );
};

export default Reservations;
