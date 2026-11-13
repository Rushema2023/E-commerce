# PROJECT: BERWA COLLECTIONS — PROFESSIONAL FASHION E-COMMERCE WEBSITE

Act as a senior full-stack software engineer, UI/UX designer, database architect, and e-commerce security specialist.

Build a professional, responsive, production-oriented fashion e-commerce website named **Berwa Collections**. Do not create only a static mockup. Build a real application with a functional frontend, database integration, authentication, product management, shopping cart, checkout, and an administrator dashboard.

Before coding, inspect the current project folder and existing files. Preserve useful existing work, and do not overwrite working functionality unnecessarily. If the project is empty, set up the application using the stack below.

## 1. Technology stack

Use these technologies:

- Frontend: React with Vite and TypeScript.
- Styling: Tailwind CSS.
- Backend and API operations: Node.js using secure server-side endpoints or functions supported by the chosen deployment setup.
- Database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- File storage: Supabase Storage.
- Hosting: Vercel.
- Version control: Git.

Use clean, reusable components, organized folders, environment variables, clear error handling, and maintainable code.

Do not replace this stack with Python, PHP, Firebase, or another database system.

## 2. Brand identity and color palette

The website is called **Berwa Collections**.

Tagline: **Style that stays.**

The brand sells classic, modern, and affordable clothing for men and women, as well as fashion accessories.

Create a premium, elegant, modern, welcoming fashion-store aesthetic. The site should feel polished, trustworthy, and suitable for customers shopping throughout Rwanda.

Use this color palette consistently:

- Google blue: #4285F4
- Soft green: #A8C3A0
- Warm ivory: #FAF8F4
- Soft beige: #EDE4D8
- Deep olive: #343B32
- White: #FFFFFF
- Muted gray: #777777

Color rules:
- Use warm ivory and white for the primary backgrounds.
- Use soft green for selected fashion accents, badges, and secondary buttons.
- Use Google blue for links, focus states, selected controls, and occasional important highlights.
- Use deep olive for headings, navigation text, and the footer.
- Use soft beige for banners and alternating sections.
- Maintain accessible text contrast and clear keyboard focus indicators.
- Do not use too many bright colors at once.
- Use consistent spacing, elegant typography, subtle borders, refined shadows, and gently rounded cards.
- Avoid excessive gradients, distracting animations, and an overly colorful layout.

The website must look excellent on desktop, tablets, and mobile phones.

## 3. Homepage and navigation

Create a professional homepage with:

1. A slim announcement bar advertising countrywide delivery in Rwanda.
2. A responsive navigation bar with the Berwa Collections logo or wordmark.
3. Navigation links for Home, Shop, Men, Women, Accessories, About, and Contact.
4. Search, account, and shopping-bag icons.
5. A large fashion hero section with high-quality clothing photography, a strong headline, a short description, and a clear Shop Now button.
6. Featured collections for men, women, and accessories.
7. A bestselling-products section.
8. New arrivals.
9. A short brand-story section.
10. Customer trust information covering delivery, support, and payment review.
11. A newsletter section if implemented with proper validation and consent.
12. A professional footer with contact details, policies, social links, and useful navigation.

Use real, appropriate fashion product images where available. Do not rely on abstract CSS shapes as the final product photography. Use image URLs that can be replaced easily with the store's own product images. Do not hotlink random images without checking their suitability and licensing.

Do not invent a real business address, phone number, social account, or customer testimonial. Use clearly marked editable placeholders until actual business information is provided.

## 4. Product catalogue

Support these categories:

- Men
- Women
- Accessories

Each product should have:

- Product name
- Description
- Category
- Price in Rwandan francs (RWF)
- Main image and optional additional images
- Available sizes where relevant
- Available colors
- Stock quantity
- SKU or product identifier
- Featured or new-arrival status
- Active or inactive status

Implement:

- Product listing and responsive product cards.
- Category filtering.
- Search by product name.
- Sorting by price and newest arrivals.
- Product detail pages.
- Size and color selection where relevant.
- Stock availability indicators.
- Quantity selection.
- Add-to-cart functionality.
- Proper empty, loading, and error states.

Prices and stock must come from the database, not hardcoded frontend values.

## 5. Shopping cart and checkout

Build a functional cart that supports:

