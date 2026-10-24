import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { createAdminSupabaseClient, getPlatformAdmin, getPlatformAdminEmails } from "@/lib/admin/access";
import { sendClientPasswordReset, softDeleteClientAccount, updateSubscription } from "./actions";

type SearchParams = Promise<{ q?: string; result?: string }>;
const planName = { standard: "Standard", pro: "Pro", max: "Max" };

const messages: Record<string, string> = {
  updated: "Subscription updated.",
  invalid: "Check the email and selected action, then try again.",
  configuration: "Add the Supabase service-role key to the local server environment before using admin actions.",
  "lookup-error": "Could not search Supabase Auth users.",
  "user-not-found": "No account matched that exact email address.",
  "save-error": "Could not save the subscription. Make sure the subscription migration is applied.",
  migration: "Apply migrations 0007_manual_subscriptions.sql and 0008_admin_subscription_audit.sql in Supabase first.",
  "reset-requested": "Password recovery email requested. Delivery depends on your Supabase Auth email settings.",
  "reset-error": "Supabase could not send the recovery email. Check Auth email and SMTP settings.",
  "delete-confirmation": "Account was not deleted. Enter the exact account email to confirm.",
  "protected-admin": "Admin accounts on the allowlist cannot be deleted from this portal.",
  "account-deleted": "The sign-in account was soft-deleted; workspace content was preserved.",
  "deleted-status-warning": "The sign-in account was soft-deleted, but subscription status could not be updated. Check the subscription table. ",
  "delete-error": "Supabase could not soft-delete the account. Check Auth logs and any account dependencies."
};

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const { user, isAdmin, unavailable } = await getPlatformAdmin();
  if (unavailable) return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Creaonix / Owner controls</p><h1>Admin portal is temporarily unavailable</h1><p className="page-intro">We couldn’t reach Supabase Auth. Check the Vercel environment variables for the Supabase project URL and public key, then retry.</p><Link className="button secondary" href="/login">Back to sign in</Link></section></main>;
  if (!user) redirect("/login");
  if (!isAdmin) return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Restricted area</p><h1>Admin access required</h1><p className="page-intro">This portal is limited to email addresses listed in the server-only CREAONIX_ADMIN_EMAILS setting.</p><Link className="button secondary" href="/dashboard">Back to Creaonix</Link></section></main>;

  const params = await searchParams;
  const admin = createAdminSupabaseClient();
  let accounts: { users: Array<{ id: string; email?: string; created_at: string }> } | null = null;
  let usersError: { message: string } | null = null;
  let subscriptions: Array<{ user_id: string; plan: string; status: string; trial_ends_at: string | null; current_period_ends_at: string | null }> | null = null;
  let subscriptionsError: { message: string } | null = null;
  if (admin) {
    try {
      const result = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      accounts = result.data;
      usersError = result.error;
    } catch {
      usersError = { message: "Supabase Auth could not be reached. Check the Vercel Supabase URL and service-role key." };
    }
    try {
      const result = await admin.from("subscriptions").select("user_id, plan, status, trial_ends_at, current_period_ends_at");
      subscriptions = result.data;
      subscriptionsError = result.error;
    } catch {
      subscriptionsError = { message: "The subscription table could not be reached. Check the Supabase connection and migrations." };
    }
  }
  const hasMigration = !admin || !subscriptionsError;
  const q = params.q?.trim().toLowerCase() ?? "";
  const protectedAdmins = getPlatformAdminEmails();
  const subsByUser = new Map((subscriptions ?? []).map((subscription) => [subscription.user_id, subscription]));
  const rows = (accounts?.users ?? []).filter((account) => !q || account.email?.toLowerCase().includes(q))
    .map((account) => ({ account, subscription: subsByUser.get(account.id) }))
    .sort((a, b) => (a.account.email ?? "").localeCompare(b.account.email ?? ""));

  return <div className="app-shell"><AppSidebar workspaceName="Platform admin" role="owner" active="Admin portal" isPlatformAdmin />
    <main id="main-content" className="main">
      <header className="topbar"><div><p className="eyebrow">Creaonix / Owner controls</p><h1>Admin portal</h1><p className="page-intro">Manage account access and manually activate subscriptions after confirming payment.</p></div><Link className="button secondary" href="/billing">My billing</Link></header>
      {params.result && <p className={`admin-notice ${params.result === "updated" ? "success" : ""}`} role="status">{messages[params.result] ?? "An admin action needs attention."}</p>}
      {!admin && <p className="admin-notice">{messages.configuration}</p>}
      {usersError && <p className="admin-notice">Could not load accounts from Supabase Auth: {usersError.message}</p>}
      {admin && !hasMigration && subscriptionsError && <p className="admin-notice">{messages.migration} Database response: {subscriptionsError.message}</p>}

      <section className="admin-grid">
        <article className="card admin-panel"><p className="eyebrow">Manual access</p><h2>Update a subscription</h2><p className="page-intro">Use the user’s exact sign-in email. Activating a paid plan starts a 30-day period immediately.</p>
          <form className="admin-form" action={updateSubscription}>
            <label>Email address<input type="email" name="email" required maxLength={320} placeholder="creator@example.com" /></label>
            <label>Action<select name="action" defaultValue="activate"><option value="activate">Activate paid plan (30 days)</option><option value="cancel">Cancel access</option><option value="expire">Expire access now</option></select></label>
            <label>Plan<select name="plan" defaultValue="pro"><option value="standard">Standard · PKR 1,499/month</option><option value="pro">Pro · PKR 4,999/month</option><option value="max">Max · PKR 9,999/month</option></select></label>
            <button className="button primary" type="submit" disabled={!admin || !hasMigration}>Save subscription</button>
          </form>
          <p className="admin-warning">Only activate after confirming payment. The one-time 7-day trial cannot be reset here. These actions manage access; they do not charge customers.</p>
        </article>
        <article className="card admin-panel admin-summary"><p className="eyebrow">Account directory</p><strong>{accounts?.users.length ?? 0}</strong><span>accounts loaded · max 1,000</span><p>Signed-in owner: <b>{user.email}</b></p><p>Trial policy: one 7-day trial per account. Admin changes do not reset it.</p></article>
      </section>

      <section className="card admin-users">
        <div className="card-header"><h2>Users & subscription status</h2><span>{rows.length} shown</span></div>
        <form className="admin-search" method="get"><label className="sr-only" htmlFor="admin-user-search">Search user email</label><input id="admin-user-search" name="q" defaultValue={params.q} placeholder="Filter by email" /><button className="button secondary" type="submit">Search</button>{q && <Link className="button secondary" href="/admin">Clear</Link>}</form>
        <div className="table-wrap"><table className="content-table admin-table"><thead><tr><th>Email</th><th>Joined</th><th>Plan</th><th>Status</th><th>Access until</th><th>Account actions</th></tr></thead><tbody>
          {rows.map(({ account, subscription }) => {
            const accountEmail = account.email ?? "";
            const isProtectedAdmin = protectedAdmins.includes(accountEmail.toLowerCase());
            return <tr key={account.id}><th>{accountEmail || "No email"}<small className="table-description">{account.id}</small></th><td>{new Date(account.created_at).toLocaleDateString()}</td><td>{subscription?.plan ? planName[subscription.plan as keyof typeof planName] ?? subscription.plan : "—"}</td><td><span className="tag">{subscription?.status ?? "No subscription"}</span></td><td>{subscription?.status === "active" ? subscription.current_period_ends_at ? new Date(subscription.current_period_ends_at).toLocaleDateString() : "No end date" : subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString() : "—"}</td><td><div className="admin-row-actions">
              <form action={sendClientPasswordReset}><input type="hidden" name="email" value={accountEmail} /><button className="button secondary" type="submit" disabled={!admin || !accountEmail}>Send reset email</button></form>
              {isProtectedAdmin ? <span className="admin-protected-label">Protected admin</span> : <details className="admin-delete"><summary>Delete account</summary><form action={softDeleteClientAccount}><input type="hidden" name="email" value={accountEmail} /><label>Type the email to confirm<input type="email" name="confirmEmail" required autoComplete="off" /></label><button className="button danger" type="submit" disabled={!admin || !accountEmail}>Soft-delete login</button><small>Login is disabled; workspace content is retained.</small></form></details>}
            </div></td></tr>;
          })}
          {rows.length === 0 && <tr><td colSpan={6}>No users matched that email filter.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  </div>;
}
