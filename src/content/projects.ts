import type { Project } from "@/lib/types";

/**
 * The canonical project record. Everything here was read out of the actual
 * repositories — package versions from each pubspec.yaml, folder trees from
 * lib/, counts from the source files themselves.
 *
 * This doubles as the Supabase seed (see scripts/generate-seed.mjs) and as the
 * fallback the site renders when Supabase is not configured.
 */
export const projects: Project[] = [
  {
    slug: "food-delivery-app",
    title: "Food Delivery App",
    subtitle: "A complete ordering flow against a live REST API",
    summary:
      "Twenty screens, ten features and a real order that actually reaches the server. Built with MVVM + Cubit, fully localised into English and Arabic with correct RTL mirroring and ICU plurals, and covered by 160 tests.",
    body: [
      "Register or sign in, browse restaurants with real photographs, filter by cuisine, search dishes and restaurants, open a restaurant, add dishes to a cart, choose an address and a payment method, then place a real order — it comes back 201 Created and appears in your order history, where it can be cancelled.",
      "On top of the ordering flow: edit your profile, change your password, delete your account, and manage saved addresses and cards. Ten feature folders, each built to the same shape, so a new feature has an obvious place to go.",
      "The interesting work was not the happy path. It was deciding what to show when the API does not return what the design assumes, keeping the cart honest about a backend constraint, and making sure a password never lands in a log file.",
    ],
    role: "Solo developer — architecture, API integration, localisation, testing",
    category: "Mobile Application",
    period: "08/2026 — 09/2026",
    year: 2026,
    featured: true,
    sortOrder: 1,
    status: "published",
    repoUrl: "https://github.com/NourEkramy/Food-Deliver-App",
    coverUrl: "/media/food-delivery-app/app-home.webp",
    videoUrl: "/media/video/food-delivery-app.mp4",
    architecture: {
      name: "MVVM + Cubit, feature-first",
      summary:
        "Ten feature folders that all look the same: a model, a repository that owns the HTTP call, a cubit that owns the state, and a view. The Cubit never touches Dio; the repository never touches widgets. Cubits that outlive a single screen — auth, cart, addresses, payment — are constructed once in app.dart; everything else is built per route in routes.dart.",
      layers: [
        { name: "Model", detail: "Plain Dart data classes with tolerant JSON parsing." },
        { name: "Repository", detail: "Owns the Dio call and the mapping. The only layer that knows an API exists." },
        { name: "Cubit", detail: "Owns state and emits it. Uses equatable so identical states do not rebuild." },
        { name: "View", detail: "Renders state. Holds no business logic and makes no network calls." },
      ],
      tree: `lib/
├── app.dart                  # dependency graph, built once
├── routes.dart               # every navigation destination
├── core/
│   ├── network/              # Dio config, API-key interceptor, redacting logger
│   ├── storage/              # Keystore-backed session + local store
│   ├── theme/                # palette sampled from Figma, component styles
│   ├── locale/               # locale cubit
│   ├── util/                 # money formatting
│   └── widgets/              # text field, header, stepper, cached image
├── features/
│   ├── auth/                 # login, sign up, forgot password, session gate
│   ├── onboarding/           # splash, onboarding, startup gate
│   ├── restaurant_list/      # home
│   ├── restaurant_detail/    # restaurant view, dish details
│   ├── search/               # dish + restaurant search
│   ├── cart/                 # basket and checkout
│   ├── orders/               # history, detail, cancel
│   ├── address/              # saved delivery addresses
│   ├── payment/              # payment methods
│   └── profile/              # personal info, edit, change password
└── l10n/                     # ARB files + generated localisations`,
    },
    metrics: [
      { label: "Dart files", value: "82" },
      { label: "Lines of code", value: "10,760" },
      { label: "Passing tests", value: "160" },
      { label: "Screens", value: "20" },
      { label: "Features", value: "10" },
      { label: "Localised strings", value: "149 × 2" },
    ],
    highlights: [
      {
        label: "End-to-end ordering",
        detail:
          "Authentication, restaurant browsing, cuisine filtering, search, cart, address and payment selection, order placement, history and cancellation — against a live REST API rather than mock data.",
      },
      {
        label: "English / Arabic with real RTL",
        detail:
          "Layout mirroring via Directionality and EdgeInsetsDirectional throughout, so nothing is pinned to the left in an RTL locale. 149 strings in both languages.",
      },
      {
        label: "ICU plurals, not an English-shaped guess",
        detail:
          "Arabic has six plural forms. The ARB files use real ICU plural logic — zero, one, two, few, many, other — instead of a one/other split that would be wrong most of the time.",
      },
      {
        label: "Secure session handling",
        detail:
          "Tokens stored through flutter_secure_storage, which is backed by the Android Keystore and the iOS Keychain rather than shared preferences.",
      },
      {
        label: "Custom Dio interceptors",
        detail:
          "An API-key interceptor for authentication and a hand-written logging interceptor that redacts credentials before anything reaches the console.",
      },
      {
        label: "Tested at four configurations",
        detail:
          "Every screen renders on a standard phone, a 320×568 phone, at 1.6× accessibility text scale, and in Arabic. A RenderFlex overflow throws during layout, so a clean render is itself the assertion.",
      },
    ],
    decisions: [
      {
        title: "Only show what is true",
        detail:
          "The design mocks up star ratings, delivery fees and delivery times. The API returns none of them. Rather than invent numbers, restaurant cards show facts that exist — city, dish count, and whether there is parking. The same reasoning removed the social sign-in buttons, because there is no OAuth, and kept Forgot Password honest about the fact that no email will arrive.",
      },
      {
        title: "Restaurant photos from an API with no restaurant images",
        detail:
          "/Restaurant returns no image field. Instead of shipping placeholder assets, the repository also fetches /Restaurant/items — all 93 dishes in one request — and gives each restaurant its first dish's photo. That call is deliberately allowed to fail silently: photos are enrichment and must not cost the whole screen.",
      },
      {
        title: "The cart cannot span restaurants",
        detail:
          "makeorder puts the restaurant in the URL, so one order cannot cover two. That constraint is enforced in state through CartState.acceptsFrom and surfaced as a prompt when a user adds from somewhere else — not as a confusing failure at checkout.",
      },
      {
        title: "Cards keep only the last four digits",
        detail:
          "The number entered derives the brand and last four, then is discarded. Expiry and CVC are validated for shape and never stored, because nothing here could legitimately use them. A test asserts the full number never reaches storage.",
      },
      {
        title: "Tolerant API parsing",
        detail:
          "/Order needs a key, so its response shape could not be inspected while writing the model. Order.tryParse accepts several plausible key spellings and treats every field but the id as optional, so an unexpected payload yields a sparser card rather than a TypeError on screen.",
      },
      {
        title: "A logger that redacts",
        detail:
          "Dio's own LogInterceptor dumps the query string and body — and this API sends the password as a query parameter on login. The hand-written interceptor redacts passwords, API keys and user codes, and reports the shape of list responses rather than their contents.",
      },
    ],
    tech: [
      { name: "Flutter", version: "3.32+", kind: "language", note: "Android SDK 36 / NDK 27, minSdk 23" },
      { name: "Dart", kind: "language" },
      { name: "flutter_bloc", version: "^9.1.1", kind: "package", note: "Cubit-based state management across ten features" },
      { name: "dio", version: "^5.11.0", kind: "package", note: "HTTP client with custom API-key and redacting log interceptors" },
      { name: "equatable", version: "^2.1.0", kind: "package", note: "Value equality on states so identical emissions do not rebuild" },
      { name: "intl", version: "^0.20.2", kind: "package", note: "ICU plural logic and money formatting" },
      { name: "flutter_secure_storage", version: "^10.3.4", kind: "package", note: "Keystore / Keychain-backed session tokens" },
      { name: "cached_network_image", version: "^3.4.1", kind: "package", note: "Disk-cached restaurant and dish photography" },
      { name: "flutter_localizations", kind: "package", note: "ARB-driven English and Arabic with RTL" },
      { name: "cupertino_icons", version: "^1.0.8", kind: "package" },
      { name: "Repository pattern", kind: "concept" },
      { name: "MVVM", kind: "concept" },
      { name: "Feature-first structure", kind: "concept" },
    ],
    media: [],
  },
  {
    slug: "recipe-app",
    title: "Food Recipe App",
    subtitle: "Clean Architecture, layer by layer",
    summary:
      "A recipe browser built as a textbook separation of data, domain and presentation. Every feature owns its own three layers, use cases are single-purpose classes, and nothing is constructed by hand — GetIt resolves the graph.",
    body: [
      "Browse featured and popular recipes, explore categories, open a recipe for its details and creator, search across the catalogue, and keep a shopping cart of what you need to buy.",
      "The point of this project was the shape rather than the surface. Each feature — auth, recipes, search, cart, profile — carries its own data, domain and presentation folders. The domain layer holds entities and use cases and imports nothing from Flutter; the data layer maps remote JSON into those entities; presentation only talks to providers.",
      "Failures are modelled rather than thrown into the void: a Failure type in the core layer, exceptions converted at the data boundary, and a ViewStatus that presentation can render without knowing what went wrong underneath.",
    ],
    role: "Solo developer — architecture, API integration, state management",
    category: "Mobile Application",
    period: "07/2026",
    year: 2026,
    featured: true,
    sortOrder: 2,
    status: "published",
    repoUrl: "https://github.com/NourEkramy/Recipes-App",
    coverUrl: "/media/recipe-app/app-home.webp",
    videoUrl: "/media/video/recipe-app.mp4",
    architecture: {
      name: "Clean Architecture (data / domain / presentation)",
      summary:
        "Five features, each split into three layers with dependencies pointing inwards. Domain knows nothing about Dio or Flutter; data implements the repository interfaces domain declares; presentation consumes use cases through Provider. GetIt wires the graph in a single service locator.",
      layers: [
        { name: "Domain", detail: "Entities, repository interfaces and one class per use case. Pure Dart, no Flutter import." },
        { name: "Data", detail: "Remote data sources, models that map JSON to entities, and repository implementations." },
        { name: "Presentation", detail: "Providers holding view state, screens, and reusable widgets." },
        { name: "Core", detail: "Dio client, API constants, Failure and Exception types, the base UseCase contract and ViewStatus." },
      ],
      tree: `lib/
├── main.dart
├── app/
│   └── main_navigation.dart
├── Core/
│   ├── constants/            # api_constants, app_colors
│   ├── di/                   # service_locator (GetIt)
│   ├── error/                # exceptions, failures
│   ├── network/              # dio_client
│   └── usecases/             # usecase, view_status
└── features/
    ├── auth/
    │   ├── data/             # datasources, models, repositories
    │   ├── domain/           # entities, repositories, usecases
    │   └── presentation/     # providers, screens
    ├── recipes/
    │   ├── data/             # recipe + creator models, remote data source
    │   ├── domain/           # get_featured, get_popular, get_categories,
    │   │                     # get_recipe_details, get_creator
    │   └── presentation/     # home, details, search screens + widgets
    ├── search/
    ├── cart/
    └── profile/`,
    },
    metrics: [
      { label: "Dart files", value: "46" },
      { label: "Lines of code", value: "2,881" },
      { label: "Features", value: "5" },
      { label: "Use cases", value: "7" },
    ],
    highlights: [
      {
        label: "Strict layer separation",
        detail:
          "Presentation depends on domain, data implements domain. The dependency arrow never points outward, so the business rules could be lifted into another app unchanged.",
      },
      {
        label: "One class per use case",
        detail:
          "GetFeaturedRecipes, GetPopularRecipes, GetCategories, GetRecipeDetails, GetCreator, SearchRecipes and Login each implement a shared UseCase contract — small, nameable, individually testable.",
      },
      {
        label: "Dependency injection with GetIt",
        detail:
          "A single service_locator registers Dio, data sources, repositories, use cases and providers. Screens resolve what they need instead of constructing it, which keeps them trivially swappable in tests.",
      },
      {
        label: "Modelled failures",
        detail:
          "Exceptions raised at the data boundary are converted into Failure values, and a ViewStatus enum drives loading, error and success rendering consistently across every screen.",
      },
      {
        label: "Composable UI",
        detail:
          "Featured carousel, category list, editor's choice card, popular recipe card, author row, search thumbnail and cart card are each standalone widgets rather than nested build methods.",
      },
    ],
    tech: [
      { name: "Flutter", kind: "language" },
      { name: "Dart", kind: "language" },
      { name: "dio", version: "^5.7.0", kind: "package", note: "REST client wrapped in a configurable DioClient" },
      { name: "provider", version: "^6.1.2", kind: "package", note: "State management in the presentation layer" },
      { name: "get_it", version: "^8.0.0", kind: "package", note: "Service locator wiring the whole dependency graph" },
      { name: "cupertino_icons", version: "^1.0.6", kind: "package" },
      { name: "Clean Architecture", kind: "concept" },
      { name: "Use-case pattern", kind: "concept" },
      { name: "Repository pattern", kind: "concept" },
      { name: "Dependency injection", kind: "concept" },
    ],
    media: [],
  },
  {
    slug: "lupira-app",
    title: "Lupira",
    subtitle: "Early lupus detection — graduation project and published research",
    summary:
      "A Flutter application that screens for systemic lupus erythematosus from reported symptoms and laboratory results, scored against established clinical criteria. Backed by a Node.js and MongoDB API, and published as a co-authored research paper reporting 96.95% detection accuracy.",
    body: [
      "Patients answer a structured clinical questionnaire and enter laboratory values; the app evaluates them against recognised SLE criteria and returns a detection result, which is stored so the history can be reviewed over time.",
      "It carries the parts a real medical tool needs: account creation and authentication, a diagnosis tab, saved reports, article content, profile and settings management, and full Arabic/English localisation with RTL support and deep linking.",
      "This was my graduation project. The accompanying research was co-authored and published, reporting 96.95% accuracy in SLE detection.",
    ],
    role: "Flutter developer — mobile client, API integration, localisation; co-author on the paper",
    category: "Healthcare / Research",
    period: "2024 — 2025",
    year: 2025,
    featured: true,
    sortOrder: 3,
    status: "published",
    repoUrl: "https://github.com/NourEkramy/Lupira-App",
    coverUrl: "/media/lupira-app/screen-028.webp",
    architecture: {
      name: "Layered screens with shared UI modules",
      summary:
        "A base screen abstraction pairs each screen with its own logic class, keeping presentation and behaviour apart. Reusable interface pieces live in a Modules folder so cards, buttons, fields and dropdowns stay consistent across tabs, and a main layout hosts the tab navigation.",
      layers: [
        { name: "BaseScreen", detail: "base_screen plus base_screen_logic — a screen and its behaviour, separated." },
        { name: "Layout", detail: "main_layout hosting tab navigation." },
        { name: "Tabs", detail: "home, diagnosis and settings tabs." },
        { name: "Modules", detail: "Nine reusable UI modules shared across every tab." },
      ],
      tree: `lib/
├── main.dart
├── BaseScreen/
│   ├── base_screen.dart
│   └── base_screen_logic.dart
├── Layout/
│   └── main_layout.dart
├── Tabs/
│   ├── home_tab.dart
│   ├── diagnosis_tab.dart
│   └── settings_tabs.dart
├── Modules/
│   ├── detection_card_module.dart
│   ├── report_card_module.dart
│   ├── article_card_module.dart
│   ├── user_credentials_card_module.dart
│   ├── authentication_button_module.dart
│   ├── operation_button_module.dart
│   ├── drop_down_list_module.dart
│   ├── text_field_module.dart
│   └── settings_options_module.dart
├── Sign-Up/
│   ├── sign_up_ui.dart
│   └── sign_up_api.dart
└── Bottom Sheets/
    └── language_bottom_sheets.dart`,
    },
    metrics: [
      { label: "Detection accuracy", value: "96.95%" },
      { label: "Dart files", value: "19" },
      { label: "Lines of code", value: "1,543" },
      { label: "UI modules", value: "9" },
    ],
    highlights: [
      {
        label: "Clinical questionnaire scoring",
        detail:
          "User-reported symptoms and laboratory results are analysed against established SLE clinical criteria to produce a detection result.",
      },
      {
        label: "Validated medical forms",
        detail:
          "flutter_form_builder with form_builder_validators enforces required fields, ranges and formats before anything reaches the scoring API — wrong input in a medical context is worse than no input.",
      },
      {
        label: "Node.js and MongoDB backend",
        detail:
          "The app is integrated with a REST API covering user accounts, questionnaire submissions and stored detection results.",
      },
      {
        label: "Arabic / English with RTL",
        detail:
          "Full localisation with a language bottom sheet, right-to-left layout support, and deep linking into the app.",
      },
      {
        label: "Result history and reports",
        detail:
          "Detection outcomes are persisted so a patient can review previous results through report cards rather than re-running the questionnaire blind.",
      },
      {
        label: "Published research",
        detail:
          "Co-authored and published a research paper on the project, reporting 96.95% accuracy in SLE detection.",
      },
    ],
    tech: [
      { name: "Flutter", kind: "language" },
      { name: "Dart", kind: "language" },
      { name: "Node.js", kind: "service", note: "REST API for accounts, questionnaires and results" },
      { name: "MongoDB", kind: "service", note: "Document store for users and detection history" },
      { name: "bloc", version: "^9.0.0", kind: "package" },
      { name: "flutter_bloc", version: "^9.0.0", kind: "package", note: "State management across tabs and the diagnosis flow" },
      { name: "flutter_form_builder", version: "^9.5.0", kind: "package", note: "Structured clinical questionnaire forms" },
      { name: "form_builder_validators", version: "^11.0.0", kind: "package", note: "Field validation before submission" },
      { name: "http", version: "^1.3.0", kind: "package", note: "Calls into the Node.js API" },
      { name: "country_picker", version: "^2.0.27", kind: "package", note: "Country selection during sign-up" },
      { name: "cupertino_icons", version: "^1.0.8", kind: "package" },
    ],
    media: [],
  },
  {
    slug: "shopping-demo-app",
    title: "Shopping Demo App",
    subtitle: "MVVM, reduced to its essentials",
    summary:
      "A compact shopping client written to demonstrate MVVM cleanly: models, services, view models and views in four separate folders, with Provider driving the bindings and Dio behind a service layer.",
    body: [
      "Products load from a remote API into a home grid; tapping through gives a detail view, and items can be added to a cart that tracks quantities and totals.",
      "Written as a mentorship exercise, the value is in the discipline rather than the feature count. The views hold no logic, the view models hold no widgets, and the services are the only place an HTTP call exists — so the same view model would work unchanged against a different backend.",
    ],
    role: "Solo developer — MVVM structure, API layer, state management",
    category: "Mobile Application",
    period: "2026",
    year: 2026,
    featured: false,
    sortOrder: 4,
    status: "published",
    repoUrl: "https://github.com/NourEkramy/Mentor_Ship_Task2",
    coverUrl: "/media/shopping-demo-app/collection-detail.webp",
    architecture: {
      name: "MVVM with a service layer",
      summary:
        "Four folders, one responsibility each. Views render and dispatch; view models hold observable state and call services; services own the Dio calls and return models. Provider connects view models to the widget tree.",
      layers: [
        { name: "Models", detail: "product and cart_item — plain data with JSON mapping." },
        { name: "Services", detail: "api_services and product_service — the only layer aware of Dio." },
        { name: "ViewModels", detail: "home_viewmodel and cart_viewmodel — state plus the operations that change it." },
        { name: "Views & Widgets", detail: "home and cart screens composed from product_card and cart_item_card." },
      ],
      tree: `lib/
├── main.dart
├── models/
│   ├── product.dart
│   └── cart_item.dart
├── services/
│   ├── api_services.dart
│   └── product_service.dart
├── viewmodels/
│   ├── home_viewmodel.dart
│   └── cart_viewmodel.dart
├── views/
│   ├── home/home_screen.dart
│   └── cart/cart_screen.dart
└── widgets/
    ├── product_card.dart
    └── cart_item_card.dart`,
    },
    metrics: [
      { label: "Dart files", value: "11" },
      { label: "Lines of code", value: "551" },
      { label: "Layers", value: "4" },
    ],
    highlights: [
      {
        label: "Textbook MVVM separation",
        detail:
          "Views contain no business logic and view models import no widgets, so each side can be reasoned about — and tested — on its own.",
      },
      {
        label: "Service layer isolating the API",
        detail:
          "api_services holds the Dio configuration and product_service holds the endpoints. Swapping the backend touches two files and no view model.",
      },
      {
        label: "Provider bindings",
        detail:
          "Home and cart view models are exposed through Provider, so the cart badge and totals stay in sync wherever they appear.",
      },
      {
        label: "Reusable card widgets",
        detail: "product_card and cart_item_card keep the grid and the basket visually consistent.",
      },
    ],
    tech: [
      { name: "Flutter", kind: "language" },
      { name: "Dart", kind: "language" },
      { name: "dio", version: "^5.10.0", kind: "package", note: "HTTP client isolated inside the service layer" },
      { name: "provider", version: "^6.1.5+1", kind: "package", note: "Binds view models to the widget tree" },
      { name: "cupertino_icons", version: "^1.0.8", kind: "package" },
      { name: "MVVM", kind: "concept" },
      { name: "Service layer", kind: "concept" },
    ],
    media: [],
  },
  {
    slug: "order-tracking-notifications",
    title: "Order Tracking & Notifications",
    subtitle: "Firebase Cloud Messaging with a live delivery timeline",
    summary:
      "Built at the ISupply Flutter hackathon under time pressure: push notifications through Firebase Cloud Messaging, local notifications for foreground delivery, runtime permission handling, and an order timeline that advances through each delivery stage.",
    body: [
      "A push arrives from Firebase Cloud Messaging and the order status moves forward. In the foreground, flutter_local_notifications presents it so a message is never silently swallowed; in the background, FCM handles presentation itself.",
      "Notification permission is requested at runtime through permission_handler rather than assumed, and the tracking screen renders the order's progress as a timeline so the current stage is legible at a glance.",
      "Built individually during the hackathon with a focus on API integration, state handling and UI under a hard deadline.",
    ],
    role: "Solo developer — hackathon prototype",
    category: "Hackathon Prototype",
    period: "06/2025",
    year: 2025,
    featured: false,
    sortOrder: 5,
    status: "published",
    repoUrl: "https://github.com/NourEkramy/Order-Tracking-Notification",
    coverUrl: "/media/poster/order-tracking-notifications.webp",
    videoUrl: "/media/video/order-tracking-notifications.mp4",
    architecture: {
      name: "Focused single-flow prototype",
      summary:
        "A deliberately small surface: one tracking screen composed from two widgets, with Firebase initialised from generated options and messaging wired up in main. Scope was the constraint, so the structure stays flat and readable rather than layered for its own sake.",
      layers: [
        { name: "main.dart", detail: "Firebase init, FCM listeners and local notification setup." },
        { name: "Screens", detail: "order_tracking_screen — the single tracking surface." },
        { name: "Widgets", detail: "order_card_widget and order_progress_widget." },
      ],
      tree: `lib/
├── main.dart                     # Firebase init + FCM + local notifications
├── firebase_options.dart         # generated platform configuration
├── Screens/
│   └── order_tracking_screen.dart
└── Widgets/
    ├── order_card_widget.dart
    └── order_progress_widget.dart`,
    },
    metrics: [
      { label: "Built in", value: "Hackathon" },
      { label: "Dart files", value: "5" },
      { label: "Lines of code", value: "439" },
    ],
    highlights: [
      {
        label: "Firebase Cloud Messaging",
        detail:
          "Remote push notifications delivered through FCM, with platform configuration generated into firebase_options.dart.",
      },
      {
        label: "Foreground notifications",
        detail:
          "FCM does not display notifications while the app is in the foreground, so flutter_local_notifications presents them instead — otherwise the most important messages are the ones a user never sees.",
      },
      {
        label: "Runtime permissions",
        detail:
          "permission_handler requests notification permission explicitly, which Android 13+ requires rather than granting by default.",
      },
      {
        label: "Delivery timeline",
        detail:
          "order_tracker and timeline_tile render the order's stages as a vertical progression, so the current step reads at a glance.",
      },
      {
        label: "Responsive sizing",
        detail: "sizer scales the layout across device sizes without hand-tuning each breakpoint.",
      },
    ],
    tech: [
      { name: "Flutter", kind: "language" },
      { name: "Dart", kind: "language" },
      { name: "firebase_core", version: "^3.14.0", kind: "package", note: "Firebase initialisation" },
      { name: "firebase_messaging", version: "^15.2.7", kind: "package", note: "Remote push notifications" },
      { name: "flutter_local_notifications", version: "^19.3.0", kind: "package", note: "Foreground notification presentation" },
      { name: "permission_handler", version: "^12.0.0+1", kind: "package", note: "Runtime notification permission" },
      { name: "order_tracker", version: "^0.0.2", kind: "package", note: "Order status progression UI" },
      { name: "timeline_tile", version: "^2.0.0", kind: "package", note: "Vertical delivery timeline" },
      { name: "sizer", version: "^3.0.4", kind: "package", note: "Responsive sizing across devices" },
      { name: "cupertino_icons", version: "^1.0.8", kind: "package" },
      { name: "Firebase", kind: "service" },
    ],
    media: [],
  },
];
