import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const STEPS = [
    {
        label: 'Hey!',
        title: <>How it Works</>,
        subtitle_1: <>We want to show you the steps.</>,
        body: [
            <>Step <span className='step-circle'>1</span> Create a Play</>,
            <>Step <span className='step-circle'>2</span> Make your Predictions</>,
            <>Step <span className='step-circle'>3</span> Join a Pool by Submitting a Play</>,
            <>Step <span className='step-circle'>4</span> Create your Own Pool to invite Friends</>,
            <>Extra: Read about the Tournament!</>
        ]
    },
    {
        label: 'Plays',
        title: <>prediction<span className="inline-teal inline-bold">Plays</span></>,
        subtitle: <>Your set of predictions for the Tournament</>,
        body: [
            <>This Tournament has 2 Stages: <span className="inline-teal inline-bold">Groups</span> & <span className="inline-teal inline-bold">Bracket</span>.</>,
            <>You Recieve Points in both stages, but Bracket Points decide the winners.</>,
            <>You can create as many plays as you like.</>,
            <>For example, have your children create their own play with your account!</>,
            <>You can edit your plays up until the first match of either stage.</>
        ],
    },
    {
        label: 'Group',
        title: <>group<span className="inline-teal inline-bold">Stage</span></>,
        subtitle: <>Rank each team in their Group.</>,
        body: [
            <>Predict <span className="inline-teal inline-bold">positions 1 through 4</span>.</>,
            <>Earn 1 point for each correct prediction.</>,
            <>Predict every position correctly and earn <span className="inline-teal inline-bold">2 bonus points</span>!</>,
            <>You can edit your predictions up until the first match on June 11.</>,
            <>Group Stage points serve to resolve ties at end of Tournament.</>,
            <>You can also spend your Group Stage points during the Bracket, to swap out eliminated teams!</>,
        ],
    },
    {
        label: 'Bracket',
        title: <>bracket<span className="inline-teal inline-bold">Stage</span></>,
        subtitle: <>What everybody is waitinng for!</>,
        body: [
            <>All plays get a clean Bracket.</>,
            <>You get to make your predictions regardless of your Group Stage Results.</>,
            <>You can edit your predictions up until the first match on June 28.</>,
            <><span className='inline-neon-pink inline bold'>Unique Feature!</span> You can swap out wrong predictions</>,
            <>Follow the Tournament closely and use your swaps wisely.</>,
            <></>,
            <><span className="inline-teal inline-bold">Use swaps wisely.</span> One well-timed change beats three desperate ones.</>,
        ],
    },
    {
        label: 'Pool',
        title: <>join<span className="inline-teal inline-bold">Pool</span></>,
        subtitle: <>Pools are where plays compete</>,
        body: [
            <>Plays are submitted to pools.</>,
            <>We have a vindro<span className='inline-teal inline-bold'>Public</span> pool anybody can join.</>,
            <>You can submit as many plays as you like to our public pool</>,
            <>User can create their own Pools and invite friends and family.</>,
            <>Private Pools require a code to join.</>,
            <>Someone shared this link for a reason. <span className="inline-teal inline-bold">Create a Play</span> and get in the mix.</>,
        ],
    },
    {
        label: 'Private Pool',
        title: <>join<span className="inline-teal inline-bold">Pool</span></>,
        subtitle: <>Pools are where plays compete</>,
        body: [
            <>Plays are submitted to pools.</>,
            <>We have a vindro<span className='inline-teal inline-bold'>Public</span> pool anybody can join.</>,
            <>You can submit as many plays as you like to our public pool</>,
            <>User can create their own Pools and invite friends and family.</>,
            <>Private Pools require a code to join.</>,
            <>Someone shared this link for you to join!</>,
        ],
    },
    {
        label: 'Swaps',
        title: <>join<span className="inline-teal inline-bold">Pool</span></>,
        subtitle: <>Pools are where plays compete</>,
        body: [
            <>Plays are submitted to pools.</>,
            <>We have a vindro<span className='inline-teal inline-bold'>Public</span> pool anybody can join.</>,
            <>You can submit as many plays as you like to our public pool</>,
            <>User can create their own Pools and invite friends and family.</>,
            <>Private Pools require a code to join.</>,
            <>Someone shared this link for a reason. <span className="inline-teal inline-bold">Create a Play</span> and get in the mix.</>,
        ],
    },
];

const NewUserTutorialModal = ({ isOpen, onComplete, onSkip }) => {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const isFirst = step === 0;
    const isLast = step === STEPS.length - 1;
    const current = STEPS[step];
    const isOverview = step === 0;

    const handleNext = () => {
        if (isLast) onComplete();
        else setStep(s => s + 1);
    };

    const handleBack = () => {
        if (!isFirst) setStep(s => s - 1);
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onSkip}>
            <div className="modal-overlay-content-container" id="new-user-tutorial" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onSkip} aria-label="Close">&times;</button>

                <div className="modal-tab-gallery">
                    <div className="modal-tab-gallery-content">
                        <h2>{current.title}</h2>
                        {current.subtitle_1 && <p className="modal-subtitle">{current.subtitle_1}</p>}
                        {current.subtitle && <p className="modal-subtitle">{current.subtitle}</p>}
                    </div>

                    <div className="modal-tab-bar">
                        {STEPS.map((s, i) => (
                            <button
                                key={i}
                                className={`modal-tab${step === i ? ' active' : ''}${i < step ? ' visited' : ''}`}
                                onClick={() => setStep(i)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-tab-body">
                    <div className={`tutorial-body-text${isOverview ? ' is-overview' : ''}`}>
                        {current.body.map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>

                    <div className="tutorial-nav">
                        <button
                            className="btn btn-tan tutorial-back-btn"
                            onClick={handleBack}
                            disabled={isFirst}
                        >
                            <FaArrowLeft /> Back
                        </button>

                        <div className="tutorial-progress-dots">
                            {STEPS.map((_, i) => (
                                <span
                                    key={i}
                                    className={`tutorial-dot${step === i ? ' active' : ''}${i < step ? ' visited' : ''}`}
                                    onClick={() => setStep(i)}
                                />
                            ))}
                        </div>

                        <button
                            className={`btn tutorial-next-btn${isLast ? ' btn-neon-pink-tutorial' : ' btn-tan'}`}
                            onClick={handleNext}
                        >
                            {isLast ? 'Create a Play' : <>Next <FaArrowRight /></>}
                        </button>
                    </div>

                    <button className="tutorial-skip-link" onClick={onSkip}>
                        Skip tutorial
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NewUserTutorialModal;
