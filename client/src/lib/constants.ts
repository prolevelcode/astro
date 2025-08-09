export const ASTROLOGY_PRODUCTS = [
  {
    id: "birth-chart-generator",
    title: "Birth Chart (Kundli) Generator",
    description: "Complete Vedic birth chart with detailed planetary positions, houses, and life predictions",
    fullDescription: "Generate your complete Vedic birth chart (Kundli) with detailed planetary positions, house analysis, and comprehensive life predictions. This ancient system reveals your cosmic blueprint and provides insights into your personality, destiny, and life path based on precise astronomical calculations.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/birth-chart",
    formType: "standard",
    features: [
      "Complete birth chart visualization",
      "Planetary positions and aspects",
      "House-wise detailed analysis",
      "Dasha periods and predictions",
      "Instant PDF download with charts"
    ]
  },
  {
    id: "kundli-matching",
    title: "Kundli Matching (Marriage Compatibility)",
    description: "Traditional Guna Milan compatibility analysis for marriage decisions with detailed scoring",
    fullDescription: "Traditional Vedic Kundli matching using the authentic Guna Milan system. Analyze compatibility between partners based on 36 gunas, planetary positions, and astrological factors. Get comprehensive insights into relationship harmony, potential challenges, and marriage timing recommendations.",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/match-making",
    formType: "couple",
    features: [
      "36-point Guna Milan analysis",
      "Compatibility percentage score",
      "Dosha analysis and remedies",
      "Marriage timing predictions",
      "Detailed relationship insights"
    ]
  },
  {
    id: "daily-horoscope",
    title: "Personalized Daily Horoscope",
    description: "Daily astrological predictions based on your birth details and current planetary transits",
    fullDescription: "Get personalized daily horoscope predictions based on your exact birth details and current planetary transits. Unlike generic sun-sign horoscopes, this provides accurate daily guidance tailored to your unique astrological profile for career, relationships, health, and finances.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/daily-horoscope",
    formType: "simple",
    features: [
      "Personalized daily predictions",
      "Career and finance guidance",
      "Relationship insights",
      "Health and wellness tips",
      "Lucky colors and numbers"
    ]
  },
  {
    id: "numerology-report",
    title: "Complete Numerology Report",
    description: "Comprehensive numerology analysis including life path, destiny, and personality numbers",
    fullDescription: "Discover the hidden meanings in your name and birth date through comprehensive numerology analysis. Calculate your life path number, destiny number, soul urge number, and personality number to understand your cosmic vibration and life purpose according to ancient numerical wisdom.",
    image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "numerology/life-path-number",
    formType: "name-dob",
    features: [
      "Life path number calculation",
      "Destiny and soul urge numbers",
      "Personality traits analysis",
      "Career and relationship guidance",
      "Lucky numbers and dates"
    ]
  },
  {
    id: "mangal-dosha-check",
    title: "Mangal Dosha Analysis",
    description: "Complete Manglik dosha detection with severity analysis and effective remedies",
    fullDescription: "Comprehensive Mangal Dosha (Manglik) analysis to determine the presence and severity of Mars-related doshas in your birth chart. Get detailed insights into how this dosha affects marriage prospects, relationships, and life events, along with proven Vedic remedies and solutions.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/mangal-dosha",
    formType: "standard",
    features: [
      "Manglik dosha detection",
      "Dosha severity analysis",
      "Marriage compatibility impact",
      "Effective remedial measures",
      "Gemstone recommendations"
    ]
  },
  {
    id: "sade-sati-analysis",
    title: "Sade-Sati Period Analysis",
    description: "Detailed Saturn transit analysis with timing, effects, and remedies for the 7.5-year cycle",
    fullDescription: "Comprehensive analysis of your Sade-Sati period - the 7.5-year Saturn transit cycle that significantly impacts life events. Understand the timing, phases, and effects of this important astrological period, along with specific remedies to minimize challenges and maximize growth opportunities.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/sade-sati",
    formType: "standard",
    features: [
      "Sade-Sati period timing",
      "Phase-wise effects analysis",
      "Life impact predictions",
      "Remedial measures",
      "Saturn transit guidance"
    ]
  },
  {
    id: "panchang-calculator",
    title: "Daily Panchang Calculator",
    description: "Complete daily Panchang with Tithi, Nakshatra, Yoga, Karana, and auspicious timings",
    fullDescription: "Get comprehensive daily Panchang calculations including Tithi, Nakshatra, Yoga, Karana, Rahukalam, and other essential Vedic time elements. This ancient calendar system helps you choose auspicious timings for important activities and understand the cosmic energies of each day.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "panchang",
    formType: "date-place",
    features: [
      "Complete Panchang elements",
      "Tithi and Nakshatra details",
      "Rahukalam timing",
      "Auspicious time periods",
      "Festival and event information"
    ]
  },
  {
    id: "kaal-sarpa-dosha",
    title: "Kaal Sarpa Dosha Analysis",
    description: "Comprehensive Kaal Sarpa Yoga detection with types, effects, and powerful remedies",
    fullDescription: "Detailed analysis of Kaal Sarpa Dosha in your birth chart - a significant astrological condition formed when all planets are hemmed between Rahu and Ketu. Understand the type, intensity, and life effects of this yoga, along with specific remedies and timing for resolution.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/kaalsarpa-dosha",
    formType: "standard",
    features: [
      "Kaal Sarpa type identification",
      "Dosha intensity analysis",
      "Life area effects",
      "Remedial puja suggestions",
      "Timing for relief"
    ]
  },
  {
    id: "muhurat-finder",
    title: "Auspicious Time Finder (Muhurat)",
    description: "Find the most auspicious times for important events like marriage, travel, and business",
    fullDescription: "Discover the most auspicious timings (Muhurat) for important life events using authentic Vedic calculations. Whether planning a marriage, starting a business, buying property, or traveling, get precise timing recommendations based on planetary positions and Panchang elements.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 50,
    originalPrice: 150,
    apiEndpoint: "horoscope/muhurat",
    formType: "date-range",
    features: [
      "Marriage muhurat timing",
      "Business launch timing",
      "Travel and journey dates",
      "Property purchase timing",
      "Festival celebration timing"
    ]
  }
];
