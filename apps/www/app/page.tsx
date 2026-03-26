"use client";

import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "lucide-react";
import { DemoPlayer, type DemoStatus, type DemoTimeline } from "uitodemo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const timeline: DemoTimeline = [
  { type: "wait", delay: 900, label: "Settle frame" },
  { type: "focus", target: "search", cursor: "text", label: "Focus search" },
  {
    type: "type",
    target: "search",
    value: "Cold",
    delay: 120,
    cursor: "text",
    label: "Type first term",
  },
  { type: "wait", delay: 520, label: "Think before typing" },
  {
    type: "type",
    target: "search",
    value: " brew bottle",
    delay: 92,
    cursor: "text",
    label: "Complete search",
  },
  { type: "wait", delay: 900, label: "Scan matches" },
  {
    type: "click",
    target: "filter-ready",
    cursor: "pointer",
    hover: true,
    label: "Toggle availability",
  },
  { type: "wait", delay: 700, label: "Review filters" },
  {
    type: "click",
    target: "product-2",
    cursor: "pointer",
    hover: true,
    label: "Open highlighted item",
  },
  { type: "wait", delay: 720, label: "Inspect product card" },
  {
    type: "click",
    target: "quick-restock",
    cursor: "pointer",
    hover: true,
    label: "Check quick action",
  },
  { type: "wait", delay: 620, label: "Review quick action" },
  {
    type: "click",
    target: "remove-product-2",
    cursor: "pointer",
    hover: true,
    label: "Remove highlighted product",
  },
  { type: "wait", delay: 620, label: "Confirm action" },
  {
    type: "scroll",
    target: "product-8",
    align: "center",
    delay: 950,
    cursor: "arrow",
    label: "Scroll deeper into catalog",
  },
  {
    type: "click",
    target: "product-8",
    cursor: "pointer",
    hover: true,
    label: "Inspect lower product",
  },
  { type: "wait", delay: 680, label: "Review lower item" },
  {
    type: "scroll",
    target: "catalog-top",
    align: "start",
    delay: 850,
    cursor: "arrow",
    label: "Return to top action",
  },
  {
    type: "click",
    target: "add-product",
    cursor: "pointer",
    hover: true,
    label: "Add new product",
  },
  { type: "wait", delay: 1400, label: "Land on call to action" },
];

const initialProducts = [
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
  {
    id: "product-4",
    name: "Kenya AA",
    price: "$19.00",
    stock: "10 bags",
    tag: "bright",
    tone: "berry acidity",
  },
  {
    id: "product-5",
    name: "Oat Latte Mix",
    price: "$11.00",
    stock: "18 units",
    tag: "ready",
    tone: "barista staple",
  },
  {
    id: "product-6",
    name: "Decaf Blend",
    price: "$15.00",
    stock: "6 bags",
    tag: "smooth",
    tone: "low acidity",
  },
  {
    id: "product-7",
    name: "Cascara Soda",
    price: "$6.50",
    stock: "14 units",
    tag: "seasonal",
    tone: "sparkling cherry",
  },
  {
    id: "product-8",
    name: "Colombia Gesha",
    price: "$24.00",
    stock: "5 bags",
    tag: "limited",
    tone: "floral cup",
  },
  {
    id: "product-9",
    name: "Mocha Sauce",
    price: "$9.00",
    stock: "0 units",
    tag: "backorder",
    tone: "restock pending",
  },
  {
    id: "product-10",
    name: "Brew Filters",
    price: "$5.00",
    stock: "40 packs",
    tag: "supply",
    tone: "daily essential",
  },
];

const installSnippet = "pnpm add uitodemo";
const exampleSnippet = `import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "search", cursor: "text" },
  { type: "type", target: "search", value: "Cold brew", delay: 90, cursor: "text" },
  { type: "scroll", target: "product-8", align: "center", delay: 700 },
  { type: "click", target: "product-8", cursor: "pointer", hover: true },
];

<DemoPlayer timeline={timeline} isActive cursor>
  <YourProductUI />
</DemoPlayer>`;

const points = [
  "Render your real UI.",
  "Drive it with a timeline.",
  "Use real clicks, typing and scroll.",
];

