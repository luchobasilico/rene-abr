"use client";

import { SOAPEditor } from "./SOAPEditor";

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface NotesLeftPanelProps {
  soap: SOAPNote;
  onSoapChange: (soap: SOAPNote) => void;
  onSave: () => void;
  transcript?: {
    segments: Array<{
      speaker: string;
      timestampStart: number;
      timestampEnd: number;
      text: string;
    }>;
  } | null;
}

export function NotesLeftPanel({ soap, onSoapChange, onSave, transcript }: NotesLeftPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <SOAPEditor
        soap={soap}
        onChange={onSoapChange}
        onSave={onSave}
      />
      {transcript?.segments && transcript.segments.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto flex-1 min-h-0">
          <h4 className="font-medium text-sm text-gray-600 mb-2">Transcripción</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {transcript.segments.map((s, i) => (
              <p key={i}>
                <span className="font-medium text-gray-500">{s.speaker}:</span> {s.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
