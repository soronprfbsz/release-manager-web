# UI 일관성 가이드

화면을 새로 만들거나 고칠 때 **모든 페이지가 같은 규칙으로 보이도록** 하는 지침이다.
여기 적힌 값은 임의로 정한 것이 아니라 현재 코드베이스에서 실제로 지배적인 패턴을 추출한 것이다.

> 판단이 서지 않으면 **가장 비슷한 기존 페이지를 열어 그대로 따른다.**
> 새 스타일을 만드는 것보다 기존 화면과 똑같아 보이는 것이 항상 우선이다.

---

## 1. 공용 컴포넌트 우선 원칙

**새로 만들기 전에 반드시 `src/shared/ui/` 를 먼저 확인한다.**

```bash
ls src/shared/ui/                      # 공용 컴포넌트 목록
grep -rln "<컴포넌트명>" src/features   # 실제 사용 예시 찾기
```

판단 순서:

1. `shared/ui/` 에 쓸 수 있는 것이 있으면 **그것을 쓴다** (약간 안 맞아도 prop 으로 맞춘다).
2. 없으면 기존 화면에서 유사 UI 를 찾아 **같은 구성으로 만든다**.
3. 그래도 없어서 새로 만들 때:
   - **한 곳에서만 쓰는 UI** → 해당 feature/widget 슬라이스의 `ui/` 에 둔다.
   - **두 번 이상 쓰이거나, 재사용 가능성이 있다고 판단되면** → `shared/ui/` 에 공용 컴포넌트로 만들고 양쪽에서 가져다 쓴다.
   - 같은 UI 를 두 번째로 복사-붙여넣기 하려는 순간이 곧 공용화 시점이다.

**공용 컴포넌트를 만들 때**: 비즈니스 로직·도메인 타입을 넣지 않는다(그건 `entities`/`features` 몫).
`shared/ui/` 는 도메인을 몰라야 한다.

---

## 2. 페이지 골격

모든 라우트 페이지는 아래 골격을 따른다.

```tsx
<PageLayout actions={/* 헤더 우측 액션 */}>
  <ContentCard>            {/* 단일 영역 */}
  또는 <TabbedContentCard   {/* 탭이 있는 화면 */}
    tabs={tabs} value={currentTab} onValueChange={handleTabChange}
    headerRight={/* 검색·필터 */}
  />
</PageLayout>
```

| 슬롯 | 넣는 것 | 넣지 않는 것 |
|---|---|---|
| `PageLayout actions` | **생성/작성/추가 등 주요 액션 버튼** | 검색창, 필터 |
| `TabbedContentCard headerRight` | 검색창, 필터 셀렉트 | 생성 버튼 |
| 카드 본문 | 테이블·폼·목록 | 페이지 제목(자동) |

- 페이지 제목/설명은 **DB 메뉴에서 자동으로 채워진다.** `PageLayout` 에 `title` 을 직접 넘기지 않는다(메뉴에 없는 특수 페이지만 예외).
- 탭 전환은 `useSearchParams` 의 `?tab=` 으로 관리한다(새로고침·뒤로가기 유지).

### 액션 버튼은 아이콘 + Tooltip

`PageLayout actions` 의 버튼은 **아이콘만** 쓴다. 텍스트 라벨을 붙이지 않는다.

```tsx
actions={
  <div className="flex items-center gap-2">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={handleOpen} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>게시글 작성</p></TooltipContent>
    </Tooltip>
  </div>
}
```

- 아이콘만 두면 뜻이 사라지므로 **Tooltip 은 필수**다.
- 액션이 여러 개면 같은 `div.flex.items-center.gap-2` 안에 나열한다.

### 헤더 검색창 규격

```tsx
<div className="relative">
  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input value={keyword} onChange={...} placeholder="검색..."
         className="h-8 w-[200px] pl-8 text-sm" />
</div>
```

---

## 3. 테이블

```tsx
<DataTable autoHeight>
  <Table>
    <TableHeader>…</TableHeader>
    <TableBody>…</TableBody>
  </Table>
</DataTable>
<DataTablePagination
  pageIndex={page} pageSize={PAGE_SIZE}
  totalElements={data?.totalElements ?? 0}
  onPaginationChange={({ pageIndex }) => setPage(pageIndex)}
/>
```

- **`autoHeight` 를 쓴다.** 테이블이 자체 스크롤을 갖지 않고 페이지(`main`)가 스크롤을 담당한다.
- ⚠️ **Radix `ScrollArea` 안에 `<Table>` 을 직접 넣지 않는다.** `ScrollArea` 는 뷰포트 내부에 `display:table` 래퍼를 만들어 `TableHeader` 의 `sticky top-0` 기준 박스를 가로챈다 → **헤더가 행과 겹쳐 보이는 버그**가 생긴다. 높이 제한이 꼭 필요하면 일반 `<div className="h-64 overflow-y-auto">` 를 쓴다.
- 행 전체를 클릭 가능하게 하면 `className="cursor-pointer"` 를 주고, 행 안의 버튼 셀에는 `onClick={(e) => e.stopPropagation()}` 을 건다.
- 빈 상태·로딩은 행으로 표현한다: `<TableCell colSpan={n} className="h-24 text-center text-muted-foreground">`.

---

## 4. 다이얼로그 · 폼

| 용도 | 컴포넌트 | 비고 |
|---|---|---|
| 생성/수정 폼 | `FormSheet` | 필드가 여러 개인 등록·수정 |
| 간단한 입력·상세 보기 | `Dialog` | 필드 1~3개, 읽기 전용 상세 |
| **삭제·되돌릴 수 없는 작업 확인** | `AlertDialog` | **필수** |

