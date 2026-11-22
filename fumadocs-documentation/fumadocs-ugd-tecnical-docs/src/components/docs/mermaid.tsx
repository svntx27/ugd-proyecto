'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Copy, Check, Code, Eye, RefreshCw } from 'lucide-react';

interface MermaidProps {
  chart?: string;
  children?: React.ReactNode;
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  if (Array.isArray(children)) return children.map(extractCode).join('');
  if (React.isValidElement(children) && (children.props as any)?.children) {
    return extractCode((children.props as any).children);
  }
  return '';
}

export function Mermaid({ chart, children }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const rawCode = (chart || extractCode(children) || '').trim();
  const idPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, '_');

  const renderMermaid = async () => {
    if (!rawCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Carga dinámica en tiempo de ejecución en el navegador evitando resolución estática en TypeScript
      const dynamicImport = new Function('url', 'return import(url)');
      const mermaidModule = await dynamicImport(
        'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'
      );
      const mermaid = mermaidModule.default || mermaidModule;

      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        fontFamily: 'inherit',
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark
          ? {
              darkMode: true,
              background: '#090d16',
              mainBkg: '#111827',
              primaryColor: '#1e3a8a',
              primaryTextColor: '#f8fafc',
              primaryBorderColor: '#3b82f6',
              lineColor: '#60a5fa',
              secondaryColor: '#1e293b',
              tertiaryColor: '#0f172a',
              edgeLabelBackground: '#1e293b',
              nodeBorder: '#3b82f6',
              clusterBkg: '#0f172a',
              clusterBorder: '#1e293b',
            }
          : {
              background: '#f8fafc',
              mainBkg: '#ffffff',
              primaryColor: '#dbeafe',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#2563eb',
              lineColor: '#2563eb',
              secondaryColor: '#f1f5f9',
              tertiaryColor: '#e2e8f0',
              edgeLabelBackground: '#ffffff',
              nodeBorder: '#2563eb',
            },
      });

      const renderId = `m_${idPrefix}_${Math.random().toString(36).substring(2, 9)}`;
      const { svg: renderedSvg } = await mermaid.render(renderId, rawCode);
      setSvg(renderedSvg);
    } catch (err: any) {
      console.error('Error renderizando Mermaid:', err);
      setError(err?.message || 'Error al procesar la sintaxis del diagrama.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    renderMermaid();

    // Observar cambio de tema claro / oscuro en tiempo real
    const observer = new MutationObserver(() => {
      renderMermaid();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, [rawCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-border bg-card/60 overflow-hidden shadow-sm backdrop-blur-sm">
      {/* Barra superior de controles del diagrama */}
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block size-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Diagrama Arquitectónico</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-accent hover:text-foreground"
            title={showCode ? 'Ver diagrama visual' : 'Ver código Mermaid'}
          >
            {showCode ? <Eye className="size-3.5" /> : <Code className="size-3.5" />}
            <span>{showCode ? 'Ver Diagrama' : 'Ver Código'}</span>
          </button>
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors hover:bg-accent hover:text-foreground"
            title="Copiar código Mermaid"
          >
            {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Contenido del diagrama o código */}
      {showCode ? (
        <div className="p-4 bg-muted/20 font-mono text-xs overflow-x-auto">
          <pre className="text-muted-foreground leading-relaxed">{rawCode}</pre>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground gap-3">
          <RefreshCw className="size-5 animate-spin text-blue-500" />
          <span>Renderizando diagrama interactivo...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400">
          <p className="font-semibold mb-1">No se pudo procesar el diagrama:</p>
          <p className="opacity-90">{error}</p>
          <pre className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 overflow-x-auto text-[11px]">
            {rawCode}
          </pre>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex justify-center p-6 overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto transition-all"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
