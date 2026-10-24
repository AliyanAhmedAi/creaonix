import Link from "next/link";

const plans = [
  {
    name: "Standard",
    price: "1,499",
    summary: "A focused home for your creator workflow.",
    features: ["One creator workspace", "Content ideas and scripts", "AI writing tools", "Content calendar"],
    featured: false
  },
  {
    name: "Pro",
    price: "4,999",
    summary: "More room to plan and produce consistently.",
    features: ["Everything in Standard", "Expanded AI and content capacity", "More media storage", "Priority support"],
    featured: true
  },
  {
    name: "Max",
    price: "9,999",
    summary: "The most room for a growing creator operation.",
    features: ["Everything in Pro", "Highest AI and content capacity", "More workspace storage", "Hands-on onboarding"],
    featured: false
  }
];

function whatsappLink(plan: string, price: string) {
  const message = `Hi, I am buying the ${plan} plan for PKR ${price}/month. Please share the payment details.`;
  return `https://wa.me/923129628994?text=${encodeURIComponent(message)}`;
}

export default function Home() {
  return (
    <main id="main-content" className="landing">
      <header className="landing-header"><Link className="brand" href="/"><span className="brand-mark">C</span> Creonix</Link><nav aria-label="Account"><Link href="#plans">Plans</Link><Link href="/login">Sign in</Link><Link className="button secondary" href="/signup">Create account</Link></nav></header>
      <section className="landing-hero"><p className="eyebrow">A calmer way to create</p>
        <h1>Make space for the work only you can make.</h1>
        <p>Keep every idea, draft, and next step in one thoughtful workspace. Start with a title. Build the rest when you’re ready.</p>
        <div className="landing-actions"><Link className="button primary" href="/signup">Start your free 7-day trial <span aria-hidden="true">→</span></Link><Link className="text-link" href="/login">Already have an account?</Link></div>
        <div className="landing-preview" aria-label="Creonix workflow preview"><div className="preview-top"><span className="preview-mark">C</span><span>YOUR CONTENT WORKSPACE</span><span className="preview-dots" aria-hidden="true">•••</span></div><div className="preview-body"><div className="preview-sidebar"><span className="preview-line selected">Overview</span><span className="preview-line">Content library</span><span className="preview-line">Your next steps</span></div><div className="preview-content"><span className="preview-kicker">A LITTLE AT A TIME</span><strong>Good ideas have a place to land.</strong><div className="preview-cards"><span><i>01</i><b>Capture an idea</b><small>Start with a working title</small></span><span><i>02</i><b>Shape the draft</b><small>Add notes as they come</small></span><span><i>03</i><b>Move it forward</b><small>On your own schedule</small></span></div></div></div></div>
      </section>
      <section id="plans" className="plans-section" aria-labelledby="plans-title">
        <div className="plans-heading"><p className="eyebrow">Simple monthly plans</p><h2 id="plans-title">Start free. Choose a plan when you’re ready.</h2><p>Try Creonix free for 7 days with no payment details. The trial is available once per account.</p></div>
        <div className="plans-grid">
          {plans.map((plan) => <article className={`plan-card${plan.featured ? " plan-card-featured" : ""}`} key={plan.name}>
            {plan.featured && <span className="plan-badge">Most popular</span>}
            <h3>{plan.name}</h3><p className="plan-summary">{plan.summary}</p>
            <p className="plan-price"><span>PKR</span> {plan.price}<small> / month</small></p>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <a className={`button ${plan.featured ? "primary" : "secondary"} plan-cta`} href={whatsappLink(plan.name, plan.price)} target="_blank" rel="noreferrer" aria-label={`Message Creonix on WhatsApp about the ${plan.name} plan, PKR ${plan.price} per month`}>
              Message to buy {plan.name}
            </a>
          </article>)}
        </div>
        <p className="plans-note">Paid plans are activated manually after payment is received. Plan allowances are confirmed with you on WhatsApp. Starting a trial never asks for a card or payment.</p>
      </section>
      <footer className="landing-footer"><span>Built for the creative process, not the content treadmill.</span><span>Ideas stay yours. Publishing stays in your hands.</span></footer>
    </main>
  );
}
