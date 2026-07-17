
function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}


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
