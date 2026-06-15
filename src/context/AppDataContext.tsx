// Single source of truth for the whole app (Stage 3).
//
// All live pages read state and call actions from here. Every action updates
// React state AND localStorage (via the effects below), records a stock
// movement where stock changes, and writes a human-readable activity entry.
// No page touches localStorage directly.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type {
  ActionType,
  ActivityLog,
  Business,
  ConsumedMaterial,
  CurrentUser,
  EntityType,
  FixedExpense,
  Item,
  ItemAttribute,
  ItemBehaviorFlags,
  ItemIconKey,
  ItemType,
  Membership,
  OneOffExpense,
  PaymentType,
  Production,
  Role,
  Sale,
  StockMovement,
  StockMovementType,
  StockPurchase,
  Supplier,
  SupplierStatus,
  Client,
  ClientStatus,
} from "../types";
import {
  STORAGE_KEYS,
  loadActivity,
  loadBusinesses,
  loadClients,
  loadCurrentUser,
  loadFixedExpenses,
  loadItems,
  loadMemberships,
  loadOneOffExpenses,
  loadProduction,
  loadSales,
  loadStockMovements,
  loadStockPurchases,
  loadString,
  loadSuppliers,
  nowIso,
  saveJSON,
  saveString,
  uid,
} from "../lib/storage";
import { runMigrations } from "../lib/migrate";
import { typeLabelFor } from "../lib/items";
import { hashPin, verifyPin } from "../lib/pin";
import { getCurrentRole } from "../lib/permissions";
import { buildDemoData } from "../data/seedData";
import { formatNumber, formatTenge } from "../lib/format";

// --- Action input shapes -----------------------------------------------------

export interface ItemInput extends ItemBehaviorFlags {
  name: string;
  type: ItemType;
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
  priceOverrideReason?: string;
}

export interface AddStockPurchaseInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  deliveryCost: number;
  supplierId?: string;
  comment: string;
  priceOverrideReason?: string;
}

export interface AddOneOffInput {
  title: string;
  amount: number;
  quantity?: number;
  unit?: string;
  deliveryCost: number;
  supplierId?: string;
  comment: string;
}

export interface AddFixedInput {
  category: string;
  amount: number;
  periodDate: string;
  comment: string;
}

export interface AddProductionInput {
  itemId: string;
  quantity: number;
  consumedMaterials: Array<{ itemId: string; quantity: number }>;
  comment: string;
}

export interface SupplierInput {
  name: string;
  contactPerson: string;
  whatsappNumber: string;
  phoneNumber: string;
  sellsText: string;
  comment: string;
  supplierStatus: SupplierStatus;
}

