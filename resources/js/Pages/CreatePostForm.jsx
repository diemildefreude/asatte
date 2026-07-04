import React, { useState } from 'react';
import './CreatePostForm.css';

function CreatePostForm() {

  const [title, setTitle] = useState('');
  function handleSubmit(e)
  {
    e.preventDefault();
    const data = JSON.stringify({ title: title });
    fetch('http://localhost/website/netart/public/api/posts', {
      method: 'POST', // Or 'POST', 'PUT', 'DELETE', etc., depending on your controller action
      //mode: 'cors',
      headers: {
        'Content-Type': 'application/json', // If you're sending JSON data
        // You might need other headers like 'Authorization' for authentication
      },
      body: data 
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Or response.text() if your backend returns plain text
    })
    .then(data => {

      // Process the data from your Laravel controller
    })
    .catch(error => {
      console.error('There was an error fetching data:', error);
      // Handle any errors that occurred during the fetch
    });
  }
  function handleChange(e)
  {
    setTitle(e.target.value);
  }
  return (
    <>
      <h1>make a new post</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="title" value={title} onChange={handleChange}></input>
        <button type="submit">post</button>
      </form>
      <iframe src="https://justfuckingusehtml.com" title="'faces' by stephan e perez"></iframe>
    </>
  );
}

export default CreatePostForm;