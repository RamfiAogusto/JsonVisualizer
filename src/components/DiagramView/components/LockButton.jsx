import React from 'react';

const LockButton = ({ locked, onClick }) => (
  <button
    type="button"
    className="react-flow__controls-button"
    onClick={onClick}
    title={locked ? "Desbloquear nodos" : "Bloquear nodos"}
    aria-label={locked ? "Desbloquear nodos" : "Bloquear nodos"}
  >
    {locked ? (
      // Icono de candado abierto cuando está bloqueado
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ) : (
      // Icono de candado cerrado cuando está desbloqueado
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      </svg>
    )}
  </button>
);

export default LockButton; 