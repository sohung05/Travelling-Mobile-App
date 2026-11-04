# 📋 KẾ HOẠCH PHÂN CHIA NHIỆM VỤ & LỘ TRÌNH COMMIT GIT (2 NGƯỜI)
### Phiên bản 2.0 (Kiến trúc chuẩn — Đảm bảo 100% không lỗi biên dịch ở từng Commit)

> **Dự án:** Travelling-App (React Native + Spring Boot + MongoDB + Redis + AI Chatbot)  
> **Phương pháp phân chia:** Phân chia theo chiều dọc (**Vertical Slicing**) — Mỗi thành viên phụ trách trọn vẹn phân hệ từ **Backend $\leftrightarrow$ Frontend** theo đúng thứ tự phụ thuộc kiến trúc (Dependency Flow) để tránh xung đột mã nguồn và tuyệt đối không bao giờ bị lỗi biên dịch (`BUILD SUCCESS` ở mọi commit).

---

## 👥 BẢNG TỔNG QUAN PHÂN VAI & TRỌNG SỐ

| Thành viên | Vai trò phụ trách | Phân hệ nghiệp vụ chính | Tỷ trọng độ khó |
| :--- | :--- | :--- | :---: |
| **NGƯỜI 1 (Bạn)**<br>*(Lead / Core Dev)* | **Backend Architecture & Core Booking/Payment Engine & AI** | • Kiến trúc Backend, Spring Security, Response Wrapper, Redis Caching<br>• Luồng Đặt tour & Tính toán chi phí, ngày đi/về (Booking Engine)<br>• Luồng Thanh toán (Payment) & Đơn hàng<br>• Quản lý trạng thái chuyến đi & Lập lịch thông báo tự động (Scheduler)<br>• Tích hợp Trợ lý ảo AI Chatbot (LangChain RAG) | **~55% - 60%**<br>*(Khó nhất: State Machine, Transaction, Scheduler & AI)* |
| **NGƯỜI 2 (Bạn đồng hành)**<br>*(Feature / UI-UX Dev)* | **Frontend UI/UX & Account/Destination & Review** | • Xác thực tài khoản (Auth) & Sinh trắc học & Thông tin cá nhân<br>• Khám phá, Tìm kiếm & Bộ lọc điểm đến đa tiêu chí<br>• Màn hình chi tiết tour (Parallax, Gallery)<br>• Phân hệ Thông báo nền (Notification Base)<br>• Hệ thống Đánh giá (Reviews) & Yêu thích (Favorites) | **~40% - 45%**<br>*(Độ khó vừa: Tập trung UI/UX, animations, API CRUD)* |

---

## 🧠 NGUYÊN TẮC VÀNG VỀ THỨ TỰ PHỤ THUỘC (DEPENDENCY PRECEDENCE)

Trong Java Spring Boot, các class có mối liên kết chặt chẽ về mặt kiểu dữ liệu (Static Typing):
1. `Booking` có liên kết `@DBRef` tới `Destination`. Do đó, **Destination PHẢI CÓ TRƯỚC Booking**.
2. `BookingService` tiêm phụ thuộc (inject) `DestinationRepository` và `NotificationService`. Do đó, **DestinationRepository và NotificationService PHẢI CÓ TRƯỚC BookingService**.
3. `BookingController` và `PaymentController` gọi `DestinationService` và sử dụng `ApiResponse<T>`, `BookingRequest`, `ProcessPaymentRequest`. Do đó, **ApiResponse và các DTO PHẢI ĐI KÈM với Controller**.
4. `Review` và `Favorite` liên kết với `User` và `Destination`. Do đó, **User và Destination PHẢI CÓ TRƯỚC Review**.

👉 **Quy tắc bất biến:** Phân hệ **Nền tảng $\rightarrow$ Auth/User $\rightarrow$ Destination & Notification** phải được đưa vào trước, sau đó mới tới **Booking & Payment**, rồi đến **Review & Community**, và cuối cùng là **AI Chatbot**.

---

## 📂 CHI TIẾT DANH SÁCH FILE PHÂN CHIA CHO TỪNG NGƯỜI

