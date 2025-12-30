import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TableManagement.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button } from '@/components/common';

const TableManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="table-management">
      <Navbar
        title="Table Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="table-container container">
        <div className="placeholder-content">
          <div className="placeholder-icon">📦</div>
          <h2>Table Management</h2>
          <p>Full table management functionality can be implemented here</p>
          <p>Features include:</p>
          <ul>
            <li>Add/Edit/Delete tables</li>
            <li>Generate QR codes for each table</li>
            <li>Download QR codes as images</li>
            <li>Set table capacity</li>
            <li>Mark tables as active/inactive</li>
            <li>View real-time table status</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TableManagement;
