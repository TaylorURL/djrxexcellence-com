import { brokerage, contactPhone } from "@/config/site";
import LegalPage from "@/components/legal/LegalPage";

export default function FairHousing() {
  return (
    <LegalPage
      title="Fair Housing"
      description="The fair housing commitment this office operates under, what it means in practice, and where to file a complaint."
    >
      <section className="space-y-3">
        <h2>Equal Housing Opportunity</h2>
        <p>
          {brokerage.name} supports and follows the Fair Housing Act and the
          Texas Fair Housing Act. Every property on this site is available to
          every qualified buyer on the same terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Protected classes</h2>
        <p>
          Federal law makes it illegal to discriminate in the sale or rental of
          housing on the basis of race, color, religion, sex, disability,
          familial status, or national origin. Texas law tracks the same list.
        </p>
      </section>

      <section className="space-y-3">
        <h2>What this means in practice</h2>
        <ul>
          <li>
            Questions about a neighborhood get answered with facts a buyer can
            verify: school district boundaries, tax rates, flood zones, deed
            restrictions, commute distance.
          </li>
          <li>
            Questions that ask what kind of people live somewhere do not get
            answered, by anyone in this office. Steering a buyer toward or away
            from an area on the basis of a protected class is illegal, and it is
            illegal whether or not the buyer asked for it.
          </li>
          <li>
            Every buyer sees the same inventory. Showings, offers and terms are
            not filtered by who is asking.
          </li>
          <li>
            Accessibility needs and reasonable accommodation requests are part
            of an ordinary search here, not an exception to it.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Comments on this site</h2>
        <p>
          Questions posted on a listing are public and are moderated. Anything
          that describes a neighborhood by the people in it, or asks the agent
          to, comes down.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Filing a complaint</h2>
        <p>
          Housing discrimination complaints go to the U.S. Department of Housing
          and Urban Development at{" "}
          <a
            href="https://www.hud.gov/program_offices/fair_housing_equal_opp"
            target="_blank"
            rel="noopener noreferrer"
          >
            hud.gov
          </a>{" "}
          and to the{" "}
          <a
            href="https://www.trec.texas.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Texas Real Estate Commission
          </a>
          . Neither one requires going through this office first.
        </p>
      </section>

      <section className="space-y-3">
        <h2>Raising it here</h2>
        <p>
          If something in a conversation with this office felt like it crossed
          the line, call <a href={`tel:${contactPhone}`}>{contactPhone}</a> and
          say so.
        </p>
      </section>
    </LegalPage>
  );
}
