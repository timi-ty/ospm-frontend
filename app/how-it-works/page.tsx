import NavBar from "@/components/NavBar";

const steps = [
  {
    number: "01",
    title: "Sign Up & Get Tokens",
    description:
      "Create an account with Google, email, or phone. A crypto wallet is created for you automatically. Claim free $PLAY tokens from the faucet to start predicting.",
  },
  {
    number: "02",
    title: "Browse Markets",
    description:
      "Markets are AI-generated from real-world news — sports, politics, economics, and more. Each market poses a yes/no question about an upcoming event.",
  },
  {
    number: "03",
    title: "Make Predictions",
    description:
      "Choose YES or NO and stake $PLAY tokens. The cost of your bet depends on the current probability — the more likely an outcome, the more expensive it is to bet on.",
  },
  {
    number: "04",
    title: "Watch the Odds Move",
    description:
      "As people place bets, the probability adjusts in real time. This aggregated wisdom often reflects reality better than any single expert.",
  },
  {
    number: "05",
    title: "Collect Winnings",
    description:
      "When the event happens, the market resolves. If your prediction was correct, you can claim your winnings — your shares convert to $PLAY at full value.",
  },
];

const faqs = [
  {
    q: "What is a prediction market?",
    a: "A prediction market lets people trade on the outcomes of future events. The market price reflects the crowd's estimated probability. For example, if \"YES\" shares cost 65¢, the crowd thinks there's roughly a 65% chance the event will happen.",
  },
  {
    q: "What is $PLAY?",
    a: "$PLAY is OSPM's token on Base Sepolia testnet. It has no real monetary value — it's used purely for making predictions. You can claim free tokens from the faucet.",
  },
  {
    q: "How do odds work?",
    a: "OSPM uses LMSR (Logarithmic Market Scoring Rule), an automated market maker. The price of shares adjusts based on demand. When more people buy YES, the YES price goes up and the NO price goes down, and vice versa.",
  },
  {
    q: "How are markets resolved?",
    a: "An AI oracle verifies the outcome by checking the original news source. A resolution is proposed on-chain with a dispute window. If no one disputes, the result is finalized.",
  },
  {
    q: "Can I dispute a resolution?",
    a: "Yes. If you believe the resolution is incorrect, you can file a dispute during the dispute window. Disputes trigger manual review by the oracle operator.",
  },
  {
    q: "Is this real money?",
    a: "No. OSPM runs on Base Sepolia testnet with $PLAY tokens that have no real value. This is a research and educational project exploring prediction market mechanics.",
  },
  {
    q: "Why open source?",
    a: "Prediction markets will shape decision-making. The tools that power them should be transparent, auditable, and community-driven — not locked behind proprietary systems.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Hero */}
        <div className="py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-lg text-muted leading-relaxed max-w-2xl">
            OSPM is an open source prediction market where AI generates markets
            from real-world news and anyone can make predictions using $PLAY tokens.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-12">
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="card flex gap-4 md:gap-6 items-start">
                <span className="text-2xl font-bold font-mono text-[var(--accent)] shrink-0 w-10">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How Odds Work */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Understanding Odds</h2>
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">If you think YES...</h4>
                <p className="text-sm text-muted leading-relaxed">
                  Buy YES shares. If the YES price is 40%, you pay 40¢ per share.
                  If you're right, each share pays out $1 worth of PLAY. Your
                  profit: 60¢ per share.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">If you think NO...</h4>
                <p className="text-sm text-muted leading-relaxed">
                  Buy NO shares. If the NO price is 60%, you pay 60¢ per share.
                  If you're right, each share pays out $1 worth of PLAY. Your
                  profit: 40¢ per share.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-muted">
              Prices reflect probabilities. Lower prices = higher potential returns but less likely to pay out.
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="card group">
                <summary className="cursor-pointer font-semibold text-sm flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted ml-2 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-[var(--border-color)]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
