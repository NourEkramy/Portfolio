import type { MediaItem } from "@/lib/types";

/**
 * Curated galleries, ordered as a walkthrough rather than as a filename dump.
 *
 * Two kinds of image appear here:
 *   app-*.webp   stills lifted from the screen recordings — the app running
 *   everything else  the design exports, or real device screenshots
 *
 * Where a recording exists the real app leads, because a greybox mockup proves
 * nothing. Files are produced by scripts/prepare-media.mjs.
 */
const shot = (url: string, caption: string): MediaItem => ({ url, caption, kind: "screenshot" });

export const galleries: Record<string, MediaItem[]> = {
  // Built app first, then the Figma the palette and layout were taken from.
  "food-delivery-app": [
    shot("/media/food-delivery-app/app-home.webp", "Home — cuisine categories and open restaurants"),
    shot(
      "/media/food-delivery-app/app-restaurants.webp",
      "Open restaurants, with photography pulled from each one's first dish",
    ),
    shot("/media/food-delivery-app/app-restaurant-list.webp", "Browsing restaurants"),
    shot("/media/food-delivery-app/app-cart.webp", "Cart — one restaurant at a time, by design"),
    shot("/media/food-delivery-app/app-order-placed.webp", "Order placed — a real POST that returns 201 Created"),
    shot("/media/food-delivery-app/app-orders.webp", "Order history, with cancellation"),
    shot("/media/food-delivery-app/app-addresses.webp", "Saved delivery addresses"),
    shot("/media/food-delivery-app/app-add-card.webp", "Adding a card — only the brand and last four are kept"),
    shot("/media/food-delivery-app/app-home-arabic.webp", "The same home screen in Arabic, mirrored right-to-left"),
    shot("/media/food-delivery-app/app-restaurants-arabic.webp", "Restaurant list in Arabic"),
    shot("/media/food-delivery-app/app-language.webp", "Switching language in app"),
    shot("/media/food-delivery-app/home-v-1.webp", "Design reference — home"),
    shot("/media/food-delivery-app/restaurant-view-01.webp", "Design reference — restaurant view"),
    shot("/media/food-delivery-app/food-details-01.webp", "Design reference — dish details"),
    shot("/media/food-delivery-app/my-cart.webp", "Design reference — cart"),
    shot("/media/food-delivery-app/payment-method.webp", "Design reference — payment"),
    shot("/media/food-delivery-app/my-orders-01.webp", "Design reference — orders"),
    shot("/media/food-delivery-app/filter.webp", "Design reference — filters"),
    shot("/media/food-delivery-app/onboarding-01.webp", "Design reference — onboarding"),
  ],

  "recipe-app": [
    shot("/media/recipe-app/app-home.webp", "Home — featured carousel, categories and popular recipes"),
    shot("/media/recipe-app/app-home-featured.webp", "Editor's picks in the featured carousel"),
    shot("/media/recipe-app/app-popular.webp", "Popular recipes"),
    shot("/media/recipe-app/app-recipe-detail.webp", "Recipe details — time, calories, servings and difficulty"),
    shot("/media/recipe-app/app-ingredients.webp", "Ingredients, the creator, and related recipes"),
    shot("/media/recipe-app/app-search.webp", "Search across the catalogue"),
    shot("/media/recipe-app/app-editors-choice.webp", "Editor's choice"),
    shot("/media/recipe-app/app-cart.webp", "Account and shopping cart"),
    shot("/media/recipe-app/app-login.webp", "Log in"),
  ],

  "order-tracking-notifications": [
    shot(
      "/media/poster/order-tracking-notifications.webp",
      "A push arrives and the delivery timeline advances to the next stage",
    ),
  ],

  "shopping-demo-app": [
    shot("/media/shopping-demo-app/collection-detail.webp", "Collection detail"),
    shot("/media/shopping-demo-app/checkout-1.webp", "Cart with promo code and delivery"),
    shot("/media/shopping-demo-app/checkout.webp", "Checkout — address, shipping and payment"),
  ],

  // Real device screenshots, walked through in flow order across both languages.
  "lupira-app": [
    shot("/media/lupira-app/screen-003.webp", "Splash — detect lupus early"),
    shot("/media/lupira-app/screen-051.webp", "Log in"),
    shot("/media/lupira-app/screen-028.webp", "Home — quick detection and lupus articles"),
    shot("/media/lupira-app/screen-029.webp", "Diagnosis tab with detection history"),
    shot("/media/lupira-app/screen-031.webp", "Prerequisites — the mandatory and optional lab tests"),
    shot("/media/lupira-app/screen-032.webp", "ANA test presence"),
    shot("/media/lupira-app/screen-033.webp", "Reported symptoms"),
    shot("/media/lupira-app/screen-062.webp", "Plain-language explanation of a clinical term"),
    shot("/media/lupira-app/screen-034.webp", "Laboratory results — urine test"),
    shot("/media/lupira-app/screen-035.webp", "Laboratory results — anti-dsDNA antibodies"),
    shot("/media/lupira-app/screen-074.webp", "Result — potential presence, with a referral recommendation"),
    shot("/media/lupira-app/screen-075.webp", "Result — no signs detected"),
    shot("/media/lupira-app/screen-030.webp", "Detection history"),
    shot("/media/lupira-app/screen-058.webp", "Curated lupus articles from clinical sources"),
    shot("/media/lupira-app/screen-059.webp", "About Lupira"),
    shot("/media/lupira-app/screen-021.webp", "Profile"),
    shot("/media/lupira-app/screen-037.webp", "Settings"),
    shot("/media/lupira-app/screen-045.webp", "Language selection"),
    shot("/media/lupira-app/screen-008.webp", "Home in Arabic"),
    shot("/media/lupira-app/screen-013.webp", "Prerequisites in Arabic, right-to-left"),
    shot("/media/lupira-app/screen-011.webp", "Settings in Arabic"),
    shot("/media/lupira-app/screen-076.webp", "Detection result in Arabic"),
  ],
};

/** Video poster frames, keyed by project slug. */
export const posters: Record<string, string> = {
  "food-delivery-app": "/media/poster/food-delivery-app.webp",
  "recipe-app": "/media/poster/recipe-app.webp",
  "order-tracking-notifications": "/media/poster/order-tracking-notifications.webp",
};
