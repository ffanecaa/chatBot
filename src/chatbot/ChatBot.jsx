import React, { useState } from 'react';
import './ChatBot.css';
import axios from 'axios';

function ChatBot() {
  const [message, setMessage] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = { role: "user", content: userInput };

    const newMessage = [...message, userMessage];
    setMessage(newMessage);
    setUserInput("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "responde como un chatbot inteligente" },
            ...newMessage,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Asegurarse de que la respuesta tenga el formato correcto
      const respoMessage = response.data.choices[0].message;
      setMessage([...newMessage, respoMessage]);
    } catch (error) {
      // Manejo de errores detallado
      if (error.response) {
        // El servidor respondió con un código de estado que cae fuera del rango de 2xx
        if (error.response.data.error && error.response.data.error.type === "insufficient_quota") {
          const errorMessage = { role: "system", content: "Límite excedido, gestionálo" };
          setMessage([...newMessage, errorMessage]);
        } else {
          console.error("Error en la respuesta de la API:", error.response.status);
          console.error("Datos del error:", error.response.data);
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        console.error("No hubo respuesta de la API:", error.request);
      } else {
        // Algo sucedió al configurar la solicitud que lanzó un error
        console.error("Error al configurar la solicitud:", error.message);
      }
    }
  };

  return (
    <div className="containerChat">
      <div className="headerChat">
        <h1>Nuestro Chat</h1>
        <div className="picture">
          <img src="/martaLogo.webp" alt="logo" />
        </div>
      </div>
      <div className="conversation">
        {message.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "userMessage" : "systemMessage"}>
            {msg.content}
          </div>
        ))}
      </div>
      <form action="" onSubmit={handleSubmit} id='form'>
        <textarea
          name="textarea"
          id="textarea"
          cols="60"
          rows="10"
          placeholder="Escribe aquí"
          onChange={handleInput}
          value={userInput}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default ChatBot;
