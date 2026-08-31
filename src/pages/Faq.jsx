import { contactPhone } from "@/config/site";
import { faqSchema } from "@/lib/schema";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";

const faqs = [
  {
    question: "Do I pay anything to work with a buyer's agent?",
    answer:
      "Buyer representation agreements set out who pays what before you tour a single house. In many Texas transactions the seller's side contributes toward the buyer agent's compensation, but it is negotiated per deal and put in writing up front.",
  },
  {
    question: "How much do I need for a down payment?",
    answer:
      "It depends on the loan. Conventional financing can start near 3 percent down, FHA near 3.5 percent, and USDA and VA loans can reach zero down for buyers and properties that qualify. Liberty County has USDA-eligible areas.",
  },
  {
    question: "How long does a purchase take from offer to closing?",
    answer:
      "Thirty to forty-five days is typical once an offer is accepted, driven mostly by the lender's underwriting and the title work. Cash purchases can close in under two weeks.",
  },
  {
    question: "What does the option period actually do?",
    answer:
      "It buys you a set number of days to inspect the property and walk away for any reason, in exchange for a fee paid to the seller. Inspections, repair negotiations, and second opinions all belong inside that window.",
  },
  {
    question: "Should I get a survey if the seller has one?",
    answer:
      "Often an existing survey works if nothing has changed and the title company and lender accept it with a seller affidavit. New fences, additions, or pools usually force a new one.",
  },
  {
    question: "How is my home's asking price set?",
    answer:
      "From closed comparable sales in the same area, adjusted for condition, lot, square footage, and updates, then checked against what is currently competing with you on the market.",
  },
  {
    question: "Do I need to make repairs before listing?",
    answer:
      "Not all of them. The ones worth doing are the ones an inspector will find and a buyer will price twice. That list gets made before photos, not after an offer.",
  },
  {
    question: "Is flood insurance required in Dayton?",
    answer:
      "It depends on the flood zone the property sits in and the lender's requirement. Zone determination happens early, and it changes both the insurance quote and the monthly payment.",
  },
];

export default function Faq() {
  return (
    <div className="page-shell py-16">
      <Seo
        title="Buyer and Seller FAQ"
        description="Down payments, option periods, surveys, flood insurance, asking price and closing timelines, answered for Dayton and Liberty County."
        schema={faqSchema(faqs)}
      />
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold">
        Questions buyers and sellers ask first
      </h1>

      <dl className="mt-12 max-w-3xl divide-y divide-surface-line border-y border-surface-line">
        {faqs.map(({ question, answer }) => (
          <div key={question} className="py-6">
            <dt className="font-display text-xl font-semibold">{question}</dt>
            <dd className="mt-2 leading-relaxed text-ink-muted">{answer}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-surface-line bg-surface-raised p-6">
        <p className="flex-1 text-ink-muted">
          Something not covered here? The office line is {contactPhone}.
        </p>
        <Button to="/contact">Ask a Question</Button>
      </div>
    </div>
  );
}
