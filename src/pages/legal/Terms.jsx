import { Link } from "react-router-dom";
import { brokerage, market } from "@/config/site";
import LegalPage from "@/components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      description="The terms that apply to using this site, its listing information, its accounts and its comment threads."
    >
      <section className="space-y-3">
        <h2>Using this site</h2>
        <p>
          Using this site means agreeing to what is on this page. If you do not
          agree with it, do not use the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Listing information</h2>
        <p>
          Listing details come from the agent, the seller, and the {market.mls}.
          It is believed accurate and it is not guaranteed. Square footage, lot
          size, year built, school assignment, tax figures, flood zone and HOA
          terms all need independent verification before they decide anything.
          Nothing on this site is an offer, and a listing can change or come off
          the market without the page updating immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Not professional advice</h2>
        <p>
          Nothing here is legal, tax, lending, insurance or appraisal advice.
          The mortgage figure on a listing page is an arithmetic estimate from
          the numbers you type into it. A lender sets the actual rate, payment
          and escrow amounts, and the county sets the tax bill.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Accounts</h2>
        <p>
          You are responsible for what happens under your account and for
          keeping your password to yourself. Use a real name and a real email
          address. An account can be closed for posting content that violates
          the section below.
        </p>
      </section>

      <section className="space-y-3">
        <h2>What you post</h2>
        <p>
          Questions posted on a listing are public. Do not post anything false,
          threatening, discriminatory, or belonging to someone else, and do not
          post another person&rsquo;s private information. Anything that
          violates fair housing law comes down. Posting content gives{" "}
          {brokerage.name} permission to display it on this site; you keep
          ownership of it.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Moderation</h2>
        <p>
          Comments can be hidden or removed. A comment is usually removed
          because it is spam, because it exposes someone&rsquo;s private
          information, or because it violates the fair housing rules on{" "}
          <Link to="/fair-housing">the fair housing page</Link>.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Availability</h2>
        <p>
          The site is served as it is. It can be down, and listing data can lag.
          Neither {brokerage.name} nor the agent is liable for a decision made
          on information that turned out to be out of date, which is why the
          verification above matters.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Governing law</h2>
        <p>
          Texas law governs these terms, and Liberty County, Texas is the venue
          for any dispute arising from them.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Brokerage</h2>
        <p>
          {brokerage.name}, {brokerage.street}, {brokerage.city},{" "}
          {brokerage.state} {brokerage.zip}. {brokerage.disclaimer}
        </p>
      </section>
    </LegalPage>
  );
}
