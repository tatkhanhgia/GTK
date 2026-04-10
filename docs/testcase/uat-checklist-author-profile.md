# UAT Checklist: Author Profile

## Mục tiêu

Checklist này dùng để test nhanh trang `Author Profile` theo góc nhìn content editor/admin user.

URL test:

- `http://localhost:3000/admin/globals/author-profile`

## Thông tin test

- Tester:
- Ngày test:
- Môi trường:
- Tài khoản:
- Kết quả chung: `Pass / Fail / Blocked`

## 1. Truy cập và đăng nhập

- [ ] Mở đúng URL `Author Profile`
- [ ] Nếu chưa đăng nhập, hệ thống hiển thị màn login
- [ ] Đăng nhập thành công bằng tài khoản hợp lệ
- [ ] Sau login, hệ thống vào đúng trang `Author Profile`
- [ ] Sidebar highlight đúng `Globals > Author Profile`
- [ ] Breadcrumb/tiêu đề trang hiển thị đúng `Author Profile`

## 2. Tải giao diện ban đầu

- [ ] Trang load không bị trắng, vỡ layout, hoặc treo
- [ ] Nút `Save` xuất hiện đúng vị trí
- [ ] Tab `Edit` và `API` hiển thị
- [ ] Mô tả trang hiển thị đúng mục đích sử dụng
- [ ] Không có text sai ngữ cảnh rõ ràng
- [ ] Không có field quan trọng bị ẩn bất thường

## 3. Tab `Danh tính`

- [ ] Mở được tab `Danh tính`
- [ ] Hiển thị các field chính:
  - [ ] `Name`
  - [ ] `Title`
  - [ ] `Years Of Experience`
  - [ ] `Projects Completed`
  - [ ] `Avatar`
  - [ ] `Bio`
- [ ] Dữ liệu hiện tại được load đúng
- [ ] Có thể nhận biết field nào editable, field nào read-only
- [ ] Upload avatar có CTA rõ ràng
- [ ] Sửa thử `Title`
- [ ] Sửa thử `Bio`

## 4. Tab `Nội dung`

- [ ] Mở được tab `Nội dung`
- [ ] Hiển thị các nhóm nội dung chính:
  - [ ] `heroSentence`
  - [ ] `buildingNow`
  - [ ] `principles`
  - [ ] `selectedWriting`
  - [ ] `timelineContext`
  - [ ] `contactCtaText`
- [ ] Có thể hiểu từng field dùng để làm gì
- [ ] Sửa thử `heroSentence`
- [ ] Sửa thử `buildingNow`
- [ ] Kiểm tra block `principles` có hiển thị đầy đủ từng item
- [ ] Kiểm tra `selectedWriting` có preview đủ rõ bài viết đã chọn

## 5. Tab `Kỹ năng & Lịch sử`

- [ ] Mở được tab `Kỹ năng & Lịch sử`
- [ ] Hiển thị được nhóm `skills`
- [ ] Hiển thị được `timeline`
- [ ] Mỗi nhóm skill có tên category rõ ràng
- [ ] Mỗi item timeline hiển thị đủ thông tin để editor hiểu
- [ ] Có thể thêm/sửa/xóa skill item
- [ ] Có thể thêm/sửa/xóa timeline item
- [ ] Không có item timeline thiếu field bắt buộc mà UI không báo rõ

## 6. Tab `Liên hệ`

- [ ] Mở được tab `Liên hệ`
- [ ] Hiển thị `socialLinks`
- [ ] Hiển thị `contactEmail`
- [ ] Sửa thử một social URL
- [ ] Sửa thử email liên hệ
- [ ] Nếu nhập URL sai định dạng, hệ thống báo lỗi dễ hiểu

## 7. Tab `SEO`

- [ ] Mở được tab `SEO`
- [ ] Hiển thị `metaTitle`
- [ ] Hiển thị `metaDescription`
- [ ] Có thể sửa `metaTitle`
- [ ] Có thể sửa `metaDescription`
- [ ] Nếu có helper text/giới hạn ký tự, chúng hiển thị rõ

## 8. Lưu thay đổi

- [ ] Sau khi sửa ít nhất 1 field, nút `Save` chuyển sang trạng thái khả dụng
- [ ] Bấm `Save` không bị treo
- [ ] Nếu save thành công, có thông báo thành công rõ ràng
- [ ] Nếu save thất bại, có thông báo lỗi rõ ràng
- [ ] Lỗi hiển thị gần đúng field gây lỗi
- [ ] Nếu lỗi nằm ở tab khác, hệ thống có chỉ ra tab chứa lỗi
- [ ] Không có trường hợp sửa 1 field nhưng bị chặn bởi lỗi mơ hồ ở nơi khác

## 9. Kiểm tra dữ liệu sau lưu

- [ ] Refresh trang, dữ liệu vừa sửa vẫn còn
- [ ] Mở tab `API`, dữ liệu phản ánh đúng thay đổi
- [ ] Locale đang dùng khớp với dữ liệu hiển thị
- [ ] Không có field bị mất dữ liệu sau khi lưu

## 10. Trải nghiệm tổng thể

- [ ] Giao diện đủ rõ ràng cho content editor
- [ ] Ngôn ngữ hiển thị nhất quán
- [ ] Không có thao tác nào gây bối rối lớn
- [ ] User hiểu mình đang sửa nội dung gì và ảnh hưởng ở đâu
- [ ] Luồng chỉnh sửa tạo cảm giác đáng tin cậy

## 11. Ghi nhận lỗi

### Blocker

- 

### High

- 

### Medium

- 

### Low

- 

## 12. Kết luận test

- Tổng quan:
- Điểm ổn:
- Điểm chưa ổn:
- Có thể bàn giao cho content editor sử dụng chưa: `Có / Không`

## Câu hỏi chưa resolved

- 
