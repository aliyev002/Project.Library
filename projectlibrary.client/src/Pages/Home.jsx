import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from 'react-toastify';
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
  FaTags,
  FaBookmark,
  FaHeart,
  FaStar,
  FaComments,
  FaFilePdf,
  FaChair,
  FaArrowRight,
  FaShieldAlt,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import { getAllBooks } from '../Api/bookApi';
import { borrowBook, getUserAllBorrows } from '../Api/borrowApi';
import { reserveBook, getUserReservations } from '../Api/reserveApi';
import { toggleWishlist, getWishlist } from '../Api/featuresApi';
import BookReviewsModal from '../Components/BookReviewsModal';
import PdfModal from '../Components/PdfModal';
import { Link } from 'react-router-dom';

const CURATED_CATEGORIES = [
  {
    name: "Klassiklər & Bədii",
    genreKey: "Bədii",
    count: "500+ Əsər",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    desc: "Dünya və Azərbaycan ədəbiyyatının inciləri"
  },
  {
    name: "Elm & Texnologiya",
    genreKey: "Elm",
    count: "320+ Əsər",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    desc: "Süni intellekt, proqramlaşdırma və mühəndislik"
  },
  {
    name: "Psixologiya & İnkişaf",
    genreKey: "Psixologiya",
    count: "240+ Əsər",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80",
    desc: "Şəxsi inkişaf, liderlik və fərdi motivasiya"
  },
  {
    name: "Tarix & Fəlsəfə",
    genreKey: "Tarix",
    count: "180+ Əsər",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
    desc: "Sivilizasiyalar, böyük liderlər və fəlsəfi düşüncə"
  },
  {
    name: "Xarici Dillər",
    genreKey: "Dil",
    count: "150+ Əsər",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    desc: "İngilis, Alman, Fransız dili və lüğətlər"
  }
];

