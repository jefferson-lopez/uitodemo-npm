"use client";

import { useEffect, useRef, useState } from "react";
import { DemoPlayer, type DemoStatus, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "wait", delay: 1100, label: "Settle frame" },
  { type: "focus", target: "search", cursor: "text", label: "Focus search" },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 520, label: "Think before typing" },
  {
    type: "type",
    target: "search",
    value: "Cold",
    delay: 120,
    cursor: "text",
    label: "Type first term",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 640, label: "Pause briefly" },
  {
    type: "type",
    target: "search",
    value: " brew bottle",
    delay: 92,
    cursor: "text",
    label: "Complete search",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 1200, label: "Scan matches" },
  {
    type: "click",
    target: "filter-ready",
    cursor: "pointer",
    hover: true,
    label: "Toggle availability",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 780, label: "Review filters" },
  {
    type: "click",
    target: "product-2",
    cursor: "pointer",
    hover: true,
    label: "Open highlighted item",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 980, label: "Inspect product card" },
  {
    type: "click",
    target: "quick-restock",
    cursor: "pointer",
    hover: true,
    label: "Check quick action",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 720, label: "Review quick action" },
  {
    type: "click",
    target: "remove-product-2",
    cursor: "pointer",
    hover: true,
    label: "Remove highlighted product",
  },
  { type: "wait", delay: 500, label: "Hold step" },
  { type: "wait", delay: 860, label: "Confirm action" },
  {
    type: "click",
    target: "add-product",
    cursor: "pointer",
    hover: true,
    label: "Move to CTA",
  },
  { type: "wait", delay: 1600, label: "Land on call to action" },
];

const products = [
  {
    id: "product-1",
    name: "Ethiopia Natural",
    price: "$18.00",
    stock: "12 bags",
    tag: "fruity",
    tone: "light roast",
  },
  {
    id: "product-2",
    name: "Cold Brew Bottle",
    price: "$7.50",
    stock: "24 units",
    tag: "best seller",
    tone: "ready to drink",
  },
  {
    id: "product-3",
    name: "Espresso Blend",
    price: "$16.00",
    stock: "8 bags",
    tag: "signature",
    tone: "dense crema",
  },
];

const metrics = [
  { label: "Sell-through", value: "84%" },
  { label: "Avg. prep", value: "02:18" },
  { label: "Stock alerts", value: "03" },
];

