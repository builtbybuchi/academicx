import React, { useState, useMemo } from 'react';

/**
 * DataTable - Sortable, paginated data table with liquid glass styling.
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: function}>} props.columns
 * @param {Array<object>} props.data
 * @param {number} [props.pageSize=10]
 * @param {string} [props.emptyMessage='No data available']
 */
export default function DataTable({ columns, data, pageSize = 10, emptyMessage = 'No data available' }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);

    const sorted = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const av = a[sortKey], bv = b[sortKey];
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir]);

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className="liquid-glass liquid-glass--no-hover" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none' }}
                                >
                                    {col.label}
                                    {sortKey === col.key && (
                                        <span style={{ marginLeft: 4, opacity: 0.6 }}>
                                            {sortDir === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.4)' }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paged.map((row, i) => (
                                <tr key={row.id || i}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                }}>
                    <span>
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn btn-glass btn-sm"
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            style={{ opacity: page === 0 ? 0.4 : 1 }}
                        >
                            ← Prev
                        </button>
                        <button
                            className="btn btn-glass btn-sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            style={{ opacity: page >= totalPages - 1 ? 0.4 : 1 }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
