import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();

    // Redirect to login page since registration is now social auth only
    useEffect(() => {
        navigate('/login', { replace: true });
    }, [navigate]);

    return null;
}
