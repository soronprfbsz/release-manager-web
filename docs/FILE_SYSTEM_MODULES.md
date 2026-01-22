# 파일시스템 공통 모듈 가이드

파일 목록 조회, 파일 내용 보기, 파일 트리 UI 등 파일 관련 기능 구현 시 반드시 이 문서를 참고하여 공통 모듈을 사용해야 합니다.

## 모듈 구조 개요

```
src/
├── shared/
│   ├── lib/
│   │   ├── hooks/
│   │   │   └── use-file-content-viewer.ts    # 파일 내용 조회 훅
│   │   └── utils/
│   │       ├── file-content.ts               # 파일 타입 판별, base64 변환
│   │       ├── file-icon.ts                  # 파일 아이콘, 조회 가능 확장자
│   │       └── file-sort.ts                  # 파일 정렬 유틸
│   └── ui/
│       ├── file-tree/                        # 범용 파일 트리 컴포넌트
│       ├── file-viewer/                      # 통합 파일 뷰어 (타입별 분기)
│       ├── file-content-viewer/              # 파일 내용 모달 (PDF/이미지/엑셀/텍스트)
│       ├── docx-viewer/                      # Word 문서(.docx) 뷰어
│       ├── excel-viewer/                     # Excel 파일 뷰어
│       ├── pdf-viewer/                       # PDF 파일 뷰어
│       └── zip-file-explorer/                # ZIP 파일 탐색 Sheet
└── widgets/
    └── common/
        ├── file-browser/                     # FileTree + FileViewer 통합 위젯
        └── file-explorer/                    # Sheet 기반 파일 탐색기
```

## 핵심 모듈 상세

### 1. useFileContentViewer (훅)

**경로:** `@/shared/lib/hooks/use-file-content-viewer`

**역할:**
- 파일 확장자로 타입 판별 (pdf, image, excel, zip, text)
- API 응답 데이터를 Blob 또는 텍스트로 변환
- FileViewer 컴포넌트에 전달할 props 자동 생성

**사용법:**
```typescript
import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'

const viewer = useFileContentViewer({
  filePath: selectedFile?.filePath,
  fileName: selectedFile?.name,
  fileSize: selectedFile?.size,
  enabled: viewerOpen && selectedFile !== null,
  useContentQuery: useMyFileContentQuery, // API 쿼리 훅
})

// FileViewer에 전달
<FileViewer
  {...viewer.viewerProps}
  open={viewerOpen}
  onOpenChange={setViewerOpen}
  onDownload={handleDownload}
/>
```

**주의사항:**
- `useContentQuery`는 `(path: string, enabled: boolean) => { data, isLoading, error }` 형태여야 함
- 반환되는 `data`는 `{ content: string, mimeType?: string, isBinary?: boolean }` 형태

---

### 2. FileViewer (컴포넌트)

**경로:** `@/shared/ui/file-viewer`

**역할:**
- 파일 타입에 따라 적절한 뷰어로 라우팅
- ZIP 파일 → ZipFileExplorer (Sheet)
- 그 외 → FileContentViewerModal (Modal)

**사용법:**
```typescript
import { FileViewer } from '@/shared/ui/file-viewer'

<FileViewer
  {...viewer.viewerProps}  // useFileContentViewer에서 반환
  open={viewerOpen}
  onOpenChange={setViewerOpen}
  onDownload={handleDownload}
  canDownload={true}
  description="파일 내용"
  zipIcon={MyCustomIcon}  // ZIP용 아이콘 (선택)
/>
```

**작동 흐름:**
```
FileViewer
├─ fileType === 'zip'?
│   └─ YES → ZipFileExplorer (Sheet 열림, 에러 시에도 Sheet에서 에러 표시)
│   └─ NO  → FileContentViewerModal (Modal 열림)
```

**중요:** `fileType`은 파일 확장자 기반으로 결정되므로, API 에러 발생 시에도 올바른 뷰어가 선택됩니다.

---

### 3. FileTree (컴포넌트)

**경로:** `@/shared/ui/file-tree`

**역할:**
- 파일/폴더 트리 구조 렌더링
- 파일 클릭, 다운로드, 관리(업로드/삭제/폴더생성) 기능

