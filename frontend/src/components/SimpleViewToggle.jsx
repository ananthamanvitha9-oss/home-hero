import React from 'react';
import { useAuth } from '../context/AuthContext';

export function SimpleViewToggle() {
  const { simpleView, setSimpleView } = useAuth();

  return (
    <button 
      className={`accessibility-toggle ${simpleView ? 'active' : ''}`}
      onClick={() => setSimpleView(!simpleView)}
      title="Toggle Large Fonts & Simple Layouts"
    >
      👓 Simple View
    </button>
  );
}
