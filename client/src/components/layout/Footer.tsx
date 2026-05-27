import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-midnight pt-16 pb-8 mt-auto">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-headline text-white tracking-tight">UTravel</span>
            </Link>
            <p className="text-body text-white/70">
              Nền tảng đặt phòng khách sạn trực tuyến hàng đầu, giúp bạn tìm kiếm và đặt khách sạn tuyệt vời trên toàn thế giới.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-title text-white">Liên kết nhanh</h3>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-body text-white/70 hover:text-white transition-colors">
                Trang chủ
              </Link>
              <Link to="/hotels" className="text-body text-white/70 hover:text-white transition-colors">
                Khách sạn
              </Link>
              <Link to="/bookings" className="text-body text-white/70 hover:text-white transition-colors">
                Đặt phòng của tôi
              </Link>
              <Link to="/contact" className="text-body text-white/70 hover:text-white transition-colors">
                Liên hệ
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-title text-white">Hỗ trợ</h3>
            <div className="flex flex-col gap-3">
              <Link to="/faq" className="text-body text-white/70 hover:text-white transition-colors">
                Câu hỏi thường gặp
              </Link>
              <Link to="/terms" className="text-body text-white/70 hover:text-white transition-colors">
                Điều khoản dịch vụ
              </Link>
              <Link to="/privacy" className="text-body text-white/70 hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/support" className="text-body text-white/70 hover:text-white transition-colors">
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-title text-white">Liên hệ chúng tôi</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <IconPhone size={16} />
                </div>
                <span className="text-body text-white/70">+84 1234 567 890</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <IconMail size={16} />
                </div>
                <span className="text-body text-white/70">support@utravel.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90">
                  <IconMapPin size={16} />
                </div>
                <span className="text-body text-white/70">Hà Nội, Việt Nam</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <IconBrandFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <IconBrandTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <IconBrandInstagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-label-caps text-white/50">
            © {currentYear} UTravel. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-label-caps text-white/50 hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="text-label-caps text-white/50 hover:text-white transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
