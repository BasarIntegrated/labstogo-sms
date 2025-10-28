"use client";

import EmailEditor from "react-email-editor";
import { useEffect, useRef } from "react";

interface EmailEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function EmailEditorComponent({ content, onChange }: EmailEditorProps) {
  const emailEditorRef = useRef<any>(null);

  useEffect(() => {
    if (emailEditorRef.current && content) {
      // Load existing content if available
      try {
        const design = typeof content === 'string' ? JSON.parse(content) : content;
        emailEditorRef.current.editor.loadDesign(design);
      } catch (error) {
        console.error("Failed to load design:", error);
        // Create a default design with HTML content
        emailEditorRef.current.editor.loadDesign({
          body: {
            rows: [
              {
                columns: [
                  {
                    contents: [
                      {
                        type: 'text',
                        value: content,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        });
      }
    }
  }, [content]);

  const onReady = () => {
    // Editor is ready
  };

  const exportHtml = () => {
    emailEditorRef.current?.exportHtml((data: any) => {
      const { html } = data;
      onChange(html);
    });
  };

  return (
    <div className="border border-gray-300 rounded-md" style={{ height: '500px' }}>
      <div className="bg-white p-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Email Content Editor</h3>
        <button
          type="button"
          onClick={exportHtml}
          className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Save HTML
        </button>
      </div>
      <EmailEditor
        ref={emailEditorRef}
        onReady={onReady}
        options={{
          tools: {
            image: {
              enabled: true,
            },
          },
          appearance: {
            theme: 'light',
          },
        }}
      />
      <style jsx global>{`
        .unlayer-editor {
          height: 450px !important;
        }
      `}</style>
    </div>
  );
}