**Props:**
```typescript
interface FileTreeProps {
  data: FileTreeData | FileTreeNode      // 파일 트리 데이터
  onFileClick?: (node: FileTreeNode) => void
  onDownload?: (node: FileTreeNode) => void
  onUpload?: (targetPath: string) => void
  onDelete?: (node: FileTreeNode) => void
  onCreateDirectory?: (parentPath: string) => void
  canDownload?: boolean                  // 다운로드 버튼 표시
  canManage?: boolean                    // 관리 메뉴 표시
  showMetadata?: boolean                 // 파일 크기 표시
  showModifiedDate?: boolean             // 수정일 표시
  defaultExpanded?: boolean              // 폴더 기본 펼침
  emptyState?: ReactNode                 // 빈 상태 UI
}
```

**FileTreeNode 타입:**
```typescript
interface FileTreeNode {
  name: string
  path: string           // UI 표시용 경로
  filePath: string       // API 호출용 전체 경로
  type: 'file' | 'directory'
  size?: number | null
  modifiedAt?: string
  children?: FileTreeNode[]
}
```

**사용법:**
```typescript
import { FileTree, type FileTreeNode } from '@/shared/ui/file-tree'

<FileTree
  data={fileTreeData}
  onFileClick={handleFileClick}
  onDownload={handleDownload}
  onUpload={handleUpload}
  onDelete={handleDelete}
  onCreateDirectory={handleCreateDirectory}
  canManage={hasPermission}
  showModifiedDate
  defaultExpanded={false}
/>
```

---

### 4. FileBrowser (위젯)

**경로:** `@/widgets/common/file-browser`

**역할:**
- FileTree + FileViewer를 하나로 통합한 완전한 파일 브라우저
- 파일 선택 상태 내부 관리

**사용법:**
```typescript
import { FileBrowser } from '@/widgets/common/file-browser'

<FileBrowser
  fileTree={data}
  isLoading={isLoading}
  error={error}
  useFileContent={useMyFileContentQuery}
  onDownloadFile={handleDownload}
  canManage={hasPermission}
  showModifiedDate
/>
```

---

### 5. ZipFileExplorer (컴포넌트)

**경로:** `@/shared/ui/zip-file-explorer`

**역할:**
- ZIP 파일 내부 구조를 Sheet로 표시
- JSZip으로 클라이언트에서 파싱
- 중첩 ZIP 파일은 클릭 불가

**내부 작동:**
```
ZIP Blob 전달
    ↓
JSZip으로 파싱 → FileTreeData 생성
    ↓
FileExplorer (Sheet) 렌더링
    ↓
파일 클릭 → FileContentViewerModal (내부 파일 표시)
```

---

## 파일 타입별 지원 현황

### 조회 가능 파일 (VIEWABLE_EXTENSIONS)

| 카테고리 | 확장자 |
|----------|--------|
| 텍스트/코드 | .sql, .sh, .md, .txt, .log, .json, .xml, .yml, .yaml, .ini, .conf, .properties, .bat, .ps1, .env |
| 이미지 | .pdf, .png, .jpg, .jpeg, .gif, .webp, .bmp, .ico |
| 압축 | .zip, .jar, .war, .ear |
| 스프레드시트 | .xlsx, .xls, .csv |
| Word 문서 | .docx |

### ZIP 내부 조회 가능 파일

압축 파일 확장자(.zip, .jar, .war, .ear)는 **제외**됨 → 중첩 ZIP 클릭 불가

---

## 구현 패턴

### 패턴 1: 파일 트리 + 내용 보기 (권장)

```typescript
// 1. 상태 정의
const [viewerOpen, setViewerOpen] = useState(false)
const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)

// 2. 파일 내용 조회 훅
const viewer = useFileContentViewer({
  filePath: selectedFile?.filePath,
  fileName: selectedFile?.name,
  fileSize: selectedFile?.size,
  enabled: viewerOpen && selectedFile !== null,
  useContentQuery: useFileContent,
})

// 3. 파일 클릭 핸들러
const handleFileClick = (node: FileTreeNode) => {
  setSelectedFile({ filePath: node.filePath, name: node.name, size: node.size })
  setViewerOpen(true)
}

// 4. 렌더링
return (
  <>
    <FileTree
      data={fileTreeData}
      onFileClick={handleFileClick}
      onDownload={handleDownload}
    />
    <FileViewer
      {...viewer.viewerProps}
      open={viewerOpen}
      onOpenChange={setViewerOpen}
      onDownload={handleDownloadSelected}
    />
  </>
)
```

