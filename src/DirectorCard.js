import React, { useState, useEffect } from 'react';
import {  Star } from 'lucide-react';

function DirectorCard({ director, onClick }) {
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
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
    filterSelect: {
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
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    return (
      <div onClick={onClick} style={styles.directorCard}>
        <div style={{ position: 'relative' }}>
          {!imageError && director.profile_path ? (
            <>
              <img
                src={`${IMAGE_BASE_URL}${director.profile_path}`}
                alt={director.name}
                style={{ ...styles.directorImage, display: isLoading ? 'none' : 'block' }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setImageError(true);
                }}
              />
              {isLoading && (
                <div style={{...styles.directorImage, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite'}}></div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              ...styles.directorImage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.1), transparent 70%)',
              }}></div>
              <div style={{
                textAlign: 'center',
                zIndex: 1,
                padding: '16px'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '8px',
                  opacity: 0.7
                }}>🎬</div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  lineHeight: '1.2',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {director.name}
                </div>
              </div>
            </div>
          )}
          
          <div style={styles.directorOverlay}>
            <h3 style={styles.directorName}>{director.name}</h3>
            <div style={styles.ratingContainer}>
              <Star color="#fbbf24" size={12} />
              <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>
                {director.popularity?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
export default DirectorCard;