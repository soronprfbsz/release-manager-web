/**
 * MessageComposeDialog
 * 메시지 작성 — 수신자 선택 + 제목 + 본문
 */

import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useSendMessage } from '@/entities/messages/message'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import { RecipientPicker } from './RecipientPicker'

const formSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하여야 합니다.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
})

type FormValues = z.infer<typeof formSchema>

interface MessageComposeDialogProps {
  isOpen: boolean
  onClose: () => void
  /** 본인은 수신자 목록에서 제외 */
  myAccountId?: number
}

export function MessageComposeDialog({
  isOpen,
  onClose,
  myAccountId,
}: MessageComposeDialogProps) {
  const { toast } = useToast()
  const sendMessage = useSendMessage()

  const [recipientIds, setRecipientIds] = useState<number[]>([])
  const [recipientError, setRecipientError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', content: '' },
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({ title: '', content: '' })
      setRecipientIds([])
      setRecipientError(null)
    }
  }, [isOpen, form])

  const handleSubmit = (values: FormValues) => {
    if (recipientIds.length === 0) {
      setRecipientError('수신자를 한 명 이상 선택해주세요.')
      return
    }

    sendMessage.mutate(
      { recipientIds, title: values.title, content: values.content },
      {
        onSuccess: () => {
          toast({
            title: '메시지를 보냈습니다',
            description: `${recipientIds.length}명에게 전달되었습니다.`,
          })
          onClose()
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '메시지 발송 실패',
            description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
          })
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>메시지 작성</DialogTitle>
          <DialogDescription>
            수신자를 선택하고 메시지를 보냅니다. 여러 명을 함께 선택할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>수신자</Label>
              <RecipientPicker
                value={recipientIds}
                onChange={(ids) => {
                  setRecipientIds(ids)
                  if (ids.length > 0) setRecipientError(null)
                }}
                excludeAccountId={myAccountId}
              />
              {recipientError && (
                <p className="text-sm font-medium text-destructive">{recipientError}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="내용을 입력하세요"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={sendMessage.isPending}>
                {sendMessage.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                보내기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
