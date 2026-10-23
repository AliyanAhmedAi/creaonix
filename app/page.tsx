import Link from "next/link";

export default function Home() {
  return (
    <main id="main-content" className="landing">
      <header className="landing-header"><Link className="brand" href="/"><span className="brand-mark">C</span> Creonix</Link><nav aria-label="Account"><Link href="/login">Sign in</Link><Link className="button secondary" href="/signup">Create account</Link></nav></header>
      <section className="landing-hero"><p className="eyebrow">A calmer way to create</p>
        <h1>Make space for the work only you can make.</h1>
        <p>Keep every idea, draft, and next step in one thoughtful workspace. Start with a title. Build the rest when you’re ready.</p>
        <div className="landing-actions"><Link className="button primary" href="/signup">Start your workspace <span aria-hidden="true">→</span></Link><Link className="text-link" href="/login">Already have an account?</Link></div>
        <div className="landing-preview" aria-label="Creonix workflow preview"><div className="preview-top"><span className="preview-mark">C</span><span>YOUR CONTENT WORKSPACE</span><span className="preview-dots" aria-hidden="true">•••</span></div><div className="preview-body"><div className="preview-sidebar"><span className="preview-line selected">Overview</span><span className="preview-line">Content library</span><span className="preview-line">Your next steps</span></div><div className="preview-content"><span className="preview-kicker">A LITTLE AT A TIME</span><strong>Good ideas have a place to land.</strong><div className="preview-cards"><span><i>01</i><b>Capture an idea</b><small>Start with a working title</small></span><span><i>02</i><b>Shape the draft</b><small>Add notes as they come</small></span><span><i>03</i><b>Move it forward</b><small>On your own schedule</small></span></div></div></div></div>
      </section>
      <footer className="landing-footer"><span>Built for the creative process, not the content treadmill.</span><span>Ideas stay yours. Publishing stays in your hands.</span></footer>
    </main>
  );
}
