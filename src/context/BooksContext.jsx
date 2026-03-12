import { createContext, useContext, useState } from 'react'
import { BOOKS } from '@/data/bookData'

const BooksContext = createContext()

export function BooksProvider({ children }) {
  const [books, setBooks] = useState(BOOKS)

  function addBook(data) {
    const newBook = {
      ...data,
      id: Date.now(),
      color: 'slate',
      genreColor: '#5C7098',
      language: 'EN',
      year: new Date().getFullYear(),
      pages: 0,
      publisher: '',
      isbn: '',
      rating: 0,
      description: '',
      cover: '',
    }
    setBooks(prev => [...prev, newBook])
  }

  return (
    <BooksContext.Provider value={{ books, addBook }}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  return useContext(BooksContext)
}