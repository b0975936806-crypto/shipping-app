import { useState, useEffect } from 'react';

const ShipmentList = ({ refreshTrigger }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchShipments = () => {
      setLoading(true);
      fetch('/api/shipping')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
            if (isMounted) {
              setShipments(Array.isArray(data) ? data : []);
              setLoading(false);
            }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
            setLoading(false);
          }
        });
    };

    fetchShipments();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  if (loading) return <div>Loading shipments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="shipment-list">
      <h2>Shipments</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(shipments) && shipments.length > 0 ? (
            shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>{shipment.id}</td>
                <td>{shipment.origin}</td>
                <td>{shipment.destination}</td>
                <td>{shipment.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No shipments available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentList;