### 🔵 NGƯỜI 1 — PHỤ TRÁCH NỀN TẢNG, CORE ENGINE (BOOKING & PAYMENT) & AI CHATBOT

#### 1. Backend (`backend` / `Travelling_App_BE`):
* **Kiến trúc nền tảng & Cấu hình:**
  * `src/main/resources/application.yml` (Cấu hình MongoDB Atlas, Redis pool, JWT, external APIs)
  * `pom.xml` (Quản lý toàn bộ dependencies Spring Boot, Security, Redis, MongoDB, Lombok, JWT)
  * `TravellingAppBeApplication.java` & `ServletInitializer.java` (Khởi chạy ứng dụng)
  * `config/SecurityConfig.java` (Cấu hình Spring Security, CORS filter, PasswordEncoder)
  * `config/CacheConfig.java` (Cấu hình Redis Cache Manager & TTL)
  * `dto/response/ApiResponse.java` (Lớp bao bọc dữ liệu chuẩn hóa API response cho toàn bộ hệ thống)
* **Phân hệ Đặt Tour (Core Booking Engine):**
  * `entity/Booking.java` (Model đơn đặt tour, DBRef destination, trạng thái chuyến đi)
  * `repository/BookingRepository.java` (Truy vấn booking theo userId, status, travelDate)
  * `dto/request/BookingRequest.java` (DTO tiếp nhận dữ liệu đặt tour từ client)
  * `service/BookingService.java` (Xử lý logic đặt tour, tính toán số ngày, parse DBRef, cancel tour — *File lớn & phức tạp nhất*)
  * `controller/BookingController.java` (REST API tạo booking, cập nhật trạng thái, hủy tour)
* **Phân hệ Thanh toán & Lập lịch thông báo (Payment & Scheduler):**
  * `dto/request/ProcessPaymentRequest.java` (DTO thông tin thanh toán & thẻ/ví)
  * `dto/response/ProcessPaymentResponse.java` (DTO kết quả giao dịch thanh toán)
  * `service/PaymentService.java` (Mô phỏng xử lý thanh toán, sinh mã transaction)
  * `controller/PaymentController.java` (REST API tiếp nhận xử lý thanh toán)
  * `service/NotificationSchedulerService.java` (Tự động hóa quét lịch trình và cảnh báo sắp khởi hành)
  * `controller/NotificationSchedulerController.java` (REST API kích hoạt quét lịch trình thủ công)
* **Unit Testing:**
  * `src/test/java/.../service/BookingServiceTest.java`
  * `src/test/java/.../service/PaymentServiceTest.java`

#### 2. Frontend (`frontend` / `font-end`):
* **Cấu hình & Điều hướng cốt lõi:**
  * `src/navigation/AppNavigator.tsx` (Cấu hình Stack & Bottom Tab Navigation)
  * `src/api/config.ts` (HttpClient Axios/Fetch, cấu hình IP/URL, timeout)
  * `src/types/index.ts` (Khai báo interface Booking, ChatMessage, RootStackParamList)
* **Luồng Đặt tour & Thanh toán:**
  * `src/screens/TourServicesScreen.tsx` (Chọn gói dịch vụ, dịch vụ bổ sung)
  * `src/screens/ServicePackageDetailScreen.tsx` (Chi tiết gói dịch vụ)
  * `src/screens/OrderDetailsScreen.tsx` (Xem lại thông tin đơn đặt, số lượng khách, tính ngày đi/về)
  * `src/screens/PaymentScreen.tsx` (Màn hình chọn phương thức thanh toán)
  * `src/screens/PaymentMethodsScreen.tsx` & `PaymentResultScreen.tsx` & `PaymentSuccessScreen.tsx`
  * `src/screens/BookingsScreen.tsx` & `BookingDetailScreen.tsx` (Quản lý các chuyến đi Sắp tới/Đã xong/Đã hủy)
  * `src/api/bookingService.ts` (Giao tiếp API Booking & Payment)
