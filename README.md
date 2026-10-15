# 🃏 Truco Online

Um jogo de truco multijogador mobile-first desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🎮 Funcionalidades

- ✅ Jogo de truco completo com regras brasileiras
- ✅ Sistema de salas/lobbies
- ✅ Multiplayer em tempo real (polling)
- ✅ Interface mobile-first responsiva
- ✅ Suporte para até 4 jogadores (2v2)
- ✅ Sistema de pontuação (até 12 pontos)
- ✅ Truco, Seis, Nove, Doze
- ✅ Manilhas com vira

## 🚀 Como Jogar

1. Acesse o jogo
2. Crie uma nova sala ou entre em uma existente
3. Aguarde os jogadores entrarem (mínimo 2, máximo 4)
4. Marque-se como "Pronto"
5. Quando todos estiverem prontos, inicie o jogo
6. Jogue suas cartas na sua vez
7. Use o botão "TRUCO" para aumentar a aposta
8. Primeiro time a chegar a 12 pontos vence!

## 🛠️ Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vercel** - Deploy e hospedagem

## 📱 Mobile First

O jogo foi desenvolvido pensando primeiro em dispositivos móveis, garantindo uma experiência otimizada em smartphones e tablets.

## 🎯 Regras do Truco

- Cada rodada tem até 3 mãos
- Quem ganhar 2 de 3 mãos, ganha a rodada
- A rodada vale inicialmente 1 ponto
- Jogadores podem pedir "Truco" para aumentar para 3 pontos
- Sequência: Truco (3) → Seis (6) → Nove (9) → Doze (12)
- Primeiro time a 12 pontos vence o jogo
- Manilhas são as cartas mais fortes (definidas pela vira)
- Ordem das manilhas (por naipe): Zap (♣ paus) > Copas (♥) > Espadas (♠) > Ouros (♦)
- Empate (embuchada): 1ª empata → vale a 2ª; 2ª/3ª empata → vale quem ganhou a 1ª; tudo empatado anula a mão
- Quem fez o último aumento não pode aumentar de novo; o adversário pode "aceitar e aumentar"
- Mão de 11: o time com 11 não pode pedir truco. Mão de ferro (11x11): vale 3, sem truco
- Jogo em 2 (1x1) ou 4 jogadores (2x2); ao final há revanche voltando ao lobby

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🌐 Deploy na Vercel

O projeto está configurado para deploy automático na Vercel:

1. Conecte seu repositório à Vercel
2. A Vercel detectará automaticamente Next.js
3. Deploy automático em cada push

Ou use o Vercel CLI:

```bash
npm install -g vercel
vercel
```

## ⚠️ Hospedagem (importante)

O estado das salas fica **em memória de um único processo**. Em serverless (Vercel) cada
requisição pode cair numa instância diferente e as salas "somem". Para jogar com amigos
use um host de processo único: `docker build -t truco . && docker run -p 3000:3000 truco`
(Render, Railway, Fly.io...) ou `npm run build && npm start`. Para Vercel seria preciso
mover o estado para Redis/Upstash.

## 🔒 Segurança

- As cartas dos adversários nunca saem do servidor (`GET /api/rooms/:id?playerId=...` devolve só a sua mão)
- IDs de jogador e sala gerados com `crypto`; nomes sanitizados; salas inativas expiram em 3h

## 📝 Notas Técnicas

- O estado do jogo é mantido em memória no servidor
- Atualizações em tempo real via polling (1 segundo)
- Ideal para jogos casuais com amigos
- Para produção em larga escala, considere usar Redis para persistência

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

MIT

---

Desenvolvido com ❤️ usando Next.js
