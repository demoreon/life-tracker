const CONFIG = {
  name: "Champion",
  year: 2026,
  weeklyReviewDay: 0, // 0=Sunday, 1=Monday, etc.

  timeBlocks: [
    { name: "Morning Ritual", icon: "☀️", range: "5:30 – 8:30 AM" },
    { name: "Focus Block", icon: "⚡", range: "8:30 AM – 12:30 PM" },
    { name: "Afternoon", icon: "🌤️", range: "12:30 – 6:00 PM" },
    { name: "Evening", icon: "🌅", range: "6:00 – 9:00 PM" },
    { name: "Wind Down", icon: "🌙", range: "9:00 – 11:00 PM" }
  ],

  categories: [
    { name: "Financial",        color: "#f0a040", icon: "💰" },
    { name: "Career",           color: "#e06040", icon: "💼" },
    { name: "IT & Cyber",       color: "#40b0e0", icon: "💻" },
    { name: "Health",           color: "#4ecb71", icon: "🏃" },
    { name: "Self Development", color: "#7c6ff7", icon: "📚" },
    { name: "Family",           color: "#e07090", icon: "👨‍👩‍👧" },
    { name: "Spirituality",     color: "#c090f0", icon: "🧘" }
  ],

  // cat = category index (0-6)
  // time = timeBlock index (0-4)
  // weekly = only shows on weeklyReviewDay
  habits: [
    // ── Financial ──
    { name: "Zero impulsive spend",       cat: 0, time: 2, est: "—" },
    { name: "Stay true to weekly budget",  cat: 0, time: 2, est: "—" },
    { name: "Finance podcast/news 15m",    cat: 0, time: 1, est: "15m" },
    { name: "30% savings goal check",      cat: 0, time: 1, est: "5m",  weekly: true },
    { name: "Review subscriptions",        cat: 0, time: 1, est: "10m", weekly: true },
    { name: "Review investment portfolios",cat: 0, time: 1, est: "15m", weekly: true },

    // ── Career ──
    { name: "Create next-day task schedule", cat: 1, time: 4, est: "10m" },
    { name: "Complete all work tasks",       cat: 1, time: 2, est: "—" },
    { name: "Reassess KPIs & optimise",      cat: 1, time: 2, est: "15m", weekly: true },

    // ── IT & Cyber ──
    { name: "Operations Support",       cat: 2, time: 1, est: "30m" },
    { name: "Review AI & IT trends",  cat: 2, time: 1, est: "45m" },
    { name: "Control Surface",  cat: 2, time: 1, est: "30m" },
    { name: "Review Governance",  cat: 2, time: 1, est: "30m" },
    { name: "Risk Management", cat: 2, time: 2, est: "30m" },

    // ── Health ──
    { name: "Push up / Exercise",   cat: 3, time: 0, est: "20m" },
    { name: "Meditate",             cat: 3, time: 0, est: "10m" },
    { name: "Sleep 7-8h",           cat: 3, time: 4, est: "—" },
    { name: "Hydrate 2L",           cat: 3, time: 2, est: "—" },
    { name: "Digital detox",        cat: 3, time: 4, est: "—" },
    { name: "Breakfast",            cat: 3, time: 0, est: "15m" },
    { name: "Walk at least 10K steps", cat: 3, time: 3, est: "45m" },
    { name: "Eat fruit/vegetables", cat: 3, time: 2, est: "—" },
    { name: "Breathing exercise",   cat: 3, time: 0, est: "5m" },

    // ── Self Development ──
    { name: "Read at least 5 pages",     cat: 4, time: 3, est: "15m" },
    { name: "Write substack chapter",     cat: 4, time: 2, est: "30m" },
    { name: "Listen to podcasts",         cat: 4, time: 3, est: "15m" },
    { name: "Inbox zero",                 cat: 4, time: 1, est: "15m" },
    { name: "Music study 30m",            cat: 4, time: 3, est: "30m" },
    { name: "French",                     cat: 4, time: 1, est: "15m" },
    { name: "Affirmations",               cat: 4, time: 0, est: "5m" },

    // ── Family ──
    { name: "Quality time (no phones)", cat: 5, time: 3, est: "30m" },
    { name: "Call/check on a loved one", cat: 5, time: 3, est: "10m" },

    // ── Spirituality & Stoicism ──
    { name: "Daily prayer",             cat: 6, time: 0, est: "10m" },
    { name: "10 mins silence",          cat: 6, time: 0, est: "10m" },
    { name: "Voluntary hardship",       cat: 6, time: 0, est: "5m" },
    { name: "Evening reflection",       cat: 6, time: 4, est: "10m" },
    { name: "Read a stoic passage",     cat: 6, time: 0, est: "5m" },
    { name: "Gratitude",                cat: 6, time: 4, est: "5m" },
    { name: "Random act of kindness",   cat: 6, time: 3, est: "—" },
    { name: "Memento Mori",             cat: 6, time: 0, est: "2m" },
  ]
};