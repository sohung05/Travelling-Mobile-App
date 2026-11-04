# Travelling App

Ứng dụng du lịch di động được xây dựng bằng React Native và Spring Boot, cho phép người dùng khám phá, đặt chỗ và quản lý các chuyến đi du lịch.

## 📱 Công nghệ sử dụng

### Frontend (React Native)
- **Framework**: React Native với Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: Context API (AuthContext)
- **UI Libraries**: 
  - Expo Linear Gradient
  - React Native Safe Area Context
  - Ionicons
- **Storage**: AsyncStorage
- **Date Picker**: @react-native-community/datetimepicker

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Database**: MongoDB Atlas (Cloud)
- **Cache**: Redis (Docker)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: BCrypt
- **API Documentation**: OpenAPI/Swagger
- **Caching**: Spring Cache với Redis

## 🎯 Tính năng chính

### 1. Xác thực & Quản lý người dùng
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập (Email/Password)
- ✅ Đăng xuất
- ✅ Chế độ Guest (truy cập hạn chế)
- ✅ Xác thực sinh trắc học (Face ID/Fingerprint)
- ✅ Đổi mật khẩu
- ✅ Avatar mặc định cho người dùng mới
- ✅ Cập nhật thông tin cá nhân

### 2. Khám phá điểm đến
- ✅ Trang chủ với điểm đến nổi bật
- ✅ Danh mục điểm đến (Bãi biển, Núi, Thành phố, v.v.)
- ✅ Tìm kiếm điểm đến
- ✅ Lọc nâng cao (giá, đánh giá, khoảng cách)
- ✅ Chi tiết điểm đến với thông tin đầy đủ
- ✅ Đánh giá và nhận xét
- ✅ Xem tất cả đánh giá
- ✅ Hiển thị đánh giá real-time

### 3. Yêu thích
- ✅ Thêm/xóa điểm đến yêu thích
- ✅ Đồng bộ trạng thái yêu thích trên tất cả màn hình
- ✅ Lưu trữ yêu thích trên backend
- ✅ Yêu cầu đăng nhập để sử dụng tính năng

### 4. Đặt chỗ & Thanh toán
- ✅ Chọn dịch vụ tour (Cơ bản, Cao cấp, Luxury)
- ✅ Chọn dịch vụ bổ sung (Chụp ảnh, v.v.)
- ✅ Chọn ngày khởi hành (chỉ sau ngày hiện tại)
- ✅ Tự động tính ngày kết thúc dựa trên thời lượng tour
- ✅ Chọn số lượng khách (1-8 người)
- ✅ Tính tổng giá tự động
- ✅ Nhiều phương thức thanh toán:
  - Thẻ tín dụng
  - Ví điện tử
  - Chuyển khoản ngân hàng
  - Thanh toán khi nhận dịch vụ
- ✅ Trạng thái đơn đặt chỗ:
  - **Confirmed** (Đã xác nhận): Khi thanh toán online
  - **Pending** (Chờ xử lý): Khi thanh toán khi nhận dịch vụ
- ✅ Chi tiết đặt chỗ với đầy đủ thông tin
- ✅ Lưu trữ booking trên backend với userId

### 5. Quản lý đặt chỗ
- ✅ Danh sách các chuyến đi đã đặt
- ✅ Phân loại theo trạng thái (Sắp tới, Đã hoàn thành, Đã hủy)
- ✅ Chi tiết đặt chỗ
- ✅ Đánh giá tour sau khi hoàn thành
- ✅ Kiểm tra trùng lặp đánh giá (1 tour chỉ đánh giá 1 lần)
- ✅ Persist bookings sau khi logout/login

### 6. Đánh giá & Nhận xét
- ✅ Đánh giá tour với số sao (1-5)
- ✅ Viết nhận xét (tối thiểu 10 ký tự)
- ✅ Hiển thị đánh giá của người dùng khác
- ✅ Tính điểm đánh giá trung bình real-time
- ✅ Hiển thị ngày đánh giá
- ✅ Tự động set ngày tạo cho đánh giá (MongoDB Auditing)
- ✅ Hiển thị avatar và tên người đánh giá
- ✅ Xem tất cả đánh giá của điểm đến

### 7. Hồ sơ người dùng
- ✅ Thông tin cá nhân (tên, email, số điện thoại, ngày sinh, giới tính, địa chỉ)
- ✅ Thay đổi avatar (từ thư viện ảnh hoặc camera)
- ✅ Chỉnh sửa thông tin
- ✅ Thống kê chuyến đi và yêu thích
- ✅ **Guest Mode**: Cho phép truy cập giới hạn
  - Hiển thị trang Hồ sơ với UI Guest
  - Yêu cầu đăng nhập khi truy cập tính năng cần auth
  - Nút đăng nhập nổi bật