* **Tính năng Trợ lý ảo AI Chatbot (LangChain RAG):**
  * `src/api/chatbotService.ts` (Kết nối AI LangChain & Knowledge Base dự phòng)
  * `src/components/ChatbotFAB.tsx` (Nút bấm nổi tròn Robot 3D)
  * `src/screens/ChatBotScreen.tsx` (Màn hình chat trợ lý du lịch thông minh)

---

### 🟢 NGƯỜI 2 — PHỤ TRÁCH UI/UX, AUTH, KHÁM PHÁ ĐIỂM ĐẾN & REVIEW

#### 1. Backend (`backend` / `Travelling_App_BE`):
* **Phân hệ Người dùng & Xác thực (Auth):**
  * `entity/User.java` (Model thông tin người dùng, preferences)
  * `repository/UserRepository.java` (Truy vấn người dùng theo email, username)
  * `dto/request/LoginRequest.java` & `dto/request/RegisterRequest.java`
  * `dto/response/AuthResponse.java` & `dto/response/ProfileResponse.java`
  * `service/UserService.java` & `controller/AuthController.java` (Đăng ký, đăng nhập JWT, đổi mật khẩu)
* **Phân hệ Điểm đến & Khởi tạo dữ liệu (Destination):**
  * `entity/Location.java` & `entity/Destination.java` (Model điểm đến du lịch, tọa độ, thư viện ảnh)
  * `repository/DestinationRepository.java` (Truy vấn điểm đến theo category, rating, featured)
  * `service/DestinationService.java` & `controller/DestinationController.java` (CRUD điểm đến, tìm kiếm, lọc)
  * `config/DataInitializer.java` (Khởi tạo dữ liệu mẫu các danh lam thắng cảnh)
  * `config/OpenApiConfig.java` (Cấu hình Swagger/OpenAPI tài liệu hóa API)
* **Phân hệ Thông báo nền tảng (Notification Base):**
  * `model/Notification.java` (Entity thông báo trong MongoDB)
  * `repository/NotificationRepository.java`
  * `service/NotificationService.java` & `controller/NotificationController.java` (Tạo, đọc, đánh dấu đã đọc thông báo)
* **Phân hệ Đánh giá & Yêu thích (Review & Favorites):**
  * `entity/Review.java` & `repository/ReviewRepository.java`
  * `dto/request/ReviewRequest.java`
  * `service/ReviewService.java` & `controller/ReviewController.java` (Tính rating trung bình, lưu nhận xét)
  * `entity/Favorite.java` & `repository/FavoriteRepository.java` & `controller/FavoriteController.java`
* **Unit Testing:**
  * `src/test/java/.../service/UserServiceTest.java`
  * `src/test/java/.../service/DestinationServiceTest.java`
  * `src/test/java/.../service/ReviewServiceTest.java`
  * `src/test/java/.../service/NotificationServiceTest.java`

#### 2. Frontend (`frontend` / `font-end`):
* **Khởi tạo UI Theme & Components cơ bản:**
  * `package.json`, `tsconfig.json`, `app.json`, `App.tsx`
  * `src/constants/theme.ts` & `src/constants/images.ts`
  * `src/components/Button.tsx`, `src/components/Header.tsx`
* **Xác thực & Hồ sơ cá nhân:**
  * `src/contexts/AuthContext.tsx` (Quản lý state đăng nhập, lưu token AsyncStorage)
  * `src/api/authService.ts` & `src/api/userService.ts`
  * `src/screens/LoginScreen.tsx` (Đăng nhập, hỗ trợ sinh trắc học)
  * `src/screens/RegisterScreen.tsx` & `RegisterSuccessScreen.tsx`
  * `src/screens/ProfileScreen.tsx`, `PersonalInfoScreen.tsx`, `SecurityScreen.tsx`, `DarkModeScreen.tsx`, `LanguageScreen.tsx`
* **Khám phá & Điểm đến:**
  * `src/components/DestinationCard.tsx`, `CategoryCard.tsx`, `SearchBar.tsx`, `FilterModal.tsx`
  * `src/api/destinationService.ts` & `src/api/cache/destinationHooks.ts`
  * `src/screens/HomeScreen.tsx` (Banner động, danh mục, trending destinations)
  * `src/screens/ExploreScreen.tsx` & `SearchScreen.tsx`
  * `src/screens/DestinationDetailScreen.tsx` (Parallax scroll, thư viện ảnh, tiện ích)
