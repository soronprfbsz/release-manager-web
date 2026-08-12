/**
 * RecipientPicker
 * 수신자 선택 — 검색 + 체크박스 테이블
 *
 * 전체 계정이 25명 안팎이라 서버 페이징 없이 한 번에 받아 화면에서 거른다.
 * 요구사항상 부서 / 직급 / 이름 / 이메일 네 가지가 한 화면에 모두 보여야 한다.
 */

import { useMemo, useState } from 'react'

import { Search, X } from 'lucide-react'

import { useAccounts } from '@/entities/operations/account'
import type { Account } from '@/entities/operations/account'

import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

/** 계정 목록을 한 번에 받기 위한 크기 — 전체 계정 수를 크게 웃도는 값 */
const ALL_ACCOUNTS_SIZE = 1000

interface RecipientPickerProps {
  /** 선택된 수신자 계정 ID 목록 */
  value: number[]
  onChange: (recipientIds: number[]) => void
  /** 목록에서 제외할 계정 (보통 본인) */
  excludeAccountId?: number
}

export function RecipientPicker({
  value,
  onChange,
  excludeAccountId,
}: RecipientPickerProps) {
  const [keyword, setKeyword] = useState('')

  const { data, isLoading } = useAccounts({ size: ALL_ACCOUNTS_SIZE })

  /** 비활성 계정은 발송 대상이 아니므로 애초에 노출하지 않는다 */
  const accounts = useMemo(() => {
    const all = data?.content ?? []
    return all.filter(
      (account) =>
        account.status === 'ACTIVE' && account.accountId !== excludeAccountId
    )
  }, [data, excludeAccountId])

  const filtered = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase()
    if (!trimmed) return accounts
    return accounts.filter((account) =>
      [
        account.accountName,
        account.email,
        account.departmentName ?? '',
        account.positionName ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(trimmed)
    )
  }, [accounts, keyword])

  const selectedAccounts = useMemo(
    () => accounts.filter((account) => value.includes(account.accountId)),
    [accounts, value]
  )

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((account) => value.includes(account.accountId))

  const toggle = (account: Account) => {
    onChange(
      value.includes(account.accountId)
        ? value.filter((id) => id !== account.accountId)
        : [...value, account.accountId]
    )
  }

  /** 헤더 체크박스 — 현재 검색 결과 전체를 켜고 끈다 */
  const toggleAllFiltered = () => {
    const filteredIds = filtered.map((account) => account.accountId)
    onChange(
      allFilteredSelected
        ? value.filter((id) => !filteredIds.includes(id))
        : Array.from(new Set([...value, ...filteredIds]))
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="이름 / 이메일 / 부서 / 직급으로 검색"
          className="pl-9"
        />
      </div>

      {selectedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedAccounts.map((account) => (
            <Badge key={account.accountId} variant="secondary" className="gap-1 pr-1">
              {account.accountName}
              <button
                type="button"
                onClick={() => toggle(account)}
                className="rounded-sm hover:bg-muted"
                aria-label={`${account.accountName} 수신자에서 제외`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/*
        sticky 헤더를 쓰는 목록이므로 Radix ScrollArea 가 아니라 일반 스크롤
        컨테이너를 쓴다 — ScrollArea 는 뷰포트 안에 display:table 래퍼를 만들어
        sticky 의 기준 박스를 가로챌 수 있다.
        (헤더가 행에 비쳐 보이지 않도록 배경을 셀에 주는 처리는 shared/ui/table.tsx)
      */}
      <div className="h-64 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={toggleAllFiltered}
                  aria-label="검색 결과 전체 선택"
                  disabled={filtered.length === 0}
                />
              </TableHead>
              <TableHead>이름</TableHead>
              <TableHead>직급</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>이메일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  불러오는 중…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                  조건에 맞는 계정이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((account) => (
              <TableRow
                key={account.accountId}
                className="cursor-pointer"
                onClick={() => toggle(account)}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={value.includes(account.accountId)}
                    onCheckedChange={() => toggle(account)}
                    aria-label={`${account.accountName} 선택`}
                  />
                </TableCell>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {account.positionName ?? '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {account.departmentName ?? '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">{account.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length > 0 ? `${value.length}명 선택됨` : '수신자를 선택하세요.'}
      </p>
    </div>
  )
}
