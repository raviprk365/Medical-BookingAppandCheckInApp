'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAPIPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPatientsAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-y-4">
        <Button onClick={testPatientsAPI} disabled={loading}>
          {loading ? 'Loading...' : 'Test Patients API'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
            Error: {error}
          </div>
        )}
        
        {patients.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Patients:</h2>
            {patients.map((patient) => (
              <div key={patient.id} className="p-3 bg-gray-100 rounded">
                <p><strong>ID:</strong> {patient.id}</p>
                <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                <p><strong>Email:</strong> {patient.email}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
