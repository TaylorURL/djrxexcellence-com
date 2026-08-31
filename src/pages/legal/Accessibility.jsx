import { agentEmail, brokerage, contactPhone } from "@/config/site";
import LegalPage from "@/components/legal/LegalPage";

export default function Accessibility() {
  return (
    <LegalPage
      title="Accessibility Statement"
      description="The accessibility standard this site is built to, what is known to fall short of it, and how to report a barrier."
    >
      <section className="space-y-3">
        <h2>The standard</h2>
        <p>
          This site is built to meet the Web Content Accessibility Guidelines
          2.1 at level AA. Housing is not something anyone should have to fight
          a website to look at.
        </p>
      </section>

      <section className="space-y-3">
        <h2>What that means here</h2>
        <ul>
          <li>
            Every page works from the keyboard alone, with a visible focus ring
            and a skip link to the main content.
          </li>
          <li>
            Headings run in order, form fields have labels, and images carry
            alternative text describing the property.
          </li>
          <li>
            Text meets the contrast ratios the standard sets, and the layout
            reflows down to a phone without a horizontal scroll.
          </li>
          <li>
            Animation and smooth scrolling stop when your system is set to
            reduce motion.
          </li>
          <li>
            The photo gallery opens, moves and closes from the keyboard, and
            announces which photo is showing.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Known limits</h2>
        <ul>
          <li>
            The map is a visual interface. Everything it plots is also on the
            page as a list of addresses with prices, which is what a screen
            reader reads.
          </li>
          <li>
            Virtual tour and video links open on services this office does not
            control, and their accessibility is theirs.
          </li>
          <li>
            Photo descriptions are written by hand and a new listing can go up
            before every one is filled in.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>Reporting a barrier</h2>
        <p>
          If something on this site keeps you from getting to information about
          a property, say so and it gets fixed. Include the page and what
          happened.{" "}
          {agentEmail ? (
            <a href={`mailto:${agentEmail}`}>{agentEmail}</a>
          ) : null}{" "}
          <a href={`tel:${contactPhone}`}>{contactPhone}</a>
        </p>
        <p>
          Any property information on this site is also available by phone from
          the office at <a href={`tel:${brokerage.phone}`}>{brokerage.phone}</a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
