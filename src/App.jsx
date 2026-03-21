<<<<<<< HEAD
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header, Footer } from '@components/layout';
import { Home } from '@pages';
import BookDetail from '@/pages/BookDetail/BookDetail';
import ListView from '@/pages/ListView/ListView';
import Catalog from '@/pages/Catalog/Catalog';
import AddEditBook from '@/pages/AddEditBook/AddEditBook';
import { BOOKS } from '@/data/bookData';
=======
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { Header, Footer } from '@components/layout'
import { Home, Login, Register, Dashboard } from '@pages'

import BookDetail from '@/pages/BookDetail/BookDetail'
import ListView from '@/pages/ListView/ListView'
import Catalog from '@/pages/Catalog/Catalog'
import AddEditBook from '@/pages/AddEditBook/AddEditBook'
import Visit from '@/pages/Visit/Visit'
>>>>>>> ee38e1ca65385ebda9d937d38f76eb7608edc538

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);

  return null;
}

function App() {
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books');
    return savedBooks ? JSON.parse(savedBooks) : BOOKS;
  });

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  const addBook = (newBook) => {
    setBooks((prevBooks) => {
      const nextId =
        prevBooks.length > 0
          ? Math.max(...prevBooks.map((book) => Number(book.id) || 0)) + 1
          : 1;

      return [...prevBooks, { ...newBook, id: nextId }];
    });
  };

  const updateBook = (updatedBook) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        String(book.id) === String(updatedBook.id) ? updatedBook : book
      )
    );
  };

  return (
    <div className="app">
      <ScrollToTop />
      <Header />

      <main className="main-content">
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catalog / Books */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="/books" element={<ListView />} />
<<<<<<< HEAD
          <Route path="/books/:id" element={<BookDetail books={books} />} />
          <Route
            path="/books/add"
            element={
              <AddEditBook
                books={books}
                onAddBook={addBook}
                onUpdateBook={updateBook}
              />
            }
          />
          <Route
            path="/books/edit/:id"
            element={
              <AddEditBook
                books={books}
                onAddBook={addBook}
                onUpdateBook={updateBook}
              />
            }
          />
=======
          <Route path="/books/add" element={<AddEditBook />} />
          <Route path="/books/:id" element={<BookDetail />} />

         {/*Add/Edit book*/} 
          <Route path="/books/:id/edit" element={<AddEditBook />} />

>>>>>>> ee38e1ca65385ebda9d937d38f76eb7608edc538
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;