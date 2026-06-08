# Deploy no Easypanel

Este projeto está preparado para deploy como **App Service** no Easypanel usando
o `Dockerfile` do repositório.

## 1. Antes de começar

Confirme que você tem:

- VPS Ubuntu com Easypanel funcionando;
- domínio ou subdomínio apontado para o IP da VPS;
- repositório GitHub com este projeto;
- chave API da Brevo;
- ID da lista da Brevo;
- IP público da VPS autorizado na Brevo.

No DNS, crie um registro `A` apontando o subdomínio escolhido para o IP da VPS.
Exemplo:

```text
webinario.seudominio.com.br -> IP_DA_VPS
```

## 2. Subir o projeto para o GitHub

Na sua máquina:

```powershell
cd C:\Users\Jeffe\dadosia
git init
git add .
git commit -m "Landing page do webinar Dados IA"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Não envie o arquivo `.env`. Ele já está protegido pelo `.gitignore`.

## 3. Criar o serviço no Easypanel

No Easypanel:

1. Crie ou abra um **Project**.
2. Clique em **Create Service**.
3. Escolha **App**.
4. Em **Source**, selecione **GitHub repository**.
5. Escolha o repositório e a branch `main`.
6. Confirme que o Easypanel detectou o `Dockerfile`.

Segundo a documentação do Easypanel, quando há um `Dockerfile`, ele é usado
para construir a imagem da aplicação.

## 4. Configurar variáveis de ambiente

Em **Environment**, adicione:

```dotenv
BREVO_API_KEY=xkeysib-sua-chave-real
BREVO_LIST_ID=123
BREVO_NAME_ATTRIBUTE=FIRSTNAME
BREVO_LASTNAME_ATTRIBUTE=LASTNAME
PUBLIC_SITE_URL=https://webinario.seudominio.com.br
PUBLIC_WHATSAPP_GROUP_URL=https://chat.whatsapp.com/SEU-CODIGO
TRUST_PROXY=true
NODE_ENV=production
HOST=0.0.0.0
PORT=4321
```

Use o domínio real em `PUBLIC_SITE_URL`.

As variáveis `PUBLIC_SITE_URL` e `PUBLIC_WHATSAPP_GROUP_URL` são usadas no
build das páginas estáticas. Se você mudar qualquer uma delas, faça novo deploy.

## 5. Configurar domínio e proxy

Em **Domains & Proxy**:

1. Adicione o domínio ou subdomínio da landing page.
2. Configure o proxy para a porta:

```text
4321
```

3. Ative HTTPS. O Easypanel configura certificado Let's Encrypt
automaticamente quando o DNS está correto.

## 6. Configurar a Brevo

Na Brevo:

1. Confirme o ID da lista usada em `BREVO_LIST_ID`.
2. Confirme os atributos padrão `FIRSTNAME` e `LASTNAME`.
3. Autorize o IP público da VPS para uso das chaves API.

Se o IP da VPS não estiver autorizado, a API pode responder `401`.

## 7. Fazer o deploy

No serviço do Easypanel:

1. Clique em **Deploy**.
2. Abra a aba **Logs**.
3. Confirme que o build finaliza sem erro.
4. Acesse o domínio configurado.

## 8. Testar em produção

Teste estes fluxos:

1. Abra a landing page.
2. Faça uma inscrição real.
3. Confirme o redirecionamento para `/obrigado`.
4. Verifique na Brevo:
   - e-mail;
   - `FIRSTNAME`;
   - `LASTNAME`;
   - lista correta.
5. Abra `/politica-de-privacidade`.
6. Clique no botão do WhatsApp na página de obrigado.

## 9. Atualizações futuras

Depois que o primeiro deploy funcionar:

1. Faça alterações localmente.
2. Execute:

```powershell
npm run check
npm run build
```

3. Commit e push:

```powershell
git add .
git commit -m "Atualiza landing page"
git push
```

4. No Easypanel, clique em **Deploy** novamente ou ative **Auto Deploy**.

## Observações

- A aplicação escuta na porta `4321`.
- O container roda com usuário não-root.
- A chave da Brevo deve ficar apenas no Easypanel, nunca no GitHub.
- Para logs, use a aba **Logs** do serviço no Easypanel.
- Para shell dentro do container, use **Console** no Easypanel.
