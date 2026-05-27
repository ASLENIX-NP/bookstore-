import React, { useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { X, MapPin, CheckCircle2 } from "lucide-react";

const STORE_LOCATION = {
  lat: 27.429688077401075,
  lng: 85.03152826822568,
};

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  React.useEffect(() => {
    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
}

export default function LocationPickerModal({
  open,
  onClose,
  onConfirm,
  initialLocation,
}) {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation?.lat && initialLocation?.lng
      ? {
          lat: Number(initialLocation.lat),
          lng: Number(initialLocation.lng),
        }
      : STORE_LOCATION
  );

  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: "",
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #4f46e5;
          border: 4px solid white;
          border-radius: 9999px;
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 9999px;
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
              Select Delivery Location
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
              Click on the map where you want delivery
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-[1.5rem] overflow-hidden border border-slate-200 h-[420px]">
            <MapContainer
              center={[selectedLocation.lat, selectedLocation.lng]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onSelect={setSelectedLocation} />
              <MapCenterUpdater center={selectedLocation} />

              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={markerIcon}
              />
            </MapContainer>
          </div>

          <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />

                <p className="text-sm font-black text-slate-900">
                  Selected Location
                </p>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Latitude:{" "}
                <span className="font-black text-slate-800">
                  {Number(selectedLocation.lat).toFixed(6)}
                </span>{" "}
                | Longitude:{" "}
                <span className="font-black text-slate-800">
                  {Number(selectedLocation.lng).toFixed(6)}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => onConfirm(selectedLocation)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black shadow-lg shadow-indigo-200"
              >
                <CheckCircle2 className="w-5 h-5" />
                Use This Delivery Location
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Use this when you are ordering for another city/place. Example: you
            are in Kathmandu but want delivery in Pokhara.
          </p>
        </div>
      </div>
    </div>
  );
}