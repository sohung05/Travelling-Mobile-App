import { Platform } from 'react-native';
import { ChatMessage } from '../types';

// Cấu hình URL endpoint của AI Chatbot Service (từ dự án ai-pdf-chatbot-langchain)
// Khi khởi chạy backend của ai-pdf-chatbot-langchain (ví dụ chạy trên port 3000)
const LOCAL_IP = '192.168.1.27';

const getAiChatbotUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api/chat';
  }
  return `http://${LOCAL_IP}:3000/api/chat`;
};

// Dữ liệu gợi ý câu hỏi mẫu ban đầu (kế thừa từ example-prompts của ai-pdf-chatbot-langchain)
export const TRAVEL_PROMPT_SUGGESTIONS = [
  {
    id: '1',
    icon: 'beach-outline',
    title: 'Gợi ý tour biển mùa hè',
    prompt: 'Gợi ý cho tôi các tour du lịch biển đẹp và giá hợp lý trong nước và quốc tế?',
  },
  {
    id: '2',
    icon: 'airplane-outline',
    title: 'Lịch trình Tokyo 5 ngày',
    prompt: 'Lịch trình khám phá Tokyo 5 ngày 4 đêm có những điểm đến nổi bật nào?',
  },
  {
    id: '3',
    icon: 'pricetag-outline',
    title: 'Tour tiết kiệm dưới 3 triệu',
    prompt: 'Tôi có ngân sách dưới 3.000.000 VNĐ, có tour nào phù hợp không?',
  },
  {
    id: '4',
    icon: 'document-text-outline',
    title: 'Chính sách hoàn hủy tour',
    prompt: 'Quy định hủy tour và hoàn tiền của Travelling App như thế nào?',
  },
  {
    id: '5',
    icon: 'sunny-outline',
    title: 'Kinh nghiệm du lịch Bali',
    prompt: 'Đi du lịch Bali nên đi vào tháng mấy và cần chuẩn bị những gì?',
  },
];

// Cơ sở tri thức AI dự phòng (chuyên sâu du lịch) trong lúc chờ nạp file PDF thực tế
const KNOWLEDGE_RESPONSES: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['tokyo', 'nhật bản', 'japan'],
    answer: `🌸 **Tour Tokyo, Nhật Bản (7 ngày 6 đêm):**
- **Giá tham khảo:** 3.200.000 VNĐ (Gói cơ bản) - 4.500.000 VNĐ (Gói VIP).
- **Điểm nổi bật:**
  1. Tháp truyền hình Tokyo Tower & Tokyo Skytree ngắm toàn cảnh thành phố.
  2. Đền cổ Senso-ji tại Asakusa mang đậm nét truyền thống.
  3. Ngã tư Shibuya nhộn nhịp bậc nhất thế giới và phố mua sắm Shinjuku.
  4. Núi Phú Sĩ & làng cổ Oshino Hakkai.
- **Thời điểm lý tưởng:** Tháng 3 - 5 (Ngắm hoa anh đào) hoặc Tháng 10 - 11 (Mùa lá đỏ).`,
  },
  {
    keywords: ['bali', 'indonesia'],
    answer: `🌴 **Tour Thiên đường Bali, Indonesia (6 ngày 5 đêm):**
- **Giá tham khảo:** 1.800.000 VNĐ / người.
- **Trải nghiệm không thể bỏ qua:**
  1. Ngắm hoàng hôn tuyệt mỹ tại đền trên biển Tanah Lot.
  2. Khám phá ruộng bậc thang Tegalalang và xích đu Bali Swing tại Ubud.
  3. Trekking đón bình minh trên đỉnh núi lửa Batur.
  4. Thư giãn tại các bãi biển cát trắng Kuta, Nusa Dua.
- **Thời điểm lý tưởng:** Tháng 4 đến tháng 10 (Mùa khô, nắng đẹp, biển êm).`,
  },
  {
    keywords: ['paris', 'pháp', 'france'],
    answer: `✨ **Tour Paris - Kinh đô Ánh sáng, Pháp (5 ngày 4 đêm):**
- **Giá tham khảo:** 2.500.000 VNĐ / người.
- **Các điểm tham quan chính:**
  1. Tháp Eiffel tráng lệ về đêm.
  2. Bảo tàng Louvre chiêm ngưỡng bức họa nàng Mona Lisa.
  3. Nhà thờ Đức Bà Paris & Du thuyền trên sông Seine thơ mộng.
  4. Khải Hoàn Môn & đại lộ Champs-Élysées.`,
  },
  {
    keywords: ['biển', 'beach', 'nghỉ dưỡng'],
    answer: `🏖️ **Gợi ý các điểm đến biển tuyệt vời nhất:**
1. **Bali, Indonesia:** Thiên đường nhiệt đới, sóng biển đẹp, dịch vụ spa thư giãn đỉnh cao (từ 1.800.000 VNĐ).
2. **Santorini, Hy Lạp:** Biển Aegean trong vắt, hoàng hôn Oia lãng mạn với kiến trúc vòm xanh trắng (từ 2.800.000 VNĐ).
3. **Phú Quốc / Nha Trang / Đà Nẵng:** Các bãi biển ngọc bích trong nước với hải sản tươi ngon và chi phí rất tiết kiệm!`,
  },
  {
    keywords: ['giá', 'dưới 3 triệu', 'tiết kiệm', 'ngân sách', 'rẻ', 'chi phí'],
    answer: `💰 **Các tour có mức giá cực kỳ ưu đãi (dưới 3.000.000 VNĐ):**
1. **Bali, Indonesia (6 ngày):** Giá chỉ từ **1.800.000 VNĐ**.
2. **Paris, Pháp (5 ngày):** Giá chỉ từ **2.500.000 VNĐ**.
3. **Santorini, Hy Lạp (5 ngày):** Giá chỉ từ **2.800.000 VNĐ**.
*(Tất cả tour đều đã bao gồm xe đưa đón, bữa sáng, hướng dẫn viên và bảo hiểm du lịch cơ bản)*.`,
  },
  {
    keywords: ['hủy', 'hoàn tiền', 'chính sách', 'đổi tour', 'cancel'],
    answer: `📜 **Chính sách Hủy tour & Hoàn tiền của Travelling App:**
- **Hủy trước 7 ngày:** Hoàn tiền **100%** không mất phí.
- **Hủy trước 3 - 6 ngày:** Hoàn tiền **70%** tổng giá trị tour.
- **Hủy trước 24 - 48 giờ:** Hoàn tiền **50%**.
- **Hủy trong vòng 24 giờ:** Không hỗ trợ hoàn tiền.
👉 Để hủy tour: Bạn chỉ cần vào tab **Trips (Chuyến đi)** -> Chọn tour sắp tới -> Bấm **"Hủy tour"**.`,
  },
  {
    keywords: ['thanh toán', 'payment', 'trả tiền', 'cod'],
    answer: `💳 **Các phương thức thanh toán được hỗ trợ:**
1. **Thẻ tín dụng / Ghi nợ quốc tế (Visa, MasterCard)**: Xác nhận tự động tức thì.
2. **Ví điện tử (MoMo, ZaloPay)**: Quét mã QR tiện lợi.
3. **Chuyển khoản ngân hàng trực tuyến**.
4. **Thanh toán khi nhận dịch vụ (COD)**: Đơn đặt của bạn sẽ ở trạng thái Chờ xử lý (Pending) và thanh toán cho điều hành tour khi bắt đầu chuyến đi.`,
  },
];