- Adding products.
- Changing quantities.
- Removing products.
- Displaying subtotal and total.
- Validating quantities against available stock.
- Preserving the cart appropriately for returning visitors.

Create a checkout form that collects only the information required to fulfil an order:

- Customer's full name.
- Phone number.
- District or town in Rwanda.
- Delivery address or directions.
- Optional delivery instructions.
- Selected payment method.

Validate all form data on both the frontend and server.

Calculate the final amount on the server using trusted database prices. Never trust a total sent by the browser.

Display a clear order summary before the customer submits the order.

Show a confirmation page containing the order number and current payment/order status.

## 6. Payment submission and administrator approval

The store must support a controlled payment-review workflow.

Payment methods should be configurable by the administrator. Initially, allow the store to configure supported methods such as Mobile Money and bank transfer, depending on the actual payment services available to the business.

The workflow should be:

1. The customer submits an order.
2. The server validates the order and records its items and amount.
3. The customer sees the available payment instructions configured by the store.
4. The customer makes the payment outside the website using the selected supported method.
5. The customer submits the transaction reference and may upload a payment receipt or screenshot.
6. The order enters a pending-payment-review state.
7. An authenticated administrator checks the payment using the appropriate payment provider or account records.
8. The administrator approves or rejects the payment.
9. An approved payment updates the payment status and permits the order to move to fulfilment.
10. A rejected payment remains on hold and receives a clear status and appropriate next steps.
11. The customer can check the order status.

Use explicit, separate order and payment statuses, such as:

- Order: pending payment, confirmed, processing, shipped, delivered, cancelled.
- Payment: awaiting payment, submitted for review, approved, rejected, refunded.

Do not treat a customer-provided transaction reference or uploaded screenshot as proof that money has actually arrived. Administrator approval must be an authenticated server-side action. Where a payment-provider API is available, support verification through the provider.

Never request, store, or expose a customer's Mobile Money PIN, banking password, card security code, or account password.

Store uploaded proof securely in a private Supabase Storage bucket. Validate file types and file sizes, restrict access to the customer who owns the order and authorized administrators, and use signed URLs or a secure server-side access mechanism where appropriate.

Do not expose payment evidence publicly.

Do not claim that the website processes automatic payments unless a real payment gateway has been integrated and tested.

## 7. Administrator dashboard

Build a protected administration area with:

- Secure administrator login.
- Dashboard summary of orders, revenue from approved payments, pending reviews, and low-stock products.
- Product creation, editing, activation, and deletion.
- Product image management.
- Category and inventory management.
- Order listing and order-detail views.
- Customer delivery details visible only to authorized administrators.
- Payment reference and secure payment-evidence viewing.
- Approve/reject payment actions with confirmation.
- Order fulfilment status updates.
- Search and filters for orders.
- Basic customer and sales reporting.

Do not make the admin dashboard accessible to unauthenticated visitors.

Do not rely on hiding an admin button in React as security. Enforce permissions on the server and in Supabase Row Level Security policies.

Do not allow a customer to approve their own payment, change their order amount, modify stock, or grant themselves administrator privileges.

## 8. Customer accounts and order history

Allow customers to register and sign in securely if account functionality is implemented.

Customers should only be able to access their own profile, orders, and private payment evidence.

Provide an order-history page and a way to view payment and fulfilment status.

If guest checkout is offered, use a secure order lookup or verification process. Do not expose another customer's order through a guessable order ID.

## 9. Supabase database

Create SQL migrations or a complete SQL setup script for an appropriate relational schema. Include, at minimum, tables for:

- profiles
- categories
- products
- product_images, if needed
- product_variants or inventory, if needed
- orders
- order_items
- payments
- store_settings

Add appropriate primary keys, foreign keys, constraints, indexes, timestamps, and sensible status fields.

Store prices as integer RWF amounts or another precise monetary representation, not floating-point currency values.

Ensure that order items preserve the product name and price at the time the order was created.

Add Row Level Security policies for customer data, orders, payments, and private files.

Customers may only read their own protected records. Public visitors may only read active products and public catalogue data. Administrative operations must be restricted to verified administrators.

Use a secure, server-controlled method to establish administrator privileges. Never trust a role or admin flag submitted by the client.

Provide SQL instructions to create the tables, configure storage, enable RLS, and apply policies.

