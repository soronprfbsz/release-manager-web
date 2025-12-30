import { useState, useEffect } from 'react'

import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Tag, Building2 } from 'lucide-react'

import type { CustomerReleaseNode, VersionNode } from '@/entities/releases/release'

import { cn } from '@/shared/lib/utils'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { Badge } from '@/shared/ui/badge'

interface CustomReleaseTreeProps {
  customers: CustomerReleaseNode[]
  selectedVersionId: number | null
  onSelectVersion: (version: VersionNode, customerCode: string, baseVersion: string | null) => void
}

export function CustomReleaseTree({ customers, selectedVersionId, onSelectVersion }: CustomReleaseTreeProps) {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(() => {
    return new Set(customers.map(c => c.customerCode))
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const allGroups = new Set<string>()
    customers.forEach(customer => {
      customer.majorMinorGroups.forEach(group => {
        allGroups.add(`${customer.customerCode}-${group.majorMinor}`)
      })
    })
    return allGroups
  })

  useEffect(() => {
    if (customers.length > 0) {
      setExpandedCustomers(new Set(customers.map(c => c.customerCode)))
      const allGroups = new Set<string>()
      customers.forEach(customer => {
        customer.majorMinorGroups.forEach(group => {
          allGroups.add(`${customer.customerCode}-${group.majorMinor}`)
        })
      })
      setExpandedGroups(allGroups)
    }
  }, [customers])

  const toggleCustomer = (customerCode: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev)
      if (next.has(customerCode)) {
        next.delete(customerCode)
      } else {
        next.add(customerCode)
      }
      return next
    })
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-26rem)] text-muted-foreground">
        <Tag className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">커스텀 릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {customers.map((customer) => {
        const isCustomerExpanded = expandedCustomers.has(customer.customerCode)
        const customerVersionCount = customer.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0)

        return (
          <div key={customer.customerCode}>
            {/* Customer Level */}
            <button
              onClick={() => toggleCustomer(customer.customerCode)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
            >
              {isCustomerExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-medium truncate" title={customer.customerName}>
                {customer.customerName}
              </span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                ({customerVersionCount})
              </span>
            </button>

            {isCustomerExpanded && (
              <div className="ml-4 pl-2 border-l border-border">
                {customer.majorMinorGroups.map((group) => {
                  const groupKey = `${customer.customerCode}-${group.majorMinor}`
                  const isGroupExpanded = expandedGroups.has(groupKey)

                  return (
                    <div key={groupKey}>
                      {/* Major.Minor Level */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
                      >
                        {isGroupExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {isGroupExpanded ? (
                          <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
                        ) : (
                          <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                        <span className="font-medium">{group.majorMinor}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          ({group.versions.length})
                        </span>
                      </button>

                      {isGroupExpanded && (
                        <div className="ml-4 pl-2 border-l border-border">
                          {group.versions.map((version) => (
                            <button
                              key={version.versionId}
                              onClick={() => onSelectVersion(version, customer.customerCode, customer.baseVersion)}
                              className={cn(
                                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm',
                                'hover:bg-accent hover:text-accent-foreground',
                                selectedVersionId === version.versionId && 'bg-accent text-accent-foreground'
                              )}
                            >
                              <FileCode className={cn(
                                "h-4 w-4 shrink-0",
                                version.isApproved ? "text-blue-500" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "flex-shrink-0",
                                !version.isApproved && "text-muted-foreground italic opacity-60"
                              )}>
                                {version.version}
                              </span>
                              {version.fileCategories && version.fileCategories.length > 0 && (
                                <div className="flex gap-1 ml-auto">
                                  {version.fileCategories.map((category) => (
                                    <Badge
                                      key={category}
                                      variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                                      className="text-[10px] px-1 py-0 h-4 leading-none"
                                    >
                                      {getCategoryShortName(category)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
