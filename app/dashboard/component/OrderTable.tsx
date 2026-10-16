import React, { useCallback, useState, useEffect } from 'react';
import { Package, Eye, Trash2, Loader2, ChevronDown, Layers, CheckCircle2, Truck, Clock, XCircle, Hash } from 'lucide-react';

type OrderId = string | number;

type OrderItem = {
    id?: OrderId;
    product_id?: OrderId;
    product_name?: string;
    product?: {
        id?: OrderId;
        product_name?: string;
        product_price?: number | string;
        image?: string;
        product_image?: string;
    };
    name?: string;
    unit_price?: number | string;
    price?: number | string;
    quantity?: number | string;
    qty?: number | string;
    line_total?: number | string;
};

type Order = {
    id: OrderId;
    status?: string;
    order_status?: string;
    items?: OrderItem[] | OrderItem;
    order_items?: OrderItem[] | OrderItem;
    details?: OrderItem[] | OrderItem;
    product?: OrderItem;
    customer_name?: string;
    name?: string;
    order_code?: string;
    order_date?: string;
    created_at?: string;
    total_amount?: number | string;
    total_price?: number | string;
    buyer_id?: OrderId;
    phone?: string;
    shipping_address?: string;
    address?: string;
    note?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOrder(value: unknown): value is Order {
    return isRecord(value) && (typeof value.id === 'string' || typeof value.id === 'number');
}

function getOrders(payload: unknown): Order[] {
    const root = isRecord(payload) ? payload : {};
    const data = root.data;
    const nestedData = isRecord(data) ? data.data : undefined;
    const candidates = [nestedData, data, root.order, root.orders, payload];
    const orderList = candidates.find(Array.isArray);

    return Array.isArray(orderList) ? orderList.filter(isOrder) : [];
}

function getApiBaseUrl() {
    return (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
}

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipping' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const normalizeOrderStatus = (status?: string) => {
    switch (status?.toLowerCase()) {
        case 'confirm':
        case 'confirmed':
        case 'បានបញ្ជាក់':
            return 'confirmed';
        case 'ship':
        case 'shipped':
        case 'shipping':
        case 'delivering':
        case 'កំពុងដឹកជញ្ជូន':
            return 'shipped';
        case 'delivery':
        case 'delivered':
            return 'delivered';
        case 'រង់ចាំ':
            return 'pending';
        case 'cancel':
        case 'canceled':
        case 'cancelled':
        case 'បោះបង់':
            return 'cancelled';
        default:
            return status?.toLowerCase() || 'pending';
    }
};

export default function OrderTable({ searchTerm }: { searchTerm?: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [statusWarning, setStatusWarning] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<OrderId | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [expandedRowId, setExpandedRowId] = useState<OrderId | null>(null);
    
    const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt_token')) 
        : '';

    const fetchOrders = useCallback(async (isBackground = false) => {
        if (!isBackground) {
            setLoading(true);
        }
        setError('');
        const baseUrl = getApiBaseUrl();

        try {
            if (!baseUrl) {
                throw new Error('មិនទាន់កំណត់ URL របស់ API ទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។');
            }

            const endpoint = searchTerm 
                ? `${baseUrl}/api/order-search?keyword=${encodeURIComponent(searchTerm)}`
                : `${baseUrl}/api/order-display`;

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('ការផ្ទៀងផ្ទាត់បរាជ័យ (Unauthorized)៖ សូម Login ម្ដងទៀត។');
                }
                throw new Error('មិនអាចទាញយកទិន្នន័យការបញ្ជាទិញបានទេ។');
            }

            const data: unknown = await response.json();
            setOrders(getOrders(data));
        } catch (err) {
            // Only update error state if it's an explicit manual fetch or initial load
            if (!isBackground) {
                setError(err instanceof Error ? err.message : 'មិនអាចទាញយកទិន្នន័យការបញ្ជាទិញបានទេ។');
            }
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    }, [searchTerm, token]);

    // Initial fetch & search term change handling
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            void fetchOrders(false);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchOrders]);

    // 5-Second Auto-Refresh Polling Effect
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Skip background polling if an order update is currently in progress
            if (updatingOrderId === null) {
                void fetchOrders(true);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchOrders, updatingOrderId]);

    const toggleRow = (id: OrderId) => {
        setExpandedRowId(prevId => (prevId === id ? null : id));
    };

    const handleDelete = async (id: OrderId) => {
        if (!window.confirm("តើអ្នកពិតជាចង់លុបការបញ្ជាទិញនេះមែនទេ?")) return;
        const baseUrl = getApiBaseUrl();

        try {
            if (!baseUrl) {
                throw new Error('API URL is not configured.');
            }

            const headers: Record<string, string> = { 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${baseUrl}/api/order-delete/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) throw new Error('Delete failed');

            setOrders((currentOrders) => currentOrders.filter((order) => order.id !== id));
            if (expandedRowId === id) setExpandedRowId(null);
        } catch (deleteError) {
            alert(deleteError instanceof Error
                ? deleteError.message
                : 'ការលុបបរាជ័យ សូមព្យាយាមម្តងទៀត។');
        }
    };

    const handleStatusChange = async (orderId: OrderId, status: string) => {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            setError('មិនទាន់កំណត់ URL របស់ API ទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។');
            return;
        }

        setError('');
        setStatusMessage('');
        setStatusWarning(false);
        setUpdatingOrderId(orderId);

        try {
            const headers: Record<string, string> = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };

            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${baseUrl}/api/order-status/${encodeURIComponent(orderId)}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status }),
            });
            const data: unknown = await response.json();

            if (!response.ok) {
                const message = isRecord(data) && typeof data.message === 'string'
                    ? data.message
                    : 'មិនអាចកែប្រែស្ថានភាពការបញ្ជាទិញបានទេ។';
                throw new Error(message);
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
            const liveNotificationFailed = isRecord(data)
                && data.realtime_notification_sent === false;
            setStatusWarning(liveNotificationFailed);
            setStatusMessage(isRecord(data) && typeof data.message === 'string'
                ? data.message
                : liveNotificationFailed
                    ? 'Order status saved, but the live buyer update could not be sent.'
                    : 'Order status updated and the buyer was notified.');
        } catch (statusError) {
            setError(statusError instanceof Error
                ? statusError.message
                : 'មិនអាចកែប្រែស្ថានភាពការបញ្ជាទិញបានទេ។');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const renderStatusBadge = (status?: string) => {
        switch (normalizeOrderStatus(status)) {
            case 'confirmed':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> បានបញ្ជាក់ (Confirm)
                    </span>
                );
            case 'shipped':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 inline-flex items-center gap-1">
                        <Truck className="w-3 h-3" /> កំពុងដឹកជញ្ជូន (Shipping)
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> រង់ចាំ (Pending)
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> បានដឹកជញ្ជូន (Delivered)
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> បានបោះបង់
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {status || 'រង់ចាំ'}
                    </span>
                );
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm font-medium">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-slate-100 shadow-xs">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">ការគ្រប់គ្រងការបញ្ជាទិញ (Order Tracking Management)</h3>
                        <p className="text-xs text-slate-500">ពិនិត្យស្ថានភាពការបញ្ជាទិញ លេខកូដ និងព័ត៌មានអតិថិជន។ (Auto-refresh every 5s)</p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                    {isOpen ? "លាក់តារាង" : "បង្ហាញតារាង"}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-medium text-center">
                    {error}
                </div>
            )}
            {statusMessage && (
                <div
                    role="status"
                    className={`p-4 border-b text-xs font-medium text-center ${
                        statusWarning
                            ? 'bg-amber-50 border-amber-100 text-amber-700'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}
                >
                    {statusMessage}
                </div>
            )}

            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                    <th className="py-3.5 px-6 font-semibold">អតិថិជន / លេខកូដបញ្ជាទិញ</th>
                                    <th className="py-3.5 px-6 font-semibold">កាលបរិច្ឆេទ</th>
                                    <th className="py-3.5 px-6 font-semibold">សរុបទឹកប្រាក់</th>
                                    <th className="py-3.5 px-6 font-semibold">ចំនួនទំនិញ</th>
                                    <th className="py-3.5 px-6 font-semibold">ស្ថានភាព (Status)</th>
                                    <th className="py-3.5 px-6 font-semibold text-right">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                            រកមិនឃើញទិន្នន័យការបញ្ជាទិញទេ។
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const isExpanded = expandedRowId === order.id;
                                        const orderStatus = normalizeOrderStatus(order.status || order.order_status);
                                        const selectableStatus = ORDER_STATUSES.some(({ value }) => value === orderStatus)
                                            ? orderStatus
                                            : 'pending';
                                        
                                        let orderItems = order.items || order.order_items || order.details || [];
                                        if (!Array.isArray(orderItems) && order.product) {
                                            orderItems = [order.product];
                                        }

                                        return (
                                            <React.Fragment key={order.id}>
                                                <tr className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-4 px-6 flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-slate-100 shrink-0 text-xs">
                                                            #{order.id}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-800 block text-sm">
                                                                {order.customer_name || order.name || 'អតិថិជនទូទៅ'}
                                                            </span>
                                                            <span className="text-xs font-mono text-blue-600 font-medium">
                                                                {order.order_code || `ORD-${order.id}`}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-mono text-slate-600 block">
                                                            {order.order_date || order.created_at?.split('T')[0] || 'N/A'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-emerald-600">
                                                            ${order.total_amount || order.total_price || '0.00'}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                            {Array.isArray(orderItems) ? orderItems.length : 1} មុខទំនិញ
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col items-start gap-2">
                                                            {renderStatusBadge(order.status || order.order_status)}
                                                            <select
                                                                aria-label={`Change status for order ${order.order_code || order.id}`}
                                                                value={selectableStatus}
                                                                disabled={updatingOrderId === order.id}
                                                                onChange={(event) => handleStatusChange(order.id, event.target.value)}
                                                                className="max-w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                                                            >
                                                                {ORDER_STATUSES.map(({ value, label }) => (
                                                                    <option key={value} value={value}>{label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        <button 
                                                            onClick={() => toggleRow(order.id)}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1 ${
                                                                isExpanded ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> {isExpanded ? 'លាក់' : 'មើល'}
                                                        </button>

                                                        <button 
                                                            onClick={() => handleDelete(order.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> លុប
                                                        </button>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={6} className="p-0 border-none">
                                                        <div className={`grid transition-all duration-300 ease-in-out bg-slate-50/90 ${
                                                            isExpanded ? 'grid-rows-[1fr] opacity-100 p-6 border-b border-slate-200' : 'grid-rows-[0fr] opacity-0 p-0 border-none'
                                                        }`}>
                                                            <div className="overflow-hidden space-y-6 max-w-5xl mx-auto w-full">
                                                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ព័ត៌មានអតិថិជន (Buyer ID: {order.buyer_id || 'N/A'})</span>
                                                                        <h4 className="text-sm font-bold text-slate-800">{order.customer_name || order.name}</h4>
                                                                        <p className="text-xs text-slate-500 mt-0.5">ទូរស័ព្ទ: <span className="font-medium text-slate-700">{order.phone || 'គ្មាន'}</span></p>
                                                                        <p className="text-xs text-slate-500 mt-0.5">អាសយដ្ឋានដឹកជញ្ជូន: <span className="text-slate-700">{order.shipping_address || order.address || 'គ្មានអាសយដ្ឋាន'}</span></p>
                                                                    </div>

                                                                    <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ព័ត៌មានបន្ថែម (Note & Total)</span>
                                                                        <p className="text-xs text-slate-500 mt-0.5">ចំណាំ: <span className="font-medium text-slate-700">{order.note || 'គ្មាន'}</span></p>
                                                                        <p className="text-xs text-slate-500 mt-0.5">សរុបទឹកប្រាក់: <span className="font-semibold text-emerald-600">${order.total_amount || '0.00'}</span></p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Layers className="w-4 h-4 text-blue-600" />
                                                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                                                ទំនិញក្នុងបញ្ជាទិញ (Order Product Details)
                                                                            </h4>
                                                                        </div>
                                                                    </div>

                                                                    <div className="overflow-x-auto pt-2">
                                                                        <table className="w-full text-left border-collapse">
                                                                            <thead>
                                                                                <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                                                                                    <th className="py-2.5 px-4 font-semibold">Product ID</th>
                                                                                    <th className="py-2.5 px-4 font-semibold">ផលិតផល</th>
                                                                                    <th className="py-2.5 px-4 font-semibold">រូបភាព</th>
                                                                                    <th className="py-2.5 px-4 font-semibold">តម្លៃឯកតា</th>
                                                                                    <th className="py-2.5 px-4 font-semibold">ចំនួន (Quantity)</th>
                                                                                    <th className="py-2.5 px-4 font-semibold">សរុប</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                                                                {Array.isArray(orderItems) && orderItems.length > 0 ? (
                                                                                    orderItems.map((orderItem, index) => {
                                                                                        const productId = orderItem.product_id || orderItem.product?.id || '-';
                                                                                        const ProductImage = orderItem.product?.image || orderItem.product?.product_image || null;
                                                                                        const productName = orderItem.product_name || orderItem.product?.product_name || orderItem.name || 'ផលិតផល';
                                                                                        const unitPrice = Number(orderItem.unit_price || orderItem.product?.product_price || orderItem.price || 0);
                                                                                        const quantity = Number(orderItem.quantity || orderItem.qty || 1);
                                                                                        const lineTotal = Number(orderItem.line_total || (unitPrice * quantity));

                                                                                        return (
                                                                                            <tr key={orderItem.id || index} className="hover:bg-slate-50/50">
                                                                                                <td className="py-2.5 px-4 font-mono font-bold text-blue-600 flex items-center gap-1">
                                                                                                    <Hash className="w-3 h-3 text-slate-400" /> {productId}
                                                                                                </td>
                                                                                                <td className="py-2.5 px-4 font-medium text-slate-800">
                                                                                                    {productName}
                                                                                                </td>
                                                                                                <td className="py-2.5 px-4">
                                                                                                    {ProductImage ? (
                                                                                                        <img src={`${import.meta.env.VITE_API_URL}${ProductImage}`} alt={productName} className="w-16 h-16 object-cover" />
                                                                                                    ) : (
                                                                                                        <div className="w-16 h-16 bg-slate-200 flex items-center justify-center">
                                                                                                            <Package className="w-8 h-8 text-slate-400" />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </td>
                                                                                                <td className="py-2.5 px-4 font-mono">${unitPrice.toFixed(2)}</td>
                                                                                                <td className="py-2.5 px-4 font-mono">{quantity}</td>
                                                                                                <td className="py-2.5 px-4 font-mono font-semibold text-emerald-600">${lineTotal.toFixed(2)}</td>
                                                                                            </tr>
                                                                                        );
                                                                                    })
                                                                                ) : (
                                                                                    <tr>
                                                                                        <td colSpan={6} className="py-4 text-center text-slate-400">គ្មានទំនិញក្នុងបញ្ជី</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}