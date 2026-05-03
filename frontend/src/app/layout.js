import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title:       'ToiletMap Thailand 🚽 – หาห้องน้ำทั่วไทย',
  description: 'แอปค้นหาห้องน้ำสาธารณะทั่วประเทศไทย พร้อมรีวิวและคะแนน',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
