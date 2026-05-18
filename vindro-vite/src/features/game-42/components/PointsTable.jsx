import React from 'react';

const PointsTable = ({ columns = [], emptyMessage = "No records found." }) => {

    console.log(columns);
    return (
        <div className="table-container bg-gray backdrop-black">
            <table>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.header}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {columns.map((col, idx) => (
                            <td key={idx}>
                                {col.currentRow}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        {columns.map((col, idx) => (
                            <td key={idx}>
                                {col.prevRow}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        {columns.map((col, idx) => (
                            <td key={idx}>
                                <span className='inline-teal inline-bold'>{col.bestRow}</span>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default PointsTable;