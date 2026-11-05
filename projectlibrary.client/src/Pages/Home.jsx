import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaSearch, 
  FaFilter, 
  FaBook, 
  FaUserEdit, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaTimes, 
  FaBookOpen,
  FaTags
} from 'react-icons/fa';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [searchTitle, setSearchTitle] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [borrowingId, setBorrowingId] = useState(null);

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    useEffect(() => {
        fetchBooks();
        if (token && userId) {
            fetchBorrowedBooks();
        }
    }, []);

    const fetchBooks = () => {
        setLoading(true);
        fetch("https://localhost:7108/api/books/all")
            .then((res) => {
                if (!res.ok) throw new Error("Kitabları yükləmək mümkün olmadı");
                return res.json();
            })
            .then((data) => {
                setBooks(data);
            })
            .catch((err) => {
                console.error("Kitablar yüklənmədi:", err);
                toast.error("Kitablar yüklənərkən xəta baş verdi");
            })
            .finally(() => setLoading(false));
    };

    const fetchBorrowedBooks = () => {
        fetch(`https://localhost:7108/api/borrow/user/${userId}/all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (Array.isArray(data)) {
                    setBorrowedBooks(data);
                }
            })
            .catch((err) => console.error("İcarəyə götürülən kitablar yüklənmədi:", err));
    };

    // İstifadəçinin kitabı hazırda icarədə saxlayıb saxlamadığını yoxlayırıq
    const isBookBorrowed = (bookId) => {
        return borrowedBooks.some(book =>
            (book.bookId === bookId || book.BookId === bookId) && 
            (book.status?.toLowerCase() === "borrowed" || book.Status?.toLowerCase() === "borrowed")
        );
    };

    const getBookId = (book) => {
        if (!book) return null;
        return book.bookId ?? book.BookId ?? book.id ?? null;
    };

    const handleBorrowBook = (id) => {
        if (!id) return;
        setBorrowingId(id);

        fetch(`https://localhost:7108/api/borrow/borrow/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "İcarəyə götürmək mümkün olmadı");
                }
                return res.json();
            })
            .then(() => {
                toast.success("Kitab uğurla icarəyə götürüldü!");
                fetchBooks();
                fetchBorrowedBooks();
                setSelectedBook(null);
            })
            .catch((err) => {
                console.error("Borrow error:", err);
                toast.error(err.message || "İcarəyə götürmək mümkün olmadı");
            })
            .finally(() => setBorrowingId(null));
    };

    // Unikal janrların siyahısı
    const genres = useMemo(() => {
        const unique = new Set();
        books.forEach(b => {
            if (b.genre && b.genre.trim()) {
                unique.add(b.genre.trim());
            }
        });
        return Array.from(unique);
    }, [books]);

    // Filtrlənmiş kitablar
    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const matchesTitle = 
                (book.title?.toLowerCase() || "").includes(searchTitle.toLowerCase()) ||
                (book.author?.toLowerCase() || "").includes(searchTitle.toLowerCase());
            const matchesGenre = selectedGenre === "all" || book.genre?.toLowerCase() === selectedGenre.toLowerCase();
            return matchesTitle && matchesGenre;
        });
    }, [books, searchTitle, selectedGenre]);

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #4D1B30 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 40px',
                color: '#FFFFFF',
                boxShadow: '0 12px 30px rgba(123, 45, 74, 0.25)',
                marginBottom: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '650px', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '16px'
                    }}>
                        <FaBookOpen /> Elektron Kitabxana Kataloqu
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '16px' }}>
                        Minlərlə Kitab, Sonsuz Bilik Dünyası
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: '#F1F5F9', opacity: 0.9, lineHeight: 1.6 }}>
                        İstədiyiniz əsəri axtarın, janrlara görə filtrləyin və bir kliklə şəxsi icarənizə əlavə edin.
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    zIndex: 1
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '18px 24px',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <h3 style={{ color: '#FFFFFF', fontSize: '1.8rem', margin: 0 }}>{books.length}</h3>
                        <span style={{ fontSize: '0.82rem', color: '#F1F5F9', opacity: 0.85 }}>Ümumi Kitab</span>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '18px 24px',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                        <h3 style={{ color: 'var(--accent)', fontSize: '1.8rem', margin: 0 }}>{genres.length}</h3>
                        <span style={{ fontSize: '0.82rem', color: '#F1F5F9', opacity: 0.85 }}>Fərqli Janr</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="card-modern" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    {/* Search Input */}
                    <div style={{ flex: '1 1 300px', position: 'relative' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <input
                            type="text"
                            placeholder="Kitabın adı və ya müəllifi axtarın..."
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            className="input-modern"
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>

                    {/* Genre Selector */}
                    <div style={{ flex: '0 1 240px', position: 'relative' }}>
                        <FaFilter style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="input-modern"
                            style={{ paddingLeft: '44px', cursor: 'pointer', appearance: 'auto' }}
                        >
                            <option value="all">Bütün Janrlar ({books.length})</option>
                            {genres.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Button */}
                    {(searchTitle || selectedGenre !== "all") && (
                        <button
                            onClick={() => { setSearchTitle(""); setSelectedGenre("all"); }}
                            className="btn-secondary-custom"
                        >
                            <FaTimes /> Təmizlə
                        </button>
                    )}
                </div>

                {/* Genre Quick Tags */}
                {genres.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
                            <FaTags /> Populyar:
                        </span>
                        <button
                            onClick={() => setSelectedGenre("all")}
                            style={{
                                border: 'none',
                                padding: '5px 14px',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                backgroundColor: selectedGenre === "all" ? 'var(--primary)' : 'var(--bg-main)',
                                color: selectedGenre === "all" ? '#FFFFFF' : 'var(--text-body)'
                            }}
                        >
                            Hamısı
                        </button>
                        {genres.slice(0, 7).map(g => (
                            <button
                                key={g}
                                onClick={() => setSelectedGenre(g)}
                                style={{
                                    border: 'none',
                                    padding: '5px 14px',
                                    borderRadius: 'var(--radius-pill)',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    backgroundColor: selectedGenre === g ? 'var(--primary)' : 'var(--bg-main)',
                                    color: selectedGenre === g ? '#FFFFFF' : 'var(--text-body)'
                                }}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Book Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <FaBook style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
                    <p style={{ fontWeight: 600 }}>Kitablar yüklənir...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="card-modern" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <FaBookOpen style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h4 style={{ color: 'var(--text-title)', marginBottom: '8px' }}>Heç bir kitab tapılmadı</h4>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
                        Axtarış sözünü dəyişməyə və ya filtrləri sıfırlamağa cəhd edin.
                    </p>
                    <button
                        onClick={() => { setSearchTitle(""); setSelectedGenre("all"); }}
                        className="btn-primary-custom"
                    >
                        Filtrləri Sıfırla
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredBooks.map((book, index) => {
                        const id = getBookId(book) ?? index;
                        const isBorrowed = isBookBorrowed(id);
                        const isAvailable = (book.availableCopies ?? book.AvailableCopies ?? book.totalCopies ?? 1) > 0;
                        const copiesLeft = book.availableCopies ?? book.AvailableCopies ?? 0;

                        return (
                            <div
                                key={id}
                                className="card-modern"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setSelectedBook(book)}
                            >
                                {/* Book Cover Area */}
                                <div style={{
                                    height: '240px',
                                    backgroundColor: '#F1F5F9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    padding: '16px'
                                }}>
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '6px',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop";
                                        }}
                                    />
                                    
                                    {/* Genre Tag on Top Left */}
                                    <span style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(4px)',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-pill)',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                    }}>
                                        {book.genre || 'Ümumi'}
                                    </span>
                                </div>

                                {/* Content Details */}
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                    <div>
                                        <h5 style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 700,
                                            marginBottom: '6px',
                                            color: 'var(--text-title)',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.35,
                                            height: '2.7em'
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

                                    {/* Footer Info & Status */}
                                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            {isBorrowed ? (
                                                <span className="badge-status badge-borrowed">
                                                    <FaClock /> İcarənizdədir
                                                </span>
                                            ) : isAvailable ? (
                                                <span className="badge-status badge-available">
                                                    <FaCheckCircle /> {copiesLeft} ədəd mövcuddur
                                                </span>
                                            ) : (
                                                <span className="badge-status badge-overdue">
                                                    <FaTimesCircle /> Tükənib
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className="btn-primary-custom"
                                            style={{ width: '100%', padding: '9px', fontSize: '0.9rem' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBook(book);
                                            }}
                                        >
                                            Ətraflı Baxış
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modern Book Details Modal */}
            {selectedBook && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(15, 23, 42, 0.65)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2000,
                    padding: "20px"
                }}
                onClick={() => setSelectedBook(null)}
                >
                    <div
                        className="card-modern"
                        style={{
                            maxWidth: "680px",
                            width: "100%",
                            padding: "36px",
                            position: "relative",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            backgroundColor: "#FFFFFF"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedBook(null)}
                            style={{
                                position: "absolute",
                                top: "18px",
                                right: "18px",
                                background: "#F1F5F9",
                                border: "none",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-body)",
                                cursor: "pointer",
                                transition: "var(--transition)"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        >
                            <FaTimes />
                        </button>

                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                            {/* Book Image */}
                            <div style={{ flex: '0 0 200px', margin: '0 auto' }}>
                                <img
                                    src={selectedBook.imageUrl}
                                    alt={selectedBook.title}
                                    style={{
                                        width: '100%',
                                        borderRadius: '10px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop";
                                    }}
                                />
                            </div>

                            {/* Info */}
                            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column' }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 'fit-content',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-pill)',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    marginBottom: '10px'
                                }}>
                                    {selectedBook.genre}
                                </span>

                                <h3 style={{ fontSize: '1.6rem', color: 'var(--text-title)', marginBottom: '8px' }}>
                                    {selectedBook.title}
                                </h3>

                                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                    <FaUserEdit /> Müəllif: <strong style={{ color: 'var(--text-title)' }}>{selectedBook.author}</strong>
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '12px',
                                    padding: '14px',
                                    backgroundColor: 'var(--bg-main)',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mövcud Say:</span>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-title)' }}>
                                            {selectedBook.availableCopies ?? selectedBook.AvailableCopies ?? 0} nüsxə
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ümumi Fond:</span>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-title)' }}>
                                            {selectedBook.totalCopies ?? selectedBook.TotalCopies ?? 0} nüsxə
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h6 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '6px' }}>
                                        Kitab Haqqında:
                                    </h6>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6, maxHeight: '140px', overflowY: 'auto' }}>
                                        {selectedBook.description || "Təsvir qeyd edilməyib."}
                                    </p>
                                </div>

                                {/* Modal Actions */}
                                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                                    {isBookBorrowed(getBookId(selectedBook)) ? (
                                        <button
                                            disabled
                                            className="btn-secondary-custom"
                                            style={{ flex: 1, backgroundColor: '#FEF3C7', color: '#D97706', borderColor: '#FDE68A', cursor: 'not-allowed' }}
                                        >
                                            <FaClock /> Bu kitab artıq icarənizdədir
                                        </button>
                                    ) : (selectedBook.availableCopies ?? selectedBook.AvailableCopies ?? 0) <= 0 ? (
                                        <button
                                            disabled
                                            className="btn-secondary-custom"
                                            style={{ flex: 1, backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA', cursor: 'not-allowed' }}
                                        >
                                            <FaTimesCircle /> Hazırda mövcud nüsxə yoxdur
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBorrowBook(getBookId(selectedBook))}
                                            disabled={borrowingId === getBookId(selectedBook)}
                                            className="btn-primary-custom"
                                            style={{ flex: 1 }}
                                        >
                                            <FaCheckCircle />
                                            {borrowingId === getBookId(selectedBook) ? 'İcarəyə götürülür...' : 'İcarəyə Götür'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setSelectedBook(null)}
                                        className="btn-secondary-custom"
                                    >
                                        Bağla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
