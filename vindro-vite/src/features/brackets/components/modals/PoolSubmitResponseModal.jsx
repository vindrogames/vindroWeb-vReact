import React from 'react';
import ReactDOM from 'react-dom';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';

const PoolSubmitResponseModal = ({ results = [], onClose }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FaCheckCircle className="status-icon success" />;
            case 'already_joined': return <FaExclamationTriangle className="status-icon warning" />;
            case 'error': return <FaTimesCircle className="status-icon error" />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Submitted';
            case 'already_joined': return 'Already in Pool';
            case 'error': return 'Error';
            default: return 'Unknown';
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-overlay-content-container submission-response-modal" onClick={(e) => e.stopPropagation()}>
                
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <ShowcaseSection id="submission-results-gallery" className="modal-gallery">
                    <h2>submit<span className="inline-teal inline-bold">Results</span></h2>
                    <div className="modal-gallery-text">
                        <p>Process complete. Here is the status of your plays:</p>
                    </div>
                    <div className="submit-results-table">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>Play</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={index} className="result-row">
                                            <td className="play-info-name"><span>{result.name}</span></td>
                                            <td className="response-status">{getStatusText(result.status)}{getStatusIcon(result.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ShowcaseSection>
                <ShowcaseSection id="submission-actions">
                    <div id="awesome-button-container" className="submit-plays-buttons">
                        <button className="btn btn-tan confirm-btn" onClick={onClose}>Awesome</button>
                    </div>
                </ShowcaseSection>
            </div>
        </div>,
        document.body
    );
};

export default PoolSubmitResponseModal;