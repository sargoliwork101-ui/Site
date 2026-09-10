// defaultData.js - Comprehensive default data for Hardware / Embedded Engineer Portfolio

export const initialData = {
  // Home page content (Hero + intro) — like the site's «ویرایش محتوا»
  home: {
    headlineFa: 'سلام! من «آرش طاهری» هستم',
    headlineEn: "Hi! I'm Arash Taheri",
    subtitleFa: 'مهندس ارشد الکترونیک — طراحی بردهای پرسرعت PCB، سیستم‌های تعبیه‌شده و الکترونیک قدرت',
    subtitleEn: 'Senior Electronics Engineer — High-Speed PCB Design, Embedded Systems & Power Electronics',
    introFa: 'بیش از ۸ سال است که در حوزه طراحی مدارات الکترونیکی چندلایه، سیستم‌های اینترنت اشیا صنعتی و فریمورهای بلادرنگ فعالیت می‌کنم. در این پورتفولیو می‌توانید بردهای ساخته‌شده، مقالات علمی و سوابق کاری من را مشاهده کنید.',
    introEn: 'For over 8 years I have been working on multi-layer electronic circuit design, industrial IoT systems and real-time firmware. In this portfolio you can browse my built boards, scientific publications and work history.'
  },

  personalInfo: {
    fullNameFa: 'مهندس آرش طاهری',
    fullNameEn: 'Arash Taheri',
    titleFa: 'مهندس ارشد الکترونیک و طراح سیستم‌های امبدد',
    titleEn: 'Senior Hardware & Embedded Systems Engineer',
    taglineFa: 'متخصص طراحی بردهای پرسرعت (High-Speed PCB)، معماری سیستم‌های اینترنت اشیا (IoT) و فریمورهای بلادرنگ (RTOS)',
    taglineEn: 'Specializing in High-Speed PCB Design, IoT Architecture & Real-Time Embedded Firmware',
    bioFa: 'بیش از ۸ سال سابقه حرفه‌ای در طراحی و مهندسی معکوس بردهای الکترونیکی پیچیده (تا ۱۲ لایه)، سیستم‌های کنترل صنعتی، فریم‌ور میکروکنترلرهای ARM Cortex-M و FPGA. طراح بیش از ۳۰ برد صنعتی موفق و نویسنده مقالات تخصصی در حوزه امبدد و الکترونیک پرسرعت.',
    bioEn: 'Over 8 years of professional experience in designing multi-layer high-speed PCBs, industrial IoT gateways, ARM Cortex-M and FPGA firmware. Creator of 30+ deployed industrial boards and author of multiple embedded hardware research publications.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    locationFa: 'تهران، ایران (آماده همکاری ریموت و حضوری)',
    locationEn: 'Tehran, Iran (Available for Remote & Onsite)',
    email: 'arash.taheri.hardware@gmail.com',
    phone: '+98 912 345 6789',
    telegram: 'https://t.me/hardware_dev',
    github: 'https://github.com/arashtaheri-embedded',
    linkedin: 'https://linkedin.com/in/arash-taheri-hardware',
    orcid: 'https://orcid.org/0000-0002-1825-0097',
    scholar: 'https://scholar.google.com/citations?user=arash_taheri',
    website: 'https://arashtaheri.dev',
    status: 'available',
    statusTextFa: 'آماده پذیرش پروژه‌های طراحی برد و مشاوره تخصصی',
    statusTextEn: 'Available for PCB Design & Embedded Consulting Projects',
    introAudioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
    introAudioTitleFa: 'پیام صوتی معرفی مهندس آرش طاهری',
    introAudioTitleEn: 'Arash Taheri - Voice Introduction',
    introAudioDuration: '0:45',
    yearsExperience: 8,
    boardsCount: 32,
    articlesCount: 14,
    patentsCount: 2,
    stats: [
      { labelFa: 'سال تجربه حرفه‌ای', labelEn: 'Years Experience', valueFa: '۸+', valueEn: '8+' },
      { labelFa: 'برد صنعتی تولید شده', labelEn: 'Commercial Boards', valueFa: '۳۲+', valueEn: '32+' },
      { labelFa: 'مقالات و تحقیقات', labelEn: 'Tech Publications', valueFa: '۱۴', valueEn: '14' },
      { labelFa: 'مشتریان و شرکا', labelEn: 'Satisfied Clients', valueFa: '۲۵+', valueEn: '25+' },
    ]
  },

  taxonomies: {
    boardCategories: [
      { id: 'iot-industrial', labelFa: 'اینترنت اشیا و کنترل صنعتی', labelEn: 'Industrial IoT & Automation' },
      { id: 'highspeed-fpga', labelFa: 'بردهای پرسرعت و FPGA', labelEn: 'High-Speed & FPGA Systems' },
      { id: 'power-bms', labelFa: 'مدارات تغذیه، سوئیچینگ و BMS', labelEn: 'Power Electronics & Smart BMS' },
      { id: 'robotics-embedded', labelFa: 'رباتیک و سیستم‌های هدایت', labelEn: 'Robotics & Guidance' },
      { id: 'medical-telemetry', labelFa: 'تجهیزات پزشکی و بیوالکترونیک', labelEn: 'Medical & Bioelectronics' },
      { id: 'rf-telecom', labelFa: 'مخابرات، RF و امواج مایکروویو', labelEn: 'RF & Wireless Systems' },
      { id: 'automotive-ecu', labelFa: 'الکترونیک خودرو و کنترلرهای ECU', labelEn: 'Automotive & ECU Systems' },
    ],
    articleCategories: [
      { id: 'طراحی سخت‌افزار', labelFa: 'طراحی سخت‌افزار', labelEn: 'Hardware Design' },
      { id: 'فریمور و امبدد', labelFa: 'فریمور و امبدد', labelEn: 'Firmware & Embedded' },
      { id: 'تست و استانداردهای EMC', labelFa: 'تست و استانداردهای EMC', labelEn: 'EMC Testing & Compliance' },
      { id: 'اینترنت اشیا صنعتی', labelFa: 'اینترنت اشیا صنعتی', labelEn: 'Industrial IoT' },
    ],
    boardStatuses: [
      { id: 'تولید انبوه و عملیاتی در خط تولید', labelFa: 'تولید انبوه و عملیاتی در خط تولید', labelEn: 'Mass Production & Active in Industry' },
      { id: 'تحویل داده شده به کارفرما', labelFa: 'تحویل داده شده به کارفرما', labelEn: 'Delivered to Client' },
      { id: 'به کارگیری در خطوط صنعتی', labelFa: 'به کارگیری در خطوط صنعتی', labelEn: 'Operational in Field' },
      { id: 'تست موفق و آماده تولید انبوه', labelFa: 'تست موفق و آماده تولید انبوه', labelEn: 'Tested & Ready for Mass Production' },
      { id: 'نمونه اولیه آزمایشگاهی (Prototyping)', labelFa: 'نمونه اولیه آزمایشگاهی (Prototyping)', labelEn: 'Lab Prototype Verified' },
      { id: 'عرضه به صورت اوپن‌سورس', labelFa: 'عرضه به صورت اوپن‌سورس', labelEn: 'Open Source Hardware' },
    ],
    edaTools: [
      { id: 'Altium Designer 24', labelFa: 'Altium Designer 24', labelEn: 'Altium Designer 24' },
      { id: 'Altium Designer 23', labelFa: 'Altium Designer 23', labelEn: 'Altium Designer 23' },
      { id: 'KiCad EDA 8.0', labelFa: 'KiCad EDA 8.0', labelEn: 'KiCad EDA 8.0' },
      { id: 'Cadence Allegro', labelFa: 'Cadence Allegro', labelEn: 'Cadence Allegro' },
      { id: 'Mentor Graphics PADS', labelFa: 'Mentor Graphics PADS', labelEn: 'Mentor Graphics PADS' },
      { id: 'Autodesk EAGLE', labelFa: 'Autodesk EAGLE', labelEn: 'Autodesk EAGLE' },
    ]
  },

  boards: [
    {
      id: 'board-1',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'گیت‌وی صنعتی چندپروتکله IoT (RT-Gateway Pro)',
      titleEn: 'Industrial Multi-Protocol IoT Gateway (RT-Gateway Pro)',
      category: 'iot-industrial',
      categoryFa: 'اینترنت اشیا و کنترل صنعتی',
      categoryEn: 'Industrial IoT & Automation',
      createdDate: '2024-05-15',
      manufactureYear: '2024',
      layers: 6,
      mcu: 'STM32H743ZI (480MHz ARM Cortex-M7) + ESP32-WROVER-E',
      interfaces: ['Dual CAN-FD', 'Isolated RS-485', 'LoRaWAN 868MHz', '10/100 Ethernet PHY', 'USB Type-C OTG'],
      dimensions: '105 x 75 mm',
      powerSupply: 'ورودی ۹ الی ۳۶ ولت DC ایزوله با فیوز خودترمیمی',
      powerSupplyEn: '9-36V DC Isolated Wide-Range DC/DC with PPTC Protection',
      edaTool: 'Altium Designer 24',
      status: 'تولید انبوه و عملیاتی در خط تولید',
      statusEn: 'Mass Production & Active in Industry',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد گیت‌وی صنعتی مقاوم با ایزولاسیون ۲.۵ کیلوولت، مناسب جمع‌آوری داده‌های خطوط تولید، اسکادا و انتقال امن به سرورهای ابری با پروتکل MQTT over TLS.',
      shortDescEn: 'Robust 6-layer industrial gateway with 2.5kV galvanic isolation, CAN-FD, RS485 and LoRaWAN connectivity for SCADA & Cloud IoT integration.',
      features: [
        'طراحی ۶ لایه با کنترل دقیق امپدانس دیفرانسیلی ۱۰۰ اهم برای اترنت و ۹۰ اهم برای USB',
        'ایزولاسیون کامل بخش تغذیه و ورودی‌های دیجیتال تا ۲.۵ کیلوولت با اپتوکوپلرهای سرعت بالا',
        'پشتیبانی همزمان از اترنت صنعتی، LoRaWAN، وای‌فای و بلوتوث نسخه ۵',
        'حافظه فلش خارجی ۳۲ مگابایت QSPI و حافظه SDRAM ۳۲ مگابایت برای بافر داده‌ها در زمان قطعی شبکه',
        'استاندارد تست‌های EMC/EMI صنعتی و حفاظت در برابر تخلیه الکترواستاتیک (IEC 61000-4-2/4/5)'
      ],
      featuresEn: [
        '6-layer stackup with 100Ω Ethernet and 90Ω USB differential impedance matching',
        'Complete 2.5kV galvanic isolation on power supply and industrial digital inputs with high-speed optocouplers',
        'Simultaneous support for Industrial Ethernet, LoRaWAN, Wi-Fi and BLE 5.0',
        '32MB external QSPI Flash and 32MB SDRAM for high-speed local data buffering during network outages',
        'Fully certified for industrial EMC/ESD compliance (IEC 61000-4-2/4/5)'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      datasheetFileName: 'RT_Gateway_Pro_Datasheet.pdf',
      datasheetFileSize: '1.4 MB',
      stepFileUrl: 'https://raw.githubusercontent.com/arashtaheri-embedded/rt-gateway-pro/main/3d/RT_Gateway_Pro.step',
      stepFileName: 'RT_Gateway_Pro_3D.step',
      stepFileSize: '4.8 MB',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/rt-gateway-pro',
      specs: {
        'پردازنده اصلی': 'STM32H743ZI (ARM Cortex-M7, 480MHz, 2MB Flash, 1MB RAM)',
        'پردازنده کمکی شبکه': 'ESP32-WROVER-E (Dual Core 240MHz + 8MB PSRAM)',
        'تعداد لایه‌ها': '۶ لایه با پشته‌بندی SIG-GND-SIG-PWR-GND-SIG',
        'تغذیه': 'ورودی ۹ الی ۳۶ ولت ایزوله با فیوز خودترمیمی PPTC و محافظت ولتاژ معکوس',
        'محدوده دمای کاری': '-۴۰ تا +۸۵ درجه سانتی‌گراد (Industrial Grade)',
        'ابعاد فیزیکی': '۱۰۵ در ۷۵ میلی‌متر - استاندارد ریل DIN Rail'
      },
      specsEn: {
        'Main Processor': 'STM32H743ZI (ARM Cortex-M7, 480MHz, 2MB Flash, 1MB RAM)',
        'Network Co-Processor': 'ESP32-WROVER-E (Dual Core 240MHz + 8MB PSRAM)',
        'Layer Stackup': '6 Layers (SIG-GND-SIG-PWR-GND-SIG)',
        'Power Input': '9-36V DC Isolated with PPTC & Reverse Polarity Protection',
        'Operating Temp': '-40°C to +85°C (Industrial Grade)',
        'Physical Size': '105 x 75 mm (Standard DIN Rail enclosure)'
      }
    },
    {
      id: 'board-2',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'میکرو پی‌ال‌سی صنعتی هوشمند (Micro-PLC Pro 8I/8O)',
      titleEn: 'Smart Industrial Micro-PLC (Micro-PLC Pro 8I/8O)',
      category: 'iot-industrial',
      categoryFa: 'اینترنت اشیا و کنترل صنعتی',
      categoryEn: 'Industrial IoT & Automation',
      createdDate: '2023-11-20',
      manufactureYear: '2023',
      layers: 4,
      mcu: 'STM32F407VET6 (168MHz Cortex-M4) + RTC اختصاصی باتری‌دار',
      interfaces: ['8x Opto-isolated 24V Inputs', '8x Relay / Solid-State Outputs', 'RS-485 Modbus RTU', 'Ethernet 10/100', 'CAN 2.0B'],
      dimensions: '115 x 90 mm',
      powerSupply: '24V DC صنعتی ایزوله با فیلتر EMI دو مرحله‌ای',
      powerSupplyEn: '24V DC Industrial Isolated with Dual-Stage EMI Filter',
      edaTool: 'Altium Designer 24',
      status: 'به کارگیری در خطوط صنعتی',
      statusEn: 'Operational in Field',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'کنترلر منطقی برنامه‌پذیر با استاندارد اتوماسیون صنعتی، دارای ورودی/خروجی‌های ایزوله ۲۴ ولت، ارتباط مدباس و رابط برنامه‌ریزی نردبانی (Ladder Logic).',
      shortDescEn: 'Industrial grade micro PLC featuring 8 isolated 24V inputs, 8 relay/transistor outputs, Modbus RTU/TCP, and ladder logic runtime engine.',
      features: [
        'طراحی ۴ لایه با ضخامت مس ۲ اونس برای هدایت جریان رله‌ها و بارهای سلفی صنعتی',
        'ورودی‌های دیجیتال مجهز به فیلتر اشمیت تریگر سخت‌افزاری و ایزولاسیون نوری ۳ کیلوولت',
        'خروجی‌های ترانزیستوری با حفاظت اتصال کوتاه و بازگشت ولتاژ سلفی (Flyback Snubber)',
        'ساعت بلادرنگ با باتری پشتیبان CR2032 با دقت زیر ۲ppm'
      ],
      featuresEn: [
        '4-layer PCB with 2oz heavy copper for robust relay current and inductive loads',
        'Digital inputs featuring hardware Schmitt trigger filtering and 3kV optical isolation',
        'Short-circuit protected transistor outputs with integrated inductive flyback snubbers',
        'Battery-backed real-time clock (CR2032) with <2ppm timing precision'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/micro-plc-pro',
      specs: {
        'پردازنده': 'STM32F407VET6 ARM Cortex-M4 168MHz 512KB Flash',
        'ورودی‌ها': '۸ کانال ۲۴ ولت دیجیتال ایزوله با LED نمایش وضعیت',
        'خروجی‌ها': '۸ کانال رله صنعتی ۲۵۰ ولت ۵ آمپر با فیلتر Snubber',
        'پورت ارتباطی': 'RS-485 ایزوله، پورت اترنت RJ45، پورت برنامه‌نویسی USB',
        'لایه‌ها': '۴ لایه با صفحه زمین پیوسته و متریال FR4 High-TG'
      },
      specsEn: {
        'Microcontroller': 'STM32F407VET6 ARM Cortex-M4 168MHz 512KB Flash',
        'Inputs': '8x Isolated 24V Digital Inputs with Channel Status LEDs',
        'Outputs': '8x Industrial Relays 250V 5A with RC Snubber suppression',
        'Interfaces': 'Isolated RS-485, RJ45 10/100 Ethernet, Micro-USB Config',
        'PCB Stackup': '4-layer FR4 High-TG with continuous ground planes'
      }
    },
    {
      id: 'board-3',
      companyId: 'exp-3',
      companyFa: 'پژوهشکده الکترونیک و سیستم‌های دیجیتال دانشگاه',
      companyEn: 'Digital Systems & Electronics Research Lab',
      isPersonalProject: false,
      titleFa: 'برد پردازش بلادرنگ سیگنال با FPGA و دیتالاگر پرسرعت',
      titleEn: 'FPGA Ultra Real-Time Signal Capture & DSP Board',
      category: 'highspeed-fpga',
      categoryFa: 'بردهای پرسرعت و FPGA',
      categoryEn: 'High-Speed & FPGA Systems',
      createdDate: '2024-03-10',
      manufactureYear: '2024',
      layers: 8,
      mcu: 'Xilinx Artix-7 XC7A100T-2FGG484 + Dual ADC 16-bit 125MSPS',
      interfaces: ['PCIe x1 Gen2', 'SFP+ Optical 6.25 Gbps', 'High-Speed USB 3.0 FX3', 'LVDS Front-End'],
      dimensions: '120 x 95 mm',
      powerSupply: '12V DC با رگولاتورهای PMIC چندکاناله و نویز زیر ۱۰ میکروولت',
      powerSupplyEn: '12V DC with ultra-low noise multi-channel PMIC (<10uV ripple)',
      edaTool: 'Altium Designer 24',
      status: 'تحویل داده شده به کارفرما',
      statusEn: 'Delivered to Client',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد فوق‌پیشرفته ۸ لایه جهت داده‌برداری از سنسورهای راداری و التراسونیک با نرخ نمونه‌برداری ۱۲۵ مگاسمپل بر ثانیه و ارتباط فیبر نوری پرسرعت.',
      shortDescEn: '8-layer high-speed FPGA board with dual 16-bit 125MSPS ADCs, SFP+ optical transceiver, and PCIe interface for advanced radar signal acquisition.',
      features: [
        'تنظیم دقیق طول ترک‌ها (Length Matching) با تلورانس زیر ۲ میلی‌اینچ برای تمام باس‌های موازی و DDR3',
        'حافظه DDR3 به ظرفیت ۱ گیگابایت با فرکانس کاری ۸۰۰ مگاهرتز',
        'دو کانال ورودی آنالوگ تفاضلی مجهز به تقویت‌کننده کم‌نویز پیشرفته (LNA)',
        'طراحی پشته لایه‌ها با متریال FR-4 TG170 و ضخامت مس ۲ اونس در لایه‌های داخلی'
      ],
      featuresEn: [
        'Precision trace length matching with <2mil tolerance on DDR3 and parallel ADC buses',
        '1GB high-speed DDR3 memory clocked at 800MHz',
        'Dual differential analog front-end channels with ultra low noise amplifiers (LNA)',
        'Stackup engineered with high-TG170 FR-4 and 2oz inner copper'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/neuro-fpga-dsp',
      specs: {
        'تراشه FPGA': 'Xilinx Artix-7 (101,440 Logic Cells, 240 DSP Slices)',
        'مبدل آنالوگ به دیجیتال': 'AD9653 Quad 16-Bit 125 MSPS ADC',
        'تعداد لایه‌ها': '۸ لایه با صفحه زمین پیوسته و دی‌کوپلینگ فرکانس بالا',
        'حافظه RAM': 'DDR3 Micron 1GB 16-bit 800MHz',
        'پورت‌های خروجی': 'SFP+ Transceiver، رابط USB 3.0 Cypress CYUSB3014'
      },
      specsEn: {
        'FPGA Core': 'Xilinx Artix-7 (101,440 Logic Cells, 240 DSP Slices)',
        'ADC Front-End': 'AD9653 Quad 16-Bit 125 MSPS High-Speed ADC',
        'Layer Count': '8-layer stackup with high frequency decoupling',
        'Onboard RAM': 'DDR3 Micron 1GB 16-bit 800MHz',
        'High-Speed IO': 'SFP+ Transceiver, USB 3.0 Cypress CYUSB3014 Controller'
      }
    },
    {
      id: 'board-4',
      companyId: 'exp-2',
      companyFa: 'شرکت مهندسی باتری و درایورهای توان',
      companyEn: 'PowerDrive Energy Labs',
      isPersonalProject: false,
      titleFa: 'شتاب‌دهنده سخت‌افزاری پردازش تصویر با Zynq UltraScale+',
      titleEn: 'Zynq UltraScale+ Edge AI & Image Acceleration Card',
      category: 'highspeed-fpga',
      categoryFa: 'بردهای پرسرعت و FPGA',
      categoryEn: 'High-Speed & FPGA Systems',
      createdDate: '2023-09-15',
      manufactureYear: '2023',
      layers: 10,
      mcu: 'AMD Xilinx Zynq UltraScale+ MPSoC (Quad ARM Cortex-A53 + FPGA Logic)',
      interfaces: ['Dual 10GbE SFP28', 'PCIe Gen3 x4', 'MIPI CSI-2 4-Lane Camera', 'Gigabit Ethernet PHY', 'USB 3.1 Type-C'],
      dimensions: '145 x 100 mm',
      powerSupply: '12V ATX / DC Barrel با ماژول‌های PMIC دیجیتال PMBus',
      powerSupplyEn: '12V ATX / DC Barrel with PMBus Digital Multi-Phase PMIC',
      edaTool: 'Altium Designer 24',
      status: 'تست موفق و آماده تولید انبوه',
      statusEn: 'Tested & Ready for Mass Production',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد ۱۰ لایه شتاب‌دهنده بینایی ماشین و هوش مصنوعی لبه (Edge AI) با دو پورت ۱۰ گیگابیت نوری، پشتیبانی از دوربین‌های MIPI و حافظه ۴ گیگابایت LPDDR4.',
      shortDescEn: '10-layer embedded AI vision accelerator powered by Zynq UltraScale+ MPSoC, dual 10GbE SFP28 links, MIPI camera inputs and 4GB LPDDR4 memory.',
      features: [
        'طراحی پیشرفته ۱۰ لایه با پشته‌بندی متقارن و ویاهای میکرو لیزری (Blind & Buried Microvias)',
        'پشتیبانی از باس پرسرعت LPDDR4 با سرعت انتقال داده تا ۲۴۰۰MT/s',
        'دریافت تصویر آنی از دو ماژول دوربین Sony Starvis با رابط تفاضلی MIPI CSI-2',
        'مدار تغذیه هوشمند با مانیتورینگ آنلاین جریان و دمای چیپ‌ها از طریق رابط I2C/PMBus'
      ],
      featuresEn: [
        'Advanced 10-layer symmetric stackup with HDI laser blind & buried microvias',
        'High-speed LPDDR4 memory interface operating at up to 2400MT/s',
        'Simultaneous dual Sony Starvis camera capture via 4-lane MIPI CSI-2 differential pairs',
        'Smart power delivery with telemetry monitoring over digital I2C/PMBus'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/zynq-ai-vision',
      specs: {
        'پردازنده MPSoC': 'ZU3EG Quad Cortex-A53 @ 1.2GHz + Dual Cortex-R5F + Mali-400 GPU',
        'لایه‌ها': '۱۰ لایه HDI با استاندارد IPC-Class 3 و ضخامت مس سفارشی',
        'حافظه سیستم': '۴ گیگابایت LPDDR4 64-bit + 64GB eMMC 5.1 Storage',
        'ارتباطات': 'دو درگاه فیبر نوری ۱۰G SFP+، اسلات PCIe Gen3، رابط MIPI CSI-2',
        'توان مصرفی': 'حداکثر ۱۸ وات در بار پردازشی کامل'
      },
      specsEn: {
        'MPSoC Core': 'ZU3EG Quad Cortex-A53 @ 1.2GHz + Dual Cortex-R5F + GPU',
        'Stackup': '10-Layer HDI (Blind & Buried Vias) IPC-Class 3 certified',
        'System Memory': '4GB LPDDR4 64-bit + 64GB eMMC 5.1 Storage',
        'High Speed IO': 'Dual 10G SFP+ Optical, PCIe Gen3 x4, Dual 4-Lane MIPI CSI-2',
        'Power Consumption': '18W max under full Edge AI model inference load'
      }
    },
    {
      id: 'board-5',
      companyId: 'exp-2',
      companyFa: 'شرکت مهندسی باتری و درایورهای توان',
      companyEn: 'PowerDrive Energy Labs',
      isPersonalProject: false,
      titleFa: 'سیستم مدیریت باتری هوشمند صنعتی (BMS 16S 48V)',
      titleEn: 'Smart Industrial 16S 48V Battery Management System',
      category: 'power-bms',
      categoryFa: 'مدارات تغذیه، سوئیچینگ و BMS',
      categoryEn: 'Power Electronics & Smart BMS',
      createdDate: '2024-01-18',
      manufactureYear: '2024',
      layers: 4,
      mcu: 'STM32G474 (Cortex-M4 DSP + Math Accel) + TI BQ76952 AFE',
      interfaces: ['Isolated CAN 2.0B', 'RS-485 Modbus', 'Bluetooth 5.0 BLE', 'Isolated GPIOs'],
      dimensions: '140 x 80 mm',
      powerSupply: 'مستقیم از پک باتری (۳۶ الی ۶۸ ولت)',
      powerSupplyEn: 'Directly powered from Battery Pack (36V - 68V DC)',
      edaTool: 'KiCad EDA 8.0',
      status: 'به کارگیری در خطوط صنعتی',
      statusEn: 'Operational in Field',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد مانیتورینگ و بالانس فعال پک‌های باتری ۱۶ سلولی با قابلیت تحمل جریان پیوسته ۱۰۰ آمپر، سنجش دمای ۸ نقطه‌ای و پیش‌بینی عمر سلول.',
      shortDescEn: 'Intelligent 16S 48V BMS featuring active cell balancing, 100A continuous current handling, 8-point temperature telemetry, and isolated CAN bus.',
      features: [
        'مدار سوییچینگ ماسفت‌های قدرتمند موازی N-Channel با هیت‌سینک آلومینیومی اختصاصی',
        'سنجش ولتاژ تک‌تک سلول‌ها با دقت میلی‌ولت با استفاده از چیپ گرید خودرویی TI BQ76952',
        'شنت سنجش جریان ایزوله ۲۵۰ میکرو اهم با تراشه سیگما دلتا',
        'حفاظت در برابر اتصال کوتاه فوق سریع زیر ۱۰۰ میکروثانیه'
      ],
      featuresEn: [
        'Heavy-duty N-channel parallel MOSFET switching matrix with custom aluminum heatsink',
        'Millivolt-grade per-cell voltage sensing with automotive TI BQ76952 AFE',
        'Isolated 250uΩ current shunt with sigma-delta measurement ADC',
        'Ultra-fast short circuit protection (<100 microseconds)'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/smart-bms-16s',
      specs: {
        'میکروکنترلر': 'STM32G474RET6 با شتاب‌دهنده سخت‌افزاری CORDIC و FMAC',
        'تعداد سلول‌ها': 'پشتیبانی از ۳ الی ۱۶ سلول لیتیوم یون / LiFePO4',
        'جریان مداوم / پیک': '۱۰۰ آمپر پیوسته / ۲۵۰ آمپر پیک (۱۰ ثانیه)',
        'تعداد لایه‌ها': '۴ لایه با مس ضخیم ۴ اونس (4oz Heavy Copper)',
        'روش بالانس': 'بالانس اکتیو سلفی با جریان تا ۱.۵ آمپر بر سلول'
      },
      specsEn: {
        'Controller': 'STM32G474RET6 with hardware math CORDIC / FMAC accelerators',
        'Cell Count': 'Supports 3 to 16 Li-Ion / LiFePO4 chemistry series cells',
        'Continuous Current': '100A Continuous / 250A Peak (10 seconds pulse)',
        'Layer Stackup': '4-layer 4oz Heavy Copper substrate for high current traces',
        'Balancing Type': 'Active inductive balancing at up to 1.5A per individual cell'
      }
    },
    {
      id: 'board-6',
      companyId: 'personal',
      companyFa: 'پروژه شخصی و آزمایشگاه خانگی',
      companyEn: 'Personal R&D & Open Source Lab',
      isPersonalProject: true,
      titleFa: 'اینورتر سه فاز درایور موتور براشلس بر پایه GaN (BLDC/FOC Inverter 1kW)',
      titleEn: '1kW GaN-Based 3-Phase BLDC/PMSM FOC Motor Inverter',
      category: 'power-bms',
      categoryFa: 'مدارات تغذیه، سوئیچینگ و BMS',
      categoryEn: 'Power Electronics & Smart BMS',
      createdDate: '2023-08-12',
      manufactureYear: '2023',
      layers: 4,
      mcu: 'STM32G431KB (170MHz) + نیم‌پل‌های نیترید گالیم (GaN FETs)',
      interfaces: ['CAN 2.0B / CAN-FD', 'Encoder / Hall Sensor Inputs', 'PWM Motor Drive', 'UART / SPI Telemetry'],
      dimensions: '90 x 65 mm',
      powerSupply: '24V - 60V DC ورودی توان بالا',
      powerSupplyEn: '24V - 60V High-Power DC Bus',
      edaTool: 'Altium Designer 24',
      status: 'تست موفق و آماده تولید انبوه',
      statusEn: 'Tested & Ready for Mass Production',
      image: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'درایور پیشرفته موتورهای سنکرون مغناطیس دائم و براشلس با بازدهی ۹۸.۵٪، الگوریتم کنترل برداری میدانی (FOC) بدون سنسور و ترانزیستورهای پیشرفته GaN.',
      shortDescEn: 'Ultra-compact 1kW 3-phase motor inverter employing Gallium Nitride (GaN) transistors, 98.5% peak efficiency, and sensorless Field Oriented Control.',
      features: [
        'به‌کارگیری ماسفت‌های GaN با فرکانس سوییچینگ بالای ۱۰۰ کیلوهرتز و تلفات حداقل',
        'نمونه‌برداری همزمان جریان ۳ فاز با مبدل‌های ADC تفاضلی سریع میکروکنترلر',
        'طراحی پد حرارتی یکپارچه در زیر برد جهت انتقال حرارت به شاسی فلزی دستگاه',
        'مدار تشخیص خطای جریان اضافه، اضافه ولتاژ و دمای بیش از حد سخت‌افزاری'
      ],
      featuresEn: [
        'Utilizes GaN FETs switching at >100kHz delivering ultra-low switching losses',
        'Simultaneous 3-phase current sensing via internal high-speed differential ADCs',
        'Direct thermal pad interface on bottom PCB for chassis heatsink coupling',
        'Hardware overcurrent, overvoltage, and overtemperature interlock protections'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/gan-foc-inverter',
      specs: {
        'توان نامی': '۱۰۰۰ وات پیوسته با خنک‌کاری پسیو',
        'ولتاژ کاری': '۲۴ الی ۶۰ ولت مستقیم (DC)',
        'ترانزیستورهای قدرت': '۶ عدد GaN Systems 100V 90A High-Speed FET',
        'فرکانس سوییچینگ': 'تا ۱۰۰ کیلوهرتز PWM با زمان مرده (Dead-Time) زیر ۱۰ نانوثانیه',
        'الگوریتم کنترلی': 'FOC Field-Oriented Control بدون سنسور مبتنی بر رویت‌گر Luenberger'
      },
      specsEn: {
        'Nominal Power': '1000W Continuous with passive heatsink cooling',
        'Operating Voltage': '24V to 60V DC nominal bus voltage',
        'Power Stage': '6x GaN Systems 100V 90A Ultra-Fast Power Transistors',
        'Switching Frequency': 'Up to 100kHz PWM with <10ns dead-time',
        'Control Algorithm': 'Sensorless FOC using Luenberger sliding-mode observer'
      }
    },
    {
      id: 'board-7',
      companyId: 'personal',
      companyFa: 'پروژه شخصی و آزمایشگاه خانگی',
      companyEn: 'Personal R&D & Open Source Lab',
      isPersonalProject: true,
      titleFa: 'فلایت کنترلر فوق‌سبک پهپاد و درون مسابقه‌ای (FC-F405 Nano)',
      titleEn: 'Ultralight Drone Flight Controller (FC-F405 Nano)',
      category: 'robotics-embedded',
      categoryFa: 'رباتیک و سیستم‌های هدایت',
      categoryEn: 'Robotics & Guidance',
      createdDate: '2023-06-25',
      manufactureYear: '2023',
      layers: 6,
      mcu: 'STM32F405RGT6 (168MHz) + ICM-42688-P IMU (Gyro/Accel)',
      interfaces: ['6x UART', 'I2C', 'SPI', 'PWM Motor Outputs (8x DShot600)', 'OSD AT7456E'],
      dimensions: '20 x 20 mm (مینیاتوری)',
      powerSupply: '2S - 6S LiPo ورودی (7.4V - 25.2V)',
      powerSupplyEn: '2S - 6S LiPo Input (7.4V - 25.2V)',
      edaTool: 'Altium Designer 24',
      status: 'عرضه به صورت اوپن‌سورس',
      statusEn: 'Open Source Hardware',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد کنترل پرواز ۶ لایه مینیاتوری در ابعاد ۲ سانتی‌متر با سنسور ژیروسکوپ فوق کم‌نویز، بارومتر دقیق و مدار نمایش اطلاعات روی تصویر دوربین (OSD).',
      shortDescEn: 'Ultra-compact 20x20mm 6-layer flight controller featuring low-noise ICM-42688-P IMU, BMP280 barometer, and integrated analog OSD.',
      features: [
        'طراحی قطعات فشرده دوطرفه SMD با پکیج 0402 و QFN',
        'تغذیه رگوله سوییچینگ با نویز فیلتر شده برای ویدیو و سنسورها',
        'سازگاری کامل با فریمورهای Betaflight، INAV و ArduPilot',
        'بلک‌باکس داخلی با حافظه فلش ۱۶ مگابایت برای ثبت داده‌های پروازی'
      ],
      featuresEn: [
        'High density double-sided SMD layout with 0402 passes and QFN ICs',
        'Filtered switching power regulator tailored for video feeds and precision sensors',
        'Full firmware compatibility with Betaflight, INAV, and ArduPilot',
        'Built-in 16MB Blackbox Flash logger for high-rate telemetry analysis'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/flight-controller-nano',
      specs: {
        'پردازنده': 'STM32F405RGT6 ARM Cortex-M4 168MHz',
        'سنسور حرکتی': 'ICM-42688-P با فرکانس نمونه‌برداری تا ۳۲ کیلوهرتز',
        'سنسور فشار هوا': 'BMP280 Barometer با دقت اندازه گیری ارتفاع ۱۰ سانتی‌متر',
        'وزن کل برد': 'فقط ۳.۲ گرم',
        'لایه‌ها': '۶ لایه با via-in-pad آبکاری شده'
      },
      specsEn: {
        'Microcontroller': 'STM32F405RGT6 ARM Cortex-M4 168MHz',
        'Motion IMU': 'ICM-42688-P sampling up to 32kHz low-jitter telemetry',
        'Barometer': 'BMP280 Barometer with 10cm altitude measurement resolution',
        'Total Weight': 'Only 3.2 grams',
        'Layer Stackup': '6-layer with capped Via-in-Pad technology'
      }
    },
    {
      id: 'board-8',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'کنترلر مرکزی ناوبری ربات‌های خودمختار AGV/AMR با پشتیبانی از ROS2',
      titleEn: 'Autonomous Mobile Robot (AGV/AMR) Navigation & Drive Controller',
      category: 'robotics-embedded',
      categoryFa: 'رباتیک و سیستم‌های هدایت',
      categoryEn: 'Robotics & Guidance',
      createdDate: '2024-04-02',
      manufactureYear: '2024',
      layers: 6,
      mcu: 'STM32H723ZG (550MHz) + Raspberry Pi Compute Module 4 (CM4)',
      interfaces: ['Dual CAN-FD', 'Isolated RS-485', '4x Quadrature Encoder', 'LiDAR Interface (Ethernet)', 'Safety E-Stop'],
      dimensions: '135 x 105 mm',
      powerSupply: '18V - 48V DC ایزوله با مدار Soft-Start',
      powerSupplyEn: '18V - 48V DC Isolated with Soft-Start Inrush Protection',
      edaTool: 'Altium Designer 24',
      status: 'به کارگیری در خطوط صنعتی',
      statusEn: 'Operational in Field',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'مادربرد یکپارچه ناوبری ربات‌های انبارداری با پشتیبانی از پردازشگر CM4، میکروکنترلر بلادرنگ STM32H7، درایور انکودر و مدارات ایمنی قطع اضطراری سخت‌افزاری.',
      shortDescEn: 'Integrated AGV robot motherboard coupling Raspberry Pi CM4 with STM32H7 real-time controller, LiDAR Ethernet, encoder counters, and SIL-rated E-Stop safety.',
      features: [
        'معماری دو هسته‌ای هیبریدی: پردازش SLAM روی CM4 لینوکس و کنترل حرکت روی STM32H7',
        'رابط اترنت گیگابیتی اختصاصی برای سنسور لیدار ۲ بعدی و ۳ بعدی',
        'مدار سخت‌افزاری ایمنی SIL2 جهت مانیتورینگ استپ اضطراری و ترمز دینامیکی',
        '۴ کانال ورودی انکودر تفاضلی RS-422 با فیلتر دیجیتال سخت‌افزاری'
      ],
      featuresEn: [
        'Hybrid dual-processor design: Linux SLAM on CM4 + Hard Real-Time Motion on STM32H7',
        'Dedicated Gigabit Ethernet switch port for 2D/3D LiDAR sensors',
        'Hardware SIL2 compliant safety interlock circuit for E-Stop and emergency braking',
        '4x Differential RS-422 encoder counter channels with hardware glitch filtering'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/agv-navigation-core',
      specs: {
        'پردازنده محاسباتی': 'Raspberry Pi CM4 (Quad Cortex-A72 @ 1.5GHz + 8GB RAM + WiFi)',
        'پردازنده کنترل حرکت': 'STM32H723ZG ARM Cortex-M7 550MHz با تایمرهای انکودر ۳۲ بیتی',
        'لایه‌ها': '۶ لایه با استک‌آپ امپدانس کنترل شده برای اترنت و USB 3.0',
        'پورت‌های ایمنی': 'رله‌های ایمنی Dual-Channel با تاییدیه استاندارد ISO 13849',
        'ارتباطات فیلدباس': 'دو پورت CAN-FD ایزوله و پورت سریال صنعتی RS-485'
      },
      specsEn: {
        'Compute Processor': 'Raspberry Pi CM4 (Quad Cortex-A72 @ 1.5GHz, 8GB RAM, WiFi)',
        'Motion Controller': 'STM32H723ZG ARM Cortex-M7 550MHz with 32-bit encoder timers',
        'Layer Stackup': '6 Layers with controlled impedance for Gigabit Ethernet & USB 3.0',
        'Safety Channels': 'Dual-channel safety relays compliant with ISO 13849 Category 3',
        'Fieldbus IO': 'Dual isolated CAN-FD channels & industrial RS-485 serial'
      }
    },
    {
      id: 'board-9',
      companyId: 'personal',
      companyFa: 'پروژه شخصی و R&D آزاد',
      companyEn: 'Personal Project & Open Source Lab',
      isPersonalProject: true,
      titleFa: 'ماژول ثبت سیگنال‌های حیاتی چندکاناله ECG/EMG ایزوله (BioSens-Pro AFE)',
      titleEn: 'Isolated Multi-Channel ECG/EMG Biosignal Acquisition Front-End',
      category: 'medical-telemetry',
      categoryFa: 'تجهیزات پزشکی و بیوالکترونیک',
      categoryEn: 'Medical & Bioelectronics',
      createdDate: '2024-02-14',
      manufactureYear: '2024',
      layers: 6,
      mcu: 'STM32U585 (Ultra-Low-Power Cortex-M33 + TrustZone) + TI ADS1298 AFE',
      interfaces: ['8-Channel Differential ECG Leads', 'Isolated SPI', 'Bluetooth LE 5.3', 'Micro-SD Storage'],
      dimensions: '85 x 55 mm',
      powerSupply: 'باتری تک سلولی LiPo 3.7V با شارژر بیسیم Qi و مدار ایمنی ایزوله',
      powerSupplyEn: '3.7V LiPo Battery with Qi Wireless Charging & 5kV Medical Isolation',
      edaTool: 'Altium Designer 24',
      status: 'تحویل داده شده به کارفرما',
      statusEn: 'Delivered to Client',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'برد ثبت الکتروکاردیوگرام ۸ کاناله با استاندارد پزشکی IEC 60601-1، ایزولاسیون ۵ کیلوولت، نویز ورودی زیر ۴ میکروولت و پروتکل رمزنگاری شده بلوتوث.',
      shortDescEn: 'Medical-grade 8-channel ECG/EMG front-end with 5kV patient isolation, <4uV noise floor, low-power ARM TrustZone security, and wireless BLE streaming.',
      features: [
        'ایزولاسیون کامل بخش متصل به بیمار با سد دی‌الکتریک ۵۰۰۰ ولت و جریان نشتی زیر ۱۰ میکروآمپر',
        'مبدل آنالوگ به دیجیتال ۲۴ بیتی ۸ کاناله با CMRR بالای ۱۱۵ دسی‌بل',
        'فیلترهای فعال آنالوگ حذف نویز برق شهر (۵۰/۶۰ هرتز) و آرتیفکت‌های حرکتی',
        'رمزنگاری سخت‌افزاری داده‌های سلامت (AES-256) قبل از ارسال بیسیم'
      ],
      featuresEn: [
        '5000V patient barrier with <10uA ultra-low patient leakage current (IEC 60601 compliant)',
        '8-channel 24-bit simultaneous sampling ADC with >115dB CMRR',
        'Active analog notch and high-pass filtering for baseline wander & 50/60Hz rejection',
        'Hardware AES-256 telemetry encryption before BLE wireless transmission'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      datasheetFileName: 'BioSens_Pro_Datasheet.pdf',
      datasheetFileSize: '2.1 MB',
      stepFileUrl: 'https://raw.githubusercontent.com/arashtaheri-embedded/biosens-pro-afe/main/3d/BioSens_Pro_AFE.step',
      stepFileName: 'BioSens_Pro_AFE_3D.step',
      stepFileSize: '6.2 MB',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/biosens-pro-afe',
      specs: {
        'تراشه فرانت‌اند': 'Texas Instruments ADS1298 24-Bit 8-Channel Medical AFE',
        'میکروکنترلر': 'STM32U585QI Ultra-Low Power 160MHz ARM Cortex-M33',
        'ایزولاسیون': '۵ کیلوولت با ترانسفورماتور پلانار مینیاتوری و اپتوکوپلرهای پزشکی',
        'نرخ نمونه‌برداری': '۲۵۰ تا ۳۲۰۰۰ نمونه در ثانیه در هر کانال',
        'طول عمر باتری': 'بیش از ۷۲ ساعت مانیتورینگ پیوسته با باتری ۱۰۰۰ میلی‌آمپر'
      },
      specsEn: {
        'Analog Front-End': 'Texas Instruments ADS1298 24-Bit 8-Channel Medical AFE',
        'Main Controller': 'STM32U585QI Ultra-Low Power 160MHz ARM Cortex-M33 with TrustZone',
        'Isolation Barrier': '5kV galvanic isolation with planar DC/DC and medical digital isolators',
        'Sampling Rate': '250 to 32,000 SPS per individual differential lead',
        'Battery Autonomy': '>72 hours continuous streaming on 1000mAh single-cell battery'
      }
    },
    {
      id: 'board-10',
      companyId: 'exp-3',
      companyFa: 'پژوهشکده الکترونیک و سیستم‌های دیجیتال دانشگاه',
      companyEn: 'Digital Systems & Electronics Research Lab',
      isPersonalProject: false,
      titleFa: 'هاب تله‌متری پرتابل مانیتورینگ علائم حیاتی بیمارستان (VitalPatch IoT)',
      titleEn: 'Hospital Vital Signs Wearable IoT Telemetry Hub',
      category: 'medical-telemetry',
      categoryFa: 'تجهیزات پزشکی و بیوالکترونیک',
      categoryEn: 'Medical & Bioelectronics',
      createdDate: '2023-05-18',
      manufactureYear: '2023',
      layers: 4,
      mcu: 'Nordic nRF5340 (Dual-Core Cortex-M33) + سنسور PPG ضربان و SpO2',
      interfaces: ['Optical PPG Sensor', 'Skin Temperature Sensor', 'BLE 5.3 Mesh', 'NFC Tag', 'USB-C'],
      dimensions: '45 x 35 mm (کوچک و پوشیدنی)',
      powerSupply: 'باتری سکه‌ای قابل شارژ Li-Ion 3.7V',
      powerSupplyEn: 'Rechargeable 3.7V Mini Li-Ion Coin Cell',
      edaTool: 'Altium Designer 24',
      status: 'نمونه اولیه آزمایشگاهی (Prototyping)',
      statusEn: 'Lab Prototype Verified',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'دستگاه پوشیدنی سنجش پیوسته ضربان قلب، سطح اکسیژن خون (SpO2) و دمای بدن بیمار با پروتکل بلوتوث مِش و اتصال مستقیم به سرور مرکزی بیمارستان.',
      shortDescEn: 'Wearable clinical telemetry node continuously tracking SpO2, heart rate variability, and skin temperature with Bluetooth Mesh hospital routing.',
      features: [
        'سنسور اپتیکال انعکاسی دو طول موج (قرمز و مادون قرمز) با الگوریتم حذف آرتیفکت حرکت',
        'پردازنده دوهسته‌ای کم‌مصرف نوردیک با تخصیص یک هسته اختصاصی برای پردازش سیگنال و یک هسته برای شبکه',
        'طراحی مدار با مصرف توان زیر ۱۵ میلی‌آمپر در حالت ارسال بلادرنگ داده‌ها',
        'پوشش محافظ ضدآب IP67 مناسب استفاده در محیط‌های درمانی'
      ],
      featuresEn: [
        'Dual-wavelength optical reflection sensor (Red & IR) with motion artifact DSP cancellation',
        'Dual-core Nordic SoC separating signal processing from Bluetooth Mesh protocol stack',
        'Ultra low power operation consuming <15mA during active continuous data transmission',
        'IP67 water-resistant enclosure layout suitable for clinical environments'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/vitalpatch-telemetry',
      specs: {
        'پردازنده مرکزی': 'Nordic nRF5340 Dual-Core (128MHz App + 64MHz Network)',
        'سنسور اپتیکال': 'Analog Devices MAX86176 High-Sensitivity Pulse Oximeter AFE',
        'سنسور دما': 'سنسور پزشکی تماسی با دقت ۰.۰۵ درجه سانتی‌گراد',
        'پروتکل شبکه': 'Bluetooth LE 5.3 با پروتکل شبکه بیمارستانی امن',
        'ابعاد و وزن': '۴۵ در ۳۵ میلی‌متر - وزن فقط ۱۲ گرم با باتری'
      },
      specsEn: {
        'System SoC': 'Nordic nRF5340 Dual-Core (128MHz App + 64MHz Network Core)',
        'Optical AFE': 'Analog Devices MAX86176 High-Sensitivity Pulse Oximeter AFE',
        'Temp Sensor': 'Clinical-grade skin contact sensor with ±0.05°C accuracy',
        'Wireless Stack': 'Bluetooth LE 5.3 with secure hospital mesh telemetry',
        'Dimensions & Weight': '45 x 35 mm - 12 grams total weight including battery'
      }
    },
    {
      id: 'board-11',
      companyId: 'exp-3',
      companyFa: 'پژوهشکده الکترونیک و سیستم‌های دیجیتال دانشگاه',
      companyEn: 'Digital Systems & Electronics Research Lab',
      isPersonalProject: false,
      titleFa: 'ترنسیور رادیویی دوربرد فرکانس 868/915MHz با تقویت‌کننده توان +30dBm (LongRange RF-Link)',
      titleEn: 'Long-Range 868/915MHz High-Power (+30dBm) RF Transceiver Module',
      category: 'rf-telecom',
      categoryFa: 'مخابرات، RF و امواج مایکروویو',
      categoryEn: 'RF & Wireless Systems',
      createdDate: '2023-12-05',
      manufactureYear: '2023',
      layers: 4,
      mcu: 'Semtech SX1262 LoRa Core + Skyworks High-Efficiency Power Amplifier',
      interfaces: ['SPI Bus', 'SMA 50-Ohm Antenna Port', 'Digital GPIOs', 'UART Control'],
      dimensions: '38 x 28 mm',
      powerSupply: '3.3V - 5V DC با مدار رگولاتور LDO فوق کم‌نویز RF',
      powerSupplyEn: '3.3V - 5V DC with Ultra-Low-Noise RF LDO Regulator',
      edaTool: 'Altium Designer 24',
      status: 'تولید انبوه و عملیاتی در خط تولید',
      statusEn: 'Mass Production & Active in Industry',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'ماژول مخابراتی توان بالای ۱ وات (+30dBm) با برد بیش از ۲۰ کیلومتر در فضای باز، مجهز به فیلتر هارمونیک Pi و انطباق امپدانس ۵۰ اهم آنتن.',
      shortDescEn: 'High-power 1-Watt (+30dBm) Sub-1GHz RF transceiver delivering >20km Line-of-Sight range, Pi harmonic filter, and precision 50Ω antenna matching.',
      features: [
        'طراحی مدار RF 4 لایه با متریال با اتلاف پایین و کنترل امپدانس ۵۰ اهم با ابزار شبیه‌سازی الکترومغناطیسی',
        'تقویت‌کننده توان (PA) یکپارچه با توان خروجی تا ۳۰ دسی‌بل میلی‌وات (۱ وات خالص)',
        'فیلتر پایین‌گذر چند مرحله‌ای جهت تضعیف هارمونیک‌های مرتبه دوم و سوم تا بیش از -55dBc',
        'شیلدینگ فلزی کامل ضد تداخل الکترومغناطیسی (RF Shield Can)'
      ],
      featuresEn: [
        '4-layer RF PCB utilizing low-loss dielectric with EM-simulated 50Ω coplanar waveguides',
        'Integrated RF power amplifier delivering up to +30dBm (1000mW clean output power)',
        'Multi-stage low-pass filtering suppressing 2nd/3rd harmonics below -55dBc',
        'Full metal RF shield can preventing parasitic radiation and external coupling'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/longrange-rf-link',
      specs: {
        'تراشه اصلی RF': 'Semtech SX1262 با حساسیت دریافت تا -148dBm',
        'باند فرکانسی': '۸۶۳ الی ۹۲۸ مگاهرتز (پشتیبانی از باندهای ISM جهانی)',
        'توان خروجی': 'قابل تنظیم از ۰ الی +30dBm (۱ وات)',
        'برد مخابراتی': 'تا ۲۵ کیلومتر در خط دید مستقیم (LOS)',
        'پورت آنتن': 'کانکتور استاندارد SMA مادگی با امپدانس ۵۰ اهم'
      },
      specsEn: {
        'RF Chipset': 'Semtech SX1262 LoRa with -148dBm receive sensitivity',
        'Frequency Band': '863MHz to 928MHz (Sub-1GHz ISM band coverage)',
        'TX Output Power': 'Software adjustable from 0dBm up to +30dBm (1W)',
        'Link Range': 'Up to 25km under unobstructed Line-of-Sight conditions',
        'Antenna Interface': 'Standard 50Ω gold-plated female SMA connector'
      }
    },
    {
      id: 'board-12',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'تحلیل‌گر طیف فرکانسی و تداخلات RF پرتابل تا فرکانس 6GHz (RF-Spec Mini)',
      titleEn: 'USB Portable 6GHz RF Spectrum Analyzer & EMI Sniffer',
      category: 'rf-telecom',
      categoryFa: 'مخابرات، RF و امواج مایکروویو',
      categoryEn: 'RF & Wireless Systems',
      createdDate: '2023-04-10',
      manufactureYear: '2023',
      layers: 6,
      mcu: 'STM32H743 + Analog Devices ADF4351 PLL Synthesizer + RF Mixer',
      interfaces: ['RF Input SMA (50Ω)', 'High-Speed USB Type-C', 'Trigger In/Out', 'OLED Display'],
      dimensions: '110 x 60 mm',
      powerSupply: 'مستقیم از درگاه USB Type-C (5V 500mA)',
      powerSupplyEn: 'Direct USB Type-C Bus-Powered (5V 500mA)',
      edaTool: 'Altium Designer 24',
      status: 'تست موفق و آماده تولید انبوه',
      statusEn: 'Tested & Ready for Mass Production',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'دستگاه آزمایشگاهی پرتابل تحلیل طیف رادیویی از فرکانس ۳۵ مگاهرتز تا ۶ گیگاهرتز جهت عیب‌یابی نویز EMC، تست آنتن‌ها و بررسی تداخلات شبکه‌های بیسیم.',
      shortDescEn: 'Portable USB spectrum analyzer spanning 35MHz to 6GHz for EMC troubleshooting, near-field EMI probe sniffing, and RF transceiver diagnostics.',
      features: [
        'طراحی ۶ لایه با متریال فرکانس بالای Rogers RO4350B در لایه‌های بالا',
        'سنتزایزر فرکانسی دقیق با نویز فاز زیر -100dBc/Hz در آفست ۱۰ کیلوهرتز',
        'نرم‌افزار دسکتاپ کراس‌پلتفرم Qt C++ جهت نمایش نمودار آبشاری (Waterfall) و طیف فوریه',
        'پروب‌های میدان نزدیک (Near-Field) اختصاصی جهت شناسایی نقاط نشر نویز روی بردهای الکترونیکی'
      ],
      featuresEn: [
        '6-layer hybrid stackup integrating Rogers RO4350B high-frequency laminate on top RF layers',
        'Precision wideband PLL synthesizer achieving <-100dBc/Hz phase noise at 10kHz offset',
        'Cross-platform Qt C++ desktop GUI displaying real-time FFT spectrum and waterfall displays',
        'Custom near-field magnetic and electric EMI sniffer probes for PCB diagnostic sweeps'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/rf-spec-mini',
      specs: {
        'محدوده فرکانس': '۳۵ مگاهرتز الی ۶۰۰۰ مگاهرتز (6GHz)',
        'پویایی دامنه': '۸۵ دسی‌بل با نویز ورودی (DANL) زیر -115dBm',
        'پهنای باند تفکیک (RBW)': 'از ۱ کیلوهرتز تا ۱ مگاهرتز قابل انتخاب',
        'رابط داده': 'USB 2.0 High Speed (480Mbps) با تغذیه مستقیم از پورت',
        'ابعاد فیزیکی': '۱۱۰ در ۶۰ میلی‌متر با محفظه تمام آلومینیومی CNC'
      },
      specsEn: {
        'Frequency Coverage': '35MHz to 6000MHz (6GHz continuous)',
        'Dynamic Range': '85dB dynamic range with DANL floor <-115dBm',
        'Resolution Bandwidth': '1kHz to 1MHz software selectable RBW filters',
        'Data Interface': 'USB 2.0 High Speed (480Mbps) bus-powered operation',
        'Chassis': '110 x 60 mm housed in custom CNC milled aluminum shield box'
      }
    },
    {
      id: 'board-13',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'واحد کنترل الکترونیکی موتور و تزریق سوخت خودرویی (Open-ECU Pro Cortex-M7)',
      titleEn: 'Automotive Engine Control Unit (Open-ECU Pro Cortex-M7)',
      category: 'automotive-ecu',
      categoryFa: 'الکترونیک خودرو و کنترلرهای ECU',
      categoryEn: 'Automotive & ECU Systems',
      createdDate: '2024-04-20',
      manufactureYear: '2024',
      layers: 6,
      mcu: 'NXP S32K344 / STM32H753 (Dual-Core Lockstep Cortex-M7) Automotive Grade',
      interfaces: ['Dual CAN-FD', 'LIN Bus 2.2', '8x Injector Drivers', '8x Ignition Coil Drivers', 'VR/Hall Crank Sensor Inputs'],
      dimensions: '160 x 120 mm',
      powerSupply: '6V - 36V Automotive Transient Protected (ISO 7637-2 Pulses)',
      powerSupplyEn: '6V - 36V DC with ISO 7637-2 Automotive Surge Clamping',
      edaTool: 'Altium Designer 24',
      status: 'به کارگیری در خطوط صنعتی',
      statusEn: 'Operational in Field',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'کنترلر پیشرفته مدیریت موتور ۴ تا ۸ سیلندر با تاییدیه استاندارد ایمنی ASIL-D، ترانزیستورهای درایور هوشمند تزریق سوخت و جرقه، و گذرگاه دوگانه CAN-FD.',
      shortDescEn: 'Automotive-grade 4 to 8-cylinder engine ECU featuring ASIL-D safety architecture, smart high-current ignition/injection drivers, and dual CAN-FD.',
      features: [
        'طراحی ۶ لایه مقاوم در برابر پالس‌های مخرب استارت و تخلیه بار خودرو (Load Dump Clamping)',
        'درایورهای ماسفت هوشمند با فیدبک جریان و تشخیص خطای قطعی یا اتصال کوتاه سیم‌کشی',
        'رمزنگاری سخت‌افزاری ماژول امنیت سخت‌افزاری (HSM) جهت جلوگیری از دستکاری نرم‌افزار',
        'کانکتور ضدآب خودرویی ۶۴ پین آمفنول با پوشش کانفورمال کوتینگ (Conformal Coating)'
      ],
      featuresEn: [
        '6-layer stackup hardened against ISO 7637-2 load dump surges and cranking transients',
        'Smart MOSFET low-side drivers with active current telemetry and wire fault diagnostics',
        'Hardware Security Module (HSM) on-chip preventing unauthorized firmware tampering',
        '64-pin sealed automotive Amphenol header with complete PCB silicone conformal coating'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: true,
      githubUrl: 'https://github.com/arashtaheri-embedded/open-ecu-pro',
      specs: {
        'پردازنده': 'NXP S32K344 Dual Cortex-M7 Lockstep @ 160MHz Automotive Grade',
        'درایورهای جرقه و انژکتور': '۸ کانال انژکتور High-Z + ۸ کانال جرقه هوشمند با IGBT اختصاصی',
        'ورودی‌های سنسور': 'سنسور موقعیت میل‌لنگ (VR/Hall)، دریچه گاز (TPS)، سنسور MAP و اکسیژن Wideband',
        'استاندارد ایمنی': 'ISO 26262 ASIL-D Ready با ایزولاسیون کامل بخش‌های حساس',
        'دمای کاری': '-۴۰ الی +۱۲۵ درجه سانتی‌گراد (Automotive Grade 1)'
      },
      specsEn: {
        'MCU Core': 'NXP S32K344 Dual Cortex-M7 Lockstep @ 160MHz AEC-Q100 Grade 1',
        'Ignition & Injection': '8x High-Z fuel injector outputs + 8x Smart logic-level coil IGBTs',
        'Sensor Conditioning': 'Dual VR/Hall crank triggers, TPS, MAP, wideband Lambda sensor AFE',
        'Functional Safety': 'ISO 26262 ASIL-D certified architecture with fail-safe watchdogs',
        'Thermal Range': '-40°C to +125°C under-hood automotive environment'
      }
    },
    {
      id: 'board-14',
      companyId: 'exp-1',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      isPersonalProject: false,
      titleFa: 'دیتالاگر تلمتیکس خودرویی با GPS، اتصال 4G LTE و باس CAN-FD (Telematics AutoLogger)',
      titleEn: 'Automotive 4G LTE Telematics & CAN-FD Fleet Data Logger',
      category: 'automotive-ecu',
      categoryFa: 'الکترونیک خودرو و کنترلرهای ECU',
      categoryEn: 'Automotive & ECU Systems',
      createdDate: '2023-03-15',
      manufactureYear: '2023',
      layers: 4,
      mcu: 'STM32G0B1 + Quectel EG25-G Worldwide 4G LTE + GNSS Multi-Constellation',
      interfaces: ['Dual High-Speed CAN-FD', 'OBD-II Interface', 'Micro-SD Socket (Up to 512GB)', 'Internal Accelerometer (Crash Detection)'],
      dimensions: '80 x 50 mm',
      powerSupply: 'ورودی ۹ الی ۳۶ ولت با مدار محافظت خودرویی و باتری بکاپ Li-Po',
      powerSupplyEn: '9-36V DC Automotive with Li-Po Backup Battery',
      edaTool: 'Altium Designer 24',
      status: 'تولید انبوه و عملیاتی در خط تولید',
      statusEn: 'Mass Production & Active in Industry',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      shortDescFa: 'دستگاه ثبت پارامترهای موتور، خطاهای ECU و موقعیت جغرافیایی ناوگان حمل‌ونقل با قابلیت ارسال بلادرنگ روی بستر مخابراتی 4G و پروتکل MQTT.',
      shortDescEn: 'Automotive fleet telematics logger capturing dual CAN-FD frames, multi-GNSS coordinates, and 6-axis crash kinematics streamed over 4G LTE/MQTT.',
      features: [
        'دریافت همزمان اطلاعات از دو باس مستقل CAN-FD خودرویی با فیلتر شناسه سخت‌افزاری',
        'ماژول موقعیت‌یابی ماهواره‌ای دقیق مجهز به GPS، Glonass، Galileo و BeiDou',
        'سنسور شتاب‌سنج ۶ محوره جهت تشخیص تصادف شدید، ترمز ناگهانی و واژگونی',
        'ذخیره محلی داده‌ها روی حافظه SD با فرمت استاندارد MDF4 سازگار با ابزارهای Vector CANoe'
      ],
      featuresEn: [
        'Simultaneous packet capture across dual independent CAN-FD buses with hardware ID filters',
        'High-precision multi-constellation GNSS (GPS, GLONASS, Galileo, BeiDou)',
        '6-axis IMU detecting aggressive braking, high-G crash impacts, and rollover events',
        'Local binary telemetry logging in standard MDF4 format compatible with Vector CANoe'
      ],
      datasheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      schematicUrl: '#',
      bomUrl: '#',
      featured: false,
      githubUrl: 'https://github.com/arashtaheri-embedded/telematics-autologger',
      specs: {
        'پردازنده': 'STM32G0B1RET6 ARM Cortex-M0+ 64MHz 512KB Flash',
        'مودم سلولار': 'Quectel 4G LTE Cat-4 با پوشش فرکانسی جهانی + Fallback به 2G/3G',
        'گیرنده GNSS': 'گیرنده ۷۲ کاناله با نرخ بروزرسانی موقعیت تا ۱۰ هرتز',
        'باتری پشتیبان': 'باتری داخلی ۸۵۰ میلی‌آمپر لیتیوم پلیمر با مدار محافظت اضافه شارژ',
        'استاندارد کانکتور': 'کانکتور صنعتی استاندارد OBD-II خودرویی'
      },
      specsEn: {
        'Microcontroller': 'STM32G0B1RET6 ARM Cortex-M0+ 64MHz 512KB Flash',
        'Cellular Modem': 'Quectel 4G LTE Cat-4 global frequency coverage with 2G/3G fallback',
        'GNSS Engine': '72-channel high-sensitivity receiver with up to 10Hz position fixes',
        'Internal Battery': '850mAh rechargeable Li-Po backup with autonomous power switching',
        'Vehicle Interface': 'Direct standard automotive OBD-II port adapter header'
      }
    }
  ],

  articles: [
    {
      id: 'article-1',
      titleFa: 'راهنمای جامع طراحی بردهای پرسرعت (High-Speed PCB) و کنترل امپدانس دیفرانسیلی',
      titleEn: 'Comprehensive Guide to High-Speed PCB Design & Differential Impedance Control',
      category: 'طراحی سخت‌افزار',
      categoryFa: 'طراحی سخت‌افزار',
      categoryEn: 'Hardware Design',
      date: '۱۴۰۳/۰۴/۱۵',
      readTime: '۱۵ دقیقه',
      readTimeEn: '15 min read',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      summaryFa: 'در این مقاله به بررسی عمیق اصول فیزیکی سیگنال‌های پرسرعت فرکانس بالا، اثر پوسته‌ای (Skin Effect)، مدیریت صفحه‌های مرجع زمین، فرمول‌های محاسبه امپدانس مشخصه و تکنیک‌های Length Matching می‌پردازیم.',
      summaryEn: 'An in-depth guide covering physical principles of high-frequency signals, skin effect, reference planes, impedance equations, and trace length tuning.',
      tags: ['High-Speed PCB', 'Signal Integrity', 'Altium', 'Impedance Control', 'EMC'],
      pdfUrl: 'https://arxiv.org/pdf/2301.00001.pdf',
      pdfFileName: 'High_Speed_PCB_Design_Guide.pdf',
      pdfFileSize: '2.4 MB',
      pdfFileType: 'PDF',
      featured: true,
      // ---- Academic paper fields (مقالات علمی — like the site) ----
      authorsFa: 'آرش طاهری، مهسا کریمی',
      authorsEn: 'Arash Taheri, Mahsa Karimi',
      venueFa: 'ژورنال بین‌المللی مهندسی الکترونیک (IJEE)',
      venueEn: 'International Journal of Electronic Engineering (IJEE)',
      year: '1403',
      type: 'journal',
      doi: '10.1109/IEE.2024.3421001',
      contentMarkdownFa: `### مقدمه: چرا طراحی پرسرعت تفاوت دارد؟
در فرکانس‌های کاری بالای ۵۰ مگاهرتز یا زمان‌های خیز (Rise Time) کمتر از ۱ نانوثانیه، سیم‌ها و ترک‌های PCB دیگر صرفاً یک اتصال ساده با مقاومت صفر نیستند؛ بلکه به عنوان خطوط انتقال (Transmission Lines) رفتار می‌کنند. عدم تطبیق امپدانس منجر به بازتابش سیگنال (Signal Reflection)، تضعیف توان و پدیده تداخل الکترومغناطیسی (EMI) می‌گردد.

#### ۱. محاسبه امپدانس مشخصه Microstrip و Stripline
برای کنترل امپدانس تک‌ترک (معمولاً ۵۰ اهم) و دیفرانسیلی (۹۰ یا ۱۰۰ اهم برای USB و Ethernet):
- **ضخامت دی‌الکتریک (h):** فاصله ترک تا صفحه زمین زیرین
- **ثابت دی‌الکتریک موثر (Er):** متریال FR-4 معمولاً در فرکانس ۱ گیگاهرتز بین ۴.۱ الی ۴.۴ است
- **عرض ترک (w) و ضخامت مس (t):** پارامترهای اصلی کنترل امپدانس

\`\`\`
Z0 = (87 / sqrt(Er + 1.41)) * ln((5.98 * h) / (0.8 * w + t))
\`\`\`

#### ۲. پشته‌بندی بهینه لایه‌ها (Layer Stackup)
در بردهای ۶ لایه، بهترین استک‌آپ به شرح زیر است تا کمترین لوپ بازگشت جریان داشته باشیم:
1. لایه ۱: Top Signal (پرسرعت)
2. لایه ۲: Ground Plane پیوسته (مرجع لایه ۱)
3. لایه ۳: Inner Signal
4. لایه ۴: Power Plane (تغذیه اصلی)
5. لایه ۵: Ground Plane دوم
6. لایه ۶: Bottom Signal`,
      contentMarkdownEn: `### Introduction: Why High-Speed Design Matters
At frequencies exceeding 50MHz or signal rise times under 1ns, PCB traces cannot be treated as ideal zero-resistance wires; they function as transmission lines. Unmatched impedance causes signal reflections, power loss, and severe EMI.`
    },
    {
      id: 'article-2',
      titleFa: 'پیاده‌سازی حرفه‌ای پروتکل CAN-FD در سیستم‌های نهفته با کنترلرهای STM32',
      titleEn: 'Professional Implementation of CAN-FD Protocol on STM32 Microcontrollers',
      category: 'فریمور و امبدد',
      categoryFa: 'فریمور و امبدد',
      categoryEn: 'Firmware & Embedded',
      date: '۱۴۰۳/۰۲/۲۰',
      readTime: '۱۲ دقیقه',
      readTimeEn: '12 min read',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      summaryFa: 'مقایسه پروتکل کلاسیک CAN 2.0B با CAN Flexible Datarate (CAN-FD)، تنظیم Baud Rate تا ۵ مگابیت بر ثانیه، پیکربندی سخت‌افزاری FDCAN در HAL و مدیریت صف‌های وقفه با FreeRTOS.',
      summaryEn: 'Comparative analysis between classic CAN 2.0B and CAN-FD, hardware bitrate configuration up to 5Mbps, STM32 FDCAN peripheral setup and FreeRTOS queue management.',
      tags: ['CAN-FD', 'STM32', 'FreeRTOS', 'Industrial IoT', 'Automotive'],
      pdfUrl: 'https://arxiv.org/pdf/2301.00001.pdf',
      pdfFileName: 'CAN_FD_Implementation_STM32.pdf',
      pdfFileSize: '1.8 MB',
      pdfFileType: 'PDF',
      featured: true,
      // ---- Academic paper fields (مقالات علمی — like the site) ----
      authorsFa: 'آرش طاهری',
      authorsEn: 'Arash Taheri',
      venueFa: 'کنفرانس ملی مهندسی برق (ICEE) — پاورقی پذیرفته‌شده',
      venueEn: 'National Conference on Electrical Engineering (ICEE) — Accepted',
      year: '1402',
      type: 'conference',
      doi: '10.5254/ICEE.2023.118',
      contentMarkdownFa: `### چرا پروتکل CAN-FD؟
شبکه کنترل‌کننده محلی با نرخ دیتای انعطاف‌پذیر (CAN-FD) توسط بوش توسعه داده شد تا دو محدودیت اساسی CAN سنتی را حل کند:
1. افزایش سایز پی‌لود داده از ۸ بایت به ۶۴ بایت در هر فریم
2. افزایش سرعت انتقال داده تا ۵ الی ۸ مگابیت بر ثانیه در فاز داده.`,
      contentMarkdownEn: `### Why CAN-FD Protocol?
CAN with Flexible Data-Rate was developed by Bosch to overcome payload and throughput limits of traditional CAN.`
    },
    {
      id: 'article-3',
      titleFa: 'روش‌های عملی پاس کردن تست‌های سازگاری الکترومغناطیسی (EMC/EMI) در استانداردهای IEC 61000',
      titleEn: 'Practical Guidelines for Passing Industrial EMC/EMI Compliance (IEC 61000)',
      category: 'تست و استانداردهای EMC',
      categoryFa: 'تست و استانداردهای EMC',
      categoryEn: 'EMC Testing & Compliance',
      date: '۱۴۰۲/۱۱/۱۰',
      readTime: '۱۸ دقیقه',
      readTimeEn: '18 min read',
      coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      summaryFa: 'تکنیک‌های ایزولاسیون زمین، فیلترهای حالت مشترک (Common-Mode Chokes)، دیودهای TVS و محافظت در برابر شوک‌های ESD و EFT در بردهای الکترونیکی.',
      summaryEn: 'Grounding layout techniques, common-mode filtering, TVS clamping diodes, and ESD/EFT immunity strategies for industrial electronics.',
      tags: ['EMC', 'EMI', 'IEC 61000', 'TVS Protection', 'Grounding'],
      pdfUrl: 'https://arxiv.org/pdf/2301.00001.pdf',
      pdfFileName: 'EMC_Compliance_Design_Guide.pdf',
      pdfFileSize: '3.1 MB',
      pdfFileType: 'PDF',
      featured: false,
      // ---- Academic paper fields (مقالات علمی — like the site) ----
      authorsFa: 'آرش طاهری، حسین نادری، لیلا احمدی',
      authorsEn: 'Arash Taheri, Hossein Naderi, Leila Ahmadi',
      venueFa: 'ژورنال الکترونیک صنعتی (IJIE)',
      venueEn: 'Industrial Electronics Journal (IJIE)',
      year: '1402',
      type: 'journal',
      doi: '10.1016/j.iiej.2023.91442',
      contentMarkdownFa: `### تست‌های کلیدی EMC صنعتی
استاندارد IEC 61000 شامل آزمون‌های تخلیه الکترواستاتیک (ESD)، پالس‌های سریع گذرای الکتریکی (EFT/Burst) و سرج ولتاژ بالا (Surge) است. انتخاب محل قرارگیری دیودهای TVS در نزدیک‌ترین نقطه به کانکتور ورودی اولین و مهم‌ترین گام است.`,
      contentMarkdownEn: `### Key Industrial EMC Tests
IEC 61000 comprises Electrostatic Discharge (ESD), Electrical Fast Transient (EFT) and high-energy surge testing.`
    },
    {
      id: 'article-4',
      titleFa: 'معماری امن لایه‌های ارتباطی اینترنت اشیا صنعتی (IIoT) با MQTT over TLS و احراز هویت متقابل X.509',
      titleEn: 'Secure Industrial IoT Communications with Mutual TLS (mTLS) and X.509 Certificates',
      category: 'اینترنت اشیا صنعتی',
      categoryFa: 'اینترنت اشیا صنعتی',
      categoryEn: 'Industrial IoT',
      date: '۱۴۰۲/۰۸/۲۵',
      readTime: '۱۴ دقیقه',
      readTimeEn: '14 min read',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      summaryFa: 'بررسی پیاده‌سازی پشته امنیتی mTLS روی میکروکنترلرهای با منابع محدود، ذخیره کلیدهای خصوصی در چیپ‌های امنیتی سخت‌افزاری (Secure Element مانند ATECC608) و انتقال بهینه دیتا.',
      summaryEn: 'Implementing mutual TLS on resource-constrained microcontrollers, hardware secure elements (ATECC608), and efficient data streaming.',
      tags: ['IIoT', 'MQTT', 'mTLS', 'Cybersecurity', 'Secure Element'],
      pdfUrl: 'https://arxiv.org/pdf/2301.00001.pdf',
      pdfFileName: 'Secure_IIoT_mTLS_Architecture.pdf',
      pdfFileSize: '2.1 MB',
      pdfFileType: 'PDF',
      featured: false,
      // ---- Academic paper fields (مقالات علمی — like the site) ----
      authorsFa: 'آرش طاهری',
      authorsEn: 'Arash Taheri',
      venueFa: 'پایان‌نامه کارشناسی ارشد — دانشگاه صنعتی شریف',
      venueEn: 'M.Sc. Thesis — Sharif University of Technology',
      year: '1401',
      type: 'thesis',
      doi: '',
      contentMarkdownFa: `### امنیت در سطح سخت‌افزار
استفاده از گواهی‌های X.509 و ذخیره کلید خصوصی در حافظه تراشه امنیتی سخت‌افزاری مانع از استخراج کلید و نفوذ به شبکه صنعتی می‌گردد.`,
      contentMarkdownEn: `### Hardware-Grade Security
Leveraging X.509 certificates and dedicated secure elements prevents physical key extraction in industrial plants.`
    }
  ],

  blogPosts: [
    {
      id: 'post-1',
      titleFa: 'راهنمای جامع طراحی بردهای پرسرعت و کنترل امپدانس مشخصه در Altium Designer',
      titleEn: 'Comprehensive Guide to High-Speed PCB Layout & Impedance Control in Altium Designer',
      slug: 'high-speed-pcb-impedance-control',
      category: 'طراحی مدار چاپی (PCB)',
      categoryFa: 'طراحی مدار چاپی (PCB)',
      categoryEn: 'PCB Design & Layout',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      publishDate: '۱۴۰۳/۰۵/۱۰',
      readTime: '۸ دقیقه',
      readTimeEn: '8 min read',
      author: 'مهندس آرش طاهری',
      views: 342,
      likes: 48,
      status: 'published',
      audioUrl: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      audioTitleFa: 'پادکست مهندسی: اصول محاسبات امپدانس و فیزیک خطوط انتقال در فرکانس بالا',
      audioTitleEn: 'Engineering Podcast: Transmission Line Physics & Impedance Matching',
      audioDuration: '12:45',
      summaryFa: 'بررسی فیزیک خطوط انتقال در فرکانس‌های بالای ۵۰ مگاهرتز، فرمول‌های محاسبه استریپ‌لاین و میکرواستریپ، تنظیم ضخامت دی‌الکتریک و جدول مقایسه استک‌آپ‌های چندلایه.',
      summaryEn: 'Physics of transmission lines at >50MHz, microstrip & stripline impedance calculations, dielectric stackups, and differential pair length matching rules.',
      contentFa: `<p>در طراحی سیستم‌های دیجیتال مدرن، هنگام کار با سیگنال‌های پرسرعت مانند <strong>USB 3.0، Ethernet 1Gbps، PCIe یا DDR4</strong>، زمان خیز سیگنال (Rise Time) بسیار کوتاه بوده و ترک‌های برد مدار چاپی دیگر صرفاً اتصالات مقاومتی نیستند بلکه به عنوان <em>خطوط انتقال امواج مایکروویو (Transmission Lines)</em> عمل می‌کنند.</p>

<div style="margin: 20px 0; text-align: center;">
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" alt="High-Speed PCB Layout" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 12px; border: 1px solid #334155;" />
  <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">تصویر ۱: مسیریابی خطوط دیفرانسیلی با رعایت فاصله ایزولاسیون و کنترل امپدانس</p>
</div>

<h3>۱. جدول استانداردهای امپدانس مشخصه در پروتکل‌های پرسرعت</h3>
<p>در جدول زیر، مقادیر استاندارد امپدانس برای پروتکل‌های متداول به همراه میزان تلرانس مجاز آورده شده است:</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background: rgba(30, 41, 59, 0.9); color: #00ffcc; text-align: right;">
      <th style="padding: 10px; border-bottom: 1px solid #334155;">پروتکل / رابط</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">نوع امپدانس</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">مقدار هدف (Target)</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">تلرانس مجاز</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">حداکثر اختلاف طول (Phase Skew)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">USB 2.0 High-Speed</td>
      <td style="padding: 8px 10px;">دیفرانسیلی (Diff)</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">90 Ω</td>
      <td style="padding: 8px 10px;">±10%</td>
      <td style="padding: 8px 10px; font-family: monospace;">&lt; 1.25 mm</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b; background: rgba(30, 41, 59, 0.3);">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">Gigabit Ethernet (1000BASE-T)</td>
      <td style="padding: 8px 10px;">دیفرانسیلی (Diff)</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">100 Ω</td>
      <td style="padding: 8px 10px;">±10%</td>
      <td style="padding: 8px 10px; font-family: monospace;">&lt; 0.5 mm</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">PCIe Gen 3 / 4</td>
      <td style="padding: 8px 10px;">دیفرانسیلی (Diff)</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">85 Ω</td>
      <td style="padding: 8px 10px;">±8%</td>
      <td style="padding: 8px 10px; font-family: monospace;">&lt; 0.1 mm</td>
    </tr>
    <tr style="background: rgba(30, 41, 59, 0.3);">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">DDR4 Single-Ended / Clock</td>
      <td style="padding: 8px 10px;">تک‌ترک (SE) / کلاک</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">50 Ω / 100 Ω</td>
      <td style="padding: 8px 10px;">±5%</td>
      <td style="padding: 8px 10px; font-family: monospace;">&lt; 0.05 mm</td>
    </tr>
  </tbody>
</table>

<div style="padding: 14px 18px; background: rgba(0, 255, 204, 0.08); border-right: 4px solid #00ffcc; border-radius: 8px; margin: 18px 0;">
  <strong style="color: #00ffcc;">💡 نکته طلایی مهندسی:</strong> همواره پلین زمین زیر ترک‌های پرسرعت باید کاملاً یکپارچه و بدون شکاف (Slot) باشد. هرگونه عبور ترک پرسرعت از روی شکاف پلین زمین باعث ایجاد لوپ جریان بازگشتی و پرش شدید EMI می‌شود.
</div>

<h3>۲. نمونه تنظیمات Design Rule در Altium Designer</h3>
<pre style="background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; font-family: monospace; color: #38bdf8; font-size: 11px; overflow-x: auto; direction: ltr; text-align: left;">
// Altium Layer Stackup Calculation Formula
// Substrate Material: Isola FR408HR (Er = 3.65)
// Dielectric Height (H) = 0.100 mm (4.0 mil)
// Copper Thickness (T)  = 0.035 mm (1.0 oz)
// Target Impedance      = 50.0 Ohm Single-Ended
// Calculated Trace Width (W) = 0.180 mm (7.1 mil)
</pre>
`,
      contentEn: `<p>In modern high-speed electronics, when working with high-frequency protocols such as <strong>USB 3.0, Gigabit Ethernet, PCIe or DDR memory</strong>, the trace on the PCB behaves strictly as an electromagnetic transmission line.</p>
<h3>1. Target Impedance Specifications Table</h3>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; border: 1px solid #334155;">
  <thead>
    <tr style="background: rgba(30, 41, 59, 0.9); color: #00ffcc; text-align: left;">
      <th style="padding: 8px;">Protocol</th>
      <th style="padding: 8px;">Type</th>
      <th style="padding: 8px;">Target</th>
      <th style="padding: 8px;">Tolerance</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding: 8px;">USB 2.0</td><td style="padding: 8px;">Diff</td><td style="padding: 8px;">90 Ω</td><td style="padding: 8px;">±10%</td></tr>
    <tr><td style="padding: 8px;">GbE Ethernet</td><td style="padding: 8px;">Diff</td><td style="padding: 8px;">100 Ω</td><td style="padding: 8px;">±10%</td></tr>
    <tr><td style="padding: 8px;">PCIe Gen3</td><td style="padding: 8px;">Diff</td><td style="padding: 8px;">85 Ω</td><td style="padding: 8px;">±8%</td></tr>
  </tbody>
</table>`,
      tags: ['Altium', 'High-Speed PCB', 'Impedance Control', 'Signal Integrity', 'Stackup'],
      seoTitleFa: 'آموزش کنترل امپدانس در بردهای مدار چاپی آلتیوم دیزاینر',
      seoDescFa: 'راهنمای جامع و کاربردی برای طراحی بردهای چندلایه پرسرعت و کنترل امپدانس دیفرانسیلی'
    },
    {
      id: 'post-2',
      titleFa: 'استراتژی‌های بهینه‌سازی توان در میکروکنترلرهای STM32 با FreeRTOS Tickless Idle',
      titleEn: 'Ultra-Low-Power Optimization Strategies in STM32 with FreeRTOS Tickless Idle',
      slug: 'stm32-low-power-freertos-tickless',
      category: 'سیستم‌های امبدد و فریم‌ور',
      categoryFa: 'سیستم‌های امبدد و فریم‌ور',
      categoryEn: 'Embedded & Firmware',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      publishDate: '۱۴۰۳/۰۴/۲۲',
      readTime: '۱۰ دقیقه',
      readTimeEn: '10 min read',
      author: 'مهندس آرش طاهری',
      views: 289,
      likes: 39,
      status: 'published',
      summaryFa: 'کاهش مصرف جریان نودهای سنسوری باتری‌محور از ۲۰ میلی‌آمپر به کمتر از ۴ میکروآمپر با استفاده از مدهای Stop/Standby و جدول مقایسه مصرف توان.',
      summaryEn: 'Reducing battery sensor current from 20mA down to <4uA using STM32 Stop/Standby low-power modes and FreeRTOS Tickless Idle architecture.',
      contentFa: `<p>در طراحی دستگاه‌های اینترنت اشیا (IoT) و ترنسمیترهای صنعتی با تغذیه باتری، طول عمر باتری یکی از حیاتی‌ترین شاخص‌های تجاری است. در این مقاله به پیاده‌سازی گام‌به‌گام <strong>FreeRTOS Tickless Idle</strong> روی خانواده میکروکنترلرهای <strong>STM32L4 و STM32WB</strong> می‌پردازیم.</p>

<div style="margin: 20px 0; text-align: center;">
  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80" alt="STM32 Low Power Architecture" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 12px; border: 1px solid #334155;" />
  <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">تصویر ۲: بررسی مصرف جریان در اسیلوسکوپ دیجیتال با پروب جریان در مدهای مختلف خواب</p>
</div>

<h3>۱. جدول مقایسه مصرف جریان در مدهای توان STM32L4</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px;">
  <thead>
    <tr style="background: rgba(30, 41, 59, 0.9); color: #10b981; text-align: right;">
      <th style="padding: 10px; border-bottom: 1px solid #334155;">مد کاری (Operating Mode)</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">وضعیت CPU و پریفرال‌ها</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">جریان مصرفی در 3.0V</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">زمان بیداری (Wakeup Time)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">Run Mode (80MHz)</td>
      <td style="padding: 8px 10px;">کامل فعال (All Clocks ON)</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #f43f5e;">8.4 mA</td>
      <td style="padding: 8px 10px;">0 µs</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b; background: rgba(30, 41, 59, 0.3);">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">Sleep Mode (80MHz)</td>
      <td style="padding: 8px 10px;">CPU متوقف، پریفرال‌ها فعال</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #fbbf24;">2.6 mA</td>
      <td style="padding: 8px 10px;">6 کلاک سیستم</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">Stop 2 Mode</td>
      <td style="padding: 8px 10px;">PLL خاموش، SRAM کامل حفظ</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #34d399;">1.2 µA</td>
      <td style="padding: 8px 10px;">5.4 µs</td>
    </tr>
    <tr style="background: rgba(30, 41, 59, 0.3);">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">Standby + RTC</td>
      <td style="padding: 8px 10px;">فقط RTC و پین‌های Wakeup فعال</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #10b981;">320 nA</td>
      <td style="padding: 8px 10px;">14 µs</td>
    </tr>
  </tbody>
</table>

<h3>۲. نمونه کد پیاده‌سازی FreeRTOS Hook برای مد کم‌مصرف</h3>
<pre style="background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; font-family: monospace; color: #34d399; font-size: 11px; overflow-x: auto; direction: ltr; text-align: left;">
void vPortSuppressTicksAndSleep(TickType_t xExpectedIdleTime) {
    // 1. Calculate low-power timer count based on expected ticks
    uint32_t ulReloadValue = (xExpectedIdleTime * LPTIM_TICKS_PER_MS);
    
    // 2. Configure LPTIM1 interrupt
    HAL_LPTIM_TimeOut_Start_IT(&hlptim1, 0xFFFF, ulReloadValue);
    
    // 3. Enter Ultra Low Power STOP2 Mode
    HAL_PWREx_EnterSTOP2Mode(PWR_STOPENTRY_WFI);
    
    // 4. Re-configure system clocks upon wakeup
    SystemClock_Config();
}
</pre>
`,
      contentEn: `<p>In battery-powered industrial IoT telemetry and wearables, maximizing battery lifetime is paramount.</p>`,
      tags: ['STM32', 'FreeRTOS', 'Low Power', 'IoT', 'LPTIM', 'C/C++'],
      seoTitleFa: 'کاهش مصرف توان STM32 با FreeRTOS کم‌مصرف',
      seoDescFa: 'آموزش پیاده‌سازی مدهای Stop و Standby در STM32 برای افزایش عمر باتری'
    },
    {
      id: 'post-3',
      titleFa: 'پروتکل CAN-FD در صنایع خودروسازی و اتوماسیون صنعتی: تفاوت‌ها، پیکربندی و تحلیل نویز',
      titleEn: 'CAN-FD Protocol in Automotive & Industrial Automation: Architecture, Speeds & Noise Immunity',
      slug: 'can-fd-protocol-automotive-architecture',
      category: 'اینترنت اشیا و کنترل صنعتی',
      categoryFa: 'اینترنت اشیا و کنترل صنعتی',
      categoryEn: 'Industrial IoT & Automation',
      coverImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      publishDate: '۱۴۰۳/۰۳/۱۸',
      readTime: '۷ دقیقه',
      readTimeEn: '7 min read',
      author: 'مهندس آرش طاهری',
      views: 215,
      likes: 31,
      status: 'published',
      summaryFa: 'مقایسه سرعت انتقال داده CAN کلاسیک (۱ مگابیت) با CAN-FD (تا ۵ الی ۸ مگابیت)، جدول مشخصات فنی و انتخاب ترنسیورهای ایزوله صنعتی.',
      summaryEn: 'Comparing Classical CAN (1Mbps/8B) with CAN-FD (5-8Mbps/64B payload), bit-rate switching, and industrial galvanic isolation transceivers.',
      contentFa: `<p>پروتکل <strong>CAN-FD (Flexible Data-Rate)</strong> نسل پیشرفته شبکه CAN است که برای پاسخگویی به حجم فزاینده تبادل اطلاعات در خودروهای مدرن، سیستم‌های رانندگی خودکار (ADAS) و رباتیک صنعتی توسعه یافته است.</p>

<div style="margin: 20px 0; text-align: center;">
  <img src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80" alt="CAN-FD Protocol Bus Analysis" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 12px; border: 1px solid #334155;" />
  <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">تصویر ۳: ثبت فریم‌های CAN-FD با لاجیک آنالایزر و تحلیل خطاهای CRC</p>
</div>

<h3>۱. جدول مقایسه CAN 2.0B با CAN-FD</h3>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px;">
  <thead>
    <tr style="background: rgba(30, 41, 59, 0.9); color: #38bdf8; text-align: right;">
      <th style="padding: 10px; border-bottom: 1px solid #334155;">ویژگی / مشخصه فنی</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">CAN کلاسیک (2.0B)</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">CAN-FD پیشرفته</th>
      <th style="padding: 10px; border-bottom: 1px solid #334155;">بهبود عملکرد</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">حداکثر حجم داده (Payload)</td>
      <td style="padding: 8px 10px; font-family: monospace;">8 Bytes</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #10b981; font-weight: bold;">64 Bytes</td>
      <td style="padding: 8px 10px; color: #10b981;">۸ برابر بیشتر</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b; background: rgba(30, 41, 59, 0.3);">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">سرعت فاز داده (Data Bitrate)</td>
      <td style="padding: 8px 10px; font-family: monospace;">Max 1 Mbps</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #10b981; font-weight: bold;">5 to 8 Mbps</td>
      <td style="padding: 8px 10px; color: #10b981;">تا ۸۰۰٪ افزایش سرعت</td>
    </tr>
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 8px 10px; font-weight: bold; color: #f8fafc;">الگوریتم صحت‌سنجی (CRC)</td>
      <td style="padding: 8px 10px; font-family: monospace;">15-Bit CRC</td>
      <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">17-Bit / 21-Bit CRC</td>
      <td style="padding: 8px 10px;">ایمنی نویز بالاتر</td>
    </tr>
  </tbody>
</table>
`,
      contentEn: `<p>CAN-FD enables automotive and industrial networks to transmit up to 64 bytes of payload at dynamic bitrates up to 8 Mbps.</p>`,
      tags: ['CAN-FD', 'Automotive', 'ECU', 'Industrial Network', 'ISO 11898'],
      seoTitleFa: 'راهنمای راه‌اندازی و طراحی پروتکل CAN-FD',
      seoDescFa: 'بررسی تفاوت‌های CAN-FD با CAN کلاسیک و الزامات سخت‌افزاری'
    }
  ],

  skills: [
    {
      categoryFa: 'طراحی سخت‌افزار و بردهای الکترونیکی (PCB Design)',
      categoryEn: 'Hardware & PCB Engineering',
      icon: 'Cpu',
      items: [
        { name: 'Altium Designer 24 / Altium 365', nameFa: 'Altium Designer 24 / Altium 365', nameEn: 'Altium Designer 24 / Altium 365', level: 98, icon: 'Layers' },
        { name: 'High-Speed PCB Design & Impedance Control', nameFa: 'طراحی بردهای پرسرعت و کنترل امپدانس', nameEn: 'High-Speed PCB & Impedance Control', level: 95, icon: 'Activity' },
        { name: 'Multi-Layer Stackups (4 to 12 Layers)', nameFa: 'پشته‌بندی مدارات چندلایه (۴ تا ۱۲ لایه)', nameEn: 'Multi-Layer Stackups (4-12 Layers)', level: 94, icon: 'Grid' },
        { name: 'KiCad EDA & Open-Source Toolchains', nameFa: 'نرم‌افزار KiCad EDA و ابزارهای بازمتن', nameEn: 'KiCad EDA & Open-Source Toolchains', level: 88, icon: 'Code' },
        { name: 'EMC / EMI Compliance & Signal Integrity', nameFa: 'استانداردهای EMC / EMI و صحت سیگنال', nameEn: 'EMC/EMI Compliance & Signal Integrity', level: 92, icon: 'ShieldCheck' },
        { name: 'Power Electronics & BMS (Switching / GaN)', nameFa: 'الکترونیک قدرت و مدارات BMS (سوئیچینگ / GaN)', nameEn: 'Power Electronics & BMS (GaN)', level: 90, icon: 'Zap' },
        { name: 'DFM / DFA / DFT (Design for Manufacturing)', nameFa: 'استانداردهای ساخت و مونتاژ صنعتی (DFM/DFA)', nameEn: 'DFM / DFA / DFT Manufacturing Standards', level: 96, icon: 'CheckCircle2' }
      ]
    },
    {
      categoryFa: 'میکروکنترلرها و سیستم‌های نهفته (Embedded & Firmware)',
      categoryEn: 'Microcontrollers & Firmware',
      icon: 'Binary',
      items: [
        { name: 'C / Embedded C (MISRA C Standards)', nameFa: 'زبان C و استانداردهای کدنویسی MISRA-C', nameEn: 'C / Embedded C (MISRA C)', level: 98, icon: 'FileCode' },
        { name: 'Modern C++ for Embedded (C++17/20)', nameFa: 'برنامه‌نویسی مدرن C++ برای سیستم‌های نهفته', nameEn: 'Modern Embedded C++ (C++17/20)', level: 90, icon: 'FileCode2' },
        { name: 'STM32 Ecosystem (Cortex-M0/M4/M7/H7)', nameFa: 'اکوسیستم میکروکنترلرهای STM32 (M4/M7/H7)', nameEn: 'STM32 Ecosystem (Cortex-M4/M7/H7)', level: 96, icon: 'Cpu' },
        { name: 'FreeRTOS & Real-Time Kernel Concepts', nameFa: 'سیستم‌عامل‌های بلادرنگ FreeRTOS و زمان‌بندی تسک‌ها', nameEn: 'FreeRTOS & Real-Time Kernel', level: 94, icon: 'Clock' },
        { name: 'ESP32 (ESP-IDF / Wi-Fi / BLE 5.0)', nameFa: 'تراشه‌های ESP32 (فریمور ESP-IDF / وای‌فای / بلوتوث)', nameEn: 'ESP32 (ESP-IDF / Wi-Fi / BLE 5.0)', level: 92, icon: 'Wifi' },
        { name: 'FPGA VHDL/Verilog (Xilinx Artix-7)', nameFa: 'کدنویسی VHDL/Verilog و تراشه‌های FPGA Artix-7', nameEn: 'FPGA VHDL/Verilog (Xilinx Artix-7)', level: 82, icon: 'Box' },
        { name: 'Embedded Linux & Yocto / Buildroot', nameFa: 'لینوکس امبدد و سیستم‌های ساخت Buildroot / Yocto', nameEn: 'Embedded Linux & Yocto / Buildroot', level: 78, icon: 'Terminal' }
      ]
    },
    {
      categoryFa: 'پروتکل‌های ارتباطی و شبکه‌های صنعتی (Protocols & Bus)',
      categoryEn: 'Protocols & Industrial Networks',
      icon: 'Network',
      items: [
        { name: 'CAN Bus 2.0B & CAN-FD', nameFa: 'پروتکل‌های فیلدباس CAN 2.0B و CAN-FD', nameEn: 'CAN Bus 2.0B & CAN-FD Protocols', level: 95, icon: 'Share2' },
        { name: 'Modbus RTU / Modbus TCP', nameFa: 'پروتکل‌های Modbus RTU و Modbus TCP صنعتی', nameEn: 'Modbus RTU / Modbus TCP', level: 94, icon: 'Radio' },
        { name: 'LoRa / LoRaWAN & Wireless Meshes', nameFa: 'شبکه‌های بیسیم دوربرد LoRa و LoRaWAN', nameEn: 'LoRa / LoRaWAN & Wireless Meshes', level: 90, icon: 'Wifi' },
        { name: 'SPI, I2C, UART, QSPI, I2S, PCIe', nameFa: 'باس‌های ارتباطی SPI, I2C, UART, QSPI, I2S, PCIe', nameEn: 'SPI, I2C, UART, QSPI, I2S, PCIe', level: 98, icon: 'Repeat' },
        { name: 'MQTT / HTTP / WebSockets over TLS', nameFa: 'پروتکل‌های اینترنت اشیا MQTT و TLS امن', nameEn: 'MQTT / HTTP / WebSockets over TLS', level: 90, icon: 'Globe' },
        { name: 'USB-PD & USB 2.0/3.0 Transceiver Design', nameFa: 'طراحی مدارات ترنسیور USB-PD و USB 3.0', nameEn: 'USB-PD & USB 2.0/3.0 Transceivers', level: 86, icon: 'Maximize2' }
      ]
    },
    {
      categoryFa: 'تجهیزات آزمایشگاه، تست و برنامه‌نویسی نرم‌افزار',
      categoryEn: 'Lab Equipment & Software Stack',
      icon: 'Wrench',
      items: [
        { name: 'اسیلوسکوپ‌های دیجیتال فرکانس بالا (500MHz+)', nameFa: 'اسیلوسکوپ‌های دیجیتال فرکانس بالا (500MHz+)', nameEn: 'High-Frequency Digital Oscilloscopes (500MHz+)', level: 96, icon: 'Activity' },
        { name: 'لاژیک آنالایزر و تحلیل پروتکل‌های صنعتی', nameFa: 'لاژیک آنالایزر و تحلیل پروتکل‌های صنعتی', nameEn: 'Logic Analyzers & Protocol Sniffing', level: 95, icon: 'BarChart2' },
        { name: 'مونتاژ دقیق SMD (پکیج‌های 0402، BGA، QFN)', nameFa: 'مونتاژ دستی و دقیق SMD (پکیج‌های 0402، BGA، QFN)', nameEn: 'Precision SMD Soldering (0402, BGA, QFN)', level: 92, icon: 'Wrench' },
        { name: 'Python (اتوماسیون تست و اسکریپت‌های داده)', nameFa: 'پایتون (اتوماسیون تست و اسکریپت‌های داده)', nameEn: 'Python (Automated Test & Data Scripts)', level: 88, icon: 'Terminal' },
        { name: 'Qt C++ (نرم‌افزارهای مانیتورینگ تحت دسکتاپ)', nameFa: 'فریم‌ورک Qt C++ (نرم‌افزارهای مانیتورینگ تحت دسکتاپ)', nameEn: 'Qt C++ (Desktop Hardware GUI Tools)', level: 84, icon: 'Monitor' },
        { name: 'Git / CI-CD / Hardware-in-the-Loop (HIL)', nameFa: 'کنترل نسخه Git و تست سخت‌افزار در حلقه (HIL)', nameEn: 'Git / CI-CD / Hardware-in-the-Loop (HIL)', level: 89, icon: 'GitBranch' }
      ]
    }
  ],

  experiences: [
    {
      id: 'exp-1',
      roleFa: 'مهندس ارشد طراح سخت‌افزار و سرپرست تیم R&D',
      roleEn: 'Lead Hardware Engineer & Embedded R&D Lead',
      companyFa: 'شرکت فناوری سامانه‌های هوشمند امبدد (Smart Embedded Systems)',
      companyEn: 'Smart Embedded Systems Tech Ltd.',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80',
      companyInitials: 'SES',
      companyColor: '#00ffcc',
      startDateFa: 'فروردین ۱۴۰۰',
      startDateEn: 'Apr 2021',
      endDateFa: 'اکنون',
      endDateEn: 'Present',
      periodFa: 'فروردین ۱۴۰۰ - اکنون · ۴ سال و ۵ ماه',
      periodEn: 'Apr 2021 - Present · 4 yrs 5 mos',
      durationFa: '۴ سال و ۵ ماه',
      durationEn: '4 yrs 5 mos',
      sortDate: '2021-04-01',
      locationFa: 'تهران، پارک فناوری پردیس',
      locationEn: 'Tehran, Pardis Tech Park',
      typeFa: 'تمام وقت',
      typeEn: 'Full-time',
      workModeFa: 'حضوری / تمام وقت',
      workModeEn: 'On-site · Full-time',
      descriptionFa: 'سرپرستی تیم ۵ نفره تحقیق و توسعه سخت‌افزار برای طراحی بردهای پیشرفته صنعتی، گیت‌وی‌های پرسرعت و سیستم‌های هوشمند انرژی.',
      descriptionEn: 'Leading a team of 5 hardware & firmware engineers designing high-speed industrial IoT gateways, smart grid sensors, and power controllers.',
      achievementsFa: [
        'هدایت تیم ۵ نفره طراحی بردهای الکترونیکی و فریم‌ور برای سیستم‌های اینترنت اشیا صنعتی و گیت‌وی‌های اسکادا',
        'طراحی صفر تا صد برد گیت‌وی صنعتی RT-Gateway با تیراژ بیش از ۵۰۰۰ عدد در صنایع پتروشیمی و اتوماسیون',
        'کاهش ۳۵ درصدی هزینه‌های تولید برد (BOM Optimization) با جایگزینی قطعات هوشمند و انتخاب بهینه استک‌آپ',
        'کسب گواهینامه تست‌های انطباق EMC مطابق استاندارد بین‌المللی IEC 61000'
      ],
      achievementsEn: [
        'Leading a 5-engineer hardware & firmware team delivering industrial IoT gateways and SCADA telemetry',
        'Engineered RT-Gateway Pro from schematic to 5000+ deployed units across petrochemical plants',
        'Achieved 35% BOM cost reduction through component rationalization and optimized stackup',
        'Obtained full IEC 61000 industrial EMC/ESD lab certifications'
      ],
      skillsUsed: ['Altium Designer', 'STM32H7', 'CAN-FD', 'High-Speed PCB', 'FreeRTOS', 'EMC/EMI', 'Layer Stackup', 'DFM'],
      projectsLinked: ['RT-Gateway Pro', 'Micro-PLC Pro', 'RF-Spec Mini']
    },
    {
      id: 'exp-2',
      roleFa: 'مهندس طراح PCB و فریم‌ور نهفته',
      roleEn: 'Hardware & Firmware Design Engineer',
      companyFa: 'شرکت مهندسی باتری و درایورهای توان (PowerDrive Labs)',
      companyEn: 'PowerDrive Energy Labs',
      companyLogo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=120&q=80',
      companyInitials: 'PDL',
      companyColor: '#10b981',
      startDateFa: 'اردیبهشت ۱۳۹۷',
      startDateEn: 'May 2018',
      endDateFa: 'اسفند ۱۳۹۹',
      endDateEn: 'Mar 2021',
      periodFa: 'اردیبهشت ۱۳۹۷ - اسفند ۱۳۹۹ · ۲ سال و ۱۱ ماه',
      periodEn: 'May 2018 - Mar 2021 · 2 yrs 11 mos',
      durationFa: '۲ سال و ۱۱ ماه',
      durationEn: '2 yrs 11 mos',
      sortDate: '2018-05-01',
      locationFa: 'تهران، منطقه صنعتی نوآوری',
      locationEn: 'Tehran, Innovation Hub',
      typeFa: 'تمام وقت',
      typeEn: 'Full-time',
      workModeFa: 'تمام وقت · هیبریدی',
      workModeEn: 'Hybrid · Full-time',
      descriptionFa: 'طراحی مدارات الکترونیک قدرت، سیستم‌های مدیریت باتری (BMS) و درایورهای موتورهای براشلس صنعتی.',
      descriptionEn: 'Engineered power electronics circuitry, high-voltage battery management systems (BMS), and brushless motor drivers.',
      achievementsFa: [
        'طراحی سیستم مدیریت باتری هوشمند (BMS) با قابلیت پشتیبانی از پک‌های ۴۸ ولت ۱۰۰ آمپر برای خودروهای برقی سبک',
        'پیاده‌سازی الگوریتم‌های تخمین حالت شارژ (SOC) و سلامت باتری (SOH) با دقت بالای ۹۸ درصد',
        'طراحی بردهای ۴ لایه با مس ضخیم و هیت‌سینک سفارشی جهت دفع حرارت بهینه ماسفت‌ها',
        'پیاده‌سازی درایور پروتکل ارتباطی ایزوله CAN 2.0B و RS-485 Modbus با پایداری در محیط‌های پرنویز'
      ],
      achievementsEn: [
        'Engineered 48V 100A active balancing BMS for light electric vehicles',
        'Implemented state-of-charge (SOC) and state-of-health (SOH) algorithms with >98% accuracy',
        'Designed 4oz heavy-copper 4-layer PCBs with integrated thermal relief heatsinks',
        'Built noise-immune CAN 2.0B & Modbus RS485 communication firmware for electric drivetrains'
      ],
      skillsUsed: ['KiCad EDA', 'STM32G4', 'Active BMS', 'TI AFE', 'C++', 'Modbus RS485', 'Power MOSFETs'],
      projectsLinked: ['Smart BMS 16S 48V', 'BLDC Inverter 1kW']
    },
    {
      id: 'exp-3',
      roleFa: 'مهندس الکترونیک و طراح بردهای آزمایشگاهی',
      roleEn: 'Junior Hardware & Electronics Engineer',
      companyFa: 'پژوهشکده الکترونیک و سیستم‌های دیجیتال دانشگاه',
      companyEn: 'Digital Systems & Electronics Research Lab',
      companyLogo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80',
      companyInitials: 'DSR',
      companyColor: '#6366f1',
      startDateFa: 'مهر ۱۳۹۵',
      startDateEn: 'Oct 2016',
      endDateFa: 'فروردین ۱۳۹۷',
      endDateEn: 'Apr 2018',
      periodFa: 'مهر ۱۳۹۵ - فروردین ۱۳۹۷ · ۱ سال و ۷ ماه',
      periodEn: 'Oct 2016 - Apr 2018 · 1 yr 7 mos',
      durationFa: '۱ سال و ۷ ماه',
      durationEn: '1 yr 7 mos',
      sortDate: '2016-10-01',
      locationFa: 'تهران، دانشکده برق',
      locationEn: 'Tehran, EE Department',
      typeFa: 'پاره وقت / پروژه‌ای',
      typeEn: 'Part-time / Project-based',
      workModeFa: 'حضوری · پروژه‌ای',
      workModeEn: 'On-site · Project-based',
      descriptionFa: 'طراحی بردهای واسط سنسور، مدولاسیون سیگنال‌های راداری با FPGA Artix-7 و برنامه‌نویسی میکروکنترلرهای ARM.',
      descriptionEn: 'Design of high-speed sensor interface boards, radar signal modulation with FPGA Artix-7, and ARM firmware.',
      achievementsFa: [
        'طراحی برد داده‌برداری ۱۶ بیتی با نرخ ۱۲۵ مگاسمپل بر ثانیه با استفاده از تراشه FPGA Xilinx Artix-7',
        'توسعه ماژول ارسال داده روی فیبر نوری پرسرعت با ترنسیورهای SFP+',
        'نگارش مستندات فنی و مقالات علمی پیرامون کنترل امپدانس در بردهای چندلایه'
      ],
      achievementsEn: [
        'Designed 16-bit 125MSPS data acquisition board powered by Xilinx Artix-7 FPGA',
        'Developed high-speed fiber-optic data transmission module with SFP+ transceivers',
        'Authored technical papers on impedance control and signal integrity in multi-layer PCBs'
      ],
      skillsUsed: ['Xilinx Artix-7', 'VHDL', 'High-Speed ADC', 'Altium Designer', 'Fiber Optic SFP+', 'C/C++'],
      projectsLinked: ['FPGA DSP Board', 'FC-F405 Nano']
    }
  ],

  education: [
    {
      id: 'edu-1',
      degreeFa: 'کارشناسی ارشد مهندسی برق - گرایش سیستم‌های الکترونیک دیجیتال',
      degreeEn: 'M.Sc. in Electrical Engineering - Digital Electronic Systems',
      universityFa: 'دانشگاه صنعتی شریف / امیرکبیر',
      universityEn: 'Sharif University of Technology',
      yearFa: '۱۳۹۵ - ۱۳۹۷',
      yearEn: '2016 - 2018',
      gpaFa: 'معدل: ۱۸.۴۵ (رتبه ممتاز)',
      gpaEn: 'GPA: 3.9/4.0 (Top Honors)',
      thesisFa: 'طراحی و پیاده‌سازی سخت‌افزار شتاب‌دهنده بلادرنگ داده‌برداری پرسرعت مبتنی بر FPGA Artix-7 و تبادل داده با فیبر نوری',
      thesisEn: 'Design and implementation of real-time FPGA Artix-7 high-speed data acquisition hardware with fiber-optic link'
    },
    {
      id: 'edu-2',
      degreeFa: 'کارشناسی مهندسی برق - گرایش الکترونیک',
      degreeEn: 'B.Sc. in Electrical Engineering - Electronics',
      universityFa: 'دانشگاه سراسری تهران',
      universityEn: 'University of Tehran',
      yearFa: '۱۳۹۱ - ۱۳۹۵',
      yearEn: '2012 - 2016',
      gpaFa: 'معدل: ۱۷.۸۰',
      gpaEn: 'GPA: 3.75/4.0',
      thesisFa: 'طراحی و ساخت منبع تغذیه سوئیچینگ ایزوله با بازدهی بالا و مدار کنترل آنالوگ',
      thesisEn: 'Design and fabrication of high-efficiency isolated switching power supply with analog feedback loop'
    }
  ],

  certifications: [
    {
      id: 'cert-1',
      titleFa: 'گواهینامه بین‌المللی استاندارد مونتاژ الکترونیک IPC-A-610 Class 3',
      titleEn: 'IPC-A-610 Certified IPC Specialist (CIS)',
      issuer: 'IPC Association',
      issuerFa: 'انجمن بین‌المللی IPC',
      issuerEn: 'IPC Association',
      year: '2023',
      credentialId: 'IPC-610-84920'
    },
    {
      id: 'cert-2',
      titleFa: 'دوره پیشرفته طراحی بردهای پرسرعت و صحت سیگنال (High-Speed Signal Integrity)',
      titleEn: 'Advanced High-Speed PCB & Signal Integrity Masterclass',
      issuer: 'Altium Academy & FEDEVEL',
      issuerFa: 'آکادمی آلتیوم و فدول',
      issuerEn: 'Altium Academy & FEDEVEL',
      year: '2022',
      credentialId: 'ALT-SI-9943'
    },
    {
      id: 'cert-3',
      titleFa: 'گواهی تخصصی طراحی سیستم‌های ایمنی خودرویی ISO 26262 ASIL-D',
      titleEn: 'ISO 26262 Functional Safety Automotive Engineer (FSAE)',
      issuer: 'TÜV SÜD Automotive',
      issuerFa: 'موسسه بین‌المللی TÜV SÜD',
      issuerEn: 'TÜV SÜD Automotive Academy',
      year: '2023',
      credentialId: 'TUV-FS-44021'
    }
  ],

  seoSettings: {
    siteTitle: 'مهندس آرش طاهری | رزومه و پورتفولیو مهندسی الکترونیک و طراحی برد PCB',
    siteTitleEn: 'Arash Taheri | Senior Hardware & Embedded Systems Engineer Portfolio',
    metaDescription: 'پورتفولیو و رزومه حرفه‌ای مهندس الکترونیک و امبدد، طراح بردهای پرسرعت صنعتی، سیستم‌های اینترنت اشیا، مقالات تخصصی و فریم‌ورهای بلادرنگ.',
    metaDescriptionEn: 'Professional portfolio and resume of Senior Hardware & Embedded Systems Engineer, specializing in high-speed multi-layer PCB layout, RTOS firmware and industrial IoT.',
    keywords: 'طراحی برد الکترونیک, PCB Design, مهندس سخت افزار, STM32, اینترنت اشیا, برد پرسرعت, مقالات الکترونیک, رزومه مهندسی, Altium Designer, FreeRTOS',
    keywordsEn: 'PCB Design, Hardware Engineer, STM32, Embedded Systems, IoT, High-Speed PCB, Altium Designer, FreeRTOS, Portfolio',
    canonicalUrl: 'https://arashtaheri.dev',
    author: 'آرش طاهری',
    authorEn: 'Arash Taheri',
    ogImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    twitterHandle: '@arashtaheri_hw',
    schemaType: 'Person',
    googleAnalyticsId: 'G-MEASUREMENT_ID',
    allowIndexing: true,
    faviconUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ffcc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect><path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path><line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line></svg>"
  },

  siteConfig: {
    language: 'fa',
    currentTemplateId: 'electro-fade-light',
    primaryColor: '#4f46e5',
    accentColor: '#0891b2',
    fontFamily: 'Vazirmatn',
    darkMode: false,
    showCircuitAnimation: false,
    enablePdfDownload: true,
    customCss: '',
    headerStyle: 'sticky-light',
    // Resume PDF — like the site's «رزومه PDF» (empty = use the built-in PDF generator)
    cvPdfUrl: '',
    footerTextFa: 'تمامی حقوق این وب‌سایت محفوظ است.',
    footerTextEn: 'All rights reserved.',
    faviconUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ffcc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect><path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path><line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line></svg>",
    // Homepage Item Display Limits & Desktop Layouts
    boardsDisplayLimit: 6,
    boardsDesktopRows: 2, // 1 or 2 or 3 rows
    boardsGridColumns: 3, // 2, 3, or 4 columns per row
    articlesDisplayLimit: 6,
    articlesDesktopRows: 2, // 1 or 2 rows
    articlesGridColumns: 3, // 2, 3, or 4 columns per row
  },

  messages: [
    {
      id: 'msg-1',
      name: 'مهندس علیرضا راد',
      email: 'a.rad@techcorp-industrial.com',
      company: 'صنایع الکترونیک راد',
      subject: 'درخواست همکاری در پروژه طراحی برد گیت‌وی صنعتی',
      message: 'با سلام، رزومه و پروژه‌های شما به ویژه برد RT-Gateway را بررسی کردیم. مایل هستیم در خصوص طراحی یک برد کنترلر خط تولید مجهز به پروتکل‌های CAN-FD و اترنت صنعتی جلسه‌ای آنلاین داشته باشیم.',
      date: '۱۴۰۳/۰۵/۱۴ - ۱۰:۳۰',
      read: false,
      starred: true
    }
  ]
};
