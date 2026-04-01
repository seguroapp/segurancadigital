# Seguranca na Internet e LGPD

Repositorio preparado para deploy automatico com GitHub + Netlify.

## Estrutura

- `app-main/`: arquivos do site estatico
- `netlify.toml`: configuracao de publicacao do Netlify

## Publicar com GitHub e Netlify

1. Crie um repositorio vazio no GitHub.
2. No terminal, na raiz deste repositorio local, rode os comandos abaixo substituindo a URL:

```powershell
git add .
git commit -m "Initial site setup"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

3. No Netlify, clique em `Add new site` > `Import an existing project`.
4. Conecte sua conta do GitHub e selecione este repositorio.
5. O Netlify vai usar `netlify.toml` e publicar a pasta `app-main` automaticamente.

## Deploy automatico

Depois da integracao, cada `git push` para a branch principal dispara um novo deploy.