* **Đánh giá, Yêu thích & Trang tĩnh:**
  * `src/api/reviewService.ts`
  * `src/screens/FavoritesScreen.tsx`
  * `src/screens/ReviewsScreen.tsx` & `TourReviewScreen.tsx` (Chấm sao, viết đánh giá tour)
  * `src/screens/AboutUsScreen.tsx`, `SupportScreen.tsx`, `TermsOfServiceScreen.tsx`, `PrivacyPolicyScreen.tsx`

---

## 🚀 KỊCH BẢN COMMIT GIT 6 GIAI ĐOẠN (22 COMMITS CHUẨN XÁC)

> Mỗi commit bên dưới được thiết kế đảm bảo: **Khi vừa commit xong, chạy lệnh build `mvn clean compile` hoặc build React Native sẽ LUÔN THÀNH CÔNG 100%, không bao giờ xuất hiện lỗi đỏ.**

### 🔹 GIAI ĐOẠN 1: NỀN TẢNG HỆ THỐNG & ĐIỀU HƯỚNG CỐT LÕI (SPRINT 1)

#### Commit 1 (Người 1 - BE Lead): Khởi tạo backend, bảo mật & ApiResponse chuẩn
* **Files:**
  * `backend/pom.xml`
  * `backend/src/main/resources/application.yml`
  * `backend/src/main/java/fit/se/travelling_app_be/TravellingAppBeApplication.java`
  * `backend/src/main/java/fit/se/travelling_app_be/ServletInitializer.java`
  * `backend/src/main/java/fit/se/travelling_app_be/config/SecurityConfig.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/response/ApiResponse.java`
* **Lệnh Git:**
  ```bash
  git add backend/
  git commit -m "feat(be): initialize spring boot framework with security and response wrapper" --author="Nguyen Quoc Bao <bao@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd clean compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 2 (Người 2 - FE Dev): Khởi tạo ứng dụng Expo & Theme tokens
* **Files:**
  * `frontend/package.json`, `frontend/tsconfig.json`, `frontend/app.json`, `frontend/App.tsx`
  * `frontend/src/constants/theme.ts`, `frontend/src/constants/images.ts`
  * `frontend/src/components/Button.tsx`, `frontend/src/components/Header.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/
  git commit -m "feat(fe): initialize react native expo app and theme tokens" --author="Ho Quoc Huy <huy@example.com>"
  ```

#### Commit 3 (Người 1 - FE Lead): Cấu hình AppNavigator, Type definitions & API Client
* **Files:**
  * `frontend/src/navigation/AppNavigator.tsx`
  * `frontend/src/api/config.ts`
  * `frontend/src/types/index.ts`
* **Lệnh Git:**
  ```bash
  git add frontend/src/navigation/AppNavigator.tsx frontend/src/api/config.ts frontend/src/types/index.ts
  git commit -m "feat(common): setup navigation container and base api client" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

---

### 🔹 GIAI ĐOẠN 2: XÁC THỰC TÀI KHOẢN & QUẢN LÝ HỒ SƠ (SPRINT 2 - USER & AUTH)

#### Commit 4 (Người 2 - BE): Triển khai Entity User, Auth Service & Controller
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/entity/User.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/UserRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/request/LoginRequest.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/request/RegisterRequest.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/response/AuthResponse.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/response/ProfileResponse.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/UserService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/AuthController.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/entity/User.java backend/src/main/java/fit/se/travelling_app_be/repository/UserRepository.java backend/src/main/java/fit/se/travelling_app_be/dto/ backend/src/main/java/fit/se/travelling_app_be/service/UserService.java backend/src/main/java/fit/se/travelling_app_be/controller/AuthController.java
  git commit -m "feat(be): implement user domain with authentication service and bcrypt" --author="Ho Quoc Huy <huy@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 5 (Người 2 - FE): Màn hình đăng nhập, đăng ký & AuthContext
