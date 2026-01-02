import React, { useEffect, useRef, useState } from 'react';
import { Book } from './types';

/**
 * API Base URL
 * Backend server endpoint for book operations
 * Uses relative path in production (same origin), absolute URL in development
 * In production, the backend serves the frontend, so we use relative paths
 */
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:4000/api/books'
  : '/api/books';

/**
 * Main Application Component
 * Manages book list state and handles all user interactions
 */
const App: React.FC = () => {
  // State Management
  const [books, setBooks] = useState<Book[]>([]); // List of all books
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState<string>(''); // Error message display
  const [title, setTitle] = useState(''); // Form input: book title
  const [author, setAuthor] = useState(''); // Form input: author name
  const [highlightedId, setHighlightedId] = useState<number | null>(null); // ID of book to highlight (Surprise Me feature)
  const [toast, setToast] = useState<string>(''); // Toast notification message
  
  // Refs for scrolling to specific book cards
  const bookRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /**
   * Initial Data Fetch
   * Loads all books from API on component mount
   */
  useEffect(() => {
    fetchBooks();
  }, []);

  /**
   * Fetches all books from the backend API
   * Updates books state and handles loading/error states
   */
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('無法取得書籍清單');
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (err: any) {
      setError(err?.message || '發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission to add a new book
   * Validates input, sends POST request, and updates local state
   * 
   * @param event - Form submit event
   */
  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    // Client-side validation
    if (!trimmedTitle || !trimmedAuthor) {
      setError('請輸入書名與作者');
      return;
    }

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, author: trimmedAuthor })
      });
      if (!res.ok) throw new Error('新增失敗，請稍後重試');
      const newBook: Book = await res.json();
      // Add new book to the beginning of the list
      setBooks((prev) => [newBook, ...prev]);
      // Clear form inputs
      setTitle('');
      setAuthor('');
    } catch (err: any) {
      setError(err?.message || '新增失敗，請稍後再試');
    }
  };

  /**
   * Toggles book status between READ and UNREAD
   * Sends PATCH request and updates local state with response
   * 
   * @param id - Book ID to toggle
   */
  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error('更新狀態失敗');
      const updated: Book = await res.json();
      // Update the specific book in the list
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err: any) {
      setError(err?.message || '更新失敗，請稍後再試');
    }
  };

  /**
   * Deletes a book from the list
   * Sends DELETE request and removes book from local state
   * 
   * @param id - Book ID to delete
   */
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      // 204 No Content is a valid success response
      if (!res.ok && res.status !== 204) throw new Error('刪除失敗');
      // Remove book from local state
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err?.message || '刪除失敗，請稍後再試');
    }
  };

  /**
   * Updates book rating (1-5 stars)
   * Sends PATCH request with new rating and updates local state
   * 
   * @param id - Book ID to rate
   * @param rating - New rating value (1-5)
   */
  const handleRate = async (id: number, rating: number) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (!res.ok) throw new Error('評分更新失敗');
      const updated: Book = await res.json();
      // Update the specific book's rating in the list
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err: any) {
      setError(err?.message || '評分更新失敗，請稍後再試');
    }
  };

  /**
   * Surprise Me Feature
   * Randomly selects an unread book, highlights it, and shows toast notification
   * Scrolls to the selected book with animation
   */
  const handleSurprise = () => {
    // Filter only unread books
    const unread = books.filter((b) => b.status === 'UNREAD');
    if (unread.length === 0) {
      // Show message if no unread books available
      setToast('沒有未讀的書籍了！');
      setTimeout(() => setToast(''), 2200);
      return;
    }
    // Randomly pick one unread book
    const pick = unread[Math.floor(Math.random() * unread.length)];
    // Set highlighted ID to trigger scroll and animation
    setHighlightedId(pick.id);
    // Show toast notification
    setToast(`Today's perfect read: ${pick.title}`);
    setTimeout(() => setToast(''), 2400);
  };

  /**
   * Scroll Effect for Surprise Me Feature
   * When a book is highlighted, smoothly scrolls to it and removes highlight after 2 seconds
   */
  useEffect(() => {
    if (highlightedId && bookRefs.current[highlightedId]) {
      // Smooth scroll to center the highlighted book card
      bookRefs.current[highlightedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setHighlightedId(null), 2000);
      return () => clearTimeout(timer);
    }
    return;
  }, [highlightedId]);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white/90 shadow-sm shadow-stone-200">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-stone-900">Cozy Book Cafe</h1>
          <p className="text-sm text-stone-600">一本書、一杯咖啡，慢慢讀。</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-900">Your Reading List</h2>
          <button className="btn btn-warm" type="button" onClick={handleSurprise}>
            Surprise Me
          </button>
        </div>

        <section className="mb-8">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-900">新增書籍</h2>
            <form className="grid gap-4 sm:grid-cols-3 sm:items-end" onSubmit={handleAdd}>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-stone-800">書名</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/60"
                  placeholder="例如：The Pragmatic Programmer"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-sm font-medium text-stone-800">作者</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600/60"
                  placeholder="例如：Andrew Hunt"
                />
              </div>
              <div className="sm:col-span-1">
                <button type="submit" className="btn btn-primary w-full">
                  新增
                </button>
              </div>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">書籍列表</h2>
            {loading && <span className="text-sm text-stone-600">載入中...</span>}
          </div>

          <div className="mt-4 space-y-3">
            {books.map((book) => (
              <div
                key={book.id}
                ref={(el) => (bookRefs.current[book.id] = el)}
                className={`flex flex-col gap-3 card p-4 sm:flex-row sm:items-center sm:justify-between ${
                  highlightedId === book.id ? 'highlight-card' : ''
                }`}
              >
                <div>
                  <p className="text-base font-semibold text-stone-900">{book.title}</p>
                  <p className="text-sm text-stone-600">作者：{book.author}</p>
                  <span
                    className={`mt-2 chip ${
                      book.status === 'READ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {book.status === 'READ' ? '已讀' : '未讀'}
                  </span>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`評分 ${star} 星`}
                        onClick={() => handleRate(book.id, star)}
                        className="text-xl"
                      >
                        <span
                          className={`${
                            book.rating >= star ? 'text-yellow-400' : 'text-stone-300'
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-stone-500">({book.rating || 0}/5)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleToggle(book.id)}
                    type="button"
                  >
                    切換狀態
                  </button>
                  <button className="btn btn-warm" onClick={() => handleDelete(book.id)} type="button">
                    刪除
                  </button>
                </div>
              </div>
            ))}

            {!loading && books.length === 0 && (
              <p className="text-sm text-stone-600">目前尚無書籍，先新增一本吧！</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;

