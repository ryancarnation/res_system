import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';

const Reports = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    axios.get('http://localhost:5000/api/reports/availability')
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadCSV = () => {
    window.open('http://localhost:5000/api/reports/availability/csv', '_blank');
  };

  const triggerSync = () => {
    axios.post('http://localhost:5000/api/sync/sync-reservations')
      .then(() => {
        alert('Sync successful!');
        fetchReports(); // Refresh reports after sync
      })
      .catch(err => {
        console.error(err);
        alert('Sync failed!');
      });
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Availability Report
      </Typography>
      <Button variant="contained" color="primary" onClick={downloadCSV} sx={{ mb: 2, mr: 2 }}>
        Download CSV
      </Button>
      <Button variant="contained" color="secondary" onClick={triggerSync} sx={{ mb: 2 }}>
        Sync Now
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Property ID</TableCell>
              <TableCell>Property Title</TableCell>
              <TableCell>Next Available Date</TableCell>
              <TableCell>Booked Dates</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((rep) => (
              <TableRow key={rep.property_id}>
                <TableCell>{rep.property_id}</TableCell>
                <TableCell>{rep.property_title}</TableCell>
                <TableCell>{rep.next_available_date}</TableCell>
                <TableCell>{rep.booked_dates}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Layout>
  );
};

export default Reports;
