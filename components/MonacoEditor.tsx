// components/MonacoEditor.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  theme?: string;
}

const MonacoEditor = ({ value, language, onChange, readOnly = false, theme = 'vs-dark' }: MonacoEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language,
      theme,
      readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      wordWrap: 'on',
      mouseWheelZoom: true,
      folding: true,
      padding: { top: 15, bottom: 15 },
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      contextmenu: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
    });

    // Listen for changes
    editorRef.current.onDidChangeModelContent(() => {
      const newValue = editorRef.current?.getValue();
      if (newValue !== undefined) {
        onChange(newValue);
      }
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  // Update value if changed externally (e.g., language switch)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(value);
      }
    }
  }, [value]);

  // Update readonly state
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  return <div ref={containerRef} className="h-full w-full -z-100" />;
};

export default MonacoEditor;