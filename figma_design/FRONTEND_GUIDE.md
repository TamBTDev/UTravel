# UTravel Frontend — Hướng dẫn Setup & Coding Convention

## Tech Stack

| Layer | Thư viện |
|---|---|
| Framework | React + TypeScript (Vite) |
| Component UI | **Mantine v8** (`@mantine/core`, `@mantine/carousel`) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite` plugin) |
| Icons | `@tabler/icons-react` |
| State | Redux Toolkit + React-Redux |
| Routing | React Router v7 |
| HTTP | Axios |

---

## 1. Cấu hình Tailwind CSS v4

> Dự án dùng **Tailwind v4** — cú pháp **khác hoàn toàn** với v3. Không có `tailwind.config.js`.

### `src/index.css` — file duy nhất cần chỉnh

```css
/* 1. Import Google Fonts TRƯỚC khi import Tailwind */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

/* 2. Kích hoạt Tailwind v4 */
@import "tailwindcss";

/* 3. Khai báo design tokens bằng @theme */
@theme {
  /* Colors */
  --color-primary: #004da4;
  --color-primary-hover: #0064d2;
  --color-on-primary: #ffffff;
  --color-secondary: #006d3d;
  --color-secondary-container: #7cfbad;
  --color-on-secondary-container: #007441;
  --color-tertiary-dim: #ffb95f;
  --color-deal-orange: #FF5E1F;

  --color-background: #f7f9fb;
  --color-surface: #f7f9fb;
  --color-surface-low: #f2f4f6;
  --color-surface-mid: #eceef0;
  --color-surface-high: #e6e8ea;
  --color-surface-variant: #e0e3e5;

  --color-on-surface: #191c1e;
  --color-on-surface-variant: #424753;
  --color-outline: #727785;
  --color-outline-variant: #c2c6d5;
  --color-midnight: #0F172A;
  --color-ocean: #475569;
  --color-white: #ffffff;
  --color-hairline: #E2E8F0;

  /* Font */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

/* 4. Typography helper classes (dùng lại trong JSX) */
.text-display      { font-size: 2.5rem;   font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
.text-headline     { font-size: 1.5rem;   font-weight: 700; line-height: 1.33; letter-spacing: -0.01em; }
.text-title        { font-size: 1.125rem; font-weight: 600; line-height: 1.33; }
.text-body-bold    { font-size: 1rem;     font-weight: 600; line-height: 1.5; }
.text-body         { font-size: 1rem;     font-weight: 400; line-height: 1.5; }
.text-label-caps   { font-size: 0.75rem;  font-weight: 700; line-height: 1.33; letter-spacing: 0.05em; text-transform: uppercase; }

/* 5. Layout utility */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

### Cách Tailwind v4 map token → class

Khi bạn khai báo `--color-primary: #004da4` trong `@theme`, Tailwind **tự động** tạo ra:
- `text-primary` → `color: #004da4`
- `bg-primary` → `background-color: #004da4`
- `border-primary` → `border-color: #004da4`

Tương tự cho tất cả token `--color-*`, `--font-*`, `--radius-*`.

> ⚠️ **Không dùng raw hex** như `text-[#004da4]` — dùng tên token `text-primary` để IDE không báo warning.

---

## 2. Hybrid Pattern: Mantine + Tailwind

**Nguyên tắc:**
- **Mantine** → dùng cho các component phức tạp: `Card`, `Carousel`, `Button`, `Loader`, `Modal`, `Notification`...
- **Tailwind** → dùng cho layout, spacing, color, typography của toàn bộ trang

```tsx
// ✅ Đúng: Mantine lo structure, Tailwind lo styling
<Card
  className="border border-hairline hover:shadow-lg transition-shadow duration-300"
  radius="md"
  padding="md"
  withBorder
>
  <Card.Section>
    <img className="w-full h-48 object-cover" src={img} />
  </Card.Section>
  <h3 className="text-body-bold text-primary mt-3">{name}</h3>
  <Button className="bg-primary text-white hover:bg-primary-hover">
    Book Now
  </Button>
</Card>

// ❌ Sai: Dùng raw hex thay vì token
<div className="text-[#004da4] bg-[#f2f4f6]">...</div>
```

---

## 3. Layout Convention

```tsx
// Trang có hero full-width → withContainer={false}
<AppLayout withContainer={false}>
  {/* Hero chiếm 100vw */}
  <section className="relative w-full h-[600px]">
    ...
  </section>

  {/* Nội dung còn lại → dùng .page-container */}
  <main className="page-container py-24 space-y-24">
    <section>...</section>
    <section>...</section>
  </main>
</AppLayout>

// Trang bình thường → để mặc định (withContainer=true)
<AppLayout>
  ...
</AppLayout>
```

---

## 4. Prompt để AI code y hệt

Khi dùng AI assistant (Gemini, Claude, Copilot...) để code trang mới, **dán prompt này vào đầu**:

---

```
Tôi đang code trang React/TypeScript cho dự án UTravel.

## TECH STACK
- React + TypeScript + Vite
- Mantine v8 cho component (Card, Button, Carousel, Loader...)
- Tailwind CSS v4 (dùng @tailwindcss/vite plugin, KHÔNG có tailwind.config.js)
- @tabler/icons-react cho icon
- Redux Toolkit cho state management

## DESIGN TOKENS (đã khai báo trong index.css @theme)
Colors: primary, primary-hover, on-primary, secondary, secondary-container, on-secondary-container,
        tertiary-dim, deal-orange, background, surface, surface-low, surface-mid, surface-high,
        surface-variant, on-surface, on-surface-variant, outline, outline-variant, midnight, ocean, white, hairline

Typography classes (dùng trực tiếp trong JSX):
- .text-display  (40px/800)
- .text-headline (24px/700)
- .text-title    (18px/600)
- .text-body-bold (16px/600)
- .text-body     (16px/400)
- .text-label-caps (12px/700/uppercase)

Layout utility: .page-container (max-width:1200px, padding:0 2rem)

## RULES BẮT BUỘC
1. KHÔNG dùng raw hex như text-[#004da4] → dùng text-primary
2. KHÔNG dùng Tailwind config v3 syntax
3. Dùng Mantine cho component phức tạp, Tailwind cho layout/color/spacing
4. Trang có hero full-width → <AppLayout withContainer={false}>
5. Đặt nội dung trong <main className="page-container py-24 space-y-24">
6. Font Inter từ Google Fonts (đã import trong index.css)
7. Màu sắc theo DESIGN.md trong /figma_design/

## DESIGN FILE
Xem /figma_design/home.html và /figma_design/hotels.html để biết layout chính xác.
Màu sắc và typography theo /figma_design/DESIGN.md.
```

---

## 5. Spacing Reference

| Class | Pixel | Dùng khi |
|---|---|---|
| `gap-2` / `p-2` | 8px | Giữa các element nhỏ, padding chip/badge |
| `gap-4` / `p-4` | 16px | Padding card, gap grid |
| `gap-6` / `p-6` | 24px | Section header, gap lớn |
| `gap-8` / `p-8` | 32px | Padding section |
| `py-24` | 96px | Vertical padding giữa các section |
| `space-y-24` | 96px | Khoảng cách giữa các `<section>` |

---

## 6. Color Quick Reference

| Token | Hex | Dùng khi |
|---|---|---|
| `primary` | `#004da4` | CTA button, link, active state |
| `midnight` | `#0F172A` | Price, heading đen đậm |
| `ocean` | `#475569` | Text phụ, metadata |
| `on-surface-variant` | `#424753` | Placeholder, label |
| `outline` | `#727785` | Border light, icon |
| `hairline` | `#E2E8F0` | Border card, divider |
| `surface-low` | `#f2f4f6` | Background input, hover |
| `deal-orange` | `#FF5E1F` | Badge giảm giá |
| `tertiary-dim` | `#ffb95f` | Icon sao rating |
| `secondary-container` | `#7cfbad` | Badge "MUST VISIT" |
