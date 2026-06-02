import { sanitizeSourceSummary, type SourceLedgerEntry } from './tools/source-ledger-utils'

type ContentPackInline = string | { text: string; url?: string }

type ContentPackBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; children: ContentPackInline[] }
  | { type: 'list'; items: string[] }

type ContentPack = {
  blocks: ContentPackBlock[]
}

function sourceLink(source: SourceLedgerEntry) {
  return source.url ? { text: source.title, url: source.url } : source.title
}

function sourceSummary(source: SourceLedgerEntry, maxLength = 220) {
  return sanitizeSourceSummary(source.summary, maxLength)
}

function buildShortFormParagraphs(topic: string, sources: SourceLedgerEntry[]) {
  const summaries = sources.slice(0, 3).map((source) => sourceSummary(source))
  return [
    `${topic} là chủ đề phù hợp cho một bài blog ngắn tập trung vào giá trị thực dụng, điểm mạnh, và bối cảnh dùng thực tế.`,
    summaries.length
      ? `Nguồn research chính: ${summaries.join(' / ')}.`
      : 'Bản nháp này dựa trên bối cảnh bạn đưa ra và cần thêm nguồn nếu muốn đẩy thành bài dài.',
    `Nên chốt bài theo 3 phần: ${topic} là gì, nên dùng khi nào, và giới hạn cần lưu ý trước khi triển khai.`,
  ]
}

function buildLongFormParagraphs(topic: string, sources: SourceLedgerEntry[]) {
  const sourceSummaries = sources.slice(0, 4).map((source) => ({
    title: source.title,
    summary: sourceSummary(source, 320),
  }))
  const combinedSourceTitles = sourceSummaries.map((source) => source.title).join(', ')
  const combinedSourceSummaries = sourceSummaries.map((source) => source.summary).join(' / ')

  return [
    `${topic} là chủ đề đáng để viết dài hơn vì nó nằm giữa nhiều bài toán mà team kỹ thuật gặp hằng ngày: pipeline dần phức tạp hơn, release cần giảm rủi ro, và quy trình deploy cần rõ ràng khi số người tham gia tăng lên. Bài nháp này nên đi theo góc nhìn thực dụng, nghĩa là tập trung vào vấn đề vận hành và quyết định của team, không biến thành một bài liệt kê tính năng.`,
    `${topic} có thể được nhìn như một lớp điều phối cho nhiều khoảnh khắc quan trọng trong software delivery: từ build, xác thực chất lượng, phê duyệt, đến rollout và quan sát sau deploy. Từ bộ research vừa lấy được, các mảnh thông tin nổi bật đang xoay quanh ${combinedSourceTitles || topic}. Chi tiết này gợi ý rằng bài viết không nên đóng khung trong một phân hệ nhỏ, mà nên mô tả nó như một thành phần của toàn bộ workflow giao phần mềm.`,
    combinedSourceSummaries
      ? `Nếu tóm tắt nhanh các nguồn research, bức tranh chung hiện ra là: ${combinedSourceSummaries}. Khi chuyển hóa thành bài đọc 5-7 phút, đoạn này nên được viết lại theo văn phong tranh luận và tổng hợp, để người đọc hiểu được điều gì đến từ tài liệu gốc, điều gì là suy luận vận hành, và điều gì là khuyến nghị có điều kiện.`
      : 'Nếu chưa có đủ source summary dài, bài viết vẫn nên giữ một trục rõ ràng: mô tả vấn đề, diễn giải giá trị vận hành, và chỉ ra giới hạn để người đọc không kỳ vọng quá mức.',
    `${topic} phù hợp nhất khi team đã có mức độ phức tạp nhất định: nhiều service, nhiều môi trường, nhiều nhóm phối hợp, hoặc quy trình release cần audit để đáp ứng chính sách nội bộ. Nếu team vẫn nhỏ, release chưa nhiều, và không có yêu cầu governance rõ ràng, lợi ích có thể chưa đủ lớn để bù cho chi phí học và chuyển đổi. Bài viết nên nói rõ điểm này thay vì ngầm định rằng công cụ lớn luôn là lựa chọn đúng.`,
    `Một phần quan trọng trong bài viết về ${topic} là “khi nào nên dùng”. Người đọc cần một khung đánh giá đơn giản: team có đang gặp pipeline manh mún giữa nhiều repo không, release có cần approval và rollback rõ ràng không, hay deployment có phải phối hợp giữa engineering và vận hành không. Nếu câu trả lời là có, ${topic} trở nên đáng đánh giá. Nếu không, việc đổi công cụ có thể chỉ làm đổi nghĩa của phức tạp.`,
    `Bài viết cũng nên có phần “khi nào chưa nên dùng”. Đây là điểm giúp nội dung nghe trung thực hơn. Với ${topic}, các dấu hiệu chưa nên đầu tư mạnh có thể là team chưa ổn định test, ownership còn mờ, quy trình review chưa rõ, hoặc vấn đề thật nằm ở kiến trúc và kỷ luật kỹ thuật thay vì ở tầng delivery. Nếu việc có thêm nền tảng mới không giải quyết nguyên nhân gốc, bài viết cần nói thẳng điều đó.`,
    `${topic} cần được đánh giá qua tác động lên lead time, số lần rollback, độ rõ ràng khi audit, và tốc độ onboard thành viên mới. Bài nháp dài hơn nên đề xuất người đọc đo những chỉ số này trước và sau khi thử nghiệm, vì giá trị của nền tảng giao phần mềm hiếm khi nằm ở một demo đẹp. Giá trị thực thường nằm ở khả năng giảm sai sót lặp lại, làm rõ quy trình, và giúp nhiều bên nhìn cùng một trạng thái release.`,
    `Phần trade-off nên được viết kỹ. Team sẽ phải học product model, chuẩn hóa metadata pipeline, và chấp nhận một số quy tắc mới trong workflow. Đó là giá của tính hệ thống. Nếu phần này bị bỏ qua, bài viết sẽ trở thành một bài tổng hợp nghe rất đẹp nhưng không giúp người đọc quyết định. Ở mức đọc 5-7 phút, đây là đoạn nên tạo khác biệt về chất lượng nội dung.`,
    `Phần kết bài nên có bước hành động cụ thể. Cách an toàn là đề xuất người đọc chọn một use case hẹp, đo lead time và tần suất lỗi, thử áp dụng trên một pipeline có tác động thực sự, rồi mới quyết định mở rộng. Với cách viết này, bài nháp về ${topic} sẽ vừa đủ độ sâu để đọc 5-7 phút, vừa giữ được giá trị thực dụng cho team kỹ thuật cần một khung ra quyết định.`,
  ]
}