* **Files:**
  * `frontend/src/contexts/AuthContext.tsx`
  * `frontend/src/api/authService.ts`
  * `frontend/src/screens/LoginScreen.tsx`
  * `frontend/src/screens/RegisterScreen.tsx`
  * `frontend/src/screens/RegisterSuccessScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/contexts/AuthContext.tsx frontend/src/api/authService.ts frontend/src/screens/LoginScreen.tsx frontend/src/screens/RegisterScreen.tsx frontend/src/screens/RegisterSuccessScreen.tsx
  git commit -m "feat(fe): build authentication screens and persistent auth context" --author="Ho Quoc Huy <huy@example.com>"
  ```

#### Commit 6 (Người 2 - FE): Màn hình hồ sơ cá nhân & Cài đặt bảo mật
* **Files:**
  * `frontend/src/api/userService.ts`
  * `frontend/src/screens/ProfileScreen.tsx`
  * `frontend/src/screens/PersonalInfoScreen.tsx`
  * `frontend/src/screens/SecurityScreen.tsx`
  * `frontend/src/screens/DarkModeScreen.tsx`
  * `frontend/src/screens/LanguageScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/api/userService.ts frontend/src/screens/ProfileScreen.tsx frontend/src/screens/PersonalInfoScreen.tsx frontend/src/screens/SecurityScreen.tsx frontend/src/screens/DarkModeScreen.tsx frontend/src/screens/LanguageScreen.tsx
  git commit -m "feat(fe): build user profile management, biometric and security settings" --author="Ho Quoc Huy <huy@example.com>"
  ```

---

### 🔹 GIAI ĐOẠN 3: ĐIỂM ĐẾN, THÔNG BÁO & REDIS CACHING (SPRINT 3)
*(Phân hệ này cung cấp Destination & Notification làm bàn đạp cho Booking ở Giai đoạn 4)*

#### Commit 7 (Người 2 - BE): Triển khai Destination, Notification entities & Services
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/entity/Location.java`
  * `backend/src/main/java/fit/se/travelling_app_be/entity/Destination.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/DestinationRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/DestinationService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/DestinationController.java`
  * `backend/src/main/java/fit/se/travelling_app_be/model/Notification.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/NotificationRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/NotificationService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/NotificationController.java`
  * `backend/src/main/java/fit/se/travelling_app_be/config/DataInitializer.java`
  * `backend/src/main/java/fit/se/travelling_app_be/config/OpenApiConfig.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/entity/Location.java backend/src/main/java/fit/se/travelling_app_be/entity/Destination.java backend/src/main/java/fit/se/travelling_app_be/repository/DestinationRepository.java backend/src/main/java/fit/se/travelling_app_be/service/DestinationService.java backend/src/main/java/fit/se/travelling_app_be/controller/DestinationController.java backend/src/main/java/fit/se/travelling_app_be/model/Notification.java backend/src/main/java/fit/se/travelling_app_be/repository/NotificationRepository.java backend/src/main/java/fit/se/travelling_app_be/service/NotificationService.java backend/src/main/java/fit/se/travelling_app_be/controller/NotificationController.java backend/src/main/java/fit/se/travelling_app_be/config/DataInitializer.java backend/src/main/java/fit/se/travelling_app_be/config/OpenApiConfig.java
  git commit -m "feat(be): implement destination and notification modules with sample data" --author="Ho Quoc Huy <huy@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 8 (Người 1 - BE Lead): Tích hợp Redis Caching & Quản lý TTL
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/config/CacheConfig.java`
  * Cập nhật các annotation `@Cacheable` trong `DestinationService.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/config/CacheConfig.java backend/src/main/java/fit/se/travelling_app_be/service/DestinationService.java
  git commit -m "feat(be): integrate redis cache manager and ttl policy for destinations" --author="Nguyen Quoc Bao <bao@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 9 (Người 2 - FE): Màn hình Home, Explore & Tìm kiếm đa tiêu chí
