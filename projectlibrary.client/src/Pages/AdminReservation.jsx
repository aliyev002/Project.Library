import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaUser, 
  FaBook,
  FaCheck,
  FaTimes,
  FaSearch,
  FaBookmark
} from 'react-icons/fa';
import { getAllReservations, approveReservation, declineReservation } from '../Api/reserveApi';

const AdminReservation = () => {
    const [reservations, setReservations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const loadReservations = async () => {
        setLoading(true);
        try {
            const data = await getAllReservations();
            setReservations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Rezervasiyalar yüklənmədi:", err);
            toast.error("Rezervasiyalar yüklənərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReservations();
    }, []);

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await approveReservation(id);
            toast.success("Rezervasiya təsdiqləndi və oxucuya email göndərildi!");
            setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Approved" } : r));
        } catch (err) {
            console.error("Təsdiq xətası:", err);
            toast.error(err.response?.data?.message || "Təsdiq zamanı xəta baş verdi");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDecline = async (id) => {
        setProcessingId(id);
        try {
            await declineReservation(id);
            toast.success("Rezervasiya imtina edildi və oxucuya email göndərildi.");
            setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Declined" } : r));
        } catch (err) {
            console.error("İmtina xətası:", err);
            toast.error(err.response?.data?.message || "İmtina zamanı xəta baş verdi");
        } finally {
            setProcessingId(null);
        }
    };

    const stats = useMemo(() => {
        const total = reservations.length;
        const pending = reservations.filter(r => r.status === "Pending").length;
        const approved = reservations.filter(r => r.status === "Approved").length;
        const declined = reservations.filter(r => r.status === "Declined").length;
        return { total, pending, approved, declined };
    }, [reservations]);

    const filteredReservations = useMemo(() => {
        return reservations.filter(r => {
            const fullName = r.user?.fullName || "";
            const email = r.user?.email || "";
            const title = r.book?.title || "";
            const author = r.book?.author || "";
            const textMatch = `${fullName} ${email} ${title} ${author}`.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === "all" || r.status === statusFilter;
            return textMatch && statusMatch;
        });
    }, [reservations, searchTerm, statusFilter]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.9rem', color: 'var(--text-title)', margin: 0 }}>
                    Kitab Rezervasiyalarının İdarə Edilməsi
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>
                    Nüsxəsi bitmiş kitablar üçün oxucuların növbə istəklərini nəzərdən keçirin və təsdiq edin
                </p>
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
                        <FaClipboardList />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi Rezervasiya</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-title)' }}>{stats.total}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaClock />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gözləyənlər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#D97706' }}>{stats.pending}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Təsdiqlənənlər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#059669' }}>{stats.approved}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                        <FaTimesCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>İmtina Edilənlər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#DC2626' }}>{stats.declined}</h3>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
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
                            placeholder="Oxucu adı, email və ya kitab üzrə axtarış..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-modern"
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: `Hamısı (${stats.total})` },
                            { id: 'Pending', label: `Gözləyir (${stats.pending})` },
                            { id: 'Approved', label: `Təsdiqlənib (${stats.approved})` },
                            { id: 'Declined', label: `İmtina edilib (${stats.declined})` },
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

            {/* Table */}
            <div className="card-modern" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <FaBookmark style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '12px' }} />
                        <p style={{ fontWeight: 600 }}>Rezervasiyalar yüklənir...</p>
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '1.1rem', margin: 0 }}>Heç bir rezervasiya müraciəti tapılmadı.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Oxucu</th>
                                    <th>Kitab</th>
                                    <th>Müraciət Tarixi</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Qərar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations.map((r, index) => {
                                    const isPending = r.status === "Pending";
                                    const isApproved = r.status === "Approved";
                                    const isDeclined = r.status === "Declined";

                                    return (
                                        <tr key={r.reservationId ?? index}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
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
                                                        {r.user?.fullName ? r.user.fullName.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.92rem' }}>
                                                            {r.user?.fullName || 'Anonim'}
                                                        </strong>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                            {r.user?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '0.92rem' }}>
                                                        {r.book?.title}
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {r.book?.author}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                                                {r.reservationDate}
                                            </td>
                                            <td>
                                                <span className="badge-status" style={{
                                                    backgroundColor: isApproved ? '#D1FAE5' : isPending ? '#FEF3C7' : '#FEE2E2',
                                                    color: isApproved ? '#059669' : isPending ? '#D97706' : '#DC2626'
                                                }}>
                                                    {isApproved ? 'Təsdiqləndi' : isPending ? 'Gözləyir' : isDeclined ? 'İmtina Edildi' : r.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {isPending ? (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => handleApprove(r.reservationId)}
                                                            disabled={processingId === r.reservationId}
                                                            className="btn-primary-custom"
                                                            style={{
                                                                padding: '6px 14px',
                                                                fontSize: '0.82rem',
                                                                backgroundColor: '#10B981',
                                                                borderColor: '#059669'
                                                            }}
                                                        >
                                                            <FaCheck /> Təsdiq Et
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecline(r.reservationId)}
                                                            disabled={processingId === r.reservationId}
                                                            className="btn-secondary-custom"
                                                            style={{
                                                                padding: '6px 14px',
                                                                fontSize: '0.82rem',
                                                                color: '#DC2626',
                                                                borderColor: '#FECACA'
                                                            }}
                                                        >
                                                            <FaTimes /> İmtina Et
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                        Əməliyyat tamamlandı
                                                    </span>
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

export default AdminReservation;