export function buildDraftParagraphs(topic: string, sources: SourceLedgerEntry[], longForm: boolean) {
  return longForm ? buildLongFormParagraphs(topic, sources) : buildShortFormParagraphs(topic, sources)
}

export function buildStructuredContentPack(topic: string, sources: SourceLedgerEntry[], categorySlug: string | undefined): ContentPack {
  const longFormParagraphs = buildLongFormParagraphs(topic, sources)
  const useCasesByCategory: Record<string, string[]> = {
    devops: [
      'Pipeline đã dài và khó truy vết khi đi qua nhiều bước build, test, approval, và deploy.',
      'Release liên quan đến nhiều môi trường hoặc nhiều nhóm, cần ownership và audit trail rõ ràng hơn.',
      'Team muốn kết hợp continuous delivery và GitOps mà không để workflow bị manh mún giữa nhiều công cụ rời rạc.',
    ],
    automation: [
      'Workflow đang có quá nhiều bước thủ công dễ lặp lỗi.',
      'Team cần một cách mô tả quy trình để nhiều người có thể vận hành giống nhau.',
      'Có nhu cầu chuẩn hóa đầu vào, đầu ra, và trách nhiệm của từng bước tự động hóa.',
    ],
    'ai-news': [
      'Chủ đề đang có tác động rõ lên cách team lựa chọn công cụ hoặc mô hình.',
      'Thông tin mới tạo ra thay đổi về workflow, chi phí, hoặc tốc độ thử nghiệm.',
      'Người đọc cần phân biệt đâu là tín hiệu thật, đâu là lớp marketing xung quanh công nghệ mới.',
    ],
  }

  return {
    blocks: [
      { type: 'heading', level: 2, text: `${topic} là gì và vì sao team kỹ thuật cần quan tâm` },
      { type: 'paragraph', children: [longFormParagraphs[0]] },
      { type: 'paragraph', children: [longFormParagraphs[1]] },
      { type: 'heading', level: 2, text: 'Những bài toán thực tế nên nhìn vào' },
      {
        type: 'list',
        items: useCasesByCategory[categorySlug ?? ''] ?? [
          'Bài toán hiện tại có phải là vấn đề workflow thật, không chỉ là vấn đề thói quen làm việc.',
          'Team có dữ liệu trước và sau khi thử nghiệm để đánh giá ROI.',
          'Giải pháp mới có giảm được độ mơ hồ khi release, rollback, và audit hay không.',
        ],
      },
      { type: 'paragraph', children: [longFormParagraphs[2]] },
      { type: 'heading', level: 2, text: 'Khi nào nên dùng và khi nào chưa nên dùng' },
      { type: 'paragraph', children: [longFormParagraphs[3]] },
      { type: 'paragraph', children: [longFormParagraphs[4]] },
      { type: 'paragraph', children: [longFormParagraphs[5]] },
      { type: 'heading', level: 2, text: 'Trade-off và cách đánh giá nghiêm túc' },
      { type: 'paragraph', children: [longFormParagraphs[6]] },
      { type: 'paragraph', children: [longFormParagraphs[7]] },
      { type: 'heading', level: 2, text: 'Nguồn research và bước tiếp theo' },
      ...sources.slice(0, 3).map<ContentPackBlock>((source) => ({
        type: 'paragraph',
        children: [sourceLink(source), `: ${sourceSummary(source, 260)}`],
      })),
      { type: 'paragraph', children: [longFormParagraphs[8]] },
    ],
  }
}
