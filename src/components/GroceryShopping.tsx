import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Tag, 
  Calendar, 
  Sparkles, 
  FileText, 
  ChevronRight,
  ListPlus,
  BarChart3,
  Loader2,
  CheckCircle2,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { GroceryCategory, GroceryItem, GroceryList } from '../types';

interface GroceryShoppingProps {
  groceryLists: GroceryList[];
  onAddList: (title: string, date: string, notes?: string) => Promise<GroceryList>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddItem: (listId: string, item: { name: string; quantity: number; unit_price: number; category: string }) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<GroceryItem>) => Promise<void>;
  onToggleItemPurchased: (itemId: string, currentStatus: boolean) => Promise<void>;
  onDeleteItem: (itemId: string, listId: string) => Promise<void>;
}

const GROCERY_CATEGORIES: GroceryCategory[] = [
  'Hortifruti',
  'Laticínios',
  'Carnes & Peixes',
  'Padaria',
  'Limpeza',
  'Higiene',
  'Bebidas',
  'Mercearia',
  'Outros'
];

const CATEGORY_COLORS: Record<string, string> = {
  'Hortifruti': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Laticínios': 'bg-sky-50 text-sky-700 border-sky-200',
  'Carnes & Peixes': 'bg-rose-50 text-rose-700 border-rose-200',
  'Padaria': 'bg-amber-50 text-amber-700 border-amber-200',
  'Limpeza': 'bg-purple-50 text-purple-700 border-purple-200',
  'Higiene': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Bebidas': 'bg-teal-50 text-teal-700 border-teal-200',
  'Mercearia': 'bg-orange-50 text-orange-700 border-orange-200',
  'Outros': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const GroceryShopping: React.FC<GroceryShoppingProps> = ({
  groceryLists,
  onAddList,
  onDeleteList,
  onAddItem,
  onUpdateItem,
  onToggleItemPurchased,
  onDeleteItem
}) => {
  const [selectedListId, setSelectedListId] = useState<string>(
    groceryLists[0]?.id || ''
  );

  // Estado para criar nova lista
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDate, setNewListDate] = useState(new Date().toISOString().split('T')[0]);
  const [newListNotes, setNewListNotes] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  // Estado do formulário de adicionar item
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnitPrice, setItemUnitPrice] = useState('');
  const [itemCategory, setItemCategory] = useState<GroceryCategory>('Mercearia');
  const [addingItem, setAddingItem] = useState(false);
  const [itemSuccessMsg, setItemSuccessMsg] = useState('');

  // Estado para EDIÇÃO DE ITEM
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnitPrice, setEditUnitPrice] = useState('0');
  const [editCategory, setEditCategory] = useState<GroceryCategory>('Mercearia');
  const [savingEdit, setSavingEdit] = useState(false);

  // Lista selecionada atual
  const activeList = groceryLists.find(l => l.id === selectedListId) || groceryLists[0];
  const items = activeList?.items || [];

  // Cálculos da Lista Ativa
  const totalListAmount = items.reduce((acc, i) => acc + (i.total_price || 0), 0);
  const purchasedItems = items.filter(i => i.is_purchased);
  const purchasedTotal = purchasedItems.reduce((acc, i) => acc + (i.total_price || 0), 0);
  const progressPercent = items.length > 0 ? Math.round((purchasedItems.length / items.length) * 100) : 0;

  // Comparador de Compras (Comparando com a lista anterior se existir)
  const previousList = groceryLists.find(l => l.id !== activeList?.id);
  const prevTotal = previousList ? previousList.total_amount : 0;
  const priceDiff = totalListAmount - prevTotal;
  const isHigherThanPrev = priceDiff > 0;

  // Handler de adicionar item
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList) return;

    if (!itemName.trim()) return;
    const qty = parseFloat(itemQuantity.replace(',', '.')) || 1;
    const price = parseFloat(itemUnitPrice.replace(',', '.')) || 0;

    setAddingItem(true);
    try {
      await onAddItem(activeList.id, {
        name: itemName.trim(),
        quantity: qty,
        unit_price: price,
        category: itemCategory
      });

      setItemName('');
      setItemQuantity('1');
      setItemUnitPrice('');
      setItemSuccessMsg('Item adicionado à lista com sucesso!');
      setTimeout(() => setItemSuccessMsg(''), 2500);
    } catch (err) {
      console.error('Erro ao adicionar item de mercado:', err);
    } finally {
      setAddingItem(false);
    }
  };

  // Handler para iniciar edição
  const handleStartEditItem = (item: GroceryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(String(item.quantity));
    setEditUnitPrice(String(item.unit_price));
    setEditCategory((item.category as GroceryCategory) || 'Mercearia');
  };

  // Handler para salvar alterações do item
  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const qty = parseFloat(editQuantity.replace(',', '.')) || 1;
    const price = parseFloat(editUnitPrice.replace(',', '.')) || 0;

    setSavingEdit(true);
    try {
      await onUpdateItem(editingItem.id, {
        name: editName.trim(),
        quantity: qty,
        unit_price: price,
        category: editCategory
      });

      setEditingItem(null);
      setItemSuccessMsg('Item atualizado no banco!');
      setTimeout(() => setItemSuccessMsg(''), 2500);
    } catch (err) {
      console.error('Erro ao editar item:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Handler de criar lista
  const handleCreateListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    setCreatingList(true);
    try {
      const created = await onAddList(newListTitle.trim(), newListDate, newListNotes.trim());
      setSelectedListId(created.id);
      setShowNewListModal(false);
      setNewListTitle('');
      setNewListNotes('');
    } catch (err) {
      console.error('Erro ao criar lista de mercado:', err);
    } finally {
      setCreatingList(false);
    }
  };

  // Cálculo prévio em tempo real para o formulário
  const previewQty = parseFloat(itemQuantity.replace(',', '.')) || 0;
  const previewPrice = parseFloat(itemUnitPrice.replace(',', '.')) || 0;
  const previewTotal = previewQty * previewPrice;

  // Cálculo prévio em tempo real para o modal de edição
  const editPreviewQty = parseFloat(editQuantity.replace(',', '.')) || 0;
  const editPreviewPrice = parseFloat(editUnitPrice.replace(',', '.')) || 0;
  const editPreviewTotal = editPreviewQty * editPreviewPrice;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 overflow-hidden">
      
      {/* CABEÇALHO DO MÓDULO DE MERCADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl border border-pink-200/80 shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">Compras de Mercado</h1>
              <span className="bg-pink-100 text-pink-700 text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0">
                Módulo Ativo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 truncate">
              Anote, edite itens, calcule o valor total e compare idas ao mercado
            </p>
          </div>
        </div>

        {/* Botão + Nova Lista */}
        <button
          onClick={() => setShowNewListModal(true)}
          className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 text-xs active:scale-[0.98] min-h-[48px] shrink-0"
        >
          <ListPlus className="w-4 h-4" />
          <span>Criar Nova Lista</span>
        </button>
      </div>

      {/* SELETOR DE LISTAS & CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Soma Total da Lista Atual */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <ShoppingCart className="w-28 h-28 text-white" />
          </div>
          
          <div>
            <span className="text-xs font-bold text-pink-100 uppercase tracking-wider block mb-1">
              Soma Total da Compra
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              R$ {totalListAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-pink-100 min-w-0">
            <span className="truncate">No carrinho: R$ {purchasedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full shrink-0 ml-1">{progressPercent}% do total</span>
          </div>
        </div>

        {/* Card 2: Progresso dos Itens Comprados */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                Itens no Carrinho
              </span>
              <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100 shrink-0">
                {purchasedItems.length} de {items.length} itens
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-3 border border-slate-200">
              <div 
                className="bg-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 font-medium truncate">
            {items.length - purchasedItems.length > 0 
              ? `Faltam ${items.length - purchasedItems.length} itens para concluir esta compra.`
              : items.length > 0 ? '🎉 Todos os itens já estão no carrinho!' : 'Nenhum item adicionado ainda.'}
          </p>
        </div>

        {/* Card 3: Comparador com a Compra Anterior */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 truncate">
              <BarChart3 className="w-3.5 h-3.5 text-pink-500 shrink-0" /> Comparativo Mensal
            </span>
            {previousList && (
              <span className="text-xs font-medium text-slate-400 truncate ml-1">vs. {previousList.title}</span>
            )}
          </div>

          {previousList ? (
            <div>
              <div className="flex items-center space-x-2 my-1 min-w-0">
                {isHigherThanPrev ? (
                  <TrendingUp className="w-5 h-5 text-rose-500 shrink-0" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <span className={`text-lg font-extrabold truncate ${isHigherThanPrev ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isHigherThanPrev ? '+' : ''} R$ {priceDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {isHigherThanPrev 
                  ? 'Esta compra está mais cara do que a compra anterior.' 
                  : 'Economia em relação à compra anterior!'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-xs text-slate-400 font-medium">
                Crie mais de uma lista para liberar a comparação de preços entre idas ao mercado.
              </p>
            </div>
          )}

          <div className="mt-2 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-2 truncate">
            Histórico: {groceryLists.length} listas cadastradas
          </div>
        </div>

      </div>

      {/* SELETOR DE LISTA DE MERCADO ATIVA & BOTÃO DE DELETAR LISTA (100% RESPONSIVO / MIN-W-0 TRUNCATE) */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-full">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-pink-500" /> Lista Ativa:
          </label>
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="w-full sm:flex-1 min-w-0 max-w-full truncate bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-extrabold text-sm rounded-2xl px-3.5 sm:px-4 py-2.5 outline-none min-h-[44px]"
          >
            {groceryLists.map(l => (
              <option key={l.id} value={l.id} className="truncate">
                {l.title} ({new Date(l.date).toLocaleDateString('pt-BR')}) - R$ {l.total_amount.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {activeList && (
          <button
            onClick={() => {
              if (confirm(`Tem certeza que deseja excluir a lista "${activeList.title}"?`)) {
                onDeleteList(activeList.id);
                if (groceryLists.length > 1) {
                  const remaining = groceryLists.filter(l => l.id !== activeList.id);
                  setSelectedListId(remaining[0]?.id || '');
                }
              }
            }}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shrink-0 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Lista</span>
          </button>
        )}
      </div>

      {/* SEÇÃO HISTÓRICO & COMPARADOR DE COMPRAS DE MERCADO (RESPONSIVO) */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs overflow-hidden">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">Comparador de Idas ao Mercado</h3>
            <p className="text-xs text-slate-500 font-medium truncate">Compare os valores totais e selecione uma lista para ver os detalhes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {groceryLists.map((list) => (
            <div
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                list.id === selectedListId
                  ? 'bg-pink-50/80 border-pink-400 shadow-xs ring-2 ring-pink-300/50'
                  : 'bg-slate-50/80 border-slate-200 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
                <span className="font-extrabold text-sm text-slate-900 truncate">{list.title}</span>
                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border font-bold shrink-0">
                  {new Date(list.date).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-3 gap-2 min-w-0">
                <span className="text-xs text-slate-500 font-medium truncate">
                  {(list.items || []).length} itens
                </span>
                <span className="text-base font-extrabold text-pink-600 shrink-0">
                  R$ {list.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL PRINCIPAL: FORMULÁRIO DE ADICIONAR ITEM & CHECKLIST DE MERCADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO PARA ANOTAR NOVO ITEM */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs h-fit overflow-hidden">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 truncate">Anotar Item do Mercado</h3>
          </div>

          {itemSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{itemSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddItemSubmit} className="space-y-4">
            
            {/* Nome do Item */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-pink-500 shrink-0" /> Nome do Produto
              </label>
              <input
                type="text"
                placeholder="Ex: Arroz 5kg, Leite 1L, Sabão..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none transition-colors min-h-[48px]"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value as GroceryCategory)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none transition-colors min-h-[48px]"
              >
                {GROCERY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Quantidade & Preço Unitário */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Qtd (Unidade)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none transition-colors min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Valor Un. (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={itemUnitPrice}
                  onChange={(e) => setItemUnitPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white text-slate-900 font-extrabold text-sm rounded-2xl px-4 py-3 outline-none transition-colors min-h-[48px]"
                />
              </div>
            </div>

            {/* PRÉVIA DO CÁLCULO TOTAL DO ITEM */}
            <div className="p-3 bg-pink-50/80 border border-pink-100 rounded-2xl text-xs flex items-center justify-between font-bold text-pink-900 min-w-0">
              <span className="truncate">Cálculo Total: {previewQty} × R$ {previewPrice.toFixed(2)}</span>
              <span className="text-sm font-extrabold text-pink-600 shrink-0 ml-1">
                = R$ {previewTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Botão Adicionar */}
            <button
              type="submit"
              disabled={addingItem || !activeList}
              className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 min-h-[48px] active:scale-[0.98]"
            >
              {addingItem ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Lista</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* COLUNA DIREITA: TABELA / CHECKLIST DE ITENS DO MERCADO */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 truncate">
                  <span>Itens da Lista</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                    {items.length} itens
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  Clique no lápis para editar nome, quantidade ou preço do produto
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total da Lista</span>
                <span className="text-lg font-extrabold text-pink-600">
                  R$ {totalListAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* LISTA DE ITENS */}
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">Nenhum produto cadastrado nesta lista.</p>
                <p className="text-xs text-slate-400 mt-1">Use o formulário ao lado para anotar seus itens de mercado.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Outros'];
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 overflow-hidden ${
                        item.is_purchased
                          ? 'bg-slate-50/60 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200/80 shadow-2xs hover:border-pink-200'
                      }`}
                    >
                      {/* Checkbox & Nome */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleItemPurchased(item.id, item.is_purchased)}
                          className="shrink-0 text-slate-400 hover:text-pink-600 transition-colors p-1"
                        >
                          {item.is_purchased ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className={`font-bold text-sm truncate ${item.is_purchased ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${catColor}`}>
                              {item.category}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                            <span>{item.quantity}un × R$ {item.unit_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total do Item, Botão de Edição & Botão de Deletar */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="text-right mr-1">
                          <span className={`font-extrabold text-sm ${item.is_purchased ? 'text-slate-400' : 'text-slate-900'}`}>
                            R$ {(item.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* BOTÃO PARA EDITAR ITEM */}
                        <button
                          type="button"
                          onClick={() => handleStartEditItem(item)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Editar item da lista"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* BOTÃO PARA DELETAR ITEM */}
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id, activeList.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RODAPÉ DO RESUMO */}
          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{purchasedItems.length} comprados no carrinho</span>
              <span className="text-pink-600 font-extrabold text-sm">
                Soma Total: R$ {totalListAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE EDIÇÃO DE ITEM DE MERCADO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white/95 backdrop-blur-md border-t sm:border border-slate-200/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5">
            
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-2xl border border-pink-100 shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Editar Item de Mercado</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Altere nome, quantidade, valor ou categoria do produto
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              
              {/* Nome do Produto */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as GroceryCategory)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                >
                  {GROCERY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Quantidade & Preço Unitário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Qtd (Unidade)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Valor Un. (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-extrabold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                  />
                </div>
              </div>

              {/* Prévia do Novo Total Calculado */}
              <div className="p-3 bg-pink-50 border border-pink-100 rounded-2xl text-xs flex items-center justify-between font-bold text-pink-900">
                <span>Novo Total: {editPreviewQty} × R$ {editPreviewPrice.toFixed(2)}</span>
                <span className="text-sm font-extrabold text-pink-600">
                  = R$ {editPreviewTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center space-x-1.5 min-h-[44px]"
                >
                  {savingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR NOVA LISTA DE COMPRAS DE MERCADO */}
      {showNewListModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white/95 backdrop-blur-md border-t sm:border border-slate-200/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in slide-in-from-bottom-5">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Criar Nova Lista de Mercado</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Defina o nome da sua compra (ex: Mercado de Agosto, Feira Semanal)
            </p>

            <form onSubmit={handleCreateListSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Título da Lista
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compras do Mês de Agosto"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Data da Compra
                </label>
                <input
                  type="date"
                  value={newListDate}
                  onChange={(e) => setNewListDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Focar em itens em promoção"
                  value={newListNotes}
                  onChange={(e) => setNewListNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 text-slate-900 font-bold text-sm rounded-2xl px-4 py-3 outline-none min-h-[48px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewListModal(false)}
                  className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingList}
                  className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center space-x-1.5 min-h-[44px]"
                >
                  {creatingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Criar Lista</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