export interface ClientInput {
  name: string;
  contactPerson: string;
  whatsappNumber: string;
  phoneNumber: string;
  interestText: string;
  clientStatus: ClientStatus;
  comment: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AppDataContextValue {
  // raw state (current business already filtered in the *active* selectors)
  currentBusiness: Business | null;
  currentBusinessId: string | null;
  currentUser: CurrentUser | null;
  role: Role | null;
  businessMemberships: Membership[];

  // item selectors
  allItems: Item[];
  activeItems: Item[];
  sellableItems: Item[];
  purchasableItems: Item[];
  producibleItems: Item[];
  consumableItems: Item[];
  stockItems: Item[];

  // record selectors (active + all incl. cancelled)
  activeSales: Sale[];
  allSales: Sale[];
  activeStockPurchases: StockPurchase[];
  allStockPurchases: StockPurchase[];
  activeOneOff: OneOffExpense[];
  allOneOff: OneOffExpense[];
  activeFixed: FixedExpense[];
  allFixed: FixedExpense[];
  activeProduction: Production[];
  allProduction: Production[];
  activeSuppliers: Supplier[];
  allSuppliers: Supplier[];
  activeClients: Client[];
  allClients: Client[];
  stockMovements: StockMovement[];
  businessActivity: ActivityLog[];

  // totals
  totalExpenses: number;

  // helpers
  itemById: (id: string) => Item | undefined;
  supplierById: (id: string | undefined) => Supplier | undefined;
  movementsForItem: (itemId: string, limit?: number) => StockMovement[];

  // local access (PIN) — local-only protection, NOT real auth
  pinSet: boolean;
  unlocked: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  setPin: (pin: string) => void;

  // feedback
  feedback: string | null;
  showFeedback: (msg: string) => void;

  // actions
  createCompany: (companyName: string, userName: string, pin?: string) => void;
  loadDemoData: () => void;
  resetData: (mode: "empty" | "demo") => void;
  addItem: (input: ItemInput) => Item;
  updateItem: (id: string, input: ItemInput) => void;
  archiveItem: (id: string) => void;
  addSale: (input: AddSaleInput) => ActionResult;
  cancelSale: (id: string, reason: string) => void;
  addStockPurchase: (input: AddStockPurchaseInput) => ActionResult;
  cancelStockPurchase: (id: string, reason: string) => void;
  addOneOffExpense: (input: AddOneOffInput) => ActionResult;
  cancelOneOffExpense: (id: string, reason: string) => void;
  addFixedExpense: (input: AddFixedInput) => ActionResult;
  cancelFixedExpense: (id: string, reason: string) => void;
  addProduction: (input: AddProductionInput) => ActionResult;
  cancelProduction: (id: string, reason: string) => void;
  addSupplier: (input: SupplierInput) => Supplier;
  updateSupplier: (id: string, input: SupplierInput) => void;
  archiveSupplier: (id: string) => void;
  addClient: (input: ClientInput) => Client;
  updateClient: (id: string, input: ClientInput) => void;
  archiveClient: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Run migrations once, before the first state load.
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    runMigrations();
    return loadBusinesses();
  });
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(() =>
    loadString(STORAGE_KEYS.currentBusinessId)
  );
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadCurrentUser);
  const [memberships, setMemberships] = useState<Membership[]>(loadMemberships);
  const [items, setItems] = useState<Item[]>(loadItems);
  const [sales, setSales] = useState<Sale[]>(loadSales);
  const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>(loadStockPurchases);
  const [oneOff, setOneOff] = useState<OneOffExpense[]>(loadOneOffExpenses);
  const [fixed, setFixed] = useState<FixedExpense[]>(loadFixedExpenses);
  const [production, setProduction] = useState<Production[]>(loadProduction);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [movements, setMovements] = useState<StockMovement[]>(loadStockMovements);
  const [activity, setActivity] = useState<ActivityLog[]>(loadActivity);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Local PIN: hash persists; "unlocked" lives only in memory so a reload locks.
  const [pinHash, setPinHash] = useState<string | null>(() => loadString(STORAGE_KEYS.pinHash));
  const [unlocked, setUnlocked] = useState(false);

  // Persist each slice on change.
  useEffect(() => saveJSON(STORAGE_KEYS.businesses, businesses), [businesses]);
  useEffect(() => saveString(STORAGE_KEYS.currentBusinessId, currentBusinessId), [currentBusinessId]);
  useEffect(() => saveJSON(STORAGE_KEYS.currentUser, currentUser), [currentUser]);
  useEffect(() => saveJSON(STORAGE_KEYS.memberships, memberships), [memberships]);
  useEffect(() => saveJSON(STORAGE_KEYS.items, items), [items]);
  useEffect(() => saveJSON(STORAGE_KEYS.sales, sales), [sales]);
  useEffect(() => saveJSON(STORAGE_KEYS.stockPurchases, stockPurchases), [stockPurchases]);
  useEffect(() => saveJSON(STORAGE_KEYS.oneOffExpenses, oneOff), [oneOff]);
  useEffect(() => saveJSON(STORAGE_KEYS.fixedExpenses, fixed), [fixed]);
  useEffect(() => saveJSON(STORAGE_KEYS.production, production), [production]);
  useEffect(() => saveJSON(STORAGE_KEYS.suppliers, suppliers), [suppliers]);
  useEffect(() => saveJSON(STORAGE_KEYS.clients, clients), [clients]);
  useEffect(() => saveJSON(STORAGE_KEYS.stockMovements, movements), [movements]);
  useEffect(() => saveJSON(STORAGE_KEYS.activity, activity), [activity]);
  useEffect(() => saveString(STORAGE_KEYS.pinHash, pinHash), [pinHash]);

  useEffect(() => {
    if (!feedback) return;
    const t = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const showFeedback = (msg: string) => setFeedback(msg);

  // --- derived ---------------------------------------------------------------

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
  const active = <T extends { status: "active" | "deleted" | "archived" }>(arr: T[]): T[] =>
    arr.filter((x) => x.status === "active");

  const allItems = useMemo(() => byBiz(items), [items, currentBusinessId]);
  const activeItems = useMemo(() => active(allItems), [allItems]);
  const sellableItems = useMemo(() => activeItems.filter((i) => i.sellable), [activeItems]);
  const purchasableItems = useMemo(
    () => activeItems.filter((i) => i.purchasable && i.stockTracked),
    [activeItems]
  );
  const producibleItems = useMemo(() => activeItems.filter((i) => i.stockTracked), [activeItems]);
  const consumableItems = useMemo(
    () => activeItems.filter((i) => i.consumableInProduction && i.stockTracked),
    [activeItems]
  );
  const stockItems = useMemo(() => activeItems.filter((i) => i.stockTracked), [activeItems]);

  const allSales = useMemo(() => byBiz(sales), [sales, currentBusinessId]);
  const activeSales = useMemo(() => active(allSales), [allSales]);
  const allStockPurchases = useMemo(() => byBiz(stockPurchases), [stockPurchases, currentBusinessId]);
  const activeStockPurchases = useMemo(() => active(allStockPurchases), [allStockPurchases]);
  const allOneOff = useMemo(() => byBiz(oneOff), [oneOff, currentBusinessId]);
  const activeOneOff = useMemo(() => active(allOneOff), [allOneOff]);
  const allFixed = useMemo(() => byBiz(fixed), [fixed, currentBusinessId]);
  const activeFixed = useMemo(() => active(allFixed), [allFixed]);
  const allProduction = useMemo(() => byBiz(production), [production, currentBusinessId]);
  const activeProduction = useMemo(() => active(allProduction), [allProduction]);
  const allSuppliers = useMemo(() => byBiz(suppliers), [suppliers, currentBusinessId]);
  const activeSuppliers = useMemo(() => active(allSuppliers), [allSuppliers]);
  const allClients = useMemo(() => byBiz(clients), [clients, currentBusinessId]);
  const activeClients = useMemo(() => active(allClients), [allClients]);
  const stockMovements = useMemo(() => byBiz(movements), [movements, currentBusinessId]);
  const businessActivity = useMemo(
    () =>
      byBiz(activity)
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [activity, currentBusinessId]
  );

  const totalExpenses = useMemo(() => {
    const p = activeStockPurchases.reduce((s, x) => s + x.totalAmount, 0);
    const o = activeOneOff.reduce((s, x) => s + x.amount + x.deliveryCost, 0);
    const f = activeFixed.reduce((s, x) => s + x.amount, 0);
    return p + o + f;
  }, [activeStockPurchases, activeOneOff, activeFixed]);

  const itemById = (id: string) => items.find((i) => i.id === id);
  const supplierById = (id: string | undefined) => (id ? suppliers.find((s) => s.id === id) : undefined);
  const pinSet = pinHash !== null && pinHash !== "";
  const movementsForItem = (itemId: string, limit = 2) =>
    stockMovements
      .filter((m) => m.itemId === itemId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);

  // --- internal helpers ------------------------------------------------------

  function pushActivity(
    actionType: ActionType,
    entityType: EntityType,
    entityId: string,
    description: string
  ) {
    const user = currentUser!;
    const bizId = currentBusinessId!;
    const log: ActivityLog = {
      id: uid("act"),
      businessId: bizId,
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
  }

  function pushMovement(
    item: Item,
    movementType: StockMovementType,
    signedQty: number,
    relatedEntityType: EntityType,
    relatedEntityId: string
  ) {
    const user = currentUser!;
    const movement: StockMovement = {
      id: uid("mov"),
      businessId: currentBusinessId!,
      itemId: item.id,
      itemName: item.name,
      movementType,
      quantity: signedQty,
      unit: item.unit,
      relatedEntityType,
      relatedEntityId,
      createdByUserId: user.id,
      createdByName: user.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setMovements((prev) => [movement, ...prev]);
  }

  function adjustStock(itemId: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, stockQuantity: i.stockQuantity + delta, updatedAt: nowIso() } : i
      )
    );
  }

  // --- company / data --------------------------------------------------------

  function createCompany(companyName: string, userName: string, pin?: string) {
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
    // Empty business by default — no seeded items.
    setCurrentUser(user);
    setBusinesses((prev) => [...prev, business]);
    setMemberships((prev) => [...prev, membership]);
    setItems([]);
    setSales([]);
    setStockPurchases([]);
    setOneOff([]);
    setFixed([]);
    setProduction([]);
    setSuppliers([]);
    setClients([]);
    setMovements([]);
    setActivity([
      {
        id: uid("act"),
        businessId: business.id,
        userId: user.id,
        userName: user.name,
        actionType: "company_created",
        entityType: "company",
        entityId: business.id,
        description: `${user.name} создал компанию: ${business.name}`,
        createdAt: ts,
        syncStatus: "local",
      },
    ]);
    // Set local PIN if provided, and unlock for this session.
    setPinHash(pin && pin.trim() ? hashPin(pin.trim()) : null);
    setUnlocked(true);
    setCurrentBusinessId(business.id);
    setFeedback("Компания создана. Добавьте свои позиции.");
  }

  function login(pin: string): boolean {
    if (!pinHash) {
      setUnlocked(true);
      return true;
    }
    if (verifyPin(pin.trim(), pinHash)) {
      setUnlocked(true);
      return true;
    }
    return false;
  }

  function logout() {
    setUnlocked(false);
  }

  function setPin(pin: string) {
    setPinHash(pin && pin.trim() ? hashPin(pin.trim()) : null);
    setUnlocked(true);
    setFeedback(pin && pin.trim() ? "PIN-код установлен." : "PIN-код удален.");
  }

  function loadDemoData() {
    if (!currentUser || !currentBusinessId) return;
    const seed = buildDemoData(currentBusinessId, currentUser);
    setItems((prev) => [...prev, ...seed.items]);
    setSuppliers((prev) => [...prev, ...seed.suppliers]);
    setActivity((prev) => [...seed.activity, ...prev]);
    setFeedback("Демо-данные загружены.");
  }

  function resetData(mode: "empty" | "demo") {
    if (!currentUser || !currentBusinessId) return;
    const cleared = {
      items: [] as Item[],
      sales: [] as Sale[],
      stockPurchases: [] as StockPurchase[],
      oneOff: [] as OneOffExpense[],
      fixed: [] as FixedExpense[],
      production: [] as Production[],
      suppliers: [] as Supplier[],
      movements: [] as StockMovement[],
    };
    const resetLog: ActivityLog = {
      id: uid("act"),
      businessId: currentBusinessId,
      userId: currentUser.id,
      userName: currentUser.name,
      actionType: "data_reset",
      entityType: "system",
      entityId: currentBusinessId,
      description: `${currentUser.name} сбросил данные компании (${mode === "demo" ? "демо" : "пусто"})`,
      createdAt: nowIso(),
      syncStatus: "local",
    };

    if (mode === "demo") {
      const seed = buildDemoData(currentBusinessId, currentUser);
      setItems(seed.items);
      setSuppliers(seed.suppliers);
      setActivity([...seed.activity, resetLog]);
    } else {
      setItems(cleared.items);
      setSuppliers(cleared.suppliers);
      setActivity([resetLog]);
    }
    setSales(cleared.sales);
    setStockPurchases(cleared.stockPurchases);
    setOneOff(cleared.oneOff);
    setFixed(cleared.fixed);
    setProduction(cleared.production);
    setClients([]);
    setMovements(cleared.movements);
    setFeedback(mode === "demo" ? "Сброшено и загружены демо-данные." : "Данные очищены.");
  }

  // --- items -----------------------------------------------------------------

  function buildItem(input: ItemInput): Item {
    const ts = nowIso();
    const user = currentUser!;
    const attributes: ItemAttribute[] = input.attributes
      .filter((a) => a.key.trim() !== "" || a.value.trim() !== "")
      .map((a) => ({ id: uid("attr"), key: a.key.trim(), value: a.value.trim() }));
    return {
      sellable: input.sellable,
      purchasable: input.purchasable,
      stockTracked: input.stockTracked,
      consumableInProduction: input.consumableInProduction,
      id: uid("itm"),
      businessId: currentBusinessId!,
      name: input.name.trim(),
      type: input.type,
      typeLabel: typeLabelFor(input.type),
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
  }

  function addItem(input: ItemInput): Item {
    const item = buildItem(input);
    setItems((prev) => [...prev, item]);
    pushActivity("item_created", "item", item.id, `${currentUser!.name} добавил позицию: ${item.name}`);
    setFeedback(`Позиция «${item.name}» сохранена.`);
    return item;
  }

  function updateItem(id: string, input: ItemInput) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              ...input,
              typeLabel: typeLabelFor(input.type),
              name: input.name.trim(),
              unit: input.unit.trim(),
              comment: input.comment.trim(),
              attributes: input.attributes
                .filter((a) => a.key.trim() !== "" || a.value.trim() !== "")
                .map((a) => ({ id: uid("attr"), key: a.key.trim(), value: a.value.trim() })),
              updatedAt: nowIso(),
            }
          : i
      )
    );
    pushActivity("item_updated", "item", id, `${currentUser!.name} изменил позицию: ${input.name.trim()}`);
    setFeedback("Позиция обновлена.");
  }

  function archiveItem(id: string) {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "archived", updatedAt: nowIso() } : i)));
    pushActivity("item_archived", "item", id, `${currentUser!.name} архивировал позицию: ${item?.name ?? ""}`);
    setFeedback("Позиция перемещена в архив.");
  }

  // --- sales -----------------------------------------------------------------

  function addSale(input: AddSaleInput): ActionResult {
    const item = items.find((i) => i.id === input.itemId);
    if (!item) return { ok: false, error: "Выберите товар." };
    if (input.quantity <= 0) return { ok: false, error: "Количество должно быть больше нуля." };
    if (item.stockTracked && item.stockQuantity - input.quantity < 0) {
      return { ok: false, error: `Недостаточно на складе: доступно ${formatNumber(item.stockQuantity)} ${item.unit}.` };
    }
    const overridden = !!input.priceOverrideReason && input.price !== item.salePrice;
    const sale: Sale = {
      id: uid("sal"),
      businessId: currentBusinessId!,
      itemId: item.id,
      itemName: item.name,
      quantity: input.quantity,
      price: input.price,
      total: input.quantity * input.price,
      paymentType: input.paymentType,
      comment: input.comment.trim(),
      originalUnitPrice: overridden ? item.salePrice : undefined,
      priceOverrideReason: overridden ? input.priceOverrideReason : undefined,
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setSales((prev) => [sale, ...prev]);
    if (item.stockTracked) {
      adjustStock(item.id, -input.quantity);
      pushMovement(item, "sale_out", -input.quantity, "sale", sale.id);
    }
    pushActivity(
      "sale_created",
      "sale",
      sale.id,
      `${currentUser!.name} продал ${item.name} ${formatNumber(input.quantity)} ${item.unit} — ${formatTenge(sale.total)}`
    );
    if (overridden) {
      pushActivity(
        "price_override_used",
        "sale",
        sale.id,
        `${currentUser!.name} изменил цену продажи: ${formatTenge(input.price)} вместо ${formatTenge(item.salePrice)}. Причина: ${input.priceOverrideReason}`
      );
    }
    setFeedback(item.stockTracked ? "Продажа сохранена. Склад обновлен." : "Продажа сохранена.");
    return { ok: true };
  }

  function cancelSale(id: string, reason: string) {
    const sale = sales.find((s) => s.id === id);
    if (!sale || sale.status === "deleted") return;
    const item = items.find((i) => i.id === sale.itemId);
    markDeleted(setSales, id, reason);
    if (item && item.stockTracked) {
      adjustStock(item.id, sale.quantity);
      pushMovement(item, "adjustment_in", sale.quantity, "sale", id);
    }
    pushActivity(
      "sale_cancelled",
      "sale",
      id,
      `${currentUser!.name} отменил продажу: ${sale.itemName} ${formatNumber(sale.quantity)} шт. Причина: ${reason}`
    );
    setFeedback("Запись отменена, история сохранена.");
  }

  // --- stock purchases (Expenses tab 1) -------------------------------------

  function addStockPurchase(input: AddStockPurchaseInput): ActionResult {
    const item = items.find((i) => i.id === input.itemId);
    if (!item) return { ok: false, error: "Выберите товар или материал." };
    if (input.quantity <= 0) return { ok: false, error: "Количество должно быть больше нуля." };
    const itemSubtotal = input.quantity * input.unitPrice;
    const totalAmount = itemSubtotal + input.deliveryCost;
    const supplier = supplierById(input.supplierId);
    const overridden = !!input.priceOverrideReason && input.unitPrice !== item.purchasePrice;
    const purchase: StockPurchase = {
      id: uid("pur"),
      businessId: currentBusinessId!,
      itemId: item.id,
      itemName: item.name,
      quantity: input.quantity,
      unit: item.unit,
      unitPrice: input.unitPrice,
      itemSubtotal,
      deliveryCost: input.deliveryCost,
      totalAmount,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      comment: input.comment.trim(),
      originalUnitPrice: overridden ? item.purchasePrice : undefined,
      priceOverrideReason: overridden ? input.priceOverrideReason : undefined,
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setStockPurchases((prev) => [purchase, ...prev]);
    if (item.stockTracked) {
      adjustStock(item.id, input.quantity);
      pushMovement(item, "purchase_in", input.quantity, "stock_purchase", purchase.id);
    }
    const deliveryText = input.deliveryCost > 0 ? `, включая доставку ${formatTenge(input.deliveryCost)}` : "";
    pushActivity(
      "stock_purchase_created",
      "stock_purchase",
      purchase.id,
      `${currentUser!.name} купил ${item.name} ${formatNumber(input.quantity)} ${item.unit} — ${formatTenge(totalAmount)}${deliveryText}`
    );
    if (overridden) {
      pushActivity(
        "price_override_used",
        "stock_purchase",
        purchase.id,
        `${currentUser!.name} изменил цену покупки: ${formatTenge(input.unitPrice)} вместо ${formatTenge(item.purchasePrice)}. Причина: ${input.priceOverrideReason}`
      );
    }
    setFeedback("Покупка сохранена. Склад обновлен.");
    return { ok: true };
  }

  function cancelStockPurchase(id: string, reason: string) {
    const purchase = stockPurchases.find((p) => p.id === id);
    if (!purchase || purchase.status === "deleted") return;
    const item = items.find((i) => i.id === purchase.itemId);
    markDeleted(setStockPurchases, id, reason);
    if (item && item.stockTracked) {
      adjustStock(item.id, -purchase.quantity);
      pushMovement(item, "adjustment_out", -purchase.quantity, "stock_purchase", id);
    }
    pushActivity(
      "stock_purchase_cancelled",
      "stock_purchase",
      id,
      `${currentUser!.name} отменил покупку: ${purchase.itemName} ${formatNumber(purchase.quantity)} ${purchase.unit} — ${formatTenge(purchase.totalAmount)}. Причина: ${reason}`
    );
    setFeedback("Запись отменена, история сохранена.");
  }

  // --- one-off expenses (Expenses tab 2) ------------------------------------

  function addOneOffExpense(input: AddOneOffInput): ActionResult {
    if (input.amount <= 0) return { ok: false, error: "Введите сумму больше нуля." };
    if (!input.title.trim()) return { ok: false, error: "Введите название." };
    const supplier = supplierById(input.supplierId);
    const record: OneOffExpense = {
      id: uid("off"),
      businessId: currentBusinessId!,
      title: input.title.trim(),
      amount: input.amount,
      quantity: input.quantity,
      unit: input.unit?.trim() || undefined,
      deliveryCost: input.deliveryCost,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      comment: input.comment.trim(),
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setOneOff((prev) => [record, ...prev]);
    pushActivity(
      "one_off_expense_created",
      "one_off_expense",
      record.id,
      `${currentUser!.name} добавил разовую покупку: ${record.title} — ${formatTenge(record.amount + record.deliveryCost)}`
    );
    setFeedback("Разовый расход сохранен.");
    return { ok: true };
  }

  function cancelOneOffExpense(id: string, reason: string) {
    const rec = oneOff.find((o) => o.id === id);
    if (!rec || rec.status === "deleted") return;
    markDeleted(setOneOff, id, reason);
    pushActivity(
      "one_off_expense_cancelled",
      "one_off_expense",
      id,
      `${currentUser!.name} отменил разовую покупку: ${rec.title} — ${formatTenge(rec.amount + rec.deliveryCost)}. Причина: ${reason}`
    );
    setFeedback("Запись отменена, история сохранена.");
  }

  // --- fixed expenses (Expenses tab 3) --------------------------------------

  function addFixedExpense(input: AddFixedInput): ActionResult {
    if (input.amount <= 0) return { ok: false, error: "Введите сумму больше нуля." };
    if (!input.category.trim()) return { ok: false, error: "Введите категорию." };
    const record: FixedExpense = {
      id: uid("fix"),
      businessId: currentBusinessId!,
      category: input.category.trim(),
      amount: input.amount,
      periodDate: input.periodDate,
      comment: input.comment.trim(),
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setFixed((prev) => [record, ...prev]);
    pushActivity(
      "fixed_expense_created",
      "fixed_expense",
      record.id,
      `${currentUser!.name} добавил постоянный расход: ${record.category} — ${formatTenge(record.amount)}`
    );
    setFeedback("Постоянный расход сохранен.");
    return { ok: true };
  }

  function cancelFixedExpense(id: string, reason: string) {
    const rec = fixed.find((f) => f.id === id);
    if (!rec || rec.status === "deleted") return;
    markDeleted(setFixed, id, reason);
    pushActivity(
      "fixed_expense_cancelled",
      "fixed_expense",
      id,
      `${currentUser!.name} отменил постоянный расход: ${rec.category} — ${formatTenge(rec.amount)}. Причина: ${reason}`
    );
    setFeedback("Запись отменена, история сохранена.");
  }

  // --- production ------------------------------------------------------------

  function addProduction(input: AddProductionInput): ActionResult {
    const item = items.find((i) => i.id === input.itemId);
    if (!item) return { ok: false, error: "Выберите производимый товар." };
    if (input.quantity <= 0) return { ok: false, error: "Количество должно быть больше нуля." };

    // Validate consumed materials stock (block negative).
    const consumed: ConsumedMaterial[] = [];
    for (const c of input.consumedMaterials) {
      if (c.quantity <= 0) continue;
      const m = items.find((i) => i.id === c.itemId);
      if (!m) return { ok: false, error: "Выбран несуществующий материал." };
      if (m.stockTracked && m.stockQuantity - c.quantity < 0) {
        return { ok: false, error: `Недостаточно материала «${m.name}»: доступно ${formatNumber(m.stockQuantity)} ${m.unit}.` };
      }
      consumed.push({ itemId: m.id, itemName: m.name, quantity: c.quantity, unit: m.unit });
    }

    const record: Production = {
      id: uid("prd"),
      businessId: currentBusinessId!,
      itemId: item.id,
      itemName: item.name,
      quantity: input.quantity,
      consumedMaterials: consumed,
      comment: input.comment.trim(),
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: nowIso(),
      syncStatus: "local",
    };
    setProduction((prev) => [record, ...prev]);

    if (item.stockTracked) {
      adjustStock(item.id, input.quantity);
      pushMovement(item, "production_in", input.quantity, "production", record.id);
    }
    consumed.forEach((c) => {
      const m = items.find((i) => i.id === c.itemId)!;
      adjustStock(m.id, -c.quantity);
      pushMovement(m, "production_consumption_out", -c.quantity, "production", record.id);
    });

    const consumedText =
      consumed.length > 0
        ? `. Списано: ${consumed.map((c) => `${c.itemName} ${formatNumber(c.quantity)} ${c.unit}`).join(", ")}`
        : "";
    pushActivity(
      "production_created",
      "production",
      record.id,
      `${currentUser!.name} произвел ${item.name} ${formatNumber(input.quantity)} ${item.unit}${consumedText}`
    );
    setFeedback("Производство сохранено. Склад обновлен.");
    return { ok: true };
  }

  function cancelProduction(id: string, reason: string) {
    const rec = production.find((p) => p.id === id);
    if (!rec || rec.status === "deleted") return;
    const item = items.find((i) => i.id === rec.itemId);
    markDeleted(setProduction, id, reason);
    if (item && item.stockTracked) {
      adjustStock(item.id, -rec.quantity);
      pushMovement(item, "adjustment_out", -rec.quantity, "production", id);
    }
    rec.consumedMaterials.forEach((c) => {
      const m = items.find((i) => i.id === c.itemId);
      if (m && m.stockTracked) {
        adjustStock(m.id, c.quantity);
        pushMovement(m, "adjustment_in", c.quantity, "production", id);
      }
    });
    pushActivity(
      "production_cancelled",
      "production",
      id,
      `${currentUser!.name} отменил производство: ${rec.itemName} ${formatNumber(rec.quantity)} шт. Причина: ${reason}`
    );
    setFeedback("Запись отменена, склад скорректирован.");
  }

  // --- suppliers -------------------------------------------------------------

  function addSupplier(input: SupplierInput): Supplier {
    const ts = nowIso();
    const supplier: Supplier = {
      id: uid("sup"),
      businessId: currentBusinessId!,
      name: input.name.trim(),
      contactPerson: input.contactPerson.trim(),
      whatsappNumber: input.whatsappNumber.trim(),
      phoneNumber: input.phoneNumber.trim(),
      sellsText: input.sellsText.trim(),
      comment: input.comment.trim(),
      supplierStatus: input.supplierStatus,
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: ts,
      updatedAt: ts,
      syncStatus: "local",
    };
    setSuppliers((prev) => [...prev, supplier]);
    pushActivity("supplier_created", "supplier", supplier.id, `${currentUser!.name} добавил поставщика: ${supplier.name}`);
    setFeedback("Поставщик сохранен.");
    return supplier;
  }

  function updateSupplier(id: string, input: SupplierInput) {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: input.name.trim(),
              contactPerson: input.contactPerson.trim(),
              whatsappNumber: input.whatsappNumber.trim(),
              phoneNumber: input.phoneNumber.trim(),
              sellsText: input.sellsText.trim(),
              comment: input.comment.trim(),
              supplierStatus: input.supplierStatus,
              updatedAt: nowIso(),
            }
          : s
      )
    );
    pushActivity("supplier_updated", "supplier", id, `${currentUser!.name} изменил поставщика: ${input.name.trim()}`);
    setFeedback("Поставщик обновлен.");
  }

  function archiveSupplier(id: string) {
    const s = suppliers.find((x) => x.id === id);
    setSuppliers((prev) => prev.map((x) => (x.id === id ? { ...x, status: "archived", updatedAt: nowIso() } : x)));
    pushActivity("supplier_archived", "supplier", id, `${currentUser!.name} архивировал поставщика: ${s?.name ?? ""}`);
    setFeedback("Поставщик перемещен в архив.");
  }

  // --- clients (light CRM) ---------------------------------------------------

  function addClient(input: ClientInput): Client {
    const ts = nowIso();
    const client: Client = {
      id: uid("cli"),
      businessId: currentBusinessId!,
      type: "client",
      name: input.name.trim(),
      contactPerson: input.contactPerson.trim(),
      whatsappNumber: input.whatsappNumber.trim(),
      phoneNumber: input.phoneNumber.trim(),
      interestText: input.interestText.trim(),
      clientStatus: input.clientStatus,
      comment: input.comment.trim(),
      status: "active",
      createdByUserId: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: ts,
      updatedAt: ts,
      syncStatus: "local",
    };
    setClients((prev) => [...prev, client]);
    pushActivity("client_created", "client", client.id, `${currentUser!.name} добавил клиента: ${client.name}`);
    setFeedback("Клиент сохранен.");
    return client;
  }

  function updateClient(id: string, input: ClientInput) {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: input.name.trim(),
              contactPerson: input.contactPerson.trim(),
              whatsappNumber: input.whatsappNumber.trim(),
              phoneNumber: input.phoneNumber.trim(),
              interestText: input.interestText.trim(),
              clientStatus: input.clientStatus,
              comment: input.comment.trim(),
              updatedAt: nowIso(),
            }
          : c
      )
    );
    pushActivity("client_updated", "client", id, `${currentUser!.name} изменил клиента: ${input.name.trim()}`);
    setFeedback("Клиент обновлен.");
  }

  function archiveClient(id: string) {
    const c = clients.find((x) => x.id === id);
    setClients((prev) => prev.map((x) => (x.id === id ? { ...x, status: "archived", updatedAt: nowIso() } : x)));
    pushActivity("client_archived", "client", id, `${currentUser!.name} архивировал клиента: ${c?.name ?? ""}`);
    setFeedback("Клиент перемещен в архив.");
  }

  const value: AppDataContextValue = {
    currentBusiness,
    currentBusinessId,
    currentUser,
    role,
    businessMemberships: useMemo(
      () => (currentBusinessId ? memberships.filter((m) => m.businessId === currentBusinessId) : []),
      [memberships, currentBusinessId]
    ),
    allItems,
    activeItems,
    sellableItems,
    purchasableItems,
    producibleItems,
    consumableItems,
    stockItems,
    activeSales,
    allSales,
    activeStockPurchases,
    allStockPurchases,
    activeOneOff,
    allOneOff,
    activeFixed,
    allFixed,
    activeProduction,
    allProduction,
    activeSuppliers,
    allSuppliers,
    activeClients,
    allClients,
    stockMovements,
    businessActivity,
    totalExpenses,
    itemById,
    supplierById,
    movementsForItem,
    pinSet,
    unlocked,
    login,
    logout,
    setPin,
    feedback,
    showFeedback,
    createCompany,
    loadDemoData,
    resetData,
    addItem,
    updateItem,
    archiveItem,
    addSale,
    cancelSale,
    addStockPurchase,
    cancelStockPurchase,
    addOneOffExpense,
    cancelOneOffExpense,
    addFixedExpense,
    cancelFixedExpense,
    addProduction,
    cancelProduction,
    addSupplier,
    updateSupplier,
    archiveSupplier,
    addClient,
    updateClient,
    archiveClient,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;

  // Mark a record deleted in any soft-deletable collection.
  function markDeleted<T extends { id: string; status: "active" | "deleted" }>(
    setter: Dispatch<SetStateAction<T[]>>,
    id: string,
    reason: string
  ) {
    setter((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "deleted",
              deletedAt: nowIso(),
              deletedByUserId: currentUser!.id,
              deletedByName: currentUser!.name,
              deleteReason: reason,
            }
          : r
      )
    );
  }
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
