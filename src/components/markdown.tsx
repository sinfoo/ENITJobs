import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`prose-doc ${className}`}>
      {/* Documents sit under the page h1: demote their headings one level. */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: "h2", h2: "h3", h3: "h4", h4: "h5" }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
