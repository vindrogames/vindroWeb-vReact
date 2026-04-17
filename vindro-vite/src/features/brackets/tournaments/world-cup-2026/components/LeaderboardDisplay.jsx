import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit } from "react-icons/fa";

const LeaderboardDisplay = ({
    title,
    subtitle, // e.g., "World Cup 2026"
    data = [],
    columns = [],
    isLoading,
    showBack = false, // Toggle this for dynamic routes
    backPath = -1,    // Where the back button goes
    onRowClick,
    actions = [],
    emptyMessage = "No entries found.",
    classes = "",
    tableContainerClasses = ""
}) => {
    const navigate = useNavigate();

    return (
        <section className={`leaderboard-display-container ${classes}`}>

            {/* 1. Header Section with Optional Back Button */}
            <div className="leaderboard-header">
                <div className="title">
                    <h3 className="main-title">{title}</h3>
                    {subtitle && <span className="subtitle">{subtitle}</span>}
                </div>
                {showBack && (
                    <button className="back-btn" onClick={() => navigate(backPath)}>
                        <FaArrowLeft /> Back
                    </button>
                )}

            </div>

            {/* 2. Table Section (Keep your existing logic here) */}
            <div className="leaderboard-table">
                
                <div className={`table-container ${tableContainerClasses}`}>
                    <table>
                        <thead>
                            <tr>{columns.map((col, i) => <th key={i}>{col.header}</th>)}</tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={columns.length}>Loading...</td></tr>
                            ) : data.length > 0 ? (
                                data.map((item, idx) => (
                                    <tr key={item.id || idx} onClick={() => onRowClick?.(item)} className={onRowClick ? "clickable-row" : ""}>
                                        {columns.map((col, i) => (
                                            <td key={i} className={col.className || ""}>
                                                {/* CRITICAL: Ensure 'idx' is passed as the second argument here */}
                                                {col.render ? col.render(item, idx) : (item[col.key] ?? '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={columns.length}>{emptyMessage}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. Actions (Buttons) */}
                {actions.length > 0 && (
                    <div className="buttons-container">
                        {actions.map((btn, i) => (
                            <button key={i} className={`btn ${btn.className}`} onClick={btn.onClick}>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LeaderboardDisplay;