import React from 'react';
import {Navigate } from 'react-router-dom';

function PrivateRoute({ element, allowedRoles }) {
    const jwt = sessionStorage.getItem('jwt');
    const email = sessionStorage.getItem('email');
    const storedRole = sessionStorage.getItem('authority');

    if (jwt && email && allowedRoles.includes(storedRole || '')) {
        return <>{element}</>;
    }

    return <Navigate to="/login" />;
}

export default PrivateRoute;