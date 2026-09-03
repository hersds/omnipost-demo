# ✦ Omnipost — فروشگاه خودکار

> **یکبار بذار، همهجا پست بشه.**
> فروشگاه چند صفحه‌ای سبک + انتشار خودکار محصولات در کانال/ربات تلگرام (و سایر شبکه‌ها).

## 🎯 چه می‌کند؟

| قابلیت | توضیح |
|---|---|
| 🛍 فروشگاه چند صفحه‌ای | هوم + صفحه محصول + سبد/پرداخت — فقط ۳-۴ صفحه، سبک و سریع |
| 📣 **انتشار خودکار تلگرام** | هر محصول جدید → `sendPhoto` به کانال (عکس + کپشن سئو + هشتگ + دکمه خرید) |
| 🔄 **همگام‌سازی لحظه‌ای** | تغییر قیمت = ویرایش خودکار پست قبلی؛ ناموجود = برچسب «❌ ناموجود» روی پست |
| 💳 پرداخت زرین‌پال | Start/Status با درگاه زرین‌پال (واسط شاپرک/ملت — بدون نیاز به درگاه بانکی مستقیم) |
| 🔑 فعالسازی GitHub | کد یکبارمصرف → افزودن خریدار به ریپوی پرایوت (Read-only) → Deploy یککلیک |
| 🌐 دوزبانه / RTL | فارسی با Vazirmatn + حالت تاریک/روشن |
| ☁️ فریتیر | Deploy روی **Cloudflare Workers** (بدون کارت بانکی، باندوی نامحدود) یا **Netlify** |

## 🏗 معماری

```
public/               ← استورفرانت (HTML/CSS/JS خالص — بدون build)
  index.html          ← هوم (لیست محصولات)
  product.html        ← صفحه محصول + خرید
  admin.html          ← پنل مدیریت
  activate.html       ← صفحه فعالسازی
  css/ js/
worker/index.js       ← Worker: API + D1 + تلگرام + زرینپال + GitHub
wrangler.jsonc        ← تنظیمات (باکس D1، env vars)
```

**دیتابیس:** Cloudflare D1 (SQLite) — جدول‌ها: `products`, `telegram_posts`, `orders`, `activations`.

## 🚀 شروع سریع (Cloudflare Workers — رایگان)

```bash
# 1. نصب ابزار
npm i -g wrangler
wrangler login

# 2. ساخت دیتابیس
wrangler d1 create omnipost-db
# id دیتابیس را در wrangler.jsonc جایگزین REPLACE_WITH_YOUR_D1_ID کن

# 3. تنظیم env vars (مهم)
wrangler secret put ADMIN_TOKEN            # یک رشته تصادفی بلند
wrangler secret put TELEGRAM_BOT_TOKEN     # از @BotFather
wrangler secret put ZARINPAL_MERCHANT_ID
wrangler secret put ZARINPAL_API_PASSWORD
wrangler secret put GITHUB_TOKEN           # PAT با scope repo
# در wrangler.jsonc: TELEGRAM_CHANNELS (چند کانال با virgole)، SITE_URL، GITHUB_REPO

# 4. دیپلوی
wrangler deploy
```

### متغیرهای کلیدی
| متغیر | توضیح |
|---|---|
| `ADMIN_TOKEN` | کلید پنل مدیریت (سرور) |
| `TELEGRAM_BOT_TOKEN` | توکن ربات (از BotFather) — **رویلر/عضو کانال باشد** |
| `TELEGRAM_CHANNELS` | آیدی کانال‌ها، مثلاً `@myshop,-1001234567890` |
| `TELEGRAM_DEFAULT_HASHTAGS` | هشتگ‌های پیشفرض پست‌ها |
| `TELEGRAM_EDIT_ON_CHANGE` | `true` = ویرایش خودکار پست هنگام تغییر محصول |
| `TELEGRAM_MARK_OUT_OF_STOCK` | `true` = برچسب «ناموجود» روی پست‌های قدیمی |
| `ZARINPAL_MERCHANT_ID` / `ZARINPAL_API_PASSWORD` | درگاه زرین‌پال (znpl.ir) |
| `GITHUB_TOKEN` / `GITHUB_REPO` | برای سیستم فعالسازی |
| `SITE_URL` | آدرس نهایی سایت (بعد از deploy) |

## 🌐 دیپلوی روی Netlify ( جایگزین)
فایل‌های `public/` را مستقیم Import کنید؛ برای API می‌توانید از **Netlify Functions** نسخه Worker یا یک Worker جداگانه Cloudflare استفاده کنید (رویه‌ی پیشنهادی: سایت روی Netlify + API/تلگرام روی Worker رایگان Cloudflare — به‌دلیل فیلترینگ تلگرام از ایران، بخش تلگرام روی Cloudflare پایدارتر است).

## 📡 جریان تلگرام (قلب محصول)
1. `POST /api/admin/products` → محصول در D1 ذخیره + برای هر کانال `sendPhoto`/`sendMessage` → `message_id` در جدول `telegram_posts`
2. `PUT /api/admin/products/:id` → `editMessageMedia`/`editMessageText` روی پست‌های قبلی
3. `DELETE` یا `stock=0` → `editMessageText` با «❌ ناموجود»

## 🔒 لایسنس
مشترک — فقط برای خریداران. (لیسانس تک‌کاربره: استفاده شخصی/تجاریِ خود خریدار؛ بازفروش و انتشار عمومی ممنوع.)

## ⚖️ نکته‌ی حقوقی میزبانی
Cloudflare Free و Netlify Free برای استفاده تجاری مجازند و بدون کارت بانکی ثبتنام می‌شوند. Vercel Hobby **فقط غیرتجاری** است — برای فروشگاه استفاده نکنید. مسئولیت شرایط استفاده بر عهده‌ی کاربر است.
