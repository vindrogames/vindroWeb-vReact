import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed-modal-overlay">
      <div className="modal-card">
        <h2>Madrid Calculator</h2>
        <p>Built for the fans of the greatest club on earth. 
           The 15 button adds the weight of our European history to your math.</p>
        <button className="close-modal-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InfoModal;