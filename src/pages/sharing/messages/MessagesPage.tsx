/**
 * Messages Page
 * 메시지함 — 수신함 / 발신함 탭
 */

import { useState } from 'react'

import { Inbox, Mail, MailOpen, Search, Send, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import {
  MessageComposeDialog,
  MessageDeleteDialog,
  MessageDetailDialog,
} from '@/features/messages'
import type { MessageDeleteTarget } from '@/features/messages'

import {
  useDeleteFromInbox,
  useDeleteFromOutbox,
  useInbox,
  useOutbox,
} from '@/entities/messages/message'


import { cn } from '@/shared/lib/utils'
import { formatDateTime } from '@/shared/lib/utils/date'
import { useAuthStore } from '@/shared/store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { TabbedContentCard } from '@/shared/ui/content-layout'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

type TabType = 'inbox' | 'outbox'

const PAGE_SIZE = 10

export function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'inbox'

  const user = useAuthStore((state) => state.user)

  const [keyword, setKeyword] = useState('')
  const [inboxPage, setInboxPage] = useState(0)
  const [outboxPage, setOutboxPage] = useState(0)
  const [composeOpen, setComposeOpen] = useState(false)
  const [detail, setDetail] = useState<{ messageId: number; markRead: boolean } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    messageId: number
    title: string
    target: MessageDeleteTarget
  } | null>(null)

  const inboxQuery = useInbox({ page: inboxPage, size: PAGE_SIZE, keyword: keyword || undefined })
  const outboxQuery = useOutbox({ page: outboxPage, size: PAGE_SIZE, keyword: keyword || undefined })

  const deleteFromInbox = useDeleteFromInbox()
  const deleteFromOutbox = useDeleteFromOutbox()

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
    setKeyword('')
    setInboxPage(0)
    setOutboxPage(0)
  }

  /** 확인 다이얼로그에서 승인했을 때만 실제 삭제(숨김)를 호출한다 */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    const mutation = deleteTarget.target === 'inbox' ? deleteFromInbox : deleteFromOutbox
    mutation.mutate(deleteTarget.messageId, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  const inbox = inboxQuery.data
  const outbox = outboxQuery.data

  const tabs = [
    {
      value: 'inbox',
      label: '수신함',
      icon: Inbox,
      content: (
        <>
          <DataTable autoHeight>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>제목</TableHead>
                  <TableHead className="w-40">보낸 사람</TableHead>
                  <TableHead className="w-44">받은 일시</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {inboxQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      불러오는 중…
                    </TableCell>
                  </TableRow>
                )}
                {!inboxQuery.isLoading && (inbox?.content.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      받은 메시지가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
                {inbox?.content.map((message) => {
                  const isUnread = message.readAt === null

                  return (
                  <TableRow
                    key={message.messageId}
                    className={cn(
                      'cursor-pointer',
                      // 안읽은 행은 은은한 채움으로 띄운다 — 메일 클라이언트의 관례대로
                      // '읽지 않은 것'이 기본 면이고 읽은 것이 가라앉는 구조다.
                      isUnread && 'bg-muted/40'
                    )}
                    onClick={() => setDetail({ messageId: message.messageId, markRead: true })}
                  >
                    <TableCell>
                      {isUnread ? (
                        <Mail className="h-4 w-4 text-destructive" aria-label="안읽음" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-muted-foreground" aria-label="읽음" />
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }
                    >
                      <div className="flex items-center gap-2">
                        {message.messageType !== 'USER' && (
                          <Badge variant="secondary" className="shrink-0">
                            시스템
                          </Badge>
                        )}
                        <span className="truncate">{message.title}</span>
                      </div>
                    </TableCell>
                    {/* 보낸 사람·일시도 함께 대비를 준다 — 제목만 굵게 하면
                        행 전체의 무게가 살지 않아 훑을 때 눈에 걸리지 않는다 */}
                    <TableCell
                      className={isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}
                    >
                      {message.senderName}
                    </TableCell>
                    <TableCell
                      className={isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}
                    >
                      {formatDateTime(message.createdAt)}
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Button
                        variant="ghost-icon"
                        size="icon-xs"
                        title="수신함에서 삭제"
                        onClick={() =>
                          setDeleteTarget({
                            messageId: message.messageId,
                            title: message.title,
                            target: 'inbox',
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </DataTable>
          <DataTablePagination
            pageIndex={inboxPage}
            pageSize={PAGE_SIZE}
            totalElements={inbox?.totalElements ?? 0}
            onPaginationChange={({ pageIndex }) => setInboxPage(pageIndex)}
          />
        </>
      ),
    },
    {
      value: 'outbox',
      label: '발신함',
      icon: Send,
      content: (
        <>
          <DataTable autoHeight>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-64">받는 사람</TableHead>
                  <TableHead className="w-28">읽음</TableHead>
                  <TableHead className="w-44">보낸 일시</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {outboxQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      불러오는 중…
                    </TableCell>
                  </TableRow>
                )}
                {!outboxQuery.isLoading && (outbox?.content.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      보낸 메시지가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
                {outbox?.content.map((message) => {
                  const [first, ...rest] = message.recipients
                  return (
                    <TableRow
                      key={message.messageId}
                      className="cursor-pointer"
                      onClick={() => setDetail({ messageId: message.messageId, markRead: false })}
                    >
                      <TableCell className="truncate">{message.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {first ? first.accountName : '-'}
                        {rest.length > 0 ? ` 외 ${rest.length}명` : ''}
                      </TableCell>
                      <TableCell>
                        {/* secondary/outline 은 다크에서 구분되지 않았다 —
                            --secondary(#1e2330)가 카드 면과 거의 같은 값이고
                            outline 은 투명이라 둘 다 '테두리만 있는 칩'으로 보인다.
                            양 테마에 dark: 분기가 있는 variant 로 바꾼다. */}
                        <Badge
                          variant={
                            message.readCount === message.recipientCount ? 'info' : 'warning'
                          }
                        >
                          {message.recipientCount}명 중 {message.readCount}명
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(message.createdAt)}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="ghost-icon"
                          size="icon-xs"
                          title="발신함에서 삭제"
                          onClick={() =>
                            setDeleteTarget({
                              messageId: message.messageId,
                              title: message.title,
                              target: 'outbox',
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </DataTable>
          <DataTablePagination
            pageIndex={outboxPage}
            pageSize={PAGE_SIZE}
            totalElements={outbox?.totalElements ?? 0}
            onPaginationChange={({ pageIndex }) => setOutboxPage(pageIndex)}
          />
        </>
      ),
    },
  ]

  return (
    <PageLayout
      // 제목/설명은 보통 DB 메뉴에서 자동으로 채워지지만, 이 화면은 진입점을
      // 프로필 드롭다운으로 옮기면서 메뉴 트리에서 빠졌다(V26). 그래서 직접 넘긴다.
      icon={<Mail className="h-5 w-5" />}
      title="메시지"
      description="사용자간 메시지를 주고받습니다."
      actions={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setComposeOpen(true)} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>메시지 작성</p>
            </TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <TabbedContentCard
        tabs={tabs}
        value={currentTab}
        onValueChange={handleTabChange}
        headerRight={
          /* 검색 — TabsBar 우측 슬롯 */
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                setInboxPage(0)
                setOutboxPage(0)
              }}
              placeholder="검색..."
              className="h-8 w-[200px] pl-8 text-sm"
            />
          </div>
        }
      />

      <MessageComposeDialog
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        myAccountId={user?.accountId}
      />

      <MessageDetailDialog
        messageId={detail?.messageId ?? null}
        markReadOnOpen={detail?.markRead ?? true}
        onClose={() => setDetail(null)}
      />

      <MessageDeleteDialog
        open={deleteTarget !== null}
        target={deleteTarget?.target ?? 'inbox'}
        messageTitle={deleteTarget?.title ?? null}
        isDeleting={deleteFromInbox.isPending || deleteFromOutbox.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  )
}
