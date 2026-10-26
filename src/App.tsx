import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, PackingItem, Person } from './types';
import { ALL_CATEGORY, ALL_CATEGORY_ID, CATEGORIES } from './data/categories';
import { ALL_PERSONS_ID, PERSONS, personById } from './data/persons';
import { usePackingList, type ItemFormValues } from './hooks/usePackingList';
import { normalizeItems } from './lib/items';
import { playSound } from './lib/sounds';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { PersonTabs } from './components/PersonTabs';
import { ProgressCard } from './components/ProgressCard';
import { ItemCard } from './components/ItemCard';
import { EmptyState } from './components/EmptyState';
import { ItemModal } from './components/ItemModal';
import { CatalogPickerModal } from './components/CatalogPickerModal';
import { ViewFilterBar, type SortOption, type StatusFilter } from './components/ViewFilterBar';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfettiCanvas, type ConfettiHandle } from './components/ConfettiCanvas';

export default function App() {
  const [currentCategoryId, setCurrentCategoryId] = useState('ogolne');
  /** kontekst osoby: "kto pakuje" — filtruje rzeczy w kategorii i katalogu */
  const [currentPersonId, setCurrentPersonId] = useState(ALL_PERSONS_ID);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ category: Category; person: Person | null } | null>(null);
  const confettiRef = useRef<ConfettiHandle>(null);

  const list = usePackingList();

  const isCatalog = currentCategoryId === ALL_CATEGORY_ID;
  const currentCategory =
    CATEGORIES.find((c) => c.id === currentCategoryId) ??
    (currentCategoryId === ALL_CATEGORY_ID ? ALL_CATEGORY : CATEGORIES[0]);
  /** null = "Wszyscy" (bez filtra osoby) */
  const currentPerson = currentPersonId === ALL_PERSONS_ID ? null : personById(currentPersonId);

  const byContext = (items: PackingItem[]) => {
    let result = isCatalog ? items : items.filter((i) => i.categoryIds.includes(currentCategoryId));
    if (currentPerson) result = result.filter((i) => i.personId === currentPerson.id);
    return result;
  };

  // Rzeczy w bieżącym kontekście (kategoria + osoba)
  const contextItems = byContext(list.items);

  // Funkcja sprawdzająca czy rzecz jest spakowana w bieżącym widoku
  const isItemPacked = (item: PackingItem) => {
    if (!isCatalog) {
      return item.packedIn.includes(currentCategoryId);
    }
    if (catalogFilter) {
      return item.packedIn.includes(catalogFilter);
    }
    return item.categoryIds.length > 0 && item.categoryIds.every((c) => item.packedIn.includes(c));
  };

  // Całkowita liczba spakowanych rzeczy w kontekście (do karty postępu)
  const totalContextPacked = isCatalog
    ? 0
    : contextItems.filter((i) => i.packedIn.includes(currentCategoryId)).length;

  // Baza rzeczy widocznych w bieżącym widoku (przed filtrem statusu i wyszukiwania)
  const baseViewItems = isCatalog && catalogFilter
    ? contextItems.filter((i) => i.categoryIds.includes(catalogFilter))
    : contextItems;

  // Liczniki do paska filtrów
  const viewTotalCount = baseViewItems.length;
  const viewPackedCount = baseViewItems.filter(isItemPacked).length;
  const viewUnpackedCount = viewTotalCount - viewPackedCount;

  // Filtrowanie i sortowanie listy rzeczy
  let displayedItems = baseViewItems;

  if (statusFilter === 'unpacked') {
    displayedItems = displayedItems.filter((i) => !isItemPacked(i));
  } else if (statusFilter === 'packed') {
    displayedItems = displayedItems.filter((i) => isItemPacked(i));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    displayedItems = displayedItems.filter((i) => i.name.toLowerCase().includes(q));
  }

  if (sortBy !== 'default') {
    displayedItems = [...displayedItems].sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, 'pl');
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, 'pl');
      }
      if (sortBy === 'status-unpacked') {
        const aPacked = isItemPacked(a);
        const bPacked = isItemPacked(b);
        if (aPacked !== bPacked) {
          return aPacked ? 1 : -1;
        }
        return a.name.localeCompare(b.name, 'pl');
      }
      if (sortBy === 'status-packed') {
        const aPacked = isItemPacked(a);
        const bPacked = isItemPacked(b);
        if (aPacked !== bPacked) {
          return aPacked ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'pl');
      }
      return 0;
    });
  }

  const hasActiveFilters =
    statusFilter !== 'all' ||
    sortBy !== 'default' ||
    searchQuery.trim() !== '' ||
    (isCatalog && catalogFilter !== null);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSortBy('default');
    setSearchQuery('');
    if (isCatalog) {
      setCatalogFilter(null);
    }
  };

  /** kategorie w pełni spakowane (wszystkie rzeczy, wszystkich osób) → zielona odznaka na zakładce */
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

  /** osoby, które spakowały CAŁĄ swoją część bieżącej kategorii → odznaka na chipie osoby */
  const personDoneIds = useMemo(() => {
    if (isCatalog) return new Set<string>();
    const done = new Set<string>();
    for (const person of PERSONS) {
      const inContext = list.items.filter(
        (i) => i.personId === person.id && i.categoryIds.includes(currentCategoryId),
      );
      if (inContext.length > 0 && inContext.every((i) => i.packedIn.includes(currentCategoryId))) {
        done.add(person.id);
      }
    }
    return done;
  }, [list.items, currentCategoryId, isCatalog]);

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

    const relevant = currentPerson
      ? next.filter((i) => i.personId === currentPerson.id && i.categoryIds.includes(currentCategoryId))
      : next.filter((i) => i.categoryIds.includes(currentCategoryId));
    const allPacked = relevant.length > 0 && relevant.every((i) => i.packedIn.includes(currentCategoryId));
    if (isPacked && allPacked) {
      playSound('complete');
      confettiRef.current?.fire();
      setCelebration({ category: currentCategory, person: currentPerson });
    }
  };

  const handleChangeQuantity = (id: string, delta: number) => {
    if (isCatalog) return;
    list.changeQuantity(id, currentCategoryId, delta);
  };

  const handleReset = () => {
    // w kontekście osoby odświeżamy tylko jej checklistę w tej kategorii
    list.resetCategory(currentCategoryId, currentPersonId);
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

      {/* wielka, zabawna nagroda za spakowanie całej checklisty w kontekście */}
      {celebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none no-print">
          <div className="bounce-in bg-white rounded-3xl shadow-2xl border-4 border-emerald-300 px-10 py-8 text-center">
            <div className="text-7xl mb-3 wiggle">
              {celebration.person ? celebration.person.icon : celebration.category.icon}
            </div>
            <p className="text-3xl font-black text-emerald-600 tracking-wide">SPAKOWANE!</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {celebration.person
                ? `${celebration.person.name} — ${celebration.category.name} — gotowe! 🎉`
                : `${celebration.category.name} — gotowe! 🎉`}
            </p>
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

        {/* kontekst osoby działa też w katalogu — tam również pokazuje czyje to rzeczy */}
        <PersonTabs
          persons={PERSONS}
          currentId={currentPersonId}
          doneIds={personDoneIds}
          onSwitch={setCurrentPersonId}
        />

        <ProgressCard
          category={currentCategory}
          person={currentPerson}
          packedCount={totalContextPacked}
          totalCount={contextItems.length}
          catalogMode={isCatalog}
        />

        {/* nagłówek widoczny tylko na wydruku */}
        <div className="hidden print:block mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Moja Lista do Spakowania 🎒</h1>
          <p className="text-lg text-slate-600 font-semibold">
            {currentCategory.icon} {currentCategory.name}
            {currentPerson && ` — ${currentPerson.icon} ${currentPerson.name}`}
          </p>
          <p className="text-sm text-slate-400 mt-1">Sprawdź i zaznacz ptaszkiem lub naklejką przed wyjściem!</p>
        </div>

        <ViewFilterBar
          totalCount={viewTotalCount}
          unpackedCount={viewUnpackedCount}
          packedCount={viewPackedCount}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isCatalog={isCatalog}
          catalogCategoryFilter={catalogFilter}
          onCatalogCategoryChange={setCatalogFilter}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />

        {baseViewItems.length === 0 ? (
          <EmptyState
            onAdd={openAddModal}
            onPickFromCatalog={isCatalog ? undefined : () => setPickerOpen(true)}
          />
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6 no-print">
            <div className="text-4xl mb-3">
              {statusFilter === 'unpacked' ? '🎉' : statusFilter === 'packed' ? '📦' : '🔍'}
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {statusFilter === 'unpacked'
                ? 'Wszystko spakowane!'
                : statusFilter === 'packed'
                ? 'Brak spakowanych przedmiotów'
                : 'Brak pasujących przedmiotów'}
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              {statusFilter === 'unpacked'
                ? 'Wszystkie rzeczy w tej kategorii zostały już spakowane. Możesz zmienić filtr, aby zobaczyć całą listę.'
                : statusFilter === 'packed'
                ? 'Żadna rzecz w tej kategorii nie została jeszcze oznaczona jako spakowana.'
                : 'Żadna rzecz nie spełnia kryteriów wyszukiwania lub wybranych filtrów.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              Pokaż wszystkie przedmioty
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                categoryId={currentCategoryId}
                catalogMode={isCatalog}
                catalogCategoryFilter={catalogFilter}
                owner={personById(item.personId)}
                showOwner={!currentPerson}
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
        defaultPersonId={currentPerson ? currentPerson.id : 'wspolne'}
        onClose={() => setItemModalOpen(false)}
        onSubmit={handleSubmitItem}
      />

      {!isCatalog && (
        <CatalogPickerModal
          open={pickerOpen}
          category={currentCategory}
          person={currentPerson}
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
