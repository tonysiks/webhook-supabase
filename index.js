const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const { Resend } = require('resend');
const SUPPLIERS = require('./suppliers');

const app = express();
app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    if (req.originalUrl === '/stripe-webhook') req.rawBody = buf;
  },
}));

const supabase = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3emJlZ3lia2pmeW9iaWx2cGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NjM3MjcsImV4cCI6MjA5MTUzOTcyN30.NENJdd9sZiyoh7vR4j-msWJ8u0uLFxnz4s-6qYmUkuM'
);

// Client admin (service_role) pour connection_logs — clé dans les env vars Render
const supabaseAdmin = createClient(
  'https://awzbegybkjfyobilvpgc.supabase.co',
  process.env.SUPABASE_KEY || ''
);

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// ── Upsert par batch de 500 ───────────────────────────────────────────────────
async function upsertProducts(products) {
  const BATCH = 500;
  for (let i = 0; i < products.length; i += BATCH) {
    const { error } = await supabase
      .from('produits')
      .upsert(products.slice(i, i + BATCH), { onConflict: 'url' });
    if (error) throw error;
  }
}

// ── Route webhook : appelée par Apify après chaque run ────────────────────────
app.post('/webhook', async (req, res) => {
  const supplierKey = req.query.supplier;

  if (!supplierKey || !SUPPLIERS[supplierKey]) {
    return res.status(400).json({
      error: `Fournisseur inconnu : "${supplierKey}". Disponibles : ${Object.keys(SUPPLIERS).join(', ')}`
    });
  }

  const supplier = SUPPLIERS[supplierKey];

  // Récupérer l'ID du run depuis le payload Apify
  const runId = req.body?.resource?.id || req.body?.eventData?.actorRunId;
  if (!runId) {
    return res.status(400).json({ error: 'Impossible de trouver le runId dans le payload' });
  }

  // Répondre immédiatement à Apify pour éviter le timeout
  res.status(200).json({ ok: true, message: 'Import en cours...' });

  // Traitement en arrière-plan
  (async () => {
    try {
      console.log(`[${supplier.name}] Récupération du dataset pour le run ${runId}...`);

      const url = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&format=json&limit=10000`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Apify API error: ${response.status}`);
      const items = await response.json();

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`[${supplier.name}] Aucun item dans le dataset`);
        return;
      }

      const now = new Date().toISOString();
      const products = items
        .filter(p => p.title)
        .map(p => ({
          ...supplier.mapProduct(p),
          fournisseur: supplier.name,
          scraped_at: now,
        }));

      await upsertProducts(products);
      console.log(`[${supplier.name}] ✅ ${products.length} produits importés`);
    } catch (e) {
      console.error(`[${supplier.name}] ❌ Erreur:`, e.message);
    }
  })();
});

