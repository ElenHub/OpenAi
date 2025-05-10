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
  const messagesEndRef = useRef(null);

  // SpeechRecognition initialization
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Your browser does not support Web Speech API");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      console.log("Recognition results:", event);
      const transcript = event.results[0][0].transcript;
      console.log("Text recognized:", transcript);
      // Add recognized text to an existing input
      setUserInput((prev) => prev + " " + transcript);
      // Update the state of the button
      setIsButtonDisabled(
        (prev) => (prev + " " + transcript).trim().length === 0
      );
    };

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  // Function for automatic scrolling
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

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

      if (!res.ok) throw new Error("Server response error");

      const data = await res.json();
      setResponses((prev) => [
        ...prev,
        { question: userInput, answer: data.answer || "No answer" },
      ]);
      setUserInput(""); 
      setIsButtonDisabled(true); 
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
    <div className={styles.myContainer}>
      <Image
        src="/image/message.svg"
        alt="logo"
        width={22}
        height={22}
        style={{
          cursor: "pointer",
          background: "var(--button-color)",
          padding: "12px",
          borderRadius: "12px",
        }}
      />
      <h1 className={styles.title}>Hi there!</h1>
      <h2 className={styles.description}>What would you like to know?</h2>
      <p className={styles.text}>
        {" "}
        Use one of the most common prompts below <br />
        or ask your own question
      </p>
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          className={styles.inputContainer}
          style={{ position: "relative", width: "100%" }}
        >
          {/* Микрофон */}
          <div className={styles.micInside} onClick={toggleListening}>
            <Image
              src="/image/microphone.svg"
              alt="mic"
              width={20}
              height={20}
              style={{ cursor: "pointer" }}
            />
          </div>
          {/* Текстовое поле */}
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ask whatever you want"
            rows={4}
            cols={50}
            className={styles.textarea}
          />
          {/* Кнопка отправки */}
          <button
            type="submit"
            className={`${styles.button} ${
              isButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled
            }`}
            disabled={isButtonDisabled}
          >
            <Image src="/image/send.svg" alt="send" width={14} height={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
