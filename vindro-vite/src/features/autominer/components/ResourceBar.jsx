// /features/autominer/components/ResourceBar.jsx
import React from 'react';

const ResourceBar = ({ resources }) => {
    const { iron, silver, sulfur, drills } = resources;

    const formatResource = (num) => {
        if (num >= 1000000) {
            return Math.floor(num / 100000) / 10 + 'M'; // 1,250,000 -> 1.2M
        }
        if (num >= 1000) {
            return Math.floor(num / 100) / 10 + 'K'; // 24,786 -> 24.7K
        }
        return num; // Under 1000 stays as is
    };

    return (
        <div id="resource-bar" className="">
            <div className="resource-bar-container">
                <div className="column">
                    <img src="/img/beam.webp"></img>
                    <p id="iron-count" className="resource-val">{formatResource(iron)}</p>
                </div>
                <div className="column">
                    <img src="/img/sulfur.webp"></img>
                    <p id="sulfur-count" className="resource-val">{formatResource(sulfur)}</p>
                </div>
                <div className="column">
                    <img src="/img/drill.webp"></img>
                    <p id="drill-count" className="resource-val">{formatResource(drills)}</p>
                </div>
                <div className="column">
                    <img src="/img/silver.webp"></img>
                    <p id="silver-count" className="resource-val">{formatResource(silver)}</p>
                </div>
            </div>
        </div>
    );
};

export default ResourceBar;