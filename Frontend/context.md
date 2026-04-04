# Ngữ cảnh giao diện hiện tại

Hiện tại ứng dụng đã có khung giao diện khá đầy đủ cho một app đọc truyện. Luồng cơ bản đang là: mở app -> splash screen -> onboarding -> vào khu vực chính với thanh điều hướng dưới gồm 4 tab là Home, Explore, Book List và Profile.

## 1. Onboarding và điều hướng chính

- Ứng dụng mở đầu bằng splash screen có hiệu ứng đơn giản.
- Sau đó chuyển sang onboarding gồm 3 trang giới thiệu.
- Từ onboarding, người dùng có thể chọn đăng nhập hoặc vào app ở chế độ guest.
- Khi vào app, người dùng thao tác chủ yếu qua bottom navigation 4 tab.

## 2. Các màn hình đã có

### Home

Đây là màn hình trung tâm và đang là phần nhiều tính năng nhất. Hiện đã có:

- khu vực gợi ý và danh sách truyện từ API
- nội dung cập nhật gần đây
- banner/section nổi bật
- hỗ trợ thông báo real-time qua SignalR
- badge thông báo và phản hồi UI khi có truyện/chương mới

### Explore

Màn hình khám phá đã có các chức năng chính để tìm nội dung:

- ô tìm kiếm truyện
- lọc theo thể loại
- chuyển đổi kiểu hiển thị grid/list
- tải thêm dữ liệu khi cuộn
- lấy dữ liệu truyện và genre từ API

### Book List

Đây là khu vực thư viện cá nhân. Hiện đã có:

- phân chia nhóm đang đọc và đã hoàn thành
- tải danh sách truyện đang follow từ API
- tìm kiếm/sắp xếp cơ bản
- reload dữ liệu khi app quay lại foreground

### Profile

Màn hình cá nhân đã hỗ trợ các trạng thái và cài đặt cơ bản:

- hiển thị guest mode hoặc thông tin user đã đăng nhập
- avatar, tên, email
- upload/chỉnh avatar
- một số cài đặt như thông báo, nhắc đọc, cỡ chữ
- theme sáng/tối và đổi ngôn ngữ đã có nền tảng xử lý ở cấp app

### Book Details

Màn hình chi tiết truyện đã có:

- lấy dữ liệu chi tiết truyện
- follow/unfollow
- hiển thị danh sách chương
- lưu trạng thái chương đã đọc
- điều hướng sang màn hình đọc chương

### Chapter Reader

Màn hình đọc chương đã có trải nghiệm đọc cơ bản:

- đọc ảnh theo chiều dọc
- chạm để hiện/ẩn thanh điều khiển
- chuyển chương trước/sau
- chọn chương từ bottom sheet

## 3. Tình trạng UI/UX hiện tại

Về mặt giao diện, app đã có nền khá rõ ràng:

- có light theme và dark theme
- dùng màu thương hiệu, gradient, card bo góc, button hiện đại
- có hỗ trợ đa ngôn ngữ
- đã có nhiều widget dùng lại cho card truyện, search bar, genre chips, loading, bottom nav

## 4. Nhận định ngắn

Tóm lại, giao diện hiện tại không còn ở mức demo màn hình rời rạc mà đã thành một bộ khung app đọc truyện tương đối hoàn chỉnh. Phần mạnh nhất hiện giờ là luồng duyệt truyện -> xem chi tiết -> đọc chương, kèm theo khám phá nội dung, thư viện cá nhân và hồ sơ người dùng. Một số chỗ vẫn còn xen giữa dữ liệu mock và dữ liệu API thật, nhưng tổng thể structure UI đã khá đầy đủ để tiếp tục hoàn thiện sản phẩm.
