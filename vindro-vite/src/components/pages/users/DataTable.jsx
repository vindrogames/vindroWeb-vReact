

import React from 'react';

const DataTable = ({ data = [], columns = [], tableType = "", emptyMessage = "No records found." }) => {
    return (
        <div className={`table-wrapper ${tableType}`}>
            <table className="custom-data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.header} style={{ width: col.width }}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item, idx) => (
                            <tr key={item.id || idx}>
                                {columns.map((col) => (
                                    <td key={col.header}>
                                        {col.render ? col.render(item) : item[col.key]}
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
    );
}

export default DataTable;