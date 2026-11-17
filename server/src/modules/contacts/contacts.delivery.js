export async function deliverContact(entry) {
  // TODO(mail): connect your email provider API here. Read its URL, API key
  // and recipient from server environment variables (never VITE_*).
  // Send entry.name, entry.email and entry.message as text, and use entry.id
  // as an idempotency key. Throw on failure; return { delivered: true } only
  // after the provider accepts the email. No real mail is sent in this build.
  void entry;
  return { delivered: false };
}
