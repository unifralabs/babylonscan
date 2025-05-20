'use client'

import React, { useEffect, useState } from 'react'

import CopyIcon from './copy-icon'
import { json } from '@codemirror/lang-json'
import { rust } from '@codemirror/lang-rust'
import * as Accordion from '@radix-ui/react-accordion'
import CodeMirror from '@uiw/react-codemirror'
import {
  ChevronRight,
  Download,
  FileCode,
  FolderIcon,
  Github,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn, getAppResolvedTheme } from '@cosmoscan/shared/utils'

interface FileNode {
  name: string
  children?: FileNode[]
  content?: string
}

interface RustProjectViewerProps {
  projectStructure: {
    sources: {
      [key: string]: {
        content: string
      }
    }
  }
  openFilePath: string | null
  repositoryUrl?: string | null
}

const RustProjectViewer: React.FC<RustProjectViewerProps> = ({
  projectStructure,
  openFilePath,
  repositoryUrl,
}) => {
  const { resolvedTheme } = useTheme()
  const [treeData, setTreeData] = useState<FileNode>({
    name: 'root',
    children: [],
  })
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [accordionValue, setAccordionValue] = useState<string[]>([])

  useEffect(() => {
    const buildTreeData = () => {
      const root: FileNode = { name: 'root', children: [] }

      Object.entries(projectStructure.sources).forEach(
        ([path, { content }]) => {
          const parts = path.split('/')
          let currentNode = root

          parts.forEach((part, index) => {
            if (index === parts.length - 1) {
              currentNode.children = currentNode.children || []
              currentNode.children.push({ name: part, content })
            } else {
              let child = currentNode.children?.find(c => c.name === part)
              if (!child) {
                child = { name: part, children: [] }
                currentNode.children = currentNode.children || []
                currentNode.children.push(child)
              }
              currentNode = child
            }
          })
        },
      )

      setTreeData(root)
    }

    buildTreeData()

    if (openFilePath) {
      const fileName = openFilePath.split('/').pop() || ''
      const content = projectStructure.sources[openFilePath]?.content || ''
      setSelectedFile(fileName)
      setSelectedFilePath(openFilePath)
      setFileContent(content)

      // Open all parent folders of Cargo.toml
      const parentFolders = openFilePath.split('/').slice(0, -1)
      const newAccordionValue = parentFolders.map((_, index) =>
        parentFolders.slice(0, index + 1).join('/'),
      )
      setAccordionValue(newAccordionValue)
    }
  }, [projectStructure, openFilePath])

  const renderTree = (
    node: FileNode,
    path: string = '',
    depth: number = 0,
    isLast: boolean = true,
  ) => {
    const currentPath = path ? `${path}/${node.name}` : node.name
    const indentation = depth * 16 // 16px indentation per level
    const isSelected = selectedFile === node.name
    const isOpen = accordionValue.includes(currentPath)

    const contentClass = cn(
      'flex items-center py-1',
      isSelected && 'bg-accent text-accent-foreground',
    )

    const renderLineAndIcon = (isOpen?: boolean) => (
      <div className="flex items-center">
        {node.children ? (
          <>
            <ChevronRight
              id={`chevron-${currentPath}`}
              className={cn(
                'text-primary mr-1 transition-transform duration-200',
                isOpen && 'rotate-90',
              )}
              size={16}
            />
            <FolderIcon className="mr-2" size={16} />
          </>
        ) : (
          <FileCode className="mr-2" size={16} />
        )}
      </div>
    )

    if (node.children) {
      return (
        <Accordion.Item value={currentPath} key={currentPath}>
          <Accordion.Trigger className="flex w-full items-center py-1 text-left">
            <div className={contentClass}>
              <div
                style={{ marginLeft: `${indentation}px` }}
                className="flex items-center"
              >
                {renderLineAndIcon(isOpen)}
                {node.name}
              </div>
            </div>
          </Accordion.Trigger>
          <Accordion.Content>
            {node.children.map((child, index) =>
              renderTree(
                child,
                currentPath,
                depth + 1,
                index === node.children!.length - 1,
              ),
            )}
          </Accordion.Content>
        </Accordion.Item>
      )
    } else {
      return (
        <div
          key={currentPath}
          className={cn(contentClass, 'cursor-pointer')}
          onClick={() => {
            setSelectedFile(node.name)
            setSelectedFilePath(currentPath)
            setFileContent(node.content || '')
          }}
        >
          <div
            style={{ marginLeft: `${indentation + 16}px` }}
            className="flex items-center"
          >
            {renderLineAndIcon(isOpen)}
            {node.name}
          </div>
        </div>
      )
    }
  }

  const getLanguageExtension = (fileName: string) => {
    if (fileName.endsWith('.rs')) return rust()
    if (fileName === 'Cargo.toml') return json()
    return rust() // default to rust
  }

  const handleDownload = () => {
    if (selectedFile && fileContent) {
      const blob = new Blob([fileContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = selectedFile
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-1/4 flex-col overflow-auto p-4">
        <div className="flex-grow">
          <Accordion.Root
            type="multiple"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            {treeData.children?.map((child, index) =>
              renderTree(child, '', 0, index === treeData.children!.length - 1),
            )}
          </Accordion.Root>
        </div>
        {repositoryUrl && (
          <div className="mt-4 text-sm">
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/80 flex items-center justify-center gap-2 rounded px-3 py-2 text-sm text-white"
            >
              <Github size={16} />
              Github Repository
            </a>
          </div>
        )}
      </div>
      <div className="w-3/4 overflow-hidden">
        {selectedFile ? (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="bg-accent flex items-center justify-between p-2 text-sm font-medium">
              <div className="flex items-center">
                <FileCode className="mr-2" size={16} />
                <span className="truncate">{selectedFilePath}</span>
              </div>
              <button
                onClick={handleDownload}
                className="text-primary hover:text-primary-dark transition-colors"
                title="Download file"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="relative flex-1 overflow-auto">
              <div className="absolute right-2 top-2 z-10">
                <CopyIcon text={fileContent} variant="button" />
              </div>
              <CodeMirror
                value={fileContent}
                height="100%"
                extensions={[getLanguageExtension(selectedFile)]}
                theme={getAppResolvedTheme(resolvedTheme)}
                editable={false}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  )
}

export default RustProjectViewer
