import React, { useState } from 'react';
import { Download, CreditCard } from 'lucide-react';

interface Invoice {
    id: string;
    created: number;
    description?: string;
    number?: string;
    amount_due: number;
    currency?: string;
    status?: string;
    invoice_pdf?: string;
    status_transitions?: {
        paid_at?: number;
    };
}

interface BillingHistoryProps {
    colors: any;
    billingData: {
        customerInvoices: Invoice[];
    };
    visibleInvoicesCount: number;
    setVisibleInvoicesCount: (count: number) => void;
    handleDownloadInvoice: (invoiceId: string) => void;
}

const BillingHistory: React.FC<BillingHistoryProps> = ({
    colors,
    billingData,
    visibleInvoicesCount,
    setVisibleInvoicesCount,
    handleDownloadInvoice
}) => {
    const [sortField, setSortField] = useState<'created' | 'description' | 'amount_due' | 'status'>('created');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: 'created' | 'description' | 'amount_due' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortInvoices = (invoices: Invoice[]) => {
        if (!invoices || invoices.length === 0) return [];
        
        return [...invoices].sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortField) {
                case 'created':
                    aValue = a.created;
                    bValue = b.created;
                    break;
                case 'description':
                    aValue = a.description || `Invoice #${a.number}`;
                    bValue = b.description || `Invoice #${b.number}`;
                    break;
                case 'amount_due':
                    aValue = a.amount_due;
                    bValue = b.amount_due;
                    break;
                case 'status':
                    aValue = a.status || 'unknown';
                    bValue = b.status || 'unknown';
                    break;
                default:
                    return 0;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            } else {
                const comparison = aValue - bValue;
                return sortDirection === 'asc' ? comparison : -comparison;
            }
        });
    };

    const sortedInvoices = sortInvoices(billingData.customerInvoices);

    const SortIcon = ({ field }: { field: string }) => (
        <div className="flex flex-col">
            <svg className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'opacity-100' : 'opacity-30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg className={`w-3 h-3 ${sortField === field && sortDirection === 'desc' ? 'opacity-100' : 'opacity-30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="p-6 rounded-lg border billing-history-section" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
            <h2 className="text-lg font-semibold mb-6">Billing History</h2>
            
            {billingData.customerInvoices && billingData.customerInvoices.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottomColor: colors.border }}>
                                    <th 
                                        className="text-left pb-3 font-medium cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleSort('created')}
                                        style={{ color: colors.text }}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            <SortIcon field="created" />
                                        </div>
                                    </th>
                                    
                                    <th 
                                        className="text-left pb-3 font-medium cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleSort('description')}
                                        style={{ color: colors.text }}
                                    >
                                        <div className="flex items-center gap-1">
                                            Description
                                            <SortIcon field="description" />
                                        </div>
                                    </th>
                                    
                                    <th 
                                        className="text-left pb-3 font-medium cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleSort('amount_due')}
                                        style={{ color: colors.text }}
                                    >
                                        <div className="flex items-center gap-1">
                                            Amount
                                            <SortIcon field="amount_due" />
                                        </div>
                                    </th>
                                    
                                    <th 
                                        className="text-left pb-3 font-medium cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleSort('status')}
                                        style={{ color: colors.text }}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            <SortIcon field="status" />
                                        </div>
                                    </th>
                                    
                                    <th className="text-right pb-3 font-medium" style={{ color: colors.text }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedInvoices.slice(0, visibleInvoicesCount).map((invoice, index) => (
                                    <tr key={invoice.id || index} style={{ borderBottomColor: colors.border }} className="border-b">
                                        <td className="py-4" style={{ color: colors.textSecondary }}>
                                            {new Date(invoice.created * 1000).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4" style={{ color: colors.textSecondary }}>
                                            {invoice.description || `Invoice #${invoice.number}`}
                                        </td>
                                        <td className="py-4 font-medium">
                                            ${(invoice.amount_due / 100).toFixed(2)} {invoice.currency?.toUpperCase()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                invoice.status === 'paid' 
                                                ? 'bg-green-100 text-green-800'
                                                : invoice.status === 'open'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleDownloadInvoice(invoice.id)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 w-full download-invoice-button"
                                                style={{ color: '#3B82F6' }}
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {sortedInvoices.length > visibleInvoicesCount && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setVisibleInvoicesCount(prev => prev + 4)}
                                className="px-4 py-2 inline-flex items-center gap-2 show-more-invoices"
                                style={{color: colors.textSecondary}}
                            >
                                Show More
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {visibleInvoicesCount > 4 && (
                        <div className="mt-2 text-center">
                            <button
                                onClick={() => setVisibleInvoicesCount(4)}
                                className="px-4 py-2 text-sm inline-flex items-center gap-2 show-less-invoices"
                                style={{ color: colors.textSecondary }}
                            >
                                Show Less
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                    <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No billing history available</p>
                </div>
            )}
        </div>
    );
};

export default BillingHistory;