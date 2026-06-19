import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Heart, Star, Trash2, Map, AlertCircle, Loader2, ExternalLink, List, Plus, Edit, X, Save, ArrowRight, Ruler, Banknote, Coffee, Cat, PawPrint, Utensils, Sparkles, RotateCcw } from 'lucide-react';
import SpinWheel from './components/SpinWheel';
import Confetti from './components/Confetti';
import { Restaurant, FetchMode, DEFAULT_CATEGORIES, TAIWAN_CITIES, CityData, CustomList, PRESET_CATEGORIES } from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  // State
  // wheelItems: Items displayed on the wheel (Categories or Restaurants)
  const [wheelItems, setWheelItems] = useState<Restaurant[]>(DEFAULT_CATEGORIES);
  // recommendations: List of restaurants displayed below the wheel
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  
  const [mode, setMode] = useState<FetchMode>('GENERIC');
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Restaurant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // isLoading: Full screen blocking loader (for initial setup/region search)
  const [isLoading, setIsLoading] = useState(false);
  // isAutoFetching: Inline loader for recommendations (does not block view of winner)
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(1000); // Default 1km
  const [priceLevel, setPriceLevel] = useState<string>(''); // Default: Any

  // Region Selection State
  const [selectedCity, setSelectedCity] = useState<string>(TAIWAN_CITIES[0].name);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(TAIWAN_CITIES[0].districts[0]);

  // Modal State for Custom Lists
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<Partial<CustomList> | null>(null); // If null, we are viewing the list of lists. If set, we are editing.
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');

  // Item Editing & Changed Save States
  const [isListModified, setIsListModified] = useState(false);
  const [isItemEditingModalOpen, setIsItemEditingModalOpen] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemDesc, setEditingItemDesc] = useState('');
  const [isSaveModifiedModalOpen, setIsSaveModifiedModalOpen] = useState(false);
  const [saveListName, setSaveListName] = useState('');

  // Load data on mount
  useEffect(() => {
    const storedFavs = localStorage.getItem('foodRouletteFavorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    const storedLists = localStorage.getItem('foodRouletteCustomLists');
    if (storedLists) {
        try {
            setCustomLists(JSON.parse(storedLists));
        } catch (e) {
            console.error("Failed to parse custom lists", e);
        }
    }
  }, []);

  // Save favorites when changed
  useEffect(() => {
    localStorage.setItem('foodRouletteFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save custom lists when changed
  useEffect(() => {
    localStorage.setItem('foodRouletteCustomLists', JSON.stringify(customLists));
  }, [customLists]);

  // Scroll to winner card when it appears
  useEffect(() => {
    if (selectedWinner) {
      // Small timeout to allow DOM to render
      setTimeout(() => {
        const element = document.getElementById('winner-card');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedWinner]);

  // Clear confetti if user starts spinning again
  useEffect(() => {
    if (isSpinning) {
        setShowConfetti(false);
    }
  }, [isSpinning]);

  // Auto-refetch recommendations if the user changes the budget (priceLevel) or distance (searchRadius) while we have an active winner
  useEffect(() => {
    if (selectedWinner && (mode === 'GENERIC' || mode === 'CUSTOM' || mode === 'PRESET')) {
      if (!navigator.geolocation) return;
      
      setIsAutoFetching(true);
      setRecommendations([]);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const results = await geminiService.getNearbyRestaurants(
              latitude, 
              longitude, 
              searchRadius, 
              selectedWinner.name, 
              priceLevel
            );
            setRecommendations(results);
          } catch (e) {
            console.error("Auto refetch failed", e);
          } finally {
            setIsAutoFetching(false);
          }
        },
        (err) => {
          console.log("Auto refetch location error", err);
          setIsAutoFetching(false);
        },
        options
      );
    }
  }, [priceLevel, searchRadius]);

  const addToFavorites = (restaurant: Restaurant) => {
    if (!favorites.some(f => f.name === restaurant.name)) {
      setFavorites([...favorites, restaurant]);
    }
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const loadFavoritesToWheel = () => {
    if (favorites.length < 2) {
      setError("請至少加入 2 個喜愛的餐廳才能轉輪盤！");
      return;
    }
    setWheelItems(favorites);
    setRecommendations(favorites);
    setMode('FAVORITES');
    setIsListModified(false);
    setError(null);
    setSelectedWinner(null);
  };

  const handleNearBySearch = () => {
    if (!navigator.geolocation) {
      setError("貓咪找不到您的位置（瀏覽器不支援）。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMode('NEARBY');
    setIsListModified(false);
    setRecommendations([]); // Clear previous list while loading
    setSelectedWinner(null);
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const results = await geminiService.getNearbyRestaurants(latitude, longitude, searchRadius, undefined, priceLevel);
          if (results.length > 0) {
              setWheelItems(results);
              setRecommendations(results);
          } else {
              setError("這附近好像沒有什麼好吃的（找不到推薦的餐廳）。");
          }
        } catch (err) {
          setError("無法取得附近餐廳資訊，貓咪嚮導可能在睡覺。");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        console.error("Geolocation error:", err);
        
        let errorMessage = "無法取得您的位置。";
        switch(err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = "您拒絕了位置存取，貓咪無法幫您找餐廳。";
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = "無法偵測目前位置資訊，請確認網路連線。";
                break;
            case err.TIMEOUT:
                errorMessage = "偵測位置太久了，請再試一次。";
                break;
        }
        setError(errorMessage);
      },
      options
    );
  };

  const handleRegionSearch = async () => {
    setIsLoading(true);
    setError(null);
    setMode('REGION');
    setIsListModified(false);
    setRecommendations([]);
    setSelectedWinner(null);
    
    try {
      const results = await geminiService.getRestaurantsByRegion(selectedCity, selectedDistrict, priceLevel);
      if (results.length > 0) {
        setWheelItems(results);
        setRecommendations(results);
      } else {
        setError("該地區找不到推薦資料。");
      }
    } catch (err) {
      setError("搜尋失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWheelItems(DEFAULT_CATEGORIES);
    setRecommendations([]);
    setMode('GENERIC');
    setSelectedPresetLabel('');
    setIsListModified(false);
    setSelectedWinner(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePresetSelect = (presetKey: string) => {
    if (!presetKey) {
      handleReset();
      return;
    }
    const preset = PRESET_CATEGORIES[presetKey];
    if (preset) {
      setWheelItems(preset.items);
      setRecommendations(preset.items);
      setMode('PRESET');
      setSelectedPresetLabel(preset.label);
      setIsListModified(false);
      setSelectedWinner(null);
      setError(null);
    }
  };

  // Option Item Editing Handlers
  const handleEditItem = (index: number) => {
    if (isSpinning) return;
    const item = wheelItems[index];
    if (item) {
      setEditingItemIdx(index);
      setEditingItemName(item.name);
      setEditingItemDesc(item.description || '');
      setIsItemEditingModalOpen(true);
    }
  };

  const handleSaveEditedItem = () => {
    if (editingItemIdx === null) return;
    if (!editingItemName.trim()) {
      alert("選項名稱不能為空哦！");
      return;
    }
    const updated = [...wheelItems];
    updated[editingItemIdx] = {
      ...updated[editingItemIdx],
      name: editingItemName.trim(),
      description: editingItemDesc.trim() || '自訂細節'
    };
    setWheelItems(updated);
    
    // Also sync to recommendations if they match wheelItems (generic/preset/favorites/custom lists)
    if (mode === 'GENERIC' || mode === 'PRESET' || mode === 'FAVORITES' || mode === 'CUSTOM') {
      const recIndex = recommendations.findIndex(r => r.id === wheelItems[editingItemIdx].id);
      if (recIndex !== -1) {
        const updatedRecs = [...recommendations];
        updatedRecs[recIndex] = {
          ...updatedRecs[recIndex],
          name: editingItemName.trim(),
          description: editingItemDesc.trim() || '自訂細節'
        };
        setRecommendations(updatedRecs);
      }
    }
    
    setIsListModified(true);
    setIsItemEditingModalOpen(false);
    setEditingItemIdx(null);
  };

  const handleDiscardChanges = () => {
    setIsListModified(false);
    // Optionally restore to default
    if (mode === 'PRESET') {
      const presetKey = Object.keys(PRESET_CATEGORIES).find(k => PRESET_CATEGORIES[k].label === selectedPresetLabel);
      if (presetKey && PRESET_CATEGORIES[presetKey]) {
        setWheelItems(PRESET_CATEGORIES[presetKey].items);
        setRecommendations(PRESET_CATEGORIES[presetKey].items);
      }
    } else if (mode === 'GENERIC') {
      setWheelItems(DEFAULT_CATEGORIES);
      setRecommendations([]);
    } else if (mode === 'FAVORITES') {
      setWheelItems(favorites);
      setRecommendations(favorites);
    }
  };

  const handlePromptSaveList = () => {
    let defaultName = '我的美味歌單';
    if (mode === 'PRESET' && selectedPresetLabel) {
      defaultName = `${selectedPresetLabel}變更款`;
    } else if (mode === 'GENERIC') {
      defaultName = '美食大分類變更款';
    } else if (mode === 'FAVORITES') {
      defaultName = '我的最愛變更款';
    }
    setSaveListName(defaultName);
    setIsSaveModifiedModalOpen(true);
  };

  const handleConfirmSaveModifiedList = () => {
    if (!saveListName.trim()) {
      alert("請輸入清單名稱！");
      return;
    }
    
    const newListObj: CustomList = {
      id: `list-${Date.now()}`,
      name: saveListName.trim(),
      items: wheelItems
    };
    
    setCustomLists([...customLists, newListObj]);
    setIsListModified(false);
    setIsSaveModifiedModalOpen(false);
    setMode('CUSTOM');
  };

  // Custom List Handlers
  const openNewListEditor = () => {
      setEditingList({}); // Empty object for new
      setEditName('');
      setEditText('');
  };

  const openEditList = (list: CustomList) => {
      setEditingList(list);
      setEditName(list.name);
      setEditText(list.items.map(i => i.name).join('\n'));
  };

  const saveCustomList = () => {
      if (!editName.trim()) {
          alert("請輸入清單名稱");
          return;
      }
      const rawItems = editText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      if (rawItems.length < 2) {
          alert("請至少輸入 2 個選項（每行一個）");
          return;
      }

      const newItems: Restaurant[] = rawItems.map((name, index) => ({
          id: `custom-${Date.now()}-${index}`,
          name: name,
          source: 'manual',
          description: '自訂選項'
      }));

      const newListObj: CustomList = {
          id: editingList?.id || `list-${Date.now()}`,
          name: editName,
          items: newItems
      };

      if (editingList?.id) {
          // Update existing
          setCustomLists(customLists.map(l => l.id === editingList.id ? newListObj : l));
      } else {
          // Create new
          setCustomLists([...customLists, newListObj]);
      }

      setEditingList(null); // Go back to list view
  };

  const deleteCustomList = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("確定要刪除這個清單嗎？")) {
          setCustomLists(customLists.filter(l => l.id !== id));
      }
  };

  const loadCustomListToWheel = (list: CustomList) => {
      setWheelItems(list.items);
      setRecommendations(list.items); // Show items in list below too
      setMode('CUSTOM');
      setIsListModified(false);
      setSelectedWinner(null);
      setError(null);
      setIsCustomModalOpen(false);
  };

  const handleSpinEnd = (winner: Restaurant) => {
      setSelectedWinner(winner);
      
      // Show Confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      // If we are in GENERIC, CUSTOM or PRESET mode, we might want to search nearby
      // For CUSTOM or PRESET mode, we try to search for the winner name
      if ((mode === 'GENERIC' || mode === 'CUSTOM' || mode === 'PRESET') && winner.name) {
          if (!navigator.geolocation) return; 
          
          setIsAutoFetching(true);
          // Clear previous recommendations to ensure we don't show the custom list items if no results found
          setRecommendations([]); 

          const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          };

          navigator.geolocation.getCurrentPosition(
              async (position) => {
                  try {
                      const { latitude, longitude } = position.coords;
                      // Pass the winner name as keyword and the selected radius
                      // Also pass the priceLevel to filter auto-search results
                      const results = await geminiService.getNearbyRestaurants(latitude, longitude, searchRadius, winner.name, priceLevel);
                      
                      // Update recommendations with results (or empty list if none)
                      setRecommendations(results);
                  } catch (e) {
                      console.error("Auto-fetch failed", e);
                  } finally {
                      setIsAutoFetching(false);
                  }
              },
              (err) => {
                  console.log("Auto-fetch location error", err);
                  setIsAutoFetching(false);
                  // Not showing error for custom/generic auto-fetch to avoid annoying user if they just want to spin
              },
              options
          );
      }
  };

  const getDistrictOptions = () => {
    const cityData = TAIWAN_CITIES.find(c => c.name === selectedCity);
    return cityData ? cityData.districts : [];
  };

  // Helper to ensure we always have a map link
  const getMapLink = (r: Restaurant) => {
      if (r.googleMapsUrl) return r.googleMapsUrl;
      // Fallback to search query
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}`;
  };

  const getDistanceLabel = (meters: number) => {
      if (meters >= 1000) return `${meters / 1000} km`;
      return `${meters} m`;
  };

  const getPriceLabel = (level: string) => {
      switch(level) {
          case 'inexpensive': return '$平價';
          case 'moderate': return '$中價';
          case 'expensive': return '$高價';
          case 'very_expensive': return '$奢華';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-pink-50 shadow-2xl overflow-hidden relative">
      
      {/* Confetti Overlay */}
      {showConfetti && <Confetti />}

      {/* Header - Soft Pink/Peach Gradient */}
      <header className="bg-gradient-to-r from-rose-300 via-pink-300 to-amber-200 text-white p-4 shadow-sm z-10 rounded-b-3xl mx-[-4px]">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2 tracking-wide drop-shadow-sm text-white">
            <Cat className="w-6 h-6 text-white" /> 
            今天吃什麼？
          </h1>
          <button 
             onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
             className="text-xs bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/40 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors text-white font-medium"
          >
            <Heart className="w-3.5 h-3.5 fill-current" /> 收藏 ({favorites.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 bg-pink-50">
        
        {/* Error Message */}
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-400 border border-red-100 rounded-2xl flex items-start gap-2 text-sm shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
        )}

        {/* Full Screen Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="relative p-6 rounded-full bg-white shadow-xl shadow-pink-100">
                    <Loader2 className="w-12 h-12 text-rose-300 animate-spin" />
                    <PawPrint className="w-5 h-5 text-rose-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 font-bold text-lg mt-4">貓咪嚮導搜尋中...</p>
                <p className="text-slate-400 text-sm">正在幫您嗅探好吃的餐廳</p>
            </div>
        )}

        {/* Wheel Section */}
        <div className="mb-4 mt-2">
           {!selectedWinner ? (
             <>
               <SpinWheel 
                 items={wheelItems} 
                 onSpinEnd={handleSpinEnd} 
                 isSpinning={isSpinning} 
                 setIsSpinning={setIsSpinning}
                 onEditItem={handleEditItem}
               />
               <div className="text-center mt-6 text-slate-400 text-sm font-medium tracking-widest flex items-center justify-center gap-3">
                  <span className="h-[2px] w-6 bg-pink-200 rounded-full"></span>
                  {mode === 'GENERIC' && " 選擇分類 "}
                  {mode === 'PRESET' && ` ${selectedPresetLabel}推薦 `}
                  {mode === 'NEARBY' && ` 附近 ${getDistanceLabel(searchRadius)} ${getPriceLabel(priceLevel)}`}
                  {mode === 'REGION' && ` ${selectedCity}${selectedDistrict} ${getPriceLabel(priceLevel)}`}
                  {mode === 'FAVORITES' && " 我的最愛 "}
                  {mode === 'CUSTOM' && " 自訂清單 "}
                  <span className="h-[2px] w-6 bg-pink-200 rounded-full"></span>
               </div>
             </>
           ) : (
             <div className="animate-fade-in-up scroll-mt-6" id="winner-card">
                 <div className="bg-white rounded-[2rem] shadow-xl shadow-rose-100 border-4 border-white overflow-hidden transform transition-all duration-500 relative">
                     {/* Decorative Header */}
                     <div className="bg-rose-50 p-4 text-center font-bold text-lg border-b border-rose-100 pt-6">
                         <span className="text-rose-400 mr-2">✦</span> 
                         <span className="text-slate-700">今日特選</span>
                         <span className="text-rose-400 ml-2">✦</span>
                     </div>
                     
                     <div className="p-6 bg-white flex flex-col items-center text-center">
                         <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                             <Utensils className="w-10 h-10 text-orange-300" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-700 mb-2">{selectedWinner.name}</h2>
                         {selectedWinner.description && (
                             <p className="text-slate-400 mb-6 text-sm leading-relaxed max-w-xs">{selectedWinner.description}</p>
                         )}
                         
                         <div className="flex gap-2 w-full mb-4">
                             <a 
                                 href={getMapLink(selectedWinner)}
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex-1 bg-sky-300 text-white py-3.5 px-4 rounded-2xl text-center font-bold text-sm hover:bg-sky-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-100"
                             >
                                 <MapPin className="w-4 h-4" /> 
                                 {(mode === 'CUSTOM' || mode === 'PRESET') ? '搜尋地圖' : '導航'}
                             </a>
                             <button 
                                 onClick={() => addToFavorites(selectedWinner)}
                                 className="bg-rose-50 text-rose-400 p-3.5 rounded-2xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-lg shadow-rose-50 flex items-center justify-center"
                             >
                                 <Heart className={`w-6 h-6 ${favorites.some(f => f.name === selectedWinner.name) ? 'fill-current' : ''}`} />
                             </button>
                         </div>

                         {/* 返回重轉一次的按鈕 */}
                         <button 
                             onClick={() => setSelectedWinner(null)}
                             className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200"
                         >
                             <RotateCcw className="w-4 h-4" />
                             返回重轉一次
                         </button>
                     </div>
                 </div>
             </div>
           )}
        </div>

        {/* 精選推薦清單 */}
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-3xl border border-pink-100 mb-4 shadow-sm shadow-pink-100/25 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-600 font-bold shrink-0">
                <Utensils className="w-4 h-4 text-pink-400" />
                <span className="text-sm">精選推薦清單</span>
            </div>
            <div className="flex-1 min-w-[150px]">
                <select 
                    value={Object.keys(PRESET_CATEGORIES).find(key => PRESET_CATEGORIES[key].label === selectedPresetLabel) || ''}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full py-2 px-3.5 pr-8 rounded-xl border border-pink-100/75 bg-pink-50/50 text-slate-600 font-bold text-xs focus:ring-2 focus:ring-pink-200 outline-none hover:bg-pink-50 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fca5a5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'calc(100% - 12px) center', backgroundRepeat: 'no-repeat', backgroundSize: '14px' }}
                >
                    <option value="">選個美食種類吧...</option>
                    <option value="breakfast">🌅 晨光活力早餐 (蛋餅、燒餅油條...)</option>
                    <option value="lunch">🍱 豐富飽足午餐 (牛肉麵、滷肉飯...)</option>
                    <option value="dinner">🍕 饗宴飽胃晚餐 (麻辣鍋、熱炒...)</option>
                    <option value="snack">🍩 幸福療癒甜點 (紅豆餅、鬆餅、刨冰...)</option>
                    <option value="drink">🍹 暢快解渴飲料 (蜂蜜綠茶、甘蔗青茶...)</option>
                    <option value="drink_shop">🥤 網紅人氣飲料店 (麻古、五十嵐、得正...)</option>
                </select>
            </div>
        </div>

        {/* 詢問是否儲存清單 (當有變更時顯示) */}
        {isListModified && (
            <div className="bg-gradient-to-r from-violet-50 to-pink-50 p-4 rounded-3xl border border-white mb-4 shadow-md shadow-pink-100/50 flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                    <span className="text-lg">💡</span>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-700 text-sm">要儲存本次更改的清單嗎？</h4>
                        <p className="text-xs text-slate-500 mt-0.5">您可以將目前修改後的選項儲存至「自訂清單」，一勞永逸、方便下次直接選用哦！</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDiscardChanges}
                        className="flex-1 py-2 text-xs font-bold text-slate-400 bg-white/65 hover:bg-white border border-pink-100 rounded-xl transition-colors"
                    >
                        維持暫時更改
                     </button>
                     <button 
                         onClick={handlePromptSaveList}
                         className="flex-1 py-2 text-xs font-bold text-white bg-violet-400 hover:bg-violet-500 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1"
                     >
                         <Save className="w-3.5 h-3.5" /> 立即變更儲存
                     </button>
                </div>
            </div>
        )}

        {/* Filters: Distance and Price */}
        <div className="flex justify-center items-center gap-2 mb-3 px-1">
            {/* Price Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm shadow-pink-100 border border-pink-100 text-slate-600">
                <Banknote className="w-3.5 h-3.5 text-pink-300" />
                <label className="text-xs font-medium whitespace-nowrap text-slate-400">預算</label>
                <select 
                    value={priceLevel}
                    onChange={(e) => setPriceLevel(e.target.value)}
                    className="bg-transparent text-xs text-rose-500 font-bold outline-none cursor-pointer max-w-[70px]"
                    disabled={isSpinning || isLoading}
                >
                    <option value="">不限</option>
                    <option value="inexpensive">$平價</option>
                    <option value="moderate">$中價</option>
                    <option value="expensive">$高價</option>
                    <option value="very_expensive">$奢華</option>
                </select>
            </div>

            {/* Distance Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm shadow-pink-100 border border-pink-100 text-slate-600">
                <Ruler className="w-3.5 h-3.5 text-pink-300" />
                <label className="text-xs font-medium whitespace-nowrap text-slate-400">範圍</label>
                <select 
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="bg-transparent text-xs text-rose-500 font-bold outline-none cursor-pointer"
                    disabled={isSpinning || isLoading}
                >
                    <option value={100}>100 m</option>
                    <option value={300}>300 m</option>
                    <option value={500}>500 m</option>
                    <option value={1000}>1 km</option>
                    <option value={2000}>2 km</option>
                    <option value={3000}>3 km</option>
                </select>
            </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
                onClick={handleNearBySearch}
                disabled={isSpinning || isLoading || isAutoFetching}
                className="col-span-1 flex flex-col items-center justify-center p-3 bg-white text-slate-600 rounded-3xl border border-white hover:border-sky-200 hover:bg-sky-50 active:scale-95 transition-all shadow-sm shadow-sky-100 group"
            >
                <div className="bg-sky-100 p-2.5 rounded-full mb-1 group-hover:bg-sky-200 transition-colors">
                    <PawPrint className="w-5 h-5 text-sky-500" />
                </div>
                <span className="font-bold text-xs text-slate-500 group-hover:text-sky-500">定位附近</span>
            </button>

            <button 
                onClick={loadFavoritesToWheel}
                disabled={isSpinning || isLoading || isAutoFetching}
                className="col-span-1 flex flex-col items-center justify-center p-3 bg-white text-slate-600 rounded-3xl border border-white hover:border-rose-200 hover:bg-rose-50 active:scale-95 transition-all shadow-sm shadow-rose-100 group"
            >
                <div className="bg-rose-100 p-2.5 rounded-full mb-1 group-hover:bg-rose-200 transition-colors">
                    <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <span className="font-bold text-xs text-slate-500 group-hover:text-rose-500">轉我的最愛</span>
            </button>

             <button 
                onClick={() => {
                    setEditingList(null); // Reset to list view
                    setIsCustomModalOpen(true);
                }}
                disabled={isSpinning || isLoading || isAutoFetching}
                className="col-span-1 flex flex-col items-center justify-center p-3 bg-white text-slate-600 rounded-3xl border border-white hover:border-violet-200 hover:bg-violet-50 active:scale-95 transition-all shadow-sm shadow-violet-100 group"
            >
                <div className="bg-violet-100 p-2.5 rounded-full mb-1 group-hover:bg-violet-200 transition-colors">
                    <List className="w-5 h-5 text-violet-500" />
                </div>
                <span className="font-bold text-xs text-slate-500 group-hover:text-violet-500">自訂清單</span>
            </button>
        </div>



        {/* Region Selector */}
        <div className="bg-white p-5 rounded-3xl border border-white mb-6 shadow-sm shadow-pink-100 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-2 opacity-10 rotate-12">
                <Map className="w-32 h-32 text-pink-400" />
            </div>
            <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold relative z-10">
                <Map className="w-5 h-5 text-pink-400" />
                <span>探索其他地區</span>
            </div>
            <div className="flex gap-2 mb-3 relative z-10">
                <select 
                    value={selectedCity}
                    onChange={(e) => {
                        setSelectedCity(e.target.value);
                        // Reset district to first of new city
                        const newCity = TAIWAN_CITIES.find(c => c.name === e.target.value);
                        if (newCity) setSelectedDistrict(newCity.districts[0]);
                    }}
                    className="flex-1 p-2.5 rounded-xl border border-pink-100 bg-pink-50/50 text-slate-600 text-sm focus:ring-2 focus:ring-pink-200 outline-none hover:bg-pink-50 transition-colors cursor-pointer"
                >
                    {TAIWAN_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-pink-100 bg-pink-50/50 text-slate-600 text-sm focus:ring-2 focus:ring-pink-200 outline-none hover:bg-pink-50 transition-colors cursor-pointer"
                >
                    {getDistrictOptions().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <button 
                onClick={handleRegionSearch}
                disabled={isSpinning || isLoading || isAutoFetching}
                className="w-full py-3 bg-gradient-to-r from-pink-300 to-rose-300 text-white rounded-xl text-sm font-bold hover:from-pink-400 hover:to-rose-400 active:scale-95 transition-all shadow-md shadow-pink-200 relative z-10"
            >
                搜尋此地區
            </button>
        </div>



        {/* Recommendation List - DIRECTLY BELOW WINNER CARD */}
        {(recommendations.length > 0 || isAutoFetching) && (
            <div className="mt-4 mb-8" id="recommendation-list">
                <h3 className="font-bold text-lg text-slate-600 mb-3 flex items-center gap-2 pl-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {mode === 'NEARBY' ? `附近推薦 (${getDistanceLabel(searchRadius)})` : 
                     mode === 'REGION' ? '地區精選' : 
                     (mode === 'CUSTOM' || mode === 'GENERIC' || mode === 'PRESET') ? `📍 附近 ${getDistanceLabel(searchRadius)} 關於「${selectedWinner?.name || ''}」` :
                     '收藏清單'}
                </h3>
                
                <div className="bg-white rounded-3xl shadow-sm shadow-pink-100 border border-white divide-y divide-slate-50 overflow-hidden">
                    {/* Inline Loading State */}
                    {isAutoFetching && (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-300">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-pink-300" />
                            <span className="text-sm font-medium">貓咪正在跑地圖...</span>
                        </div>
                    )}

                    {/* List Items */}
                    {!isAutoFetching && recommendations.map((item) => (
                        <div key={item.id} className={`p-4 flex justify-between items-center hover:bg-pink-50 transition-colors group ${selectedWinner?.id === item.id ? 'bg-pink-50' : ''}`}>
                            <div className="flex-1 pr-3">
                                <div className="font-bold text-slate-600 text-sm mb-1 group-hover:text-rose-500 transition-colors">{item.name}</div>
                                <div className="text-xs text-slate-400 truncate group-hover:text-slate-500">{item.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={getMapLink(item)}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-300 hover:text-white transition-all shadow-sm"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Favorites List Section (Pocket List) - Show only if we are NOT spinning favorites */}
        {mode !== 'FAVORITES' && (
          <div className="mt-8 pt-6">
              <h3 className="font-bold text-lg text-slate-600 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300 fill-current" />
                  我的最愛
              </h3>
              
              {favorites.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 bg-white rounded-3xl border border-slate-50 text-sm shadow-sm shadow-slate-100">
                      <Cat className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                      還沒有收藏的餐廳<br/>
                      <span className="text-xs mt-1 block">看到喜歡的記得按愛心收進我的最愛</span>
                  </div>
              ) : (
                  <div className="grid gap-3">
                      {favorites.map(fav => (
                          <div key={fav.id} className="bg-white p-3 rounded-2xl shadow-sm shadow-slate-100 border border-slate-50 flex justify-between items-center group hover:border-pink-200 transition-all hover:-translate-y-0.5">
                              <div className="flex-1 min-w-0 mr-2">
                                  <div className="font-bold text-slate-600 truncate">{fav.name}</div>
                                  <div className="text-xs text-slate-400 truncate">{fav.description}</div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                  <a href={getMapLink(fav)} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:bg-sky-100 hover:text-sky-500 p-2 rounded-xl transition-colors">
                                      <MapPin className="w-4 h-4" />
                                  </a>
                                  <button 
                                      onClick={() => removeFromFavorites(fav.id)}
                                      className="text-slate-300 hover:text-rose-400 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        )}
        
        {/* Reset Button */}
         <div className="mt-10 text-center pb-8">
            <button onClick={handleReset} className="text-slate-400 text-sm hover:text-rose-400 underline decoration-slate-200 underline-offset-4 transition-colors flex items-center justify-center gap-1 mx-auto">
                <Coffee className="w-3 h-3" />
                回到預設分類
            </button>
         </div>

        {/* CUSTOM LIST MODAL */}
        {isCustomModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-slate-600/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsCustomModalOpen(false)}
                />
                
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up border-4 border-white">
                    {/* Modal Header */}
                    <div className="bg-violet-50 p-4 flex justify-between items-center text-slate-600">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            {editingList ? (
                                <>
                                    <Edit className="w-5 h-5 text-violet-400" /> 編輯菜單
                                </>
                            ) : (
                                <>
                                    <List className="w-5 h-5 text-violet-400" /> 自訂菜單
                                </>
                            )}
                        </h2>
                        <button onClick={() => setIsCustomModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors bg-white rounded-full p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 overflow-y-auto flex-1 bg-white">
                        {editingList ? (
                            // EDITOR VIEW
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">清單名稱</label>
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="例如：飲料店、週末大餐"
                                        className="w-full p-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-violet-100 outline-none text-slate-600 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">
                                        選項內容 <span className="text-xs font-normal text-slate-300 ml-1">(一行一個)</span>
                                    </label>
                                    <textarea 
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        placeholder={`珍珠奶茶\n綠茶\n紅茶拿鐵`}
                                        className="w-full p-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-violet-100 outline-none h-48 text-slate-600 resize-none leading-relaxed bg-slate-50"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => setEditingList(null)}
                                        className="flex-1 py-3.5 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button 
                                        onClick={saveCustomList}
                                        className="flex-1 py-3.5 bg-violet-300 text-white font-bold rounded-2xl hover:bg-violet-400 shadow-lg shadow-violet-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Save className="w-4 h-4" /> 儲存
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // LIST SELECTOR VIEW
                            <div className="space-y-3">
                                {customLists.length === 0 ? (
                                    <div className="text-center py-12 text-slate-300">
                                        <Cat className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                                        <p>還沒有自訂菜單</p>
                                        <p className="text-xs mt-1">建立屬於你的專屬輪盤吧！</p>
                                    </div>
                                ) : (
                                    customLists.map(list => (
                                        <div key={list.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-violet-200 hover:bg-white transition-all">
                                            <div 
                                                className="flex-1 cursor-pointer" 
                                                onClick={() => loadCustomListToWheel(list)}
                                            >
                                                <h3 className="font-bold text-slate-600">{list.name}</h3>
                                                <p className="text-xs text-slate-400">{list.items.length} 個選項</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => openEditList(list)}
                                                    className="p-2 text-slate-300 hover:text-violet-400 hover:bg-violet-50 rounded-xl transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => deleteCustomList(list.id, e)}
                                                    className="p-2 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => loadCustomListToWheel(list)}
                                                    className="ml-1 p-2 bg-white text-slate-400 rounded-xl hover:bg-violet-400 hover:text-white transition-colors shadow-sm"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                <button 
                                    onClick={openNewListEditor}
                                    className="w-full py-3.5 mt-4 border-2 border-dashed border-violet-200 text-violet-300 rounded-2xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-500 transition-all flex items-center justify-center gap-2 font-bold"
                                >
                                    <Plus className="w-5 h-5" /> 建立新菜單
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ITEM EDITING MODAL */}
        {isItemEditingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-slate-600/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsItemEditingModalOpen(false)}
                />
                
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-4 border-white animate-fade-in-up">
                    <div className="bg-pink-50 p-5 flex justify-between items-center text-slate-600">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Edit className="w-5 h-5 text-pink-400" /> 編輯選項名稱
                        </h2>
                        <button onClick={() => setIsItemEditingModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors bg-white rounded-full p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">選項文字名稱</label>
                            <input 
                                type="text"
                                value={editingItemName}
                                onChange={(e) => setEditingItemName(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-pink-200 outline-none text-slate-600 bg-slate-50 font-bold"
                                placeholder="例如：紅豆餅、炸雞排"
                                maxLength={20}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">備註 / 描述 (選填)</label>
                            <input 
                                type="text"
                                value={editingItemDesc}
                                onChange={(e) => setEditingItemDesc(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-pink-200 outline-none text-slate-600 bg-slate-50 text-sm"
                                placeholder="例如：超好吃的爆漿紅豆餅"
                                maxLength={50}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => setIsItemEditingModalOpen(false)}
                                className="flex-1 py-3.5 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleSaveEditedItem}
                                className="flex-1 py-3.5 bg-pink-400 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-100 transition-all text-sm flex items-center justify-center gap-1 active:scale-95"
                            >
                                <Save className="w-4 h-4" /> 儲存變更
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* SAVE CHANGED LIST MODAL */}
        {isSaveModifiedModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-slate-600/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSaveModifiedModalOpen(false)}
                />
                
                <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-4 border-white animate-fade-in-up">
                    <div className="bg-violet-50 p-5 flex justify-between items-center text-slate-600">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <List className="w-5 h-5 text-violet-400" /> 儲存為自訂清單
                        </h2>
                        <button onClick={() => setIsSaveModifiedModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors bg-white rounded-full p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                        <p className="text-xs text-slate-400">目前清單包含 {wheelItems.length} 個選項。請為此清單命名，它會永久保存在您的自訂菜單中！</p>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">自訂歌單名稱</label>
                            <input 
                                type="text"
                                value={saveListName}
                                onChange={(e) => setSaveListName(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-violet-200 outline-none text-slate-600 bg-slate-50 font-bold"
                                placeholder="例如：我的下午茶清單"
                                maxLength={30}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => setIsSaveModifiedModalOpen(false)}
                                className="flex-1 py-3.5 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleConfirmSaveModifiedList}
                                className="flex-1 py-3.5 bg-violet-400 hover:bg-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-violet-100 transition-all text-sm flex items-center justify-center gap-1 active:scale-95"
                            >
                                <Save className="w-4 h-4" /> 儲存清單
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;