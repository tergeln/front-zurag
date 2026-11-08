import type { Locale } from "./config";

// Terms of use and privacy policy. This is a plain-language starting draft that
// describes how the site actually works; have a lawyer review it before launch.
// "{days}" is replaced with the face-data retention period from platform settings.

export type LegalDoc = { title: string; updated: string; intro: string; sections: { heading: string; body: string[] }[] };

const terms: Record<Locale, LegalDoc> = {
  mn: {
    title: "Үйлчилгээний нөхцөл",
    updated: "Сүүлд шинэчилсэн: 2026 оны 11-р сарын 8",
    intro: "Zurag бол арга хэмжээний гэрэл зургийг зурагчдаас худалдан авах платформ юм. Сайтыг ашигласнаар та доорх нөхцөлийг зөвшөөрч байна.",
    sections: [
      {
        heading: "1. Бүртгэл",
        body: [
          "Бүртгүүлэхдээ үнэн зөв мэдээлэл өгч, нууц үгээ бусдад дамжуулахгүй байх үүрэгтэй.",
          "Бусдын нэрээр бүртгэл үүсгэх, сайтыг зүй бусаар ашиглах тохиолдолд бүртгэлийг түдгэлзүүлж болно.",
        ],
      },
      {
        heading: "2. Зураг худалдан авах",
        body: [
          "Худалдан авахаас өмнө зургууд усан тэмдэгтэй, багасгасан хэмжээгээр харагдана.",
          "Төлбөрийг QPay-ээр төлнө. Төлбөр баталгаажсаны дараа эх зургийг татаж авах эрх нээгдэнэ.",
          "Худалдаж авсан зургаа хувийн хэрэгцээндээ ашиглана. Арилжааны зорилгоор ашиглах бол зурагчнаас зөвшөөрөл авна.",
          "Буцаан олголт хийгдсэн тохиолдолд тухайн зургийг татах эрх хаагдана.",
        ],
      },
      {
        heading: "3. Гэрэл зурагчид",
        body: [
          "Зурагчид админы баталгаажуулалтын дараа зураг байршуулна.",
          "Зурагчин байршуулсан зургийнхаа зохиогчийн эрхийг эзэмшдэг, зураг авалтын талаар оролцогчдод мэдэгдсэн байх ёстой.",
          "Борлуулалт бүрээс платформын шимтгэл суутгаж, үлдсэнийг зурагчинд шилжүүлнэ.",
        ],
      },
      {
        heading: "4. Царай танилт",
        body: [
          "Селфигээр хайх нь сайн дурын бөгөөд таны тусгай зөвшөөрлөөр л ажиллана. Дэлгэрэнгүйг Нууцлалын бодлогоос үзнэ үү.",
        ],
      },
      {
        heading: "5. Хариуцлага",
        body: [
          "Бид сайтыг тасралтгүй ажиллуулахыг хичээдэг ч түр тасалдал гарч болно.",
          "Зургийн агуулгыг тухайн зурагчин хариуцна. Зөрчилтэй зургийг бидэнд мэдэгдвэл хянаж устгана.",
        ],
      },
      {
        heading: "6. Өөрчлөлт",
        body: ["Нөхцөлийг шинэчилж болох бөгөөд шинэчилсэн огноог энэ хуудсанд харуулна."],
      },
    ],
  },
  en: {
    title: "Terms of use",
    updated: "Last updated: 8 November 2026",
    intro: "Zurag is a platform for buying event photos from photographers. By using the site you agree to these terms.",
    sections: [
      {
        heading: "1. Accounts",
        body: [
          "Give accurate details when you sign up and keep your password to yourself.",
          "Accounts that impersonate others or misuse the site may be suspended.",
        ],
      },
      {
        heading: "2. Buying photos",
        body: [
          "Before purchase, photos are shown smaller and with a watermark.",
          "Payment is made with QPay. Once payment is confirmed you can download the original files.",
          "Purchased photos are for personal use. For commercial use, ask the photographer for permission.",
          "If an order is refunded, downloads for those photos are switched off.",
        ],
      },
      {
        heading: "3. Photographers",
        body: [
          "Photographers can upload only after an admin approves them.",
          "Photographers must own the rights to their photos and must have told attendees that photos are being taken.",
          "The platform keeps a commission from each sale and pays the rest to the photographer.",
        ],
      },
      {
        heading: "4. Face recognition",
        body: ["Selfie search is optional and works only with your explicit consent. See the privacy policy for details."],
      },
      {
        heading: "5. Liability",
        body: [
          "We try to keep the site running at all times, but short interruptions can happen.",
          "Photographers are responsible for the content of their photos. Report a photo that breaks the rules and we will review and remove it.",
        ],
      },
      {
        heading: "6. Changes",
        body: ["We may update these terms. The date of the latest update is shown on this page."],
      },
    ],
  },
};

