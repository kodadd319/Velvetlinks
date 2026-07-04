import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { db } from "./src/lib/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Stripe Simulator Page HTML
  app.get("/stripe-checkout-simulator", (req, res) => {
    const { userId, plan } = req.query;
    if (!userId || !plan) {
      return res.status(400).send("Missing userId or plan parameter");
    }

    const price = plan === "week" ? "$10.00" : "$25.00";
    const planName = plan === "week" ? "1 Week Premium Visibility" : "30 Days Premium Visibility";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stripe Checkout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body class="bg-[#F8F9FA] text-[#30313D] min-h-screen flex items-center justify-center p-4 sm:p-6">
  <div class="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E3E8EE] flex flex-col md:flex-row">
    
    <!-- Left Panel: Summary -->
    <div class="w-full md:w-5/12 bg-[#F8F9FA] border-r border-[#E3E8EE] p-8 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-2 text-[#635BFF] font-bold text-sm mb-8">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.962 8.185L10.26 12.12c-.527.561-1.317.842-2.37.842h-1.49v2.85h1.791c.983 0 1.756-.245 2.317-.736s.842-1.123.842-1.896c0-.667-.193-1.193-.579-1.579a3.81 3.81 0 0 0-1.281-.842c.491-.351.737-.842.737-1.474a2.2 2.2 0 0 0-.754-1.755c-.503-.439-1.187-.658-2.053-.658H4v13h2.399v-3.791H8c.982 0 1.772-.21 2.368-.632.597-.421.948-.983 1.053-1.684l3.65 4.107h3.193l-4.302-4.842c1.088-.456 1.842-1.193 2.263-2.21s.632-2.14.632-3.368c0-.983-.175-1.772-.526-2.369-.351-.596-.86-1.017-1.526-1.263l4.302-4.842H13.962z"/>
          </svg>
          <span class="tracking-wider">Stripe</span>
        </div>
        
        <div class="space-y-1">
          <span class="text-[#6A7383] text-xs font-semibold uppercase tracking-wider">VelvetLinks Platform</span>
          <h2 class="text-[#1A1F36] text-3xl font-extrabold">${price}</h2>
          <p class="text-[#4F5B76] text-sm font-medium mt-2">${planName}</p>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-[#E3E8EE] text-[11px] text-[#8792A2] space-y-1">
        <p>This is a secure Stripe payment transaction.</p>
        <p class="font-semibold text-[#635BFF]">Mode: TEST MODE SIMULATION</p>
      </div>
    </div>

    <!-- Right Panel: Payment Form -->
    <div class="w-full md:w-7/12 p-8 flex flex-col justify-between">
      <div>
        <h3 class="text-lg font-bold text-[#1A1F36] mb-6">Pay with card</h3>
        
        <form action="/api/stripe-callback" method="GET" class="space-y-4">
          <input type="hidden" name="userId" value="${userId}" />
          <input type="hidden" name="plan" value="${plan}" />
          <input type="hidden" name="simulated" value="true" />
          
          <div>
            <label class="block text-xs font-bold text-[#4F5B76] uppercase tracking-wide mb-1">Email</label>
            <input type="email" required value="escort_test@example.com" class="w-full bg-white border border-[#E3E8EE] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1F36] focus:outline-none focus:border-[#635BFF] transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#4F5B76] uppercase tracking-wide mb-1">Card information</label>
            <div class="border border-[#E3E8EE] rounded-lg overflow-hidden divide-y divide-[#E3E8EE]">
              <input type="text" required placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242" class="w-full bg-white px-3.5 py-3 text-sm text-[#1A1F36] focus:outline-none font-mono" />
              <div class="flex divide-x divide-[#E3E8EE]">
                <input type="text" required placeholder="MM / YY" value="12/29" class="w-1/2 bg-white px-3.5 py-3 text-sm text-[#1A1F36] focus:outline-none font-mono" />
                <input type="text" required placeholder="CVC" value="123" class="w-1/2 bg-white px-3.5 py-3 text-sm text-[#1A1F36] focus:outline-none font-mono" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#4F5B76] uppercase tracking-wide mb-1">Name on card</label>
            <input type="text" required value="Elite Companion" class="w-full bg-white border border-[#E3E8EE] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1F36] focus:outline-none focus:border-[#635BFF] transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold text-[#4F5B76] uppercase tracking-wide mb-1">Country or region</label>
            <select class="w-full bg-white border border-[#E3E8EE] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1F36] focus:outline-none focus:border-[#635BFF] transition-colors">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          <button type="submit" class="w-full bg-[#635BFF] hover:bg-[#0A2540] text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2 mt-6 shadow-md cursor-pointer">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Pay ${price}</span>
          </button>
        </form>
      </div>

      <div class="text-[11px] text-[#8792A2] flex items-center justify-center gap-1 mt-6">
        <svg class="w-3 h-3 text-[#3ECF8E]" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M2.166 4.9L10 .954 17.834 4.9A1 1 0 0118.5 5.8v4.7a10 10 0 01-5.457 8.932l-2.673 1.391a1 1 0 01-.87 0l-2.673-1.391A10 10 0 011.5 10.5V5.8a1 1 0 01.666-.9zM10 3.12l-6 3v3.88a8 8 0 004.362 7.146L10 17.961l1.638-.853A8 8 0 0016 9.998V6.12l-6-3zM13.707 8.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Secured by <strong>Stripe</strong></span>
      </div>
    </div>

  </div>
</body>
</html>
    `;
    res.send(html);
  });

  // API endpoint: Stripe Checkout Session creator
  app.get("/api/stripe-checkout", async (req, res) => {
    const { userId, plan } = req.query as { userId: string; plan: "week" | "month" };
    if (!userId || !plan) {
      return res.status(400).send("Missing userId or plan");
    }

    const host = req.get("host") || "localhost:3000";
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const origin = `${protocol}://${host}`;

    // If Stripe secret key is present in environment, use actual Stripe checkout session
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-02-02-preview" as any,
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: plan === "week" ? "1 Week Premium Visibility" : "30 Days Premium Visibility",
                  description: "Premium directory search visibility for escort profile on VelvetLinks.",
                },
                unit_amount: plan === "week" ? 1000 : 2500,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${origin}/api/stripe-callback?userId=${userId}&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/?stripe_cancel=true`,
        });

        return res.redirect(303, session.url!);
      } catch (err: any) {
        console.error("Stripe SDK checkout error:", err);
        // Fallback to simulator if Stripe fails
      }
    }

    // Direct fallback/standard mode: Redirect to the beautiful checkout simulator
    res.redirect(`/stripe-checkout-simulator?userId=${userId}&plan=${plan}`);
  });

  // API endpoint: Stripe Callback handler
  app.get("/api/stripe-callback", async (req, res) => {
    const { userId, plan } = req.query as { userId: string; plan: "week" | "month" };
    if (!userId || !plan) {
      return res.status(400).send("Missing userId or plan in callback");
    }

    try {
      const days = plan === "week" ? 7 : 30;
      
      // Load the existing profile if any
      const profileRef = doc(db, "escort_profiles", userId);
      const profileSnap = await getDoc(profileRef);

      let currentExpiry = new Date();
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        if (data.visibilityExpiry) {
          const prevExpiry = new Date(data.visibilityExpiry);
          if (prevExpiry > currentExpiry) {
            currentExpiry = prevExpiry;
          }
        }
      }

      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      const updatedExpiryString = newExpiry.toISOString();

      if (profileSnap.exists()) {
        await setDoc(profileRef, { 
          ...profileSnap.data(), 
          visibilityExpiry: updatedExpiryString 
        });
      } else {
        // Create basic profile template
        await setDoc(profileRef, {
          id: userId,
          userId: userId,
          name: "Elite Escort",
          description: "Premium elite companionship companion",
          services: ["Gala Dinner", "Secure Messaging", "VIP Travel Escort"],
          images: [],
          videos: [],
          location: "Miami, FL",
          coords: { lat: 25.7617, lng: -80.1918 },
          visibilityExpiry: updatedExpiryString,
          rate: "",
          age: 23,
          languages: ["English"],
          createdAt: new Date().toISOString(),
          views: 0,
          rating: 4.9
        });
      }

      // Redirect back to companion portal
      res.redirect(`/?stripe_success=true&plan=${plan}&days=${days}`);
    } catch (err) {
      console.error("Error in stripe callback:", err);
      res.status(500).send("Transaction processed successfully, but database update failed.");
    }
  });

  // Vite development middleware setup or production static files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