### 8. Cài đặt & Bảo mật
- ✅ Đổi mật khẩu
- ✅ Tắt modal đổi mật khẩu bằng cách tap bên ngoài
- ✅ Hiển thị/ẩn mật khẩu
- ✅ Xác thực sinh trắc học (Fingerprint/Face ID)
- ✅ Lưu mật khẩu cho đăng nhập sinh trắc học
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt)
- ✅ Thông báo

### 9. Hỗ trợ & Thông tin
- ✅ Trung tâm trợ giúp
- ✅ Điều khoản dịch vụ
- ✅ Chính sách bảo mật
- ✅ Về chúng tôi

## 🔐 Bảo mật

### Mã hóa mật khẩu
- Backend sử dụng BCrypt để hash password
- Không lưu trữ plain text password
- Password được hash trước khi lưu vào database
- So sánh password bằng `passwordEncoder.matches()`

### Xác thực
- JWT tokens cho authentication
- Token được lưu trong AsyncStorage
- Auto-refresh user data sau khi login
- Biometric authentication cho truy cập nhanh

### Phân quyền
- Guest mode: Chỉ xem, không thể đặt chỗ, yêu thích, đánh giá
- Authenticated users: Full access
- Pending navigation: Lưu màn hình người dùng muốn truy cập trước khi login
```


## 🚀 Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống

- **Node.js** (v16 trở lên)
- **Java JDK** (v17 trở lên)
- **Maven** (hoặc sử dụng Maven Wrapper)
- **Docker Desktop** (cho Redis)
- **MongoDB Atlas Account** (miễn phí)
- **Expo CLI** (cho React Native)

---

### Bước 1: Thiết lập MongoDB Atlas

1. **Tạo tài khoản MongoDB Atlas**:
   - Truy cập: https://www.mongodb.com/cloud/atlas
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster**:
   - Chọn "Create a Cluster"
   - Chọn "Shared" (M0 - Free tier)
   - Chọn region gần bạn nhất
   - Đặt tên cluster (ví dụ: `Cluster0`)
   - Click "Create Cluster"

3. **Tạo Database User**:
   - Vào "Security" → "Database & Network Access" → "Database Access"
   - Click "Add New Database User"
   - Chọn "Password" authentication
   - Nhập username và password (lưu lại để dùng sau)
   - Chọn "Atlas admin" hoặc "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**:
   - Vào "Network Access"
   - Click "Add IP Address"
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
   - Hoặc "Add Current IP Address" cho production
   - Click "Confirm"

5. **Lấy Connection String**:
   - Vào "Database" → "Clusters"
   - Click "Connect" bên cạnh cluster
   - Chọn "Connect your application"
   - Chọn Driver: "Java", Version: "5.5 or later"
   - Copy connection string (sẽ có dạng):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

---

### Bước 2: Thiết lập Redis (Docker)

1. **Khởi động Docker Desktop**

2. **Chạy Redis container**:
```bash
docker run -d --name redis-travel-app -p 6379:6379 redis:latest
```

3. **Kiểm tra Redis đang chạy**:
```bash
docker ps
```

---

### Bước 3: Cấu hình Backend

1. **Di chuyển vào thư mục backend**:
```bash
cd Travelling_App_BE
```

2. **Cấu hình MongoDB Atlas**:
   - Mở file `src/main/resources/application.yml`
   - Tìm dòng `spring.data.mongodb.uri`
   - Thay thế connection string:
     ```yaml
     spring:
       data:
         mongodb:
           uri: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/travelling_db?retryWrites=true&w=majority
     ```
   - **Lưu ý**: 
     - Thay `<username>` và `<password>` bằng thông tin bạn đã tạo
     - Thay `cluster0.xxxxx` bằng cluster name thực tế
     - Thêm `/travelling_db` trước dấu `?` để chỉ định database name
     - Nếu password có ký tự đặc biệt, cần URL-encode (ví dụ: `@` → `%40`)

3. **Kiểm tra Redis configuration** (đã có sẵn):
   ```yaml
   spring:
     data:
       redis:
         host: localhost
         port: 6379
   ```

4. **Build project** (tùy chọn):
```bash
./mvnw clean install
```

5. **Chạy Backend**:
   - **Cách 1: IntelliJ IDEA**
     - Mở project trong IntelliJ
     - Run `TravellingAppBeApplication.java`
   
   - **Cách 2: Command Line**:
     ```bash
     ./mvnw spring-boot:run
     ```

6. **Kiểm tra Backend đang chạy**:
   - Backend sẽ chạy tại: `http://localhost:8080/api`
   - Swagger UI: `http://localhost:8080/api/swagger-ui.html`
   - Kiểm tra logs để đảm bảo kết nối MongoDB Atlas thành công:
     ```
     Monitor thread successfully connected to server
     ```

---

