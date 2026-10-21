const symbolPool = [
  "✦","✧","♢","◆","◇","○","●","★","☆","✪","✫","✬","✭","✮","✯","✰","✱","✲","✳","✴","✵","✶","✷","✸","✹","✺","✻","✼","✽","✾","✿","❀","❁","❂","❃","❄","❅","❆","❇","❈","❉","❊","❋","❌","❍","❎","❏","❐","❑","❒","❓","❔","❕","❖","❗","❘","❙","❚","❛","❜","❝","❞","❡","❢","❣","❤","❥","❦","❧"
];

const baseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !?.,;:-_";

const passwordInput = document.getElementById("password");
const messageInput = document.getElementById("message");
const resultBox = document.getElementById("result");
const stepsList = document.getElementById("steps");
const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const copyBtn = document.getElementById("copyBtn");

function getShift(password) {
  const clean = password.trim();
  if (!clean) return 0;

  return [...clean].reduce((total, char) => total + char.charCodeAt(0), 0) % baseAlphabet.length;
}

function sanitizeText(text) {
  return text.replace(/\r/g, "");
}

function encryptMessage(text, password) {
  const cleanPassword = password.trim();
  const cleanText = sanitizeText(text);
  const shift = getShift(cleanPassword);
  let finalOutput = "";
  const explanations = [];

  if (!cleanPassword || !cleanText) {
    return {
      output: "Preencha a senha e a mensagem.",
      explanations: ["Informe a senha e o texto para gerar a criptografia."]
    };
  }

  for (let index = 0; index < cleanText.length; index += 1) {
    const char = cleanText[index];
    let originalIndex = baseAlphabet.indexOf(char);

    if (originalIndex === -1) {
      originalIndex = baseAlphabet.length - 1;
    }

    const mappedIndex = (originalIndex + shift + index) % baseAlphabet.length;
    const symbol = symbolPool[mappedIndex % symbolPool.length];
    finalOutput += `${symbol} `;

    explanations.push(
      `${index + 1}. "${char}" → índice ${originalIndex} + deslocamento ${shift} + posição ${index} = ${mappedIndex} → símbolo ${symbol}`
    );
  }

  return {
    output: finalOutput.trim(),
    explanations
  };
}

function decryptMessage(symbolsText, password) {
  const cleanPassword = password.trim();
  const parts = symbolsText.split(/\s+/).filter(Boolean);
  const shift = getShift(cleanPassword);

  if (!cleanPassword || parts.length === 0) {
    return "Preencha a senha e o texto cifrado.";
  }

  let decoded = "";

  parts.forEach((symbol, index) => {
    const symbolIndex = symbolPool.indexOf(symbol);

    if (symbolIndex === -1) {
      decoded += "?";
      return;
    }

    const originalIndex = (symbolIndex - shift - index + baseAlphabet.length) % baseAlphabet.length;
    decoded += baseAlphabet[originalIndex] ?? "?";
  });

  return decoded;
}

function renderSteps(items) {
  stepsList.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    stepsList.appendChild(li);
  });
}

function handleEncrypt() {
  const text = messageInput.value;
  const password = passwordInput.value;
  const result = encryptMessage(text, password);

  resultBox.textContent = result.output;
  renderSteps(result.explanations);
}

function handleDecrypt() {
  const text = resultBox.textContent.trim();
  const password = passwordInput.value;
  const messageToDecrypt = messageInput.value.trim() || text;
  const decodedMessage = decryptMessage(messageToDecrypt, password);

  resultBox.textContent = decodedMessage;

  renderSteps([
    "1. O sistema lê cada símbolo cifrado da mensagem.",
    "2. Descobre o índice do símbolo na tabela de símbolos.",
    "3. Aplica o deslocamento da senha e da posição da letra.",
    "4. Reconstrói a letra original da mensagem.",
    `5. Mensagem decifrada: "${decodedMessage}"`
  ]);
}

async function handleCopy() {
  const text = resultBox.textContent.trim();

  if (!text || text === "Seu texto criptografado aparecerá aqui." || text === "Preencha a senha e a mensagem.") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copiado!";
    setTimeout(() => {
      copyBtn.textContent = "Copiar";
    }, 1200);
  } catch (error) {
    copyBtn.textContent = "Erro";
    setTimeout(() => {
      copyBtn.textContent = "Copiar";
    }, 1200);
  }
}

encryptBtn.addEventListener("click", handleEncrypt);
decryptBtn.addEventListener("click", handleDecrypt);
copyBtn.addEventListener("click", handleCopy);

resultBox.textContent = "Seu texto criptografado aparecerá aqui.";
