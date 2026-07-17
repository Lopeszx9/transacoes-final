/**
 * transacoes.js — lógica da tela de listagem:
 * - busca as transações na API (paginado, com filtro de status)
 * - desenha cada linha com data/hora, valor, cpf e status
 * - menu de "..." com Ver / Editar / Excluir
 * - modal de visualização
 */

requireAuth();

const ledger = document.getElementById("ledger");
const pagination = document.getElementById("pagination");
const statusFilter = document.getElementById("statusFilter");
const viewModal = document.getElementById("viewModal");
const modalBody = document.getElementById("modalBody");
const modalEditBtn = document.getElementById("modalEditBtn");

let currentPage = 1;
let currentTransactionInModal = null;

// --- usuário logado na sidebar ---
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

statusFilter.addEventListener("change", () => {
  currentPage = 1;
  loadTransactions();
});

async function loadTransactions() {
  ledger.querySelectorAll(".ledger-row.item, .empty-state").forEach((el) => el.remove());

  let path = `/transactions?page=${currentPage}&per_page=10`;
  if (statusFilter.value) {
    path += `&status=${statusFilter.value}`;
  }

  const response = await apiFetch(path);
  if (!response) return;

  const json = await response.json();

  if (!json.data || json.data.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <h3>Nenhuma transação encontrada</h3>
      <p>Cadastre a primeira transação pelo menu ao lado.</p>
    `;
    ledger.appendChild(empty);
    pagination.innerHTML = "";
    return;
  }

  json.data.forEach((tx) => ledger.appendChild(buildRow(tx)));
  buildPagination(json.meta);
}

function buildRow(tx) {
  const row = document.createElement("div");
  row.className = "ledger-row item";
  row.innerHTML = `
    <div class="col-date">${tx.created_at}</div>
    <div class="col-value">${formatMoney(tx.value)}</div>
    <div class="col-cpf">${formatCpf(tx.cpf)}</div>
    <div class="col-status"><span class="badge ${tx.status}">${tx.status_label}</span></div>
    <div style="position: relative;">
      <button class="dots-btn" data-action="menu">⋮</button>
      <div class="dropdown">
        <button data-action="ver">Ver</button>
        <button data-action="editar">Editar</button>
        <button data-action="excluir" class="excluir">Excluir</button>
      </div>
    </div>
  `;

  // Clicar na linha (fora do menu) abre a visualização.
  row.addEventListener("click", (e) => {
    if (e.target.closest("[data-action]") || e.target.closest(".dropdown")) return;
    openViewModal(tx);
  });

  const dropdown = row.querySelector(".dropdown");
  row.querySelector('[data-action="menu"]').addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle("open");
  });

  row.querySelector('[data-action="ver"]').addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.remove("open");
    openViewModal(tx);
  });

  row.querySelector('[data-action="editar"]').addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `cadastro.html?id=${tx.id}`;
  });

  row.querySelector('[data-action="excluir"]').addEventListener("click", async (e) => {
    e.stopPropagation();
    dropdown.classList.remove("open");

    const confirmado = confirm(
      `Tem certeza que deseja excluir a transação de ${formatMoney(tx.value)}? Essa ação não pode ser desfeita por aqui.`
    );
    if (!confirmado) return;

    const response = await apiFetch(`/transactions/${tx.id}`, { method: "DELETE" });
    if (response && response.ok) {
      showToast("Transação excluída com sucesso.");
      loadTransactions();
    } else {
      showToast("Não foi possível excluir a transação.", true);
    }
  });

  return row;
}

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown.open").forEach((d) => d.classList.remove("open"));
}

document.addEventListener("click", closeAllDropdowns);

function buildPagination(meta) {
  pagination.innerHTML = "";
  if (!meta || meta.last_page <= 1) return;

  for (let page = 1; page <= meta.last_page; page++) {
    const btn = document.createElement("button");
    btn.textContent = page;
    if (page === meta.current_page) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = page;
      loadTransactions();
    });
    pagination.appendChild(btn);
  }
}

// --- Modal de visualização ---

function openViewModal(tx) {
  currentTransactionInModal = tx;

  modalBody.innerHTML = `
    <div class="detail-row"><span class="label">Status</span><span class="value"><span class="badge ${tx.status}">${tx.status_label}</span></span></div>
    <div class="detail-row"><span class="label">Valor</span><span class="value mono">${formatMoney(tx.value)}</span></div>
    <div class="detail-row"><span class="label">CPF</span><span class="value mono">${formatCpf(tx.cpf)}</span></div>
    <div class="detail-row"><span class="label">Criado por</span><span class="value">${tx.user ? tx.user.name : "-"}</span></div>
    <div class="detail-row"><span class="label">Criado em</span><span class="value">${tx.created_at}</span></div>
    <div class="detail-row"><span class="label">Documento</span><span class="value">
      ${tx.document_url
        ? `<a href="${tx.document_url}" target="_blank" rel="noopener">${tx.document_original_name || "Ver arquivo"}</a>`
        : "Nenhum"}
    </span></div>
  `;

  viewModal.classList.add("open");
}

modalEditBtn.addEventListener("click", () => {
  if (currentTransactionInModal) {
    window.location.href = `cadastro.html?id=${currentTransactionInModal.id}`;
  }
});

function closeModal() {
  viewModal.classList.remove("open");
  currentTransactionInModal = null;
}

document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) closeModal();
});

loadTransactions();
