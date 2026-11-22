import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { ApiEndpoint } from './docs/api-endpoint';
import { ParamTable, ParamField } from './docs/param-table';
import { RoleBadge } from './docs/role-badge';
import { ResponseBadge } from './docs/response-badge';
import { ModelField, ModelTable } from './docs/model-field';
import { Mermaid } from './docs/mermaid';
import { Permit, Deny, PermissionBadge } from './docs/permission-badge';
import React from 'react';

function extractPlainText(node: any): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractPlainText).join('');
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractPlainText((node.props as any).children);
  }
  return '';
}

function checkMermaid(props: any): { isMermaid: boolean; code: string } {
  const dataLang = props?.['data-language'];
  const className = String(props?.className || '');
  const childProps = props?.children?.props;
  const childClassName = String(childProps?.className || '');

  const text = extractPlainText(props?.children || props).trim();
  const startsWithMermaidKeyword =
    /^(erDiagram|flowchart|sequenceDiagram|graph|classDiagram|stateDiagram|gantt|pie|gitGraph|journey|quadrantChart|xychart-beta|timeline|architecture)/m.test(
      text
    );

  if (
    dataLang === 'mermaid' ||
    className.includes('language-mermaid') ||
    className.includes('mermaid') ||
    childClassName.includes('language-mermaid') ||
    childClassName.includes('mermaid') ||
    startsWithMermaidKeyword
  ) {
    return { isMermaid: true, code: text };
  }

  return { isMermaid: false, code: '' };
}

export function getMDXComponents(components?: MDXComponents) {
  const DefaultPre = defaultMdxComponents.pre;

  return {
    ...defaultMdxComponents,
    pre: (props: any) => {
      const { isMermaid, code } = checkMermaid(props);
      if (isMermaid && code) {
        return <Mermaid chart={code} />;
      }
      return <DefaultPre {...props} />;
    },
    // Componentes interactivos oficiales de Fumadocs UI
    Step,
    Steps,
    Tab,
    Tabs,
    // Componentes personalizados para documentación técnica de APIs y arquitectura UGD
    Mermaid,
    ApiEndpoint,
    ParamTable,
    ParamField,
    RoleBadge,
    ResponseBadge,
    ModelField,
    ModelTable,
    Permit,
    Deny,
    PermissionBadge,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
