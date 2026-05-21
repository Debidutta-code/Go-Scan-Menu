import React, { useEffect, useState, useCallback } from 'react';
import { Search, Eye, Clock, Hash, Globe, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { ApiLogService, ApiLog } from '../services/api-log.service';
import { Button } from '@/shared/components/Button';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './ApiLogs.css';

export const ApiLogs: React.FC = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

    const fetchLogs = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await ApiLogService.getLogs(token, page, 50, { search: searchQuery });
            if (response.success && response.data) {
                setLogs(response.data.logs);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Failed to load API logs');
        } finally {
            setLoading(false);
        }
    }, [token, page, searchQuery]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getStatusClass = (code: number) => {
        if (code >= 200 && code < 300) return 'status-2xx';
        if (code >= 400 && code < 500) return 'status-4xx';
        if (code >= 500) return 'status-5xx';
        return 'status-other';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    return (
        <div className="api-logs-container">
            <div className="logs-header">
                <div className="header-left">
                    <h1 className="page-title">System API Logs</h1>
                    <p className="page-subtitle">Monitor all incoming API requests and responses</p>
                </div>
                <div className="header-actions">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by URL..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="logs-search-input"
                            />
                        </div>
                        <Button type="submit" size="sm">Search</Button>
                    </form>
                    <Button variant="secondary" size="sm" onClick={() => { setSearchQuery(''); setPage(1); }}>
                        Reset
                    </Button>
                </div>
            </div>

            <div className="logs-content">
                <div className="logs-table-wrapper">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Endpoint</th>
                                <th>User</th>
                                <th>Duration</th>
                                <th>Timestamp</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">No logs found</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id}>
                                        <td>
                                            <span className={`method-badge method-${log.method.toLowerCase()}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(log.statusCode)}`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="endpoint-cell" title={log.url}>
                                            {log.url}
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="user-email">{log.userEmail || 'Anonymous'}</span>
                                                {log.ip && <span className="user-ip">{log.ip}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="duration-text">
                                                {log.duration}ms
                                            </span>
                                        </td>
                                        <td>
                                            <span className="timestamp-text">
                                                {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={() => setSelectedLog(log)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="page-info">Page {page} of {totalPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {selectedLog && (
                <div className="log-detail-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="log-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Details</h2>
                            <button className="close-btn" onClick={() => setSelectedLog(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label><Globe size={14} /> URL</label>
                                    <div className="value">{selectedLog.url}</div>
                                </div>
                                <div className="detail-grid-row">
                                    <div className="detail-item">
                                        <label><Hash size={14} /> Method</label>
                                        <div className="value">{selectedLog.method}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label><Hash size={14} /> Status</label>
                                        <div className="value">
                                            <span className={`status-badge ${getStatusClass(selectedLog.statusCode)}`}>
                                                {selectedLog.statusCode}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <label><Clock size={14} /> Duration</label>
                                        <div className="value">{selectedLog.duration}ms</div>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label><User size={14} /> User Context</label>
                                    <div className="value">
                                        Email: {selectedLog.userEmail || 'N/A'}<br/>
                                        ID: {selectedLog.userId || 'N/A'}<br/>
                                        IP: {selectedLog.ip || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="json-sections">
                                <div className="json-section">
                                    <h3>Request Body</h3>
                                    <pre>{JSON.stringify(selectedLog.body, null, 2)}</pre>
                                </div>
                                <div className="json-section">
                                    <h3>Response Body</h3>
                                    <pre>{JSON.stringify(selectedLog.responseBody, null, 2)}</pre>
                                </div>
                                <div className="json-section">
                                    <h3>Request Headers</h3>
                                    <pre>{JSON.stringify(selectedLog.headers, null, 2)}</pre>
                                </div>
                                {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                                    <div className="json-section">
                                        <h3>Query Parameters</h3>
                                        <pre>{JSON.stringify(selectedLog.query, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
