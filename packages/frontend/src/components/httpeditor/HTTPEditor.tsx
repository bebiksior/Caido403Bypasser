import React, { useEffect, useRef } from "react";
import {
  HTTPRequestEditor,
  HTTPResponseEditor,
} from "@caido/sdk-frontend/src/types/editor";
import { useSDKStore } from "@/stores/sdkStore";

interface HTTPEditorProps {
  value: string;
  type: "request" | "response";
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
  removeFooter?: boolean;
  removeHeader?: boolean;
}

type EditorType = HTTPRequestEditor | HTTPResponseEditor;

export const HTTPEditor: React.FC<HTTPEditorProps> = ({
  value,
  type,
  style,
  onChange,
  removeFooter = false,
  removeHeader = false,
}) => {
  const sdk = useSDKStore.getState().getSDK();
  const editorRef = useRef<EditorType | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const setValue = (value: string) => {
    const view = editorRef.current?.getEditorView();
    if (!view) return;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const newEditor =
      type === "request"
        ? sdk.ui.httpRequestEditor()
        : sdk.ui.httpResponseEditor();

    editorRef.current = newEditor;
    containerRef.current.appendChild(newEditor.getElement());
    setValue(value);

    const card = newEditor.getEditorView()?.dom?.closest(".c-card");
    if (card) {
      if (removeFooter) card?.querySelector(".c-card__footer")?.remove();
      if (removeHeader) card?.querySelector(".c-card__header")?.remove();
    }

    return () => {
      if (containerRef.current && newEditor) {
        containerRef.current.removeChild(newEditor.getElement());
      }
    };
  }, [sdk, type]);

  useEffect(() => {
    if (editorRef.current) setValue(value);
  }, [value]);

  return <div style={{ height: "100%", ...style }} ref={containerRef} />;
};
