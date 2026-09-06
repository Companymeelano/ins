// سیستم چندزبانه جامع — ۶ زبان
export type Lang = 'fa' | 'en' | 'ar' | 'tr' | 'fr' | 'de';

export const languages: { code: Lang; label: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'fa', label: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
];

type Entry = Record<Lang, string>;
type Dict = Record<string, Entry>;

// دیکشنری کامل رشته‌های UI
export const t: Dict = {
  // Bottom nav
  home: { fa: 'خانه', en: 'Home', ar: 'الرئيسية', tr: 'Ana Sayfa', fr: 'Accueil', de: 'Start' },
  analytics: { fa: 'آنالیز', en: 'Analytics', ar: 'التحليلات', tr: 'Analiz', fr: 'Analyse', de: 'Analyse' },
  story: { fa: 'استوری', en: 'Story', ar: 'قصة', tr: 'Hikaye', fr: 'Story', de: 'Story' },
  settings: { fa: 'تنظیمات', en: 'Settings', ar: 'الإعدادات', tr: 'Ayarlar', fr: 'Réglages', de: 'Einstellungen' },
  library: { fa: 'کتابخانه', en: 'Library', ar: 'المكتبة', tr: 'Kütüphane', fr: 'Bibliothèque', de: 'Bibliothek' },

  // Home / headers
  dashboard: { fa: 'داشبورد پیج', en: 'Page Dashboard', ar: 'لوحة الصفحة', tr: 'Sayfa Paneli', fr: 'Tableau de bord', de: 'Seiten-Dashboard' },
  welcome: { fa: 'خوش برگشتی', en: 'Welcome back', ar: 'مرحباً بعودتك', tr: 'Tekrar hoş geldin', fr: 'Bon retour', de: 'Willkommen zurück' },
  totalFollowers: { fa: 'مجموع فالوورها', en: 'Total Followers', ar: 'إجمالي المتابعين', tr: 'Toplam Takipçi', fr: 'Total abonnés', de: 'Follower gesamt' },
  newFollowersToday: { fa: 'فالوور جدید امروز', en: 'new followers today', ar: 'متابع جديد اليوم', tr: 'bugün yeni takipçi', fr: "nouveaux abonnés aujourd'hui", de: 'neue Follower heute' },
  commentsToday: { fa: 'کامنت امروز', en: 'Comments today', ar: 'تعليقات اليوم', tr: 'Bugünkü yorumlar', fr: "Commentaires aujourd'hui", de: 'Kommentare heute' },
  likesToday: { fa: 'لایک امروز', en: 'Likes today', ar: 'إعجابات اليوم', tr: 'Bugünkü beğeniler', fr: "J'aime aujourd'hui", de: 'Likes heute' },
  profileVisits: { fa: 'بازدید پروفایل', en: 'Profile visits', ar: 'زيارات الملف', tr: 'Profil ziyaretleri', fr: 'Visites du profil', de: 'Profilbesuche' },
  reachLabel: { fa: 'بازدید (Reach)', en: 'Reach', ar: 'الوصول', tr: 'Erişim', fr: 'Portée', de: 'Reichweite' },
  thisWeek: { fa: 'این هفته', en: 'this week', ar: 'هذا الأسبوع', tr: 'bu hafta', fr: 'cette semaine', de: 'diese Woche' },
  weeklyEngagement: { fa: 'نرخ تعامل هفتگی', en: 'Weekly Engagement', ar: 'التفاعل الأسبوعي', tr: 'Haftalık Etkileşim', fr: 'Engagement hebdo', de: 'Wöchentl. Interaktion' },
  bestPostTime: { fa: 'بهترین زمان انتشار (الگوریتم اکسپلور)', en: 'Best posting time (Explore algorithm)', ar: 'أفضل وقت للنشر', tr: 'En iyi paylaşım zamanı', fr: 'Meilleur moment de publication', de: 'Beste Posting-Zeit' },
  topPostsWeek: { fa: 'برترین پست‌ها این هفته', en: 'Top posts this week', ar: 'أفضل المنشورات هذا الأسبوع', tr: 'Bu haftanın en iyileri', fr: 'Meilleurs posts cette semaine', de: 'Top-Beiträge dieser Woche' },
  createNewAI: { fa: 'ساخت پست جدید با هوش مصنوعی', en: 'Create new post with AI', ar: 'إنشاء منشور جديد بالذكاء الاصطناعي', tr: 'AI ile yeni gönderi oluştur', fr: 'Créer un post avec IA', de: 'Neuen Beitrag mit KI erstellen' },
  roadmapUpgrade: { fa: 'نقشه راه ارتقا به نسخه بی‌حد و مرز', en: 'Roadmap to unlimited version', ar: 'خارطة الترقية للنسخة اللامحدودة', tr: 'Sınırsız sürüm yol haritası', fr: 'Feuille de route illimitée', de: 'Roadmap zur unbegrenzten Version' },
  view: { fa: 'مشاهده', en: 'View', ar: 'عرض', tr: 'Görüntüle', fr: 'Voir', de: 'Ansehen' },
  notConnectedAlert: { fa: 'پیج شما هنوز به Instagram Graph API متصل نشده. داده‌های زیر نمایشی (دمو) هستند.', en: 'Your page is not connected to Instagram Graph API yet. The data below is demo.', ar: 'صفحتك غير متصلة بعد بواجهة Instagram Graph API. البيانات أدناه تجريبية.', tr: 'Sayfanız henüz Instagram Graph API\'ye bağlı değil. Aşağıdaki veriler demodur.', fr: "Votre page n'est pas encore connectée à l'API Instagram Graph. Données de démo.", de: 'Ihre Seite ist noch nicht mit der Instagram Graph API verbunden. Demo-Daten.' },

  // Secure center quick access
  secureCenterTitle: { fa: 'مرکز اتصال امن (ضدبن)', en: 'Secure Connection Center (anti-ban)', ar: 'مركز الاتصال الآمن', tr: 'Güvenli Bağlantı Merkezi', fr: 'Centre de connexion sécurisé', de: 'Sicheres Verbindungszentrum' },
  secureCenterSub: { fa: 'پروکسی هوشمند • V2Ray/SOCKS • زمان‌بند ایمن', en: 'Smart proxy • V2Ray/SOCKS • Safe scheduler', ar: 'بروكسي ذكي • V2Ray/SOCKS • جدولة آمنة', tr: 'Akıllı proxy • V2Ray/SOCKS • Güvenli zamanlayıcı', fr: 'Proxy intelligent • V2Ray/SOCKS • Planificateur', de: 'Smart-Proxy • V2Ray/SOCKS • Sicherer Planer' },

  // Analytics
  performanceAnalysis: { fa: 'آنالیز عملکرد', en: 'Performance Analysis', ar: 'تحليل الأداء', tr: 'Performans Analizi', fr: 'Analyse de performance', de: 'Leistungsanalyse' },
  detailedReport: { fa: 'گزارش دقیق پیج', en: 'Detailed page report', ar: 'تقرير مفصل للصفحة', tr: 'Ayrıntılı sayfa raporu', fr: 'Rapport détaillé', de: 'Detaillierter Bericht' },
  exportReportPdf: { fa: 'خروجی گزارش تحلیلی (PDF)', en: 'Export analytics report (PDF)', ar: 'تصدير تقرير التحليلات (PDF)', tr: 'Analiz raporu dışa aktar (PDF)', fr: 'Exporter le rapport (PDF)', de: 'Bericht exportieren (PDF)' },
  healthScore: { fa: 'امتیاز سلامت پیج', en: 'Page health score', ar: 'درجة صحة الصفحة', tr: 'Sayfa sağlık puanı', fr: 'Score de santé', de: 'Seiten-Gesundheitswert' },
  healthScoreDesc: { fa: 'بر اساس نرخ تعامل، رشد فالوور و کیفیت محتوا', en: 'Based on engagement, follower growth and content quality', ar: 'بناءً على التفاعل ونمو المتابعين وجودة المحتوى', tr: 'Etkileşim, takipçi artışı ve içerik kalitesine göre', fr: "Basé sur l'engagement, la croissance et la qualité", de: 'Basierend auf Interaktion, Wachstum und Qualität' },
  engagementRate: { fa: 'نرخ تعامل', en: 'Engagement rate', ar: 'معدل التفاعل', tr: 'Etkileşim oranı', fr: "Taux d'engagement", de: 'Interaktionsrate' },
  allFollowers: { fa: 'کل فالوورها', en: 'All followers', ar: 'كل المتابعين', tr: 'Tüm takipçiler', fr: 'Tous les abonnés', de: 'Alle Follower' },
  savedPosts: { fa: 'ذخیره پست‌ها', en: 'Saved posts', ar: 'المنشورات المحفوظة', tr: 'Kaydedilen gönderiler', fr: 'Posts enregistrés', de: 'Gespeicherte Beiträge' },
  commentsWeek: { fa: 'کامنت این هفته', en: 'Comments this week', ar: 'تعليقات هذا الأسبوع', tr: 'Bu hafta yorumlar', fr: 'Commentaires cette semaine', de: 'Kommentare diese Woche' },
  followerGrowth7: { fa: 'روند رشد فالوور (۷ روز اخیر)', en: 'Follower growth (last 7 days)', ar: 'نمو المتابعين (آخر 7 أيام)', tr: 'Takipçi artışı (son 7 gün)', fr: 'Croissance (7 derniers jours)', de: 'Follower-Wachstum (7 Tage)' },
  compareLCS: { fa: 'مقایسه لایک، کامنت و ذخیره', en: 'Likes, comments & saves comparison', ar: 'مقارنة الإعجابات والتعليقات والحفظ', tr: 'Beğeni, yorum ve kayıt karşılaştırma', fr: "Comparaison j'aime, commentaires, sauvegardes", de: 'Vergleich Likes, Kommentare, Speicher' },
  likes: { fa: 'لایک', en: 'Likes', ar: 'إعجابات', tr: 'Beğeni', fr: "J'aime", de: 'Likes' },
  comments: { fa: 'کامنت', en: 'Comments', ar: 'تعليقات', tr: 'Yorumlar', fr: 'Commentaires', de: 'Kommentare' },
  saves: { fa: 'ذخیره', en: 'Saves', ar: 'حفظ', tr: 'Kayıt', fr: 'Sauvegardes', de: 'Speicher' },
  ageGroup: { fa: 'رده سنی مخاطبان', en: 'Audience age', ar: 'أعمار الجمهور', tr: 'Kitle yaşı', fr: "Âge de l'audience", de: 'Zielgruppenalter' },
  gender: { fa: 'جنسیت مخاطبان', en: 'Audience gender', ar: 'جنس الجمهور', tr: 'Kitle cinsiyeti', fr: "Genre de l'audience", de: 'Geschlecht' },
  topPostsAnalysis: { fa: 'تحلیل بهترین پست‌ها', en: 'Top posts analysis', ar: 'تحليل أفضل المنشورات', tr: 'En iyi gönderi analizi', fr: 'Analyse des meilleurs posts', de: 'Top-Beiträge-Analyse' },
  competitorAnalysis: { fa: 'تحلیل رقبا', en: 'Competitor analysis', ar: 'تحليل المنافسين', tr: 'Rakip analizi', fr: 'Analyse concurrents', de: 'Wettbewerbsanalyse' },
  contentCalendarWeek: { fa: 'تقویم محتوایی پیشنهادی هفته', en: 'Weekly content calendar', ar: 'تقويم المحتوى الأسبوعي', tr: 'Haftalık içerik takvimi', fr: 'Calendrier hebdo', de: 'Wöchentl. Content-Kalender' },

  // Studio
  smartStudio: { fa: 'استودیو هوشمند', en: 'Smart Studio', ar: 'الاستوديو الذكي', tr: 'Akıllı Stüdyo', fr: 'Studio intelligent', de: 'Smart Studio' },
  makePostAI: { fa: 'ساخت پست با AI', en: 'Create post with AI', ar: 'إنشاء منشور بالذكاء', tr: 'AI ile gönderi', fr: 'Post avec IA', de: 'Beitrag mit KI' },
  makeReelAI: { fa: 'ساخت ریلز با AI', en: 'Create reel with AI', ar: 'إنشاء ريلز بالذكاء', tr: 'AI ile reel', fr: 'Reel avec IA', de: 'Reel mit KI' },
  makeCarouselAI: { fa: 'ساخت کاروسل با AI', en: 'Create carousel with AI', ar: 'إنشاء كاروسيل', tr: 'AI ile karusel', fr: 'Carrousel avec IA', de: 'Karussell mit KI' },
  post: { fa: 'پست', en: 'Post', ar: 'منشور', tr: 'Gönderi', fr: 'Post', de: 'Beitrag' },
  carousel: { fa: 'کاروسل', en: 'Carousel', ar: 'كاروسيل', tr: 'Karusel', fr: 'Carrousel', de: 'Karussell' },
  reel: { fa: 'ریلز', en: 'Reel', ar: 'ريلز', tr: 'Reel', fr: 'Reel', de: 'Reel' },
  trendPrompts: { fa: 'پرامپت‌های ترند و آماده', en: 'Trending ready prompts', ar: 'أوامر رائجة جاهزة', tr: 'Trend hazır komutlar', fr: 'Prompts tendance', de: 'Trend-Prompts' },
  makeImageAI: { fa: 'ساخت عکس پست با هوش مصنوعی', en: 'Generate post image with AI', ar: 'إنشاء صورة بالذكاء', tr: 'AI ile görsel oluştur', fr: 'Générer une image', de: 'Bild mit KI erstellen' },
  smartCaptionSeo: { fa: 'تولید کپشن و سئوی هوشمند', en: 'Smart caption & SEO', ar: 'تعليق وسيو ذكي', tr: 'Akıllı açıklama & SEO', fr: 'Légende & SEO', de: 'Smart-Caption & SEO' },
  contentCategory: { fa: 'دسته‌بندی محتوا', en: 'Content category', ar: 'فئة المحتوى', tr: 'İçerik kategorisi', fr: 'Catégorie', de: 'Kategorie' },
  writingTone: { fa: 'لحن نوشتار', en: 'Writing tone', ar: 'نبرة الكتابة', tr: 'Yazım tonu', fr: 'Ton', de: 'Schreibstil' },
  generateCaptionGemini: { fa: 'تولید کپشن با Gemini', en: 'Generate caption with Gemini', ar: 'إنشاء تعليق بـ Gemini', tr: 'Gemini ile açıklama', fr: 'Générer avec Gemini', de: 'Caption mit Gemini' },
  generating: { fa: 'در حال تولید...', en: 'Generating...', ar: 'جار الإنشاء...', tr: 'Oluşturuluyor...', fr: 'Génération...', de: 'Wird erstellt...' },
  oneClickFull: { fa: 'ساخت کامل پست با یک کلیک (عکس + کپشن)', en: 'Full post in one click (image + caption)', ar: 'منشور كامل بنقرة واحدة', tr: 'Tek tıkla tam gönderi', fr: 'Post complet en un clic', de: 'Ganzer Beitrag mit 1 Klick' },
  saveDraft: { fa: 'ذخیره پیش‌نویس', en: 'Save draft', ar: 'حفظ المسودة', tr: 'Taslak kaydet', fr: 'Enregistrer brouillon', de: 'Entwurf speichern' },
  schedulePost: { fa: 'زمان‌بندی پست', en: 'Schedule post', ar: 'جدولة المنشور', tr: 'Gönderiyi zamanla', fr: 'Planifier', de: 'Beitrag planen' },
  copy: { fa: 'کپی', en: 'Copy', ar: 'نسخ', tr: 'Kopyala', fr: 'Copier', de: 'Kopieren' },

  // Story
  storyStudio: { fa: 'استودیو استوری', en: 'Story Studio', ar: 'استوديو القصص', tr: 'Hikaye Stüdyosu', fr: 'Studio Story', de: 'Story-Studio' },
  makeProStory: { fa: 'ساخت استوری حرفه‌ای', en: 'Create pro story', ar: 'إنشاء قصة احترافية', tr: 'Profesyonel hikaye', fr: 'Story pro', de: 'Pro-Story erstellen' },
  editSelected: { fa: 'ویرایش عنصر انتخابی', en: 'Edit selected element', ar: 'تحرير العنصر المحدد', tr: 'Seçili öğeyi düzenle', fr: "Modifier l'élément", de: 'Element bearbeiten' },
  delete: { fa: 'حذف', en: 'Delete', ar: 'حذف', tr: 'Sil', fr: 'Supprimer', de: 'Löschen' },
  size: { fa: 'اندازه', en: 'Size', ar: 'الحجم', tr: 'Boyut', fr: 'Taille', de: 'Größe' },
  storyBackground: { fa: 'پس‌زمینه استوری', en: 'Story background', ar: 'خلفية القصة', tr: 'Hikaye arka planı', fr: 'Arrière-plan', de: 'Story-Hintergrund' },
  addText: { fa: 'افزودن متن', en: 'Add text', ar: 'إضافة نص', tr: 'Metin ekle', fr: 'Ajouter texte', de: 'Text hinzufügen' },
  addSticker: { fa: 'افزودن استیکر', en: 'Add sticker', ar: 'إضافة ملصق', tr: 'Çıkartma ekle', fr: 'Ajouter sticker', de: 'Sticker hinzufügen' },
  smartStoryIdea: { fa: 'ایده‌ی هوشمند استوری', en: 'Smart story idea', ar: 'فكرة قصة ذكية', tr: 'Akıllı hikaye fikri', fr: 'Idée de story', de: 'Smarte Story-Idee' },
  downloadStory: { fa: 'دانلود استوری با کیفیت اکسپلور', en: 'Download story (Explore quality)', ar: 'تحميل القصة', tr: 'Hikayeyi indir', fr: 'Télécharger la story', de: 'Story herunterladen' },

  // Settings
  accountPrefs: { fa: 'مدیریت حساب و ترجیحات', en: 'Account & preferences', ar: 'الحساب والتفضيلات', tr: 'Hesap ve tercihler', fr: 'Compte & préférences', de: 'Konto & Einstellungen' },
  language: { fa: 'زبان برنامه', en: 'App Language', ar: 'لغة التطبيق', tr: 'Uygulama Dili', fr: 'Langue', de: 'Sprache' },
  langChanged: { fa: 'زبان تغییر کرد به', en: 'Language changed to', ar: 'تم تغيير اللغة إلى', tr: 'Dil değişti:', fr: 'Langue changée en', de: 'Sprache geändert zu' },
  notifPrefs: { fa: 'اعلان‌ها و ترجیحات', en: 'Notifications & preferences', ar: 'الإشعارات والتفضيلات', tr: 'Bildirimler', fr: 'Notifications', de: 'Benachrichtigungen' },
  notifNewFollower: { fa: 'اطلاع‌رسانی فالوور جدید', en: 'New follower alerts', ar: 'تنبيهات متابع جديد', tr: 'Yeni takipçi bildirimi', fr: 'Alerte nouvel abonné', de: 'Neuer-Follower-Alarm' },
  notifNewComment: { fa: 'اطلاع‌رسانی کامنت جدید', en: 'New comment alerts', ar: 'تنبيهات تعليق جديد', tr: 'Yeni yorum bildirimi', fr: 'Alerte commentaire', de: 'Neuer-Kommentar-Alarm' },
  notifNewLike: { fa: 'اطلاع‌رسانی لایک‌های جدید', en: 'New like alerts', ar: 'تنبيهات إعجاب جديد', tr: 'Yeni beğeni bildirimi', fr: 'Alerte j\'aime', de: 'Neuer-Like-Alarm' },
  autoScheduleBest: { fa: 'زمان‌بندی خودکار در بهترین ساعت', en: 'Auto-schedule at best time', ar: 'جدولة تلقائية بأفضل وقت', tr: 'En iyi saatte otomatik', fr: 'Planif. auto meilleur moment', de: 'Auto-Planung beste Zeit' },
  darkTheme: { fa: 'تم حرفه‌ای تیره', en: 'Professional dark theme', ar: 'الوضع الداكن الاحترافي', tr: 'Profesyonel koyu tema', fr: 'Thème sombre pro', de: 'Profi-Dunkelmodus' },
  logout: { fa: 'خروج از حساب', en: 'Log out', ar: 'تسجيل الخروج', tr: 'Çıkış yap', fr: 'Déconnexion', de: 'Abmelden' },
  admin: { fa: 'مدیر', en: 'Admin', ar: 'مدير', tr: 'Yönetici', fr: 'Admin', de: 'Admin' },

  // Library
  contentLibrary: { fa: 'کتابخانه محتوا', en: 'Content Library', ar: 'مكتبة المحتوى', tr: 'İçerik Kütüphanesi', fr: 'Bibliothèque', de: 'Inhaltsbibliothek' },
  savedProjectsSub: { fa: 'پروژه‌های ذخیره‌شده', en: 'Saved projects', ar: 'المشاريع المحفوظة', tr: 'Kaydedilen projeler', fr: 'Projets enregistrés', de: 'Gespeicherte Projekte' },
  calendar: { fa: 'تقویم', en: 'Calendar', ar: 'التقويم', tr: 'Takvim', fr: 'Calendrier', de: 'Kalender' },
  projectsTab: { fa: 'پروژه‌ها', en: 'Projects', ar: 'المشاريع', tr: 'Projeler', fr: 'Projets', de: 'Projekte' },
  approvalTab: { fa: 'تأیید', en: 'Approval', ar: 'الموافقة', tr: 'Onay', fr: 'Validation', de: 'Freigabe' },
  smartCalendar: { fa: 'تقویم هوشمند', en: 'Smart calendar', ar: 'تقويم ذكي', tr: 'Akıllı takvim', fr: 'Calendrier intelligent', de: 'Smart-Kalender' },
  approvalFlow: { fa: 'گردش کار تأیید', en: 'Approval workflow', ar: 'سير عمل الموافقة', tr: 'Onay iş akışı', fr: 'Flux de validation', de: 'Freigabe-Workflow' },
  all: { fa: 'همه', en: 'All', ar: 'الكل', tr: 'Tümü', fr: 'Tout', de: 'Alle' },
  noProjects: { fa: 'هنوز پروژه‌ای ذخیره نشده', en: 'No projects saved yet', ar: 'لا توجد مشاريع بعد', tr: 'Henüz proje yok', fr: 'Aucun projet', de: 'Noch keine Projekte' },

  // Common
  loading: { fa: 'در حال بارگذاری...', en: 'Loading...', ar: 'جار التحميل...', tr: 'Yükleniyor...', fr: 'Chargement...', de: 'Lädt...' },
  points: { fa: 'امتیاز شما', en: 'Your points', ar: 'نقاطك', tr: 'Puanınız', fr: 'Vos points', de: 'Deine Punkte' },
  streak: { fa: 'استریک', en: 'streak', ar: 'سلسلة', tr: 'seri', fr: 'série', de: 'Serie' },
  days: { fa: 'روز', en: 'days', ar: 'يوم', tr: 'gün', fr: 'jours', de: 'Tage' },
};

export function tr(key: string, lang: Lang): string {
  const entry = t[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? entry.fa;
}

// شماره‌گذاری بومی بر اساس زبان (فارسی/عربی → اعداد فارسی)
export function localeDigits(n: number | string, lang: Lang): string {
  const s = String(n);
  if (lang === 'fa' || lang === 'ar') return s.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  return s;
}
