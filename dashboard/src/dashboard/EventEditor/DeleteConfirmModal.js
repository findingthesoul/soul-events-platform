import React, { useState } from 'react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ onConfirm, onCancel, itemType = 'item' }) => {
  const [input, setInput] = useState('');

  const isConfirmed = input === 'DELETE';

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
            onClick={isConfirmed ? onConfirm : undefined}
            disabled={!isConfirmed}
            className="danger"
            style={{
              backgroundColor: isConfirmed ? 'blue' : '#ccc',
              color: 'white',
              cursor: isConfirmed ? 'pointer' : 'not-allowed',
              border: 'none',
              padding: '0.5em 1em',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;