* **Files:**
  * `frontend/src/components/DestinationCard.tsx`
  * `frontend/src/components/CategoryCard.tsx`
  * `frontend/src/components/SearchBar.tsx`
  * `frontend/src/components/FilterModal.tsx`
  * `frontend/src/api/destinationService.ts`
  * `frontend/src/api/cache/destinationHooks.ts`
  * `frontend/src/screens/HomeScreen.tsx`
  * `frontend/src/screens/ExploreScreen.tsx`
  * `frontend/src/screens/SearchScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/components/DestinationCard.tsx frontend/src/components/CategoryCard.tsx frontend/src/components/SearchBar.tsx frontend/src/components/FilterModal.tsx frontend/src/api/destinationService.ts frontend/src/api/cache/destinationHooks.ts frontend/src/screens/HomeScreen.tsx frontend/src/screens/ExploreScreen.tsx frontend/src/screens/SearchScreen.tsx
  git commit -m "feat(fe): build home screen with trending destinations and search filters" --author="Ho Quoc Huy <huy@example.com>"
  ```

#### Commit 10 (Người 2 - FE): Màn hình chi tiết điểm đến với Parallax & Gallery
* **Files:**
  * `frontend/src/screens/DestinationDetailScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/screens/DestinationDetailScreen.tsx
  git commit -m "feat(fe): build destination detail screen with parallax scroll and gallery" --author="Ho Quoc Huy <huy@example.com>"
  ```

---

### 🔹 GIAI ĐOẠN 4: HỆ THỐNG ĐẶT TOUR, THANH TOÁN & SCHEDULER (SPRINT 4 - CORE ENGINE NGƯỜI 1)
*(Do Destination và Notification đã có từ Giai đoạn 3, các file Booking và Payment dưới đây sẽ compile mượt mà 100%)*

#### Commit 11 (Người 1 - BE Lead): Triển khai Booking Entity, Repository, DTO, Service & Controller
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/entity/Booking.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/BookingRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/request/BookingRequest.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/BookingService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/BookingController.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/entity/Booking.java backend/src/main/java/fit/se/travelling_app_be/repository/BookingRepository.java backend/src/main/java/fit/se/travelling_app_be/dto/request/BookingRequest.java backend/src/main/java/fit/se/travelling_app_be/service/BookingService.java backend/src/main/java/fit/se/travelling_app_be/controller/BookingController.java
  git commit -m "feat(be): implement booking entity, state machine and booking service" --author="Nguyen Quoc Bao <bao@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 12 (Người 1 - BE Lead): Triển khai Payment Service & Notification Scheduler
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/dto/request/ProcessPaymentRequest.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/response/ProcessPaymentResponse.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/PaymentService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/PaymentController.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/NotificationSchedulerService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/NotificationSchedulerController.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/dto/request/ProcessPaymentRequest.java backend/src/main/java/fit/se/travelling_app_be/dto/response/ProcessPaymentResponse.java backend/src/main/java/fit/se/travelling_app_be/service/PaymentService.java backend/src/main/java/fit/se/travelling_app_be/controller/PaymentController.java backend/src/main/java/fit/se/travelling_app_be/service/NotificationSchedulerService.java backend/src/main/java/fit/se/travelling_app_be/controller/NotificationSchedulerController.java
  git commit -m "feat(be): implement payment processing engine and automated trip scheduler" --author="Nguyen Quoc Bao <bao@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 13 (Người 1 - FE Lead): Luồng chọn gói dịch vụ & Tính toán chi phí đơn đặt tour
* **Files:**
  * `frontend/src/screens/TourServicesScreen.tsx`
  * `frontend/src/screens/ServicePackageDetailScreen.tsx`
  * `frontend/src/screens/OrderDetailsScreen.tsx`
  * `frontend/src/api/bookingService.ts`
