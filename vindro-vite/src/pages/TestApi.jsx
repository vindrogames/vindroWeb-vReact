import { useState, useEffect } from 'react';
import ShowcaseSection from '../components/ui/ShowcaseSection';

function TestApi() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/test/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <main>
                <ShowcaseSection classes="hero-half bg-black">
                    <h1>API<span className="inline-bold inline-teal">Test</span></h1>
                    <h2>Testing Django backend connection</h2>
                </ShowcaseSection>

                <ShowcaseSection>
                    {loading && (
                        <div className="loading">
                            <h3>Loading data from API...</h3>
                        </div>
                    )}

                    {error && (
                        <div>
                            <h3 style={{ color: 'red' }}>Error: {error}</h3>
                        </div>
                    )}

                    {data && (
                        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                            <h3>Response from http://127.0.0.1:8000/test/</h3>

                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                marginTop: '2rem',
                                border: '1px solid #333'
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#333' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #333', color: '#fff' }}>
                                            Key
                                        </th>
                                        <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #333', color: '#fff' }}>
                                            Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(data).map(([key, value]) => (
                                        <tr key={key}>
                                            <td style={{
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                fontWeight: 'bold',
                                                backgroundColor: '#fff',
                                                color: '#000'
                                            }}>
                                                {key}
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                border: '1px solid #ddd',
                                                backgroundColor: '#fff',
                                                color: '#000'
                                            }}>
                                                {typeof value === 'object'
                                                    ? JSON.stringify(value, null, 2)
                                                    : String(value)
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '2rem' }}>
                                <h4>Raw JSON:</h4>
                                <pre style={{
                                    backgroundColor: '#2d2d2d',
                                    color: '#f8f8f2',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    textAlign: 'left'
                                }}>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </ShowcaseSection>
            </main>
        </>
    );
}

export default TestApi;