const Home = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [searchTitle, setSearchTitle] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("all");
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [borrowingId, setBorrowingId] = useState(null);
    const [reservingId, setReservingId] = useState(null);
    const [reviewBook, setReviewBook] = useState(null);
    const [pdfBook, setPdfBook] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(new Set());

    const catalogRef = useRef(null);
    const userId = user?.id || sessionStorage.getItem("userId");

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getAllBooks();
            setBooks(Array.isArray(data) ? data : []);
            if (userId) {
                const [borrows, reserves] = await Promise.allSettled([
                    getUserAllBorrows(userId),
                    getUserReservations(userId)
                ]);
                if (borrows.status === 'fulfilled' && Array.isArray(borrows.value)) {
                    setBorrowedBooks(borrows.value);
                }
                if (reserves.status === 'fulfilled' && Array.isArray(reserves.value)) {
                    setReservations(reserves.value);
                }
                try {
                    const wish = await getWishlist();
                    setWishlistIds(new Set(wish.map(w => w.bookId)));
                } catch {}
            }
        } catch (err) {
            console.error("Məlumatlar yüklənmədi:", err);
            toast.error("Kitablar yüklənərkən xəta baş verdi");
        } finally {
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserRecords = async () => {
        if (!userId) return;
        try {
            const [borrows, reserves] = await Promise.allSettled([
                getUserAllBorrows(userId),
                getUserReservations(userId)
            ]);
            if (borrows.status === 'fulfilled') setBorrowedBooks(borrows.value || []);
            if (reserves.status === 'fulfilled') setReservations(reserves.value || []);
        } catch (err) {
            console.error(err);
        }
    };

    const isBookBorrowed = (bookId) => {
        return borrowedBooks.some(book =>
            (book.bookId === bookId || book.BookId === bookId) && 
            (book.status?.toLowerCase() === "borrowed" || book.Status?.toLowerCase() === "borrowed")
        );
    };

    const isBookReserved = (bookId) => {
        return reservations.some(r =>
            (r.bookId === bookId || r.BookId === bookId) &&
            (r.status === "Pending" || r.status === "Approved")
        );
    };

    const getBookId = (book) => {
        if (!book) return null;
        return book.bookId ?? book.BookId ?? book.id ?? null;
    };

    const handleToggleWishlist = async (bookId, e) => {
        if (e) e.stopPropagation();
        try {
            const res = await toggleWishlist(bookId);
            setWishlistIds(prev => {
                const next = new Set(prev);
                if (next.has(bookId)) next.delete(bookId);
                else next.add(bookId);
                return next;
            });
            toast.info(res.message || "Sevimlilər siyahısı yeniləndi");
        } catch {
            toast.error("Xəta baş verdi");
        }
    };

    const handleBorrowBook = async (id) => {
        if (!id) return;
        setBorrowingId(id);

        try {
            await borrowBook(id);
            toast.success("Kitab uğurla icarəyə götürüldü!");
            await fetchBooks();
            await fetchUserRecords();
            setSelectedBook(null);
        } catch (err) {
            console.error("Borrow error:", err);
            const msg = err.response?.data?.message || "İcarəyə götürmək mümkün olmadı";
            toast.error(msg);
        } finally {
            setBorrowingId(null);
        }
    };

    const handleReserveBook = async (id) => {
        if (!id) return;
        setReservingId(id);

        try {
            const res = await reserveBook(id);
            toast.success(res.message || "Kitab uğurla rezerv edildi!");
            await fetchBooks();
            await fetchUserRecords();
            setSelectedBook(null);
        } catch (err) {
            console.error("Reserve error:", err);
            const msg = err.response?.data?.message || "Rezervasiya mümkün olmadı";
            toast.error(msg);
        } finally {
            setReservingId(null);
        }
    };

    const genres = useMemo(() => {
        const unique = new Set();
        books.forEach(b => {
            if (b.genre && b.genre.trim()) {
                unique.add(b.genre.trim());
            }
        });
        return Array.from(unique);
    }, [books]);

    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const matchesTitle = 
                (book.title?.toLowerCase() || "").includes(searchTitle.toLowerCase()) ||
                (book.author?.toLowerCase() || "").includes(searchTitle.toLowerCase());
            const matchesGenre = selectedGenre === "all" || 
                book.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
                book.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
            return matchesTitle && matchesGenre;
        });
    }, [books, searchTitle, selectedGenre]);

    const spotlightBook = useMemo(() => {
        if (books.length === 0) return null;
        return books.find(b => (b.ratingAverage || 0) >= 4.5) || books[0];
    }, [books]);

    const scrollToCatalog = (genre = "all") => {
        setSelectedGenre(genre);
        if (catalogRef.current) {
            catalogRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '10px 24px 60px 24px' }}>

            {/* HERO SECTION: World-Class Editorial Design */}
            <div style={{
                borderRadius: '28px',
                padding: '64px 48px',
                color: '#FFFFFF',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.4)',
                marginBottom: '48px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(48, 23, 36, 0.92) 50%, rgba(88, 28, 48, 0.90) 100%), url("https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat'
            }}>
                <div style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
                    
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        padding: '7px 16px',
                        borderRadius: '30px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#F6C177',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        marginBottom: '20px'
                    }}>
                        <FaBookOpen /> Rəqəmsal Kitabxana & Tədqiqat Mərkəzi
                    </div>

                    <h1 style={{
                        fontSize: '3.2rem',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: '-0.03em',
                        marginBottom: '18px',
                        fontFamily: 'var(--font-sans)',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                        Mütaliə Mədəniyyəti və <span style={{ 
                            background: 'linear-gradient(90deg, #F6C177 0%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Sonsuz Bilik Dünyası</span>
                    </h1>

                    <p style={{
                        fontSize: '1.12rem',
                        color: '#E2E8F0',
                        lineHeight: 1.65,
                        maxWidth: '680px',
                        marginBottom: '32px',
                        opacity: 0.92
                    }}>
                        Klassik şah əsərlərdən tutmuş ən müasir texnoloji kitablara qədər minlərlə nəşri kəşf edin, 3D zalda masa bron edin və şəxsi mütaliənizi inkişaf etdirin.
                    </p>

                    {/* Integrated Search & Quick Pills */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.14)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.22)',
                        borderRadius: '18px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                        maxWidth: '640px'
                    }}>
                        <FaSearch size={18} color="#CBD5E1" style={{ marginLeft: '8px' }} />
                        <input 
                            type="text"
                            placeholder="Kitab adı, müəllif və ya janr axtarın..."
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '0.96rem',
                                width: '100%',
                                outline: 'none',
                                fontWeight: 500
                            }}
                        />
                        {searchTitle && (
                            <button
                                onClick={() => setSearchTitle("")}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#CBD5E1',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <FaTimes />
                            </button>
                        )}
                        <button
                            onClick={() => scrollToCatalog(selectedGenre)}
                            style={{
                                background: 'linear-gradient(135deg, #E69A38 0%, #D08522 100%)',
                                color: '#0F172A',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 12px rgba(230, 154, 56, 0.35)'
                            }}
                        >
                            Axtar
                        </button>
                    </div>

                    {/* Quick Stats Pills */}
                    <div style={{ display: 'flex', gap: '24px', marginTop: '36px', flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', display: 'block' }}>
                                {books.length}+
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Kitabxana Fondu
                            </span>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '24px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', display: 'block' }}>
                                24 Masa
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                3D Oxu Zalı
                            </span>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '24px' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F6C177', display: 'block' }}>
                                24/7
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                PDF & E-Kitablar
                            </span>
                        </div>
                    </div>
                </div>

                {/* Decorative 3D Ambient Element */}
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '420px',
                    height: '420px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(230, 154, 56, 0.22) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    zIndex: 1
                }} />
            </div>

            {/* CURATED CATEGORIES: Visual Cards */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '22px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-title)', margin: '0 0 6px 0' }}>
                            Populyar Kolleksiyalar & Janrlar
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                            Maraq dairənizə uyğun tematik kateqoriyalardan birini seçərək axtarışı dəqiqləşdirin
                        </p>
                    </div>
                    <button
                        onClick={() => scrollToCatalog("all")}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Bütün Janrlar <FaArrowRight size={12} />
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px'
                }}>
                    {CURATED_CATEGORIES.map((cat, idx) => (
                        <div
                            key={idx}
                            onClick={() => scrollToCatalog(cat.genreKey)}
                            style={{
                                height: '200px',
                                borderRadius: '20px',
                                backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.2) 60%), url(${cat.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.12)',
                                border: '1px solid var(--border-color)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(15, 23, 42, 0.24)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(15, 23, 42, 0.12)';
                            }}
                        >
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: '#E69A38',
                                color: '#0F172A',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                width: 'fit-content',
                                marginBottom: '6px',
                                textTransform: 'uppercase'
                            }}>
                                {cat.count}
                            </span>
                            <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800 }}>
                                {cat.name}
                            </h4>
                            <p style={{ color: '#E2E8F0', margin: 0, fontSize: '0.78rem', opacity: 0.88, lineHeight: 1.3 }}>
                                {cat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SPOTLIGHT BOOK OF THE WEEK */}
            {spotlightBook && (
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    padding: '36px',
                    marginBottom: '48px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '36px',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '200px',
                        height: '280px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                        flexShrink: 0
                    }}>
                        <img 
                            src={spotlightBook.imageUrl} 
                            alt={spotlightBook.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop";
                            }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                                background: 'rgba(230, 154, 56, 0.15)',
                                color: '#D97706',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                ★ Həftənin Seçilmiş Əsəri
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaStar size={13} /> {spotlightBook.ratingAverage || 5.0} / 5.0
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-title)', margin: '0 0 8px 0' }}>
                            {spotlightBook.title}
                        </h3>

                        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaUserEdit /> Müəllif: <strong style={{ color: 'var(--text-title)' }}>{spotlightBook.author}</strong>
                        </p>

                        <p style={{ fontSize: '0.94rem', color: 'var(--text-body)', lineHeight: 1.6, maxWidth: '780px', marginBottom: '22px' }}>
                            {spotlightBook.description || "Kitabxanamızın ən çox oxunan və oxucular tərəfindən yüksək qiymətləndirilən nadir əsərlərindən biridir."}
                        </p>

                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedBook(spotlightBook)}
                                className="btn-primary-custom"
                                style={{ padding: '12px 24px' }}
                            >
                                <FaCheckCircle /> Ətraflı Baxış & İcarə
                            </button>
                            <button
                                onClick={() => setPdfBook(spotlightBook)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-main)',
                                    color: 'var(--text-title)',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaFilePdf color="#EF4444" /> Elektron PDF Oxu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CATALOG SECTION WITH REFINED FILTER CHIPS */}
            <div ref={catalogRef} style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-title)', margin: '0 0 6px 0' }}>
                            Kitablar Kataloqu
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                            Cəmi {filteredBooks.length} kitab tapıldı • {selectedGenre === "all" ? "Bütün Janrlar" : selectedGenre}
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setSelectedGenre("all")}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.84rem',
                                fontWeight: selectedGenre === "all" ? 700 : 500,
                                cursor: 'pointer',
                                background: selectedGenre === "all" ? 'var(--primary)' : 'var(--bg-card)',
                                color: selectedGenre === "all" ? '#FFFFFF' : 'var(--text-body)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            Bütün Janrlar ({books.length})
                        </button>
                        {genres.slice(0, 6).map((g) => {
                            const active = selectedGenre.toLowerCase() === g.toLowerCase();
                            return (
                                <button
                                    key={g}
                                    onClick={() => setSelectedGenre(g)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontSize: '0.84rem',
                                        fontWeight: active ? 700 : 500,
                                        cursor: 'pointer',
                                        background: active ? 'var(--primary)' : 'var(--bg-card)',
                                        color: active ? '#FFFFFF' : 'var(--text-body)',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                                        border: '1px solid var(--border-color)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {g}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* BOOK GRID */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <FaBook style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--primary)', animation: 'pulse 1.5s infinite' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>Kitab fondu yüklənir...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="card-modern" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <FaBookOpen style={{ fontSize: '3.5rem', color: 'var(--text-muted)', marginBottom: '18px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-title)', marginBottom: '8px', fontWeight: 800 }}>Axtarışa uyğun kitab tapılmadı</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.94rem' }}>
                        Daxil etdiyiniz söz və ya janr üzrə nəticə mövcud deyil. Filtrləri sıfırlayaraq yenidən yoxlayın.
                    </p>
                    <button
                        onClick={() => { setSearchTitle(""); setSelectedGenre("all"); }}
                        className="btn-primary-custom"
                    >
                        Bütün Kitabları Göstər
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                    gap: '26px'
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
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    borderRadius: '20px'
                                }}
                                onClick={() => setSelectedBook(book)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Book Cover Area with 3D Depth */}
                                <div style={{
                                    height: '250px',
                                    backgroundColor: 'var(--bg-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    padding: '18px',
                                    borderBottom: '1px solid var(--border-color)'
                                }}>
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '85%',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            boxShadow: '0 12px 24px -4px rgba(0,0,0,0.22)',
                                            transition: 'transform 0.35s ease'
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
                                        backdropFilter: 'blur(6px)',
                                        color: 'var(--primary)',
                                        fontWeight: 800,
                                        fontSize: '0.72rem',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-pill)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                    }}>
                                        {book.genre || 'Ümumi'}
                                    </span>

                                    {/* Wishlist Button on Top Right */}
                                    <button
                                        onClick={(e) => handleToggleWishlist(id, e)}
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '34px',
                                            height: '34px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                            color: wishlistIds.has(id) ? '#EF4444' : '#94A3B8',
                                            transition: 'all 0.2s'
                                        }}
                                        title={wishlistIds.has(id) ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"}
                                    >
                                        <FaHeart size={15} />
                                    </button>
                                </div>

                                {/* Content Details */}
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                    <div>
                                        <h5 style={{
                                            fontSize: '1.08rem',
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
                                            fontSize: '0.86rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '14px'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaUserEdit /> {book.author}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700, fontSize: '0.82rem' }}>
                                                <FaStar size={12} /> {book.ratingAverage || 5.0}
                                            </span>
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
                                                    <FaCheckCircle /> {copiesLeft} nüsxə mövcuddur
                                                </span>
                                            ) : (
                                                <span className="badge-status badge-overdue">
                                                    <FaTimesCircle /> Tükənib
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className="btn-primary-custom"
                                            style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '12px' }}
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
                    backgroundColor: "rgba(15, 23, 42, 0.7)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
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
                            maxWidth: "720px",
                            width: "100%",
                            padding: "36px",
                            position: "relative",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "24px"
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
                                background: "var(--bg-main)",
                                border: "1px solid var(--border-color)",
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
                        >
                            <FaTimes />
                        </button>

                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                            {/* Book Image */}
                            <div style={{ flex: '0 0 220px', margin: '0 auto' }}>
                                <img
                                    src={selectedBook.imageUrl}
                                    alt={selectedBook.title}
                                    style={{
                                        width: '100%',
                                        borderRadius: '14px',
                                        boxShadow: '0 16px 36px -6px rgba(0,0,0,0.3)',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop";
                                    }}
                                />
                            </div>

                            {/* Info */}
                            <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column' }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 'fit-content',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-pill)',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase'
                                }}>
                                    {selectedBook.genre}
                                </span>

                                <h3 style={{ fontSize: '1.7rem', color: 'var(--text-title)', fontWeight: 800, marginBottom: '8px' }}>
                                    {selectedBook.title}
                                </h3>

                                <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                                    <FaUserEdit /> Müəllif: <strong style={{ color: 'var(--text-title)' }}>{selectedBook.author}</strong>
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '12px',
                                    padding: '14px 16px',
                                    backgroundColor: 'var(--bg-main)',
                                    borderRadius: '14px',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>Mövcud Nüsxə:</span>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-title)' }}>
                                            {selectedBook.availableCopies ?? selectedBook.AvailableCopies ?? 0} ədəd
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block' }}>Ümumi Fond:</span>
                                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-title)' }}>
                                            {selectedBook.totalCopies ?? selectedBook.TotalCopies ?? 0} ədəd
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h6 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-title)', marginBottom: '6px' }}>
                                        Kitab Haqqında Qısa Məlumat:
                                    </h6>
                                    <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6, maxHeight: '140px', overflowY: 'auto' }}>
                                        {selectedBook.description || "Təsvir qeyd edilməyib."}
                                    </p>
                                </div>

                                {/* Review & PDF Buttons */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setReviewBook(selectedBook)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-title)',
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaComments color="#3B82F6" /> Rəylər ({selectedBook.ratingCount || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPdfBook(selectedBook)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-main)',
                                            color: 'var(--text-title)',
                                            fontSize: '0.88rem',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaFilePdf color="#EF4444" /> Elektron PDF Oxu
                                    </button>
                                </div>

                                {/* Modal Actions */}
                                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                                    {isBookBorrowed(getBookId(selectedBook)) ? (
                                        <button
                                            disabled
                                            className="btn-secondary-custom"
                                            style={{ flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#D97706', borderColor: 'rgba(245, 158, 11, 0.3)', cursor: 'not-allowed' }}
                                        >
                                            <FaClock /> Bu kitab artıq icarənizdədir
                                        </button>
                                    ) : isBookReserved(getBookId(selectedBook)) ? (
                                        <button
                                            disabled
                                            className="btn-secondary-custom"
                                            style={{ flex: 1, backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', borderColor: 'rgba(139, 92, 246, 0.3)', cursor: 'not-allowed' }}
                                        >
                                            <FaBookmark /> Rezervasiyanız aktivdir
                                        </button>
                                    ) : (selectedBook.availableCopies ?? selectedBook.AvailableCopies ?? 0) <= 0 ? (
                                        <button
                                            onClick={() => handleReserveBook(getBookId(selectedBook))}
                                            disabled={reservingId === getBookId(selectedBook)}
                                            className="btn-primary-custom"
                                            style={{ flex: 1, backgroundColor: '#8B5CF6', borderColor: '#7C3AED' }}
                                        >
                                            <FaBookmark />
                                            {reservingId === getBookId(selectedBook) ? 'Rezerv edilir...' : 'Kitabı Rezerv Et'}
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
                                        style={{ padding: '12px 20px', borderRadius: '12px' }}
                                    >
                                        Bağla
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Book Reviews Modal */}
            {reviewBook && (
                <BookReviewsModal
                    book={reviewBook}
                    onClose={() => setReviewBook(null)}
                    onReviewAdded={fetchBooks}
                />
            )}

            {/* PDF E-Book Reader Modal */}
            {pdfBook && (
                <PdfModal
                    book={pdfBook}
                    onClose={() => setPdfBook(null)}
                />
            )}
        </div>
    );
};

export default Home;
