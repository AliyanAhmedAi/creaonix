export type SubscriptionAccessRecord = {
  status: string;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
};

export function hasSubscriptionAccess(subscription: SubscriptionAccessRecord | null | undefined, now = Date.now()): boolean {
  if (!subscription) return false;
  if (subscription.status === "trialing") {
    return Boolean(subscription.trial_ends_at && Date.parse(subscription.trial_ends_at) > now);
  }
  if (subscription.status === "active") {
    return Boolean(subscription.current_period_ends_at && Date.parse(subscription.current_period_ends_at) > now);
  }
  return false;
}
