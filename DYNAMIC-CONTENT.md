# Dynamic content map (for the Laravel move)

Rule for the HTML phase: content stays in the HTML (never in JS files). Every part that will come from the admin panel is marked
`<!-- DYNAMIC: ... -->` in the page. JS only adds behaviour (sort, search, paging, popup) over what is already in the HTML.

## On every page (shared layout / partials)
| Part | Becomes |
|---|---|
| Header + mega menus (Our Courses, Who We Train, Research & Advocacy, Insights, MHFAider Hub, About Us) | Menu table (name, link, parent, order) |
| Footer columns + links, address, phone, email, social icons | Menu table + site settings |
| "Let's stay in touch" block + Newsletter form | Site settings + newsletter endpoint |
| `<title>`, meta description, canonical, Open Graph, H1 | Per-page SEO fields (page / record) |
| Banner (sub pages): pill text, H1, intro text, photo | Page fields (`banner_label`, `title`, `intro`, `banner_image`). Green shade is CSS (`pb-tint`), not part of the image |

## Per page
| Page | Dynamic parts |
|---|---|
| Home (`index.html`) | Hero text, stats, course cards, testimonials/logos, blog cards |
| Blogs (`blogs.html`) | Slider (popular), Popular Reads, blog cards (image, date, read time, title, text, slug), search, sort, paging, categories |
| Blog details (`blog-details.html`) | Title, date, author, banner, article body (H2/H3, lists), TOC from headings, Recent blogs, CTA box |
| News (`news.html`) | Slider, Popular Reads, news cards (badge, date, title, text, slug), sort, search, paging |
| News details (`news-details.html`) | Title, badge, date, banner, body, Latest News (4) |
| FAQs (`faqs.html`) | FAQ categories, questions + answers (answers may include check-lists) |
| Definitions (`definitions.html`) | Terms (title, text, bullet list, Learn More link), Jump-to list built from the terms |
| Helpline (`helpline.html`) | Professionals list, helpline table (rows, Show More), jump list |
| Glossary (`glossary.html`) | Categories, A-Z terms per category (title, definition, Learn More link); letters are built from the term titles |
| Acts & Policies (`acts-policies.html`) | Items (title, description paragraphs, "Click here" document URL), Jump-to list |
| Podcasts (`podcasts.html`) | Episode cards (image, title, text) + popup per episode: date, duration, description, speaker (name, link, social links), YouTube embed URL (`data-video`), platform links (Apple Podcasts / YouTube / Spotify / Amazon Music / YT Music - show only the ones that have a URL), topics, sort, paging |
| Webinar (`webinars.html`) | Webinar cards (thumbnail, title, text) + popup: YouTube embed URL (`data-video`) and description, sort, paging |
| Mental Health Books (`books.html`) | Books (cover, title, author(s), short description (2 lines shown), Find Book URL), "Found N books" count, sort, paging (10 per page) |

## Conventions used in the HTML (keep them in Blade)
- One H1 per page; section H2s; IDs on terms/items come from the slug.
- Listing pages: cards are `<article data-date="YYYY-MM-DD">`; 9 per page; paging/sort run on the rendered cards (later can be server-side with the same markup).
- Banner photo: `images/banner-*.webp`, 1440x360, clean photo only. Shade = class `pb-tint` + `--tint` / `--tint-a` in `css/style.css`.
- CSS: `style.css` (shared) + one file per template: `listing.css`, `article.css`, `info.css`. Pages set a body class (`pg-news`, `pg-faqs`, ...) for page-only rules.
- Known leftovers: `data/blogs-data.js` + `js/blogs.js` / `js/blog-details.js` still hold sample blog content in JS (earlier phase) - to be replaced by HTML rendered from the database.
- Placeholder links still `#`: Common Mental Disorders, Suicide Prevention Support, platform/document links.

## JS notes for Laravel
Our scripts are plain JS, each wrapped in its own function (no globals, no jQuery/libraries), so they do not clash with Laravel's `app.js`.

| Script | Used on | In Laravel |
|---|---|---|
| `menu.js` | every page | Keep (main layout) |
| `reveal.js` | most pages | Keep (main layout) |
| `count.js` | home | Keep |
| `definitions.js`, `helpline.js` | Definitions, Helpline, Acts | Keep (jump-list highlight / Show More are look-and-feel only) |
| `faqs.js`, `glossary.js` | FAQs, Glossary | Keep the category switch; search can stay client-side while all items are on one page, otherwise do it server-side |
| `news.js`, `blogs.js` | News, Blogs | Keep the slider and Popular Reads; MOVE sort, search and paging to the server (`?sort=&q=&page=`, Laravel paginator, same markup/classes) |
| `episodes.js` | Podcasts, Webinar, Books | Keep the popup and the Show More toggle; MOVE sort, paging and the "Found N" count to the server |
| `news-details.js`, `blog-details.js` | detail pages | Keep (TOC highlight, share, etc.); article content comes from Blade |
| `data/blogs-data.js`, parts of `blogs.js` / `blog-details.js` | Blogs | REMOVE - sample content in JS; replace with Blade-rendered HTML |

