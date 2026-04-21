import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Sprawdzamy, czy w kieszeni (localStorage) jest bilet
  const token = localStorage.getItem('vod_token');

  if (!token) {
    // Jeśli nie ma tokena, wysyłamy użytkownika na logowanie
    // 'replace' sprawia, że nie będzie mógł kliknąć "wstecz" i wrócić do pustego ładowania
    return <Navigate to="/login" replace />;
  }

  // Jeśli token jest, renderujemy komponenty, które są w środku (np. stronę główną)
  return children;
};

export default ProtectedRoute;