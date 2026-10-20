/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trabzon Doğasından İlham Alan Renk Paleti (Görsel 2)
        brand: {
          primary: '#0B4F6C',     // Karadeniz Mavisi (Primary)
          hover: '#1E7BB6',       // Kıyı Mavisi (Hover)
          bg: '#D6EAF8',          // Açık Mavi (Background)
          surface: '#E2E8F0',     // Açık Gri
          lightbg: '#F8FAFC',     // Çok Açık Gri
        },
        nature: {
          success: '#10B981',     // Doğa Yeşili
          positive: '#34A853',    // Fındık Yeşili
          olive: '#6B8F71',       // Zeytin Yeşili
        },
        neutral: {
          dark: '#1F2937',        // Koyu Gri (Text)
          medium: '#475569',      // Orta Gri (Secondary Text)
          border: '#94A3B8',      // Gri (Border)
        },
        alert: {
          warning: '#F59E0B',     // Amber
          error: '#EF4444',       // Kırmızı
          accent: '#8B5CF6',      // Mor (Info/Accent)
        }
      }
    },
  },
  plugins: [],
}