### 삭제는 반드시 확인 다이얼로그를 거친다

목록의 삭제 버튼이 곧바로 mutation 을 호출하지 않는다. 기존 `*DeleteDialog` 컴포넌트들과 같은 형태로 만든다.

```tsx
<AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <AlertDialogTitle>OO 삭제</AlertDialogTitle>
      </div>
      <AlertDialogDescription className="pt-2">
        정말 <strong>{name}</strong> 을(를) 삭제하시겠습니까?
        <br /><br />
        {/* 복구 가능 여부·파급 범위를 반드시 알린다 */}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      {/* 헤더가 아닌 영역이므로 한 단계 작은 치수(sm 상당)로 맞춘다 — 5번 항목 */}
      <AlertDialogCancel className="h-8 px-3 text-xs" onClick={onCancel}>
        취소
      </AlertDialogCancel>
      <AlertDialogAction onClick={onConfirm}
        className="h-8 bg-destructive px-3 text-xs text-destructive-foreground hover:bg-destructive/70">
        삭제
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- 설명에는 **되돌릴 수 있는지, 다른 사람에게 어떤 영향이 있는지**를 적는다.
- 폼은 `react-hook-form` + `zod`(`zodResolver`) + `shared/ui/form` 조합을 쓴다.

---

## 5. 버튼 크기 — 헤더만 크게, 나머지는 한 단계 작게

**페이지 헤더 영역의 액션 버튼만 기본 크기를 쓰고, 그 밖의 모든 영역은 한 단계 작은 버튼을 쓴다.**

| 영역 | 아이콘 버튼 | 텍스트 버튼 |
|---|---|---|
| **페이지 헤더** (`PageLayout actions`) · 탑바 | `size="icon"` | `size="default"` (기본) |
| 모달·시트 푸터 (닫기/취소/저장/삭제) | `size="icon-xs"` | **`size="sm"`** |
| 테이블 행 액션 | **`size="icon-xs"`** | `size="sm"` |
| 카드·폼 내부, 인라인 액션 | `size="icon-xs"` | `size="sm"` |

- 헤더는 페이지의 주 진입 액션이라 눈에 띄어야 하고, 그 외 영역의 버튼이 같은 크기면
  화면이 과하게 무거워 보인다.
- `AlertDialogAction` / `AlertDialogCancel` 은 `size` prop 이 없다.
  `className="h-8 px-3 text-xs"` 로 `sm` 과 같은 치수를 맞춘다.

```tsx
{/* 헤더 — 크게 */}
<Button size="icon"><Plus className="h-4 w-4" /></Button>

{/* 모달 푸터 — 한 단계 작게 */}
<Button variant="outline" size="sm" onClick={onClose}>취소</Button>
<Button size="sm" type="submit">저장</Button>

{/* 테이블 행 — 한 단계 작게 */}
<Button variant="ghost-icon" size="icon-xs"><Trash2 className="h-4 w-4" /></Button>
```

---

## 6. 타이포그래피 · 아이콘 · 색

| 항목 | 규칙 |
|---|---|
| 본문/기본 | `text-sm` (가장 많이 쓰는 기본값) |
| 보조 설명·메타 | `text-xs text-muted-foreground` |
| 아이콘 기본 | `h-4 w-4` |
| 큰 아이콘(다이얼로그 헤더 등) | `h-5 w-5` |
| 배지·인라인 소형 아이콘 | `h-3 w-3` |
| 흐린 텍스트 | `text-muted-foreground` |
| 위험·삭제 | `text-destructive` / `bg-destructive` |
| 임의 색상 | ❌ 금지 — 반드시 테마 토큰(`--foreground`, `--muted` 등)을 쓴다 |

- 뷰포트 매직 넘버(`calc(100vh - 20rem)`)를 쓰지 않는다. 부모로부터 `h-full` 을 받는다.
- 간격은 `gap-2`(조밀) / `space-y-3~4`(폼 필드) 를 기본으로 한다.

---

## 7. 상태 표시 (모든 목록 화면 공통)

| 상황 | 표시 |
|---|---|
| 로딩 | `Loader2` + `animate-spin`, 또는 "불러오는 중…" 문구 |
| 비어 있음 | `EmptyState` 또는 테이블 안내 행 |
| 처리 중 버튼 | `disabled` + `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` |
| 성공/실패 알림 | `useToast()` — **import 경로는 `@/shared/lib/hooks/use-toast`** |

실패 토스트는 `variant: 'destructive'` 를 쓰고, 사용자가 할 수 있는 다음 행동을 알려준다.

---

## 8. 새 화면 만들 때 체크리스트

- [ ] `shared/ui/` 에 쓸 수 있는 공용 컴포넌트를 먼저 찾아봤다
- [ ] 유사한 기존 페이지를 열어 구조를 맞췄다
- [ ] 주요 액션은 `PageLayout actions` 에 아이콘 + Tooltip 으로 넣었다
- [ ] 검색·필터는 `headerRight` 에 넣었다
- [ ] 테이블은 `DataTable autoHeight` + `DataTablePagination` 을 썼다
- [ ] 삭제에 `AlertDialog` 확인을 붙였다
- [ ] 헤더 외 영역(모달 푸터·테이블 행·폼)의 버튼을 한 단계 작은 크기로 맞췄다
- [ ] 라우트를 `shared/config/constants.ts`(ROUTES) + `permissions.ts`(ROUTE_PERMISSIONS) + `RouterProvider` 에 등록했다
- [ ] 메뉴 노출이 필요하면 **API 쪽 Flyway 마이그레이션**으로 `menu` / `menu_hierarchy` / `menu_role` 시드를 추가했다
- [ ] `npm run type-check && npm run lint && npm run build` 통과