// ── Stripe checkout session ───────────────────────────────────────────────────
app.options('/create-checkout-session', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/create-checkout-session', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { priceId, mode, successUrl, cancelUrl } = req.body;

  if (!priceId || !mode || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'priceId, mode, successUrl and cancelUrl are required' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe] STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error('[Stripe] Failed to create checkout session:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Subscribe : crée customer Stripe + checkout session + sauvegarde Supabase ─
const PLAN_PRICE_IDS = {
  starter_mensuel: process.env.STRIPE_PRICE_STARTER_MENSUEL,
  starter_annuel:  process.env.STRIPE_PRICE_STARTER_ANNUEL,
  business:        process.env.STRIPE_PRICE_BUSINESS,
};

const PLAN_LABELS = {
  starter_mensuel: 'Starter Mensuel',
  starter_annuel:  'Starter Annuel',
  business:        'Business',
};

// ── Template HTML partagé (fond noir, logo TGO) ───────────────────────────────
function emailShell(bodyContent) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#0a0a0a;padding:40px 32px;">
    <div style="text-align:center;margin-bottom:36px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#ffffff;">THE GOOD <span style="color:#0070F3;">ONE</span></span>
    </div>
    ${bodyContent}
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #161616;text-align:center;">
      <a href="mailto:contact@the-good.one" style="font-size:13px;color:#0070F3;text-decoration:none;font-weight:600;">contact@the-good.one</a>
      <div style="margin-top:10px;font-size:11px;color:#2a2a2a;letter-spacing:1px;text-transform:uppercase;">The Good One &middot; Le moteur du wholesale fripe</div>
    </div>
  </div>
</body>
</html>`;
}

function emailBtn(label, url) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#0070F3;color:#ffffff;text-decoration:none;padding:16px 44px;font-family:'Arial Black',Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">${label}</a>
  </div>`;
}

app.options('/subscribe', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/subscribe', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { email, plan, successUrl, cancelUrl } = req.body;

  if (!email || !plan || !successUrl || !cancelUrl) {
    return res.status(400).json({ error: 'email, plan, successUrl et cancelUrl sont requis' });
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return res.status(400).json({
      error: `Plan invalide : "${plan}". Valeurs acceptées : ${Object.keys(PLAN_PRICE_IDS).join(', ')}`
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Récupérer le subscriber existant en Supabase
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id, status')
      .eq('email', email)
      .single();

    // Créer ou réutiliser le customer Stripe
    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Créer la checkout session
    const successWithEmail = `${successUrl}${successUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`;
    console.log('successWithEmail:', successWithEmail);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successWithEmail,
      cancel_url: cancelUrl,
      metadata: { email },
    });

    // Upsert le subscriber en Supabase
    const { error: dbError } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        { email, stripe_customer_id: customerId, plan, status: 'inactive' },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('[Subscribe] Erreur Supabase:', dbError.message);
    }

    // ── Email de bienvenue — uniquement pour les nouveaux abonnés ─────────────
    if (!existing?.stripe_customer_id) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'The Good One <contact@the-good.one>',
          to: email,
          subject: 'Bienvenue sur The Good One 👋',
          html: emailShell(`
            <div style="background:#111;border-top:3px solid #0070F3;padding:28px 28px 24px;margin-bottom:8px;">
              <div style="font-family:'Arial Black',Arial,sans-serif;font-size:19px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#ffffff;margin-bottom:18px;">Bienvenue sur The Good One 👋</div>
              <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0 0 12px 0;">
                Bonjour <strong style="color:#fff;">${email}</strong>,
              </p>
              <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0;">
                Votre compte est actif. Accédez dès maintenant au catalogue de plus de <strong style="color:#fff;">8 000 produits vintage wholesale</strong> issus des meilleurs fournisseurs européens.
              </p>
            </div>
            ${emailBtn('Accéder au catalogue', 'https://the-good.one')}
          `),
        });
        console.log(`[Subscribe] ✉️ Email de bienvenue envoyé à ${email}`);
      } catch (mailErr) {
        console.error('[Subscribe] Erreur email bienvenue:', mailErr.message);
      }
    }

    res.json({ url: session.url });
  } catch (e) {
    console.error('[Subscribe] Erreur:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Stripe webhook ────────────────────────────────────────────────────────────
app.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET non défini');
    return res.status(500).json({ error: 'Webhook secret manquant' });
  }

  let event;
  try {
    event = Stripe(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
      req.rawBody, sig, webhookSecret
    );
  } catch (e) {
    console.error('[StripeWebhook] Signature invalide:', e.message);
    return res.status(400).json({ error: `Signature invalide : ${e.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const email = session.metadata?.email;

      const { data: updated, error } = await supabaseAdmin
        .from('subscribers')
        .update({ status: 'active', stripe_subscription_id: subscriptionId })
        .eq('stripe_customer_id', customerId)
        .select();

      if (error) throw error;

      if (!updated || updated.length === 0) {
        if (email) {
          const { error: fallbackError } = await supabaseAdmin
            .from('subscribers')
            .update({ status: 'active', stripe_subscription_id: subscriptionId, stripe_customer_id: customerId })
            .eq('email', email);
          if (fallbackError) throw fallbackError;
          console.log(`[StripeWebhook] checkout.session.completed — fallback par email ${email} → active`);
        } else {
          console.warn(`[StripeWebhook] checkout.session.completed — aucune ligne mise à jour, email absent des metadata`);
        }
      } else {
        console.log(`[StripeWebhook] checkout.session.completed — customer ${customerId} email ${email ?? 'inconnu'} → active`);
      }

      // ── Email de confirmation d'abonnement ───────────────────────────────────
      const recipientEmail = session.customer_details?.email || session.customer_email || email;
      const planKey = updated?.[0]?.plan || session.metadata?.plan || null;
      const planLabel = PLAN_LABELS[planKey] ?? planKey ?? 'Non précisé';
      const amountFormatted = session.amount_total
        ? `${(session.amount_total / 100).toFixed(2).replace('.', ',')} €`
        : '—';
      const startDate = new Date(session.created * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      if (recipientEmail) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'The Good One <contact@the-good.one>',
            to: recipientEmail,
            subject: 'Votre abonnement The Good One est confirmé ✅',
            html: emailShell(`
              <div style="background:#111;border-top:3px solid #0070F3;padding:28px 28px 24px;margin-bottom:8px;">
                <div style="font-family:'Arial Black',Arial,sans-serif;font-size:19px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#ffffff;margin-bottom:18px;">✅ Abonnement confirmé</div>
                <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0 0 20px 0;">
                  Merci pour votre abonnement. Votre accès est immédiatement actif.
                </p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 14px;background:#0d0d0d;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;width:140px;">Formule</td>
                    <td style="padding:10px 14px;background:#0d0d0d;border-bottom:1px solid #1e1e1e;font-size:14px;color:#fff;font-weight:600;">${planLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;background:#111;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Date de début</td>
                    <td style="padding:10px 14px;background:#111;border-bottom:1px solid #1e1e1e;font-size:14px;color:#fff;">${startDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;background:#0d0d0d;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Montant réglé</td>
                    <td style="padding:10px 14px;background:#0d0d0d;font-size:14px;color:#0070F3;font-weight:700;">${amountFormatted}</td>
                  </tr>
                </table>
              </div>
              ${emailBtn('Accéder au catalogue', 'https://the-good.one')}
            `),
          });
          console.log(`[StripeWebhook] ✉️ Email de confirmation envoyé à ${recipientEmail}`);
        } catch (mailErr) {
          console.error('[StripeWebhook] Erreur email confirmation:', mailErr.message);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { error } = await supabaseAdmin
        .from('subscribers')
        .update({ status: 'canceled', stripe_subscription_id: null })
        .eq('stripe_customer_id', customerId);

      if (error) throw error;
      console.log(`[StripeWebhook] customer.subscription.deleted — customer ${customerId} → canceled`);
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0]?.price?.id;

      const newPlan = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id === priceId)?.[0] ?? null;

      const { error } = await supabaseAdmin
        .from('subscribers')
        .update({ ...(newPlan && { plan: newPlan }), status: 'active' })
        .eq('stripe_customer_id', customerId);

      if (error) throw error;
      console.log(`[StripeWebhook] customer.subscription.updated — customer ${customerId} → plan ${newPlan ?? '(inconnu)'}`);
    }

    res.json({ received: true });
  } catch (e) {
    console.error('[StripeWebhook] Erreur traitement:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Statut abonné ─────────────────────────────────────────────────────────────
app.options('/subscriber/:email', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.get('/subscriber/:email', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { email } = req.params;

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('email, plan, status, created_at, updated_at')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Abonné introuvable' });
  }

  res.json(data);
});

// ── Notification email nouvelle note fournisseur ─────────────────────────────
app.options('/send-rating-email', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/send-rating-email', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { fournisseur, note, commentaire, userEmail } = req.body;

  if (!fournisseur || !note) {
    return res.status(400).json({ error: 'fournisseur et note sont requis' });
  }

  const body = [
    `Fournisseur : ${fournisseur}`,
    `Note : ${note}/5`,
    `Commentaire : ${commentaire || '(aucun)'}`,
    `Email du votant : ${userEmail || '(inconnu)'}`,
  ].join('\n');

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'contact@the-good.one',
      to: 'contact@the-good.one',
      subject: '⭐ Nouvelle note fournisseur',
      text: body,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('[send-rating-email] Erreur Resend:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Log connexion + détection multi-IP ───────────────────────────────────────
app.options('/log-connection', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/log-connection', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { userEmail, userAgent } = req.body;

  // IP toujours lue côté serveur — l'éventuelle valeur envoyée par le front est ignorée
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = rawIp.split(',')[0].trim(); // x-forwarded-for peut contenir plusieurs IPs

  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail est requis' });
  }

  // Répondre immédiatement — traitement en arrière-plan
  res.json({ ok: true });

  (async () => {
    try {
      // 1. Stocker la connexion
      const { error: insertError } = await supabaseAdmin
        .from('connection_logs')
        .insert({ user_email: userEmail, ip, user_agent: userAgent || null });

      if (insertError) {
        console.error('[log-connection] Insert error:', insertError.message);
        return;
      }

      // 2. Récupérer toutes les connexions de cet email dans les 24 dernières heures
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: logs, error: selectError } = await supabaseAdmin
        .from('connection_logs')
        .select('ip, user_agent, created_at')
        .eq('user_email', userEmail)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (selectError) {
        console.error('[log-connection] Select error:', selectError.message);
        return;
      }

      // 3. Nombre d'IPs distinctes
      const distinctIps = [...new Set(logs.map(l => l.ip))];
      if (distinctIps.length < 2) return; // Pas d'alerte nécessaire

      console.log(`[log-connection] ⚠️ ${distinctIps.length} IPs distinctes pour ${userEmail} — envoi des alertes`);

      // 4. Construction du tableau détail pour l'email admin
      const tableRows = logs.map(l => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:'Courier New',monospace;font-size:13px;color:#e0e0e0;">${l.ip}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;font-size:12px;color:#aaa;max-width:300px;">${(l.user_agent || '—').substring(0, 90)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #222;font-size:12px;color:#888;white-space:nowrap;">${new Date(l.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td>
        </tr>`).join('');

      const resend = new Resend(process.env.RESEND_API_KEY);

      // ── Email 1 — alerte admin ──────────────────────────────────────────────
      await resend.emails.send({
        from: 'contact@the-good.one',
        to: 'contact@the-good.one',
        subject: `⚠️ Connexions suspectes — ${userEmail}`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:660px;margin:0 auto;background:#0a0a0a;padding:40px 32px;">

    <div style="border-left:4px solid #e53e3e;padding:4px 0 4px 20px;margin-bottom:32px;">
      <div style="font-family:'Arial Black',Arial,sans-serif;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#ffffff;line-height:1.2;">⚠️ Connexions suspectes détectées</div>
      <div style="font-size:12px;color:#666;letter-spacing:1px;text-transform:uppercase;margin-top:6px;">Alerte automatique · The Good One</div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;background:#111;border:1px solid #1e1e1e;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;width:180px;">Email du compte</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;font-size:14px;color:#fff;font-weight:600;">${userEmail}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Connexions en 24h</td>
        <td style="padding:12px 16px;border-bottom:1px solid #1e1e1e;font-size:14px;color:#fff;font-weight:600;">${logs.length}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">IPs distinctes</td>
        <td style="padding:12px 16px;font-size:16px;color:#e53e3e;font-weight:900;">${distinctIps.length}</td>
      </tr>
    </table>

    <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#e53e3e;margin-bottom:10px;">Détail des connexions</div>
    <table style="width:100%;border-collapse:collapse;background:#0d0d0d;border:1px solid #1e1e1e;">
      <thead>
        <tr style="background:#161616;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;">IP</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;">User Agent</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;">Heure (Paris)</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #161616;font-size:11px;color:#333;letter-spacing:1px;text-transform:uppercase;text-align:center;">
      The Good One — Système de sécurité automatique
    </div>
  </div>
</body>
</html>`,
      });

      // ── Email 2 — alerte utilisateur ────────────────────────────────────────
      await resend.emails.send({
        from: 'contact@the-good.one',
        to: userEmail,
        subject: '⚠️ Activité suspecte détectée sur votre compte The Good One',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#0a0a0a;padding:40px 32px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:36px;">
      <span style="font-family:'Arial Black',Arial,sans-serif;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#ffffff;">THE GOOD <span style="color:#0070F3;">ONE</span></span>
    </div>

    <!-- Alerte -->
    <div style="background:#111;border-top:3px solid #e53e3e;padding:28px 28px 24px;margin-bottom:28px;">
      <div style="font-family:'Arial Black',Arial,sans-serif;font-size:19px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#ffffff;margin-bottom:18px;">⚠️ Activité suspecte sur votre compte</div>
      <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0 0 14px 0;">
        Nous avons détecté des connexions depuis <strong style="color:#fff;">plusieurs appareils ou adresses IP différentes</strong> sur votre compte.
      </p>
      <p style="font-size:15px;color:#bbb;line-height:1.75;margin:0;">
        Si vous êtes à l'origine de ces connexions, vous pouvez ignorer ce message. Dans le cas contraire, <strong style="color:#ffffff;">changez immédiatement votre mot de passe</strong> en cliquant sur le bouton ci-dessous.
      </p>
    </div>

    <!-- Avertissement partage de compte -->
    <div style="background:#1a0f0f;border:1px solid #4a1a1a;border-left:4px solid #e53e3e;padding:18px 20px;margin-bottom:24px;">
      <div style="font-size:13px;font-weight:700;color:#e53e3e;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">⚠️ Rappel : le partage de compte est strictement interdit.</div>
      <p style="font-size:13px;color:#aaa;line-height:1.7;margin:0;">
        Chaque abonnement est personnel et limité à <strong style="color:#fff;">2 appareils (1 PC + 1 téléphone)</strong>. Si nous détectons des connexions depuis plus de 2 appareils ou adresses IP différentes de manière répétée, votre compte sera <strong style="color:#fff;">suspendu définitivement sans remboursement</strong>, conformément à nos <a href="https://the-good.one/cgu.html" style="color:#0070F3;text-decoration:none;">CGU</a>.
      </p>
    </div>

    <!-- Bouton CTA -->
    <div style="text-align:center;margin-bottom:36px;">
      <a href="https://the-good.one/reset-password.html"
         style="display:inline-block;background:#0070F3;color:#ffffff;text-decoration:none;padding:16px 44px;font-family:'Arial Black',Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
        Changer mon mot de passe
      </a>
    </div>

    <!-- Footer -->
    <div style="padding-top:24px;border-top:1px solid #161616;text-align:center;">
      <div style="font-size:12px;color:#444;margin-bottom:8px;line-height:1.6;">
        Si vous n'êtes pas à l'origine de cette alerte, contactez-nous immédiatement.
      </div>
      <a href="mailto:contact@the-good.one" style="font-size:13px;color:#0070F3;text-decoration:none;font-weight:600;">contact@the-good.one</a>
      <div style="margin-top:20px;font-size:11px;color:#2a2a2a;letter-spacing:1px;text-transform:uppercase;">The Good One · Le moteur du wholesale fripe</div>
    </div>

  </div>
</body>
</html>`,
      });

      console.log(`[log-connection] ✅ Alertes envoyées pour ${userEmail} (${distinctIps.length} IPs, ${logs.length} connexions/24h)`);
    } catch (e) {
      console.error('[log-connection] Erreur:', e.message);
    }
  })();
});

