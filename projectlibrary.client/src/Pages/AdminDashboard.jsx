import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  FaImage
} from 'react-icons/fa';
import './Admin.css';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
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

    const token = sessionStorage.getItem("token");

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = () => {
        setLoading(true);
        fetch("https://localhost:7108/api/books/all")
            .then((res) => {
                if (!res.ok) throw new Error("Kitabları yükləmək mümkün olmadı");
                return res.json();
            })
            .then((data) => setBooks(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Kitablar yüklənmədi:", err);
                toast.error("Kitablar yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    };

    const handleAddBook = (e) => {
        e.preventDefault();
        const copies = parseInt(newBook.totalCopies, 10) || 1;
        const bookToAdd = {
            ...newBook,
            totalCopies: copies,
            availableCopies: copies,
            borrowedBooks: [],
            reservations: []
        };

        fetch("https://localhost:7108/api/books/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bookToAdd)
        })
            .then((res) => {
                if (!res.ok) throw new Error("Kitab əlavə edilərkən xəta baş verdi");
                return res.json();
            })
            .then(() => {
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
                fetchBooks();
            })
            .catch((err) => {
                console.error("Xəta:", err);
                toast.error(err.message || "Kitab əlavə edilə bilmədi");
            });
    };

    const handleDeleteBook = (id) => {
        if (!window.confirm("Bu kitabı sistemdən silmək istədiyinizə əminsiniz?")) {
            return;
        }

        fetch(`https://localhost:7108/api/books/delete/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Kitab silinərkən xəta baş verdi (icarədə ola bilər)');
                }
                toast.success("Kitab uğurla silindi!");
                fetchBooks();
            })
            .catch((err) => {
                console.error("Xəta:", err);
                toast.error(err.message || "Kitab silinə bilmədi");
            });
    };

    const handleEditBook = (book) => {
        setSelectedBook({ ...book });
        setShowEditModal(true);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!selectedBook) return;

        const id = selectedBook.bookId ?? selectedBook.BookId ?? selectedBook.id;
        const payload = {
            ...selectedBook,
            totalCopies: parseInt(selectedBook.totalCopies, 10),
            availableCopies: parseInt(selectedBook.availableCopies, 10)
        };

        fetch(`https://localhost:7108/api/books/edit/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then((res) => {
                if (!res.ok) throw new Error("Məlumatlar yenilənərkən xəta baş verdi");
                return res.json();
            })
            .then(() => {
                toast.success("Kitab məlumatları yeniləndi!");
                setShowEditModal(false);
                fetchBooks();
            })
            .catch((err) => {
                console.error("Redaktə xətası:", err);
                toast.error(err.message || "Yeniləmək mümkün olmadı");
            });
    };

    // Stats
    const stats = useMemo(() => {
        const totalTitles = books.length;
        const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies ?? b.TotalCopies ?? 0), 0);
        const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies ?? b.AvailableCopies ?? 0), 0);
        const borrowedCount = totalCopies - availableCopies;
        return { totalTitles, totalCopies, availableCopies, borrowedCount };
    }, [books]);

    const filteredBooks = useMemo(() => {
        return books.filter(b => 
            (b.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (b.author?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (b.genre?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
    }, [books, searchTerm]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <ToastContainer position="top-right" autoClose={3000} />

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
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FaBook />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ümumi Kitab</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: 'var(--text-title)' }}>{stats.totalTitles}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                        <FaLayerGroup />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cəmi Nüsxə</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: 'var(--text-title)' }}>{stats.totalCopies}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                        <FaCheckCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mövcud Nüsxə</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#059669' }}>{stats.availableCopies}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                        <FaTimesCircle />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>İcarədə Olan</span>
                        <h3 style={{ margin: 0, fontSize: '1.7rem', color: '#D97706' }}>{stats.borrowedCount}</h3>
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
