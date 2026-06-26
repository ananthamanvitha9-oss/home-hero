import { useState, useEffect, useRef } from 'react';

// Custom dark theme styles for the Google Map canvas
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
];

// Helper to extract coordinates from various formats [lng, lat] or {lat, lng}
const parseCoords = (coords, defaultVal) => {
  if (!coords) return defaultVal;
  if (Array.isArray(coords)) {
    return { lng: coords[0], lat: coords[1] };
  }
  if (typeof coords.lat !== 'undefined' && typeof coords.lng !== 'undefined') {
    return { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) };
  }
  return defaultVal;
};

// Calculate Haversine distance in kilometers
const getDistanceKm = (c1, c2) => {
  const R = 6371; // radius of earth in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function InteractiveMap({ customerCoords, technicianCoords }) {
  const mapRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(() => {
    return typeof window !== 'undefined' && !!window.google && !!window.google.maps;
  });
  const [hasError, setHasError] = useState(false);

  const parsedCust = parseCoords(customerCoords, { lat: 17.4281, lng: 78.38401 });
  const parsedTech = parseCoords(technicianCoords, { lat: 17.42621, lng: 78.38202 });

  const custLat = parsedCust.lat;
  const custLng = parsedCust.lng;
  const techLat = parsedTech.lat;
  const techLng = parsedTech.lng;

  const distance = getDistanceKm(parsedCust, parsedTech).toFixed(2);

  useEffect(() => {
    if (googleLoaded) return;

    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setTimeout(() => setGoogleLoaded(true), 0);
      return;
    }

    const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setTimeout(() => setHasError(true), 0);
      return;
    }

    // Load Google script dynamically
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      window.initGoogleMap = () => {
        setGoogleLoaded(true);
      };

      script.onerror = () => {
        setTimeout(() => setHasError(true), 0);
      };
    } else {
      // Script already appended but not yet loaded
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 200);
      return () => clearInterval(checkLoaded);
    }
  }, [googleLoaded]);

  // Initialize and update Map markers
  useEffect(() => {
    if (!googleLoaded || hasError || !mapRef.current) return;

    try {
      const center = { lat: custLat, lng: custLng };
      const techLoc = { lat: techLat, lng: techLng };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        styles: darkMapStyles,
        disableDefaultUI: true,
      });

      // Customer Marker
      new window.google.maps.Marker({
        position: center,
        map,
        title: "Your Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#6366f1", // Indigo
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Technician Marker
      new window.google.maps.Marker({
        position: techLoc,
        map,
        title: "Hero Location",
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#10b981", // Emerald Mint
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Draw Polyline route
      new window.google.maps.Polyline({
        path: [center, techLoc],
        geodesic: true,
        strokeColor: "#6366f1",
        strokeOpacity: 0.6,
        strokeWeight: 4,
        map,
      });
    } catch (err) {
      console.warn("Google Maps failed to initialize map layout.", err);
      setTimeout(() => setHasError(true), 0);
    }
  }, [googleLoaded, hasError, custLat, custLng, techLat, techLng]);

  // Premium SVG Fallback Canvas Rendering
  if (hasError || !googleLoaded) {
    return (
      <div 
        className="map-fallback-canvas" 
        style={{
          width: '100%',
          height: '240px',
          background: '#0f172a',
          border: '1px solid var(--border-slate)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '15px'
        }}
      >
        {/* SVG Grid Overlay */}
        <svg 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Polyline Route Path */}
          <line 
            x1="30%" 
            y1="50%" 
            x2="70%" 
            y2="50%" 
            stroke="var(--primary-indigo)" 
            strokeWidth="3" 
            strokeDasharray="5, 5" 
            style={{ opacity: 0.6 }}
          />

          {/* Customer marker - Pulsing ring */}
          <circle cx="30%" cy="50%" r="14" fill="rgba(99, 102, 241, 0.2)">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30%" cy="50%" r="6" fill="var(--primary-indigo)" stroke="#ffffff" strokeWidth="1.5" />

          {/* Technician marker - Pulsing ring */}
          <circle cx="70%" cy="50%" r="14" fill="rgba(16, 185, 129, 0.2)">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="70%" cy="50%" r="6" fill="var(--success-mint)" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* HUD labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 1, width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <span className="status-badge" style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>
              📍 Customer Location
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '4px' }}>
              [{parsedCust.lat.toFixed(5)}, {parsedCust.lng.toFixed(5)}]
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="status-badge" style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success-mint)' }}>
              🛰️ Hero GPS Telemetry
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '4px' }}>
              [{parsedTech.lat.toFixed(5)}, {parsedTech.lng.toFixed(5)}]
            </div>
          </div>
        </div>

        {/* Dashboard Banner */}
        <div 
          style={{
            zIndex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '8px 12px',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>
            Distance Vector:
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--success-mint)', fontWeight: 'bold' }}>
            🚗 {distance} km away
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '240px', 
        borderRadius: '12px', 
        border: '1px solid var(--border-slate)',
        overflow: 'hidden'
      }} 
    />
  );
}

export default InteractiveMap;
