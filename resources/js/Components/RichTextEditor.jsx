import { useRef } from 'react';
import FormattedDescription from '@/Components/FormattedDescription';

const tools = [
  { label: <span className="font-black">B</span>, title: 'Bold selected text', before: '**' },
  { label: <span className="italic">I</span>, title: 'Italic selected text', before: '*' },
  { label: <span className="underline">U</span>, title: 'Underline selected text', before: '__' },
];

export default function RichTextEditor({ value = '', onChange, rows = 5, placeholder = 'Write details here...', className = '' }) {
  const inputRef = useRef(null);
  const text = value ?? '';

  function wrapSelection(before, after = before, sample = 'text') {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = text.slice(start, end) || sample;
    onChange(`${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function prefixLines(prefix, sample) {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const nextBreak = text.indexOf('\n', end);
    const lineEnd = nextBreak === -1 ? text.length : nextBreak;
    const selected = text.slice(lineStart, lineEnd) || sample;
    const replacement = selected.split('\n').map(line => `${prefix}${line}`).join('\n');
    onChange(`${text.slice(0, lineStart)}${replacement}${text.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(lineStart, lineStart + replacement.length);
    });
  }

  const buttonClass = 'min-w-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700';

  return (
    <div>
      <textarea
        ref={inputRef}
        rows={rows}
        value={text}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className={className || 'block w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-indigo-500'}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {tools.map(tool => (
          <button key={tool.title} type="button" title={tool.title} onMouseDown={event => event.preventDefault()} onClick={() => wrapSelection(tool.before)} className={buttonClass}>
            {tool.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-slate-300" />
        <button type="button" title="Add a section heading" onMouseDown={event => event.preventDefault()} onClick={() => prefixLines('## ', 'Section heading')} className={buttonClass}>H2</button>
        <button type="button" title="Add bullet list markers" onMouseDown={event => event.preventDefault()} onClick={() => prefixLines('- ', 'List item')} className={buttonClass}>• List</button>
        <button type="button" title="Add numbered list markers" onMouseDown={event => event.preventDefault()} onClick={() => prefixLines('1. ', 'List item')} className={buttonClass}>1. List</button>
        <button type="button" title="Format as a quote" onMouseDown={event => event.preventDefault()} onClick={() => prefixLines('> ', 'Quote')} className={buttonClass}>❝ Quote</button>
      </div>
      <p className="mt-1 text-xs text-slate-500">Select text to format, or click a tool without a selection to insert sample text.</p>
      {text && (
        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600">Preview</p>
          <FormattedDescription text={text} className="text-sm text-slate-700" />
        </div>
      )}
    </div>
  );
}
