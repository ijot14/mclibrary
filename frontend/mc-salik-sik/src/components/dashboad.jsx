import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import '../styles/Dashboard.css';
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
            // Display loading alert
            Swal.fire({
                title: 'Loading Thesis...',
                text: 'Please wait while we fetch the data.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch('https://backend-j2o4.onrender.com/api/research');
                if (!response.ok) {
                    throw new Error('Failed to fetch thesis');
                }
                const data = await response.json();
                setBooks(data);

                // Extract unique years from data and sort them
                const uniqueYears = [...new Set(data.map(book => book.year.trim()))]
                    .filter(year => year)
                    .sort((a, b) => b - a);
                setYears(uniqueYears);
            } catch (err) {
                setError('Failed to fetch thesis. Please try again later.');
            } finally {
                setLoading(false);
                Swal.close(); // Close the loading alert
            }
        };

        fetchBooks();

        const savedSearch = localStorage.getItem('thesisSearch');
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
        localStorage.setItem('thesisSearch', value);
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
            console.log("Opening URL:", url); // Check if URL is correct
            window.open(url, '_blank');
        } else {
            Swal.fire('No PDF Available', 'This thesis does not have an available PDF link.', 'info');
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
        <div className="dashboard">
            <Navbar />
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
                            aria-label="Search for a thesis, author, or type"
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
                    <p className="text-center" aria-live="polite">Loading thesis...</p>
                ) : error ? (
                    <p className="text-center text-danger" aria-live="polite">{error}</p>
                ) : (
                    <div className="row">
                        {Object.keys(groupedBooks).length === 0 ? (
                            <p className="text-center">No thesis found.</p>
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
