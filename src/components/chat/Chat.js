"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./Chat.module.css";

export default function Chat() {
  const [userInput, setUserInput] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const recognitionRef = useRef(null);
  const historyRef = useRef(null);

  // Инициализация SpeechRecognition
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Ваш браузер не поддерживает Web Speech API");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput((prev) => prev + " " + transcript);
    };

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/getResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      if (!res.ok) throw new Error("Ошибка ответа от сервера");

      const data = await res.json();
      setResponses((prev) => [
        ...prev,
        { question: userInput, answer: data.answer || "Нет ответа" },
      ]);
      setUserInput("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    setIsButtonDisabled(value.trim().length === 0);
  };

  return (
    <>
      <h1 className={styles.title}>Open AI</h1>
      <div className={styles.container}>
        {loading && <div className={styles.spinner}></div>}

        <div className={styles.history} ref={historyRef}>
          {responses.map((item, index) => (
            <div key={index} className={styles.historyItemContainer}>
              <div className={styles.historyItemUser}>
                <p>{item.question}</p>
              </div>
              <div className={styles.historyItemAI}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            className={styles.inputContainer}
            style={{ position: "relative", width: "100%" }}
          >
            <div className={styles.micInside} onClick={toggleListening}>
              <Image
                src="/image/microphone.svg"
                alt="mic"
                width={20}
                height={20}
              />
            </div>
            <textarea
              value={userInput}
              onChange={handleInputChange}
              placeholder="Ask whatever you want"
              rows={4}
              cols={50}
              className={styles.textarea}
            />
            <button
              className={`${styles.button} ${
                isButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
              }`}
              disabled={isButtonDisabled}
              onClick={handleSubmit}
            >
              <Image src="/image/send.svg" alt="send" width={20} height={20} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
