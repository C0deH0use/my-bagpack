import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, PackingItem } from './types';
import { ALL_CATEGORY, ALL_CATEGORY_ID, CATEGORIES } from './data/categories';
import { usePackingList, type ItemFormValues } from './hooks/usePackingList';
import { normalizeItems } from './lib/items';
import { playSound } from './lib/sounds';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { ProgressCard } from './components/ProgressCard';
import { ItemCard } from './components/ItemCard';
import { EmptyState } from './components/EmptyState';
import { ItemModal } from './components/ItemModal';
import { CatalogPickerModal } from './components/CatalogPickerModal';
import { CatalogFilterBar } from './components/CatalogFilterBar';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfettiCanvas, type ConfettiHandle } from './components/ConfettiCanvas';

export default function App() {
  const [currentCategoryId, setCurrentCategoryId] = useState('lato');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string | null>(null);
  const [catalogSortAZ, setCatalogSortAZ] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [celebration, setCelebration] = useState<Category | null>(null);
  const confettiRef = useRef<ConfettiHandle>(null);

  const list = usePackingList();

  const isCatalog = currentCategoryId === ALL_CATEGORY_ID;
  const currentCategory =
    CATEGORIES.find((c) => c.id === currentCategoryId) ??
    (currentCategoryId === ALL_CATEGORY_ID ? ALL_CATEGORY : CATEGORIES[0]);

  const byCategory = (items: PackingItem[]) =>
    isCatalog ? items : items.filter((i) => i.categoryIds.includes(currentCategoryId));

  // w bazie: filtr kategorii + opcjonalne sortowanie alfabetyczne
  let activeItems = byCategory(list.items);
  if (isCatalog && catalogFilter) {
    activeItems = activeItems.filter((i) => i.categoryIds.includes(catalogFilter));
  }
  if (isCatalog && catalogSortAZ) {
    activeItems = [...activeItems].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  }
  const packedCount = isCatalog
    ? 0
    : activeItems.filter((i) => i.packedIn.includes(currentCategoryId)).length;

  /** kategorie w pełni spakowane → zielona odznaka na zakładce */
  const doneIds = useMemo(
    () =>
      new Set(
        CATEGORIES.filter((cat) => {
          const inCat = list.items.filter((i) => i.categoryIds.includes(cat.id));
          return inCat.length > 0 && inCat.every((i) => i.packedIn.includes(cat.id));
        }).map((c) => c.id),
      ),
    [list.items],
  );

  // wielkie "SPAKOWANE!" samo się chowa po chwili
  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 2800);
    return () => clearTimeout(timer);
  }, [celebration]);

  const handleToggle = (id: string) => {
    if (isCatalog) return; // w katalogu nie pakujemy, tylko oglądamy
    const next = list.togglePacked(id, currentCategoryId);
    const item = next.find((i) => i.id === id);
    if (!item) return;

    const isPacked = item.packedIn.includes(currentCategoryId);
    playSound(isPacked ? 'check' : 'uncheck');

    const inCategory = next.filter((i) => i.categoryIds.includes(currentCategoryId));
    const allPacked = inCategory.length > 0 && inCategory.every((i) => i.packedIn.includes(currentCategoryId));
    if (isPacked && allPacked) {
      playSound('complete');
      confettiRef.current?.fire();
      setCelebration(currentCategory);
    }
  };

  const handleChangeQuantity = (id: string, delta: number) => {
    if (isCatalog) return;
    list.changeQuantity(id, currentCategoryId, delta);
  };

  const handleReset = () => {
    list.resetCategory(currentCategoryId);
    playSound('uncheck');
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const openEditModal = (item: PackingItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSubmitItem = (values: ItemFormValues, id?: string) => {
    if (id) {
      list.updateItem(id, values);
    } else {
      list.addItem(values);
    }
    setItemModalOpen(false);
    setEditingItem(null);
  };

  /** Kosz na karcie: w kategorii odpina rzecz, w katalogu usuwa ją na zawsze */
  const handleRemove = (id: string) => {
    if (isCatalog) {
      if (window.confirm('Usunąć tę rzecz z katalogu? Zniknie ze wszystkich kategorii.')) {
        list.deleteItem(id);
      }
    } else {
      list.toggleAssignment(id, currentCategoryId);
    }
  };

  const handleImport = (items: PackingItem[]) => {
    list.replaceAll(normalizeItems(items));
    playSound('check');
  };

  const handleRestore = async (versionSha: string) => {
    await list.restoreRevision(versionSha);
    playSound('check');
  };

  return (
    <div className="min-h-screen text-slate-800 pb-12">
      <ConfettiCanvas ref={confettiRef} />

      {/* wielka, zabawna nagroda za spakowanie całej kategorii */}
      {celebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none no-print">
          <div className="bounce-in bg-white rounded-3xl shadow-2xl border-4 border-emerald-300 px-10 py-8 text-center">
            <div className="text-7xl mb-3 wiggle">{celebration.icon}</div>
            <p className="text-3xl font-black text-emerald-600 tracking-wide">SPAKOWANE!</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{celebration.name} — gotowe! 🎉</p>
          </div>
        </div>
      )}

      <Header
        syncStatus={list.syncStatus}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onReset={handleReset}
        onAdd={openAddModal}
      />

      <main className="max-w-6xl mx-auto px-4 mt-6">
        <CategoryTabs
          categories={CATEGORIES}
          currentId={currentCategoryId}
          doneIds={doneIds}
          onSwitch={setCurrentCategoryId}
        />

        <ProgressCard
          category={currentCategory}
          packedCount={packedCount}
          totalCount={activeItems.length}
          catalogMode={isCatalog}
        />

        {/* nagłówek widoczny tylko na wydruku */}
        <div className="hidden print:block mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Moja Lista do Spakowania 🎒</h1>
          <p className="text-lg text-slate-600 font-semibold">
            {currentCategory.icon} {currentCategory.name}
          </p>
          <p className="text-sm text-slate-400 mt-1">Sprawdź i zaznacz ptaszkiem lub naklejką przed wyjściem!</p>
        </div>

        {isCatalog && (
          <CatalogFilterBar
            filterId={catalogFilter}
            onFilterChange={setCatalogFilter}
            sortAZ={catalogSortAZ}
            onToggleSort={() => setCatalogSortAZ((s) => !s)}
          />
        )}

        {activeItems.length === 0 ? (
          <EmptyState
            onAdd={openAddModal}
            onPickFromCatalog={isCatalog ? undefined : () => setPickerOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                categoryId={currentCategoryId}
                catalogMode={isCatalog}
                onToggle={handleToggle}
                onChangeQuantity={handleChangeQuantity}
                onEdit={openEditModal}
                onRemove={handleRemove}
              />
            ))}
            {!isCatalog && (
              <button
                onClick={() => setPickerOpen(true)}
                className="rounded-3xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition flex flex-col items-center justify-center gap-2 p-6 min-h-[180px]"
              >
                <span className="text-4xl">📦</span>
                <span className="font-bold text-sm">Dodaj z katalogu</span>
              </button>
            )}
          </div>
        )}
      </main>

      <ItemModal
        open={itemModalOpen}
        editingItem={editingItem}
        defaultCategoryId={currentCategoryId}
        onClose={() => setItemModalOpen(false)}
        onSubmit={handleSubmitItem}
      />

      {!isCatalog && (
        <CatalogPickerModal
          open={pickerOpen}
          category={currentCategory}
          items={list.items}
          onToggleAssignment={list.toggleAssignment}
          onCreateNew={() => {
            setPickerOpen(false);
            openAddModal();
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <SettingsModal
        open={settingsOpen}
        cloudConnected={list.cloudConnected}
        items={list.items}
        onClose={() => setSettingsOpen(false)}
        onConnect={list.connectCloud}
        onDisconnect={list.disconnectCloud}
        onImport={handleImport}
      />

      <HistoryModal
        open={historyOpen}
        connected={list.cloudConnected}
        onClose={() => setHistoryOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
        onRestore={handleRestore}
      />
    </div>
  );
}
