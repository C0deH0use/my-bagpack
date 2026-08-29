import { useRef, useState } from 'react';
import type { PackingItem } from './types';
import { CATEGORIES } from './data/categories';
import { usePackingList, type ItemFormValues } from './hooks/usePackingList';
import { playSound } from './lib/sounds';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { ProgressCard } from './components/ProgressCard';
import { ItemCard } from './components/ItemCard';
import { EmptyState } from './components/EmptyState';
import { ItemModal } from './components/ItemModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { ConfettiCanvas, type ConfettiHandle } from './components/ConfettiCanvas';

export default function App() {
  const [currentCategoryId, setCurrentCategoryId] = useState('lato');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const confettiRef = useRef<ConfettiHandle>(null);

  const list = usePackingList();

  const currentCategory = CATEGORIES.find((c) => c.id === currentCategoryId) ?? CATEGORIES[0];
  const activeItems = list.items.filter((item) => item.categoryId === currentCategoryId);
  const packedCount = activeItems.filter((item) => item.packed).length;

  const handleToggle = (id: string) => {
    const next = list.togglePacked(id);
    const item = next.find((i) => i.id === id);
    if (!item) return;

    playSound(item.packed ? 'check' : 'uncheck');

    const inCategory = next.filter((i) => i.categoryId === currentCategoryId);
    const allPacked = inCategory.length > 0 && inCategory.every((i) => i.packed);
    if (item.packed && allPacked) {
      playSound('complete');
      confettiRef.current?.fire();
    }
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
    setCurrentCategoryId(values.categoryId);
  };

  const handleImport = (items: PackingItem[]) => {
    list.replaceAll(items);
    playSound('check');
  };

  const handleRestore = async (versionSha: string) => {
    await list.restoreRevision(versionSha);
    playSound('check');
  };

  return (
    <div className="min-h-screen text-slate-800 pb-12">
      <ConfettiCanvas ref={confettiRef} />

      <Header
        syncStatus={list.syncStatus}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onReset={handleReset}
        onAdd={openAddModal}
      />

      <main className="max-w-6xl mx-auto px-4 mt-6">
        <CategoryTabs categories={CATEGORIES} currentId={currentCategoryId} onSwitch={setCurrentCategoryId} />

        <ProgressCard category={currentCategory} packedCount={packedCount} totalCount={activeItems.length} />

        {/* nagłówek widoczny tylko na wydruku */}
        <div className="hidden print:block mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Moja Lista do Spakowania 🎒</h1>
          <p className="text-lg text-slate-600 font-semibold">
            {currentCategory.icon} {currentCategory.name}
          </p>
          <p className="text-sm text-slate-400 mt-1">Sprawdź i zaznacz ptaszkiem lub naklejką przed wyjściem!</p>
        </div>

        {activeItems.length === 0 ? (
          <EmptyState onAdd={openAddModal} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onChangeQuantity={list.changeQuantity}
                onEdit={openEditModal}
                onDelete={list.deleteItem}
              />
            ))}
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
