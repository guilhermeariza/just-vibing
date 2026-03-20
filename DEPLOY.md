# 🚀 Guia de Deploy - Truco Online

## ✅ Pré-requisitos

Antes de fazer o deploy, verifique:

- ✅ Código commitado e pushed para o GitHub
- ✅ 70 testes unitários passando (npm run test:run)
- ✅ Build bem-sucedido (npm run build)
- ✅ Todas as regras críticas implementadas

## 📦 Deploy na Vercel

### Opção 1: Interface Web (Recomendado)

1. **Acesse Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub

2. **Importe o Projeto**
   - Clique em **"Add New Project"**
   - Selecione o repositório **`guilhermeariza/just-vibing`**

3. **Configure o Projeto**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`
   - **Development Command:** `npm run dev`

4. **Branch de Deploy**
   - **Production Branch:** `claude/truco-multiplayer-game-0154K4dHe1VaeDUZAXjrRCqT`
   - Ou faça merge para `main` primeiro (veja seção abaixo)

5. **Variáveis de Ambiente (Opcional)**
   - Nenhuma necessária para o funcionamento básico
   - NODE_ENV será configurado automaticamente

6. **Deploy**
   - Clique em **"Deploy"**
   - Aguarde ~2-3 minutos
   - Vercel criará uma URL automática: `https://just-vibing-xxx.vercel.app`

### Opção 2: Vercel CLI

```bash
# 1. Instalar Vercel CLI (se ainda não tem)
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy (primeira vez)
vercel

# Responda às perguntas:
# - Set up and deploy "just-vibing"? [Y/n] Y
# - Which scope? [Seu usuário/organização]
# - Link to existing project? [y/N] N
# - What's your project's name? just-vibing
# - In which directory is your code located? ./
# - Want to override the settings? [y/N] N

# 4. Deploy para produção
vercel --prod
```

### Opção 3: Merge para Main (Deploy Automático)

Se preferir fazer deploy da branch `main`:

```bash
# 1. Criar/ir para branch main
git checkout main

# 2. Fazer merge
git merge claude/truco-multiplayer-game-0154K4dHe1VaeDUZAXjrRCqT

# 3. Push para main
git push origin main

# 4. Configure Vercel para monitorar a branch main
# A Vercel fará deploy automático em cada push
```

## 🔧 Configurações Avançadas (Opcional)

### vercel.json já configurado

O arquivo `vercel.json` já está configurado:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"]
}
```

### Domínio Customizado

Após o deploy, você pode adicionar um domínio customizado:

1. Vá para **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções da Vercel

## 📊 Monitoramento

### Durante o Deploy

A Vercel mostrará:
- ✅ Installing dependencies
- ✅ Running build command
- ✅ Uploading artifacts
- ✅ Deployment ready

### Logs

Acesse logs em tempo real:
- **Vercel Dashboard** > Seu projeto > **Deployments** > Clique no deploy
- Ou via CLI: `vercel logs`

## 🔍 Verificação Pós-Deploy

### Checklist de Testes

Após o deploy, teste:

1. ✅ **Página Principal**
   - Acesse a URL fornecida pela Vercel
   - Verifique se a lista de salas carrega

2. ✅ **Criar Sala**
   - Clique em "Nova Sala"
   - Crie uma sala com seu nome
   - Entre na sala

3. ✅ **Lobby**
   - Verifique se os jogadores aparecem
   - Marque como "Pronto"

4. ✅ **Iniciar Jogo**
   - Com 2+ jogadores prontos, inicie o jogo
   - Verifique se as cartas são distribuídas
   - Verifique se a vira aparece

5. ✅ **Gameplay**
   - Jogue algumas cartas
   - Teste o botão de truco
   - Verifique se a pontuação atualiza

6. ✅ **Mão de 11 e Mão de Ferro**
   - Chegue a 11 pontos em um time
   - Verifique o aviso visual
   - Teste que time com 11 não pode pedir truco

## ⚠️ Problemas Comuns

### Build Falha

**Erro:** TypeScript errors
**Solução:** Execute `npm run build` localmente primeiro

**Erro:** Missing dependencies
**Solução:** Verifique se package.json está commitado

### Deploy Lento

**Causa:** Primeira build sempre demora mais
**Solução:** Aguarde ~3-5 minutos na primeira vez

### Cartas Não Aparecem

**Causa:** Polling não está funcionando
**Solução:** Verifique se as API routes estão respondendo
- Acesse: `sua-url.vercel.app/api/rooms`
- Deve retornar JSON (array vazio ou com salas)

### Jogadores Não Sincronizam

**Causa:** Estado em memória é resetado entre requests
**Solução:**
- Isso é normal no ambiente serverless da Vercel
- Para produção de longo prazo, considere:
  - Redis/Upstash para persistência
  - WebSockets em servidor separado (Railway, Render)

## 🎯 Próximos Passos

### Recomendações para Produção

1. **Persistência de Estado**
   ```bash
   # Considere adicionar Redis
   npm install @upstash/redis
   ```

2. **Analytics**
   - Vercel Analytics (built-in)
   - Google Analytics
   - Mixpanel

3. **Error Tracking**
   - Sentry
   - LogRocket

4. **Rate Limiting**
   - Proteja as API routes
   - Upstash Rate Limiting

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Issues do projeto: Crie uma issue no GitHub

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Deploy bem-sucedido na Vercel
- [ ] URL funcionando
- [ ] Criar sala funciona
- [ ] Multiplayer funciona
- [ ] Cartas distribuem corretamente
- [ ] Truco funciona
- [ ] Pontuação atualiza
- [ ] Mão de 11 detectada
- [ ] Mão de Ferro detectada
- [ ] Responsivo no mobile
- [ ] Performance aceitável

---

🎉 **Parabéns!** Seu jogo de truco está no ar!
