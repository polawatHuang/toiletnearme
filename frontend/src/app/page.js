'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import MapWrapper from '@/components/Map/MapWrapper';
import ToiletSidebar from '@/components/ToiletSidebar';
import ToiletDetail from '@/components/ToiletDetail';
import AddToiletModal from '@/components/AddToiletModal';
import ReviewModal from '@/components/ReviewModal';
import { toiletAPI } from '@/lib/api';
import { geocode, reverseGeocode } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { MapPinIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuth();

  const [toilets,       setToilets]       = useState([]);
  const [selectedToilet,setSelectedToilet]= useState(null);
  const [loading,        setLoading]       = useState(false);
  const [flyTarget,      setFlyTarget]     = useState(null);

  // Search
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Add mode
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [pendingPin,   setPendingPin]   = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingAddress, setPendingAddress] = useState('');

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Sidebar (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Load all active toilets ─────────────────────────────── */
  const loadToilets = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await toiletAPI.list({ status: 'active', limit: 200, ...params });
      setToilets(res.data.toilets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadToilets(); }, [loadToilets]);

  /* ── Near Me ─────────────────────────────────────────────── */
  const handleNearMe = () => {
    if (!navigator.geolocation) return alert('เบราว์เซอร์ไม่รองรับ geolocation');
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setFlyTarget({ lat, lng });
      loadToilets({ lat, lng, radius: 5 });
    }, () => alert('ไม่สามารถรับตำแหน่งได้ กรุณาอนุญาต location'));
  };

  /* ── Search ──────────────────────────────────────────────── */
  const handleSearch = async (query) => {
    if (!query.trim()) { loadToilets(); return; }
    // First try name search against our API
    loadToilets({ search: query });
    // Also geocode for map fly
    try {
      const results = await geocode(query);
      if (results.length) {
        setFlyTarget(results[0]);
        loadToilets({ lat: results[0].lat, lng: results[0].lng, radius: 5, search: query });
      }
    } catch {}
  };

  /* ── Map click (add mode) ────────────────────────────────── */
  const handleMapClick = async latlng => {
    if (!isAddingMode) return;
    setPendingPin({ lat: latlng.lat, lng: latlng.lng });
    setIsAddingMode(false);
    const addr = await reverseGeocode(latlng.lat, latlng.lng);
    setPendingAddress(addr);
    setShowAddModal(true);
  };

  /* ── After toilet added ──────────────────────────────────── */
  const handleToiletAdded = toilet => {
    setToilets(prev => [...prev, toilet]);
    setShowAddModal(false);
    setPendingPin(null);
    setPendingAddress('');
    setFlyTarget({ lat: toilet.lat, lng: toilet.lng });
    if (toilet.status === 'active') setSelectedToilet(toilet);
  };

  /* ── After toilet updated ────────────────────────────────── */
  const handleToiletUpdated = updated => {
    setToilets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelectedToilet(updated);
  };

  /* ── After toilet deleted ────────────────────────────────── */
  const handleToiletDeleted = id => {
    setToilets(prev => prev.filter(t => t.id !== id));
    setSelectedToilet(null);
  };

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <Navbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onSearch={handleSearch}
        onAddClick={() => user ? setIsAddingMode(true) : (window.location.href = '/login')}
      />

      {/* Main area below navbar */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: '64px' }}>

        {/* ── Sidebar ──────────────────────────────────────── */}
        {/* Mobile: full-screen overlay drawer. Desktop: static left panel */}
        <aside className={`
          fixed sm:relative inset-0 sm:inset-auto z-40
          w-full sm:w-80 xl:w-96 flex flex-col bg-white border-r border-slate-100 shadow-2xl sm:shadow-none
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `} style={{ top: 64, bottom: 0 }}>
          <ToiletSidebar
            toilets={toilets}
            selected={selectedToilet}
            loading={loading}
            onSelect={t => { setSelectedToilet(t); setFlyTarget({ lat: t.lat, lng: t.lng }); setSidebarOpen(false); }}
            onNearMe={handleNearMe}
            onSearch={handleSearch}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Sidebar overlay backdrop (mobile only) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 sm:hidden"
            style={{ top: 64 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Map ──────────────────────────────────────────── */}
        <main className="relative flex-1 overflow-hidden">
          <MapWrapper
            toilets={toilets}
            selectedId={selectedToilet?.id}
            onSelectToilet={t => { setSelectedToilet(t); setSidebarOpen(false); }}
            isAddingMode={isAddingMode}
            onMapClick={handleMapClick}
            flyTarget={flyTarget}
            pendingPin={pendingPin}
          />

          {/* Mobile sidebar toggle – only show when sidebar is closed */}
          {!sidebarOpen && (
            <button
              className="absolute top-4 left-4 z-[999] sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl glass shadow text-sm font-medium"
              onClick={() => setSidebarOpen(true)}
            >
              <span>☰</span>
              รายการ ({toilets.length})
            </button>
          )}

          {/* Cancel adding mode */}
          {isAddingMode && (
            <button
              className="absolute top-4 right-4 z-[999] px-3 py-2 rounded-xl bg-white shadow text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              onClick={() => setIsAddingMode(false)}
            >
              ยกเลิก
            </button>
          )}

          {/* FAB */}
          {!isAddingMode && user && (
            <button
              onClick={() => setIsAddingMode(true)}
              className="absolute bottom-6 right-6 z-[999] flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-2xl hover:from-brand-600 hover:to-brand-700 transition animate-fade-in"
            >
              <MapPinIcon className="h-5 w-5" />
              เพิ่มห้องน้ำ
            </button>
          )}

          {/* Toilet detail panel */}
          {selectedToilet && (
            <div className="absolute bottom-0 right-0 z-[500] w-full sm:w-96 max-h-[70vh] animate-slide-up overflow-hidden">
              <ToiletDetail
                toilet={selectedToilet}
                onClose={() => setSelectedToilet(null)}
                onReview={() => user ? setShowReviewModal(true) : (window.location.href = '/login')}
                onUpdated={handleToiletUpdated}
                onDeleted={() => handleToiletDeleted(selectedToilet.id)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && pendingPin && (
        <AddToiletModal
          lat={pendingPin.lat}
          lng={pendingPin.lng}
          address={pendingAddress}
          onClose={() => { setShowAddModal(false); setPendingPin(null); }}
          onAdded={handleToiletAdded}
        />
      )}

      {showReviewModal && selectedToilet && (
        <ReviewModal
          toilet={selectedToilet}
          onClose={() => setShowReviewModal(false)}
          onReviewed={updated => {
            setToilets(prev => prev.map(t => t.id === updated.id ? updated : t));
            setSelectedToilet(updated);
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
}
