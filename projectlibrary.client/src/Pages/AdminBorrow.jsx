import React, { useEffect, useState, useMemo } from "react";
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaExchangeAlt, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle, 
  FaUser, 
  FaBook,
  FaUndo,
  FaHourglassHalf,
  FaTimes
} from 'react-icons/fa';
import { getAllBorrowedBooks, returnBook } from "../Api/borrowApi";
import { getAllExtensions, approveExtension, declineExtension } from "../Api/extensionApi";

const AdminBorrow = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [extensions, setExtensions] = useState([]);
    const [currentView, setCurrentView] = useState("borrows"); // "borrows" or "extensions"
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [borrowsData, extsData] = await Promise.allSettled([
                getAllBorrowedBooks(),
                getAllExtensions()
            ]);

            if (borrowsData.status === "fulfilled") {
                setBorrowedBooks(Array.isArray(borrowsData.value) ? borrowsData.value : []);
            }
            if (extsData.status === "fulfilled") {
                setExtensions(Array.isArray(extsData.value) ? extsData.value : []);
            }
        } catch (err) {
            console.error("Xəta baş verdi:", err);
            toast.error("İcarə qeydləri yüklənərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleReturnBook = async (borrowId) => {
        setProcessingId(borrowId);
        try {
            await returnBook(borrowId);
            toast.success("Kitab uğurla qaytarıldı kimi qeyd edildi!");
            await loadData();
        } catch (err) {
            console.error("Qaytarma zamanı xəta:", err);
            toast.error(err.response?.data?.message || "Kitab qaytarıla bilmədi");
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveExtension = async (id) => {
        setProcessingId(id);
        try {
            await approveExtension(id);
            toast.success("İcarə müddəti uğurla 7 gün uzadıldı və oxucuya email göndərildi!");
            await loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Təsdiq zamanı xəta baş verdi");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeclineExtension = async (id) => {
        setProcessingId(id);
        try {
            await declineExtension(id);
            toast.success("Uzadılma müraciəti imtina edildi.");
            await loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "İmtina zamanı xəta baş verdi");
        } finally {
            setProcessingId(null);
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = borrowedBooks.length;
        const active = borrowedBooks.filter(b => b.status?.toLowerCase() === "borrowed" && !b.isOverdue).length;
        const returned = borrowedBooks.filter(b => b.status?.toLowerCase() === "returned").length;
        const overdue = borrowedBooks.filter(b => b.isOverdue || b.status?.toLowerCase() === "overdue").length;
        const pendingExts = extensions.filter(e => e.status === "Pending").length;
        return { total, active, returned, overdue, pendingExts };
    }, [borrowedBooks, extensions]);

    // Filter
    const filteredBooks = useMemo(() => {
        return borrowedBooks.filter((item) => {
            const fullName = item.userInfo?.fullName || "";
            const email = item.userInfo?.email || "";
            const title = item.bookInfo?.title || "";
            const author = item.bookInfo?.author || "";
            const textMatch = `${fullName} ${email} ${title} ${author}`.toLowerCase().includes(searchTerm.toLowerCase());

            const itemStatus = item.status?.toLowerCase();
            let statusMatch = true;
            if (statusFilter === "borrowed") statusMatch = itemStatus === "borrowed" && !item.isOverdue;
            else if (statusFilter === "returned") statusMatch = itemStatus === "returned";
            else if (statusFilter === "overdue") statusMatch = item.isOverdue || itemStatus === "overdue";

            return textMatch && statusMatch;
        });
    }, [borrowedBooks, searchTerm, statusFilter]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.9rem', color: 'var(--text-title)', margin: 0 }}>
                        İcarə və Müddət İdarəetməsi
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>
                        Oxucuların götürdüyü kitabları, qaytarılma tarixlərini və müddət uzatma istəklərini tənzimləyin
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setCurrentView("borrows")}
                        className={currentView === "borrows" ? "btn-primary-custom" : "btn-secondary-custom"}
                    >
                        <FaExchangeAlt /> İcarə Reyestri ({borrowedBooks.length})
                    </button>
                    <button
                        onClick={() => setCurrentView("extensions")}
                        className={currentView === "extensions" ? "btn-primary-custom" : "btn-secondary-custom"}
                        style={stats.pendingExts > 0 ? { position: 'relative' } : {}}
                    >
                        <FaHourglassHalf /> Müddət Uzatma İstəkləri ({stats.pendingExts})
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FaExchangeAlt />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi İcarə</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-title)' }}>{stats.total}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaClock />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hazırda İcarədə</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#D97706' }}>{stats.active}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheck />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Təhvil Verildi</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#059669' }}>{stats.returned}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gecikənlər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#DC2626' }}>{stats.overdue}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
                        <FaHourglassHalf />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gözləyən İstəklər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#7C3AED' }}>{stats.pendingExts}</h3>
                    </div>
                </div>
            </div>

            {/* VIEW 1: Borrows */}
            {currentView === "borrows" && (
                <>
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
                                    { id: 'borrowed', label: `Aktiv İcarədə (${stats.active})` },
                                    { id: 'overdue', label: `Gecikənlər (${stats.overdue})` },
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
                                            <th style={{ width: '50px' }}>#</th>
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
                                            const isReturned = item.status?.toLowerCase() === "returned";
                                            const isOverdue = item.isOverdue;

                                            return (
                                                <tr key={item.borrowId ?? index}>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'var(--primary-light)',
                                                                color: 'var(--primary)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: 700,
                                                                fontSize: '0.88rem'
                                                            }}>
                                                                {item.userInfo?.fullName ? item.userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.92rem' }}>
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
                                                            <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.92rem' }}>
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
                                                        ) : isOverdue ? (
                                                            <span className="badge-status badge-overdue" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                                                <FaExclamationTriangle /> Gecikib
                                                            </span>
                                                        ) : (
                                                            <span className="badge-status badge-borrowed">
                                                                <FaClock /> İcarədədir
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                                                        {item.borrowDate || '-'}
                                                    </td>
                                                    <td style={{ color: isOverdue ? '#DC2626' : 'var(--text-title)', fontWeight: 600 }}>
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
                                                                    padding: '6px 14px',
                                                                    fontSize: '0.84rem',
                                                                    borderColor: 'var(--primary)',
                                                                    color: 'var(--primary)'
                                                                }}
                                                            >
                                                                <FaUndo /> {processingId === item.borrowId ? 'Yenilənir...' : 'Təhvil Al'}
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
                </>
            )}

            {/* VIEW 2: Extension Requests */}
            {currentView === "extensions" && (
                <div className="card-modern" style={{ overflow: 'hidden' }}>
                    {extensions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <FaHourglassHalf style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '12px' }} />
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>Heç bir müddət uzatma müraciəti yoxdur.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Oxucu</th>
                                        <th>Kitab</th>
                                        <th>Müraciət Tarixi</th>
                                        <th>Cari Qaytarılma</th>
                                        <th>Yeni Qaytarılma</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Qərar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extensions.map((ext, idx) => {
                                        const isPending = ext.status === "Pending";
                                        const isApproved = ext.status === "Approved";

                                        return (
                                            <tr key={ext.requestId ?? idx}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <strong>{ext.user?.fullName}</strong>
                                                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                        {ext.user?.email}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{ext.book?.title}</strong>
                                                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                        {ext.book?.author}
                                                    </span>
                                                </td>
                                                <td>{ext.requestedDate}</td>
                                                <td>{ext.currentReturnDate}</td>
                                                <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{ext.newReturnDate}</td>
                                                <td>
                                                    <span className="badge-status" style={{
                                                        backgroundColor: isApproved ? '#D1FAE5' : isPending ? '#FEF3C7' : '#FEE2E2',
                                                        color: isApproved ? '#059669' : isPending ? '#D97706' : '#DC2626'
                                                    }}>
                                                        {isApproved ? 'Təsdiqləndi' : isPending ? 'Gözləyir' : 'İmtina Edildi'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {isPending ? (
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => handleApproveExtension(ext.requestId)}
                                                                disabled={processingId === ext.requestId}
                                                                className="btn-primary-custom"
                                                                style={{ padding: '6px 12px', fontSize: '0.82rem', backgroundColor: '#10B981', borderColor: '#059669' }}
                                                            >
                                                                <FaCheck /> Təsdiq
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeclineExtension(ext.requestId)}
                                                                disabled={processingId === ext.requestId}
                                                                className="btn-secondary-custom"
                                                                style={{ padding: '6px 12px', fontSize: '0.82rem', color: '#DC2626', borderColor: '#FECACA' }}
                                                            >
                                                                <FaTimes /> İmtina
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Bağlandı</span>
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
            )}
        </div>
    );
};

export default AdminBorrow;