### Bước 4: Cấu hình Frontend

1. **Di chuyển vào thư mục frontend**:
```bash
cd font-end
```

2. **Cài đặt dependencies**:
```bash
npm install
```

3. **Cấu hình API endpoint** (QUAN TRỌNG):
   
   **Mở file `src/api/config.ts`** và cấu hình 2 biến:
   
   **A. Tìm IP local của máy tính:**
   ```bash
   # Windows
   ipconfig
   # Tìm dòng "IPv4 Address" → ví dụ: 192.168.1.100
   
   # Mac/Linux
   ifconfig
   # Hoặc
   ip addr
   ```
   
   **B. Cập nhật trong `config.ts`:**
   
   - **Dòng 29** - Cập nhật `LOCAL_IP`:
     ```typescript
     const LOCAL_IP = '192.168.1.100'; // ⚠️ Thay bằng IP của bạn!
     ```
   
   - **Dòng 32** - Cấu hình `PRODUCTION_URL`:
     
     **Nếu Backend chạy trên LOCAL (máy tính):**
     ```typescript
     const PRODUCTION_URL = 'http://192.168.1.100:8080/api'; // ⚠️ Dùng IP local!
     ```
     - Thay `192.168.1.100` bằng IP bạn vừa tìm được
     - **Lưu ý**: Điện thoại và máy tính PHẢI cùng mạng WiFi
     
     **Nếu Backend deploy trên CLOUD (Heroku, AWS, v.v.):**
     ```typescript
     const PRODUCTION_URL = 'https://your-backend-url.com/api';
     // Ví dụ: 'https://travelling-app-backend.herokuapp.com/api'
     ```
     - Phải dùng HTTPS (không dùng HTTP)
   
   **C. Giải thích:**
   - `LOCAL_IP`: Dùng khi chạy `expo start` (development mode)
   - `PRODUCTION_URL`: Dùng khi build APK/IPA với EAS Build (production mode)
   - App sẽ tự động chọn URL phù hợp dựa trên mode

4. **Chạy Frontend**:
```bash
npx expo start
```

5. **Mở ứng dụng**:
   - Quét QR code bằng Expo Go app (iOS/Android)
   - Hoặc nhấn `a` cho Android emulator
   - Hoặc nhấn `i` cho iOS simulator

---

### Bước 5: Kiểm tra kết nối

1. **Kiểm tra Backend**:
   - Mở browser: `http://localhost:8080/api/swagger-ui.html`
   - Test API endpoints

2. **Kiểm tra Frontend**:
   - Mở app trên điện thoại/emulator
   - Kiểm tra kết nối với backend
   - Test đăng ký/đăng nhập

3. **Kiểm tra MongoDB Atlas**:
   - Vào MongoDB Atlas Dashboard
   - "Database" → "Browse Collections"
   - Kiểm tra database `travelling_db` và các collections

4. **Kiểm tra Redis Cache**:
```bash
docker exec -it redis-travel-app redis-cli KEYS "*"
```

---

### 🔧 Troubleshooting

#### Backend không kết nối được MongoDB Atlas
- ✅ Kiểm tra IP đã được whitelist chưa
- ✅ Kiểm tra username/password đúng chưa
- ✅ Kiểm tra connection string có database name (`/travelling_db`)
- ✅ Kiểm tra password có ký tự đặc biệt cần URL-encode

#### Frontend không kết nối được Backend
- ✅ Kiểm tra `LOCAL_IP` và `PRODUCTION_URL` trong `config.ts` đúng chưa
- ✅ Kiểm tra Backend đang chạy tại port 8080
- ✅ Kiểm tra firewall không chặn port 8080
- ✅ Đảm bảo điện thoại và máy tính cùng mạng WiFi (nếu backend local)
- ✅ Nếu build APK: Kiểm tra `PRODUCTION_URL` đúng (không dùng `LOCAL_IP`)
- ✅ Test API bằng browser: `http://YOUR_IP:8080/api/destinations`

#### Redis không chạy
- ✅ Kiểm tra Docker Desktop đang chạy
- ✅ Kiểm tra container: `docker ps`
- ✅ Restart container: `docker restart redis-travel-app`

---

### 📚 API Documentation

Sau khi backend chạy, truy cập:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api/api-docs`

---

## 📱 Build App với EAS Build

### Yêu Cầu

- **EAS CLI**: `npm install -g eas-cli`
- **Expo account**: Đăng ký miễn phí tại https://expo.dev
- **Đã cấu hình IP** trong `font-end/src/api/config.ts` (xem Bước 4)

### Các Bước Build

1. **Đăng nhập Expo**:
```bash
cd font-end
eas login
```

2. **Cấu hình EAS** (đã có file `eas.json`):
```bash
eas build:configure
```

3. **Build Development Build** (cho testing):
```bash
# Android
eas build --profile development --platform android

