import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit } from "react-icons/fa";

const Leaderboard = ({
    data = [],
    columns = [],
    isLoading,
    onRowClick,
    actions = [],
    emptyMessage = "No entries found.",
    tableContainerClasses = ""
}) => {
    const navigate = useNavigate();

    return (
        <div className="leaderboard-container">

            <div className={`table-container ${tableContainerClasses}`}>
                <table>
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    style={col.width ? { width: col.width } : {}}
                                    className={col.narrow ? 'narrow-header' : ''}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={columns.length}>Loading...</td></tr>
                        ) : data.length > 0 ? (
                            data.map((item, idx) => (
                                <tr key={item.id || idx} className={onRowClick ? "clickable-row" : ""}>
                                    {columns.map((col, i) => (
                                        <td
                                            key={i}
                                            className={[col.className, col.truncate ? 'truncate-cell' : ''].filter(Boolean).join(' ')}
                                            onClick={onRowClick && col.className?.includes('table-link') ? () => onRowClick(item) : undefined}
                                        >
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
    );
};

export default Leaderboard;