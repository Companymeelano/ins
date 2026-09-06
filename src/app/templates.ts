// Template Packs عمودی — بسته‌های تخصصی برای صنایع مختلف (niche-first)
export interface TemplatePack {
  id: string;
  name: string;
  emoji: string;
  industry: string;
  audience: string;
  brandVoice: string;
  visualStyle: string;
  contentIdeas: string[];
  hookExamples: string[];
  hashtagCluster: string[];
}

export const templatePacks: TemplatePack[] = [
  {
    id: 'shop_clothing', name: 'فروش پوشاک', emoji: '👗', industry: 'پوشاک و مد',
    audience: 'زنان و مردان ۱۸-۴۰ علاقه‌مند به مد روز', brandVoice: 'دوستانه', visualStyle: 'luxury',
    contentIdeas: ['معرفی کالکشن جدید', 'ست کردن لباس‌ها', 'قبل و بعد استایل', 'تخفیف فصلی', 'نظر مشتریان راضی'],
    hookExamples: ['این ست رو از دست نده! 🔥', 'استایلت رو متحول کن ✨', 'فقط تا آخر هفته!'],
    hashtagCluster: ['پوشاک', 'مد', 'استایل', 'فشن', 'لباس_زنانه', 'خرید_آنلاین', 'کالکشن_جدید'],
  },
  {
    id: 'clinic_beauty', name: 'کلینیک زیبایی', emoji: '💆', industry: 'زیبایی و پوست',
    audience: 'افراد ۲۵-۵۰ به‌دنبال مراقبت پوست و زیبایی', brandVoice: 'حرفه‌ای', visualStyle: 'minimal',
    contentIdeas: ['معرفی خدمات', 'نتایج درمان (با رعایت قوانین)', 'نکات مراقبت پوست', 'معرفی تیم', 'پاسخ به سوالات رایج'],
    hookExamples: ['رازِ پوست شفاف چیه؟', '۳ اشتباه در مراقبت پوست', 'قبل از هر کاری اینو بدون'],
    hashtagCluster: ['کلینیک_زیبایی', 'مراقبت_پوست', 'زیبایی', 'پوست', 'اسکین_کر', 'جوانسازی'],
  },
  {
    id: 'restaurant', name: 'رستوران و کافه', emoji: '🍽️', industry: 'غذا و رستوران',
    audience: 'علاقه‌مندان به غذا و کافه‌گردی ۲۰-۴۵', brandVoice: 'احساسی', visualStyle: 'vibrant',
    contentIdeas: ['معرفی منوی جدید', 'پشت‌صحنه آشپزخانه', 'فضای رستوران', 'پیشنهاد ویژه روز', 'نظر مشتریان'],
    hookExamples: ['این طعم رو باید تجربه کنی 😋', 'گرسنه‌ای؟ اینو ببین!', 'محبوب‌ترین غذای این هفته'],
    hashtagCluster: ['رستوران', 'کافه', 'غذا', 'فودی', 'کافه_گردی', 'خوشمزه', 'منوی_جدید'],
  },
  {
    id: 'education', name: 'آموزش و دوره', emoji: '📚', industry: 'آموزش',
    audience: 'دانشجویان و علاقه‌مندان یادگیری ۱۶-۴۰', brandVoice: 'انگیزشی', visualStyle: 'cinematic',
    contentIdeas: ['نکته آموزشی کوتاه', 'معرفی دوره', 'داستان موفقیت دانشجو', 'اشتباهات رایج', 'چالش یادگیری'],
    hookExamples: ['این نکته رو کسی بهت نگفته!', '۹۰٪ اشتباه یاد می‌گیرن', 'در ۶۰ ثانیه یاد بگیر'],
    hashtagCluster: ['آموزش', 'یادگیری', 'دوره_آموزشی', 'مهارت', 'موفقیت', 'انگیزشی'],
  },
  {
    id: 'fitness', name: 'باشگاه و تناسب اندام', emoji: '💪', industry: 'ورزش و سلامت',
    audience: 'علاقه‌مندان به ورزش و تناسب اندام ۱۸-۴۵', brandVoice: 'انگیزشی', visualStyle: 'vibrant',
    contentIdeas: ['تمرین روز', 'رژیم و تغذیه', 'قبل و بعد تمرین', 'انگیزشی', 'معرفی مربی'],
    hookExamples: ['بدنت رو متحول کن 🔥', 'این تمرین رو امتحان کن', 'اشتباه رایج در باشگاه'],
    hashtagCluster: ['تناسب_اندام', 'باشگاه', 'ورزش', 'فیتنس', 'بدنسازی', 'سلامتی', 'انگیزه'],
  },
  {
    id: 'tech', name: 'فروشگاه دیجیتال', emoji: '📱', industry: 'فناوری و گجت',
    audience: 'علاقه‌مندان تکنولوژی و گجت ۱۸-۴۰', brandVoice: 'حرفه‌ای', visualStyle: 'minimal',
    contentIdeas: ['معرفی محصول جدید', 'مقایسه محصولات', 'آموزش استفاده', 'آنباکسینگ', 'پیشنهاد ویژه'],
    hookExamples: ['این گجت رو باید داشته باشی!', 'قبل از خرید حتماً ببین', 'بهترین انتخاب امسال'],
    hashtagCluster: ['تکنولوژی', 'گجت', 'دیجیتال', 'موبایل', 'لپتاپ', 'فروشگاه_آنلاین'],
  },
];
