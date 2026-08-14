import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface AddressInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  placeholder = "Enter street address or location...",
  required = false,
  className = ""
}) => {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              onChange(data.display_name);
              setLocating(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Reverse geocode fallback to coordinates", e);
        }
        onChange(`GPS Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve GPS location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="ks-input-group relative flex items-center">
        <span className="ks-input-icon">
          <MapPin size={14} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ks-input text-xs py-1.5 !pr-[75px] truncate"
          style={{ paddingRight: '75px' }}
          autoComplete="off"
          required={required}
        />
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          className="absolute right-1.5 px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-sky-700 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs z-10"
          title="Detect and insert my current GPS location"
        >
          {locating ? (
            <Loader2 size={10} className="animate-spin text-sky-600" />
          ) : (
            <Navigation size={10} className="text-sky-600" />
          )}
          <span>{locating ? "GPS..." : "GPS"}</span>
        </button>
      </div>
      {error && <p className="text-[10px] text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
};
