export type AboutValue = {
  title: string;
  text: string;
};

export type AboutTimelineItem = {
  year: string;
  title: string;
  text: string;
};

export type AboutHighlight = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  alt: string;
};

export type AboutContent = {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  philosophy: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  values: AboutValue[];
  timeline: AboutTimelineItem[];
  highlights: AboutHighlight[];
};

export type Office = {
  city: string;
  address: string;
  phone: string;
  hours: string;
};

export type ContactContent = {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  officeSection: {
    eyebrow: string;
    title: string;
  };
  offices: Office[];
  form: {
    title: string;
    subtitle: string;
  };
  inquiryOptions: { value: string; label: string }[];
  direct: {
    eyebrow: string;
    title: string;
    email: string;
    phoneDisplay: string;
    phoneHref: string;
  };
};

export const aboutContent: AboutContent = {
  hero: {
    eyebrow: "The House",
    title: "About QUARTZ",
    lead: "QUARTZ is a modern luxury house built around restraint, material precision, and digital craft. We design for those who prefer presence over performance.",
  },
  philosophy: {
    eyebrow: "Philosophy",
    title: "Less noise, more weight.",
    paragraphs: [
      "Luxury is not decoration. It is clarity. Every QUARTZ object is designed to have exactly the right amount of detail -- never more, never less. We believe that craft should be felt, not explained.",
      "From brushed titanium bezels to cashmere weave overcoats, our materials are selected for tactile depth and long-term resilience. The result is objects that look better in year five than they did on day one.",
    ],
  },
  values: [
    { title: "Material Obsession", text: "We source only the top 2% of global tanneries, weavers, and metal foundries. Every material is stress-tested and certified before entering the QUARTZ supply chain." },
    { title: "Digital Craft", text: "Our interface is not decoration. It is an extension of the product. Fast load, surgical precision, and no visual noise define the QUARTZ digital experience." },
    { title: "Quiet Confidence", text: "We do not chase logos or trend cycles. QUARTZ is built around restraint, proportion, and objects that grow more beautiful with time." },
  ],
  timeline: [
    { year: "2021", title: "The Seed", text: "QUARTZ begins as a design thesis on luxury, restraint, and modern consumer behavior." },
    { year: "2022", title: "First Atelier", text: "The first studio opens. 34 hand-numbered pieces launch the Midnight Atelier collection." },
    { year: "2024", title: "Digital Flagship", text: "QUARTZ becomes a digital-first house. The crystal interface and 3D atelier go live worldwide." },
    { year: "2026", title: "Global Presence", text: "The platform now serves collectors across 28 countries with insured, carbon-neutral delivery." },
  ],
  highlights: [
    {
      eyebrow: "In Person",
      title: "The Atelier Visit",
      text: "Private fittings and collection walkthroughs are available by appointment in our Tokyo, London, and Dubai studios.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85",
      alt: "QUARTZ Atelier",
    },
    {
      eyebrow: "Behind the Object",
      title: "Material Archive",
      text: "Every QUARTZ piece ships with a material passport documenting origin, craft partner, and care instructions.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
      alt: "QUARTZ Materials",
    },
  ],
};

export const contactContent: ContactContent = {
  hero: {
    eyebrow: "Get in Touch",
    title: "Contact",
    lead: "Whether you are placing an order, requesting a private fitting, or exploring a partnership, the QUARTZ team responds within 24 hours.",
  },
  officeSection: {
    eyebrow: "Offices & Ateliers",
    title: "Visit a QUARTZ location.",
  },
  offices: [
    { city: "Tokyo", address: "2-4-1 Roppongi, Minato-ku, Tokyo 106-0032", phone: "+81 3-6434-0001", hours: "Mon-Sat 10:00-19:00" },
    { city: "London", address: "14 Savile Row, Mayfair, London W1S 3PR", phone: "+44 20 7946 0123", hours: "Mon-Sat 10:00-18:00" },
    { city: "Dubai", address: "DIFC Gate Village 5, Dubai, UAE", phone: "+971 4 330 0088", hours: "Sun-Fri 10:00-20:00" },
  ],
  form: {
    title: "Send a Message",
    subtitle: "We reply within 24 hours on business days.",
  },
  inquiryOptions: [
    { value: "", label: "Select inquiry type" },
    { value: "order", label: "Order & Shipping" },
    { value: "return", label: "Returns & Exchanges" },
    { value: "fitting", label: "Private Fitting" },
    { value: "press", label: "Press & Partnerships" },
    { value: "general", label: "General Inquiry" },
  ],
  direct: {
    eyebrow: "Direct Access",
    title: "Prefer to reach us instantly?",
    email: "hello@quartz-atelier.com",
    phoneDisplay: "+44 20 7946 0123",
    phoneHref: "+442079460123",
  },
};
