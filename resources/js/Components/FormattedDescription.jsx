function inlineFormatting(text) {
  const tokens = text.split(/(\*\*.+?\*\*|__.+?__|\*.+?\*)/g).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('__') && token.endsWith('__')) {
      return <u key={index}>{token.slice(2, -2)}</u>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

export default function FormattedDescription({ text, className = '' }) {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let index = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="whitespace-pre-wrap leading-relaxed">
        {paragraph.map((line, lineIndex) => (
          <span key={lineIndex}>{lineIndex > 0 && <br />}{inlineFormatting(line)}</span>
        ))}
      </p>
    );
    paragraph = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    const heading = line.match(/^#{1,3}\s+(.+)/);
    const quote = line.match(/^>\s?(.*)/);
    const bullet = line.match(/^[-*•]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);

    if (!line.trim()) {
      flushParagraph();
      index++;
      continue;
    }

    if (heading) {
      flushParagraph();
      blocks.push(<h4 key={`h-${index}`} className="text-base font-bold text-slate-900">{inlineFormatting(heading[1])}</h4>);
      index++;
      continue;
    }

    if (quote) {
      flushParagraph();
      blocks.push(<blockquote key={`q-${index}`} className="border-l-2 border-indigo-300 pl-3 italic text-slate-600">{inlineFormatting(quote[1])}</blockquote>);
      index++;
      continue;
    }

    if (bullet || numbered) {
      flushParagraph();
      const isNumbered = Boolean(numbered);
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(isNumbered ? /^\d+[.)]\s+(.+)/ : /^[-*•]\s+(.+)/);
        if (!item) break;
        items.push(<li key={index}>{inlineFormatting(item[1])}</li>);
        index++;
      }
      const List = isNumbered ? 'ol' : 'ul';
      blocks.push(<List key={`list-${index}`} className={`space-y-1 pl-5 ${isNumbered ? 'list-decimal' : 'list-disc'}`}>{items}</List>);
      continue;
    }

    paragraph.push(line);
    index++;
  }

  flushParagraph();
  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
}