export default function HomePage() {
  const [items, setItems] = useState(products);
  const nextProductIdRef = useRef(products.length + 1);
  const [activeSection, setActiveSection] = useState("inventory");
  const [activeFilter, setActiveFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState(
    "Cold brew is leading conversions this hour.",
  );
  const [statusDelta, setStatusDelta] = useState("+12% vs yesterday");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const resetTimerRef = useRef<number | null>(null);

  const resetDemoState = () => {
    setItems(products);
    nextProductIdRef.current = products.length + 1;
    setActiveSection("inventory");
    setActiveFilter("all");
    setStatusMessage("Cold brew is leading conversions this hour.");
    setStatusDelta("+12% vs yesterday");
    setSelectedProductId(null);
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const visibleItems = items.filter((product) => {
    if (activeFilter === "ready") {
      return product.stock !== "0 units";
    }

    if (activeFilter === "seasonal") {
      return product.tag === "fruity" || product.tag === "signature";
    }

    return true;
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-medium text-amber-700">
          npm package + demo web
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
          Demo simple para mostrar `uitodemo`
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Una vista más limpia y normal para probar el timeline, el cursor y el
          layout del paquete sin estilos raros.
        </p>
      </section>

      <section className="mb-6 grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Live package preview
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              DemoPlayer
            </h2>
          </div>
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
            workspace: uitodemo
          </div>
        </div>

        <DemoPlayer
          timeline={timeline}
          isActive
          frameBorderRadius="lg"
          className="rounded-2xl overflow-hidden"
          onStatusChange={(status: DemoStatus) => {
            if (resetTimerRef.current) {
              window.clearTimeout(resetTimerRef.current);
              resetTimerRef.current = null;
            }

            if (status === "completed") {
              resetTimerRef.current = window.setTimeout(() => {
                resetDemoState();
                resetTimerRef.current = null;
              }, 900);
            }
          }}
          cursor={{
            enabled: true,
            theme: "black",
            hideNativeCursor: false,
          }}
        >
          <div
            data-demo="app"
            className="grid h-full min-h-0 grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
          >
            <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-100">
              <div className="flex h-full min-h-0 flex-col p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                  UI
                </div>

                <nav className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("inventory");
                      setStatusMessage("Inventory view is active.");
                    }}
                    className={[
                      "block w-full rounded-lg px-3 py-2 text-left text-sm",
                      activeSection === "inventory"
                        ? "bg-slate-900 font-medium text-white"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("orders");
                      setStatusMessage("Orders view is active.");
                    }}
                    className={[
                      "block w-full rounded-lg px-3 py-2 text-left text-sm",
                      activeSection === "orders"
                        ? "bg-slate-900 font-medium text-white"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection("customers");
                      setStatusMessage("Customers view is active.");
                    }}
                    className={[
                      "block w-full rounded-lg px-3 py-2 text-left text-sm",
                      activeSection === "customers"
                        ? "bg-slate-900 font-medium text-white"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    Customers
                  </button>
                </nav>

                <div className="mt-auto rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Shift pulse
                  </p>
                  <strong className="mb-2 block text-sm leading-6 text-slate-900">
                    Steady afternoon traffic
                  </strong>
                  <span className="block text-sm text-slate-600">
                    Peak expected in 18 min
                  </span>
                </div>
              </div>
            </aside>

            <div className="h-full min-h-0 overflow-hidden p-6">
              <header className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Coffee inventory</p>
                  <h3 className="text-3xl font-semibold text-slate-900">
                    Product catalog
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
                  data-demo="add-product"
                  onClick={() => {
                    setItems((current) => {
                      const nextId = `product-${nextProductIdRef.current}`;
                      nextProductIdRef.current += 1;

                      return [
                        ...current,
                        {
                          id: nextId,
                          name: "House Blend",
                          price: "$14.00",
                          stock: "16 bags",
                          tag: "new",
                          tone: "balanced roast",
                        },
                      ];
                    });
                    setStatusMessage("Added a new product to the catalog.");
                    setStatusDelta("Inventory updated");
                  }}
                >
                  Add product
                </button>
              </header>

              <section className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Today
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <strong className="text-sm text-slate-900">
                    {statusMessage}
                  </strong>
                  <span className="text-sm text-slate-600">{statusDelta}</span>
                </div>
              </section>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setStatusMessage("Showing all products.");
                    setStatusDelta(`${items.length} products visible`);
                  }}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium",
                    activeFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-600",
                  ].join(" ")}
                >
                  All products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("ready");
                    setStatusMessage("Filtered to ready stock.");
                    setStatusDelta("Only in-stock items");
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-sm",
                    activeFilter === "ready"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-600",
                  ].join(" ")}
                  data-demo="filter-ready"
                >
                  Ready stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("seasonal");
                    setStatusMessage("Filtered to seasonal picks.");
                    setStatusDelta("Curated selection");
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-sm",
                    activeFilter === "seasonal"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-600",
                  ].join(" ")}
                >
                  Seasonal
                </button>
              </div>

              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Search
                </span>
                <input
                  data-demo="search"
                  defaultValue=""
                  readOnly
                  placeholder="Search product"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>

              <div className="grid gap-3">
                {visibleItems.map((product) => {
                  const featured = product.id === "product-2";
                  const selected = selectedProductId === product.id;

                  return (
                    <article
                      key={product.id}
                      className={[
                        "rounded-xl border bg-white p-4",
                        selected
                          ? "border-slate-900 ring-1 ring-slate-900"
                          : featured
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200",
                      ].join(" ")}
                    >
                      <div
                        data-demo={product.id}
                        className="flex items-center justify-between gap-4 rounded-lg text-left"
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setStatusMessage(`${product.name} selected.`);
                          setStatusDelta(product.stock);
                        }}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-medium text-slate-900">
                              {product.name}
                            </p>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium uppercase text-amber-700">
                              {product.tag}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {product.stock}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {product.tone}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-semibold text-slate-900">
                            {product.price}
                          </p>
                          {featured ? (
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                data-demo="quick-restock"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setItems((current) =>
                                    current.map((item) =>
                                      item.id === "product-2"
                                        ? {
                                            ...item,
                                            stock: "36 units",
                                            tone: "restocked just now",
                                          }
                                        : item,
                                    ),
                                  );
                                  setStatusMessage(
                                    "Cold Brew Bottle was restocked.",
                                  );
                                  setStatusDelta("Stock increased");
                                }}
                                className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-sm font-medium text-amber-700"
                              >
                                Quick restock
                              </button>
                              <button
                                type="button"
                                data-demo="remove-product-2"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setItems((current) =>
                                    current.filter(
                                      (item) => item.id !== "product-2",
                                    ),
                                  );
                                  setSelectedProductId((current) =>
                                    current === "product-2" ? null : current,
                                  );
                                  setStatusMessage(
                                    "Cold Brew Bottle was removed.",
                                  );
                                  setStatusDelta("Catalog updated");
                                }}
                                className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-sm font-medium text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">
                              Updated 8m ago
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </DemoPlayer>
      </section>
    </main>
  );
}
