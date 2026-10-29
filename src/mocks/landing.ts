export interface TestimonialItem {
  id: string
  authorName: string
  role: string
  centerName: string
  avatar: string
  content: string
  rating: number
  metrics: string
}

export interface MetricItem {
  value: string
  label: string
  detail: string
}

export interface FaqItem {
  question: string
  answer: string
}

export const mockMetrics: MetricItem[] = [
  { value: '35+', label: 'Trung tâm tin dùng', detail: 'Tại TP.HCM, Hà Nội, Đà Nẵng, Cần Thơ' },
  { value: '48.000+', label: 'Học viên hoạt động', detail: 'Luyện tập phát âm & bài viết mỗi ngày' },
  { value: '94.2%', label: 'Đạt target cam kết', detail: 'Học viên thi đạt mục tiêu ngay lần 1' },
  { value: '70%', label: 'Tiết kiệm thời gian', detail: 'Giáo viên giảm tải việc chấm bài thủ công' },
]

export const mockTestimonials: TestimonialItem[] = [
  {
    id: 't_01',
    authorName: 'ThS. Trần Thu Trang',
    role: 'Nhà sáng lập & CEO',
    centerName: 'Học viện Anh ngữ IvyPath Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    content:
      'Trước đây, các thầy cô của trung tâm mất tới 25-30 phút để chấm và sửa từng bài IELTS Writing cho học viên. Từ khi áp dụng EnglishFlow LMS với AI chấm theo 4 tiêu chí chuẩn khảo thí, giáo viên chỉ cần 3 phút để xem lại và duyệt lời nhận xét. Tốc độ trả bài tăng gấp 8 lần, phụ huynh cực kỳ hài lòng!',
    rating: 5,
    metrics: 'Tăng 250% tỷ lệ tái đăng ký khóa học',
  },
  {
    id: 't_02',
    authorName: 'Thầy James Robertson',
    role: 'Giám đốc Học vụ',
    centerName: 'Apex Language Institute TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    content:
      'Tính năng phân tích âm vị IPA của EnglishFlow là đột phá. Học viên Việt Nam thường gặp khó khăn với âm đuôi (ending sounds) và trọng âm (word stress). AI chỉ rõ từng từ bị phát âm lệch và đưa ra bài tập uốn âm ngay lập tức. Đây thực sự là vị trợ lý đắc lực cho lớp học.',
    rating: 5,
    metrics: '89% học viên tăng ít nhất 1.0 band Speaking',
  },
  {
    id: 't_03',
    authorName: 'Chị Lê Mai Phương',
    role: 'Giám đốc Vận hành',
    centerName: 'Chuỗi Anh ngữ GlobalPass Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    content:
      'Hệ sinh thái Multi-tenant giúp chúng tôi quản lý mượt mà cả 4 chi nhánh trong một giao diện duy nhất. Phân quyền chặt chẽ giữa Quản lý cơ sở, Giáo viên và Phụ huynh. Tính năng gửi báo cáo kết quả tự động đã giúp giảm hẳn khối lượng việc cho bộ phận chăm sóc khách hàng.',
    rating: 5,
    metrics: 'Tiết kiệm hơn 40 triệu đồng chi phí vận hành/tháng',
  },
]

export const mockFaqs: FaqItem[] = [
  {
    question: 'EnglishFlow LMS có hỗ trợ kết nối với tên miền riêng (Custom Domain) của trung tâm không?',
    answer:
      'Hoàn toàn có! Với gói Professional và Enterprise, trung tâm của bạn có thể gắn tên miền riêng (ví dụ: hoc.ieltsmaster.edu.vn) hoặc subdomain riêng. Toàn bộ logo, màu sắc thương hiệu và chân trang đều được đồng bộ chuyên nghiệp.',
  },
  {
    question: 'AI chấm bài Writing và Speaking có thực sự chính xác theo barem IELTS/TOEIC không?',
    answer:
      'Mô hình AI của EnglishFlow được huấn luyện và tinh chỉnh chuyên sâu theo 4 tiêu chuẩn khảo thí quốc tế: Task Achievement, Coherence & Cohesion, Lexical Resource, và Grammatical Range. Đồng thời, giáo viên của trung tâm luôn có quyền xem lại, điều chỉnh điểm số và bổ sung lời khuyên trước khi học viên nhận kết quả chính thức (Co-pilot Mode).',
  },
  {
    question: 'Hệ thống có thể chuyển dữ liệu học viên từ bảng Excel hoặc phần mềm cũ sang không?',
    answer:
      'Có sẵn tính năng Import bằng Excel một chạm. Đội ngũ kỹ thuật của EnglishFlow cũng hỗ trợ chuyển giao toàn bộ danh sách lớp học, giáo viên và học viên của trung tâm miễn phí trong vòng 24 giờ sau khi ký hợp đồng.',
  },
  {
    question: 'Trung tâm có thể thanh toán theo từng tháng hay bắt buộc đóng cả năm?',
    answer:
      'Trung tâm có thể linh hoạt thanh toán theo từng tháng hoặc đóng theo năm để nhận ưu đãi chiết khấu lên đến 20%. Bạn có thể nâng cấp hoặc hạ gói cước bất kỳ lúc nào tùy theo số lượng học sinh thực tế.',
  },
]

