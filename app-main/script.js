const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const checklistForm = document.querySelector('#security-checklist');
const checklistInputs = checklistForm ? checklistForm.querySelectorAll('input[type="checkbox"]') : [];
const checklistPercent = document.querySelector('#checklist-percent');
const checklistBar = document.querySelector('#checklist-bar');
const checklistSummary = document.querySelector('#checklist-summary');
const checklistTip = document.querySelector('#checklist-tip p');

function updateChecklist() {
  if (!checklistForm || !checklistPercent || !checklistBar || !checklistSummary || !checklistTip) {
    return;
  }

  const checkedCount = Array.from(checklistInputs).filter((input) => input.checked).length;
  const total = checklistInputs.length;
  const progress = Math.round((checkedCount / total) * 100);

  checklistPercent.textContent = `${progress}%`;
  checklistBar.style.width = `${progress}%`;

  if (checkedCount <= 1) {
    checklistSummary.textContent = 'Voce ainda esta no comeco. Priorize protecao de conta e atualizacoes.';
    checklistTip.textContent = 'Comece ativando o segundo fator nas contas mais sensiveis, como e-mail e banco.';
    return;
  }

  if (checkedCount <= 3) {
    checklistSummary.textContent = 'Existe uma base inicial, mas ainda ha brechas comuns que podem ser exploradas.';
    checklistTip.textContent = 'Revise senhas repetidas e confirme se seus dispositivos e apps estao sempre atualizados.';
    return;
  }

  if (checkedCount <= 5) {
    checklistSummary.textContent = 'Seu nivel de cuidado ja esta acima da media, faltando poucos ajustes para consolidar a rotina.';
    checklistTip.textContent = 'Agora vale revisar permissoes de aplicativos, backups e exposicao de dados em servicos pouco usados.';
    return;
  }

  checklistSummary.textContent = 'Excelente base de protecao. O proximo passo e manter consistencia e revisar riscos periodicamente.';
  checklistTip.textContent = 'Continue monitorando novas tentativas de golpe e revise suas contas principais com frequencia.';
}

checklistInputs.forEach((input) => {
  input.addEventListener('change', updateChecklist);
});

updateChecklist();

const riskForm = document.querySelector('#risk-form');
const riskResult = document.querySelector('#risk-result');
const riskStatus = document.querySelector('#risk-status');
const riskClearButton = document.querySelector('#risk-clear-button');
const riskExportButton = document.querySelector('#risk-export-button');
const riskHistoryClearButton = document.querySelector('#risk-history-clear-button');
const riskHistoryList = document.querySelector('#risk-history-list');
const riskHistoryStatus = document.querySelector('#risk-history-status');
const riskStorageKey = 'seguroapp-risk-draft';
const riskResultStorageKey = 'seguroapp-risk-result';
const riskHistoryStorageKey = 'seguroapp-risk-history';

function setRiskStatus(message) {
  if (riskStatus) {
    riskStatus.textContent = message;
  }
}

function setRiskHistoryStatus(message) {
  if (riskHistoryStatus) {
    riskHistoryStatus.textContent = message;
  }
}