export default function HomePage() {
  const [items, setItems] = useState(initialProducts);
  const nextProductIdRef = useRef(initialProducts.length + 1);
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
    setItems(initialProducts);
    nextProductIdRef.current = initialProducts.length + 1;
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
      return (
        product.tag === "fruity" ||
        product.tag === "signature" ||
        product.tag === "seasonal"
      );
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-base">uitodemo</p>
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a href="#demo">Demo</a>
          <a href="#example">Example</a>
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <section className="pt-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline">Product intro library</Badge>

            <h1 className="mt-6 text-5xl tracking-tight text-balance">
              A simple way to show a product flow with real UI.
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
              `uitodemo` lets you render your actual interface and guide it with
              clicks, typing, scrolling and playback controls. It is useful for
              docs homes, launch pages and lightweight product intros.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild>
                <a href="#demo">Watch demo</a>
              </Button>
              <Button asChild variant="outline">
                <a href="#example">View example</a>
              </Button>
            </div>

            <div className="mt-10 space-y-3">
              <div className="mx-auto max-w-md">
                <InputGroup>
                  <InputGroupInput readOnly value={installSnippet} />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Copy install command"
                      title="Copy install command"
                    >
                      <CopyIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex flex-wrap gap-2">
                {points.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="example"
          className="mt-20 grid gap-10"
          style={{ gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)" }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Why it works</p>
            <h2 className="mt-3 text-3xl tracking-tight">
              Small API. Real interface. Clear product story.
            </h2>
            <div className="mt-8 space-y-6">
              {points.map((item, index) => (
                <div key={item}>
                  <p className="text-base">{item}</p>
                  {index < points.length - 1 ? (
                    <Separator className="mt-6" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-0 bg-foreground py-0 text-background shadow-sm">
            <CardHeader>
              <CardDescription className="text-xs text-background/70">
                Example
              </CardDescription>
              <CardTitle className="text-2xl text-background">
                One player, one timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[360px]">
                <pre className="p-6 text-sm leading-7 text-background">
                  <code>{exampleSnippet}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>

        <section id="demo" className="mt-20">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs text-muted-foreground">Live demo</p>
            <h2 className="mt-3 text-3xl tracking-tight">
              The player below is driving a real interface.
            </h2>
            <p className="mt-3 text-base leading-8 text-muted-foreground">
              It types into search, toggles filters, mutates state, scrolls the
              list and returns to the top action.
            </p>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-sm">
            <DemoPlayer
              timeline={timeline}
              isActive
              frameBorderRadius="lg"
              className="overflow-hidden rounded-3xl"
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
                className="grid h-full min-h-0 grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-3xl border bg-muted/30"
              >
                <aside className="flex h-full min-h-0 flex-col border-r bg-muted/50">
                  <div className="flex h-full min-h-0 flex-col p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground">
                      UI
                    </div>

                    <nav className="mt-6 space-y-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveSection("inventory");
                          setStatusMessage("Inventory view is active.");
                        }}
                        variant={
                          activeSection === "inventory" ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                      >
                        Inventory
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveSection("orders");
                          setStatusMessage("Orders view is active.");
                        }}
                        variant={
                          activeSection === "orders" ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                      >
                        Orders
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveSection("customers");
                          setStatusMessage("Customers view is active.");
                        }}
                        variant={
                          activeSection === "customers" ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                      >
                        Customers
                      </Button>
                    </nav>

                    <Card className="mt-auto py-0 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">
                          Shift pulse
                        </p>
                        <strong className="mt-2 block text-sm">
                          Steady afternoon traffic
                        </strong>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Peak expected in 18 min
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </aside>

                <div className="h-full min-h-0 overflow-y-auto p-6">
                  <div data-demo="catalog-top" className="h-px w-full" />
                  <header className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Coffee inventory
                      </p>
                      <h3 className="text-3xl">Product catalog</h3>
                    </div>
                    <Button
                      type="button"
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
                    </Button>
                  </header>

                  <Card className="mb-4 py-0 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Today</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm">{statusMessage}</span>
                        <span className="text-sm text-muted-foreground">
                          {statusDelta}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveFilter("all");
                        setStatusMessage("Showing all products.");
                        setStatusDelta(`${items.length} products visible`);
                      }}
                      variant={activeFilter === "all" ? "default" : "outline"}
                    >
                      All products
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveFilter("ready");
                        setStatusMessage("Filtered to ready stock.");
                        setStatusDelta("Only in-stock items");
                      }}
                      variant={activeFilter === "ready" ? "default" : "outline"}
                      data-demo="filter-ready"
                    >
                      Ready stock
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setActiveFilter("seasonal");
                        setStatusMessage("Filtered to seasonal picks.");
                        setStatusDelta("Curated selection");
                      }}
                      variant={
                        activeFilter === "seasonal" ? "default" : "outline"
                      }
                    >
                      Seasonal
                    </Button>
                  </div>

                  <label className="mb-4 block">
                    <span className="mb-2 block text-sm">Search</span>
                    <Input
                      data-demo="search"
                      defaultValue=""
                      readOnly
                      placeholder="Search product"
                      className="h-12"
                    />
                  </label>

                  <div className="grid gap-3 pb-8">
                    {visibleItems.map((product) => {
                      const featured = product.id === "product-2";
                      const selected = selectedProductId === product.id;

                      return (
                        <article
                          key={product.id}
                          className={[
                            "rounded-xl border bg-card p-4",
                            selected
                              ? "ring-1 ring-ring"
                              : featured
                                ? "bg-muted/40"
                                : "",
                          ].join(" ")}
                        >
                          <div
                            data-demo={product.id}
                            className="flex items-center justify-between gap-4"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setStatusMessage(`${product.name} selected.`);
                              setStatusDelta(product.stock);
                            }}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base">{product.name}</p>
                                <Badge variant="outline">{product.tag}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {product.stock}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {product.tone}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-base">{product.price}</p>
                              {featured ? (
                                <div className="mt-2 flex items-center justify-end gap-2">
                                  <Button
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
                                    variant="outline"
                                    size="sm"
                                  >
                                    Quick restock
                                  </Button>
                                  <Button
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
                                        current === "product-2"
                                          ? null
                                          : current,
                                      );
                                      setStatusMessage(
                                        "Cold Brew Bottle was removed.",
                                      );
                                      setStatusDelta("Catalog updated");
                                    }}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <p className="mt-1 text-sm text-muted-foreground">
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
          </div>
        </section>
      </div>
    </main>
  );
}
