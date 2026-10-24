import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceGate } from "@/components/workspace-gate";
import { hasSubscriptionAccess } from "@/lib/billing/access";
import { getWorkspaceContext } from "@/lib/workspaces/context";
import { getPlatformAdmin } from "@/lib/admin/access";

const planPrices = { standard: "PKR 1,499", pro: "PKR 4,999", max: "PKR 9,999" } as const;

export default async function BillingPage() {
  const context = await getWorkspaceContext({ allowBillingWithoutAccess: true });
  if (context.state === "signed-out") redirect("/login");
  if (context.state === "needs-workspace") redirect("/onboarding");
  if (context.state === "setup" || context.state === "error") return <WorkspaceGate state={context.state} />;

  const { error: trialError } = await context.supabase.rpc("start_account_trial");
  const { isAdmin } = await getPlatformAdmin();
  const { data: subscription, error: subscriptionError } = await context.supabase
    .from("subscriptions")
    .select("plan, status, trial_started_at, trial_ends_at, current_period_ends_at")
    .eq("user_id", context.userId)
    .maybeSingle();

  // Keep the schema check separate from trial creation. A failed RPC used to
  // show the generic migration prompt even when the table itself was present.
  const needsMigration = Boolean(subscriptionError || !subscription);
  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
  const hasAccess = hasSubscriptionAccess(subscription);
  const trialEnded = subscription?.status === "trialing" && !hasAccess;
  const paidPlanEnded = subscription?.status === "active" && !hasAccess;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000)) : 0;
  const statusLabel = subscription?.status === "active" && hasAccess ? "Active paid plan" : paidPlanEnded ? "Paid plan ended" : trialEnded ? "Trial ended" : subscription?.status === "trialing" ? "Free trial" : subscription?.status ?? "Not available";

  return <div className="app-shell"><AppSidebar workspaceName={context.workspace.name} role={context.role} active="Billing" isPlatformAdmin={isAdmin} />
    <main id="main-content" className="main">
      <header className="topbar"><div><p className="eyebrow">{context.workspace.name} / Account</p><h1>Plans & billing</h1><p className="page-intro">Your free trial needs no payment details. Contact us on WhatsApp to buy a paid plan; access is activated manually after payment.</p></div></header>
      {needsMigration ? <section className="card billing-status" aria-labelledby="billing-setup-title"><div><p className="eyebrow">Subscription setup</p><h2 id="billing-setup-title">{subscriptionError ? "Can’t read subscription data" : "No subscription record found"}</h2><p className="page-intro">{subscriptionError ? `Database error${subscriptionError.code ? ` (${subscriptionError.code})` : ""}: ${subscriptionError.message}` : trialError ? `Trial setup failed${trialError.code ? ` (${trialError.code})` : ""}: ${trialError.message}` : "The subscription table responded, but this account has no trial row. Re-run the complete 0007 migration so its trial RPC and new-user trigger are created."}</p><p className="page-intro">Run the full contents of <code>database/migrations/0007_manual_subscriptions.sql</code> in Supabase SQL Editor, then reload. “Success. No rows returned” is normal for schema changes.</p></div></section> : <>
        {trialError && <p className="admin-notice">Subscription data loaded, but the trial RPC failed{trialError.code ? ` (${trialError.code})` : ""}: {trialError.message}</p>}
        <section className="card billing-status" aria-labelledby="billing-status-title">
          <div><p className="eyebrow">Current access</p><h2 id="billing-status-title">{statusLabel}</h2><p className="page-intro">{subscription?.status === "active" && hasAccess ? `${subscription.plan[0].toUpperCase()}${subscription.plan.slice(1)} · ${planPrices[subscription.plan as keyof typeof planPrices]}/month` : trialEnded || paidPlanEnded ? "Choose a paid plan to continue." : `Standard trial · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining`}</p></div>
          <span className={`tag ${subscription?.status === "active" && hasAccess ? "configured" : ""}`}>{trialEnded || paidPlanEnded ? "Ended" : subscription?.status === "active" && hasAccess ? "Paid" : "No card required"}</span>
        </section>
        <section className="card billing-help"><h2>Want to continue with a paid plan?</h2><p>Choose a plan and WhatsApp will open with the plan name and monthly price already written. You’ll pay directly, then we’ll activate it for your account.</p><Link className="button primary" href="/#plans">Compare plans</Link></section>
      </>}
    </main>
  </div>;
}
