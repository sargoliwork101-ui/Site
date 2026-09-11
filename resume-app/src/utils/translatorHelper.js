// translatorHelper.js - Specialized Technical Dictionary and Translator for Electronics, PCB & Embedded Systems

export const technicalDictFaToEn = {
  // Roles & Titles
  'مهندس الکترونیک': 'Electronics Engineer',
  'مهندس ارشد الکترونیک': 'Senior Electronics Engineer',
  'طراح سیستم‌های امبدد': 'Embedded Systems Designer',
  'طراح بردهای سخت‌افزاری': 'Hardware Board Designer',
  'توسعه‌دهنده فریم‌ور': 'Firmware Developer',
  'مهندس سیستم‌های نهفته': 'Embedded Systems Engineer',
  'مهندس تحقیق و توسعه': 'R&D Engineer',
  'سرپرست تیم سخت‌افزار': 'Hardware Team Lead',

  // Categories & Specialties
  'اینترنت اشیا و صنعتی': 'IoT & Industrial Electronics',
  'بردهای پرسرعت و FPGA': 'High-Speed PCBs & FPGA',
  'مدارات تغذیه و BMS': 'Power Supplies & BMS',
  'رباتیک و هدایت هوایی': 'Robotics & Avionics',
  'رباتیک و سیستم‌های هدایت': 'Robotics & Guidance Systems',
  'هوش مصنوعی و پردازش لبه': 'Edge AI & Neural Vision',
  'صوتی و آنالوگ دقیق': 'Precision Analog & High-End Audio',
  'تغذیه و توان بالا': 'High-Power & Power Electronics',
  'طراحی سخت‌افزار': 'Hardware Design',
  'فریمور و امبدد': 'Firmware & Embedded',
  'اینترنت اشیا': 'Internet of Things',
  'فناوری و پردازش': 'Technology & Computing',

  // Common Board Statuses
  'تولید انبوه و عملیاتی در خط تولید': 'Mass Production & Active in Production Line',
  'تولید انبوه صنعتی': 'Mass Industrial Production',
  'تحویل داده شده به آزمایشگاه': 'Delivered to Specialized Research Lab',
  'به کارگیری در خودروهای برقی': 'Deployed in Light Electric Vehicles',
  'تست پروازی موفق و عرضه به صورت اوپن‌سورس': 'Flight Tested & Open-Source Release',
  'دارای تاییدیه آزمایشگاه مرجع': 'Certified by Reference Testing Lab',
  'طراحی ویژه سیستم‌های استودیویی': 'Custom Designed for Studio Audio Systems',
  'نمونه اولیه کاربردی': 'Functional Prototype Deployed',

  // Common Hardware Terms
  'سیستم مدیریت باتری': 'Battery Management System (BMS)',
  'گیت‌وی صنعتی': 'Industrial Gateway',
  'فلایت کنترلر': 'Flight Controller',
  'کنتور هوشمند': 'Smart Energy Meter',
  'تقویت‌کننده صوتی': 'Audio Amplifier',
  'شارژر سریع': 'Fast Charger',
  'چند لایه': 'Multi-Layer',
  'کنترل امپدانس': 'Impedance Control',
  'ایزولاسیون': 'Galvanic Isolation',
  'بلادرنگ': 'Real-Time',
  'فرکانس بالا': 'High-Frequency',
  'سیستم‌های نهفته': 'Embedded Systems',
  'تهران، ایران': 'Tehran, Iran',
  'تهران': 'Tehran, Iran',
  'تمام وقت': 'Full-time',
  'پاره وقت': 'Part-time',
  'پروژه‌ای': 'Contract / Freelance',
  'آماده پذیرش پروژه‌های طراحی برد و مشاوره تخصصی': 'Available for High-Speed PCB Design & Embedded Consulting',
  'آماده همکاری': 'Available for Contracts & Projects',
};

export const autoTranslateFaToEn = (faText) => {
  if (!faText || typeof faText !== 'string') return '';

  const trimmed = faText.trim();
  if (technicalDictFaToEn[trimmed]) {
    return technicalDictFaToEn[trimmed];
  }

  // Word-by-word replacement
  let translated = trimmed;
  for (const [fa, en] of Object.entries(technicalDictFaToEn)) {
    if (translated.includes(fa)) {
      translated = translated.split(fa).join(en);
    }
  }

  // If untranslated Persian letters remain, generate a clean technical slug
  const hasPersian = /[\u0600-\u06FF]/.test(translated);
  if (hasPersian) {
    return translated
      .replace(/[\u0600-\u06FF]+/g, (match) => {
        return technicalDictFaToEn[match] || 'Hardware Spec';
      })
      .trim();
  }

  return translated;
};
