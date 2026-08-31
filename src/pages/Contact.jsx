import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  agent,
  agentEmail,
  brokerage,
  market,
  phoneLines,
} from "@/config/site";
import { agentSchema } from "@/lib/schema";
import Seo from "@/components/Seo";
import LeadForm from "@/components/LeadForm";

export default function Contact() {
  const mapQuery = encodeURIComponent(
    `${brokerage.name}, ${brokerage.street}, ${brokerage.city}, ${brokerage.state} ${brokerage.zip}`,
  );

  return (
    <div className="page-shell py-16">
      <Seo
        title="Contact"
        description={`Reach ${agent.name} at ${brokerage.name} in ${market.primary}. Buying, selling, or still deciding, send the question and get the next step back.`}
        schema={agentSchema()}
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="font-display text-4xl font-semibold">
            Start the conversation
          </h1>
          <p className="leading-relaxed text-ink-muted">
            Buying, selling, or still deciding: send what you are trying to do
            and {agent.name.split(" ")[0]} comes back with the next step.
          </p>
          <ul className="space-y-4 border-t border-surface-line pt-6">
            <li className="flex items-start gap-3">
              <Phone
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-red"
                aria-hidden="true"
              />
              <div>
                {phoneLines.map((line) => (
                  <p key={line.key}>
                    <a className="font-semibold" href={`tel:${line.number}`}>
                      {line.number}
                    </a>
                    <span className="ml-2 text-sm text-ink-muted">
                      {line.label}
                    </span>
                  </p>
                ))}
                <p className="text-sm text-ink-muted">Call or text</p>
              </div>
            </li>
            {agentEmail ? (
              <li className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-red"
                  aria-hidden="true"
                />
                <a className="font-semibold" href={`mailto:${agentEmail}`}>
                  {agentEmail}
                </a>
              </li>
            ) : null}
            <li className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-red"
                aria-hidden="true"
              />
              <div>
                <address className="not-italic">
                  {brokerage.name}
                  <br />
                  {brokerage.street}
                  <br />
                  {brokerage.city}, {brokerage.state} {brokerage.zip}
                </address>
                <a
                  className="mt-1 inline-block text-sm font-semibold text-brand-blue"
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions to the Office
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-red"
                aria-hidden="true"
              />
              <p className="text-ink-muted">
                Showings run seven days a week, evenings included. Messages sent
                here usually get a reply the same day.
              </p>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-surface-line bg-surface p-8 shadow-card">
          <h2 className="font-display text-2xl font-semibold">
            Send a Message
          </h2>
          <div className="mt-6">
            <LeadForm kind="contact" submitLabel="Send Message" />
          </div>
        </div>
      </div>
    </div>
  );
}
