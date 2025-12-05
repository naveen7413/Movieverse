import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const API_KEY = '4f274059f1ea723ba6ba81662cef48fc'; // Api key

function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // Fetch the list of movie categories
  useEffect(() => {
    axios
      .get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
      .then(response => {
        setCategories(response.data.genres);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories.');
      });
  }, []);

  // Fetch movies based on the selected category
  const handleCategorySelect = (categoryId) => {
    if (!categoryId) {
      setMovies([]);
      return;
    }

    setSelectedCategory(categoryId);
    setMovies([]);
    setPage(1);
    setLoading(true);
    setError(null);

    axios
      .get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${categoryId}&page=1`)
      .then(response => {
        setMovies(response.data.results);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movies by category:', error);
        setError('Failed to load movies.');
        setLoading(false);
      });
  };

  // Load more movies
  const loadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    axios
      .get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedCategory}&page=${nextPage}`)
      .then(response => {
        setMovies(prevMovies => [...prevMovies, ...response.data.results]);
        setLoadingMore(false);
      })
      .catch(error => {
        console.error('Error loading more movies:', error);
        setLoadingMore(false);
      });
  };

  return (
    <div>
      <h1>Movie Categories</h1>
      <select onChange={(e) => handleCategorySelect(e.target.value)}>
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="movie-list">
        {movies.length > 0 ? (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        ) : (
          !loading && <p>No movies found in this category.</p>
        )}
      </div>

      {loadingMore ? (
        <p>Loading more movies...</p>
      ) : (
        movies.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={loadMore} className="load-more-button" style={{
              padding: '10px 20px',
              fontSize: '1.2rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}>
              Load More
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default Categories;
