import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Database, Globe, Book, FileText, Check, AlertCircle, Eye, X, RefreshCw, Download } from 'lucide-react';

interface Translation {
    instruction: string;
    response: string;
}

interface QAPair {
    id: string;
    instruction: string;
    response: string;
    translation_en?: Translation;
    source: string;
}

interface BookEntry {
    _id: string;
    filename: string;
    status: 'processing' | 'completed' | 'failed';
    uploaded_at: string;
    kept_lines?: number;
    error?: string;
    content?: string;
}

const DataViewPage = () => {
    const [viewType, setViewType] = useState<'qa' | 'books'>('qa');

    // QA Data State
    const [data, setData] = useState<QAPair[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Books Data State
    const [books, setBooks] = useState<BookEntry[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(false);

    // Modal State
    const [selectedBook, setSelectedBook] = useState<BookEntry | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://saraswati-b52q.onrender.com/api/data`);
                setData(response.data);
            } catch (err) {
                setError('Failed to load data. Please make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
            const response = await axios.get(`https://saraswati-b52q.onrender.com/api/books`);
            setBooks(response.data);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    useEffect(() => {
        if (viewType === 'books') {
            fetchBooks();
            const interval = setInterval(fetchBooks, 5000);
            return () => clearInterval(interval);
        }
    }, [viewType]);

    const handleViewContent = async (book: BookEntry) => {
        setIsModalOpen(true);
        setIsLoadingContent(true);
        setSelectedBook(book);

        try {
            const response = await axios.get(`https://saraswati-b52q.onrender.com/api/books/${book._id}`);
            setSelectedBook(response.data);
        } catch (error) {
            console.error("Error fetching book content:", error);
        } finally {
            setIsLoadingContent(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    const [qaSearch, setQaSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');

    const filteredQA = data.filter(item =>
        item.instruction.toLowerCase().includes(qaSearch.toLowerCase()) ||
        item.response.toLowerCase().includes(qaSearch.toLowerCase())
    );

    const filteredBooks = books.filter(book =>
        book.filename.toLowerCase().includes(bookSearch.toLowerCase())
    );

    const handleDownloadQA = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tulu_qa_dataset.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadBook = async (book: BookEntry) => {
        try {
            let content = book.content;
            if (!content) {
                const response = await axios.get(`https://saraswati-b52q.onrender.com/api/books/${book._id}`);
                content = response.data.content;
            }

            if (!content) {
                alert('No content available for this book.');
                return;
            }

            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${book.filename.replace('.pdf', '')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading book:", error);
            alert('Failed to download book content.');
        }
    };

    const handleDownloadAllBooks = () => {
        const url = `https://saraswati-b52q.onrender.com/api/books/download/all`;
        window.open(url, '_blank');
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-cream-100">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Public Dataset</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Explore the community-contributed Tulu data.
                        </p>
                    </div>

                    {/* Main Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                            <button
                                onClick={() => setViewType('qa')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'qa'
                                    ? 'bg-light-red-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                QA Pairs
                            </button>
                            <button
                                onClick={() => setViewType('books')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'books'
                                    ? 'bg-light-red-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Books
                            </button>
                        </div>
                    </div>

                    {viewType === 'qa' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <input
                                    type="text"
                                    placeholder="Search QA pairs..."
                                    value={qaSearch}
                                    onChange={(e) => setQaSearch(e.target.value)}
                                    className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleDownloadQA}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                                >
                                    <Download className="w-4 h-4" />
                                    Download JSON
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="w-12 h-12 text-light-red-500 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center">
                                    <p>{error}</p>
                                </div>
                            ) : filteredQA.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-gray-800 mb-2">No Data Found</h3>
                                    <p className="text-gray-500">Try adjusting your search query.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredQA.map((item) => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Tulu Content */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-light-red-500 bg-light-red-50 px-2 py-1 rounded">
                                                            Instruction (Tulu)
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 font-medium text-lg">{item.instruction}</p>

                                                    <div className="pt-4 border-t border-gray-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                                                                Response (Tulu)
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700">{item.response}</p>
                                                    </div>
                                                </div>

                                                {/* English Translation (if available) */}
                                                {item.translation_en && (
                                                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Globe className="w-4 h-4 text-blue-500" />
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                                English Translation
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Instruction</p>
                                                            <p className="text-gray-800 italic">{item.translation_en.instruction}</p>
                                                        </div>

                                                        <div className="pt-2">
                                                            <p className="text-xs text-gray-500 mb-1">Response</p>
                                                            <p className="text-gray-700 italic">{item.translation_en.response}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-400 text-right">
                                                Source: {item.source}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 whitespace-nowrap">
                                        <FileText className="w-5 h-5 text-light-red-500" />
                                        Processed Books
                                    </h2>
                                    <button onClick={fetchBooks} className="text-gray-500 hover:text-light-red-500 transition-colors">
                                        <RefreshCw className={`w-5 h-5 ${loadingBooks ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleDownloadAllBooks}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm ml-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download All Text
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search books..."
                                    value={bookSearch}
                                    onChange={(e) => setBookSearch(e.target.value)}
                                    className="w-full md:max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent"
                                />
                            </div>

                            <div className="divide-y divide-gray-100 h-[600px] overflow-y-auto custom-scrollbar">
                                {filteredBooks.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No books found.
                                    </div>
                                ) : (
                                    filteredBooks.map((book) => (
                                        <div key={book._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 mb-1">{book.filename}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        Uploaded: {new Date(book.uploaded_at).toLocaleString()}
                                                    </p>
                                                    {book.status === 'completed' && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                            <Check className="w-3 h-3" />
                                                            {book.kept_lines} lines extracted
                                                        </span>
                                                    )}
                                                    {book.status === 'failed' && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Failed: {book.error}
                                                        </span>
                                                    )}
                                                    {book.status === 'processing' && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Processing...
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {book.status === 'completed' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleViewContent(book)}
                                                                className="flex items-center gap-2 text-gray-600 hover:text-light-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-light-red-50 text-sm"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadBook(book)}
                                                                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 text-sm"
                                                                title="Download Text"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                TXT
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content Modal */}
                    {isModalOpen && selectedBook && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{selectedBook.filename}</h3>
                                        <p className="text-sm text-gray-500">
                                            Processed on {new Date(selectedBook.uploaded_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                    {isLoadingContent ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            Loading content...
                                        </div>
                                    ) : selectedBook.content ? (
                                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                                            {selectedBook.content}
                                        </pre>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                            No content available.
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataViewPage;
