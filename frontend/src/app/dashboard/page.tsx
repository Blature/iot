'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type Reading = {
  deviceId: string;
  value: number;
  timestamp: string;
};

export default function Dashboard() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Reading | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ['websocket'],
    });

    socket.on('temperature-update', (data: Reading) => {
      setReadings((prev) => {
        const filtered = prev.filter(r => r.deviceId !== data.deviceId);
        return [...filtered, data];
      });
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/temperature`)
      .then(res => res.json())
      .then(data => {
        const initial = Object.entries(data).map(([deviceId, val]) => {
          const { value, timestamp } = val as Reading;
          return {
            deviceId,
            value,
            timestamp,
          }});
        setReadings(initial);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSimulate = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      });
  };

  const handleSearch = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/temperature/${searchId}`);
    const data = await res.json();
    setSearchResult(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 text-black">
      <h1 className="text-3xl font-bold mb-6">🌡️ Live Temperature Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleSimulate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Simulate Temperature
        </button>

        <div className="flex gap-2 items-center">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search deviceId"
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {searchResult && (
        <div className="mb-6 text-center bg-white shadow-md rounded px-4 py-2">
          <p>
            <strong>{searchResult.deviceId}</strong>: {searchResult.value}°C <br />
            <small>{searchResult.timestamp}</small>
          </p>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white shadow-md rounded">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="px-4 py-2 border-b">Device ID</th>
              <th className="px-4 py-2 border-b">Value (°C)</th>
              <th className="px-4 py-2 border-b">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {readings.map(r => (
              <tr key={r.deviceId} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{r.deviceId}</td>
                <td className="px-4 py-2 border-b">{r.value}</td>
                <td className="px-4 py-2 border-b">{r.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
