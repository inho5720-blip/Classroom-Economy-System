import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Ticket,
  Gift,
  CheckCircle,
  AlertCircle,
  History,
  Lock,
  Gavel,
  Clock,
  User,
  ArrowUpRight,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShopItem, AuctionItem } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

export const ShopView: React.FC = () => {
  const {
    currentUser,
    users,
    shopItems,
    shopOrders,
    auctions,
    auctionBids,
    purchaseShopItem,
    placeBid,
    createShopItem,
    updateShopItem,
    deleteShopItem,
    createAuction,
    closeAuction,
    deleteAuction,
    triggerCelebration,
  } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'fixed' | 'auction'>('fixed');
  const [filterCategory, setFilterCategory] = useState<'all' | ShopItem['category']>('all');
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null);

  // Custom bid input modal / state for specific auction
  const [biddingAuctionId, setBiddingAuctionId] = useState<string | null>(null);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [viewHistoryAuctionId, setViewHistoryAuctionId] = useState<string | null>(null);

  // Teacher Modals for Shop Items
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopDesc, setNewShopDesc] = useState('');
  const [newShopPrice, setNewShopPrice] = useState(200);
  const [newShopStock, setNewShopStock] = useState(10);
  const [newShopCategory, setNewShopCategory] = useState<ShopItem['category']>('privilege');
  const [newShopIcon, setNewShopIcon] = useState('🎟️');

  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopDesc, setEditShopDesc] = useState('');
  const [editShopPrice, setEditShopPrice] = useState(200);
  const [editShopStock, setEditShopStock] = useState(10);
  const [editShopCategory, setEditShopCategory] = useState<ShopItem['category']>('privilege');
  const [editShopIcon, setEditShopIcon] = useState('🎟️');

  // Teacher Modals for Auctions
  const [showAddAuctionModal, setShowAddAuctionModal] = useState(false);
  const [newAuctionTitle, setNewAuctionTitle] = useState('');
  const [newAuctionDesc, setNewAuctionDesc] = useState('');
  const [newAuctionStartPrice, setNewAuctionStartPrice] = useState(500);
  const [newAuctionMinStep, setNewAuctionMinStep] = useState(50);
  const [newAuctionDuration, setNewAuctionDuration] = useState(72);
  const [newAuctionIcon, setNewAuctionIcon] = useState('👑');
  const [newAuctionCategory, setNewAuctionCategory] = useState<AuctionItem['category']>('privilege');

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBuy = (item: ShopItem) => {
    const res = purchaseShopItem(item.id, currentUser.id);
    showToast(res.message, !res.success);
    if (res.success) {
      triggerCelebration();
    }
  };

  // Teacher Handlers for Shop Items
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    createShopItem({
      name: newShopName.trim(),
      description: newShopDesc.trim(),
      price: Number(newShopPrice),
      stock: Number(newShopStock),
      category: newShopCategory,
      icon: newShopIcon || '🎟️',
      isActive: true,
    });

    showToast(`'${newShopName}' 상품이 새로 등록되었습니다!`);
    setShowAddModal(false);
    setNewShopName('');
    setNewShopDesc('');
    setNewShopPrice(200);
    setNewShopStock(10);
  };

  // Teacher Handlers for Auctions
  const handleCreateAuctionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuctionTitle.trim()) return;

    createAuction({
      title: newAuctionTitle.trim(),
      description: newAuctionDesc.trim() || '학급 특권 경매 아이템입니다.',
      startPrice: Number(newAuctionStartPrice),
      minBidStep: Number(newAuctionMinStep),
      durationHours: Number(newAuctionDuration),
      icon: newAuctionIcon || '👑',
      category: newAuctionCategory,
    });

    showToast(`'${newAuctionTitle}' 특권 경매가 새로 등록되었습니다!`);
    setShowAddAuctionModal(false);
    setNewAuctionTitle('');
    setNewAuctionDesc('');
    setNewAuctionStartPrice(500);
    setNewAuctionMinStep(50);
  };

  const handleOpenEdit = (item: ShopItem) => {
    setEditingItem(item);
    setEditShopName(item.name);
    setEditShopDesc(item.description);
    setEditShopPrice(item.price);
    setEditShopStock(item.stock);
    setEditShopCategory(item.category);
    setEditShopIcon(item.icon);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editShopName.trim()) return;

    updateShopItem(editingItem.id, {
      name: editShopName.trim(),
      description: editShopDesc.trim(),
      price: Number(editShopPrice),
      stock: Math.max(0, Number(editShopStock)),
      category: editShopCategory,
      icon: editShopIcon || '🎟️',
    });

    showToast(`'${editShopName}' 상품 정보 및 수량이 변경되었습니다.`);
    setEditingItem(null);
  };

  const handleQuickStock = (itemId: string, delta: number) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    updateShopItem(itemId, { stock: newStock });
    showToast(`${item.name} 재고가 ${newStock}개로 업데이트되었습니다.`);
  };

  const handleDeleteItem = (item: ShopItem) => {
    if (confirm(`'${item.name}' 상품을 삭제하시겠습니까?`)) {
      deleteShopItem(item.id);
      showToast(`'${item.name}' 상품이 삭제되었습니다.`);
    }
  };

  const handleQuickBid = (auction: AuctionItem, increment: number) => {
    const nextBid =
      auction.currentHighestBidderId === null
        ? auction.startPrice
        : auction.currentHighestBid + increment;

    const res = placeBid(auction.id, currentUser.id, nextBid);
    showToast(res.message, !res.success);
  };

  const handleCustomBidSubmit = (auction: AuctionItem) => {
    if (!customBidAmount || customBidAmount <= 0) {
      showToast('올바른 입찰 금액을 입력해주세요.', true);
      return;
    }
    const res = placeBid(auction.id, currentUser.id, customBidAmount);
    showToast(res.message, !res.success);
    if (res.success) {
      setBiddingAuctionId(null);
    }
  };

  const filteredItems = shopItems.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const myOrders = shopOrders.filter((o) => o.userId === currentUser.id);

  // Format remaining time
  const getTimeRemaining = (endsAt: string) => {
    const total = new Date(endsAt).getTime() - Date.now();
    if (total <= 0) return '경매 마감';
    const hours = Math.floor(total / (1000 * 60 * 60));
    const minutes = Math.floor((total / 1000 / 60) % 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간 남음`;
    }
    return `${hours}시간 ${minutes}분 남음`;
  };

  const ongoingAuctions = auctions.filter((a) => a.status === 'ongoing');
  const endedAuctions = auctions.filter((a) => a.status === 'ended');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold transition flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toast.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.isError ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-amber-50/40 border border-pink-200/80 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-3xl shadow-2xs">
            {activeTab === 'fixed' ? '🏪' : '👑'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-850">
                {activeTab === 'fixed' ? '학급 행복 상점' : '학급 특권 실시간 경매장'}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  activeTab === 'fixed'
                    ? 'bg-pink-100 text-pink-800 border-pink-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {activeTab === 'fixed' ? '고정가 즉시 구매' : '실시간 최고가 경쟁'}
              </span>
              {isSupabaseConfigured && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Supabase DB 동기화 중
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'fixed'
                ? '원하는 특권 쿠폰과 간식을 정가에 즉시 구매하고 바로 교표로 사용하세요.'
                : '선생님과의 1:1 점심 식사, 일주일 DJ 독점권 등 희귀 특권에 실시간으로 입찰하세요!'}
            </p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>내 보유 포인트:</span>
          <strong className="text-amber-700 font-mono font-black text-sm">
            {currentUser.points.toLocaleString()} P
          </strong>
        </div>
      </div>

      {/* Main Mode Tabs: [고정가 일반 상점] vs [실시간 경매장] */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-md">
        <button
          onClick={() => setActiveTab('fixed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'fixed'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-pink-500" />
          <span>🏪 고정가 일반 상점</span>
        </button>
        <button
          onClick={() => setActiveTab('auction')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'auction'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gavel className="w-4 h-4 text-amber-900" />
          <span>👑 실시간 특권 경매장</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
            {ongoingAuctions.length}
          </span>
        </button>
      </div>

      {/* ===================== 1. 고정가 일반 상점 탭 ===================== */}
      {activeTab === 'fixed' && (
        <div className="space-y-6">
          {/* Teacher Quick Management Bar */}
          {isTeacher && (
            <div className="p-4 rounded-3xl bg-indigo-50/90 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  🏪
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-950">선생님 상점 관리 모드</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      총 {shopItems.length}개 상품
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    새 상품을 등록하거나 각 상품의 재고 수량(+, -)을 즉시 변경하고 삭제할 수 있습니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> 새 상품 등록하기
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: '전체 상품' },
              { id: 'privilege', label: '🎟️ 면제 & 특권 쿠폰' },
              { id: 'fun', label: '🎶 자유 & 엔터' },
              { id: 'snack', label: '🍫 간식 세트' },
              { id: 'item', label: '🛡️ 아이템 & 학용품' },
            ].map((tab) => {
              const isActive = filterCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                    isActive
                      ? 'bg-pink-500 text-white border-pink-600 shadow-sm shadow-pink-500/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-pink-50/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const canAfford = currentUser.points >= item.price;
              const isOutOfStock = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-pink-200 hover:shadow-md transition duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-amber-50 border border-pink-100 flex items-center justify-center text-3xl shadow-2xs">
                        {item.icon}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-amber-700 text-lg block">
                          {item.price.toLocaleString()} P
                        </span>
                        <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-500 font-black' : 'text-slate-400'}`}>
                          {isOutOfStock ? '품절 (재고 0개)' : `재고 ${item.stock}개 남음`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h3 className="font-bold text-base text-slate-850">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[32px]">{item.description}</p>
                    </div>
                  </div>

                  {/* Teacher Quick Stock & Edit Controller */}
                  {isTeacher && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span>재고 조절: <strong className="font-mono text-slate-900">{item.stock}개</strong></span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickStock(item.id, -1)}
                            disabled={item.stock <= 0}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickStock(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleQuickStock(item.id, 5)}
                            className="px-1.5 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" /> 정보/수량 수정
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 즉시 사용 처리
                    </span>

                    <button
                      disabled={!canAfford || isOutOfStock}
                      onClick={() => handleBuy(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : canAfford
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {isOutOfStock ? (
                        '품절'
                      ) : canAfford ? (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> 구매하기
                        </>
                      ) : (
                        '포인트 부족'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My Purchase History */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-pink-600" />
                <h3 className="font-bold text-sm text-slate-850">내 상점 구매 & 즉시 사용 기록</h3>
              </div>
              <span className="text-xs text-slate-400">{myOrders.length}건 구매함</span>
            </div>

            {myOrders.length > 0 ? (
              <div className="space-y-2">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                        🎟️
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{order.itemName}</div>
                        <div className="text-[10px] text-slate-400">
                          구매일: {new Date(order.purchasedAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-700">
                        -{order.paidPrice.toLocaleString()} P
                      </span>
                      <div className="text-[10px] text-emerald-700 font-semibold">선생님 확인 완료</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                아직 구매한 상점 아이템이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== 2. 실시간 특권 경매장 탭 ===================== */}
      {activeTab === 'auction' && (
        <div className="space-y-6">
          {/* Ongoing Auctions Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-850">
                  🔥 실시간 진행 중인 경매 ({ongoingAuctions.length}건)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  상위 입찰 시 이전 입찰자의 포인트는 전자 통장으로 즉시 100% 자동 환불됩니다.
                </span>
                {isTeacher && (
                  <button
                    onClick={() => setShowAddAuctionModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> 새 특권 경매 등록
                  </button>
                )}
              </div>
            </div>

            {ongoingAuctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ongoingAuctions.map((auction) => {
                  const highestBidder = users.find((u) => u.id === auction.currentHighestBidderId);
                  const isMyBidHighest = auction.currentHighestBidderId === currentUser.id;
                  const minNextBid =
                    auction.currentHighestBidderId === null
                      ? auction.startPrice
                      : auction.currentHighestBid + auction.minBidStep;
                  const canAffordMin = currentUser.points >= minNextBid;
                  const timeStr = getTimeRemaining(auction.endsAt);

                  // Auction bids for this item
                  const itemBids = auctionBids.filter((b) => b.auctionId === auction.id);

                  return (
                    <div
                      key={auction.id}
                      className={`bg-white border-2 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5 transition duration-200 relative overflow-hidden ${
                        isMyBidHighest
                          ? 'border-amber-400 shadow-amber-500/10 ring-2 ring-amber-300/50'
                          : 'border-slate-200/80 hover:border-amber-300'
                      }`}
                    >
                      {/* Top Ribbon if My Bid is Highest */}
                      {isMyBidHighest && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-400 text-amber-950 font-black text-[10px] px-3.5 py-1 rounded-bl-2xl flex items-center gap-1 shadow-2xs">
                          <Crown className="w-3.5 h-3.5" /> 내가 1위 최고 입찰자!
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Header: Icon & Time */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-3xl shadow-2xs">
                            {auction.icon}
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>{timeStr}</span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-black text-base text-slate-900 leading-snug">
                            {auction.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {auction.description}
                          </p>
                        </div>

                        {/* Current Highest Bid Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>현재 최고 입찰가</span>
                            <span className="font-semibold text-slate-400">
                              시작가 {auction.startPrice.toLocaleString()} P (단위 +{auction.minBidStep}P)
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black font-mono text-amber-700">
                              {auction.currentHighestBid.toLocaleString()} P
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              {highestBidder ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-slate-800">
                                  <span>{highestBidder.avatarEmoji}</span>
                                  <span>{highestBidder.name}</span>
                                  {isMyBidHighest && (
                                    <span className="text-[10px] text-amber-700 font-extrabold">(나)</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-normal">아직 입찰 없음 (시작가부터 입찰 가능)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area: Quick Bid + Custom Bid Buttons */}
                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() =>
                              setViewHistoryAuctionId(
                                viewHistoryAuctionId === auction.id ? null : auction.id
                              )
                            }
                            className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>입찰 내역 ({itemBids.length})</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-xs text-right text-slate-400">
                            다음 최소 입찰가:{' '}
                            <strong className="text-amber-700 font-mono font-bold">
                              {minNextBid.toLocaleString()} P
                            </strong>
                          </div>
                        </div>

                        {/* Quick Bid Button or My Status */}
                        <div className="flex items-center gap-2">
                          {isMyBidHighest ? (
                            <div className="w-full py-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs text-center flex items-center justify-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-700" />
                              현재 최고가 입찰 중입니다! 다른 친구가 입찰할 때까지 대기하세요.
                            </div>
                          ) : (
                            <>
                              <button
                                disabled={!canAffordMin}
                                onClick={() => handleQuickBid(auction, auction.minBidStep)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                  canAffordMin
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold shadow-amber-400/20'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                }`}
                              >
                                <Gavel className="w-3.5 h-3.5" />
                                <span>
                                  {minNextBid.toLocaleString()} P 즉시 입찰 (+{auction.minBidStep}P)
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  setBiddingAuctionId(auction.id);
                                  setCustomBidAmount(minNextBid);
                                }}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                              >
                                금액 직접 입력
                              </button>
                            </>
                          )}
                        </div>

                        {/* Custom Bid Modal Inline */}
                        {biddingAuctionId === auction.id && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-2.5 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                              <span>직접 입찰할 포인트 설정</span>
                              <button
                                onClick={() => setBiddingAuctionId(null)}
                                className="text-slate-400 hover:text-slate-600 text-[11px]"
                              >
                                취소
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={minNextBid}
                                step={auction.minBidStep}
                                value={customBidAmount}
                                onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                                className="flex-1 px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                              />
                              <button
                                onClick={() => handleCustomBidSubmit(auction)}
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer"
                              >
                                입찰 확정
                              </button>
                            </div>
                            <span className="text-[10px] text-amber-800">
                              * 최소 {minNextBid.toLocaleString()}P 이상 가능 (보유: {currentUser.points.toLocaleString()}P)
                            </span>
                          </div>
                        )}

                        {/* Teacher Administration Controls */}
                        {isTeacher && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => {
                                if (confirm(`'${auction.title}' 경매를 지금 즉시 낙찰 마감하시겠습니까?`)) {
                                  const res = closeAuction(auction.id);
                                  showToast(res.message, !res.success);
                                }
                              }}
                              className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 cursor-pointer transition"
                            >
                              조기 낙찰 확정
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `'${auction.title}' 경매를 취소/삭제하시겠습니까? (최고 입찰자가 있을 시 포인트가 전액 환불됩니다)`
                                  )
                                ) {
                                  const res = deleteAuction(auction.id);
                                  showToast(res.message, !res.success);
                                }
                              }}
                              className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 cursor-pointer transition"
                            >
                              취소/삭제
                            </button>
                          </div>
                        )}

                        {/* Bid History Dropdown */}
                        {viewHistoryAuctionId === auction.id && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in">
                            <div className="font-bold text-slate-700 flex items-center justify-between">
                              <span>실시간 입찰 로그</span>
                              <span className="text-[10px] text-slate-400">최신순</span>
                            </div>

                            {itemBids.length > 0 ? (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {itemBids.map((bid) => {
                                  const u = users.find((usr) => usr.id === bid.userId);
                                  const bidDate = new Date(bid.bidAt);
                                  const timeFormat = `${bidDate.getMonth() + 1}/${bidDate.getDate()} ${String(
                                    bidDate.getHours()
                                  ).padStart(2, '0')}:${String(bidDate.getMinutes()).padStart(2, '0')}`;

                                  return (
                                    <div
                                      key={bid.id}
                                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-[11px]"
                                    >
                                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                        <span>{u?.avatarEmoji || '👤'}</span>
                                        <span>{u?.name || '익명'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-amber-700">
                                          {bid.amount.toLocaleString()} P
                                        </span>
                                        <span className="text-slate-400 text-[10px]">{timeFormat}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-slate-400 text-center py-2 text-[11px]">
                                아직 입찰 내역이 없습니다.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-xs text-slate-400 space-y-3 shadow-2xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl">
                  🏛️
                </div>
                <div className="font-extrabold text-slate-800 text-base">현재 진행 중인 경매가 없습니다.</div>
                <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                  선생님께서 새로운 학급 특권 경매를 등록하면 여기에 실시간으로 표시됩니다.
                </p>
                {isTeacher && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowAddAuctionModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                    >
                      <Plus className="w-4 h-4" /> 새 특권 경매 등록하기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ended / Closed Auctions Section */}
          {endedAuctions.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-850">🏆 마감된 경매 & 최종 낙찰자</h3>
                </div>
                <span className="text-xs text-slate-400">{endedAuctions.length}건 마감됨</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {endedAuctions.map((auction) => {
                  const winner = users.find((u) => u.id === auction.winnerId);
                  return (
                    <div
                      key={auction.id}
                      className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                          {auction.icon}
                        </div>
                        <div>
                          <div className="font-bold text-slate-850 line-clamp-1">{auction.title}</div>
                          <div className="text-[10px] text-slate-400">
                            낙찰자: {winner ? `${winner.avatarEmoji} ${winner.name}` : '유찰됨'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-purple-700 block">
                          {auction.winningPrice ? `${auction.winningPrice.toLocaleString()} P` : '0 P'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          최종 낙찰 완료
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teacher Modal: Add New Shop Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                  🏪
                </div>
                <h3 className="font-black text-base text-slate-850">새 일반 상점 상품 등록</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 🎮 태블릿 자유시간 15분권, 🍫 달콤 간식 보물상자"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 상세 설명 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 점심시간 또는 자율 활동 시간에 태블릿 PC로 원하는 학습 게임을 즐깁니다."
                  value={newShopDesc}
                  onChange={(e) => setNewShopDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    가격 (포인트 P) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={newShopPrice}
                    onChange={(e) => setNewShopPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    초기 수량 (재고 개수) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={newShopStock}
                    onChange={(e) => setNewShopStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newShopCategory}
                    onChange={(e) => setNewShopCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="privilege">특권 & 면제 쿠폰</option>
                    <option value="snack">간식 & 먹거리</option>
                    <option value="fun">재미 & 엔터테인먼트</option>
                    <option value="item">학급 실물 아이템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이모지
                  </label>
                  <select
                    value={newShopIcon}
                    onChange={(e) => setNewShopIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="🎟️">🎟️ 특권 티켓</option>
                    <option value="🎮">🎮 게임 / 태블릿</option>
                    <option value="🎵">🎵 음악 / 노래</option>
                    <option value="🍫">🍫 초콜릿 / 젤리</option>
                    <option value="🍬">🍬 달콤 사탕</option>
                    <option value="👥">👥 짝꿍 / 자리</option>
                    <option value="🍱">🍱 급식 1등</option>
                    <option value="✏️">✏️ 고급 학용품</option>
                    <option value="🎁">🎁 보물 상자</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  상품 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Modal: Edit Existing Shop Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                  ✏️
                </div>
                <h3 className="font-black text-base text-slate-850">상품 정보 & 수량(재고) 수정</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  상품 상세 설명 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editShopDesc}
                  onChange={(e) => setEditShopDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    가격 (포인트 P) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={editShopPrice}
                    onChange={(e) => setNewShopPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    수량 (재고 개수) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={editShopStock}
                    onChange={(e) => setEditShopStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={editShopCategory}
                    onChange={(e) => setEditShopCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="privilege">특권 & 면제 쿠폰</option>
                    <option value="snack">간식 & 먹거리</option>
                    <option value="fun">재미 & 엔터테인먼트</option>
                    <option value="item">학급 실물 아이템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이모지
                  </label>
                  <select
                    value={editShopIcon}
                    onChange={(e) => setEditShopIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="🎟️">🎟️ 특권 티켓</option>
                    <option value="🎮">🎮 게임 / 태블릿</option>
                    <option value="🎵">🎵 음악 / 노래</option>
                    <option value="🍫">🍫 초콜릿 / 젤리</option>
                    <option value="🍬">🍬 달콤 사탕</option>
                    <option value="👥">👥 짝꿍 / 자리</option>
                    <option value="🍱">🍱 급식 1등</option>
                    <option value="✏️">✏️ 고급 학용품</option>
                    <option value="🎁">🎁 보물 상자</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  수정 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Modal: Add New Auction */}
      {showAddAuctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                  👑
                </div>
                <h3 className="font-black text-base text-slate-850">새 실시간 특권 경매 등록</h3>
              </div>
              <button
                onClick={() => setShowAddAuctionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAuctionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  경매 특권/상품 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 👑 [초특급] 선생님과 1:1 맛있는 점심 식사 & 상담권"
                  value={newAuctionTitle}
                  onChange={(e) => setNewAuctionTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  경매 상세 설명 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 원하는 점심 메뉴와 함께 선생님과 단둘이 오붓하게 진로와 학교생활을 상담할 수 있는 최고의 특권!"
                  value={newAuctionDesc}
                  onChange={(e) => setNewAuctionDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시작가 (P) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={newAuctionStartPrice}
                    onChange={(e) => setNewAuctionStartPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    최소 호가 단위 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={newAuctionMinStep}
                    onChange={(e) => setNewAuctionMinStep(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    경매 기간 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAuctionDuration}
                    onChange={(e) => setNewAuctionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value={1}>1시간 (초스피드)</option>
                    <option value={3}>3시간 (당일)</option>
                    <option value={24}>24시간 (1일)</option>
                    <option value={48}>48시간 (2일)</option>
                    <option value={72}>72시간 (3일)</option>
                    <option value={168}>1주일 (7일)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={newAuctionCategory}
                    onChange={(e) => setNewAuctionCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="privilege">👑 최고 특권 & 권한</option>
                    <option value="experience">🎒 특별 활동 / 체험권</option>
                    <option value="special">✨ 레어 유니크 특혜</option>
                    <option value="item">🎁 실물 한정판 아이템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이모지
                  </label>
                  <select
                    value={newAuctionIcon}
                    onChange={(e) => setNewAuctionIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="👑">👑 특권 / 권한</option>
                    <option value="🍕">🍕 점심 / 식사</option>
                    <option value="🎧">🎧 DJ / 선곡권</option>
                    <option value="💺">💺 명당 자리 독점</option>
                    <option value="🎬">🎬 영화 / 영상 선택권</option>
                    <option value="🛡️">🛡️ 숙제 방어 쉴드</option>
                    <option value="🎟️">🎟️ 프리패스 티켓</option>
                    <option value="🎁">🎁 시크릿 선물상자</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAuctionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  경매 등록 시작
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
