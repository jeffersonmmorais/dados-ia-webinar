# Webinário DADOS IA

Landing page em Astro com formulário integrado diretamente à API da Brevo.

## Requisitos

- Node.js 20 ou superior
- npm
- Conta Brevo com uma lista para o webinário
- VPS com Nginx e acesso SSH

## Configuração da Brevo

1. Crie uma lista exclusiva para o webinário.
2. Anote o ID numérico da lista.
3. Em **Contatos > Configurações > Atributos de contato**, confirme ou crie:
   - `FIRSTNAME`: atributo padrão de nome;
   - `LASTNAME`: atributo padrão de sobrenome.
4. Crie uma chave em **SMTP e API > Chaves de API**.
5. Nunca coloque essa chave em arquivos públicos ou no Git.

Os nomes dos atributos podem ser alterados pelas variáveis
`BREVO_NAME_ATTRIBUTE` e `BREVO_LASTNAME_ATTRIBUTE`.
O consentimento é obrigatório no formulário, mas não é registrado
separadamente nesta versão da aplicação.

## Desenvolvimento local

```bash
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:4321`.

## Variáveis de ambiente

```dotenv
BREVO_API_KEY=xkeysib-sua-chave
BREVO_LIST_ID=123
BREVO_NAME_ATTRIBUTE=FIRSTNAME
BREVO_LASTNAME_ATTRIBUTE=LASTNAME
PUBLIC_SITE_URL=https://webinario.seudominio.com.br
PUBLIC_WHATSAPP_GROUP_URL=https://chat.whatsapp.com/SEU-CODIGO
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_META_PIXEL_ID=000000000000000
TRUST_PROXY=true
```

O adaptador Node do Astro não carrega `.env` automaticamente em produção.
Use o PM2 com `--update-env` depois de exportar as variáveis no shell ou use
um arquivo protegido pelo serviço do sistema.

## Publicação na VPS com PM2

Para Easypanel, use o guia específico:

```text
deploy/easypanel.md
```

### 1. Preparar o servidor

Instale Node.js 20+, Nginx e PM2. Depois envie o projeto para, por exemplo:

```text
/var/www/dados-ia-webinar
```

### 2. Instalar e compilar

```bash
cd /var/www/dados-ia-webinar
npm install
npm run build
```

### 3. Iniciar com as variáveis

```bash
export BREVO_API_KEY="xkeysib-sua-chave"
export BREVO_LIST_ID="123"
export BREVO_NAME_ATTRIBUTE="FIRSTNAME"
export BREVO_LASTNAME_ATTRIBUTE="LASTNAME"
export PUBLIC_SITE_URL="https://webinario.seudominio.com.br"
export PUBLIC_WHATSAPP_GROUP_URL="https://chat.whatsapp.com/SEU-CODIGO"
export PUBLIC_GTM_ID="GTM-XXXXXXX"
export PUBLIC_META_PIXEL_ID="000000000000000"
export TRUST_PROXY="true"

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Execute também o comando exibido por `pm2 startup`.

Para atualizar a aplicação:

```bash
npm install
npm run build
pm2 restart dados-ia-webinar --update-env
```

## Configuração do Nginx

1. Copie `deploy/nginx.conf` para
   `/etc/nginx/sites-available/dados-ia-webinar`.
2. Troque `webinario.seudominio.com.br` pelo domínio real.
3. Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/dados-ia-webinar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Gere o certificado:

```bash
sudo certbot --nginx -d webinario.seudominio.com.br
```

O arquivo do Nginx inclui HSTS com validade de um ano. Mantenha esse cabeçalho
somente depois de confirmar que o domínio funciona corretamente por HTTPS.

## Teste antes da divulgação

1. Abra a página no desktop e no celular.
2. Envie uma inscrição com dados reais.
3. Confirme o redirecionamento para `/obrigado`.
4. Verifique se o contato entrou na lista correta da Brevo.
5. Confirme o atributo de nome e o e-mail.
6. Teste novamente com o mesmo e-mail; o contato deve ser atualizado.

## Segurança

- A chave da Brevo existe apenas no servidor.
- O endpoint aceita somente JSON e limita o tamanho da requisição.
- Há validação de campos no navegador e no servidor.
- O formulário usa honeypot e limite básico por IP.
- O Nginx deve ser o único serviço exposto publicamente.
- Não versione `.env`.

Para tráfego elevado ou múltiplas instâncias, substitua o limitador em memória
por Redis ou rate limiting no Nginx.
