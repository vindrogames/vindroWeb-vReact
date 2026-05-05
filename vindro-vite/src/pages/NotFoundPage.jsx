import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {

    const navigate = useNavigate();

    return (
        <main id="not-found-page" className="ux-confirm-hero bg-black">
            <section className="hero-full">
                <div className="text-container">
                    <h1>vindro<span className="inline-teal inline-bold">404</span></h1>
                    <div className="subtext-container">
                        <h2 className="not-found-subtitle">This page doesn't exist.</h2>
                        <h2>(or never did..)</h2>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NotFoundPage;
