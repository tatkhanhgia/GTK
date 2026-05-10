# CI/CD không chỉ là màu xanh trên GitHub Actions

Có một bài học khá đau nhưng đáng nhớ: GitHub Actions báo xanh chưa chắc production đã thật sự chạy đúng.

Trong lần triển khai GTKBlog lên VPS, mục tiêu ban đầu nghe rất đơn giản: push code, chạy GitHub Actions, SSH vào server, build Docker image, restart app. Nhưng thực tế cho thấy CI/CD không chỉ là viết vài dòng YAML rồi chờ dấu tick xanh.

## Màu xanh đầu tiên chưa nói hết sự thật

Workflow deploy có các bước quen thuộc:

```bash
git fetch origin
git reset --hard <commit-sha>
npm run db:deploy
docker compose up -d --build
```

GitHub Actions có thể báo pass, nhưng khi kiểm tra trên VPS thì app container vẫn là bản cũ:

```bash
docker compose ps
```

Container `app` vẫn được tạo từ nhiều ngày trước. Biến version cũng trống:

```bash
docker compose exec -T app printenv GIT_COMMIT_SHA
```

Và route health check mới thêm trong source lại không tồn tại trong container đang chạy:

```json
{"message":"Route not found \"/api/health\""}
```

Đó là dấu hiệu rất rõ: source trên VPS đã đúng commit, nhưng image/container đang phục vụ traffic chưa chắc là artifact mới.

## Health check phải kiểm tra đúng version

Một endpoint health check chỉ trả `200 OK` là chưa đủ. Nó nên trả cả version/commit đang chạy:

```json
{
  "ok": true,
  "database": "ok",
  "version": "<git-commit-sha>"
}
```

Deploy chỉ nên pass khi:

```text
health.ok == true
health.database == "ok"
health.version == github.sha
```

Nếu không kiểm tra version, app cũ vẫn có thể trả OK và khiến pipeline xanh giả.

Trong case này, health check được chuyển sang kiểm tra trực tiếp bên trong container app trên VPS:

```bash
docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"
```

Cách này tránh nhầm với reverse proxy/public routing, đồng thời xác nhận chính container đang chạy có route mới và đúng commit.

## Build-time env khác runtime env

Một điểm dễ nhầm: app runtime dùng `.env.local` qua `docker-compose.yml`, nhưng `next build` bên trong Docker build stage vẫn có thể đọc `.env.production` nếu file đó nằm trong build context.

Log build trên VPS có dòng:

```text
Environments: .env.production
Creating an optimized production build ...
```

Trong khi Dockerfile đã set các biến build-safe:

```dockerfile
ENV SKIP_ADMIN_TRANSLATION_GENERATION=true
ENV SKIP_DB_TRANSLATIONS=true
ENV SKIP_BUILD_DB_ACCESS=true
```

Nhưng vì `COPY . .` copy cả repo vào image build stage, các file `.env.*` trên VPS vẫn có thể lọt vào quá trình build nếu `.dockerignore` không chặn.

Fix đúng là không để Docker build phụ thuộc env file thật trên server:

```gitignore
.env
.env.*
!.env.example
```

Runtime vẫn đọc env qua Docker Compose, còn build stage chỉ dùng các biến build-time đã khai báo rõ trong Dockerfile.

## Build Next.js/Payload cần tách DB runtime khỏi build

Với Next.js + Payload CMS, build production có thể chạm vào nhiều phần tưởng như chỉ chạy runtime:

- static generation
- sitemap
- i18n messages
- blog/product detail pages
- Payload local API

Nếu build vô tình gọi DB/Payload schema sync, CI hoặc Docker build có thể fail vì DB chưa ở trạng thái phù hợp.

Do đó các phần build-time cần có guard rõ ràng:

```text
SKIP_BUILD_DB_ACCESS=true
SKIP_DB_TRANSLATIONS=true
SKIP_ADMIN_TRANSLATION_GENERATION=true
```

Khi build, app dùng dữ liệu tĩnh hoặc trả fallback rỗng. Khi runtime, container kết nối DB thật và phục vụ dữ liệu thật.

## Đừng để môi trường host VPS quyết định app

Một lỗi khác là chạy migration/bootstrap trực tiếp trên host VPS:

```bash
npm run db:deploy
```

Lệnh này dùng Node/npm/node_modules của host. Trong khi app production thật chạy trong Docker image Node 22.

Nếu hai môi trường lệch nhau, deploy có thể fail vì dependency trên host, không phải vì app container hỏng.

Hướng an toàn hơn là càng nhiều bước runtime càng nên chạy trong cùng môi trường container, hoặc ít nhất phải đảm bảo host VPS dùng đúng Node/npm/dependency giống app.

## Checklist rút ra

Một deploy flow đáng tin hơn nên có:

- CI chạy typecheck, lint, test, build app.
- Docker build không copy `.env`, `.env.local`, `.env.production` vào build context.
- Build-time env được khai báo rõ, không phụ thuộc file env thật trên VPS.
- Health check kiểm tra database và commit version.
- Deploy chỉ pass khi `health.version == github.sha`.
- Sau deploy, kiểm tra container thật đang chạy, không chỉ source trên disk.
- Hạn chế chạy lệnh app bằng Node/npm của host VPS nếu runtime là Docker.
- Khi build fail trên VPS, đọc log Docker build chứ không chỉ nhìn GitHub Actions màu đỏ/xanh.

## Kết luận

CI/CD không phải là làm sao để GitHub Actions hiện màu xanh.

CI/CD tốt là khi mình trả lời chắc được ba câu hỏi:

1. Production đang chạy đúng commit nào?
2. Container đang chạy có thật sự được build từ commit đó không?
3. Nếu deploy fail, nó fail ở validate, build, restart, health check hay smoke test?

Lần này mất khá nhiều công để debug, nhưng đổi lại pipeline rõ hơn: build-time không còn bị `.env.production` trên VPS chi phối, health check xác nhận đúng version, và GitHub Actions pass có ý nghĩa gần với production thật hơn.

Đó mới là deploy đáng tin hơn.