function getRiskDraft() {
  try {
    const savedDraft = window.localStorage.getItem(riskStorageKey);
    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch (error) {
    return null;
  }
}

function saveRiskDraft() {
  if (!riskForm) {
    return;
  }

  const formData = new FormData(riskForm);
  const draft = Object.fromEntries(formData.entries());
  const hasValues = Object.values(draft).some(Boolean);

  try {
    if (!hasValues) {
      window.localStorage.removeItem(riskStorageKey);
      setRiskStatus('');
      return;
    }

    window.localStorage.setItem(
      riskStorageKey,
      JSON.stringify({
        ...draft,
        updatedAt: new Date().toISOString(),
      })
    );
    setRiskStatus('Diagnostico salvo automaticamente neste navegador.');
  } catch (error) {
    setRiskStatus('Nao foi possivel salvar o diagnostico neste navegador.');
  }
}

function getRiskHistory() {
  try {
    const savedHistory = window.localStorage.getItem(riskHistoryStorageKey);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    return [];
  }
}

function renderRiskHistory() {
  if (!riskHistoryList) {
    return;
  }

  const history = getRiskHistory();

  if (!history.length) {
    riskHistoryList.innerHTML = '<p class="history-empty">Nenhum diagnostico salvo ainda.</p>';
    return;
  }

  riskHistoryList.innerHTML = history
    .slice()
    .reverse()
    .map((entry) => {
      const submittedAt = entry.savedAt
        ? new Date(entry.savedAt).toLocaleString('pt-BR')
        : 'Sem data';

      return `
        <article class="history-item">
          <strong>${entry.title}</strong>
          <span>Nivel: ${entry.level}</span>
          <span>${submittedAt}</span>
          <p>${entry.message}</p>
        </article>
      `;
    })
    .join('');
}

function appendRiskHistory(result) {
  const history = getRiskHistory();
  history.push(result);

  try {
    window.localStorage.setItem(riskHistoryStorageKey, JSON.stringify(history.slice(-15)));
    renderRiskHistory();
    setRiskHistoryStatus('Historico local atualizado com sucesso.');
  } catch (error) {
    setRiskHistoryStatus('Nao foi possivel atualizar o historico local.');
  }
}

function exportRiskHistoryCsv() {
  const history = getRiskHistory();

  if (!history.length) {
    setRiskHistoryStatus('Nao ha diagnosticos para exportar.');
    return;
  }

  const header = ['data', 'nivel', 'titulo', 'mensagem'];
  const lines = history.map((entry) => [
    entry.savedAt || '',
    entry.level || '',
    entry.title || '',
    entry.message || '',
  ]);

  const csv = [header, ...lines]
    .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `seguroapp-diagnosticos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  setRiskHistoryStatus('Arquivo CSV gerado com sucesso.');
}

function clearRiskHistory() {
  try {
    window.localStorage.removeItem(riskHistoryStorageKey);
    renderRiskHistory();
    setRiskHistoryStatus('Historico local removido deste navegador.');
  } catch (error) {
    setRiskHistoryStatus('Nao foi possivel limpar o historico local.');
  }
}

function renderRiskResult(result) {
  if (!riskResult || !result) {
    return;
  }

  riskResult.dataset.level = result.level;
  riskResult.innerHTML = `
    <p class="result-kicker">Resultado</p>
    <h3>${result.title}</h3>
    <p>${result.message}</p>
  `;
}

function restoreRiskState() {
  if (!riskForm) {
    return;
  }

  const draft = getRiskDraft();

  if (draft) {
    Object.entries(draft).forEach(([key, value]) => {
      if (key === 'updatedAt') {
        return;
      }

      const field = riskForm.querySelector(`[name="${key}"]`);
      if (field && typeof value === 'string') {
        field.value = value;
      }
    });

    setRiskStatus('Diagnostico recuperado automaticamente neste navegador.');
  }

  renderRiskHistory();

  try {
    const storedResult = window.localStorage.getItem(riskResultStorageKey);
    if (storedResult) {
      renderRiskResult(JSON.parse(storedResult));
    }
  } catch (error) {
    return;
  }
}

function clearRiskState() {
  try {
    window.localStorage.removeItem(riskStorageKey);
    window.localStorage.removeItem(riskResultStorageKey);
  } catch (error) {
    return;
  }

  if (riskForm) {
    riskForm.reset();
  }

  if (riskResult) {
    riskResult.dataset.level = '';
    riskResult.innerHTML = `
      <p class="result-kicker">Resultado</p>
      <h3>Preencha o formulario para ver seu perfil.</h3>
      <p>Voce recebera uma classificacao simples com recomendacoes praticas de melhoria.</p>
    `;
  }

  setRiskStatus('Dados do diagnostico removidos deste navegador.');
}

if (riskForm && riskResult) {
  restoreRiskState();

  riskForm.querySelectorAll('select').forEach((field) => {
    field.addEventListener('change', saveRiskDraft);
  });

  riskClearButton?.addEventListener('click', clearRiskState);
  riskExportButton?.addEventListener('click', exportRiskHistoryCsv);
  riskHistoryClearButton?.addEventListener('click', clearRiskHistory);

  riskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(riskForm);
    let score = 0;

    for (const value of formData.values()) {
      score += Number(value);
    }

    let level = 'baixo';
    let title = 'Perfil com boa base de seguranca';
    let message = 'Seus habitos indicam um risco mais controlado. Continue reforcando autenticacao forte, revisoes periodicas e cautela com mensagens suspeitas.';

    if (score >= 8) {
      level = 'alto';
      title = 'Perfil com exposicao elevada';
      message = 'Seu diagnostico sugere vulnerabilidades importantes. Priorize senhas unicas, atualizacoes automaticas e segundo fator nas contas criticas ainda hoje.';
    } else if (score >= 4) {
      level = 'medio';
      title = 'Perfil com pontos de atencao';
      message = 'Voce ja tem alguns cuidados, mas ainda existem falhas que aumentam o risco de golpe ou invasao. Foque primeiro em contas principais e dispositivos de uso diario.';
    }

    const result = { level, title, message, savedAt: new Date().toISOString() };

    renderRiskResult(result);

    try {
      window.localStorage.setItem(riskResultStorageKey, JSON.stringify(result));
    } catch (error) {
      setRiskStatus('Resultado exibido, mas sem conseguir salvar localmente.');
      return;
    }

    appendRiskHistory(result);
    setRiskStatus('Resultado salvo neste navegador para consulta posterior.');
  });
}

const faqButtons = document.querySelectorAll('.faq-question');

faqButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item ? item.classList.contains('is-open') : false;

    faqButtons.forEach((otherButton) => {
      const otherItem = otherButton.closest('.faq-item');
      otherButton.setAttribute('aria-expanded', 'false');
      otherItem?.classList.remove('is-open');
    });

    if (!item) {
      return;
    }

    item.classList.toggle('is-open', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
  });
});

const contactForm = document.querySelector('#contact-form');
const contactFeedback = document.querySelector('#contact-feedback');
const contactStatus = document.querySelector('#contact-status');
const contactDraftStorageKey = 'seguroapp-contact-draft';
const contactSubmitButton = document.querySelector('#contact-form button[type="submit"]');

function encodeFormData(formData) {
  return new URLSearchParams(formData).toString();
}

function getContactDraft() {
  try {
    const savedDraft = window.localStorage.getItem(contactDraftStorageKey);
    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch (error) {
    return null;
  }
}

function setContactStatus(message) {
  if (contactStatus) {
    contactStatus.textContent = message;
  }
}

function saveContactDraft() {
  if (!contactForm) {
    return;
  }

  const formData = new FormData(contactForm);
  const draft = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    message: String(formData.get('message') || '').trim(),
    updatedAt: new Date().toISOString(),
  };

  const hasContent = draft.name || draft.email || draft.message;

  try {
    if (!hasContent) {
      window.localStorage.removeItem(contactDraftStorageKey);
      setContactStatus('');
      return;
    }

    window.localStorage.setItem(contactDraftStorageKey, JSON.stringify(draft));
    setContactStatus('Rascunho salvo automaticamente neste navegador.');
  } catch (error) {
    setContactStatus('Nao foi possivel salvar o rascunho neste navegador.');
  }
}

function restoreContactDraft() {
  if (!contactForm) {
    return;
  }

  const draft = getContactDraft();

  if (!draft) {
    return;
  }

  const nameInput = contactForm.querySelector('input[name="name"]');
  const emailInput = contactForm.querySelector('input[name="email"]');
  const messageInput = contactForm.querySelector('textarea[name="message"]');

  if (nameInput && draft.name) {
    nameInput.value = draft.name;
  }

  if (emailInput && draft.email) {
    emailInput.value = draft.email;
  }

  if (messageInput && draft.message) {
    messageInput.value = draft.message;
  }

  const updatedAt = draft.updatedAt ? new Date(draft.updatedAt) : null;
  const formattedDate = updatedAt && !Number.isNaN(updatedAt.getTime())
    ? updatedAt.toLocaleString('pt-BR')
    : null;

  setContactStatus(
    formattedDate
      ? `Rascunho recuperado automaticamente. Ultima atualizacao: ${formattedDate}.`
      : 'Rascunho recuperado automaticamente.'
  );
}

function clearContactDraft() {
  try {
    window.localStorage.removeItem(contactDraftStorageKey);
  } catch (error) {
    return;
  }

  setContactStatus('Informacoes enviadas e rascunho limpo neste navegador.');
}

function setContactSubmittingState(isSubmitting) {
  if (!contactSubmitButton) {
    return;
  }

  contactSubmitButton.disabled = isSubmitting;
  contactSubmitButton.classList.toggle('is-loading', isSubmitting);
  contactSubmitButton.textContent = isSubmitting ? 'Enviando mensagem' : 'Enviar mensagem';
}

if (contactForm && contactFeedback) {
  restoreContactDraft();

  contactForm.querySelectorAll('input[name="name"], input[name="email"], textarea[name="message"]').forEach((field) => {
    field.addEventListener('input', saveContactDraft);
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    contactFeedback.textContent = '';

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      contactFeedback.textContent = 'Preencha nome, e-mail e mensagem para continuar.';
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailIsValid) {
      contactFeedback.textContent = 'Informe um e-mail valido para continuar.';
      return;
    }

    setContactSubmittingState(true);

    if (window.location.protocol === 'file:') {
      contactFeedback.textContent = `Formulario validado localmente. No Netlify, a mensagem seria enviada. Obrigado, ${name}.`;
      contactForm.reset();
      clearContactDraft();
      setContactSubmittingState(false);
      return;
    }

    try {
      await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodeFormData(formData),
      });

      contactFeedback.textContent = `Mensagem enviada com sucesso. Obrigado, ${name}.`;
      contactForm.reset();
      clearContactDraft();
    } catch (error) {
      contactFeedback.textContent = 'Nao foi possivel enviar agora. Tente novamente em instantes.';
    } finally {
      setContactSubmittingState(false);
    }
  });
}

const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}