import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaSearch, 
  FaBook, 
  FaEdit, 
  FaTrashAlt, 
  FaLayerGroup, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserEdit, 
  FaImage,
  FaExchangeAlt,
  FaBookmark,
  FaUsers
} from 'react-icons/fa';
import './Admin.css';
import { getAllBooks, addBook, editBook, deleteBook } from '../Api/bookApi';
import { getAdminSummary } from '../Api/statsApi';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        genre: "",
        totalCopies: "",
        description: "",
        imageUrl: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [booksData, statsData] = await Promise.allSettled([
                getAllBooks(),
                getAdminSummary()
            ]);
            if (booksData.status === "fulfilled") {
                setBooks(Array.isArray(booksData.value) ? booksData.value : []);
            }
            if (statsData.status === "fulfilled") {
                setStats(statsData.value);
            }
        } catch (err) {
            console.error("Məlumatlar yüklənmədi:", err);
            toast.error("Məlumatlar yüklənərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(Array.isArray(data) ? data : []);
            const summary = await getAdminSummary();
            setStats(summary);
        } catch (err) {
            console.error("Kitablar yenilənmədi:", err);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        const copies = parseInt(newBook.totalCopies, 10) || 1;
        const bookToAdd = {
            ...newBook,
            totalCopies: copies,
            availableCopies: copies
        };

        try {
            await addBook(bookToAdd);
            toast.success("Yeni kitab uğurla əlavə edildi!");
            setShowModal(false);
            setNewBook({
                title: "",
                author: "",
                genre: "",
                totalCopies: "",
                description: "",
                imageUrl: ""
            });
            await fetchBooks();
        } catch (err) {
            console.error("Xəta:", err);
            const msg = err.response?.data?.message || "Kitab əlavə edilə bilmədi";
            toast.error(msg);
        }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm("Bu kitabı sistemdən silmək istədiyinizə əminsiniz?")) {
            return;
        }

        try {
            await deleteBook(id);
            toast.success("Kitab uğurla silindi!");
            await fetchBooks();
        } catch (err) {
            console.error("Xəta:", err);
            const msg = err.response?.data?.message || "Kitab silinə bilmədi (icarədə ola bilər)";
            toast.error(msg);
        }
    };

    const handleEditBook = (book) => {
        setSelectedBook({ ...book });
        setShowEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedBook) return;

        const id = selectedBook.bookId ?? selectedBook.BookId ?? selectedBook.id;
        const payload = {
            ...selectedBook,
            totalCopies: parseInt(selectedBook.totalCopies, 10),
            availableCopies: parseInt(selectedBook.availableCopies, 10)
        };

        try {
            await editBook(id, payload);
            toast.success("Kitab məlumatları yeniləndi!");
            setShowEditModal(false);
            await fetchBooks();
        } catch (err) {
            console.error("Redaktə xətası:", err);
            const msg = err.response?.data?.message || "Yeniləmək mümkün olmadı";
            toast.error(msg);
        }
    };

    // Stats
    const displayStats = useMemo(() => {
        const totalTitles = stats?.totalBooks ?? books.length;
        const totalCopies = stats?.totalCopies ?? books.reduce((acc, b) => acc + (b.totalCopies ?? b.TotalCopies ?? 0), 0);
        const availableCopies = stats?.availableCopies ?? books.reduce((acc, b) => acc + (b.availableCopies ?? b.AvailableCopies ?? 0), 0);
        const borrowedCount = stats?.activeBorrows ?? (totalCopies - availableCopies);
        const pendingRes = stats?.pendingReservations ?? 0;
        const totalUsers = stats?.totalUsers ?? 0;
        return { totalTitles, totalCopies, availableCopies, borrowedCount, pendingRes, totalUsers };
    }, [books, stats]);

    const filteredBooks = useMemo(() => {
        return books.filter(b => 
            (b.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (b.author?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (b.genre?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
    }, [books, searchTerm]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {/* Top Bar Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '30px'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.9rem', color: 'var(--text-title)', margin: 0 }}>
                        Kitabların İdarə Edilməsi
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>
                        Fondun tərkibini izləyin, yeni əsərlər əlavə edin və nüsxələri yeniləyin
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary-custom"
                    style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                >
                    <FaPlus /> Yeni Kitab Əlavə Et
                </button>
            </div>

            {/* Top Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FaBook />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi Kitab</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-title)' }}>{displayStats.totalTitles}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                        <FaLayerGroup />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi Nüsxə</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-title)' }}>{displayStats.totalCopies}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mövcud Nüsxə</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#059669' }}>{displayStats.availableCopies}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaExchangeAlt />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>İcarədə Olan</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#D97706' }}>{displayStats.borrowedCount}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
                        <FaBookmark />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Rezervasiyalar</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#7C3AED' }}>{displayStats.pendingRes}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                        <FaUsers />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>İstifadəçilər</span>
                        <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#16A34A' }}>{displayStats.totalUsers}</h3>
                    </div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="card-modern" style={{ padding: '18px 24px', marginBottom: '28px' }}>
                <div style={{ position: 'relative', maxWidth: '450px' }}>
                    <FaSearch style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }} />
                    <input
                        type="text"
                        placeholder="Kitab adı, müəllif və ya janr üzrə axtarış..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-modern"
                        style={{ paddingLeft: '44px' }}
                    />
                </div>
            </div>

            {/* Book Cards Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <FaBook style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600 }}>Kitablar yüklənir...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="card-modern" style={{ textAlign: 'center', padding: '50px' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Kitab tapılmadı.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredBooks.map((book) => {
                        const id = book.bookId ?? book.BookId ?? book.id;
                        const available = book.availableCopies ?? book.AvailableCopies ?? 0;
                        const total = book.totalCopies ?? book.TotalCopies ?? 0;

                        return (
                            <div
                                key={id}
                                className="card-modern"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    justifyContent: 'space-between'
                                }}
                            >
                                {/* Top Image Preview */}
                                <div style={{
                                    height: '200px',
                                    backgroundColor: '#F8FAFC',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '6px',
                                            boxShadow: '0 6px 14px rgba(0,0,0,0.12)'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop";
                                        }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        color: 'var(--primary)',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-pill)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700
                                    }}>
                                        {book.genre}
                                    </span>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h5 style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 700,
                                            color: 'var(--text-title)',
                                            marginBottom: '6px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.35
                                        }}>
                                            {book.title}
                                        </h5>
                                        <p style={{
                                            fontSize: '0.88rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginBottom: '14px'
                                        }}>
                                            <FaUserEdit /> {book.author}
                                        </p>
                                    </div>

                                    {/* Stats Badge */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: 'var(--bg-main)',
                                        padding: '10px 14px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        marginBottom: '16px'
                                    }}>
                                        <span style={{ color: 'var(--text-body)' }}>Nüsxə Sayı:</span>
                                        <span>
                                            <strong style={{ color: available > 0 ? '#059669' : '#DC2626' }}>{available}</strong>
                                            {' / '}
                                            <span style={{ color: 'var(--text-muted)' }}>{total}</span>
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleEditBook(book)}
                                            className="btn-secondary-custom"
                                            style={{ flex: 1, padding: '8px' }}
                                        >
                                            <FaEdit /> Redaktə
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBook(id)}
                                            className="btn-danger-custom"
                                            style={{ padding: '8px 14px' }}
                                            title="Sil"
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Yeni Kitab Əlavə Et Modalı */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <Modal.Title style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '1.3rem' }}>
                        Yeni Kitab Əlavə Et
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddBook}>
                    <Modal.Body style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Kitabın Adı</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Məs: Əli və Nino"
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Müəllif</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Məs: Qurban Səid"
                                    value={newBook.author}
                                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Janr</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Məs: Tarixi Roman"
                                    value={newBook.genre}
                                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Ümumi Nüsxə Sayı</Form.Label>
                                <Form.Control
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Məs: 5"
                                    value={newBook.totalCopies}
                                    onChange={(e) => setNewBook({ ...newBook, totalCopies: e.target.value })}
                                />
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Şəkil URL-si (Üzqabığı)</Form.Label>
                            <Form.Control
                                type="url"
                                required
                                placeholder="https://example.com/cover.jpg"
                                value={newBook.imageUrl}
                                onChange={(e) => setNewBook({ ...newBook, imageUrl: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Təsvir (Məzmun)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                required
                                placeholder="Kitab haqqında qısa annotasiya..."
                                value={newBook.description}
                                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid var(--border-light)' }}>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            İmtina
                        </Button>
                        <button type="submit" className="btn-primary-custom">
                            Yadda Saxla
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Redaktə Modalı */}
            {selectedBook && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                    <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <Modal.Title style={{ fontWeight: 800, color: 'var(--text-title)', fontSize: '1.3rem' }}>
                            Redaktə: {selectedBook.title}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSaveEdit}>
                        <Modal.Body style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Kitab Adı</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={selectedBook.title}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, title: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Müəllif</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={selectedBook.author}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Janr</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={selectedBook.genre}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, genre: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Ümumi Say</Form.Label>
                                    <Form.Control
                                        type="number"
                                        required
                                        min="0"
                                        value={selectedBook.totalCopies}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, totalCopies: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Mövcud Say</Form.Label>
                                    <Form.Control
                                        type="number"
                                        required
                                        min="0"
                                        value={selectedBook.availableCopies}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, availableCopies: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Şəkil URL-si</Form.Label>
                                    <Form.Control
                                        type="url"
                                        required
                                        value={selectedBook.imageUrl}
                                        onChange={(e) => setSelectedBook({ ...selectedBook, imageUrl: e.target.value })}
                                    />
                                </Form.Group>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Təsvir</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={selectedBook.description}
                                    onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer style={{ borderTop: '1px solid var(--border-light)' }}>
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                Bağla
                            </Button>
                            <button type="submit" className="btn-primary-custom">
                                Dəyişiklikləri Yadda Saxla
                            </button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
