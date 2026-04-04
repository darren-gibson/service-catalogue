const DSL_LANGUAGE_ID = 'service-catalogue-dsl'

interface DslEntities {
  outcomeDomains: string[]
  serviceProducts: string[]
  serviceOfferings: string[]
  consumers: string[]
}

let languageConfigured = false

function stripDslComment(line: string): string {
  let output = ''

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    const next = line[i + 1]

    if (ch === '\\' && next === '#') {
      output += '#'
      i += 1
      continue
    }

    if (ch === '#') {
      break
    }

    output += ch
  }

  return output.trimEnd()
}

function countLeadingTabs(value: string): number {
  let index = 0
  while (index < value.length && value[index] === '\t') {
    index += 1
  }
  return index
}

function pushUnique(list: string[], value: string) {
  if (!value || list.includes(value)) {
    return
  }
  list.push(value)
}

function collectEntities(source: string): DslEntities {
  const entities: DslEntities = {
    outcomeDomains: [],
    serviceProducts: [],
    serviceOfferings: [],
    consumers: [],
  }

  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripDslComment(rawLine)
    const trimmed = line.trim()
    if (!trimmed || trimmed === 'serviceCatalogue') {
      continue
    }

    if (trimmed.startsWith('Consumer:')) {
      pushUnique(entities.consumers, trimmed.slice('Consumer:'.length).trim())
      continue
    }

    if (trimmed.includes('-->')) {
      continue
    }

    const depth = countLeadingTabs(line)
    if (depth === 0) {
      pushUnique(entities.outcomeDomains, trimmed)
    } else if (depth === 1) {
      pushUnique(entities.serviceProducts, trimmed)
    } else if (depth === 2) {
      pushUnique(entities.serviceOfferings, trimmed)
    }
  }

  return entities
}

export function ensureDslLanguage(monaco: typeof import('monaco-editor')) {
  if (languageConfigured) {
    return
  }

  monaco.languages.register({ id: DSL_LANGUAGE_ID })

  monaco.languages.setMonarchTokensProvider(DSL_LANGUAGE_ID, {
    tokenizer: {
      root: [
        [/^\s*#.*/, 'comment'],
        [/\bserviceCatalogue\b/, 'keyword'],
        [/\bConsumer\b/, 'type.identifier'],
        [/\b(in|out|description|slo)(?=\s*:)/, 'attribute.name'],
        [/-->/, 'operator'],
        [/:[^#\n]*/, 'string'],
      ],
    },
  })

  monaco.languages.setLanguageConfiguration(DSL_LANGUAGE_ID, {
    comments: {
      lineComment: '#',
    },
    autoClosingPairs: [
      { open: '"', close: '"' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
  })

  monaco.languages.registerCompletionItemProvider(DSL_LANGUAGE_ID, {
    provideCompletionItems: (model, position) => {
      const entities = collectEntities(model.getValue())
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const linePrefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      const trimmedPrefix = linePrefix.trimStart()
      const depth = countLeadingTabs(linePrefix)

      const suggestions: import('monaco-editor').languages.CompletionItem[] = []
      const seen = new Set<string>()

      const add = (
        item: import('monaco-editor').languages.CompletionItem,
        priority: 'high' | 'normal' | 'low' = 'normal',
      ) => {
        const key = `${item.label}:${item.insertText}`
        if (seen.has(key)) {
          return
        }
        seen.add(key)

        const prefix = priority === 'high' ? '0' : priority === 'normal' ? '1' : '2'
        suggestions.push({
          ...item,
          sortText: item.sortText ?? `${prefix}-${String(item.label).toLowerCase()}`,
        })
      }

      const addNameSuggestions = (
        names: string[],
        kind: import('monaco-editor').languages.CompletionItemKind,
        priority: 'high' | 'normal' | 'low' = 'high',
      ) => {
        for (const name of names) {
          add({
            label: name,
            kind,
            insertText: name,
            range,
          }, priority)
        }
      }

      const addEdgeSuggestions = (priority: 'high' | 'normal' | 'low' = 'normal') => {
        const sources = [...entities.consumers, ...entities.serviceOfferings]
        for (const source of sources) {
          for (const offering of entities.serviceOfferings) {
            add({
              label: `${source} --> ${offering}`,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `${source} --> ${offering}`,
              range,
            }, priority)
          }
        }
      }

      add({
        label: 'serviceCatalogue',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'serviceCatalogue',
        range,
      }, 'low')

      add({
        label: 'Consumer',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: 'Consumer: ${1:name}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      }, 'normal')

      add({
        label: 'uses edge',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '${1:consumer or service offering} --> ${2:service offering}',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      }, 'normal')

      if (depth === 1) {
        add({
          label: 'description',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'description: ${1:outcome or consumer description}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
      }

      if (depth === 2) {
        add({
          label: 'description',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'description: ${1:service product description}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
      }

      if (depth === 3 || /\t{3}\s*(in|out|description|slo)?$/.test(linePrefix)) {
        add({
          label: 'description',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'description: ${1:service offering description}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
        add({
          label: 'slo',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'slo: ${1:availability/latency target}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
        add({
          label: 'in',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'in: ${1:requirements}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
        add({
          label: 'out',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: 'out: ${1:provisioned service}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        }, 'high')
      }

      if (trimmedPrefix.startsWith('Consumer:')) {
        addNameSuggestions(entities.consumers, monaco.languages.CompletionItemKind.Value)
      }

      if (trimmedPrefix.includes('-->')) {
        const arrowIndex = linePrefix.indexOf('-->')
        const cursorIndex = position.column - 1
        const arrowEndIndex = arrowIndex + 3

        if (cursorIndex <= arrowEndIndex) {
          addNameSuggestions(entities.consumers, monaco.languages.CompletionItemKind.Variable)
          addNameSuggestions(entities.serviceOfferings, monaco.languages.CompletionItemKind.Reference)
        } else {
          addNameSuggestions(entities.serviceOfferings, monaco.languages.CompletionItemKind.Reference)
        }
      } else if (!trimmedPrefix.startsWith('Consumer:')) {
        if (depth === 0) {
          addNameSuggestions(entities.outcomeDomains, monaco.languages.CompletionItemKind.Class)
        } else if (depth === 1) {
          addNameSuggestions(entities.serviceProducts, monaco.languages.CompletionItemKind.Interface)
        } else if (depth === 2) {
          addNameSuggestions(entities.serviceOfferings, monaco.languages.CompletionItemKind.Reference)
        }
      }

      addNameSuggestions(entities.outcomeDomains, monaco.languages.CompletionItemKind.Class, 'low')
      addNameSuggestions(entities.serviceProducts, monaco.languages.CompletionItemKind.Interface, 'low')
      addNameSuggestions(entities.serviceOfferings, monaco.languages.CompletionItemKind.Reference, 'low')
      addNameSuggestions(entities.consumers, monaco.languages.CompletionItemKind.Variable, 'low')
      addEdgeSuggestions('low')

      return { suggestions }
    },
  })

  languageConfigured = true
}

export { DSL_LANGUAGE_ID }