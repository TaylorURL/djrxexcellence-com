import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { agent, brokerage, contactPhone } from "@/config/site";
import { isConfigured } from "@/lib/supabase";
import { fetchListings } from "@/services/listings";
import { fetchPublishedTestimonials } from "@/services/testimonials";
import { agentSchema, publisherSchema } from "@/lib/schema";
import Art from "@/components/Art";
import Seo from "@/components/app/Seo";
import ListingCard from "@/components/listing/ListingCard";
import Hero from "@/components/home/Hero";
import AreaGrid from "@/components/home/AreaGrid";
import Testimonials from "@/components/home/Testimonials";
import Button from "@/components/ui/Button";
import LeadForm from "@/components/LeadForm";

const steps = [
  {
    art: "search",
    title: "Find the Right Homes",
    body: "Search every active listing in Dayton and the surrounding Liberty County towns, then save the ones worth a second look.",
  },
  {
    art: "calendar",
    title: "Tour on Your Schedule",
    body: "Pick the addresses you want to walk through and get showings arranged around your week, not the other way around.",
  },
  {
    art: "checklist",
    title: "Write a Strong Offer",
    body: "Comparable sales, inspection timelines, and financing terms laid out plainly before anything gets signed.",
  },
  {
    art: "key",
    title: "Close and Get Keys",
    body: "Title work, lender deadlines, and the final walkthrough tracked to the closing table.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    if (!isConfigured) return;
    fetchListings({ limit: 6 })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    fetchPublishedTestimonials(6)
      .then(setTestimonials)
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <>
      <Seo
        title="Homes for Sale in Dayton, TX"
        description={`Buy and sell in Dayton, Texas and Liberty County with ${agent.name} of ${brokerage.name}. Search current listings, save your favorites, and find out what your home is worth.`}
        schema={[publisherSchema(), agentSchema()]}
      />

      <Hero />

      <section className="page-shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-5">
            <Art
              src="/art/map.svg"
              width={150}
              height={130}
              loading="lazy"
              className="hidden h-20 w-20 shrink-0 object-contain sm:block"
            />
            <div>
              <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
                Where he works
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
                Eight towns across Liberty, Harris and Chambers counties, each
                with its own school districts, flood maps and price patterns.
              </p>
            </div>
          </div>
          <Button to="/listings" variant="outline">
            Browse All Listings
          </Button>
        </div>
        <div className="mt-10">
          <AreaGrid />
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-surface-raised py-20">
          <div className="page-shell">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Currently on the market
              </h2>
              <Link
                to="/listings"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red"
              >
                See All Listings
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-defer page-shell py-20">
        <div>
          <p className="eyebrow">How It Works</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Four steps from first search to closing table.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ art, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-surface-line bg-surface-raised p-6"
            >
              <Art
                src={`/art/${art}.svg`}
                width={72}
                height={72}
                loading="lazy"
                className="h-16 w-16 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Testimonials entries={testimonials} />

      <section
        id="valuation"
        className="section-defer page-shell scroll-anchor py-20"
      >
        <div className="grid gap-12 rounded-2xl border border-surface-line bg-surface p-8 shadow-card lg:grid-cols-2 lg:p-12">
          <div className="space-y-4">
            <Art
              src="/art/checklist.svg"
              width={130}
              height={150}
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Find out what your home would sell for.
            </h2>
            <p className="leading-relaxed text-ink-muted">
              A valuation built from what has closed nearby, with the repairs
              that move the number called out. No obligation to list.
            </p>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li>· Closed comparable sales from the last six months</li>
              <li>
                · The repairs a buyer will price twice, and the ones they will
                not
              </li>
              <li>· What is competing with you on the market right now</li>
            </ul>
          </div>
          <LeadForm
            kind="valuation"
            submitLabel="Get My Valuation"
            addressField
          />
        </div>
      </section>

      <section className="on-dark section-defer bg-brand-blue-deep py-16 text-white">
        <div className="page-shell flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Still deciding whether to move?
            </h2>
            <p className="mt-2 max-w-xl text-white/70">
              A conversation costs nothing and usually settles it one way or the
              other.
            </p>
          </div>
          <Button href={`tel:${contactPhone}`} size="lg">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {contactPhone}
          </Button>
        </div>
      </section>
    </>
  );
}
