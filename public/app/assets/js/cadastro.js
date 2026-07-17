/**
 * cadastro.js — tela usada tanto para criar quanto para editar uma
 * transação. Se a URL tiver ?id=X, carrega os dados existentes e
 * troca o formulário para modo edição.
 */

requireAuth();

const params = new URLSearchParams(window.location.search);
const editingId = params.get("id");

const user = getUser();
if (user) {
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userInitial").textContent = user.name.charAt(0).toUpperCase();
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await apiFetch("/logout", { method: "POST" });
  clearSession();
  window.location.href = "index.html";
});

const form = document.getElementById("txForm");
const errorBox = document.getElementById("errorBox");
const submitBtn = document.getElementById("submitBtn");
const currentDocBox = document.getElementById("currentDoc");

// Máscara simples de CPF enquanto digita.
document.getElementById("cpf").addEventListener("input", (e) => {
  let digits = e.target.value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 9) {
    digits = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  } else if (digits.length > 6) {
    digits = digits.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (digits.length > 3) {
    digits = digits.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  }
  e.target.value = digits;
});

if (editingId) {
  document.getElementById("pageTitle").textContent = "Editar transação";
  document.title = "Editar transação";
  loadTransaction(editingId);
}

async function loadTransaction(id) {
  const response = await apiFetch(`/transactions/${id}`);
  if (!response) return;

  if (!response.ok) {
    showToast("Não foi possível carregar essa transação.", true);
    window.location.href = "transacoes.html";
    return;
  }

  const { data: tx } = await response.json();

  document.getElementById("value").value = tx.value;
  document.getElementById("cpf").value = formatCpf(tx.cpf);
  document.getElementById("status").value = tx.status;

  if (tx.document_url) {
    currentDocBox.innerHTML = `Arquivo atual: <a href="${tx.document_url}" target="_blank" rel="noopener">${tx.document_original_name || "ver arquivo"}</a>. Envie um novo arquivo abaixo apenas se quiser substituí-lo.`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  submitBtn.disabled = true;
  submitBtn.textContent = "Salvando...";

  const formData = new FormData();
  formData.append("value", document.getElementById("value").value);
  formData.append("cpf", document.getElementById("cpf").value.replace(/\D/g, ""));
  formData.append("status", document.getElementById("status").value);

  const file = document.getElementById("document").files[0];
  if (file) {
    formData.append("document", file);
  }

  let path = "/transactions";
  if (editingId) {
    // Laravel entende PUT via _method quando o corpo é multipart/form-data.
    formData.append("_method", "PUT");
    path = `/transactions/${editingId}`;
  }

  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: formData,
    });

    if (!response) return;

    const data = await response.json();

    if (!response.ok) {
      const mensagens = data.errors
        ? Object.values(data.errors).flat().join(" ")
        : data.message || "Não foi possível salvar a transação.";
      errorBox.textContent = mensagens;
      errorBox.classList.add("show");
      return;
    }

    showToast(editingId ? "Transação atualizada com sucesso." : "Transação cadastrada com sucesso.");
    window.location.href = "transacoes.html";
  } catch (err) {
    errorBox.textContent = "Não foi possível conectar à API.";
    errorBox.classList.add("show");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Salvar";
  }
});