* **Lệnh Git:**
  ```bash
  git add frontend/src/screens/TourServicesScreen.tsx frontend/src/screens/ServicePackageDetailScreen.tsx frontend/src/screens/OrderDetailsScreen.tsx frontend/src/api/bookingService.ts
  git commit -m "feat(fe): build tour service selection and booking order details calculation" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

#### Commit 14 (Người 1 - FE Lead): Màn hình cổng thanh toán & Xác nhận giao dịch
* **Files:**
  * `frontend/src/screens/PaymentScreen.tsx`
  * `frontend/src/screens/PaymentMethodsScreen.tsx`
  * `frontend/src/screens/PaymentResultScreen.tsx`
  * `frontend/src/screens/PaymentSuccessScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/screens/PaymentScreen.tsx frontend/src/screens/PaymentMethodsScreen.tsx frontend/src/screens/PaymentResultScreen.tsx frontend/src/screens/PaymentSuccessScreen.tsx
  git commit -m "feat(fe): implement payment gateway screens and booking confirmation flow" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

#### Commit 15 (Người 1 - FE Lead): Màn hình quản lý chuyến đi (Bookings & Cancel tour)
* **Files:**
  * `frontend/src/screens/BookingsScreen.tsx`
  * `frontend/src/screens/BookingDetailScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/screens/BookingsScreen.tsx frontend/src/screens/BookingDetailScreen.tsx
  git commit -m "feat(fe): implement trip history management and cancellation handling" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

---

### 🔹 GIAI ĐOẠN 5: ĐÁNH GIÁ, YÊU THÍCH & TRANG PHỤ TRỢ (SPRINT 5)

#### Commit 16 (Người 2 - BE): Triển khai Review & Favorite Services
* **Files:**
  * `backend/src/main/java/fit/se/travelling_app_be/entity/Review.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/ReviewRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/dto/request/ReviewRequest.java`
  * `backend/src/main/java/fit/se/travelling_app_be/service/ReviewService.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/ReviewController.java`
  * `backend/src/main/java/fit/se/travelling_app_be/entity/Favorite.java`
  * `backend/src/main/java/fit/se/travelling_app_be/repository/FavoriteRepository.java`
  * `backend/src/main/java/fit/se/travelling_app_be/controller/FavoriteController.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/main/java/fit/se/travelling_app_be/entity/Review.java backend/src/main/java/fit/se/travelling_app_be/repository/ReviewRepository.java backend/src/main/java/fit/se/travelling_app_be/dto/request/ReviewRequest.java backend/src/main/java/fit/se/travelling_app_be/service/ReviewService.java backend/src/main/java/fit/se/travelling_app_be/controller/ReviewController.java backend/src/main/java/fit/se/travelling_app_be/entity/Favorite.java backend/src/main/java/fit/se/travelling_app_be/repository/FavoriteRepository.java backend/src/main/java/fit/se/travelling_app_be/controller/FavoriteController.java
  git commit -m "feat(be): implement reviews and favorites services with rating calculation" --author="Ho Quoc Huy <huy@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd compile` $\rightarrow$ **BUILD SUCCESS**!

#### Commit 17 (Người 2 - FE): Màn hình đánh giá tour & Danh sách yêu thích
* **Files:**
  * `frontend/src/api/reviewService.ts`
  * `frontend/src/screens/ReviewsScreen.tsx`
  * `frontend/src/screens/TourReviewScreen.tsx`
  * `frontend/src/screens/FavoritesScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/api/reviewService.ts frontend/src/screens/ReviewsScreen.tsx frontend/src/screens/TourReviewScreen.tsx frontend/src/screens/FavoritesScreen.tsx
  git commit -m "feat(fe): build tour reviews submission and favorites bookmarking screens" --author="Ho Quoc Huy <huy@example.com>"
  ```

#### Commit 18 (Người 2 - FE): Các trang tĩnh (About Us, Support, Chính sách)
* **Files:**
  * `frontend/src/screens/AboutUsScreen.tsx`
  * `frontend/src/screens/SupportScreen.tsx`
  * `frontend/src/screens/TermsOfServiceScreen.tsx`
  * `frontend/src/screens/PrivacyPolicyScreen.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/screens/AboutUsScreen.tsx frontend/src/screens/SupportScreen.tsx frontend/src/screens/TermsOfServiceScreen.tsx frontend/src/screens/PrivacyPolicyScreen.tsx
  git commit -m "feat(fe): add support, terms of service and about us policy screens" --author="Ho Quoc Huy <huy@example.com>"
  ```

---

