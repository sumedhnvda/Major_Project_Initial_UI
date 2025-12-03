import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Book } from 'lucide-react';
import axios from 'axios';

const ContributePage = () => {
    const [contributionType, setContributionType] = useState<'qa' | 'books'>('qa');
    const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');
    // Manual Entry States
    const [instruction, setInstruction] = useState('');
    const [response, setResponse] = useState('');
    const [transInstruction, setTransInstruction] = useState('');
    const [transResponse, setTransResponse] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Bulk Upload States
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);

    // Book Upload States
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [isBookUploading, setIsBookUploading] = useState(false);
    const [existingBooks, setExistingBooks] = useState<any[]>([]);
    const [bookSearch, setBookSearch] = useState('');
    const [skipOcr, setSkipOcr] = useState(false);

    React.useEffect(() => {
        fetchBooks();

        // Poll for updates every 5 seconds if on books tab
        let interval: NodeJS.Timeout;
        if (contributionType === 'books') {
            interval = setInterval(fetchBooks, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [contributionType]);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('https://major-project-initial-ui.onrender.com/api/books');
            setExistingBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const filteredBooks = existingBooks.filter(book =>
        book.filename.toLowerCase().includes(bookSearch.toLowerCase())
    );

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim() || !response.trim()) return;

        setIsSubmitting(true);
        setStatus(null);

        const payload: any = {
            instruction,
            response,
            source: 'manual'
        };

        if (transInstruction.trim() || transResponse.trim()) {
            payload.translation_en = {
                instruction: transInstruction,
                response: transResponse
            };
        }

        try {
            await axios.post(`https://major-project-initial-ui.onrender.com/api/submit`, payload);
            setStatus({ type: 'success', message: 'Successfully submitted entry!' });
            setInstruction('');
            setResponse('');
            setTransInstruction('');
            setTransResponse('');
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to submit. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setStatus(null);
            setPreviewData([]);

            if (file.name.endsWith('.json')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target?.result as string);
                        const data = Array.isArray(json) ? json : [json];
                        setPreviewData(data.slice(0, 5));
                    } catch (err) {
                        setStatus({ type: 'error', message: 'Error parsing JSON file' });
                    }
                };
                reader.readAsText(file);
            } else {
                setStatus({ type: 'error', message: 'Unsupported file format. Please upload .json' });
                setUploadFile(null);
            }
        }
    };

    const handleBulkSubmit = async () => {
        if (!uploadFile) return;

        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            const response = await axios.post(`https://major-project-initial-ui.onrender.com/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus({ type: 'success', message: response.data.message });
            setUploadFile(null);
            setPreviewData([]);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to upload file. Please check the format.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setStatus({ type: 'error', message: 'Please upload a PDF file.' });
                return;
            }

            // Check for duplicates
            const isDuplicate = existingBooks.some(book => book.filename === file.name);
            if (isDuplicate) {
                setStatus({ type: 'error', message: 'This book has already been uploaded.' });
                setBookFile(null);
                e.target.value = ''; // Reset input
                return;
            }

            setBookFile(file);
            setStatus(null);
        }
    };

    const handleBookUpload = async () => {
        if (!bookFile) return;

        setIsBookUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', bookFile);

        try {
            await axios.post(`https://major-project-initial-ui.onrender.com/api/books/upload?skip_ocr=${skipOcr}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setStatus({ type: 'success', message: 'Book uploaded successfully! Processing started.' });
            setBookFile(null);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to upload book.' });
        } finally {
            setIsBookUploading(false);
            fetchBooks(); // Refresh list
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-cream-100">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contribute Data</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Help improve the Tulu SLM by contributing data.
                            Choose between QA pairs (Manual/Bulk) or uploading Tulu Books.
                        </p>
                    </div>

                    {/* Main Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                            <button
                                onClick={() => { setContributionType('qa'); setStatus(null); }}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${contributionType === 'qa'
                                    ? 'bg-light-red-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                QA Pairs
                            </button>
                            <button
                                onClick={() => { setContributionType('books'); setStatus(null); }}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${contributionType === 'books'
                                    ? 'bg-light-red-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Books (PDF)
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {contributionType === 'qa' ? (
                            <>
                                <div className="flex border-b border-gray-100">
                                    <button
                                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'manual'
                                            ? 'bg-light-red-50 text-light-red-600 border-b-2 border-light-red-500'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        onClick={() => { setActiveTab('manual'); setStatus(null); }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Manual Entry
                                        </div>
                                    </button>
                                    <button
                                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'bulk'
                                            ? 'bg-light-red-50 text-light-red-600 border-b-2 border-light-red-500'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        onClick={() => { setActiveTab('bulk'); setStatus(null); }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            Bulk Upload (JSON)
                                        </div>
                                    </button>
                                </div>

                                <div className="p-8">
                                    {status && (
                                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            {status.message}
                                        </div>
                                    )}

                                    {activeTab === 'manual' ? (
                                        <form onSubmit={handleManualSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Tulu Content (Required)</h3>
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">Instruction (Tulu)</label>
                                                        <textarea
                                                            value={instruction}
                                                            onChange={(e) => setInstruction(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent transition-all h-32 resize-none"
                                                            placeholder="ತುಳುನಾಡ್‌ದ ಪ್ರಸಿದ್ಧ ದೇವಸ್ಥಾನೊಲು ಯಾವುಲು?"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">Response (Tulu)</label>
                                                        <textarea
                                                            value={response}
                                                            onChange={(e) => setResponse(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent transition-all h-32 resize-none"
                                                            placeholder="ತುಳುನಾಡ್‌ದ ಕೆಲವು ಪ್ರಸಿದ್ಧ ದೇವಸ್ಥಾನೊಲು..."
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="font-semibold text-gray-800 border-b pb-2">English Translation (Optional)</h3>
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">Instruction (English)</label>
                                                        <textarea
                                                            value={transInstruction}
                                                            onChange={(e) => setTransInstruction(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent transition-all h-32 resize-none"
                                                            placeholder="What are the famous temples of Tulu Nadu?"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 font-medium mb-2">Response (English)</label>
                                                        <textarea
                                                            value={transResponse}
                                                            onChange={(e) => setTransResponse(e.target.value)}
                                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent transition-all h-32 resize-none"
                                                            placeholder="Some famous temples of Tulu Nadu are..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="bg-light-red-500 hover:bg-light-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg shadow-light-red-500/30 flex items-center gap-2 disabled:opacity-70"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                    Submit Entry
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                    <FileText className="w-5 h-5" />
                                                    Required JSON Structure
                                                </h3>
                                                <p className="text-sm text-blue-600 mb-4">
                                                    Please ensure your JSON file follows this exact structure. You can upload multiple pairs in a single file.
                                                </p>
                                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                    <pre className="text-xs text-green-400 font-mono">
                                                        {`[
  {
    "instruction": "ತುಳುನಾಡದ ಪ್ರಸಿದ್ಧವಾದ ಮಣ್ಣಿದ ಪ್ರಕಾರದ ಬಗ್ಗೆ ಪನ್ಲೆ.",
    "response": "ತುಳುನಾಡದ ಮಣ್ಣು ಪ್ರಮುಖವಾದ್ದು ಪಂಡ ಕೆಂಪು ಮಣ್ಣು. ಈ ಮಣ್ಣು ಬೇಸಾಯೊಗು ಬಾರಿ ಎಡ್ಡೆ ಆಯಿನವು. ಅಂಚಾದ್ ಈ ಪ್ರದೇಶೊಡು ಬತ್ತೊದ ಕೃಷಿ ಜಾಸ್ತಿ.",
    "translation_en": {
      "instruction": "Tell me about the famous soil type of Tulu Nadu.",
      "response": "The most important soil of Tulu Nadu is red soil. This soil is very good for farming. Hence, rice cultivation is more common in this region."
    }
  },
  {
    "instruction": "ತುಳುನಾಡದ ಅತ್ಯಂತ ಎತ್ತರೊದ ಜಲಪಾತದ ಪುದರ್ ಎಂಚಿನ?",
    "response": "ತುಳುನಾಡದ ಅತ್ಯಂತ ಎತ್ತರೊದ ಜಲಪಾತ ಗರ್ಜನಾ ಜಲಪಾತ. ಉಂದು ಬಾರೀ ಪೊರ್ಲುದ ಜಾಗೆ ಬೊಕ್ಕ ಬೇಸಾಯೊಗು ಬಾರೀ ಎಡ್ಡೆ.",
    "translation_en": {
      "instruction": "What is the name of the highest waterfall in Tulu Nadu?",
      "response": "The highest waterfall in Tulu Nadu is Gajjana Waterfall. It is a very beautiful place and is very good for farming."
    }
  }
]`}
                                                    </pre>
                                                </div>
                                            </div>

                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-light-red-500 transition-colors bg-gray-50">
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                                    <span className="text-lg font-medium text-gray-700 mb-2">Drop your JSON file here or click to browse</span>
                                                    <span className="text-sm text-gray-500">Supported format: .json</span>
                                                </label>
                                            </div>

                                            {uploadFile && (
                                                <div className="bg-cream-50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="font-medium text-gray-700">Selected File: {uploadFile.name}</span>
                                                        <button
                                                            onClick={() => { setUploadFile(null); setPreviewData([]); }}
                                                            className="text-red-500 text-sm hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    {previewData.length > 0 && (
                                                        <div className="overflow-x-auto">
                                                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                                                                {JSON.stringify(previewData, null, 2)}
                                                            </pre>
                                                            <p className="text-xs text-gray-500 mt-2 text-center">Showing first 5 items preview</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleBulkSubmit}
                                                    disabled={!uploadFile || isSubmitting}
                                                    className="bg-light-red-500 hover:bg-light-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg shadow-light-red-500/30 flex items-center gap-2 disabled:opacity-70"
                                                >
                                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                    Upload File
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-4 md:p-8">
                                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <Book className="w-5 h-5 md:w-6 md:h-6 text-light-red-500" />
                                    Upload Tulu Book (PDF)
                                </h2>

                                {status && (
                                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        {status.message}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                    <div>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 md:p-8 text-center hover:border-light-red-500 transition-colors bg-gray-50 mb-6">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleBookFileChange}
                                                className="hidden"
                                                id="book-upload"
                                            />
                                            <label htmlFor="book-upload" className="cursor-pointer flex flex-col items-center">
                                                <Book className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-4" />
                                                <span className="text-base md:text-lg font-medium text-gray-700 mb-2">
                                                    {bookFile ? bookFile.name : "Drop PDF book here or click to browse"}
                                                </span>
                                                <span className="text-sm text-gray-500">Supported format: .pdf</span>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <input
                                                type="checkbox"
                                                id="skipOcr"
                                                checked={skipOcr}
                                                onChange={(e) => setSkipOcr(e.target.checked)}
                                                className="w-5 h-5 text-light-red-500 rounded focus:ring-light-red-500 border-gray-300"
                                            />
                                            <label htmlFor="skipOcr" className="text-sm text-gray-700 cursor-pointer select-none">
                                                <span className="font-medium">Skip Processing (Archival Mode)</span>
                                                <p className="text-xs text-gray-500">Save PDF directly without extracting text. Useful for large books.</p>
                                            </label>
                                        </div>

                                        {bookFile && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleBookUpload}
                                                    disabled={isBookUploading}
                                                    className="w-full md:w-auto bg-light-red-500 hover:bg-light-red-600 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg shadow-light-red-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                                                >
                                                    {isBookUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                                    Start Processing
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 h-[350px] md:h-[500px] flex flex-col">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 justify-between">
                                            <div className="flex items-center gap-2">
                                                <Book className="w-4 h-4" />
                                                Existing Books
                                            </div>
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {existingBooks.length} Books
                                            </span>
                                        </h3>
                                        <div className="relative mb-4">
                                            <input
                                                type="text"
                                                placeholder="Search books..."
                                                value={bookSearch}
                                                onChange={(e) => setBookSearch(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-light-red-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {filteredBooks.map((book) => (
                                                <div key={book._id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                                                    <div className="p-2 bg-cream-100 rounded-lg">
                                                        <FileText className="w-4 h-4 text-light-red-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-700 truncate" title={book.filename}>
                                                            {book.filename}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(book.uploaded_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {book.status === 'completed' ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : book.status === 'archived' ? (
                                                        <div className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">ARCHIVED</div>
                                                    ) : (
                                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                    )}
                                                </div>
                                            ))}
                                            {filteredBooks.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    No books
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributePage;
