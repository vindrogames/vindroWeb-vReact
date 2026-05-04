import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <main id="not-found-page">
            <div className="not-found-container">
                <h1>vindro<span className="inline-teal inline-bold">404</span></h1>
                <div className="subtitle-container">
                    <p className="not-found-subtitle">This page doesn't exist.</p>
                    <p>(or never did..)</p>
                </div>
                <div className="not-found-actions">
                    <button className="btn btn-tan" onClick={() => navigate('/')}>Go Home</button>
                    <button className="btn btn-tan" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        </main>
    );
};

export default NotFoundPage;
