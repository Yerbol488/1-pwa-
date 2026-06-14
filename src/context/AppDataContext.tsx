// Single source of truth for the whole app.
//
// All live pages read state and call actions from here. Every action updates
// React state AND localStorage (via the effects below) and writes an activity
// log entry where relevant, so the UI, persistence and audit trail never drift
// apart. No page touches localStorage directly.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ActionType,
  ActivityLog,
  Business,
  CurrentUser,
  EntityType,
  Expense,
  Item,
  ItemAttribute,
  ItemIconKey,
  ItemType,
  ItemTypeLabel,
  Membership,
  PaymentType,
  Production,
  Role,
  Sale,
} from "../types";
import {
  STORAGE_KEYS,
  loadActivity,
  loadBusinesses,
  loadCurrentUser,
  loadExpenses,
  loadItems,
  loadMemberships,
  loadProduction,
  loadSales,
  loadString,
  nowIso,
  saveJSON,
  saveString,
  uid,
} from "../lib/storage";
import { getCurrentRole } from "../lib/permissions";
import { buildSeedData } from "../data/seedData";
import { formatNumber, formatTenge } from "../lib/format";

// --- Action input shapes -----------------------------------------------------

export interface AddItemInput {
  name: string;
  type: ItemType;
  typeLabel: ItemTypeLabel;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  icon: ItemIconKey;
  comment: string;
  attributes: Array<{ key: string; value: string }>;
}

export interface AddSaleInput {
  itemId: string;
  quantity: number;
  price: number;
  paymentType: PaymentType;
  comment: string;
}

export interface AddExpenseInput {
  category: string;
  amount: number;
  comment: string;
}

