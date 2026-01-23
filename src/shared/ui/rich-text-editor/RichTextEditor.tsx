/**
 * RichTextEditor
 * TipTap 기반 리치 텍스트 에디터 컴포넌트
 */

import { useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { cn } from '@/shared/lib/utils'

import { EditorToolbar } from './EditorToolbar'

interface RichTextEditorProps {
  /** 에디터 내용 (HTML) */
  value?: string
  /** 내용 변경 콜백 */
  onChange?: (html: string) => void
  /** placeholder 텍스트 */
  placeholder?: string
  /** 에디터 높이 */
  minHeight?: string
  /** 최대 높이 */
  maxHeight?: string
  /** 읽기 전용 모드 */
  readOnly?: boolean
  /** 툴바 숨김 */
  hideToolbar?: boolean
  /** 이미지 업로드 핸들러 */
  onImageUpload?: (file: File) => Promise<string>
  /** 클래스명 */
  className?: string
  /** 에디터 영역 클래스명 */
  editorClassName?: string
  /** 에러 상태 */
  error?: boolean
  /** autofocus */
  autoFocus?: boolean
}

export interface RichTextEditorRef {
  editor: Editor | null
  getHTML: () => string
  getText: () => string
  setContent: (content: string) => void
  focus: () => void
  clear: () => void
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      placeholder = '내용을 입력하세요...',
      minHeight = '200px',
      maxHeight = '500px',
      readOnly = false,
      hideToolbar = false,
      onImageUpload,
      className,
      editorClassName,
      error = false,
      autoFocus = false,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-2 cursor-pointer',
          },
        }),
        Image.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: {
            class: 'max-w-full h-auto rounded-md my-2',
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass:
            'before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0',
        }),
      ],
      content: value,
      editable: !readOnly,
      autofocus: autoFocus,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        onChange?.(html)
      },
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            'px-3 py-2',
            // 목록 및 인용구 스타일
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
            '[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
            editorClassName
          ),
          style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
        },
        handleDrop: (view, event, _slice, moved) => {
          if (!moved && event.dataTransfer && onImageUpload) {
            const files = Array.from(event.dataTransfer.files).filter((file) =>
              file.type.startsWith('image/')
            )

            if (files.length > 0) {
              event.preventDefault()
              files.forEach((file) => {
                onImageUpload(file).then((url) => {
                  const { tr } = view.state
                  const pos = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  })
                  if (pos) {
                    const node = view.state.schema.nodes.image.create({ src: url })
                    const transaction = tr.insert(pos.pos, node)
                    view.dispatch(transaction)
                  }
                })
              })
              return true
            }
          }
          return false
        },
        handlePaste: (view, event) => {
          if (event.clipboardData && onImageUpload) {
            const files = Array.from(event.clipboardData.files).filter((file) =>
              file.type.startsWith('image/')
            )

            if (files.length > 0) {
              event.preventDefault()
              files.forEach((file) => {
                onImageUpload(file).then((url) => {
                  const { tr, selection } = view.state
                  const node = view.state.schema.nodes.image.create({ src: url })
                  const transaction = tr.insert(selection.from, node)
                  view.dispatch(transaction)
                })
              })
              return true
            }
          }
          return false
        },
      },
    })

    // 외부에서 value가 변경될 때 에디터 내용 동기화
    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, { emitUpdate: false })
      }
    }, [editor, value])

    // ref를 통해 에디터 제어 메서드 노출
    useImperativeHandle(ref, () => ({
      editor,
      getHTML: () => editor?.getHTML() ?? '',
      getText: () => editor?.getText() ?? '',
      setContent: (content: string) => {
        editor?.commands.setContent(content, { emitUpdate: false })
      },
      focus: () => {
        editor?.commands.focus()
      },
      clear: () => {
        editor?.commands.clearContent()
      },
    }))

    const handleImageUploadClick = useCallback(() => {
      if (!onImageUpload) return

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || [])
        for (const file of files) {
          try {
            const url = await onImageUpload(file)
            console.log('[RichTextEditor] Image upload URL:', url)
            if (editor && url) {
              editor.chain().focus().setImage({ src: url }).run()
              console.log('[RichTextEditor] Image inserted, HTML:', editor.getHTML())
            }
          } catch (error) {
            console.error('Image upload failed:', error)
          }
        }
      }
      input.click()
    }, [editor, onImageUpload])

    return (
      <div
        className={cn(
          'overflow-hidden rounded-md border bg-background',
          error && 'border-destructive',
          className
        )}
      >
        {!hideToolbar && !readOnly && (
          <EditorToolbar
            editor={editor}
            onImageUpload={onImageUpload ? handleImageUploadClick : undefined}
          />
        )}
        <EditorContent editor={editor} />
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'