const privacy: Record<Locale, LegalDoc> = {
  mn: {
    title: "Нууцлалын бодлого",
    updated: "Сүүлд шинэчилсэн: 2026 оны 11-р сарын 8",
    intro: "Бид таны мэдээллийг зөвхөн үйлчилгээ үзүүлэхэд шаардлагатай хэмжээгээр цуглуулж, хамгаалж хадгална.",
    sections: [
      {
        heading: "Бидний цуглуулдаг мэдээлэл",
        body: [
          "Бүртгэл: имэйл, нэр, утас (заавал биш), хэлний сонголт.",
          "Худалдан авалт: захиалга, төлбөрийн төлөв, татан авалтын түүх. Картын мэдээллийг QPay болон банк боловсруулдаг, бид хадгалдаггүй.",
          "Гэрэл зурагчид: нэр, холбоо барих мэдээлэл, танилцуулга, портфолио, борлуулалт ба төлбөрийн бүртгэл.",
        ],
      },
      {
        heading: "Царай танилт",
        body: [
          "Арга хэмжээний зургуудаас царайн тоон дүрслэл (embedding) гаргаж, зөвхөн тухайн арга хэмжээн дотор хайлт хийхэд ашиглана.",
          "Таны селфиг зөвхөн санах ойд боловсруулж, хайлт дуусмагц устгана. Селфи хэзээ ч хадгалагдахгүй.",
          "Селфи хайлт бүрийн өмнө таны зөвшөөрлийг асууна. Хайлтад бүртгэл шаардлагагүй.",
          "Зургууд нийтэд харагдахгүй. Таны селфитэй тохирсон зургууд зөвхөн таны хөтөч дээр 24 цагийн турш харагдана. Хайлтын бүртгэлд IP хаягийг шууд биш, нууцлагдсан (hash) хэлбэрээр хадгалдаг.",
          "Царайн өгөгдлийг {days} хоногийн дараа автоматаар устгана. Зураг устгагдвал холбогдох царайн өгөгдөл тэр даруй устана.",
        ],
      },
      {
        heading: "Хадгалалт ба хамгаалалт",
        body: [
          "Эх зургууд нууц хадгалалтад байх ба зөвхөн худалдан авагчид 5 минутын хүчинтэй холбоосоор татагдана.",
          "Мэдээлэлд хандах эрхийг хэрэглэгч бүрийн үүргээр хязгаарласан бөгөөд админы үйлдлийг бүртгэдэг.",
        ],
      },
      {
        heading: "Таны эрх",
        body: [
          "Хувийн мэдээллээ «Миний бүртгэл» хэсгээс засаж болно.",
          "Бүртгэлээ устгах боломжтой. Устгахад хувийн мэдээлэл арилж, нэвтрэх эрх хаагдана. Хуульд заасны дагуу захиалгын бүртгэл нэргүйгээр хадгалагдана.",
        ],
      },
      {
        heading: "Гуравдагч талын үйлчилгээ",
        body: [
          "Supabase (өгөгдлийн сан, нэвтрэлт), Cloudflare (вэб хостинг, зураг хадгалалт), QPay (төлбөр). Тэдгээр нь зөвхөн үйлчилгээ үзүүлэхэд шаардлагатай мэдээллийг боловсруулна.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    updated: "Last updated: 8 November 2026",
    intro: "We collect only the information needed to run the service, and we protect it.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account: email, name, phone (optional), language preference.",
          "Purchases: orders, payment status and download history. Card details are handled by QPay and banks; we never store them.",
          "Photographers: name, contact details, bio, portfolio, sales and payout records.",
        ],
      },
      {
        heading: "Face recognition",
        body: [
          "We turn faces in event photos into numeric descriptions (embeddings) and use them only to search within that one event.",
          "Your selfie is processed in memory and discarded as soon as the search is done. It is never stored.",
          "We ask for your consent before every selfie search. Searching needs no account.",
          "Photos are not public. The photos that match your selfie are visible only in your browser, for 24 hours. The search log keeps your network address only in hashed form, never the address itself.",
          "Face data is deleted automatically after {days} days. When a photo is deleted, its face data is deleted at once.",
        ],
      },
      {
        heading: "Storage and security",
        body: [
          "Original photos are kept in private storage and only buyers can download them, through links valid for 5 minutes.",
          "Access to data is limited by each user's role, and admin actions are logged.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can edit your personal details under My account.",
          "You can delete your account. Your personal details are removed and you can no longer sign in. Order records are kept anonymously where the law requires it.",
        ],
      },
      {
        heading: "Third-party services",
        body: [
          "Supabase (database, sign-in), Cloudflare (hosting, photo storage), QPay (payments). They process only what is needed to provide the service.",
        ],
      },
    ],
  },
};

export const legalDocs = { terms, privacy };
