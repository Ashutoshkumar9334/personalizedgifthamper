import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, Check, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import heroHamper from "@/assets/hero-hamper.jpg";
import { PageHeader, Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  addOnItems,
  boxOptions,
  deliverySlots,
  inr,
  wrappingOptions,
} from "@/data/hampers";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Build Your Own Gift Hamper | A_S Hamper" },
      {
        name: "description",
        content:
          "Choose a basket, add items, upload a photo, write a card, pick wrapping and a delivery slot — then preview your hamper before you order.",
      },
      { property: "og:title", content: "Build Your Own Gift Hamper | A_S Hamper" },
      {
        property: "og:description",
        content: "Six steps to a hamper that's entirely yours. Preview before you order.",
      },
    ],
  }),
  component: Customize,
});

const steps = [
  "Gift box",
  "Add items",
  "Photo",
  "Message",
  "Wrapping",
  "Delivery",
  "Preview",
] as const;

function Customize() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [step, setStep] = useState(0);
  const [box, setBox] = useState(boxOptions[0]!.id);
  const [items, setItems] = useState<string[]>([]);
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [wrapping, setWrapping] = useState(wrappingOptions[0]!.id);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState(deliverySlots[0]!);

  const selectedBox = boxOptions.find((b) => b.id === box)!;
  const selectedWrap = wrappingOptions.find((w) => w.id === wrapping)!;
  const selectedItems = addOnItems.filter((i) => items.includes(i.id));
  const total =
    selectedBox.price +
    selectedWrap.price +
    selectedItems.reduce((sum, i) => sum + i.price, 0) +
    (photoName ? 199 : 0);

  const toggleItem = (id: string) =>
    setItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleAdd = () => {
    if (items.length === 0) {
      toast.error("Add at least one item to your hamper");
      setStep(1);
      return;
    }
    addToCart({
      id: `custom-${Date.now()}`,
      slug: "custom-hamper",
      name: `Custom ${selectedBox.name}`,
      price: total,
      image: heroHamper,
      custom: {
        box: selectedBox.name,
        items: selectedItems.map((i) => i.name),
        message: message ? `${message}${signature ? ` — ${signature}` : ""}` : "",
        wrapping: selectedWrap.name,
        photoName: photoName || undefined,
      },
    });
    toast.success("Your custom hamper is in the cart");
    navigate({ to: "/cart" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Personalisation studio"
        title="Build your own hamper"
        description="Seven quick steps. Change anything before you add it to the cart."
      />

      <Section>
        <ol className="flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-colors",
                  i === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < step
                      ? "border-gold bg-gold/15 text-foreground"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < step && <Check className="size-3" />}
                {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="rounded-lg border border-border bg-card p-8">
            {step === 0 && (
              <Step title="Select a gift box or basket">
                <div className="grid gap-3 sm:grid-cols-2">
                  {boxOptions.map((b) => (
                    <OptionCard
                      key={b.id}
                      active={box === b.id}
                      onClick={() => setBox(b.id)}
                      title={b.name}
                      meta={inr(b.price)}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step title="Add personalised items">
                <div className="grid gap-3 sm:grid-cols-2">
                  {addOnItems.map((i) => (
                    <OptionCard
                      key={i.id}
                      active={items.includes(i.id)}
                      onClick={() => toggleItem(i.id)}
                      title={i.name}
                      meta={inr(i.price)}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step title="Upload a photo (optional, +₹199)">
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-input p-12 text-center">
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoName || "Choose a JPG or PNG for the printed card or mug"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
                {photoName && (
                  <Button variant="ghost" className="mt-3" onClick={() => setPhotoName("")}>
                    Remove photo
                  </Button>
                )}
              </Step>
            )}

            {step === 3 && (
              <Step title="Add a custom message card">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="msg">Your message</Label>
                    <Textarea
                      id="msg"
                      maxLength={300}
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Happy birthday, Aai. Thank you for everything…"
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {message.length}/300 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sig">Sign off as</Label>
                    <Input
                      id="sig"
                      maxLength={60}
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Shreya"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step title="Choose gift wrapping">
                <div className="grid gap-3 sm:grid-cols-2">
                  {wrappingOptions.map((w) => (
                    <OptionCard
                      key={w.id}
                      active={wrapping === w.id}
                      onClick={() => setWrapping(w.id)}
                      title={w.name}
                      meta={w.price === 0 ? "Included" : inr(w.price)}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step title="Delivery date & time">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label>Delivery date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "mt-2 w-full justify-start font-normal",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className={cn("pointer-events-auto p-3")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Time slot</Label>
                    <div className="mt-2 space-y-2">
                      {deliverySlots.map((s) => (
                        <OptionCard
                          key={s}
                          active={slot === s}
                          onClick={() => setSlot(s)}
                          title={s}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Step>
            )}

            {step === 6 && (
              <Step title="Preview your hamper">
                <div className="flex gap-6">
                  <img
                    src={heroHamper}
                    alt="Preview of your custom hamper"
                    loading="lazy"
                    width={400}
                    height={300}
                    className="hidden size-40 rounded-md object-cover sm:block"
                  />
                  <dl className="flex-1 space-y-2 text-sm">
                    <Row label="Box" value={selectedBox.name} />
                    <Row
                      label="Items"
                      value={selectedItems.map((i) => i.name).join(", ") || "None selected"}
                    />
                    <Row label="Photo" value={photoName || "None"} />
                    <Row label="Message" value={message || "None"} />
                    <Row label="Signed" value={signature || "—"} />
                    <Row label="Wrapping" value={selectedWrap.name} />
                    <Row
                      label="Delivery"
                      value={date ? `${format(date, "PPP")} · ${slot}` : `Date not set · ${slot}`}
                    />
                  </dl>
                </div>
              </Step>
            )}

            <div className="mt-10 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
              ) : (
                <Button variant="gold" onClick={handleAdd}>
                  Add to cart · {inr(total)}
                </Button>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-32">
            <p className="eyebrow">Running total</p>
            <p className="mt-2 font-display text-4xl">{inr(total)}</p>
            <Separator className="my-5" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{selectedBox.name}</dt>
                <dd>{inr(selectedBox.price)}</dd>
              </div>
              {selectedItems.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <dt className="text-muted-foreground">{i.name}</dt>
                  <dd>{inr(i.price)}</dd>
                </div>
              ))}
              {photoName && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Photo printing</dt>
                  <dd>{inr(199)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{selectedWrap.name}</dt>
                <dd>{selectedWrap.price === 0 ? "Free" : inr(selectedWrap.price)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  title,
  meta,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  meta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-md border p-4 text-left text-sm transition-colors",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
      )}
    >
      <span>{title}</span>
      {meta && <span className="shrink-0 text-muted-foreground">{meta}</span>}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-border/60 pb-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