// ── Stripe : portail de gestion d'abonnement ─────────────────────────────────
app.options('/create-portal-session', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/create-portal-session', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'email requis' });

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('stripe_customer_id')
    .eq('email', email)
    .single();

  if (error || !data?.stripe_customer_id) {
    return res.status(404).json({ error: 'Abonné introuvable ou sans customer Stripe' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: 'https://the-good.one/dashboard.html',
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('[create-portal-session] Erreur:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Stripe : historique des factures ─────────────────────────────────────────
app.options('/get-invoices', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

app.post('/get-invoices', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'email requis' });

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('stripe_customer_id, stripe_subscription_id')
    .eq('email', email)
    .single();

  if (error || !data?.stripe_customer_id) {
    return res.status(404).json({ error: 'Abonné introuvable ou sans customer Stripe' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const invoicesList = await stripe.invoices.list({
      customer: data.stripe_customer_id,
      limit: 10,
    });

    // Récupère current_period_end depuis la subscription Stripe
    let currentPeriodEnd = null;
    if (data.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(data.stripe_subscription_id);
        currentPeriodEnd = sub.current_period_end; // Unix timestamp
      } catch (subErr) {
        console.warn('[get-invoices] Impossible de récupérer la subscription:', subErr.message);
      }
    }

    res.json({
      invoices: invoicesList.data.map(inv => ({
        id:       inv.id,
        number:   inv.number,
        date:     inv.created,       // Unix timestamp
        amount:   inv.amount_paid,   // centimes
        currency: inv.currency,
        status:   inv.status,
        pdf:      inv.invoice_pdf,
      })),
      currentPeriodEnd,
    });
  } catch (e) {
    console.error('[get-invoices] Erreur:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    suppliers: Object.keys(SUPPLIERS),
    usage: 'POST /webhook?supplier=<key>'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
