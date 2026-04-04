import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react'
import { SAMPLE_DSL } from '../app/sampleDsl'

interface UseFileActionsResult {
  source: string
  setSource: Dispatch<SetStateAction<string>>
  documentName: string
  fileInputRef: RefObject<HTMLInputElement | null>
  openFromUrl: (url: string) => Promise<void>
  handleOpen: () => Promise<void>
  handleSave: () => Promise<void>
  handleSaveAs: () => Promise<void>
  handleFileInputChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function useFileActions(): UseFileActionsResult {
  const [source, setSource] = useState(SAMPLE_DSL)
  const [documentName, setDocumentName] = useState('service-catalogue.dsl')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileHandleRef = useRef<{
    name?: string
    createWritable?: () => Promise<{
      write: (contents: string) => Promise<void>
      close: () => Promise<void>
    }>
  } | null>(null)

  const downloadToFile = (name: string) => {
    const blob = new Blob([source], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const openFromFile = async (file: File) => {
    const text = await file.text()
    setSource(text)
    setDocumentName(file.name)
  }

  const openFromUrl = useCallback(async (url: string) => {
    const corsProxyUrl = 'https://api.allorigins.win/raw?url='

    const tryFetch = async (fetchUrl: string, isRetry: boolean = false): Promise<boolean> => {
      try {
        const response = await fetch(fetchUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const text = await response.text()
        const fileName = new URL(url).pathname.split('/').pop() || 'file.dsl'
        setSource(text)
        setDocumentName(fileName)
        return true
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        if (!isRetry && message.includes('CORS')) {
          return tryFetch(corsProxyUrl + encodeURIComponent(url), true)
        }

        console.error(`Failed to load file from URL: ${message}`)
        return false
      }
    }

    await tryFetch(url)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fileUrl = params.get('fileUrl')
    if (fileUrl) {
      void openFromUrl(fileUrl)
    }
  }, [openFromUrl])

  const handleOpen = async () => {
    const pickerWindow = window as Window & {
      showOpenFilePicker?: (options?: {
        multiple?: boolean
        types?: Array<{
          description?: string
          accept: Record<string, string[]>
        }>
      }) => Promise<Array<{ getFile: () => Promise<File>; name?: string }>>
    }

    if (pickerWindow.showOpenFilePicker) {
      try {
        const [handle] = await pickerWindow.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'Service Catalogue DSL',
              accept: { 'text/plain': ['.dsl', '.catalogue', '.txt'] },
            },
          ],
        })

        if (!handle) {
          return
        }

        const file = await handle.getFile()
        fileHandleRef.current = handle
        await openFromFile(file)
      } catch {
        // User cancelled file open.
      }
      return
    }

    fileInputRef.current?.click()
  }

  const handleSaveAs = async () => {
    const pickerWindow = window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string
        types?: Array<{
          description?: string
          accept: Record<string, string[]>
        }>
      }) => Promise<{
        name?: string
        createWritable: () => Promise<{
          write: (contents: string) => Promise<void>
          close: () => Promise<void>
        }>
      }>
    }

    if (pickerWindow.showSaveFilePicker) {
      try {
        const handle = await pickerWindow.showSaveFilePicker({
          suggestedName: documentName,
          types: [
            {
              description: 'Service Catalogue DSL',
              accept: { 'text/plain': ['.dsl', '.catalogue', '.txt'] },
            },
          ],
        })

        const writable = await handle.createWritable()
        await writable.write(source)
        await writable.close()
        fileHandleRef.current = handle
        if (handle.name) {
          setDocumentName(handle.name)
        }
      } catch {
        // User cancelled file save.
      }
      return
    }

    downloadToFile(documentName)
  }

  const handleSave = async () => {
    if (fileHandleRef.current?.createWritable) {
      const writable = await fileHandleRef.current.createWritable()
      await writable.write(source)
      await writable.close()
      if (fileHandleRef.current.name) {
        setDocumentName(fileHandleRef.current.name)
      }
      return
    }

    await handleSaveAs()
  }

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    fileHandleRef.current = null
    await openFromFile(file)
    event.target.value = ''
  }

  return {
    source,
    setSource,
    documentName,
    fileInputRef,
    openFromUrl,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleFileInputChange,
  }
}