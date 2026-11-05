import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaBookReader, 
  FaCalendarAlt, 
  FaUserEdit, 
  FaTag, 
  FaExclamationCircle, 
  FaBookOpen,
  FaArrowRight 
} from 'react-icons/fa';

const Dashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    useEffect(() => {
        fetchBorrowedBooks();
    }, []);

    const fetchBorrowedBooks = () => {
        setLoading(true);
        fetch(`https://localhost:7108/api/borrow/user/${userId}/active`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 404) {
                    return [];
                }
                if (!res.ok) throw new Error("İcarələri yükləmək mümkün olmadı");
                return res.json();
            })
            .then((data) => {
                setBooks(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Kitablar yüklənmədi:", err);
                toast.error("İcarəyə götürülən kitablar yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #4D1B30 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 40px',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px rgba(123, 45, 74, 0.2)',
                marginBottom: '32px',
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
                        Mənim Aktiv İcarələrim
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: '#F1F5F9', opacity: 0.85, marginTop: '6px', margin: 0 }}>
                        Hazırda oxuduğunuz və geri qaytarmalı olduğunuz kitabların siyahısı
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px 28px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '0.8rem', color: '#F1F5F9', opacity: 0.9 }}>Cari İcarələr</span>
                    <h3 style={{ color: '#FFFFFF', fontSize: '2rem', margin: 0 }}>{books.length}</h3>
                </div>
            </div>

            {/* Content */}
            {loading ? (
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
                        const status = (book.status ?? book.Status ?? "borrowed").toLowerCase();

                        return (
                            <div
                                key={borrowId}
                                className="card-modern"
                                style={{
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderTop: '4px solid var(--primary)'
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

                                        <span className={`badge-status ${status === 'returned' ? 'badge-available' : 'badge-borrowed'}`}>
                                            {status === 'returned' ? 'Qaytarıldı' : 'İcarədədir'}
                                        </span>
                                    </div>

                                    <h4 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '8px', lineHeight: 1.3 }}>
                                        {title}
                                    </h4>

                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                        <FaUserEdit /> {author}
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: 'var(--bg-main)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontSize: '0.88rem', fontWeight: 600 }}>
                                        <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                                        <span>Qaytarılma Tarixi:</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem' }}>
                                        {returnDate || 'Təyin edilməyib'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
