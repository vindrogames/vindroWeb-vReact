import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShowcaseSection from "../components/ui/ShowcaseSection";
import LoginHelmet from '../page-helmets/LoginHelmet';
import SmartLink from '../components/ui/SmartLink';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoginHelmet />

            <main id="login-page">

                <ShowcaseSection
                    classes="hero-half bg-black"
                >
                    <h1 translate="no">
                        Log<span className="inline-bold inline-teal">In</span>
                    </h1>
                    <h2>Get the full vindroExperience</h2>
                </ShowcaseSection>

                <ShowcaseSection
                    classes="hero-half bg-gray"
                >
                    <div className="auth-container">

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="no-account">
                            <h3>Don't have an account?</h3>
                            <SmartLink to="/register" className="btn-register" isNav={true}>
                                Register
                            </SmartLink>
                        </div>
                    </div>
                </ShowcaseSection>


            </main>
        </>
    );
}
