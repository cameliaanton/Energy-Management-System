import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

function ProtectedRoutes() {
    const jwt = Cookies.get('jwt');
    const role = Cookies.get('role');
    const location = useLocation();

    if (!jwt) {
        return <Navigate to="/login" />;
    }

    if (role === 'ADMIN' && location.pathname !== '/admin-dashboard') {
        return <Navigate to="/admin-dashboard" />;
    } else if (role === 'CLIENT' && location.pathname !== '/client-dashboard') {
        return <Navigate to="/client-dashboard" />;
    } else if (!['ADMIN', 'CLIENT'].includes(role)) {
        return <Navigate to="/" />;
    }

    //Outlet: Permite redarea dinamică a rutelor imbricate,
    // susținând layout-uri complexe prin redarea rutelor copil
    // doar atunci când utilizatorul este autorizat și autentificat.
    return <Outlet />;
}

export default ProtectedRoutes;
