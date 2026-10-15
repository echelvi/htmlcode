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
| Mental Health Books (`books.html`) | Books (cover, title, author(s), Find Book URL), "Found N books" count, sort, paging (10 per page) |

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
