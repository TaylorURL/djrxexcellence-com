import { agent, brokerage, market } from "@/config/site";
import AgentPortrait from "@/components/AgentPortrait";
import Art from "@/components/Art";
import HeroSearch from "@/components/home/HeroSearch";

export default function Hero() {
  return (
    <section
      data-hero
      className="on-dark relative overflow-hidden bg-brand-blue-deep text-white"
    >
      <div className="hero-terrain absolute inset-0" aria-hidden="true" />
      <div className="hero-wash absolute inset-0" aria-hidden="true" />

      <div className="page-shell relative grid gap-16 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:py-20">
        <div className="space-y-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red-light">
            {brokerage.name} · {market.primary}
          </p>

          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.06] sm:text-[2.625rem]">
            Homes in Dayton and seven towns either side.
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-white/75">
            Search what is on the market, save what is worth a second look, and
            get a straight read on price.
          </p>

          <HeroSearch />
        </div>

        <div className="relative mx-auto w-full max-w-[22rem] lg:mx-0 lg:ml-auto lg:max-w-[24rem]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <AgentPortrait className="h-full w-full" priority />
          </div>

          <Art
            src="/art/sign.svg"
            width={140}
            height={150}
            className="pointer-events-none absolute -right-4 top-6 hidden w-24 sm:block"
          />

          <div className="absolute -bottom-6 -left-4 rounded-2xl bg-surface px-5 py-4 text-ink shadow-lift sm:-left-6">
            <div className="flex items-center gap-3">
              <Art
                src="/brand/remax-pin.svg"
                width={26}
                height={29}
                className="h-7 w-auto"
              />
              <span>
                <span className="block font-display text-base font-semibold leading-tight">
                  {agent.name}
                </span>
                <span className="block text-xs text-ink-muted">
                  {agent.title}, {market.county}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