### 패턴 2: FileBrowser 위젯 사용 (더 간단)

```typescript
<FileBrowser
  fileTree={data}
  useFileContent={useFileContent}
  onDownloadFile={handleDownload}
  canManage={canManage}
/>
```

---

## 변경 시 영향 범위

### 수정 시 전체 적용되는 항목

| 변경 내용 | 수정 파일 |
|-----------|-----------|
| 파일 타입별 아이콘 | `shared/lib/utils/file-icon.ts` |
| 조회 가능 확장자 | `shared/lib/utils/file-icon.ts` (VIEWABLE_EXTENSIONS) |
| 파일 정렬 로직 | `shared/lib/utils/file-sort.ts` |
| 파일 뷰어 UI | `shared/ui/file-content-viewer/` |
| Word 문서 뷰어 | `shared/ui/docx-viewer/` |
| Excel 뷰어 | `shared/ui/excel-viewer/` |
| PDF 뷰어 | `shared/ui/pdf-viewer/` |
| ZIP 탐색 UI | `shared/ui/zip-file-explorer/` |
| 트리 UI/스타일 | `shared/ui/file-tree/` |
| 타입 판별 로직 | `shared/lib/utils/file-content.ts` |
| 콘텐츠 변환 로직 | `shared/lib/hooks/use-file-content-viewer.ts` |

---

## 주의사항

1. **새 파일 뷰어 화면 구현 시**
   - 반드시 `useFileContentViewer` + `FileViewer` 조합 사용
   - `FileContentViewerModal` 직접 사용 금지 (MariaDB 백업처럼 특수한 경우 제외)

2. **새 파일 트리 구현 시**
   - 반드시 `FileTree` 컴포넌트 사용
   - 인라인 트리 컴포넌트 작성 금지

3. **파일 타입 추가 시** (예: .docx 추가)
   - `file-icon.ts`의 `VIEWABLE_EXTENSIONS`에 확장자 추가
   - `file-content.ts`에 타입 판별 함수 추가 (예: `isDocxFile`)
   - `file-content.ts`의 `isBinaryFileByExtension`에 조건 추가
   - `useFileContentViewer`에서 `FileViewerType` 타입 추가
   - `useFileContentViewer`의 `getFileType`, `isBinaryType`, `viewerProps`에 처리 로직 추가
   - 필요 시 새 뷰어 컴포넌트 생성 (예: `docx-viewer/DocxViewer.tsx`)
   - `FileContentViewerModal`에 새 뷰어 통합
   - `FileViewer`의 Props에 새 타입 props 추가

4. **ZIP 내부 파일 타입 제한**
   - `ZipFileExplorer.tsx`의 `ZIP_INNER_VIEWABLE_EXTENSIONS` 수정
   - 바이너리 파일인 경우 `binaryExtensions` 배열에도 추가
   - MIME 타입 필요 시 `mimeTypes` 객체에 추가

---

## 현재 사용 현황

### 공통 모듈 사용 화면

| 화면 | 사용 모듈 |
|------|-----------|
| 버전 상세 (VersionDetailPanel) | useFileContentViewer + FileViewer + FileTree |
| 리소스 파일 탭 (FileResourceTab) | useFileContentViewer + FileViewer |
| 프로젝트 목록 (ProjectListPage) | useFileContentViewer + FileViewer + FileTree |
| 공통 파일 탐색기 (FileExplorer) | useFileContentViewer + FileViewer |

### 예외 화면

| 화면 | 사용 방식 | 사유 |
|------|-----------|------|
| MariaDB 백업 | FileContentViewerModal 직접 사용 | SQL/로그 텍스트만 표시, ZIP 불필요 |
