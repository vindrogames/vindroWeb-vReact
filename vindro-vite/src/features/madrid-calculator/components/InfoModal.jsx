import React from 'react';
import { useTranslation } from 'react-i18next';

const InfoModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation('madrid-calculator');

    if (!isOpen) return null;

    return (
        <div className="fixed-modal-overlay">
            <div className="modal-card">
                <div className="info-container">
                    <h1 translate="no">Calculadora Madridista</h1>
                    <p>{t('infoModal.description')}</p>
                    <button className="close-modal-btn" onClick={onClose}>{t('infoModal.close')}</button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
