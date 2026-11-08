import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { 
  FaBookReader, 
  FaCalendarAlt, 
  FaUserEdit, 
  FaTag, 
  FaExclamationCircle, 
  FaBookOpen,
  FaArrowRight,
  FaBookmark,
  FaClock,
  FaTimes,
  FaChartBar,
  FaCheckCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import { getUserActiveBorrows } from '../Api/borrowApi';
import { getUserReservations, cancelReservation } from '../Api/reserveApi';
import { requestExtension } from '../Api/extensionApi';
import { getUserSummary } from '../Api/statsApi';

const Dashboard = () => {
    const { user } = useAuth();
    const userId = user?.id || sessionStorage.getItem("userId");

    const [activeTab, setActiveTab] = useState("borrows"); // "borrows", "reservations", "stats"
    const [books, setBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        if (userId) {
            loadDashboardData();
        }
    }, [userId]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [borrowsRes, reservesRes, statsRes] = await Promise.allSettled([
                getUserActiveBorrows(userId),
                getUserReservations(userId),
                getUserSummary(userId)
            ]);

            if (borrowsRes.status === "fulfilled") {
                setBooks(Array.isArray(borrowsRes.value) ? borrowsRes.value : []);
            }
            if (reservesRes.status === "fulfilled") {
                setReservations(Array.isArray(reservesRes.value) ? reservesRes.value : []);
            }
            if (statsRes.status === "fulfilled") {
                setStats(statsRes.value);
            }
        } catch (err) {
            console.error("Dashboard məlumatları alına bilmədi:", err);
            toast.error("Məlumatlar yüklənərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async (borrowId) => {
        setActionLoadingId(borrowId);
        try {
            const res = await requestExtension(borrowId);
            toast.success(res.message || "Müddətin uzadılması üçün müraciət göndərildi!");
            await loadDashboardData();
        } catch (err) {
            console.error("Uzatma xətası:", err);
            const msg = err.response?.data?.message || "Müddətin uzadılması mümkün olmadı";
            toast.error(msg);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        setActionLoadingId(reservationId);
        try {
            await cancelReservation(reservationId);
            toast.success("Rezervasiya ləğv edildi.");
            setReservations(prev => prev.filter(r => r.reservationId !== reservationId));
        } catch (err) {
            console.error("Ləğv xətası:", err);
            toast.error(err.response?.data?.message || "Ləğv etmək mümkün olmadı");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px' }}>

            {/* Header Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #4D1B30 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 40px',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px rgba(123, 45, 74, 0.2)',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '10px'
                    }}>
                        <FaBookReader /> Şəxsi Kabinet
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        Salam, {user?.fullName || "Hörmətli Oxucu"}!
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#F1F5F9', opacity: 0.85, marginTop: '6px', margin: 0 }}>
                        İcarələrinizi, rezervasiyalarınızı və oxu fəallığınızı buradan izləyə bilərsiniz.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(8px)',
                        padding: '14px 22px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.78rem', color: '#F1F5F9', opacity: 0.9 }}>Aktiv İcarələr</span>
                        <h3 style={{ color: '#FFFFFF', fontSize: '1.8rem', margin: 0 }}>{books.length}</h3>
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(8px)',
                        padding: '14px 22px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '0.78rem', color: '#F1F5F9', opacity: 0.9 }}>Rezervasiyalar</span>
                        <h3 style={{ color: '#FFFFFF', fontSize: '1.8rem', margin: 0 }}>{reservations.length}</h3>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                borderBottom: '2px solid var(--border-color)',
                marginBottom: '28px',
                paddingBottom: '2px'
            }}>
                <button
                    onClick={() => setActiveTab("borrows")}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 20px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: activeTab === 'borrows' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'borrows' ? '3px solid var(--primary)' : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                    }}
                >
                    <FaBookOpen /> Aktiv İcarələr ({books.length})
                </button>

                <button
                    onClick={() => setActiveTab("reservations")}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 20px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: activeTab === 'reservations' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'reservations' ? '3px solid var(--primary)' : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                    }}
                >
                    <FaBookmark /> Rezervasiyalarım ({reservations.length})
                </button>

                <button
                    onClick={() => setActiveTab("stats")}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '12px 20px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: activeTab === 'stats' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'stats' ? '3px solid var(--primary)' : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'var(--transition)'
                    }}
                >
                    <FaChartBar /> Statistika
                </button>
            </div>

            {/* TAB 1: Aktiv İcarələr */}
            {activeTab === "borrows" && (
                loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <FaBookReader style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--primary)' }} />
                        <p style={{ fontWeight: 600 }}>İcarə məlumatları yüklənir...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="card-modern" style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            marginBottom: '20px'
                        }}>
                            <FaBookOpen />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-title)', marginBottom: '8px' }}>
                            Hazırda aktiv icarəniz yoxdur
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px' }}>
                            Kitabxanamızın zəngin fonduna nəzər salaraq bəyəndiyiniz kitabları icarəyə götürə bilərsiniz.
                        </p>
                        <Link to="/home" className="btn-primary-custom">
                            Kitabları Kəşf Et <FaArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px'
                    }}>
                        {books.map((book, index) => {
                            const borrowId = book.borrowId ?? book.BorrowId ?? index;
                            const title = book.title ?? book.Title;
                            const author = book.author ?? book.Author;
                            const genre = book.genre ?? book.Genre;
                            const returnDate = book.returnDate ?? book.ReturnDate;
                            const isOverdue = book.isOverdue || false;

                            return (
                                <div
                                    key={borrowId}
                                    className="card-modern"
                                    style={{
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        borderTop: `4px solid ${isOverdue ? '#DC2626' : 'var(--primary)'}`
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: 'var(--radius-pill)',
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary)',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <FaTag /> {genre || 'Ümumi'}
                                            </span>

                                            <span className={`badge-status ${isOverdue ? 'badge-borrowed' : 'badge-available'}`}
                                                  style={isOverdue ? { backgroundColor: '#FEE2E2', color: '#DC2626' } : {}}>
                                                {isOverdue ? 'Vaxtı Keçib!' : 'İcarədədir'}
                                            </span>
                                        </div>

                                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '8px', lineHeight: 1.3 }}>
                                            {title}
                                        </h4>

                                        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                            <FaUserEdit /> {author}
                                        </p>
                                    </div>

                                    <div>
                                        <div style={{
                                            backgroundColor: isOverdue ? '#FEF2F2' : 'var(--bg-main)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '12px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '14px',
                                            border: isOverdue ? '1px solid #FECACA' : '1px solid var(--border-color)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isOverdue ? '#DC2626' : 'var(--text-title)', fontSize: '0.88rem', fontWeight: 600 }}>
                                                <FaCalendarAlt style={{ color: isOverdue ? '#DC2626' : 'var(--primary)' }} />
                                                <span>Qaytarılma Tarixi:</span>
                                            </div>
                                            <span style={{ fontWeight: 700, color: isOverdue ? '#DC2626' : 'var(--primary)', fontSize: '0.92rem' }}>
                                                {returnDate || 'Təyin edilməyib'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleExtend(borrowId)}
                                            disabled={actionLoadingId === borrowId}
                                            className="btn-secondary-custom"
                                            style={{ width: '100%', fontSize: '0.88rem', padding: '8px 12px' }}
                                        >
                                            <FaHourglassHalf /> {actionLoadingId === borrowId ? 'Müraciət göndərilir...' : 'Müddəti 7 gün uzat'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* TAB 2: Rezervasiyalarım */}
            {activeTab === "reservations" && (
                reservations.length === 0 ? (
                    <div className="card-modern" style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <FaBookmark style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5, marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-title)', marginBottom: '8px' }}>
                            Aktiv rezervasiyanız yoxdur
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
                            Mövcud nüsxəsi bitmiş kitabları kəşf edərək onlar kitabxanaya qayıdan kimi ilk siz götürə bilmək üçün rezerv edin.
                        </p>
                        <Link to="/home" className="btn-primary-custom">
                            Kitablara Bax <FaArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '24px'
                    }}>
                        {reservations.map((res) => {
                            const isPending = res.status === "Pending";
                            const isApproved = res.status === "Approved";

                            return (
                                <div
                                    key={res.reservationId}
                                    className="card-modern"
                                    style={{
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        borderTop: `4px solid ${isApproved ? '#10B981' : isPending ? '#8B5CF6' : '#94A3B8'}`
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                Tarix: {res.reservationDate}
                                            </span>

                                            <span className="badge-status" style={{
                                                backgroundColor: isApproved ? '#D1FAE5' : isPending ? '#EDE9FE' : '#F1F5F9',
                                                color: isApproved ? '#059669' : isPending ? '#7C3AED' : '#64748B'
                                            }}>
                                                {isApproved ? 'Təsdiqləndi (Gözləyir)' : isPending ? 'Növbədədir' : res.status}
                                            </span>
                                        </div>

                                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '6px' }}>
                                            {res.book?.title || 'Kitab'}
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                                            {res.book?.author}
                                        </p>
                                    </div>

                                    {isPending && (
                                        <button
                                            onClick={() => handleCancelReservation(res.reservationId)}
                                            disabled={actionLoadingId === res.reservationId}
                                            className="btn-secondary-custom"
                                            style={{ color: '#DC2626', borderColor: '#FECACA', width: '100%', fontSize: '0.88rem' }}
                                        >
                                            <FaTimes /> Rezervasiyanı Ləğv Et
                                        </button>
                                    )}

                                    {isApproved && (
                                        <div style={{ padding: '10px', background: '#ECFDF5', borderRadius: 'var(--radius-sm)', color: '#065F46', fontSize: '0.84rem' }}>
                                            Kitab artıq kitabxanadadır, yaxınlaşıb icarəyə götürə bilərsiniz!
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* TAB 3: Şəxsi Statistika */}
            {activeTab === "stats" && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div className="card-modern" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
                        <FaBookOpen style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }} />
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 6px 0' }}>Ümumi İcarə Edilən</h4>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-title)', margin: 0 }}>{stats?.totalBorrowed ?? 0}</h2>
                    </div>

                    <div className="card-modern" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #10B981' }}>
                        <FaCheckCircle style={{ fontSize: '2rem', color: '#10B981', marginBottom: '10px' }} />
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 6px 0' }}>Aktiv İcarələr</h4>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-title)', margin: 0 }}>{stats?.activeBorrows ?? 0}</h2>
                    </div>

                    <div className="card-modern" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #8B5CF6' }}>
                        <FaBookmark style={{ fontSize: '2rem', color: '#8B5CF6', marginBottom: '10px' }} />
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 6px 0' }}>Aktiv Rezervasiyalar</h4>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-title)', margin: 0 }}>{stats?.activeReservations ?? 0}</h2>
                    </div>

                    <div className="card-modern" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #EF4444' }}>
                        <FaExclamationCircle style={{ fontSize: '2rem', color: '#EF4444', marginBottom: '10px' }} />
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 6px 0' }}>Vaxtı Keçmiş Kitablar</h4>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-title)', margin: 0 }}>{stats?.overdueBorrows ?? 0}</h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
