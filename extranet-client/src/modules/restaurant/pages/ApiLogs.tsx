import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Eye, Clock, Hash, Globe, User, Shield, Info,
    Monitor, Smartphone, MapPin, Activity, Server, Smartphone as MobileIcon, Laptop
} from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'request' | 'response' | 'details'>('request');

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

    const JsonViewer = ({ data, title }: { data: any, title?: string }) => (
        <div className="json-section">
            {title && <h3>{title}</h3>}
            <pre className="custom-scrollbar">
                {data ? JSON.stringify(data, null, 2) : '// No data available'}
            </pre>
        </div>
    );

    const getDeviceIcon = (type?: string) => {
        if (type?.toLowerCase() === 'mobile') return <MobileIcon size={14} />;
        if (type?.toLowerCase() === 'tablet') return <Smartphone size={14} />;
        return <Laptop size={14} />;
    };

    return (
        <div className="api-logs-container">
            <div className="logs-header">
                <div className="header-left">
                    <h1 className="page-title">Request Logs</h1>
                    <p className="page-subtitle">Monitor all incoming API requests, device info, and location details</p>
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
                <div className="logs-table-wrapper custom-scrollbar">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Endpoint</th>
                                <th>Device / Browser</th>
                                <th>Location</th>
                                <th>Duration</th>
                                <th>Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <div className="loading-spinner"></div>
                                        <p className="mt-2 text-gray-500">Fetching logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <div className="no-data-icon"><Info size={40} /></div>
                                        <p className="mt-2 text-gray-500">No logs found for the given criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} onClick={() => { setSelectedLog(log); setActiveTab('request'); }} className="clickable-row">
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
                                            <span className="url-text">{log.url}</span>
                                        </td>
                                        <td>
                                            <div className="device-cell">
                                                <div className="flex-items-center">
                                                    {getDeviceIcon(log.device?.deviceType)}
                                                    <span className="ml-1">{log.device?.browserName || 'Unknown'}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">{log.device?.osName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="location-cell">
                                                {log.location?.city ? (
                                                    <>
                                                        <span className="city-text">{log.location.city}, {log.location.countryCode}</span>
                                                        <span className="isp-text">{log.location.isp}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Unknown</span>
                                                )}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedLog(log);
                                                    setActiveTab('request');
                                                }}
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
                            <div className="modal-header-info">
                                <span className={`method-badge method-${selectedLog.method.toLowerCase()}`}>
                                    {selectedLog.method}
                                </span>
                                <span className={`status-badge ${getStatusClass(selectedLog.statusCode)}`}>
                                    {selectedLog.statusCode}
                                </span>
                                <h2 className="modal-title">Request Details</h2>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedLog(null)}>×</button>
                        </div>

                        <div className="modal-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
                                onClick={() => setActiveTab('request')}
                            >
                                Request
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`}
                                onClick={() => setActiveTab('response')}
                            >
                                Response
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                Device & Location
                            </button>
                        </div>

                        <div className="modal-body custom-scrollbar">
                            {activeTab === 'request' ? (
                                <div className="tab-content">
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <label><Globe size={14} /> Full URL</label>
                                            <div className="value url-value">{selectedLog.url}</div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-card">
                                                <label><User size={14} /> User Context</label>
                                                <div className="value">
                                                    {selectedLog.userEmail || 'Anonymous'}
                                                    {selectedLog.userId && <span className="id-tag">ID: {selectedLog.userId}</span>}
                                                </div>
                                            </div>
                                            <div className="info-card">
                                                <label><Shield size={14} /> Source IP</label>
                                                <div className="value">{selectedLog.ip || 'Unknown'}</div>
                                            </div>
                                            <div className="info-card">
                                                <label><Clock size={14} /> Request Time</label>
                                                <div className="value">{format(new Date(selectedLog.timestamp), 'PPpp')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="json-container">
                                        <JsonViewer title="Headers" data={selectedLog.headers} />
                                        {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                                            <JsonViewer title="Query Parameters" data={selectedLog.query} />
                                        )}
                                        <JsonViewer title="Body" data={selectedLog.body} />
                                    </div>
                                </div>
                            ) : activeTab === 'response' ? (
                                <div className="tab-content">
                                    <div className="info-grid">
                                        <div className="info-row">
                                            <div className="info-card">
                                                <label><Hash size={14} /> Status Code</label>
                                                <div className="value">
                                                    <span className={`status-badge ${getStatusClass(selectedLog.statusCode)}`}>
                                                        {selectedLog.statusCode}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="info-card">
                                                <label><Clock size={14} /> Duration</label>
                                                <div className="value">{selectedLog.duration}ms</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="json-container">
                                        <JsonViewer title="Response Headers" data={selectedLog.responseHeaders} />
                                        <JsonViewer title="Response Body" data={selectedLog.responseBody} />
                                    </div>
                                </div>
                            ) : (
                                <div className="tab-content">
                                    <div className="info-grid">
                                        <h3><Monitor size={16} className="mr-2" /> Device & Browser</h3>
                                        <div className="info-row">
                                            <div className="info-card">
                                                <label>Device Type</label>
                                                <div className="value capitalize">{selectedLog.device?.deviceType || 'Desktop'}</div>
                                            </div>
                                            <div className="info-card">
                                                <label>Vendor / Model</label>
                                                <div className="value">
                                                    {selectedLog.device?.deviceVendor || 'Generic'} {selectedLog.device?.deviceModel || ''}
                                                </div>
                                            </div>
                                            <div className="info-card">
                                                <label>Browser</label>
                                                <div className="value">{selectedLog.device?.browserName} v{selectedLog.device?.browserVersion}</div>
                                            </div>
                                            <div className="info-card">
                                                <label>Operating System</label>
                                                <div className="value">{selectedLog.device?.osName} {selectedLog.device?.osVersion}</div>
                                            </div>
                                        </div>

                                        <h3 className="mt-6"><MapPin size={16} className="mr-2" /> Location Details</h3>
                                        {selectedLog.location ? (
                                            <div className="info-row">
                                                <div className="info-card">
                                                    <label>City & State</label>
                                                    <div className="value">{selectedLog.location.city}, {selectedLog.location.state}</div>
                                                </div>
                                                <div className="info-card">
                                                    <label>Country</label>
                                                    <div className="value">{selectedLog.location.country} ({selectedLog.location.countryCode})</div>
                                                </div>
                                                <div className="info-card">
                                                    <label>Timezone</label>
                                                    <div className="value">{selectedLog.location.timezone}</div>
                                                </div>
                                                <div className="info-card">
                                                    <label>Coordinates</label>
                                                    <div className="value">{selectedLog.location.latitude}, {selectedLog.location.longitude}</div>
                                                </div>
                                                <div className="info-card">
                                                    <label>ISP / Organization</label>
                                                    <div className="value">{selectedLog.location.isp}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="no-data-placeholder">Location data not available for this request.</div>
                                        )}

                                        <h3 className="mt-6"><Activity size={16} className="mr-2" /> Network Information</h3>
                                        <div className="info-row">
                                            <div className="info-card">
                                                <label>IP Address</label>
                                                <div className="value">{selectedLog.network?.ipAddress}</div>
                                            </div>
                                            <div className="info-card">
                                                <label>Request Method</label>
                                                <div className="value">{selectedLog.network?.requestMethod}</div>
                                            </div>
                                            <div className="info-card">
                                                <label>Host</label>
                                                <div className="value">{selectedLog.network?.host}</div>
                                            </div>
                                            <div className="info-card">
                                                <label>Protocol</label>
                                                <div className="value uppercase">{selectedLog.network?.protocol}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