## 10. Security and backend requirements

- Keep Supabase service-role keys and other secrets exclusively on the server.
- Never place private secrets in frontend environment variables.
- Use the appropriate Vite public environment-variable prefix only for values intentionally exposed to the browser.
- Validate and authorize every sensitive server-side operation.
- Prevent unauthorized payment approvals and order modifications.
- Use parameterized queries or safe Supabase query APIs.
- Validate uploaded files and protect against malicious file uploads.
- Escape untrusted content appropriately.
- Add sensible rate limiting to sensitive endpoints where practical.
- Avoid leaking customer data or internal errors in API responses.
- Use secure session handling and authentication checks.
- Avoid logging passwords, secrets, or sensitive payment evidence.
- Use trusted server-side prices and inventory checks.
- Prevent duplicate or inconsistent order creation where practical.
- Handle failures safely and return useful error messages.

Document any remaining production security steps.

## 11. Rwanda delivery and local settings

Use RWF for displayed prices.

Provide delivery fields suitable for customers in Rwanda, including district or town, address, and optional directions.

Make delivery fees configurable rather than inventing fixed delivery prices.

Do not invent specific delivery times, payment-provider credentials, or payment instructions. Put business-specific values in editable settings.

Use a phone-number input that accepts appropriate Rwandan numbers and validate it without unnecessarily rejecting valid formats.

## 12. Design and user experience

Create a visually polished fashion store with:

- High-quality product photography.
- Consistent image ratios.
- Elegant typography.
- Clear price and product details.
- Attractive product cards.
- Smooth but subtle interactions.
- Responsive navigation.
- Accessible forms.
- Loading indicators.
- Empty-cart messages.
- Error and success notifications.
- Clear payment and order statuses.
- Mobile-friendly checkout.
- Consistent spacing and button styles.

Do not use browser alert boxes as the main interface for important actions. Use designed confirmation dialogs, inline feedback, or toast messages.

Include appropriate accessibility labels, keyboard navigation, and semantic HTML.

## 13. Suggested project structure

Use a maintainable structure similar to:

src/
  components/
  pages/
  layouts/
  features/
    products/
    cart/
    checkout/
    orders/
    auth/
    admin/
  hooks/
  lib/
  services/
  types/
  styles/

supabase/
  migrations/
  seed.sql

api/ or server/
  secure server-side endpoints

public/
  images/

Adjust this structure if the chosen Vercel deployment approach requires a different arrangement. Keep the frontend, database migrations, and server-side code clearly organized.

## 14. Environment configuration

Create a `.env.example` file containing placeholders for the required configuration.

Document the correct variables for the chosen Supabase and Vercel setup. Never put actual secret values in the example file.

Include setup instructions for:

- Installing dependencies.
- Configuring Supabase.
- Applying database migrations.
- Configuring storage and RLS.
- Creating the first administrator securely.
- Running the project locally.
- Testing the application.
- Deploying to Vercel.
- Configuring production environment variables.

## 15. Testing and delivery

Do not stop after creating the homepage.

Implement and test the main user journeys:

1. Browse and search for products.
2. Filter by category.
3. Open a product detail page.
4. Add products to the cart and change quantities.
5. Submit a checkout form.
6. Create an order with a server-calculated total.
7. Submit a payment reference and optional proof.
8. Confirm the order remains pending until an authorized administrator reviews it.
9. Approve or reject a payment as an administrator.
10. Verify that customers cannot access another customer's orders or payment evidence.
11. Verify that customers cannot call admin actions.
12. Verify that inactive products and invalid stock quantities cannot be purchased.
13. Verify responsive layouts on mobile and desktop.

Add appropriate tests for important calculations, permissions, and status transitions.

Run the build and relevant tests. Fix errors before reporting completion.

Provide a clear README explaining the setup, features, environment variables, database configuration, testing, and deployment.

## Final instruction

Work directly in the existing Antigravity project workspace. Build the application in manageable stages, but continue until the core features are implemented rather than stopping at a plan.

If a required external service needs credentials or business information that has not been supplied, create the integration structure and clearly explain what must be configured. Do not fabricate credentials or claim an external payment integration is working when it has not been connected and tested.

At the end, summarize what was implemented, which commands were run, which tests passed, what configuration remains, and how to run the application locally.