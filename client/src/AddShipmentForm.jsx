import { useState } from 'react';
import axios from 'axios';

const AddShipmentForm = ({ onShipmentAdded }) => {
  const [formData, setFormData] = useState({
    shipping_id: '',
    item_name: '',
    destination: '',
    recipient_name: '',
    phone: '',
    tracking_number: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/shipping', formData);
      setFormData({
        shipping_id: '',
        item_name: '',
        destination: '',
        recipient_name: '',
        phone: '',
        tracking_number: ''
      });
      if (onShipmentAdded) {
        onShipmentAdded();
      }
    } catch (error) {
      console.error('Error adding shipment:', error);
      alert('Failed to add shipment. Please try again.');
    }
  };

  return (
    <div className="add-shipment-form">
      <h3>Add New Shipment</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Shipping ID:</label>
          <input
            type="text"
            name="shipping_id"
            value={formData.shipping_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Item Name:</label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Destination:</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Recipient Name:</label>
          <input
            type="text"
            name="recipient_name"
            value={formData.recipient_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tracking Number:</label>
          <input
            type="text"
            name="tracking_number"
            value={formData.tracking_number}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Shipment</button>
      </form>
    </div>
  );
};

export default AddShipmentForm;
