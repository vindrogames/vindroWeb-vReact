

import React from 'react';

function DataTable({ data = [], columns = [], tableType = "" }) {
    if (!data || data.length === 0) {
        return <div className="no-data-msg">No records found.</div>;
    }

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
                    {data.map((item, idx) => (
                        <tr key={item.id || idx}>
                            {columns.map((col) => (
                                <td key={col.header}>
                                    {col.render ? col.render(item) : item[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;