# iOS (cần Apple Developer account)
eas build --profile development --platform ios
```

4. **Build Preview Build** (APK cho Android):
```bash
eas build --profile preview --platform android
```

5. **Tải và cài APK**:
   - EAS sẽ cung cấp link download sau khi build xong
   - Tải APK về điện thoại và cài đặt

### Lưu Ý Quan Trọng

- ⚠️ **EAS Build chỉ build frontend**, backend vẫn phải chạy riêng
- ⚠️ **Cấu hình `PRODUCTION_URL`** trong `config.ts` trước khi build
- ⚠️ Nếu backend local: Đảm bảo IP đúng và điện thoại cùng mạng WiFi
- ⚠️ Nếu backend cloud: Đảm bảo URL đúng và accessible

### Xem Chi Tiết

Xem file `font-end/EAS_BUILD_GUIDE.md` (nếu có) hoặc tài liệu: https://docs.expo.dev/build/introduction/

---

## 🔄 Luồng hoạt động

### 1. Đăng ký và đăng nhập
1. User đăng ký tài khoản mới
2. Backend hash password và lưu vào database
3. Backend trả về user info và JWT token
4. Frontend lưu token và user info vào AsyncStorage
5. Tự động load favorites và bookings

### 2. Đặt chỗ tour
1. User chọn điểm đến và nhấn "Đặt ngay"
2. Nếu chưa đăng nhập → Lưu pending tour → Yêu cầu login
3. Chọn dịch vụ tour và ngày khởi hành
4. Ngày kết thúc được tự động tính dựa trên duration
5. Chọn số lượng khách và phương thức thanh toán
6. Tổng giá được tính tự động (base price + services) × guests
7. Xác nhận thanh toán
8. Backend lưu booking với status:
   - CONFIRMED + PAID: Nếu thanh toán online
   - PENDING: Nếu thanh toán khi nhận dịch vụ
9. Booking được lưu với userId và persist sau logout/login

### 3. Đánh giá tour
1. User vào màn hình Bookings
2. Chọn tour đã hoàn thành và nhấn "Đánh giá"
3. Kiểm tra xem đã đánh giá chưa (1 tour chỉ đánh giá 1 lần)
4. Chọn số sao và viết nhận xét
5. Submit đánh giá lên backend
6. Backend lưu review với userId, userName, userAvatar
7. Cập nhật rating trung bình của destination
8. Hiển thị đánh giá mới trong danh sách

### 4. Guest Mode
1. User vào app lần đầu → Chế độ Guest
2. Có thể xem Home, Explore, chi tiết điểm đến
3. Khi nhấn vào Bookings/Favorites/Profile features:
   - Lưu pending screen
   - Chuyển đến Login
4. Sau khi đăng nhập thành công:
   - Quay về màn hình pending (nếu có)
   - Hoặc về Home (nếu không có pending)

## 🐛 Các vấn đề đã giải quyết

1. ✅ **Login credentials không khớp**: Sửa logic hash password trong backend
2. ✅ **Favorite không sync**: Cập nhật cả `userFavorites` và `user.favorites`
3. ✅ **Bookings mất sau logout**: Thêm userId vào booking request
4. ✅ **TotalPrice không đúng**: Truyền totalPrice từ frontend xuống backend
5. ✅ **Payment method hiển thị ID**: Map ID sang tên trước khi lưu
6. ✅ **Tour image không load**: Thêm fallback cho imageUrl
7. ✅ **End date selection logic**: Tự động tính end date, không cho chọn
8. ✅ **Rating NaN**: Xử lý trường hợp initial null rating
9. ✅ **Review date không real-time**: Bật MongoDB Auditing
10. ✅ **User name không hiển thị**: Map fullName sang name trong API service
11. ✅ **Guest bị redirect khỏi Profile**: Cho phép Guest xem Profile với UI giới hạn
12. ✅ **Pending screen sau logout**: Clear pending states khi logout

## 📝 TODO / Cải tiến

- [ ] Thêm payment gateway thực tế
- [ ] Push notifications
- [ ] Offline mode
- [ ] Social login (Google, Facebook)
- [ ] Multi-language support (English, Japanese, etc.)
- [ ] Dark mode
- [ ] Chat với support
- [ ] Chia sẻ lên social media
- [ ] Xuất vé PDF
- [ ] Tích hợp maps để xem vị trí điểm đến
- [ ] Lịch sử tìm kiếm
- [ ] Gợi ý điểm đến dựa trên lịch sử

## 👥 Team

- **Frontend Developer**: React Native Development
- **Backend Developer**: Spring Boot & MongoDB
- **UI/UX Designer**: Application Design

## 📄 License

This project is for educational purposes.

---------------------------

**Version**: 1.0.0  
**Last Updated**: November 10 2025

