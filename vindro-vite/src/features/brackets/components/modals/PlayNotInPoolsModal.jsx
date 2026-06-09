import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import ShowcaseSection from '../../../../components/ui/ShowcaseSection';
import SubmitPlayToPool from './PoolSubmitPlayModal';
import PoolSubmitResponseModal from './PoolSubmitResponseModal';

const PlayNotInPoolsModal = ({ isOpen, tournamentId, plays = [], onCancel, onSuccess, onCreatePlay }) => {
    const { t } = useTranslation('play');

    const [submissionFlow, setSubmissionFlow] = useState({ isOpen: false, type: null });
    const [responseFlow, setResponseFlow] = useState({ isOpen: false, results: [] });
    const [joinedPool, setJoinedPool] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setSubmissionFlow({ isOpen: false, type: null });
            setResponseFlow({ isOpen: false, results: [] });
            setJoinedPool(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleJoinPool = (type) => setSubmissionFlow({ isOpen: true, type });
    const closeSubmissionFlow = () => setSubmissionFlow({ isOpen: false, type: null });

    const handleSubmissionSuccess = (selectedIds, code, responseData) => {
        const serverResults = responseData.results || {};
        const report = plays
            .filter(p => selectedIds.includes(p.id))
            .map(p => ({
                name: p.name,
                status: serverResults[String(p.id)] || 'success',
            }));
        setJoinedPool({ name: responseData.pool_name, is_public: responseData.pool_is_public });
        setSubmissionFlow({ isOpen: false, type: null });
        setResponseFlow({ isOpen: true, results: report });
    };

    const handleFinalClose = () => {
        const pool = joinedPool;
        setJoinedPool(null);
        setResponseFlow({ isOpen: false, results: [] });
        if (onSuccess) onSuccess(pool);
    };

    return (
        <>
            {!submissionFlow.isOpen && !responseFlow.isOpen && ReactDOM.createPortal(
                <div className="modal-overlay" onClick={onCancel}>
                    <div className="modal-overlay-content-container" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={onCancel}>&times;</button>

                        <ShowcaseSection className="modal-gallery">
                            <h2>
                                {t('poolPromptModal.titlePrefix')}
                                <span className="inline-teal inline-bold">{t('poolPromptModal.titleHighlight')}</span>
                            </h2>
                            <p>{t('poolPromptModal.subtitle')}</p>
                        </ShowcaseSection>

                        <ShowcaseSection className="bottom-modal-gallery pool-prompt-bottom">
                            <div className="pool-prompt-half">
                                <h3>{t('poolPromptModal.publicTitle')}</h3>
                                <p>{t('poolPromptModal.publicText')}</p>
                                <button className="btn btn-tan" onClick={() => handleJoinPool('public')}>
                                    {t('poolPromptModal.publicBtn')}
                                </button>
                            </div>

                            <div className="pool-half-divider" />

                            <div className="pool-prompt-half">
                                <h3>{t('poolPromptModal.privateTitle')}</h3>
                                <button className="btn btn-ghost-outline" onClick={() => handleJoinPool('private')}>
                                    {t('poolPromptModal.privateBtn')}
                                </button>
                            </div>
                        </ShowcaseSection>
                    </div>
                </div>,
                document.body
            )}

            <SubmitPlayToPool
                isOpen={submissionFlow.isOpen}
                type={submissionFlow.type}
                tournamentId={tournamentId}
                plays={plays}
                onConfirm={handleSubmissionSuccess}
                onCancel={closeSubmissionFlow}
                initialCode=''
                onCreatePlay={onCreatePlay}
            />

            {responseFlow.isOpen && (
                <PoolSubmitResponseModal
                    results={responseFlow.results}
                    onClose={handleFinalClose}
                />
            )}
        </>
    );
};

export default PlayNotInPoolsModal;
