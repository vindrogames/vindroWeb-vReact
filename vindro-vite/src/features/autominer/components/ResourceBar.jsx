// /features/autominer/components/ResourceBar.jsx
import React from 'react';

const ResourceBar = ({ resources }) => {
    const { iron, silver, sulfur, drills } = resources;

    return (
        <div id="resource-bar" className="">
            <div className="resource-bar-container">
                <div className="column">
                    <img src="/img/beam.webp"></img>
                    <p id="iron-count" className="resource-val">{iron}</p>
                </div>
                <div className="column">
                    <img src="/img/sulfur.webp"></img>
                    <p id="sulfur-count" className="resource-val">{sulfur}</p>
                </div>
                <div className="column">
                    <img src="/img/drill.webp"></img>
                    <p id="drill-count" className="resource-val">{drills}</p>
                </div>
                <div className="column">
                    <img src="/img/silver.webp"></img>
                    <p id="silver-count" className="resource-val">{silver}</p>
                </div>
            </div>
        </div>
    );
};

export default ResourceBar;