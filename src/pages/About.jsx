import { Mail, Phone } from "lucide-react";
import {
  agent,
  agentEmail,
  agentLicense,
  brokerage,
  market,
  phoneLines,
} from "@/config/site";
import { agentSchema } from "@/lib/schema";
import Seo from "@/components/Seo";
import AgentPortrait from "@/components/AgentPortrait";
import Button from "@/components/ui/Button";
import AreaGrid from "@/components/home/AreaGrid";

export default function About() {
  return (
    <div className="page-shell py-16">
      <Seo
        title={`About ${agent.name}`}
        description={`${agent.name} represents buyers and sellers across ${market.county} and the towns around it, out of ${brokerage.name} in ${market.primary}.`}
        schema={agentSchema()}
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <AgentPortrait className="aspect-[4/5] w-full rounded-2xl" />
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-semibold">{agent.name}</h1>
          <p className="text-lg text-ink-muted">
            {agent.title} at {brokerage.name} in {market.primary}
          </p>
          <p className="leading-relaxed text-ink-muted">
            {agent.name} works {market.county} and the towns around it on one
            principle: the numbers and the timeline in plain language, early
            enough to act on.
          </p>
          <p className="leading-relaxed text-ink-muted">
            The flood zone before the offer, not after the insurance quote. The
            school district for the address, not the city on the mail.
          </p>

          <dl className="grid gap-4 border-t border-surface-line pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-muted">Brokerage</dt>
              <dd className="font-semibold">{brokerage.name}</dd>
            </div>
            {agentLicense ? (
              <div>
                <dt className="text-sm text-ink-muted">TREC License</dt>
                <dd className="font-semibold">{agentLicense}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm text-ink-muted">Office Address</dt>
              <dd className="font-semibold">
                {brokerage.street}, {brokerage.city}, {brokerage.state}{" "}
                {brokerage.zip}
              </dd>
            </div>
            {phoneLines.map((line) => (
              <div key={line.key}>
                <dt className="text-sm text-ink-muted">{line.label}</dt>
                <dd className="font-semibold">
                  <a
                    className="inline-flex items-center gap-1.5"
                    href={`tel:${line.number}`}
                  >
                    <Phone
                      className="h-4 w-4 text-brand-red"
                      aria-hidden="true"
                    />
                    {line.number}
                  </a>
                </dd>
              </div>
            ))}
            {agentEmail ? (
              <div>
                <dt className="text-sm text-ink-muted">Email</dt>
                <dd className="font-semibold">
                  <a
                    className="inline-flex items-center gap-1.5"
                    href={`mailto:${agentEmail}`}
                  >
                    <Mail
                      className="h-4 w-4 text-brand-red"
                      aria-hidden="true"
                    />
                    {agentEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm text-ink-muted">MLS</dt>
              <dd className="font-semibold">{market.mls}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button to="/contact">Get in Touch</Button>
            <Button to="/listings" variant="outline">
              Browse Listings
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-semibold">Where he works</h2>
        <p className="mt-3 max-w-measure leading-relaxed text-ink-muted">
          Three counties and eight towns, each with its own districts, tax rates
          and flood maps.
        </p>
        <div className="mt-8">
          <AreaGrid />
        </div>
      </section>
    </div>
  );
}
