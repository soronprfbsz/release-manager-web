/**
 * MariaDB Connection History Hook
 * MariaDB 연결 정보 히스토리 관리 (로컬스토리지 기반)
 */

import { useState, useEffect, useCallback } from 'react'

interface MariaDBConnectionHistory {
  host: string
  port: number
  database: string
  username: string
  lastUsed: string
}

const STORAGE_KEY = 'mariadb-connection-history'
const MAX_HISTORY = 10

/**
 * MariaDB 연결 히스토리 훅
 */
export function useMariaDBConnectionHistory() {
  const [history, setHistory] = useState<MariaDBConnectionHistory[]>([])

  // 초기 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as MariaDBConnectionHistory[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Failed to load MariaDB connection history:', error)
    }
  }, [])

  // 히스토리 저장
  const saveToHistory = useCallback(
    (host: string, port: number, database: string, username: string) => {
      setHistory((prev) => {
        // 중복 제거 (같은 host + port + database + username)
        const filtered = prev.filter(
          (item) =>
            !(
              item.host === host &&
              item.port === port &&
              item.database === database &&
              item.username === username
            )
        )

        // 새 항목 추가 (최신 항목이 앞에)
        const newHistory = [
          {
            host,
            port,
            database,
            username,
            lastUsed: new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, MAX_HISTORY) // 최대 개수 제한

        // localStorage에 저장
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
        } catch (error) {
          console.error('Failed to save MariaDB connection history:', error)
        }

        return newHistory
      })
    },
    []
  )

  // 호스트 목록 추출 (중복 제거)
  const getHostList = useCallback((): string[] => {
    const hosts = history.map((item) => item.host)
    return Array.from(new Set(hosts))
  }, [history])

  // 포트 목록 추출 (중복 제거)
  const getPortList = useCallback((): number[] => {
    const ports = history.map((item) => item.port)
    return Array.from(new Set(ports))
  }, [history])

  // 데이터베이스 목록 추출 (중복 제거)
  const getDatabaseList = useCallback((): string[] => {
    const databases = history.map((item) => item.database)
    return Array.from(new Set(databases))
  }, [history])

  // 사용자명 목록 추출 (중복 제거)
  const getUsernameList = useCallback((): string[] => {
    const usernames = history.map((item) => item.username)
    return Array.from(new Set(usernames))
  }, [history])

  return {
    history,
    saveToHistory,
    getHostList,
    getPortList,
    getDatabaseList,
    getUsernameList,
  }
}