export const chatbotService = {
  /**
   * Gửi tin nhắn đến AI Chatbot
   * Tự động kết nối backend LangGraph hoặc fallback sang Smart Knowledge Base nếu chưa bật server AI
   */
  async sendMessage(message: string, threadId: string = 'travel_session_default'): Promise<string> {
    const trimmed = message.trim();
    if (!trimmed) {
      return 'Xin lỗi, tôi chưa nhận được câu hỏi. Bạn vui lòng nhập lại nhé!';
    }

    try {
      // Cố gắng gọi API backend LangChain nếu server đang hoạt động
      const apiUrl = getAiChatbotUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // Timeout 3.5s

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          threadId: threadId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.reply || data.content || data.answer) {
          return data.reply || data.content || data.answer;
        }
      }
    } catch (err) {
      // Backend AI chưa chạy hoặc đang offline -> dùng Knowledge Base thông minh
      console.log('🤖 AI Server fallback: Serving from local Travel Knowledge Base');
    }

    // Giả lập thời gian suy nghĩ 600ms tạo hiệu ứng typing mượt mà
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lowerQuery = trimmed.toLowerCase();

    // Tìm kiếm trong kho tri thức du lịch
    for (const item of KNOWLEDGE_RESPONSES) {
      if (item.keywords.some((kw) => lowerQuery.includes(kw))) {
        return item.answer;
      }
    }

    // Phản hồi tổng quát thân thiện
    return `Cảm ơn bạn đã hỏi về "${trimmed}"! 

Hiện tại tôi đã ghi nhận thắc mắc của bạn. Với tư cách là Trợ lý du lịch Travelling App, tôi có thể hỗ trợ bạn:
- 🏖️ **Tìm kiếm & gợi ý điểm đến:** Khám phá các tour biển, đồi núi, văn hóa, nghỉ dưỡng cao cấp.
- 📅 **Lập lịch trình chi tiết:** Lên kế hoạch từng ngày cho chuyến đi (Tokyo, Bali, Paris, Dubai...).
- 💰 **Tư vấn ngân sách & giá tour:** So sánh các gói dịch vụ cơ bản và cao cấp.
- 📋 **Hỗ trợ chính sách:** Giải đáp quy định đặt vé, thanh toán và hoàn hủy tour.

Bạn có thể chọn một trong các câu hỏi gợi ý bên dưới hoặc hỏi chi tiết hơn về địa danh bạn quan tâm nhé! 🌍`;
  },
};
