import { CopyIcon } from "lucide-react";
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
import HomeDemo from "./_components/home-demo";

const installSnippet = "pnpm add uitodemo";
const exampleSnippet = `import {
  DemoControls,
  DemoOverlay,
  DemoPlayer,
  DemoStage,
  demo,
  demoTarget,
} from "uitodemo";

const steps = demo()
  .focus("search", { cursor: "text" })
  .type("search", "Cold brew", { delay: 90, cursor: "text" })
  .scroll("product-8", { align: "center", delay: 700 })
  .click("product-8", { cursor: "pointer", hover: true })
  .build();

<DemoPlayer steps={steps} isActive cursor>
  <DemoStage>
    <YourProductUI />
  </DemoStage>
  <DemoOverlay />
  <DemoControls />
</DemoPlayer>`;

const points = [
  "Render your real UI.",
  "Drive it with a timeline.",
  "Use real clicks, typing and scroll.",
];

export default function HomePage() {
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

          <HomeDemo />
        </section>
      </div>
    </main>
  );
}
