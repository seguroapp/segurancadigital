const identityLoginButton = document.querySelector('#identity-login-button');
const identityLogoutButton = document.querySelector('#identity-logout-button');
const adminRefreshButton = document.querySelector('#admin-refresh-button');
const adminAuthStatus = document.querySelector('#admin-auth-status');
const adminSubmissionsStatus = document.querySelector('#admin-submissions-status');
const adminSubmissionsList = document.querySelector('#admin-submissions-list');

function setAdminAuthStatus(message) {
  if (adminAuthStatus) {
    adminAuthStatus.textContent = message;
  }
}

function setAdminSubmissionsStatus(message) {
  if (adminSubmissionsStatus) {
    adminSubmissionsStatus.textContent = message;
  }
}

function renderAdminSubmissions(items) {
  if (!adminSubmissionsList) {
    return;
  }

  if (!items.length) {
    adminSubmissionsList.innerHTML = '<p class="history-empty">Nenhuma submissao encontrada.</p>';
    return;
  }

  adminSubmissionsList.innerHTML = items
    .map((item) => {
      const submittedAt = item.created_at
        ? new Date(item.created_at).toLocaleString('pt-BR')
        : 'Sem data';
      const payload = item.data || {};

      return `
        <article class="history-item">
          <strong>${payload.name || 'Sem nome'}</strong>
          <span>${payload.email || 'Sem e-mail'}</span>
          <span>${submittedAt}</span>
          <p>${payload.message || 'Sem mensagem'}</p>
        </article>
      `;
    })
    .join('');
}

async function loadSubmissions() {
  setAdminSubmissionsStatus('Consultando mensagens...');

  try {
    const response = await fetch('/.netlify/functions/forms-submissions');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Nao foi possivel consultar as mensagens.');
    }

    renderAdminSubmissions(payload.submissions || []);
    setAdminSubmissionsStatus(`Consulta concluida. ${payload.submissions.length} mensagem(ns) carregada(s).`);
  } catch (error) {
    renderAdminSubmissions([]);
    setAdminSubmissionsStatus(error.message || 'Falha ao consultar mensagens.');
  }
}

if (window.netlifyIdentity) {
  const identity = window.netlifyIdentity;
  identity.init();

  const syncIdentityStatus = () => {
    const user = identity.currentUser();

    if (!user) {
      setAdminAuthStatus('Nenhuma sessao ativa. Entre com uma conta admin do Netlify Identity.');
      return;
    }

    const roles = user.app_metadata?.roles || [];
    setAdminAuthStatus(`Sessao ativa para ${user.email}. Roles: ${roles.length ? roles.join(', ') : 'nenhuma role definida'}.`);
  };

  identity.on('init', syncIdentityStatus);
  identity.on('login', () => {
    syncIdentityStatus();
    loadSubmissions();
  });
  identity.on('logout', () => {
    syncIdentityStatus();
    renderAdminSubmissions([]);
    setAdminSubmissionsStatus('Sessao encerrada.');
  });

  identityLoginButton?.addEventListener('click', () => identity.open('login'));
  identityLogoutButton?.addEventListener('click', () => identity.logout());
  adminRefreshButton?.addEventListener('click', loadSubmissions);
} else {
  setAdminAuthStatus('Netlify Identity nao foi carregado neste ambiente.');
}