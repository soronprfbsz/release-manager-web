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

/** 계정 목록을 한 번에 받기 위한 크기 — 전체 계정 수를 크게 웃도는 값 */
const ALL_ACCOUNTS_SIZE = 1000

/** 헤더/본문 두 테이블의 컬럼 폭을 동일하게 맞추기 위한 colgroup */
const RecipientColgroup = () => (
  <colgroup>
    <col className="w-10" />
    <col className="w-28" />
    <col className="w-20" />
    <col className="w-32" />
    <col />
  </colgroup>
)

const COLUMNS = ['이름', '직급', '부서', '이메일'] as const

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
        헤더를 스크롤 영역 **밖**에 둔다.

        sticky 헤더(thead / th 어느 쪽이든)는 환경에 따라 스크롤된 행이 헤더 위로
        비쳐 보이는 문제가 있었다. 헤더를 아예 스크롤되지 않는 영역으로 분리하면
        겹칠 수 있는 경로 자체가 사라진다.

        두 테이블의 컬럼을 맞추기 위해 양쪽 모두 table-fixed + 같은 colgroup 을
        쓴다. 마지막(이메일) 컬럼만 스크롤바 폭만큼 좁아지는데, 왼쪽 정렬이라
        보이는 위치는 동일하다.
      */}
      <div className="overflow-hidden rounded-md border">
        <table className="w-full table-fixed caption-bottom text-sm">
          <RecipientColgroup />
          <thead>
            <tr className="border-b border-border">
              <th className="h-9 px-3 text-left align-middle">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={toggleAllFiltered}
                  aria-label="검색 결과 전체 선택"
                  disabled={filtered.length === 0}
                />
              </th>
              {COLUMNS.map((label) => (
                <th
                  key={label}
                  className="h-9 px-3 text-left align-middle text-xs font-semibold text-muted-foreground"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        <div className="h-56 overflow-y-auto">
          <table className="w-full table-fixed caption-bottom text-sm">
            <RecipientColgroup />
            <tbody className="[&_tr:hover]:bg-foreground/[0.045]">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="h-20 text-center text-muted-foreground">
                    불러오는 중…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-20 text-center text-muted-foreground">
                    조건에 맞는 계정이 없습니다.
                  </td>
                </tr>
              )}
              {filtered.map((account) => (
                <tr
                  key={account.accountId}
                  className="cursor-pointer border-b border-border transition-colors"
                  onClick={() => toggle(account)}
                >
                  <td className="p-3 align-middle" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={value.includes(account.accountId)}
                      onCheckedChange={() => toggle(account)}
                      aria-label={`${account.accountName} 선택`}
                    />
                  </td>
                  <td className="truncate p-3 align-middle font-medium">{account.accountName}</td>
                  <td className="truncate p-3 align-middle text-muted-foreground">
                    {account.positionName ?? '-'}
                  </td>
                  <td className="truncate p-3 align-middle text-muted-foreground">
                    {account.departmentName ?? '-'}
                  </td>
                  <td className="truncate p-3 align-middle text-muted-foreground">
                    {account.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length > 0 ? `${value.length}명 선택됨` : '수신자를 선택하세요.'}
      </p>
    </div>
  )
}
