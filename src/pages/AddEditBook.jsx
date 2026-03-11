import React from 'react';
import BookForm from '../components/BookForm';

const AddEditBook = () => {
  const handleSubmit = (data) => {
    console.log('Book data submitted:', data);
    
  };

  return (
    <div>
      <h1>Add/Edit Book</h1>
      <BookForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddEditBook;