import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, PenLine, Truck } from "lucide-react";
import heroHamper from "@/assets/hero-hamper.jpg";
import { HamperCard } from "@/components/site/HamperCard";
import { Section } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { categories, hampers } from "@/data/hampers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A_S Hamper — Personalised Gift Hampers, Hand-Packed" },
      {
        name: "description",
        content:
          "Build your own gift hamper or shop curated baskets for birthdays, anniversaries, weddings, festivals and corporate gifting. Photo, message and date of your choice.",
      },
      { property: "og:title", content: "A_S Hamper — Personalised Gift Hampers" },
      {
        property: "og:description",
        content:
          "Curated and custom-built gift hampers, hand-packed in small batches and delivered on the day that matters.",
      },
    ],
    links: [{ rel: "preload", as: "image", href: heroHamper, fetchPriority: "high" }],
  }),
  component: Home,
});

const steps = [
  { icon: Gift, title: "Pick a basket", body: "Wicker, rigid keepsake box or a wooden trunk." },
  { icon: PenLine, title: "Make it personal", body: "Add items, a photo, and a hand-written card." },
  { icon: Truck, title: "Choose the day", body: "Pick a delivery date, slot or a surprise drop." },
];

function Home() {
  const bestSellers = hampers.filter((h) => h.tags.includes("bestseller"));

  return (
    <>
      <section className="surface-plum relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow text-gold">Personalised gifting, since 2016</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              Hampers that feel <em className="text-gradient-gold not-italic">hand-written</em>,
              not shopped.
            </h1>
            <p className="mt-6 max-w-md text-base/relaxed opacity-85">
              Choose a basket, fill it with the things they love, tuck in a photo and a note. We
              hand-pack every order and deliver it on the day that matters.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link to="/customize">
                  Build your own hamper <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:text-gold"
              >
                <Link to="/shop">Shop all hampers</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-gold/20 pt-6 text-sm">
              {[
                ["12k+", "hampers delivered"],
                ["4.9/5", "average rating"],
                ["48 cities", "same-week delivery"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-2xl text-gold">{k}</dt>
                  <dd className="mt-1 opacity-75">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-lg shadow-luxe">
            <img
              src={heroHamper}
              alt="Luxury A_S Hamper gift basket with chocolates, candle and dried flowers"
              width={1600}
              height={1200}
              fetchPriority="high"
              decoding="async"
              className="size-full object-cover"
            />
          </div>

        </div>
      </section>

      <Section>
        <p className="eyebrow">Shop by occasion</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">Every occasion, wrapped</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-4/5 overflow-hidden rounded-lg"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={800}
                height={800}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-plum/85 via-plum/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="font-display text-xl">{c.name}</h3>
                <p className="mt-1 text-xs opacity-80">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title}>
              <s.icon className="size-6 text-primary" />
              <p className="eyebrow mt-4">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Loved most</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Best sellers</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/best-sellers">View all</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((h) => (
            <HamperCard key={h.slug} hamper={h} />
          ))}
        </div>
      </Section>

      <Section className="!py-0">
        <div className="surface-plum grid items-center gap-8 rounded-lg p-10 md:grid-cols-2 md:p-16">
          <div>
            <p className="eyebrow text-gold">Corporate gifting</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Bulk hampers with your logo on the ribbon
            </h2>
            <p className="mt-4 max-w-md opacity-85">
              Diwali, onboarding kits, client thank-yous. Custom branding, GST invoicing and
              multi-address dispatch from 25 units.
            </p>
          </div>
          <div className="md:justify-self-end">
            <Button asChild variant="gold" size="lg">
              <Link to="/corporate">Request a quote</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <p className="eyebrow">Kind words</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">From people who gifted</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            [
              "The photo card made my mother cry. Packaging felt like it cost twice the price.",
              "Ritika S., Pune",
            ],
            [
              "Ordered 60 Diwali hampers for the team. Branded ribbons, delivered to 60 addresses.",
              "Arjun M., Bengaluru",
            ],
            [
              "Built my own basket in five minutes and it arrived exactly as previewed.",
              "Neha T., Delhi",
            ],
          ].map(([quote, who]) => (
            <blockquote key={who} className="rounded-lg border border-border bg-card p-7">
              <p className="font-display text-xl leading-snug">“{quote}”</p>
              <footer className="eyebrow mt-5">{who}</footer>
            </blockquote>
          ))}
        </div>
      </Section>
    </>
  );
}
