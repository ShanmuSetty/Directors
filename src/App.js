import React, { useState, useEffect } from 'react';
import { Search, Star, Calendar, Film, ArrowLeft, MapPin } from 'lucide-react';
import './App.css';
import DirectorCard from './DirectorCard';
import MovieCard from './MovieCard';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const DirectorsApp = () => {
  // State for directors data
  
  const [filteredDirectors, setFilteredDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [directorMovies, setDirectorMovies] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [directorsPerPage] = useState(30);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState('');
  
//Read More
const [showFullBio, setShowFullBio] = useState(false);
  // Calculate paginated directors
  const indexOfLastDirector = currentPage * directorsPerPage;
  const indexOfFirstDirector = indexOfLastDirector - directorsPerPage;
  const currentDirectors = filteredDirectors.slice(indexOfFirstDirector, indexOfLastDirector);
  const totalPages = Math.ceil(filteredDirectors.length / directorsPerPage);

  // Fetch initial data
  useEffect(() => {
    fetchDirectors();
  }, []);

  
  

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const directorsData = [];

      const response = await fetch('https://directornames.onrender.com/api/directors');
      const indianDirectorNames = await response.json();
      
      
      
      for (const directorName of indianDirectorNames) {
        try {
          const searchRes = await fetch(
            `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(directorName)}`
          );
          

          if (!searchRes.ok) continue;

          const searchData = await searchRes.json();
          const director = searchData.results.find(
            (person) =>
              person.known_for_department === 'Directing' &&
              person.name.toLowerCase().includes(directorName.toLowerCase().split(' ')[0])
          );

          if (director) {
            try {
              const detailRes = await fetch(
                `${BASE_URL}/person/${director.id}?api_key=${API_KEY}`
              );
              

              if (detailRes.ok) {
                const details = await detailRes.json();

                

                directorsData.push({
                  id: director.id,
                  name: director.name,
                  profile_path: director.profile_path,
                  popularity: director.popularity || 0,
                  known_for_department: director.known_for_department || 'Directing',
                  gender: details.gender,
                  birthday: details.birthday,
                  place_of_birth: details.place_of_birth,
                  biography: details.biography
                });
              }
            } catch (detailErr) {
              directorsData.push({
                id: director.id,
                name: director.name,
                profile_path: director.profile_path,
                popularity: director.popularity || 0,
                known_for_department: director.known_for_department || 'Directing'
              });
            }
          }

          await new Promise((res) => setTimeout(res, 50));
        } catch (err) {
          console.warn(`Failed to search for ${directorName}:`, err);
        }
      }

      const sortedDirectors = directorsData.sort((a, b) => b.popularity - a.popularity);
      
      
      setFilteredDirectors(sortedDirectors);
      
      
      setLoading(false);

    } catch (err) {
      console.error('Error fetching directors:', err);
      setLoading(false);
      setError('Failed to load directors');
    }
  };

 

  const fetchMovieCertification = async (movieId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}/release_dates?api_key=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const usCert = data.results.find(result => result.iso_3166_1 === 'US');
        if (usCert && usCert.release_dates.length > 0) {
          return usCert.release_dates[0].certification;
        }
        
        for (const result of data.results) {
          if (result.release_dates.length > 0 && result.release_dates[0].certification) {
            return result.release_dates[0].certification;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching certification:', err);
      return null;
    }
  };

  const fetchDirectorDetails = async (directorId) => {
    try {
      setLoadingMovies(true);

      const directorResponse = await fetch(
        `${BASE_URL}/person/${directorId}?api_key=${API_KEY}`
      );
      
      if (directorResponse.ok) {
        const directorData = await directorResponse.json();
        setSelectedDirector(directorData);
        await fetchDirectorMovies(directorId);
      } else {
        throw new Error('Failed to fetch director details');
      }
    } catch (err) {
      setError('Failed to load director details');
      setLoadingMovies(false);
      console.error('Error fetching director details:', err);
    }
  };

  const fetchDirectorMovies = async (directorId) => {
    try {
      setLoadingMovies(true);
      setDirectorMovies([]);

      const moviesResponse = await fetch(
        `${BASE_URL}/person/${directorId}/movie_credits?api_key=${API_KEY}`
      );

      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();

        const directedMovies = (moviesData.crew || [])
          .filter(movie => movie.job === 'Director')
          .sort((a, b) => {
            const dateA = new Date(a.release_date || '1900-01-01');
            const dateB = new Date(b.release_date || '1900-01-01');
            return dateB - dateA;
          });

        const moviesWithCertifications = await Promise.all(
          directedMovies.map(async (movie) => {
            const certification = await fetchMovieCertification(movie.id);
            return {
              ...movie,
              certification
            };
          })
        );

        const filteredMovies = moviesWithCertifications.filter(movie => {
          const cert = movie.certification;
          if (!cert) return true;
          
          const adultRatings = ['R', 'NC-17', 'X', 'A', 'MA15+', '18', '18+', 'Restricted'];
          return !adultRatings.some(rating => cert.includes(rating));
        });

        setDirectorMovies(filteredMovies);
      }

      setLoadingMovies(false);
    } catch (err) {
      setError('Failed to load director movies');
      setLoadingMovies(false);
      console.error('Error fetching director movies:', err);
    }
  };

  // Navigation functions
  const handleDirectorClick = (director) => {
    fetchDirectorDetails(director.id);
  };

  const handleBackClick = () => {
    setSelectedDirector(null);
    setDirectorMovies([]);
    setError('');
  };



  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Styles
  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    loadingContainer: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    spinner: {
      width: '64px',
      height: '64px',
      border: '4px solid #ef4444',
      borderTop: '4px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    errorContainer: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorBox: {
      textAlign: 'center',
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      padding: '32px',
      margin: '16px',
      border: '1px solid #374151'
    },
    header: {
      position: 'relative',
      padding: '32px 48px',
      background: 'linear-gradient(to right, #1f2937, #000000)'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold'
    },
    headerControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    searchContainer: {
      position: 'relative'
    },
    searchInput: {
      width: '320px',
      paddingLeft: '48px',
      paddingRight: '16px',
      paddingTop: '12px',
      paddingBottom: '12px',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      color: '#ffffff',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    filterModal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000'
    },
    filterContent: {
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      padding: '32px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto',
      border: '1px solid #374151'
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    filterTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    filterLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#d1d5db',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterInput: {
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      padding: '8px 12px',
      color: '#ffffff',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    
    rangeContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    rangeInput: {
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      padding: '8px 12px',
      color: '#ffffff',
      outline: 'none',
      width: '80px'
    },
    filterActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      paddingTop: '24px',
      borderTop: '1px solid #374151'
    },
    resetButton: {
      backgroundColor: 'transparent',
      border: '1px solid #4b5563',
      borderRadius: '6px',
      padding: '8px 16px',
      color: '#9ca3af',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    applyButton: {
      backgroundColor: '#dc2626',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    main: {
      padding: '32px 48px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '24px'
    },
    directorCard: {
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#374151',
      position: 'relative'
    },
    directorImage: {
      width: '100%',
      height: '192px',
      objectFit: 'cover',
      transition: 'transform 0.5s ease'
    },
    directorOverlay: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
      padding: '16px'
    },
    directorName: {
      fontWeight: '600',
      fontSize: '0.875rem',
      lineHeight: '1.2',
      marginBottom: '4px'
    },
    ratingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    playButton: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: '#dc2626',
      borderRadius: '50%',
      padding: '8px',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    },
    // Director Detail Styles
    heroSection: {
      position: 'relative',
      height: '100vh',
      background: 'linear-gradient(to right, #000000, #1f2937, #000000)',
      overflow: 'hidden'
    },
    heroBackground: {
      position: 'absolute',
      inset: '0',
      opacity: '0.3'
    },
    heroBackgroundImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    heroGradient: {
      position: 'absolute',
      inset: '0',
      background: 'linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0.7), transparent)'
    },
    navigation: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '20',
      padding: '24px'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#ffffff',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.125rem',
      transition: 'color 0.2s'
    },
    heroContent: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: '10',
      padding: '48px'
    },
    heroTitle: {
      fontSize: '3.75rem',
      fontWeight: 'bold',
      marginBottom: '16px',
      background: 'linear-gradient(to right, #ffffff, #9ca3af)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    heroStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      marginBottom: '24px'
    },
    heroStat: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.125rem'
    },
    heroBio: {
      color: '#d1d5db',
      fontSize: '1.125rem',
      lineHeight: '1.6',
      maxWidth: '768px',
      marginBottom: '32px'
    },
    moviesSection: {
      padding: '64px 48px',
      backgroundColor: '#1f2937'
    },
    moviesTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    moviesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    movieCard: {
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    },
    movieImage: {
      width: '100%',
      height: '256px',
      objectFit: 'cover'
    },
    movieOverlay: {
      position: 'absolute',
      inset: '0',
      backgroundColor: 'rgba(0,0,0,0)',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    moviePlayIcon: {
      color: '#ffffff',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    },
    movieGradient: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
      padding: '16px'
    },
    movieInfo: {
      marginTop: '12px'
    },
    movieTitle: {
      color: '#ffffff',
      fontWeight: '500',
      fontSize: '0.875rem',
      lineHeight: '1.2',
      marginBottom: '4px',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    movieYear: {
      color: '#9ca3af',
      fontSize: '0.75rem'
    },
    loadMoreButton: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      display: 'block',
      margin: '0 auto'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 0'
    }
  };

  if (loading && !selectedDirector) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.spinner}></div>
          <p style={{ fontSize: '1.25rem' }}>Loading Directors...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedDirector) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <div style={{ fontSize: '3.75rem', marginBottom: '16px' }}>🎬</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchDirectors();
            }}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Director Detail View
  if (selectedDirector) {
    return (
      <div style={styles.app}>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroBackground}>
            <img
              src={selectedDirector.profile_path ? `${IMAGE_BASE_URL}${selectedDirector.profile_path}` : 'https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Director'}
              alt={selectedDirector.name}
              style={styles.heroBackgroundImage}
            />
            <div style={styles.heroGradient}></div>
          </div>

          <div style={styles.navigation}>
            <button onClick={handleBackClick} style={styles.backButton}>
              <ArrowLeft size={24} />
              <span>Back to Directors</span>
            </button>
          </div>

          <div style={styles.heroContent}>
            <div style={{ maxWidth: '1024px' }}>
              <h1 style={styles.heroTitle}>{selectedDirector.name}</h1>
              
              <div style={styles.heroStats}>
                <div style={styles.heroStat}>
                  <Star color="#fbbf24" size={20} />
                  <span>{selectedDirector.popularity?.toFixed(1) || 'N/A'}</span>
                </div>
                
                {selectedDirector.birthday && (
                  <div style={styles.heroStat}>
                    <Calendar color="#60a5fa" size={20} />
                    <span>{new Date(selectedDirector.birthday).getFullYear()}</span>
                  </div>
                )}
                
                {selectedDirector.place_of_birth && (
                  <div style={styles.heroStat}>
                    <MapPin color="#34d399" size={20} />
                    <span>{selectedDirector.place_of_birth.split(',')[0]}</span>
                  </div>
                )}
              </div>

              {selectedDirector.biography && (
  <div style={styles.heroBio}>
    <p>
      {showFullBio 
        ? selectedDirector.biography 
        : `${selectedDirector.biography.slice(0, 400)}${selectedDirector.biography.length > 400 ? '...' : ''}`
      }
    </p>
    {selectedDirector.biography.length > 400 && (
      <button
        onClick={() => setShowFullBio(!showFullBio)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: '#dc2626',
          cursor: 'pointer',
          fontSize: '1rem',
          marginTop: '8px',
          textDecoration: 'underline'
        }}
      >
        {showFullBio ? 'Read Less' : 'Read More'}
      </button>
    )}
  </div>
)}
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div style={styles.moviesSection}>
          <h2 style={styles.moviesTitle}>
            <Film color="#ef4444" />
            Filmography
          </h2>
          
          <div style={styles.moviesGrid}>
            {directorMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {loadingMovies && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={styles.spinner}></div>
              <p>Loading movies...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>Directors</h1>
          <div style={styles.headerControls}>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search directors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
          </div>
        </div>
      </header>

      

      <main style={styles.main}>
       
        <div style={styles.grid}>
          {currentDirectors.map((director) => (
            <DirectorCard key={director.id} director={director} onClick={() => handleDirectorClick(director)} />
          ))}
        </div>
        
        {filteredDirectors.length === 0 && !loading ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3.75rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>No directors found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <PaginationComponent />
        )}
      </main>
    </div>
  );

  
  function PaginationComponent() {
    const startIndex = (currentPage - 1) * directorsPerPage + 1;
    const endIndex = Math.min(currentPage * directorsPerPage, filteredDirectors.length);
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '48px',
        paddingBottom: '32px'
      }}>
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          style={{
            backgroundColor: currentPage === 1 ? '#1f2937' : '#374151',
            border: currentPage === 1 ? '1px solid #374151' : '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px 12px',
            color: currentPage === 1 ? '#6b7280' : '#ffffff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Previous
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              style={{
                backgroundColor: currentPage === pageNum ? '#dc2626' : '#374151',
                border: currentPage === pageNum ? '1px solid #dc2626' : '1px solid #4b5563',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '40px'
              }}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          style={{
            backgroundColor: currentPage === totalPages ? '#1f2937' : '#374151',
            border: currentPage === totalPages ? '1px solid #374151' : '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px 12px',
            color: currentPage === totalPages ? '#6b7280' : '#ffffff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Next
        </button>
        
        <div style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 16px' }}>
          Showing {startIndex}-{endIndex} of {filteredDirectors.length} directors
        </div>
      </div>
    );
  }
};

export default DirectorsApp;