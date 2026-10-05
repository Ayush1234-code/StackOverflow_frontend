// Lightweight, dependency-free Markdown parser for user-generated content.
//
// The parser produces a plain AST (no HTML strings), so the renderer can build
// React elements without ever using dangerouslySetInnerHTML. Raw HTML in the
// source is treated as plain text. Links and images only accept safe schemes
// (http, https, mailto, tel, and same-site relative paths).

const INLINE_TOKEN =
  /(\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|`[^`]+`|\*[^*\n]+\*|(?<![A-Za-z0-9])_([^_\n]+)_(?![A-Za-z0-9])|!\[([^\]]{0,200})\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]{1,200})\]\(([^)\s]+)(?:\s+"[^"]*")?\))/g

const HEADING_RE = /^(#{1,6})\s+(.*)$/
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/
const CODE_FENCE_RE = /^(`{3,}|~{3,})([^\s`]*)?\s*$/
const LIST_MARKER_RE = /^(\s*)([-+*]|\d+[.)])\s+/
const TABLE_DELIM_RE = /^\s*\|?\s*:?-{1,}:?(?:\s*\|\s*:?-{1,}:?)*\s*\|?\s*$/

function indentOf(line) {
  return /^ */.exec(line)?.[0].length ?? 0
}

function isListStartAt(line, indent) {
  const match = line.match(LIST_MARKER_RE)
  return Boolean(match && (indent == null || match[1].length === indent))
}

function isPlainLine(line) {
  return (
    !line.trim() ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    CODE_FENCE_RE.test(line.trim()) ||
    line.trim().startsWith('>') ||
    LIST_MARKER_RE.test(line)
  )
}

export function parseMarkdown(source) {
  if (!source) return []
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n')
  return parseBlocks(lines)
}

function parseBlocks(lines) {
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    // Fenced code block
    const fence = line.trim().match(CODE_FENCE_RE)
    if (fence) {
      const marker = fence[1][0]
      const length = fence[1].length
      const lang = (fence[2] || '').toLowerCase()
      const codeLines = []
      i += 1
      while (i < lines.length) {
        const current = lines[i]
        const closing = current.trim().match(new RegExp(`^${marker}{${length},}\\s*$`))
        if (closing) {
          i += 1
          break
        }
        codeLines.push(current)
        i += 1
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    // Heading
    const heading = line.match(HEADING_RE)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, inline: parseInline(heading[2]) })
      i += 1
      continue
    }

    // Horizontal rule
    if (HR_RE.test(line)) {
      blocks.push({ type: 'hr' })
      i += 1
      continue
    }

    // Blockquote
    if (line.trimStart().startsWith('>')) {
      const quoted = []
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quoted.push(lines[i].trimStart().replace(/^>\s?/, ''))
        i += 1
      }
      blocks.push({ type: 'quote', blocks: parseBlocks(quoted) })
      continue
    }

    // Table (header line followed by a delimiter row)
    if (line.trim().startsWith('|') && i + 1 < lines.length && TABLE_DELIM_RE.test(lines[i + 1])) {
      const headerCells = splitTableRow(line)
      const alignCells = splitTableRow(lines[i + 1])
      const rows = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|') && !TABLE_DELIM_RE.test(lines[i])) {
        rows.push(splitTableRow(lines[i]).map((cell) => parseInline(cell)))
        i += 1
      }
      blocks.push({
        type: 'table',
        head: headerCells.map((cell) => parseInline(cell)),
        align: alignCells.map((cell) => {
          const trimmed = cell.trim()
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center'
          if (trimmed.endsWith(':')) return 'right'
          return 'left'
        }),
        rows,
      })
      continue
    }

    // List
    if (isListStartAt(line)) {
      const parsed = parseListAt(lines, i)
      if (parsed) {
        blocks.push(parsed.block)
        i = parsed.next
        while (i < lines.length && !lines[i].trim()) i += 1
        continue
      }
    }

    // Paragraph (collect until a blank line or another block structure)
    const paragraphLines = [line]
    i += 1
    while (i < lines.length && lines[i].trim() && !isPlainLine(lines[i])) {
      paragraphLines.push(lines[i])
      i += 1
    }
    blocks.push({ type: 'paragraph', inline: parseInline(paragraphLines.join(' ')) })
  }

  return blocks
}

function parseListAt(lines, start) {
  const first = lines[start]
  if (!isListStartAt(first)) return null

  const baseIndent = indentOf(first)
  const items = []
  let i = start

  while (i < lines.length && isListStartAt(lines[i], baseIndent)) {
    const match = lines[i].match(LIST_MARKER_RE)
    const ordered = /^\d/.test(match[2])
    const content = [lines[i].replace(LIST_MARKER_RE, '')]
    i += 1

    // Collect continuation lines and nested sub-lists
    while (i < lines.length && lines[i].trim()) {
      if (isListStartAt(lines[i], baseIndent)) break
      if (isListStartAt(lines[i], baseIndent + 1) || isListStartAt(lines[i], baseIndent + 2)) {
        const nested = parseListAt(lines, i)
        if (nested) {
          content.push(null) // marks a sub-list boundary
          content.push(nested.block)
          i = nested.next
          continue
        }
      }
      content.push(lines[i].trimStart())
      i += 1
    }

    const subBlocks = []
    let textLines = []
    for (const part of content) {
      if (part === null) {
        if (textLines.length) {
          subBlocks.push({ type: 'paragraph', inline: parseInline(textLines.join(' ')) })
          textLines = []
        }
        continue
      }
      if (typeof part === 'object' && part.type === 'list') {
        if (textLines.length) {
          subBlocks.push({ type: 'paragraph', inline: parseInline(textLines.join(' ')) })
          textLines = []
        }
        subBlocks.push(part)
        continue
      }
      textLines.push(part)
    }
    if (textLines.length) {
      subBlocks.push({ type: 'paragraph', inline: parseInline(textLines.join(' ')) })
    }

    items.push({ ordered, blocks: subBlocks })
  }

  return { block: { type: 'list', ordered: items[0].ordered, items }, next: i }
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

export function parseInline(text, depth = 0) {
  if (!text) return []
  if (depth > 8) return [{ type: 'text', text }]

  const nodes = []
  let lastIndex = 0
  let match

  INLINE_TOKEN.lastIndex = 0
  while ((match = INLINE_TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }

    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push({ type: 'bold', children: parseInline(match[1], depth + 1) })
    } else if (token.startsWith('__')) {
      nodes.push({ type: 'bold', children: parseInline(match[1], depth + 1) })
    } else if (token.startsWith('~~')) {
      nodes.push({ type: 'strike', children: parseInline(match[1], depth + 1) })
    } else if (token.startsWith('`')) {
      nodes.push({ type: 'code', code: token.slice(1, -1) })
    } else if (token.startsWith('*')) {
      nodes.push({ type: 'italic', children: parseInline(token.slice(1, -1), depth + 1) })
    } else if (token.startsWith('_')) {
      nodes.push({ type: 'italic', children: parseInline(match[2], depth + 1) })
    } else if (token.startsWith('![')) {
      nodes.push({ type: 'image', alt: match[3], src: safeUrl(match[4]) })
    } else if (token.startsWith('[')) {
      nodes.push({
        type: 'link',
        href: safeUrl(match[6]) ?? null,
        children: parseInline(match[5], depth + 1),
      })
    }

    lastIndex = INLINE_TOKEN.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return nodes
}

function safeUrl(value) {
  const url = String(value ?? '').trim()
  if (!url) return null
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  if (/^(#|\/|\.\.?\/)/.test(url)) return url
  return null
}