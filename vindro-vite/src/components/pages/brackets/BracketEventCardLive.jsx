import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SmartLink from '../../ui/SmartLink';

const STATUS_CLASS = {
    upcoming: 'badge-upcoming',
    open:     'badge-open',
    in_play:  'badge-in-play',
    closed:   'badge-closed',
};

export default function BracketEventCardLive({ tournament }) {
    const { t, i18n } = useTranslation('brackets');
    const {
        name, slug, status,
        group_stage_status, bracket_stage_status,
        start_date, total_plays,
        card_info = {},
    } = tournament;
    const { group_stage, bracket_stage } = card_info;

    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        let timeout;
        const startAnimation = () => {
            const direction = Math.random() > 0.5 ? 'roll-right' : 'roll-left';
            setAnimationClass(direction);
            timeout = setTimeout(() => {
                setAnimationClass('');
                const nextDelay = Math.floor(Math.random() * 4000) + 2000;
                timeout = setTimeout(startAnimation, nextDelay);
            }, 3000);
        };
        const initialDelay = Math.floor(Math.random() * 3000);
        timeout = setTimeout(startAnimation, initialDelay);
        return () => clearTimeout(timeout);
    }, []);

    const groupDesc = t(`${slug}.groupStage.description`, { defaultValue: '' });
    const bracketDesc = t(`${slug}.bracketStage.description`, { defaultValue: '' });

    const locale = i18n.language === 'spng' ? 'es-ES' : 'en-US';
    const formatDate = (iso) => new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

    const stageBadge = (stageStatus) => (
        <span className={`stage-badge ${STATUS_CLASS[stageStatus] ?? 'badge-upcoming'}`}>
            {t(`liveCard.status.${stageStatus}`, t('liveCard.status.upcoming'))}
        </span>
    );

    return (
        <div className="bracket-event-card-container">
            <div className="bracket-event-card bracket-event-card-live">

                <div className={`rolling-football ${animationClass}`}></div>

                <div className="live-card-header">
                    <span className={`live-card-badge ${STATUS_CLASS[status] ?? 'badge-upcoming'}`}>
                        {t(`liveCard.status.${status}`, t('liveCard.status.upcoming'))}
                    </span>
                    <h4 className="live-card-title">{name}</h4>
                </div>

                <div className="live-card-stages">
                    {group_stage && (
                        <div className="stage-section">
                            <div className="stage-header">
                                <h5 className="stage-label">{t('liveCard.groupStageLabel')}</h5>
                                {group_stage_status && stageBadge(group_stage_status)}
                            </div>
                            <p className="stage-meta">
                                {group_stage.teams} {t('liveCard.teams')}
                                {group_stage.max_points != null && <> · {group_stage.max_points} {t('liveCard.ptsMax')}</>}
                            </p>
                            {groupDesc && <p className="stage-desc">{groupDesc}</p>}
                        </div>
                    )}

                    {bracket_stage && (
                        <div className="stage-section">
                            <div className="stage-header">
                                <h5 className="stage-label">{t('liveCard.bracketStageLabel')}</h5>
                                {bracket_stage_status && stageBadge(bracket_stage_status)}
                            </div>
                            <p className="stage-meta">
                                {bracket_stage.teams} {t('liveCard.teams')}
                                {bracket_stage.opening_round && <> · {bracket_stage.opening_round}</>}
                            </p>
                            {bracketDesc && <p className="stage-desc">{bracketDesc}</p>}
                        </div>
                    )}
                </div>

                <div className="live-card-footer">
                    <p className="footer-starts">
                        <span className="info-label">{t('liveCard.startsLabel')}</span> {formatDate(start_date)}
                    </p>
                    <div className="footer-bottom">
                        <p className="footer-players">
                            {t('liveCard.playersActive', { count: total_plays ?? 0 })}
                        </p>
                        <SmartLink to={`/brackets/${slug}`} className="bracket-event-join-btn">
                            {t('liveCard.checkItOut')}
                        </SmartLink>
                    </div>
                </div>

            </div>
        </div>
    );
}
