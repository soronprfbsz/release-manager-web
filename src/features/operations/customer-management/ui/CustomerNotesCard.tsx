/**
 * Customer Notes Card Component
 * 고객사 특이사항 카드 컴포넌트 (목록 + CRUD)
 */

import { useState } from 'react'

import {
  StickyNote,
  Plus,
  Pencil,
  Trash2,
  FileQuestion,
} from 'lucide-react'

import {
  useCustomerNotes,
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
  type CustomerNote,
} from '@/entities/operations/customer-note'

import { formatDateTime } from '@/shared/lib/utils/date'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Loader2 } from 'lucide-react'

import {
  CustomerNoteForm,
  type CustomerNoteFormMode,
  type CustomerNoteFormData,
} from './CustomerNoteForm'
import { CustomerNoteDeleteDialog } from './CustomerNoteDeleteDialog'

interface CustomerNotesCardProps {
  customerId: number
}

export function CustomerNotesCard({ customerId }: CustomerNotesCardProps) {
  const { toast } = useToast()

  // 특이사항 목록 조회
  const { data: notes = [], isLoading } = useCustomerNotes(customerId)

  // Mutations
  const createMutation = useCreateCustomerNote()
  const updateMutation = useUpdateCustomerNote()
  const deleteMutation = useDeleteCustomerNote()

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<CustomerNoteFormMode>(null)
  const [editingNote, setEditingNote] = useState<CustomerNote | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingNote, setDeletingNote] = useState<CustomerNote | null>(null)

  const handleCreate = () => {
    setFormMode('create')
    setEditingNote(null)
    setFormOpen(true)
  }

  const handleEdit = (note: CustomerNote) => {
    setFormMode('edit')
    setEditingNote(note)
    setFormOpen(true)
  }

  const handleDelete = (note: CustomerNote) => {
    setDeletingNote(note)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = (data: CustomerNoteFormData) => {
    if (formMode === 'create') {
      createMutation.mutate(
        { customerId, data: { title: data.title, content: data.content } },
        {
          onSuccess: () => {
            toast({ title: '등록 완료', description: '특이사항이 등록되었습니다.' })
            setFormOpen(false)
            setFormMode(null)
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: '등록 실패',
              description: '특이사항 등록에 실패했습니다.',
            })
          },
        }
      )
    } else if (formMode === 'edit' && editingNote) {
      updateMutation.mutate(
        {
          customerId,
          noteId: editingNote.noteId,
          data: { title: data.title, content: data.content },
        },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '특이사항이 수정되었습니다.' })
            setFormOpen(false)
            setFormMode(null)
            setEditingNote(null)
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: '수정 실패',
              description: '특이사항 수정에 실패했습니다.',
            })
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!deletingNote) return

    deleteMutation.mutate(
      { customerId, noteId: deletingNote.noteId },
      {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '특이사항이 삭제되었습니다.' })
          setDeleteDialogOpen(false)
          setDeletingNote(null)
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '삭제 실패',
            description: '특이사항 삭제에 실패했습니다.',
          })
        },
      }
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              특이사항
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" />
              등록
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">로딩 중...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <FileQuestion className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">등록된 특이사항이 없습니다.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.noteId}
                    className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Title */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold">{note.title}</h4>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(note)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(note)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{note.content}</p>

                    {/* Footer - Author & Date */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                      <DiceBearAvatar
                        seed={note.createdByAvatarSeed || note.createdByEmail}
                        style={(note.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                        name={note.createdByAccountName}
                        size={20}
                      />
                      <span className="text-xs text-muted-foreground">
                        {note.createdByAccountName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                      </span>
                      {note.updatedAt !== note.createdAt && note.updatedByAccountName && (
                        <span className="text-xs text-muted-foreground">
                          (수정됨)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Note Form */}
      <CustomerNoteForm
        open={formOpen}
        mode={formMode}
        initialData={editingNote}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false)
          setFormMode(null)
          setEditingNote(null)
        }}
      />

      {/* Delete Dialog */}
      <CustomerNoteDeleteDialog
        open={deleteDialogOpen}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setDeletingNote(null)
        }}
      />
    </>
  )
}
