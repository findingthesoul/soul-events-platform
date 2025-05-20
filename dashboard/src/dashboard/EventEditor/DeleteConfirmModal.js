// DeleteConfirmModal.js
import React, { useState } from 'react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ onConfirm, onCancel, itemType = 'item' }) => {
  const [input, setInput] = useState('');

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <p>
          To confirm deletion of this {itemType}, please type <strong>DELETE</strong> below:
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type DELETE"
        />
        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={input !== 'DELETE'}
            className="danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;