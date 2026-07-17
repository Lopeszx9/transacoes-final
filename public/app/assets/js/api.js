/**
 * api.js — funções compartilhadas por todas as páginas:
 * - guarda/recupera o token e o usuário logado (localStorage)
 * - faz fetch para a API já com o header Authorization
 * - redireciona pro login se a sessão expirar (401)
 *
 * Como o front fica dentro do mesmo projeto Laravel (public/app),
 * a API está em /api no mesmo domínio — sem CORS pra configurar.
 */

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Garante que existe uma sessão; se não existir, manda pro login.
 * Chamar no topo de toda página que exige autenticação.
 */
function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

/**
 * Faz uma chamada à API já autenticada.
 * - body pode ser um objeto (vira JSON) ou um FormData (upload de arquivo).
 * - Se o token expirar/for inválido (401), limpa a sessão e volta pro login.
 */
async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  headers["Accept"] = "application/json";

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(API_BASE + path, {
    ...options,
    headers,
    body,
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = "index.html";
    return null;
  }

  return response;
}

/** Formata número em Reais (R$ 1.234,56). */
function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata CPF puro (11 dígitos) como 000.000.000-00. */
function formatCpf(cpf) {
  const digits = String(cpf).replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

const STATUS_LABELS = {
  em_processamento: "Em processamento",
  aprovada: "Aprovada",
  negada: "Negada",
};

/** Mostra uma notificação simples no canto da tela. */
function showToast(message, isError = false) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
}