### 🔹 GIAI ĐOẠN 6: TRỢ LÝ ẢO AI CHATBOT & KIỂM THỬ TOÀN DIỆN (SPRINT 6)

#### Commit 19 (Người 1 - FE Lead): Tích hợp dịch vụ AI Chatbot & Knowledge Base
* **Files:**
  * `frontend/src/api/chatbotService.ts`
* **Lệnh Git:**
  ```bash
  git add frontend/src/api/chatbotService.ts
  git commit -m "feat(ai): integrate langchain travel assistant service with fallback rag" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

#### Commit 20 (Người 1 - FE Lead): Nút bấm nổi 3D Robot & Màn hình ChatBot
* **Files:**
  * `frontend/src/components/ChatbotFAB.tsx`
  * `frontend/src/screens/ChatBotScreen.tsx`
  * Cập nhật `frontend/src/navigation/AppNavigator.tsx`
* **Lệnh Git:**
  ```bash
  git add frontend/src/components/ChatbotFAB.tsx frontend/src/screens/ChatBotScreen.tsx frontend/src/navigation/AppNavigator.tsx
  git commit -m "feat(ui): implement 3d chatbot floating action button and chat screen" --author="Nguyen Quoc Bao <bao@example.com>"
  ```

#### Commit 21 (Cả 2 Người - Unit Tests): Bộ Unit Test tự động cho Backend
* **Files Người 1:**
  * `backend/src/test/java/.../service/BookingServiceTest.java`
  * `backend/src/test/java/.../service/PaymentServiceTest.java`
* **Files Người 2:**
  * `backend/src/test/java/.../service/UserServiceTest.java`
  * `backend/src/test/java/.../service/DestinationServiceTest.java`
  * `backend/src/test/java/.../service/ReviewServiceTest.java`
  * `backend/src/test/java/.../service/NotificationServiceTest.java`
* **Lệnh Git:**
  ```bash
  git add backend/src/test/
  git commit -m "test(be): add comprehensive unit tests for core services" --author="Nguyen Quoc Bao <bao@example.com>"
  ```
* **Kiểm tra:** `.\mvnw.cmd test` $\rightarrow$ **BUILD SUCCESS (ALL TESTS PASS)**!

#### Commit 22 (Cả 2 Người - Documentation): Hoàn thiện tài liệu hệ thống
* **Files:**
  * `README.md`
  * `WORKFLOW.md`
  * `DESIGN.md`
  * `PLAN_PHAN_CONG_NHIEM_VU.md`
* **Lệnh Git:**
  ```bash
  git add README.md WORKFLOW.md DESIGN.md PLAN_PHAN_CONG_NHIEM_VU.md
  git commit -m "docs: finalize system documentation, api specifications and workflow" --author="Ho Quoc Huy <huy@example.com>"
  ```

---

## 🎯 BẢNG TỔNG KẾT SO SÁNH PHÂN CÔNG (BALANCED WORKLOAD)

| Phân hệ | NGƯỜI 1 (Lead / Core Dev) | NGƯỜI 2 (UI/UX & Feature Dev) |
| :--- | :--- | :--- |
| **Backend Config** | Spring Security, Redis CacheConfig, Response Wrapper, Database yml | OpenAPI / Swagger, DataInitializer |
| **Backend Domain** | Booking, Payment, NotificationScheduler *(Logic phức tạp, state machine)* | User, Auth, Destination, Notification, Review, Favorite *(CRUD, aggregations)* |
| **Frontend Core** | AppNavigator, Axios Client, Types definition | Theme tokens, Button, Header |
| **Frontend Screens** | TourServices, OrderDetails, Payment (3 màn), Bookings, BookingDetail, ChatBot | Login, Register, Profile, PersonalInfo, Security, Home, Explore, Search, DestinationDetail, Reviews, TourReview, Favorites, AboutUs, Support, Terms |
| **AI / Advanced** | Tích hợp Trợ lý ảo LangChain RAG & Chatbot FAB 3D | Sinh trắc học Biometrics (Face ID/Fingerprint), Parallax scroll |
| **Tỷ trọng công việc** | **55%** | **45%** |
