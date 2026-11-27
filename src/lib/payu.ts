import "server-only";
import { createHash } from "node:crypto";

/*
 * PayU Hosted Checkout (server side only).
 * Settings (Vercel → Environment Variables, and .env locally):
 *   PAYU_KEY   merchant key   (PayU dashboard → Developer → API Keys)
 *   PAYU_SALT  merchant salt  (same page; it must be Active)
 *   PAYU_ENV   "live" or "test" (default "test")
 * Online payment only shows at checkout when PAYU_KEY and PAYU_SALT are set.
 */

const env = () => (process.env.PAYU_ENV === "live" ? "live" : "test");
const creds = () => {
  const key = process.env.PAYU_KEY?.trim();
  const salt = process.env.PAYU_SALT?.trim();
  return key && salt ? { key, salt } : null;
};

export const payuEnabled = () => creds() !== null;

const sha512 = (s: string) => createHash("sha512").update(s, "utf8").digest("hex");
export const payuAmount = (rupees: number) => rupees.toFixed(2);

/** Fields posted from the customer's browser to PayU's payment page. */
export function payuForm(p: { txnid: string; amount: number; productinfo: string; firstname: string; email: string; phone: string; orderId: string; baseUrl: string }) {
  const c = creds();
  if (!c) throw new Error("PayU is not configured.");
  const amount = payuAmount(p.amount);
  const udf1 = p.orderId;
  // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hash = sha512([c.key, p.txnid, amount, p.productinfo, p.firstname, p.email, udf1, "", "", "", "", "", "", "", "", "", c.salt].join("|"));
  return {
    action: env() === "live" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment",
    fields: {
      key: c.key,
      txnid: p.txnid,
      amount,
      productinfo: p.productinfo,
      firstname: p.firstname,
      email: p.email,
      phone: p.phone,
      udf1,
      surl: `${p.baseUrl}/api/payu/return`,
      furl: `${p.baseUrl}/api/payu/return`,
      hash,
    },
  };
}

/** Checks the hash PayU sends back with a payment result (return page and webhook). */
export function payuResponseValid(r: Record<string, string>) {
  const c = creds();
  if (!c || r.key !== c.key) return false;
  // SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key  (additionalCharges| in front when present)
  const parts = [c.salt, r.status ?? "", "", "", "", "", "", r.udf5 ?? "", r.udf4 ?? "", r.udf3 ?? "", r.udf2 ?? "", r.udf1 ?? "", r.email ?? "", r.firstname ?? "", r.productinfo ?? "", r.amount ?? "", r.txnid ?? "", c.key];
  const expected = sha512((r.additionalCharges ? `${r.additionalCharges}|` : "") + parts.join("|"));
  return typeof r.hash === "string" && r.hash.toLowerCase() === expected;
}

/** Asks PayU directly whether a transaction succeeded (never trust the browser alone). */
export async function payuVerify(txnid: string): Promise<{ status: string; amount: number; mihpayid?: string; mode?: string } | null> {
  const c = creds();
  if (!c) return null;
  const command = "verify_payment";
  const body = new URLSearchParams({ key: c.key, command, var1: txnid, hash: sha512(`${c.key}|${command}|${txnid}|${c.salt}`) });
  const url = env() === "live" ? "https://info.payu.in/merchant/postservice?form=2" : "https://test.payu.in/merchant/postservice?form=2";
  try {
    const res = await fetch(url, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, cache: "no-store" });
    const data = (await res.json()) as { transaction_details?: Record<string, { status?: string; amt?: string; transaction_amount?: string; mihpayid?: string; mode?: string }> };
    const t = data.transaction_details?.[txnid];
    if (!t?.status) return null;
    return { status: t.status, amount: Number(t.transaction_amount ?? t.amt ?? 0), mihpayid: t.mihpayid, mode: t.mode };
  } catch {
    return null;
  }
}
