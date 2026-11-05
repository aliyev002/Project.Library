import React, { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaSearch, 
  FaExchangeAlt, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle, 
  FaUser, 
  FaBook,
  FaUndo
} from 'react-icons/fa';

const AdminBorrow = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const token = sessionStorage.getItem("token");

    const fetchBorrowedBooks = () => {
        setLoading(true);
        fetch("https://localhost:7108/api/borrow/getallborrowedbooks", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 404) return [];
                if (!res.ok) throw new Error("Məlumatlar alına bilmədi");
                return res.json();
            })
            .then((data) => {
                setBorrowedBooks(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Xəta baş verdi:", err);
                toast.error("İcarə qeydləri yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBorrowedBooks();
    }, []);

    const handleReturnBook = (borrowId) => {
        setProcessingId(borrowId);
        fetch(`https://localhost:7108/api/borrow/return/${borrowId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error("Qaytarma əməliyyatı uğursuz oldu");
                return res.json();
            })
            .then(() => {
                toast.success("Kitab uğurla qaytarıldı kimi qeyd edildi!");
                fetchBorrowedBooks();
            })
            .catch((err) => {
                console.error("Qaytarma zamanı xəta:", err);
                toast.error(err.message || "Kitab qaytarıla bilmədi");
            })
            .finally(() => setProcessingId(null));
    };

    // Stats
    const stats = useMemo(() => {
        const total = borrowedBooks.length;
        const active = borrowedBooks.filter(b => b.status === "borrowed").length;
        const returned = borrowedBooks.filter(b => b.status === "returned").length;
        const overdue = borrowedBooks.filter(b => b.status !== "borrowed" && b.status !== "returned").length;
        return { total, active, returned, overdue };
    }, [borrowedBooks]);

    // Filter
    const filteredBooks = useMemo(() => {
        return borrowedBooks.filter((item) => {
            const fullName = item.userInfo?.fullName || "";
            const email = item.userInfo?.email || "";
            const title = item.bookInfo?.title || "";
            const author = item.bookInfo?.author || "";
            const textMatch = `${fullName} ${email} ${title} ${author}`.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = statusFilter === "all" || item.status === statusFilter;

            return textMatch && statusMatch;
        });
    }, [borrowedBooks, searchTerm, statusFilter]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.9rem', color: 'var(--text-title)', margin: 0 }}>
                    İcarəyə Verilən Kitabların Reyestri
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>
                    Hansı oxucunun hansı kitabı nə vaxt götürdüyünü və təhvil tarixlərini izləyin
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FaExchangeAlt />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi Qeyd</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: 'var(--text-title)' }}>{stats.total}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaClock />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hazırda İcarədə</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#D97706' }}>{stats.active}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheck />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Təhvil Verildi</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#059669' }}>{stats.returned}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gecikənlər</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#DC2626' }}>{stats.overdue}</h3>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card-modern" style={{ padding: '20px 24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 340px' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <input
                            type="text"
                            placeholder="Oxucu adı, email və ya kitab adı ilə axtarın..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-modern"
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>

                    {/* Status Tabs */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: `Hamısı (${stats.total})` },
                            { id: 'borrowed', label: `İcarədə (${stats.active})` },
                            { id: 'returned', label: `Qaytarılanlar (${stats.returned})` },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                style={{
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    backgroundColor: statusFilter === tab.id ? 'var(--primary)' : 'var(--bg-main)',
                                    color: statusFilter === tab.id ? '#FFFFFF' : 'var(--text-body)'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="card-modern" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <FaExchangeAlt style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '12px' }} />
                        <p style={{ fontWeight: 600 }}>Məlumatlar yüklənir...</p>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>Heç bir icarə qeydi tapılmadı.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>Oxucu</th>
                                    <th>Kitab Məlumatı</th>
                                    <th>Status</th>
                                    <th>Götürülmə Tarixi</th>
                                    <th>Qaytarılma Tarixi</th>
                                    <th style={{ textAlign: 'right' }}>Əməliyyat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map((item, index) => {
                                    const isReturned = item.status === "returned";
                                    const isBorrowed = item.status === "borrowed";

                                    return (
                                        <tr key={item.borrowId ?? index}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                                                {index + 1}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--primary-light)',
                                                        color: 'var(--primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {item.userInfo?.fullName ? item.userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.95rem' }}>
                                                            {item.userInfo?.fullName || 'Anonim Oxucu'}
                                                        </strong>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                            {item.userInfo?.email || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.95rem' }}>
                                                        {item.bookInfo?.title || 'Adsız Kitab'}
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {item.bookInfo?.author || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {isReturned ? (
                                                    <span className="badge-status badge-available">
                                                        <FaCheck /> Qaytarıldı
                                                    </span>
                                                ) : isBorrowed ? (
                                                    <span className="badge-status badge-borrowed">
                                                        <FaClock /> İcarədədir
                                                    </span>
                                                ) : (
                                                    <span className="badge-status badge-overdue">
                                                        <FaExclamationTriangle /> Gecikib
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                                                {item.borrowDate || '-'}
                                            </td>
                                            <td style={{ color: 'var(--text-title)', fontWeight: 600 }}>
                                                {item.returnDate || '-'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {isReturned ? (
                                                    <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                                                        Tamamlandı
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReturnBook(item.borrowId)}
                                                        disabled={processingId === item.borrowId}
                                                        className="btn-secondary-custom"
                                                        style={{
                                                            padding: '7px 14px',
                                                            fontSize: '0.85rem',
                                                            borderColor: 'var(--primary)',
                                                            color: 'var(--primary)'
                                                        }}
                                                    >
                                                        <FaUndo /> {processingId === item.borrowId ? 'Yenilənir...' : 'Qaytarıldı'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBorrow;
