import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'

import { classNames } from '@/utils/classNames'
import { parseMarkdown } from '@/utils/markdown'

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable; ignore quietly.
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 bg-slate-800/70 px-3.5 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-300">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}

function InlineNode({ node }) {
  switch (node.type) {
    case 'text':
      return node.text
    case 'code':
      return (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-brand-800">
          {node.code}
        </code>
      )
    case 'bold':
      return <strong className="font-semibold text-slate-900">{renderInline(node.children)}</strong>
    case 'italic':
      return <em>{renderInline(node.children)}</em>
    case 'strike':
      return <s className="text-slate-400">{renderInline(node.children)}</s>
    case 'link': {
      if (node.href == null) return renderInline(node.children)
      if (node.href.startsWith('/')) {
        return <Link to={node.href} className="text-brand-700 underline decoration-brand-300 underline-offset-2 transition-colors hover:text-brand-800">{renderInline(node.children)}</Link>
      }
      return (
        <a
          href={node.href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-brand-700 underline decoration-brand-300 underline-offset-2 transition-colors hover:text-brand-800"
        >
          {renderInline(node.children)}
        </a>
      )
    }
    case 'image':
      return node.src ? (
        <img src={node.src} alt={node.alt || ''} loading="lazy" className="my-2 max-h-72 rounded-lg border border-slate-200" />
      ) : null
    default:
      return null
  }
}

function renderInline(nodes) {
  return nodes.map((node, index) => <InlineNode key={index} node={node} />)
}

function Block({ block }) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}`
      const styles = {
        1: 'mt-6 mb-3 text-xl font-bold text-slate-900',
        2: 'mt-5 mb-2.5 text-lg font-bold text-slate-900',
        3: 'mt-4 mb-2 text-base font-semibold text-slate-900',
      }
      return <Tag className={styles[block.level] ?? 'mt-4 mb-2 text-base font-semibold text-slate-900'}>{renderInline(block.inline)}</Tag>
    }
    case 'paragraph':
      return <p className="my-3 first:mt-0 last:mb-0">{renderInline(block.inline)}</p>
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />
    case 'quote':
      return (
        <blockquote className="my-4 border-l-4 border-brand-200 bg-brand-50/50 px-4 py-1.5 text-[0.95em] text-slate-600">
          {block.blocks.map((child, index) => (
            <Block key={index} block={child} />
          ))}
        </blockquote>
      )
    case 'hr':
      return <hr className="my-6 border-slate-200" />
    case 'list':
      return block.ordered ? (
        <ol className="my-3 list-decimal space-y-1 pl-6 marker:font-medium marker:text-slate-400">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.blocks.map((child, childIndex) => (
                <Block key={childIndex} block={child} />
              ))}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-3 list-disc space-y-1 pl-6 marker:text-slate-400">
          {block.items.map((item, index) => (
            <li key={index}>
              {item.blocks.map((child, childIndex) => (
                <Block key={childIndex} block={child} />
              ))}
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                {block.head.map((cell, index) => (
                  <th key={index} className="px-3 py-2 text-left font-semibold text-slate-700" style={alignStyle(block.align?.[index])}>
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 hover:bg-slate-50/60">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 align-top" style={alignStyle(block.align?.[cellIndex])}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

function alignStyle(align) {
  return align === 'center' ? { textAlign: 'center' } : align === 'right' ? { textAlign: 'right' } : undefined
}

export function Markdown({ markdown, className }) {
  const blocks = parseMarkdown(markdown)

  return (
    <div
      className={classNames(
        'text-[15px] leading-relaxed text-slate-800 [&_a]:break-words [&_pre]:whitespace-pre-wrap [&_code]:break-words',
        className,
      )}
    >
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}