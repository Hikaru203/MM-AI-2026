# 📖 Hướng Dẫn Phát Triển (Development Guide)

Tài liệu này giải thích chi tiết về kiến trúc kỹ thuật và cách hoạt động của hệ thống Memory Money.

## 🏗️ Kiến Trúc Hệ Thống

Dự án được xây dựng theo mô hình **Client-Side Heavy** với Next.js App Router, trong đó hầu hết logic nghiệp vụ và trạng thái được xử lý ở Client để đảm bảo trải nghiệm mượt mà (Animations).

### 1. Quản lý trạng thái (State Management)
Chúng tôi sử dụng **Zustand** (`src/store/useAppStore.ts`) để quản lý:
- Danh sách chi tiêu (Expenses).
- Danh sách ví (Wallets).
- Cài đặt người dùng (Privacy mode, Monthly goal).
- Trạng thái đồng bộ.

### 2. Xử lý AI & OCR
Logic xử lý hình ảnh và trích xuất dữ liệu nằm trong `src/lib/ai.ts` và `src/lib/gemini.ts`:
- Sử dụng mô hình `gemini-1.5-flash` để phân tích hình ảnh.
- Prompt được tối ưu để trả về JSON có cấu trúc (Amount, Category, Location, Mood, Caption).

### 3. Đồng bộ hóa Google Drive
Hệ thống đồng bộ hóa hai chiều:
- **Upload**: Khi thêm chi tiêu mới, hình ảnh được upload lên một thư mục riêng trên Drive, và thông tin chi tiêu được lưu dưới dạng metadata của file hoặc một file JSON riêng biệt.
- **Download/Recovery**: Khi người dùng đăng nhập trên thiết bị mới, hệ thống sẽ quét Drive để khôi phục toàn bộ "ký ức".

## 🛠️ Quy Trình Thêm Tính Năng

1. **Components**: Tạo component mới trong `src/components`. Sử dụng `framer-motion` cho các hiệu ứng xuất hiện.
2. **Logic**: Nếu cần xử lý dữ liệu phức tạp, hãy thêm vào `src/lib`.
3. **Store**: Cập nhật `useAppStore.ts` nếu tính năng cần lưu trữ trạng thái lâu dài.
4. **Pages**: Đăng ký route mới trong `src/app`.

## 🧪 Kiểm Thử

Hiện tại dự án tập trung vào kiểm thử thủ công qua trình duyệt:
- Kiểm tra tính năng OCR với các loại hóa đơn khác nhau.
- Kiểm tra khả năng đồng bộ khi mất kết nối mạng.
- Kiểm tra hiển thị trên thiết bị di động (Mobile First).

## 🆘 Hỗ Trợ

Nếu gặp lỗi liên quan đến API Google:
1. Kiểm tra lại `AUTH_GOOGLE_ID` và `AUTH_GOOGLE_SECRET`.
2. Đảm bảo đã bật **Google Drive API** trong Google Cloud Console.
3. Kiểm tra Scope của NextAuth trong `src/auth.ts`.

---
*Tài liệu này được tự động tạo bởi Antigravity.*
