exports.handler = async () => {
  const apiToken = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!apiToken || !siteId) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Variaveis NETLIFY_API_TOKEN e NETLIFY_SITE_ID ainda nao foram configuradas no painel do Netlify.',
      }),
    };
  }

  try {
    const formsResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!formsResponse.ok) {
      throw new Error('Nao foi possivel consultar os formularios do site no Netlify API.');
    }

    const forms = await formsResponse.json();
    const contactForm = forms.find((form) => form.name === 'contato-site');

    if (!contactForm) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Formulario contato-site nao encontrado para este site.',
        }),
      };
    }

    const submissionsResponse = await fetch(`https://api.netlify.com/api/v1/forms/${contactForm.id}/submissions`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!submissionsResponse.ok) {
      throw new Error('Nao foi possivel consultar as submissoes do formulario no Netlify API.');
    }

    const submissions = await submissionsResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ submissions }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message || 'Falha interna ao consultar o Netlify API.',
      }),
    };
  }
};