Rules to follow in Laravel:
1. Load shared scripts in the layout and page scripts with `@push('scripts')`; use `asset()` / Vite for paths (no relative `js/...`, pages will have nested URLs).
2. Do not re-draw page parts with Livewire/Alpine/AJAX that our scripts bind to (`#bgrid`, `#pager`, `#sort`, `#glside`, `#fqside`, `#podModal`); they attach once on load. If needed, re-run the script after the update.
3. No Bootstrap/Tailwind on top of this CSS (class names like `.container`, `.sort`, `.pager` would clash).
4. Forms (newsletter, contact, instructor application): `@csrf`, and send the CSRF token with `fetch`.
5. Keep content in the HTML (not built by JS) - good for SEO and for Blade.

## Work with us (work-with-us.html, css/careers.css, js/careers.js)
- Banner text/image: admin fields. Vacancies: loop of `.role` cards (title, min. experience, location, description, bullets, closing line, posted date -> `data-date`, plus `data-role/title/exp/loc`). The "4 Open Roles" count = number of roles.
- "Apply Now" fills the left panel + Job Position from the card's data attributes (JS only copies what is in the HTML). On Laravel, also post a `role_id` hidden field.
- Form: `@csrf`, `enctype="multipart/form-data"`, server-side validation, resume stored (pdf/doc/docx, size limit), replace the checkbox placeholder with real reCAPTCHA, send admin email. Form grid class is `.af-grid` (`.fgrid` is the footer).

## Contact us (contact-us.html, css/contact.css, js/contact.js)
- Banner text/image, contact details (address, email, phone, landline, business hours) and the Google Maps embed URL = site settings (also reused in the footer). Form: `@csrf`, server-side validation (`phone` => `digits:10`), admin email, real reCAPTCHA in place of the placeholder checkbox.
- "Contact us" (menu), "Contact Us" (footer) and the "Reach Out To Us" button now link to this page on every page.

## About us (about-us.html, css/about.css, js/about.js)
- Dynamic blocks (all marked `<!-- DYNAMIC: -->`): hero text/image; 4 key numbers; program tabs (tab label + panel title/paragraphs; tabs are `role=tab`, ids `tab-*` / `pan-*` must stay paired); story; vision and mission lists; areas of focus (3); audience cards (image, title, text, link); quality principles (9, loop); MHFA journey milestones (loop, alternating above/below the line via `.tl-top`/`.tl-bot`, so add a `position` field or alternate by loop index); team members (photo, name, designation, bio; loop).
- JS only handles tabs and the arrow buttons (`data-for="tl"` / `"tm"` point at the scroll tracks); content stays in the HTML.
- Menu "About MHFA India" and footer link now open this page on every page.
- Animations (about.js/about.css): scroll reveals via data-ab, count-up of key numbers, hover effects; all disabled for prefers-reduced-motion and without JS. Count-up reads the number from the HTML, so dynamic values just work.
- About page journey = horizontal timeline (`.tl`, items alternate above/below the line via `.tl-top`/`.tl-bot`, arrows scroll it).

## Login (login.html, css/login.css, js/login.js)
- Headline/lead/role lines = text fields. Role tabs: each tab carries `data-role` and `data-sub` (welcome text); JS copies them into the heading and the hidden `role` input. Form: `@csrf`, post to the Laravel login route with `role`, show validation errors under each field; "Login with OTP" and "Forgot password?" are placeholder links to real routes. The header "Login" button now links here on every page.

## Instructor application (instructor-application.html, css/apply.css, js/apply.js)
- Linked from the About Us menu ("Become an Instructor", sample link on every page).
- 5-step form in ONE `<form>`: one `fieldset.step` per step; JS only moves between steps and validates each step with the browser's own checks (the Next button blocks until the step is valid). On Laravel keep the single form (`@csrf`, `enctype="multipart/form-data"`), validate again on the server, store the uploads (resume, support letter, address proof, PAN, conduct certificate), email the team.
- Dynamic parts: left title/text/photo, course options (select), question list (`.qa`, one textarea each: `answer_N`), declaration/terms links, real reCAPTCHA instead of the placeholder box. Mobile = 10 digits (`digits:10`), postal code = 6 digits.
- The Thank you panel (`#iaThanks`) is the success view: after the server saves the form, redirect to a view that shows only that panel (remove the form).

## Login with OTP (login.html)
Three panes on one page: password login, "Send OTP" (email or 10-digit mobile), "Verify & Login" (6 boxes, paste supported, 30s resend timer). All text is in the HTML (error messages are `data-*` attributes).
Laravel: routes `login/otp/send`, `login/otp/verify`, `login/otp/resend`, each with `@csrf`. Rate-limit (`throttle:5,1`), store a hashed OTP with a 5-minute expiry, allow max 5 wrong attempts, and always return the same message whether or not the user exists. The `role` hidden field (Instructor / Learner / Company) is posted in every pane. The JS submit handlers are demo only: remove `e.preventDefault()` in the success path or switch panes from the AJAX response.

## Forgot password (login.html)
4 screens on the same page: send OTP (`#lgFg1`) → verify OTP (`#lgFg2`) → new password (`#lgFg3`) → success (`#lgFg4`). Opened from the "Forgot password?" link. All text is in the HTML (errors are `data-*` attributes).
Laravel: routes `forgot/send`, `forgot/verify`, `forgot/resend`, `forgot/reset`, all with `@csrf` and throttle. Send always returns the same message whether or not the account exists. OTP stored hashed, 5-minute expiry, max 5 attempts. Verify returns a one-time token (about 10 min) that goes into `#lgFg3 [name=token]`; reset accepts the password only with that token (min 8, letter + number, `confirmed`). After reset: log out other sessions and email "your password was changed". The JS submit handlers are demo only: replace the `go('...')` calls with the AJAX success callbacks.
