import React, { useState, useEffect } from 'react';
import Navbar from './Navbar'; // Import the Navbar component
import '../styles/Dashboard.css'; // Import the CSS file for styling
import '../styles/App.css';

export default function Dashboard() {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [years, setYears] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/research');
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data = await response.json();
                setBooks(data);

                const uniqueYears = [...new Set(data.map(book => book.year.trim()))]
                    .filter(year => year)
                    .sort((a, b) => b - a);
                setYears(uniqueYears);
            } catch (err) {
                setError('Failed to fetch books. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();

        const savedSearch = localStorage.getItem('bookSearch');
        if (savedSearch) setSearch(savedSearch);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        localStorage.setItem('bookSearch', value);
    };

    const handleYearChange = (e) => {
        const value = e.target.value;
        setSelectedYear(value);
        localStorage.setItem('selectedYear', value);
    };

    const filterBooks = () => {
        return books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                  book.keyword.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesYear = selectedYear ? book.year === selectedYear : true;
            return matchesSearch && matchesYear;
        });
    };

    const filteredBooks = filterBooks();

    const handleClick = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const groupBooksByYear = () => {
        return filteredBooks.reduce((acc, book) => {
            const year = book.year;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(book);
            return acc;
        }, {});
    };

    const groupedBooks = groupBooksByYear();

    return (
        <div className="dashboard"> {/* Ensure the dashboard class is applied here */}
            <Navbar /> {/* Navbar is included at the top */}
            <div className="container mt-5">
                <h2 className="text-center mb-4">Thesis Abstract</h2>
                <div className="row mb-4">
                    <div className="col-md-6">
                        <input
                            type="text"
                            placeholder="Search for a Thesis, author, or Major..."
                            value={search}
                            onChange={handleSearchChange}
                            className="form-control"
                            aria-label="Search for a book, author, or type"
                        />
                    </div>
                    <div className="col-md-6">
                        <select 
                            value={selectedYear} 
                            onChange={handleYearChange} 
                            className="form-control"
                            aria-label="Filter by year"
                        >
                            <option value="">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? (
                    <p className="text-center" aria-live="polite">Loading books...</p>
                ) : error ? (
                    <p className="text-center text-danger" aria-live="polite">{error}</p>
                ) : (
                    <div className="row">
                        {Object.keys(groupedBooks).length === 0 ? (
                            <p className="text-center">No books found.</p>
                        ) : (
                            Object.keys(groupedBooks).sort((a, b) => b - a).map(year => (
                                <div key={year} className="mb-4">
                                    <h4 className="text-center">{year}</h4>
                                    <div className="row">
                                        {groupedBooks[year].map(book => (
                                            <div className="col-md-4 mb-3" key={book.id}>
                                                <div 
                                                    className="card h-100"
                                                    onClick={() => handleClick(book.abstract_url)}
                                                    style={{ cursor: book.abstract_url ? 'pointer' : 'default' }}
                                                >
                                                    <div className="card-body">
                                                        <h5 className="card-title">{book.title}</h5>
                                                        <p className="card-text"><strong>Year:</strong> {book.year}</p>
                                                        <p className="card-text"><strong>Keywords:</strong> {book.keyword}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}