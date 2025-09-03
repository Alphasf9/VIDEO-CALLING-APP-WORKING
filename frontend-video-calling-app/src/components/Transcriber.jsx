/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import api from "../api/AxiosInstance";

export default function MeetingTranscriber({ sessionId, userId, onTranscriptChange, speaker,requestId ,roomId}) {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const [editableTranscript, setEditableTranscript] = useState("");

    if (!browserSupportsSpeechRecognition) {
        return <span>Your browser does not support speech recognition.</span>;
    }

    const startListening = () => {
        SpeechRecognition.startListening({
            continuous: true,
            language: "en-IN",
            interimResults: true,
        });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    const sendTranscriptToBackend = async () => {
        if (!editableTranscript) return console.log("❌ No transcript to send");
        console.log("Transcriptions have been recorded", editableTranscript, userId, sessionId, speaker);
        try {
            await api.patch(`/sessions/${sessionId}/end`, {
                userId,
                requestId,
                roomId,
                transcript: editableTranscript,
                speaker
            });
            console.log("✅ Transcript sent successfully");
        } catch (err) {
            console.error("❌ Error sending transcript:", err);
        }
    };

    useEffect(() => {
        setEditableTranscript(transcript);
        if (onTranscriptChange) onTranscriptChange(transcript);
    }, [transcript, onTranscriptChange]);

    useEffect(() => {
        startListening();

        const handleEnd = () => {
            if (listening) startListening();
        };

        SpeechRecognition.onend = handleEnd;

        return () => {
            SpeechRecognition.onend = null;
            stopListening();
        };
    }, [listening]);

    return (
        <div className="mt-4 p-4 border rounded bg-gray-100 w-full max-w-xl">
            <p className="mb-2 font-semibold">Transcript (editable):</p>

            {/* Editable Textarea */}
            <textarea
                value={editableTranscript}
                onChange={(e) => setEditableTranscript(e.target.value)}
                className="p-2 border rounded h-32 w-full bg-white resize-none"
                placeholder="🎤 Start talking..."
            />

            <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={startListening} className="btn btn-primary px-4 py-1 rounded">
                    Start
                </button>
                <button onClick={stopListening} className="btn btn-secondary px-4 py-1 rounded">
                    Stop
                </button>
                <button onClick={() => { resetTranscript(); setEditableTranscript(""); }} className="btn btn-warning px-4 py-1 rounded">
                    Reset
                </button>
                <button onClick={sendTranscriptToBackend} className="btn btn-success px-4 py-1 rounded">
                    Send Transcript
                </button>
                <span className="ml-auto font-medium">{listening ? "🎤 Listening..." : "🛑 Stopped"}</span>
            </div>
        </div>
    );
}
