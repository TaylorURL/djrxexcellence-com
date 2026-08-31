import { agentEmail, brokerage, contactPhone } from "@/config/site";
import LegalPage from "@/components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="What this site collects, why it collects it, how long it is kept, and how to have it deleted."
    >
      <section className="space-y-3">
        <h2>What this site collects</h2>
        <p>
          Three things, and nothing else. What you type into a contact,
          valuation or showing request form. What you type when you create an
          account, which is your name, email address, an optional phone number,
          and a password. And what you do while signed in: the homes you save,
          the searches you save, and the questions you post on a listing.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Why it is collected</h2>
        <ul>
          <li>
            Form submissions go to {brokerage.name} so your question gets
            answered. That is the only thing they are used for.
          </li>
          <li>
            Account details identify you across visits so your saved homes and
            saved searches are still there when you come back.
          </li>
          <li>
            Questions posted on a listing are public. Your display name appears
            next to them.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Where it is stored</h2>
        <p>
          In a Supabase project controlled by this office. Your password is
          hashed by Supabase and is never visible to anyone here. Row level
          security keeps one account from reading another account&rsquo;s saved
          homes, saved searches or profile.
        </p>
      </section>

      <section className="space-y-3">
        <h2>What is not done with it</h2>
        <p>
          Nothing on this site is sold, rented, or handed to a data broker or an
          advertising network. There is no advertising pixel, no cross-site
          tracking, and no third-party analytics script. Signing in stores a
          session token in your browser so you stay signed in; that is the only
          purpose any stored value serves.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Third parties that do see it</h2>
        <ul>
          <li>
            Supabase, which hosts the database, the authentication and the
            listing photos.
          </li>
          <li>
            Vercel, which serves the site and keeps standard server request
            logs.
          </li>
          <li>
            OpenStreetMap, which serves the map tiles. Loading a map sends your
            browser&rsquo;s request to their servers, as any image request does.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>How long it is kept</h2>
        <p>
          Form submissions are kept as long as they are useful to the
          transaction they belong to. Account data is kept until you ask for the
          account to be deleted. Ask and it is deleted, along with the saved
          homes, saved searches and posted questions attached to it.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Your choices</h2>
        <p>
          You can edit your name and phone number on the account page, delete
          any saved home, saved search or question you posted, and ask for the
          whole account to be removed. Requests go to{" "}
          {agentEmail ? (
            <a href={`mailto:${agentEmail}`}>{agentEmail}</a>
          ) : (
            <a href={`tel:${contactPhone}`}>{contactPhone}</a>
          )}
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2>Children</h2>
        <p>
          This site is meant for adults buying and selling real property. It is
          not directed at children under 13 and no account should be created by
          one.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Changes</h2>
        <p>
          When this policy changes, the date at the top of the page changes with
          it.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Contact</h2>
        <p>
          {brokerage.name}, {brokerage.street}, {brokerage.city},{" "}
          {brokerage.state} {brokerage.zip}.{" "}
          <a href={`tel:${brokerage.phone}`}>{brokerage.phone}</a>
        </p>
      </section>
    </LegalPage>
  );
}
