# 🧭 TÀI LIỆU WORKFLOW HỆ THỐNG TRAVELLING-APP

> **Phiên bản:** 1.0  
> **Dự án:** Travelling-App (Ứng dụng du lịch di động)  
> **Tech Stack:** React Native (Expo) + Spring Boot 3.x + MongoDB Atlas + Redis Cache  

---

## 📌 MỤC LỤC
1. [Tổng Quan Kiến Trúc Hệ Thống](#1-tổng-quan-kiến-trúc-hệ-thống)
2. [Phân Tích Tác Nhân & Chức Năng Của Admin](#2-phân-tích-tác-nhân--chức-năng-của-admin)
3. [Sơ Đồ Luồng Hoạt Động Tổng Thể (Master Workflow)](#3-sơ-đồ-luồng-hoạt-động-tổng-thể-master-workflow)
4. [Chi Tiết Các Workflow Nghiệp Vụ](#4-chi-tiết-các-workflow-nghiệp-vụ)
   - [4.1. Workflow Xác Thực & Quản Lý Tài Khoản](#41-workflow-xác-thực--quản-lý-tài-khoản)
   - [4.2. Workflow Khám Phá & Tìm Kiếm Tour](#42-workflow-khám-phá--tìm-kiếm-tour)
   - [4.3. Workflow Đặt Tour & Thanh Toán (Cốt Lõi)](#43-workflow-đặt-tour--thanh-toán-cốt-lõi)
   - [4.4. Workflow Quản Lý Chuyến Đi & Đánh Giá](#44-workflow-quản-lý-chuyến-đi--đánh-giá)
   - [4.5. Workflow Quản Trị Viên (Admin)](#45-workflow-quản-trị-viên-admin)
   - [4.6. Workflow Trợ Lý Du Lịch AI Chatbot](#46-workflow-trợ-lý-du-lịch-ai-chatbot)
5. [Quy Trình Chuyển Đổi Trạng Thái Đơn Đặt (State Machine)](#5-quy-trình-chuyển-đổi-trạng-thái-đơn-đặt-state-machine)
6. [Bản Đồ API Endpoints Tương Ứng Với Workflow](#6-bản-đồ-api-endpoints-tương-ứng-với-workflow)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống hoạt động theo mô hình **Client - Server**:
- **Frontend (Mobile App):** Xây dựng bằng React Native (TypeScript, Expo), React Navigation (Stack & Bottom Tabs), quản lý state qua AuthContext và lưu trữ cục bộ với AsyncStorage.
- **Backend (API Server):** Xây dựng bằng Java Spring Boot 3.x, cung cấp RESTful APIs.
- **Database:** MongoDB Atlas (Cloud) lưu trữ các collections `users`, `destinations`, `bookings`, `reviews`, `notifications`.
- **Caching Layer:** Redis (Docker) dùng để cache các truy vấn phổ biến (Destinations nổi bật, thông tin User) nhằm tối ưu tốc độ phản hồi < 3s.

```
[ Mobile App (React Native/Expo) ]
            │  ▲
   REST API │  │ JSON (Token Auth)
            ▼  │
[ Spring Boot 3.x Backend ]
   ├── Spring Security (BCrypt)
   ├── Service Layer (Booking, Destination, User, Review...)
   ├── Redis Cache (Featured / Popular Destinations)
   └── MongoDB Atlas (Persistent Collections)
```

---

## 2. PHÂN TÍCH TÁC NHÂN & CHỨC NĂNG CỦA ADMIN

Hệ thống phân chia thành **3 Tác nhân (Actors)** chính:
1. **Khách (Guest):** Người chưa đăng nhập hoặc vào app ở chế độ Guest.
2. **Người dùng (User):** Người dùng đã đăng ký/đăng nhập tài khoản.
3. **Quản trị viên (Admin):** Người quản lý hệ thống.

### ❓ Trả lời câu hỏi: Dự án có chức năng của Admin không?

| Tiêu chí | Hiện trạng trong Dự án | Chi tiết phân tích |
| :--- | :---: | :--- |
| **Tài liệu & Thiết kế (SRS / Báo cáo đề tài)** | **CÓ** | Báo cáo đề tài xác định Admin là tác nhân chính với 3 Use Cases cốt lõi:<br>• **UC14 - Quản lý tour:** Thêm, sửa, xóa thông tin tour/điểm đến.<br>• **UC15 - Quản lý người dùng:** Tra cứu, quản lý tài khoản người dùng.<br>• **UC16 - Quản lý đơn đặt:** Xem toàn bộ đơn, duyệt hoặc hủy đơn của khách.<br>• Báo cáo doanh thu & thống kê số lượng đặt tour. |
| **Cơ sở dữ liệu & Model Backend** | **CÓ KHUNG** | Entity `User.java` đã có sẵn trường `role` (mặc định là `"USER"` và hỗ trợ `"ADMIN"`). |
| **API Backend (Spring Boot)** | **MỘT PHẦN** | Backend đã có các API phục vụ nghiệp vụ Admin:<br>• `POST /destinations` (Tạo tour mới)<br>• `PUT /bookings/{id}/status` (Đổi trạng thái đơn)<br>• `PUT /bookings/{id}/payment` (Cập nhật trạng thái thanh toán)<br>• `GET /auth/user/{id}` (Lấy thông tin người dùng)<br>*Lưu ý:* `SecurityConfig` hiện đang để `permitAll()` để test, chưa kích hoạt `@PreAuthorize("hasRole('ADMIN')")`. |
| **Giao diện Frontend (React Native Mobile)** | **CHƯA CÓ UI RIÊNG** | Ứng dụng hiện tại là Mobile App dành riêng cho **End-User (Khách hàng)**.<br>Nút `admin / admin12345` ở màn hình Login chỉ là tài khoản test nhanh, khi đăng nhập sẽ load `mockAdminUser` với giao diện như một User thông thường. Chưa có Dashboard quản trị trên app hoặc Web Admin Portal. |

---

## 3. SƠ ĐỒ LUỒNG HOẠT ĐỘNG TỔNG THỂ (MASTER WORKFLOW)

```mermaid
flowchart TD
    AppStart([Khởi động ứng dụng]) --> AuthCheck{Kiểm tra trạng thái đăng nhập}
    
    %% Guest Branch
    AuthCheck -- Chưa đăng nhập --> GuestChoice{Lựa chọn}
    GuestChoice -- Tiếp tục với Guest Mode --> GuestHome[Duyệt danh sách Tour / Tìm kiếm / Xem chi tiết]
    GuestChoice -- Đăng nhập / Đăng ký --> AuthScreen[Màn hình Login / Register]
    
    GuestHome --> ActionCheck{Thao tác cần quyền:<br>Đặt tour / Yêu thích / Review / Profile}
    ActionCheck -- Có --> AuthScreen
    ActionCheck -- Không --> GuestHome

    %% Authenticated Branch
    AuthCheck -- Đã đăng nhập --> MainTab[Vào Bottom Tabs chính]
    AuthScreen -- Xác thực thành công --> MainTab
    
    MainTab --> TabHome[Tab Home: Tour nổi bật, Danh mục]
    MainTab --> TabExplore[Tab Explore: Khám phá, Tìm kiếm, Bộ lọc]
    MainTab --> TabTrips[Tab Trips: Quản lý chuyến đi]
    MainTab --> TabSaved[Tab Saved: Tour yêu thích]
    MainTab --> TabProfile[Tab Profile: Thông tin, Cài đặt, Bảo mật]

    %% Booking Flow
    TabHome & TabExplore --> ViewTour[Xem Chi tiết Tour]
    ViewTour --> BookingFlow[Quy trình Đặt tour: Chọn ngày, Khách, Gói dịch vụ]
    BookingFlow --> PaymentFlow[Chọn phương thức & Thanh toán]
    PaymentFlow --> BookingResult[Lưu đơn đặt: CONFIRMED hoặc PENDING]
    BookingResult --> TabTrips

    %% Review Flow
    TabTrips --> CheckCompleted{Tour đã hoàn thành?}
    CheckCompleted -- Đúng --> WriteReview[Viết nhận xét & Đánh giá 1-5 sao]
    WriteReview --> UpdateTourRating[Tự động cập nhật Rating của Tour]
```

---

## 4. CHI TIẾT CÁC WORKFLOW NGHIỆP VỤ

### 4.1. Workflow Xác Thực & Quản Lý Tài Khoản

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Mobile App
    participant BE as Spring Boot (AuthController)
    participant DB as MongoDB (User Collection)

    alt Đăng ký tài khoản mới
        User->>App: Nhập Email, Password, Họ tên, SĐT...
        App->>BE: POST /auth/register
        BE->>DB: Kiểm tra trùng Email
        BE->>BE: Băm mật khẩu bằng BCrypt
        BE->>DB: Lưu User mới (role = USER, avatar mặc định)
        BE-->>App: Trả về ApiResponse thành công
        App-->>User: Chuyển đến RegisterSuccessScreen -> LoginScreen
    else Đăng nhập
        User->>App: Nhập Email & Password (hoặc Face ID/Fingerprint)
        App->>BE: POST /auth/login
        BE->>DB: Tìm user theo Email
        BE->>BE: passwordEncoder.matches(inputPass, hashPass)
        BE-->>App: Trả về Token + User Profile
        App->>App: Lưu token và user vào AsyncStorage
        App-->>User: Điều hướng vào MainTabs (HomeScreen)
    end
```

#### Quy tắc nghiệp vụ:
- Mật khẩu lưu dưới dạng hash BCrypt (salt = 10 rounds), không lưu plain text.
- Chế độ **Guest Mode**: Được duyệt tour, xem ảnh, đọc đánh giá; bị chặn khi đặt tour, thêm yêu thích hoặc đánh giá.
- Hỗ trợ đăng nhập sinh trắc học (**Fingerprint / Face ID**) thông qua lưu credential an toàn.

---

### 4.2. Workflow Khám Phá & Tìm Kiếm Tour

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng / Guest
    participant App as Mobile App
    participant BE as DestinationController
    participant Cache as Redis Cache
    participant DB as MongoDB

    User->>App: Mở Tab Home / Explore / Gõ từ khóa tìm kiếm
    App->>BE: GET /destinations (hoặc /featured, /search?query=...)
    BE->>Cache: Kiểm tra Cache Redis
    alt Đã có trong Cache (Cache Hit)
        Cache-->>BE: Dữ liệu Tour đã serialize
    else Chưa có trong Cache (Cache Miss)
        BE->>DB: Truy vấn dữ liệu MongoDB
        DB-->>BE: Kết quả danh sách Tour
        BE->>Cache: Lưu kết quả vào Redis (TTL)
    end
    BE-->>App: Trả về danh sách điểm đến
    App-->>User: Hiển thị giao diện danh sách kèm hình ảnh, giá, rating
```

#### Quy tắc nghiệp vụ:
- Danh mục tour: *Beach (Biển), Nature (Thiên nhiên), Cultural (Văn hóa), Entertainment (Giải trí), Luxury (Cao cấp)*.
- Lọc nâng cao theo: Tầm giá `min - max`, số sao tối thiểu, thời lượng chuyến đi (`duration`).
- Màn hình chi tiết tour hỗ trợ Parallax Header, danh sách ảnh Unsplash, danh sách tiện ích (`WiFi`, `Bữa sáng`, `Đưa đón sân bay`, `Hướng dẫn viên`).

---

### 4.3. Workflow Đặt Tour & Thanh Toán (Cốt Lõi)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant App as Mobile App
    participant BE_Booking as BookingController & Service
    participant BE_Payment as PaymentController & Service
    participant DB as MongoDB (Bookings & Destinations)

    User->>App: 1. Tại Chi tiết Tour -> Bấm "Đặt ngay"
    User->>App: 2. Chọn Gói dịch vụ (Standard/Premium/VIP) & Dịch vụ đi kèm
    User->>App: 3. Chọn Ngày khởi hành (Sau ngày hiện tại)
    App->>App: Tự tính ngày kết thúc dựa trên duration & Tính tổng tiền
    User->>App: 4. Chọn Số lượng khách (1 đến 8 người)
    User->>App: 5. Chọn Phương thức thanh toán (Thẻ / Ví / Chuyển khoản / COD)
    
    alt Thanh toán Online (Thẻ tín dụng / Ví điện tử / Chuyển khoản)
        App->>BE_Payment: POST /payments/process (amount, paymentMethod)
        BE_Payment-->>App: Thanh toán thành công (mock/gateway)
        App->>BE_Booking: POST /bookings (đính kèm paymentMethod)
        BE_Booking->>DB: Lưu booking mới: status="CONFIRMED", paymentStatus="PAID"
    else Thanh toán khi nhận tour (COD)
        App->>BE_Booking: POST /bookings (COD)
        BE_Booking->>DB: Lưu booking mới: status="PENDING", paymentStatus="PENDING"
    end

    BE_Booking->>DB: Tự động tạo Notification xác nhận chuyến đi
    BE_Booking-->>App: Trả về Booking đã lưu
    App-->>User: Điều hướng tới PaymentSuccessScreen -> Xem chi tiết đơn
```

#### Quy tắc nghiệp vụ:
- **Xác thực ngày đi:** Ngày khởi hành phải lớn hơn thời điểm hiện tại.
- **Tính toán ngày về:** Dựa vào `duration` của điểm đến (ví dụ tour "5 days" $\rightarrow$ ngày về = ngày đi + 5 ngày).
- **Trạng thái đơn hàng khởi tạo:**
  - Online payment: `CONFIRMED` + `PAID`.
  - Cash on delivery (COD): `PENDING` + `PENDING`.
- **Thông báo:** Kích hoạt tạo bản ghi trong collection `notifications` thông báo lịch trình cho tài khoản đặt tour.

---

### 4.4. Workflow Quản Lý Chuyến Đi & Đánh Giá

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant App as Mobile App
    participant BE_Booking as BookingService
    participant BE_Review as ReviewService
    participant DB as MongoDB

    %% Xem & Hủy
    User->>App: Mở Tab Bookings (Trips)
    App->>BE_Booking: GET /bookings/user/{userId}
    BE_Booking->>DB: Lấy danh sách đơn đặt theo userId
    BE_Booking-->>App: Trả về danh sách đơn
    App-->>User: Phân loại: "Sắp tới" / "Đã hoàn thành" / "Đã hủy"

    opt Hủy tour (Chuyến đi sắp tới)
        User->>App: Bấm "Hủy tour"
        App->>BE_Booking: PUT /bookings/{id}/cancel
        BE_Booking->>DB: Cập nhật status = "CANCELLED"
        BE_Booking-->>App: Xác nhận hủy thành công
    end

    %% Đánh giá
    opt Đánh giá chuyến đi đã hoàn thành
        User->>App: Mở TourReviewScreen cho chuyến đi Completed
        User->>App: Chọn số sao (1-5) & viết nhận xét (>= 10 ký tự)
        App->>BE_Review: POST /reviews (destinationId, userId, rating, comment)
        BE_Review->>DB: Kiểm tra User đã đánh giá destination này chưa
        alt Đã đánh giá trước đó
            BE_Review-->>App: Báo lỗi "You have already reviewed this destination"
        else Chưa đánh giá
            BE_Review->>DB: Lưu Review mới
            BE_Review->>DB: Tự động tính lại average rating & reviewCount của Destination
            BE_Review-->>App: Trả về Review thành công
            App-->>User: Hiển thị thông báo cảm ơn đánh giá
        end
    end
```

#### Quy tắc nghiệp vụ:
- **Chống spam đánh giá:** Mỗi tài khoản chỉ được để lại **1 đánh giá duy nhất** cho mỗi điểm đến du lịch.
- **Cập nhật Rating Real-time:** Khi có review mới hoặc cập nhật review, Backend tự động tổng hợp lại điểm trung bình (`destination.rating`) và số lượt đánh giá (`destination.reviewCount`).

---

### 4.5. Workflow Quản Trị Viên (Admin)

Mặc dù UI Mobile hiện tại chưa tích hợp bảng điều khiển riêng cho Admin, quy trình nghiệp vụ Admin theo thiết kế hệ thống bao gồm:

```mermaid
flowchart TD
    AdminLogin([Admin Đăng nhập với quyền ADMIN]) --> AdminDashboard[Trang Quản Trị Hệ Thống]
    
    %% Quản lý Tour
    AdminDashboard --> ManageTours[Quản lý Điểm Đến / Tours]
    ManageTours --> CreateTour[POST /destinations: Tạo Tour mới]
    ManageTours --> UpdateTour[PUT /destinations/{id}: Sửa nội dung, hình ảnh, giá]
    ManageTours --> DeleteTour[DELETE /destinations/{id}: Xóa hoặc ẩn tour]
    
    %% Quản lý Đơn đặt
    AdminDashboard --> ManageBookings[Quản lý Đơn Đặt Chỗ]
    ManageBookings --> ViewAllBookings[Xem toàn bộ danh sách đơn đặt trên hệ thống]
    ManageBookings --> ApproveBooking[PUT /bookings/{id}/status: Duyệt đơn PENDING -> CONFIRMED]
    ManageBookings --> CancelBooking[PUT /bookings/{id}/status: Hủy đơn nếu có sự cố]
    
    %% Quản lý Người dùng
    AdminDashboard --> ManageUsers[Quản lý Người Dùng]
    ManageUsers --> ViewUsers[GET /auth/user: Tra cứu thông tin khách hàng]
    ManageUsers --> BanUser[Khóa hoặc cập nhật thông tin tài khoản vi phạm]
```

### 4.6. Workflow Trợ Lý Du Lịch AI Chatbot (Tích hợp RAG từ ai-pdf-chatbot-langchain)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant FAB as ChatbotFAB (HomeScreen)
    participant ChatScreen as ChatBotScreen
    participant AIService as chatbotService
    participant LangChain as Backend ai-pdf-chatbot-langchain
    participant KB as Local Travel Knowledge Base

    User->>FAB: 1. Chạm nút Floating Robot ở góc phải
    FAB->>ChatScreen: 2. Mở màn hình Chatbot (slide_from_bottom)
    ChatScreen-->>User: 3. Hiển thị lời chào + Danh sách Example Prompts gợi ý

    alt Khách chọn câu hỏi nhanh hoặc nhập tin nhắn
        User->>ChatScreen: 4. Gửi câu hỏi (VD: "Gợi ý tour biển dưới 3 triệu")
        ChatScreen->>ChatScreen: Render tin nhắn của User (Right bubble)
        ChatScreen->>AIService: 5. Gửi message (text, threadId)
        
        alt Server LangChain đang chạy (Online)
            AIService->>LangChain: POST /api/chat
            LangChain->>LangChain: Retrieval Graph (Tra cứu Vector DB PDF) + LLM
            LangChain-->>AIService: Trả về câu trả lời đã tổng hợp
        else Server LangChain chưa bật (Offline/Demo)
            AIService->>KB: Tra cứu Smart Travel Knowledge Base
            KB-->>AIService: Trả về câu trả lời chuyên sâu về tour & điểm đến
        end

        AIService-->>ChatScreen: 6. Nhận câu trả lời hoàn chỉnh
        ChatScreen->>ChatScreen: 7. Hiển thị tin nhắn AI (Left bubble) + Timestamp
    end
```

---

## 5. QUY TRÌNH CHUYỂN ĐỔI TRẠNG THÁI ĐƠN ĐẶT (STATE MACHINE)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Khách chọn COD (Thanh toán sau)
    [*] --> CONFIRMED: Khách thanh toán Online thành công
    
    PENDING --> CONFIRMED: Admin xác nhận / Khách thanh toán tiền
    PENDING --> CANCELLED: Khách hoặc Admin hủy đơn
    
    CONFIRMED --> COMPLETED: Chuyến đi hoàn thành (Đến ngày về)
    CONFIRMED --> CANCELLED: Khách hủy đơn trước ngày đi
    
    COMPLETED --> REVIEWED: Khách gửi đánh giá 1-5 sao
    
    CANCELLED --> [*]
    REVIEWED --> [*]
```

---

## 6. BẢN ĐỒ API ENDPOINTS TƯƠNG ỨNG VỚI WORKFLOW

| Phân hệ / Workflow | Phương thức | Endpoint | Chức năng | Phân quyền |
| :--- | :---: | :--- | :--- | :---: |
| **Xác thực (Auth)** | `POST` | `/auth/register` | Đăng ký tài khoản mới | Public |
| | `POST` | `/auth/login` | Đăng nhập tài khoản | Public |
| | `GET` | `/auth/user/{id}` | Lấy thông tin cá nhân | Authenticated |
| | `PUT` | `/auth/user/{id}` | Cập nhật hồ sơ cá nhân | Authenticated |
| | `PUT` | `/auth/user/{id}/password` | Đổi mật khẩu | Authenticated |
| **Điểm đến (Destinations)** | `GET` | `/destinations` | Lấy tất cả điểm đến | Public |
| | `GET` | `/destinations/{id}` | Xem chi tiết 1 điểm đến | Public |
| | `GET` | `/destinations/featured` | Điểm đến nổi bật (có Redis cache) | Public |
| | `GET` | `/destinations/popular` | Điểm đến phổ biến (có Redis cache) | Public |
| | `GET` | `/destinations/search?query=` | Tìm kiếm điểm đến theo từ khóa | Public |
| | `GET` | `/destinations/category/{cat}` | Lọc theo danh mục | Public |
| | `POST` | `/destinations` | Tạo mới điểm đến | **Admin** |
| **Đặt chỗ (Bookings)** | `POST` | `/bookings` | Tạo mới đơn đặt tour | Authenticated |
| | `GET` | `/bookings/{id}` | Xem chi tiết đơn đặt | Authenticated |
| | `GET` | `/bookings/user/{userId}` | Danh sách đơn của người dùng | Authenticated |
| | `GET` | `/bookings/user/{userId}/upcoming` | Đơn sắp tới | Authenticated |
| | `GET` | `/bookings/user/{userId}/completed`| Đơn đã hoàn thành | Authenticated |
| | `PUT` | `/bookings/{id}/status` | Đổi trạng thái (`CONFIRMED`, `CANCELLED`...) | **Admin / User** |
| | `PUT` | `/bookings/{id}/payment` | Cập nhật trạng thái thanh toán | **Admin / User** |
| | `PUT` | `/bookings/{id}/cancel` | Hủy đơn đặt | Authenticated |
| **Thanh toán (Payments)** | `POST` | `/payments/process` | Xử lý thanh toán thẻ/ví điện tử | Authenticated |
| **Đánh giá (Reviews)** | `POST` | `/reviews` | Viết đánh giá cho tour đã hoàn thành | Authenticated |
| | `GET` | `/reviews/destination/{id}` | Xem toàn bộ đánh giá của 1 tour | Public |
| | `GET` | `/reviews/user/{userId}` | Xem các đánh giá của người dùng | Authenticated |
| **Yêu thích (Favorites)** | `POST` | `/favorites/toggle` | Thêm/Xóa tour khỏi danh sách yêu thích | Authenticated |
| | `GET` | `/favorites/user/{userId}` | Lấy danh sách tour yêu thích | Authenticated |
| **Thông báo (Notifications)**| `GET` | `/notifications/{userId}` | Lấy thông báo của người dùng | Authenticated |
| | `PUT` | `/notifications/{id}/read` | Đánh dấu thông báo đã đọc | Authenticated |
| | `GET` | `/notifications/{userId}/unread-count` | Số lượng thông báo chưa đọc | Authenticated |

---

## 7. GỢI Ý ĐỂ HOÀN THIỆN ĐẦY ĐỦ CHỨC NĂNG ADMIN
Để dự án hoàn thiện 100% chức năng Admin cả về Backend và Giao diện:
1. **Hoàn thiện RBAC Backend:**
   - Kích hoạt phân quyền trong `SecurityConfig.java`: Phân chia URL `requestMatchers("/admin/**").hasRole("ADMIN")`.
   - Sinh JWT Token thực thụ chứa Claim `role: "ADMIN"`.
2. **Xây dựng Giao diện Admin:**
   - Khuyến nghị xây dựng một **Web Admin Portal riêng** (bằng ReactJS / Next.js hoặc tích hợp màn hình Admin riêng trên Mobile dành riêng cho tài khoản có `role === 'ADMIN'`).
   - Màn hình gồm: Thống kê doanh thu, Bảng duyệt đơn đặt tour, Bảng thêm/sửa/xóa Tour du lịch.
