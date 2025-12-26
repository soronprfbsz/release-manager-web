/**
 * SSH Connection History Hook
 * SSH 연결 정보 히스토리 관리 (로컬스토리지 기반)
 */

import { useState, useEffect, useCallback } from 'react'

interface SshConnectionHistory {
  host: string
  port: number
  username: string
  lastUsed: string
}

const STORAGE_KEY = 'ssh-connection-history'
const MAX_HISTORY = 10

/**
 * SSH 연결 히스토리 훅
 */
export function useSshConnectionHistory() {
  const [history, setHistory] = useState<SshConnectionHistory[]>([])

  // 초기 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SshConnectionHistory[]
        setHistory(parsed)
      }
    } catch (error) {
      console.error('Failed to load SSH connection history:', error)
    }
  }, [])

  // 히스토리 저장
  const saveToHistory = useCallback((host: string, port: number, username: string) => {
    setHistory((prev) => {
      // 중복 제거 (같은 host + port + username)
      const filtered = prev.filter(
        (item) => !(item.host === host && item.port === port && item.username === username)
      )

      // 새 항목 추가 (최신 항목이 앞에)
      const newHistory = [
        {
          host,
          port,
          username,
          lastUsed: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, MAX_HISTORY) // 최대 개수 제한

      // localStorage에 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      } catch (error) {
        console.error('Failed to save SSH connection history:', error)
      }

      return newHistory
    })
  }, [])

  // 히스토리 삭제
  const removeFromHistory = useCallback((host: string, port: number, username: string) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => !(item.host === host && item.port === port && item.username === username)
      )

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      } catch (error) {
        console.error('Failed to remove from SSH connection history:', error)
      }

      return filtered
    })
  }, [])

  // 전체 히스토리 삭제
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear SSH connection history:', error)
    }
  }, [])

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

  // 사용자명 목록 추출 (중복 제거)
  const getUsernameList = useCallback((): string[] => {
    const usernames = history.map((item) => item.username)
    return Array.from(new Set(usernames))
  }, [history])

  // 특정 호스트의 사용자명 목록
  const getUsernamesForHost = useCallback(
    (host: string): string[] => {
      const usernames = history.filter((item) => item.host === host).map((item) => item.username)
      return Array.from(new Set(usernames))
    },
    [history]
  )

  return {
    history,
    saveToHistory,
    removeFromHistory,
    clearHistory,
    getHostList,
    getPortList,
    getUsernameList,
    getUsernamesForHost,
  }
}