export interface AddProductionInput {
  itemId: string;
  quantity: number;
  comment: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AppDataContextValue {
  // raw state
  businesses: Business[];
  currentBusinessId: string | null;
  currentUser: CurrentUser | null;
  memberships: Membership[];
  items: Item[];
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  activity: ActivityLog[];

  // derived
  currentBusiness: Business | null;
  role: Role | null;
  businessMemberships: Membership[];
  activeItems: Item[]; // active + current business (for selects/stock)
  allItems: Item[]; // current business incl archived
  activeSales: Sale[];
  allSales: Sale[];
  activeExpenses: Expense[];
  allExpenses: Expense[];
  activeProduction: Production[];
  allProduction: Production[];
  businessActivity: ActivityLog[];

  // feedback
  feedback: string | null;
  showFeedback: (msg: string) => void;
  clearFeedback: () => void;

  // actions
  createCompany: (companyName: string, userName: string) => void;
  addItem: (input: AddItemInput) => Item;
  archiveItem: (itemId: string) => void;
  addSale: (input: AddSaleInput) => ActionResult;
  cancelSale: (id: string, reason: string) => void;
  addExpense: (input: AddExpenseInput) => ActionResult;
  cancelExpense: (id: string, reason: string) => void;
  addProduction: (input: AddProductionInput) => ActionResult;
  cancelProduction: (id: string, reason: string) => void;
  resetDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Lazy init from localStorage so the first render already has persisted data.
  const [businesses, setBusinesses] = useState<Business[]>(loadBusinesses);
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(() =>
    loadString(STORAGE_KEYS.currentBusinessId)
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadCurrentUser);
  const [memberships, setMemberships] = useState<Membership[]>(loadMemberships);
  const [items, setItems] = useState<Item[]>(loadItems);
  const [sales, setSales] = useState<Sale[]>(loadSales);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [production, setProduction] = useState<Production[]>(loadProduction);
  const [activity, setActivity] = useState<ActivityLog[]>(loadActivity);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Persist every slice whenever it changes.
  useEffect(() => saveJSON(STORAGE_KEYS.businesses, businesses), [businesses]);
  useEffect(() => saveString(STORAGE_KEYS.currentBusinessId, currentBusinessId), [currentBusinessId]);
  useEffect(() => saveJSON(STORAGE_KEYS.currentUser, currentUser), [currentUser]);
  useEffect(() => saveJSON(STORAGE_KEYS.memberships, memberships), [memberships]);
  useEffect(() => saveJSON(STORAGE_KEYS.items, items), [items]);
  useEffect(() => saveJSON(STORAGE_KEYS.sales, sales), [sales]);
  useEffect(() => saveJSON(STORAGE_KEYS.expenses, expenses), [expenses]);
  useEffect(() => saveJSON(STORAGE_KEYS.production, production), [production]);
  useEffect(() => saveJSON(STORAGE_KEYS.activity, activity), [activity]);

  // Auto-hide feedback toast.
  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const showFeedback = useCallback((msg: string) => setFeedback(msg), []);
  const clearFeedback = useCallback(() => setFeedback(null), []);

  // --- helpers ---------------------------------------------------------------

  const pushActivity = useCallback(
    (
      businessId: string,
      user: CurrentUser,
      actionType: ActionType,
      entityType: EntityType,
      entityId: string,
      description: string
    ) => {
      const log: ActivityLog = {
        id: uid("act"),
        businessId,
        userId: user.id,
        userName: user.name,
        actionType,
        entityType,
        entityId,
        description,
        createdAt: nowIso(),
        syncStatus: "local",
      };
      setActivity((prev) => [log, ...prev]);
    },
    []
  );

  // --- derived values --------------------------------------------------------

  const currentBusiness = useMemo(
    () => businesses.find((b) => b.id === currentBusinessId) ?? null,
    [businesses, currentBusinessId]
  );

  const role = useMemo(
    () => getCurrentRole(memberships, currentUser?.id ?? null, currentBusinessId),
    [memberships, currentUser, currentBusinessId]
  );

  const byBiz = <T extends { businessId: string }>(arr: T[]): T[] =>
    currentBusinessId ? arr.filter((x) => x.businessId === currentBusinessId) : [];

  const allItems = useMemo(() => byBiz(items), [items, currentBusinessId]);
  const activeItems = useMemo(() => allItems.filter((i) => i.status === "active"), [allItems]);
  const allSales = useMemo(() => byBiz(sales), [sales, currentBusinessId]);
  const activeSales = useMemo(() => allSales.filter((s) => s.status === "active"), [allSales]);
  const allExpenses = useMemo(() => byBiz(expenses), [expenses, currentBusinessId]);
  const activeExpenses = useMemo(() => allExpenses.filter((e) => e.status === "active"), [allExpenses]);
  const allProduction = useMemo(() => byBiz(production), [production, currentBusinessId]);
  const activeProduction = useMemo(
    () => allProduction.filter((p) => p.status === "active"),
    [allProduction]
  );
  const businessMemberships = useMemo(
    () => (currentBusinessId ? memberships.filter((m) => m.businessId === currentBusinessId) : []),
    [memberships, currentBusinessId]
  );
  const businessActivity = useMemo(
    () =>
      currentBusinessId
        ? activity
            .filter((a) => a.businessId === currentBusinessId)
            .slice()
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        : [],
    [activity, currentBusinessId]
  );

  // --- actions ---------------------------------------------------------------

  const createCompany = useCallback(
    (companyName: string, userName: string) => {
      const ts = nowIso();
      const user: CurrentUser = { id: uid("usr"), name: userName.trim(), createdAt: ts };
      const business: Business = {
        id: uid("biz"),
        name: companyName.trim(),
        ownerName: userName.trim(),
        createdAt: ts,
        updatedAt: ts,
      };
      const membership: Membership = {
        id: uid("mem"),
        businessId: business.id,
        userId: user.id,
        userName: user.name,
        role: "owner",
        status: "active",
        createdAt: ts,
      };
      const seed = buildSeedData(business.id, business.name, user);

      setCurrentUser(user);
      setBusinesses((prev) => [...prev, business]);
      setMemberships((prev) => [...prev, membership]);
      setItems(seed.items);
      setSales([]);
      setExpenses([]);
      setProduction([]);
      setActivity(seed.activity);
      setCurrentBusinessId(business.id);
      setFeedback("Компания создана. Добро пожаловать!");
    },
    []
  );

  const addItem = useCallback(
    (input: AddItemInput): Item => {
      const ts = nowIso();
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const attributes: ItemAttribute[] = input.attributes
        .filter((a) => a.key.trim() !== "" || a.value.trim() !== "")
        .map((a) => ({ id: uid("attr"), key: a.key.trim(), value: a.value.trim() }));
      const item: Item = {
        id: uid("itm"),
        businessId: bizId,
        name: input.name.trim(),
        type: input.type,
        typeLabel: input.typeLabel,
        unit: input.unit.trim(),
        salePrice: input.salePrice,
        purchasePrice: input.purchasePrice,
        stockQuantity: input.stockQuantity,
        icon: input.icon,
        comment: input.comment.trim(),
        attributes,
        status: "active",
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: ts,
        updatedAt: ts,
        syncStatus: "local",
      };
      setItems((prev) => [...prev, item]);
      pushActivity(bizId, user, "item_created", "item", item.id, `${user.name} добавил позицию: ${item.name}`);
      setFeedback(`Позиция «${item.name}» сохранена.`);
      return item;
    },
    [currentUser, currentBusinessId, pushActivity]
  );

  const archiveItem = useCallback(
    (itemId: string) => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      let name = "";
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i;
          name = i.name;
          return { ...i, status: "archived", updatedAt: nowIso() };
        })
      );
      pushActivity(bizId, user, "item_archived", "item", itemId, `${user.name} архивировал позицию: ${name}`);
      setFeedback("Позиция перемещена в архив.");
    },
    [currentUser, currentBusinessId, pushActivity]
  );

  const addSale = useCallback(
    (input: AddSaleInput): ActionResult => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const item = items.find((i) => i.id === input.itemId);
      if (!item) return { ok: false, error: "Выберите товар." };
      if (input.quantity <= 0) return { ok: false, error: "Количество должно быть больше нуля." };
      const tracksStock = item.type !== "service";
      if (tracksStock && item.stockQuantity - input.quantity < 0) {
        return {
          ok: false,
          error: `Недостаточно на складе: доступно ${formatNumber(item.stockQuantity)} ${item.unit}.`,
        };
      }
      const sale: Sale = {
        id: uid("sal"),
        businessId: bizId,
        itemId: item.id,
        itemName: item.name,
        quantity: input.quantity,
        price: input.price,
        total: input.quantity * input.price,
        paymentType: input.paymentType,
        comment: input.comment.trim(),
        status: "active",
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: nowIso(),
        syncStatus: "local",
      };
      setSales((prev) => [sale, ...prev]);
      if (tracksStock) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, stockQuantity: i.stockQuantity - input.quantity, updatedAt: nowIso() } : i
          )
        );
      }
      pushActivity(
        bizId,
        user,
        "sale_created",
        "sale",
        sale.id,
        `${user.name} добавил продажу: ${item.name} ${formatNumber(input.quantity)} ${item.unit}`
      );
      setFeedback(tracksStock ? "Продажа сохранена. Склад обновлен." : "Продажа сохранена.");
      return { ok: true };
    },
    [currentUser, currentBusinessId, items, pushActivity]
  );

  const cancelSale = useCallback(
    (id: string, reason: string) => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const sale = sales.find((s) => s.id === id);
      if (!sale || sale.status === "deleted") return;
      const item = items.find((i) => i.id === sale.itemId);
      const tracksStock = item ? item.type !== "service" : false;
      setSales((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "deleted",
                deletedAt: nowIso(),
                deletedByUserId: user.id,
                deletedByName: user.name,
                deleteReason: reason.trim(),
              }
            : s
        )
      );
      if (item && tracksStock) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, stockQuantity: i.stockQuantity + sale.quantity, updatedAt: nowIso() } : i
          )
        );
      }
      pushActivity(
        bizId,
        user,
        "sale_deleted",
        "sale",
        id,
        `${user.name} отменил продажу: ${sale.itemName} ${formatNumber(sale.quantity)} шт. Причина: ${reason.trim()}`
      );
      setFeedback("Запись отменена, история сохранена.");
    },
    [currentUser, currentBusinessId, sales, items, pushActivity]
  );

  const addExpense = useCallback(
    (input: AddExpenseInput): ActionResult => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      if (input.amount <= 0) return { ok: false, error: "Введите сумму больше нуля." };
      if (!input.category.trim()) return { ok: false, error: "Выберите категорию." };
      const expense: Expense = {
        id: uid("exp"),
        businessId: bizId,
        category: input.category.trim(),
        amount: input.amount,
        comment: input.comment.trim(),
        status: "active",
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: nowIso(),
        syncStatus: "local",
      };
      setExpenses((prev) => [expense, ...prev]);
      pushActivity(
        bizId,
        user,
        "expense_created",
        "expense",
        expense.id,
        `${user.name} добавил расход: ${expense.category} — ${formatTenge(expense.amount)}`
      );
      setFeedback("Расход сохранен.");
      return { ok: true };
    },
    [currentUser, currentBusinessId, pushActivity]
  );

  const cancelExpense = useCallback(
    (id: string, reason: string) => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const expense = expenses.find((e) => e.id === id);
      if (!expense || expense.status === "deleted") return;
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: "deleted",
                deletedAt: nowIso(),
                deletedByUserId: user.id,
                deletedByName: user.name,
                deleteReason: reason.trim(),
              }
            : e
        )
      );
      pushActivity(
        bizId,
        user,
        "expense_deleted",
        "expense",
        id,
        `${user.name} отменил расход: ${expense.category} — ${formatTenge(expense.amount)}. Причина: ${reason.trim()}`
      );
      setFeedback("Запись отменена, история сохранена.");
    },
    [currentUser, currentBusinessId, expenses, pushActivity]
  );

  const addProduction = useCallback(
    (input: AddProductionInput): ActionResult => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const item = items.find((i) => i.id === input.itemId);
      if (!item) return { ok: false, error: "Выберите товар." };
      if (input.quantity <= 0) return { ok: false, error: "Количество должно быть больше нуля." };
      const record: Production = {
        id: uid("prd"),
        businessId: bizId,
        itemId: item.id,
        itemName: item.name,
        quantity: input.quantity,
        comment: input.comment.trim(),
        status: "active",
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: nowIso(),
        syncStatus: "local",
      };
      setProduction((prev) => [record, ...prev]);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, stockQuantity: i.stockQuantity + input.quantity, updatedAt: nowIso() } : i
        )
      );
      pushActivity(
        bizId,
        user,
        "production_created",
        "production",
        record.id,
        `${user.name} добавил производство: ${item.name} +${formatNumber(input.quantity)} ${item.unit}`
      );
      setFeedback("Производство сохранено. Склад обновлен.");
      return { ok: true };
    },
    [currentUser, currentBusinessId, items, pushActivity]
  );

  const cancelProduction = useCallback(
    (id: string, reason: string) => {
      const user = currentUser!;
      const bizId = currentBusinessId!;
      const record = production.find((p) => p.id === id);
      if (!record || record.status === "deleted") return;
      const item = items.find((i) => i.id === record.itemId);
      setProduction((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "deleted",
                deletedAt: nowIso(),
                deletedByUserId: user.id,
                deletedByName: user.name,
                deleteReason: reason.trim(),
              }
            : p
        )
      );
      if (item) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, stockQuantity: i.stockQuantity - record.quantity, updatedAt: nowIso() } : i
          )
        );
      }
      pushActivity(
        bizId,
        user,
        "production_deleted",
        "production",
        id,
        `${user.name} отменил производство: ${record.itemName} +${formatNumber(record.quantity)} шт. Причина: ${reason.trim()}`
      );
      setFeedback("Запись отменена, склад скорректирован.");
    },
    [currentUser, currentBusinessId, production, items, pushActivity]
  );

  const resetDemoData = useCallback(() => {
    const user = currentUser;
    const business = businesses.find((b) => b.id === currentBusinessId);
    if (!user || !business) return;
    const seed = buildSeedData(business.id, business.name, user);
    // Keep company, user and membership; rebuild items + activity; clear ledger.
    setItems(seed.items);
    setSales([]);
    setExpenses([]);
    setProduction([]);
    const resetLog: ActivityLog = {
      id: uid("act"),
      businessId: business.id,
      userId: user.id,
      userName: user.name,
      actionType: "demo_data_reset",
      entityType: "system",
      entityId: business.id,
      description: `${user.name} сбросил демо-данные компании`,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setActivity([resetLog, ...seed.activity]);
    setFeedback("Демо-данные сброшены.");
  }, [currentUser, businesses, currentBusinessId]);

  const value: AppDataContextValue = {
    businesses,
    currentBusinessId,
    currentUser,
    memberships,
    items,
    sales,
    expenses,
    production,
    activity,
    currentBusiness,
    role,
    businessMemberships,
    activeItems,
    allItems,
    activeSales,
    allSales,
    activeExpenses,
    allExpenses,
    activeProduction,
    allProduction,
    businessActivity,
    feedback,
    showFeedback,
    clearFeedback,
    createCompany,
    addItem,
    archiveItem,
    addSale,
    cancelSale,
    addExpense,
    cancelExpense,
    addProduction,
    cancelProduction,
    resetDemoData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
