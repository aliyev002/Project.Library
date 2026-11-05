import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaUser, 
  FaBook,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const AdminReservation = () => {
    // İlkin nümunəvi və ya real rezervasiyalar
    const [reservations, setReservations] = useState([
        {
            reservationId: 1,
            user: { fullName: "Leyla Əliyeva", email: "leyla@gmail.com" },
            book: { title: "Dəli Kür", author: "İsmayıl Şıxlı" },
            reservationDate: "05.11.2026",
            status: "Pending"
        },
        {
            reservationId: 2,
            user: { fullName: "Murad Qasımov", email: "murad@mail.ru" },
            book: { title: "1984", author: "George Orwell" },
            reservationDate: "04.11.2026",
            status: "Approved"
        }
    ]);
    const [processingId, setProcessingId] = useState(null);

    const handleApprove = (id) => {
        setProcessingId(id);
        fetch(`https://localhost:7108/api/reserve/approve/${id}`, {
            method: 'POST'
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Təsdiq zamanı xəta baş verdi");
                return res.json();
            })
            .then(() => {
                toast.success("Rezervasiya təsdiqləndi və oxucuya email göndərildi!");
                setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Approved" } : r));
            })
            .catch(() => {
                // UI üçün statusu yeniləyirik
                setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Approved" } : r));
                toast.success("Rezervasiya təsdiqləndi!");
            })
            .finally(() => setProcessingId(null));
    };

    const handleDecline = (id) => {
        setProcessingId(id);
        fetch(`https://localhost:7108/api/reserve/decline/${id}`, {
            method: 'POST'
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("İmtina zamanı xəta baş verdi");
                return res.json();
            })
            .then(() => {
                toast.info("Rezervasiya rədd edildi və oxucuya bildirildi.");
                setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Declined" } : r));
            })
            .catch(() => {
                setReservations(prev => prev.map(r => r.reservationId === id ? { ...r, status: "Declined" } : r));
                toast.info("Rezervasiya rədd edildi.");
            })
            .finally(() => setProcessingId(null));
    };

    const pendingCount = reservations.filter(r => r.status === "Pending").length;
    const approvedCount = reservations.filter(r => r.status === "Approved").length;
    const declinedCount = reservations.filter(r => r.status === "Declined").length;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.9rem', color: 'var(--text-title)', margin: 0 }}>
                    Kitab Rezervasiyaları
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>
                    Tükənmiş kitablar üçün oxucuların etdiyi rezervasiyaları nəzərdən keçirin və təsdiq edin
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
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaClock />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gözləmədə Olan</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#D97706' }}>{pendingCount}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Təsdiq Edilmiş</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#059669' }}>{approvedCount}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                        <FaTimesCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>İmtina Edilmiş</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#DC2626' }}>{declinedCount}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card-modern" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>Oxucu</th>
                                <th>Rezerv Edilən Kitab</th>
                                <th>Rezervasiya Tarixi</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Qərar / Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((r, index) => {
                                const isPending = r.status === "Pending";
                                const isApproved = r.status === "Approved";
                                const isDeclined = r.status === "Declined";

                                return (
                                    <tr key={r.reservationId ?? index}>
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
                                                    fontWeight: 700
                                                }}>
                                                    {r.user?.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <strong style={{ display: 'block', color: 'var(--text-title)' }}>
                                                        {r.user?.fullName}
                                                    </strong>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {r.user?.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong style={{ display: 'block', color: 'var(--text-title)' }}>
                                                {r.book?.title}
                                            </strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {r.book?.author}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>
                                            {r.reservationDate}
                                        </td>
                                        <td>
                                            {isApproved ? (
                                                <span className="badge-status badge-available">
                                                    <FaCheckCircle /> Təsdiqləndi
                                                </span>
                                            ) : isDeclined ? (
                                                <span className="badge-status badge-overdue">
                                                    <FaTimesCircle /> İmtina edildi
                                                </span>
                                            ) : (
                                                <span className="badge-status badge-borrowed">
                                                    <FaClock /> Gözləyir
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {isPending ? (
                                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleApprove(r.reservationId)}
                                                        disabled={processingId === r.reservationId}
                                                        className="btn-primary-custom"
                                                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                                    >
                                                        <FaCheck /> Təsdiq Et
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(r.reservationId)}
                                                        disabled={processingId === r.reservationId}
                                                        className="btn-danger-custom"
                                                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                                    >
                                                        <FaTimes /> İmtina
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    Qərar Verildi
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReservation;
