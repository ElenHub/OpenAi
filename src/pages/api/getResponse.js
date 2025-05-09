import OpenAI from "openai";

const token = process.env["OPENAI_API_TOKEN"]; 
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o-mini";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userInput } = req.body; // Получаем пользовательский ввод из запроса

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    try {
        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userInput } // Используем пользовательский ввод
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 1000,
            model: modelName
        });

        const answer = response.choices[0].message.content; // Получаем ответ
        res.status(200).json({ answer }); // Возвращаем ответ клиенту
    } catch (error) {
        console.error("Error fetching response:", error);
        res.status(500).json({ error: "Ошибка при получении ответа.", details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Метод ${req.method} не разрешен`);
  }
}