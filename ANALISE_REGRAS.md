# Análise das Regras de Negócio - Jogo de Truco

## ✅ Regras Implementadas Corretamente

### 1. Estrutura do Baralho
- ✅ 40 cartas (sem 8, 9, 10)
- ✅ 4 naipes: Ouros, Espadas, Copas, Paus
- ✅ Valores: 4, 5, 6, 7, Q, J, K, A, 2, 3

### 2. Mecânica de Jogo Básica
- ✅ Distribuição de 3 cartas por jogador
- ✅ Vira para definir a manilha
- ✅ Cálculo correto da manilha (carta seguinte à vira)
- ✅ Ordem das manilhas: Paus (11) < Copas (12) < Espadas (13) < Ouros (14)
- ✅ Melhor de 3 rodadas por mão

### 3. Sistema de Pontuação
- ✅ Pontuação inicial: 1 ponto
- ✅ Truco: 3 pontos
- ✅ Seis: 6 pontos
- ✅ Nove: 9 pontos
- ✅ Doze: 12 pontos
- ✅ Vitória aos 12 pontos

### 4. Mecânica do Truco
- ✅ Apenas time adversário pode aceitar/recusar
- ✅ Quando recusa, time que pediu ganha pontos atuais
- ✅ Progressão correta: none → truco → seis → nove → doze
- ✅ Rastreamento de qual time pediu (trucoCalledBy)

### 5. Comparação de Cartas
- ✅ Manilhas ganham de cartas normais
- ✅ Entre manilhas, ordem por naipe
- ✅ Entre cartas normais, ordem por valor
- ✅ Empate: primeira carta jogada ganha

### 6. Gestão de Salas
- ✅ Criação de salas
- ✅ Entrada/saída de jogadores
- ✅ Sistema de times (automático)
- ✅ Sistema de "ready"

---

## ❌ Regras de Negócio FALTANTES/INCORRETAS

### 1. **CRÍTICO: Ordem de Jogada**
**Problema:** Quem ganha uma rodada deveria jogar primeiro na próxima rodada, mas atualmente sempre segue a ordem do dealer.

**Localização:** `lib/game-manager.ts:119-149` (evaluateRound)

**Impacto:** Alto - isso afeta a estratégia do jogo significativamente.

### 2. **Mão de 11 (Mão de Ferro Especial)**
**Faltando:** Quando um time tem 11 pontos:
- Pode escolher jogar "escondido" (cartas viradas para baixo)
- Não pode pedir truco (vale apenas 1 ponto ou 3 se adversário pedir)
- Regra especial importante do truco brasileiro

**Impacto:** Médio - é uma regra importante mas não essencial para o jogo funcionar.

### 3. **Mão de Ferro**
**Faltando:** Quando ambos os times têm 11 pontos:
- A mão vale automaticamente 3 pontos (sem possibilidade de truco)
- Não há pedido de truco
- É um "mata-mata" direto

**Impacto:** Médio - situação específica mas importante.

### 4. **Restrição de Quem Pode Pedir Truco**
**Problema:** Atualmente qualquer jogador pode pedir truco a qualquer momento (exceto quando já há pedido pendente).

**Regra correta:** Apenas pode pedir truco:
- Quem tem a vez de jogar OU
- Quem já jogou sua carta na rodada atual

**Localização:** `lib/game-manager.ts:209-222` (callTruco)

**Impacto:** Médio - afeta a dinâmica e estratégia.

### 5. **Empate em Todas as Cartas de uma Rodada**
**Problema:** Se todas as cartas de uma rodada empatarem (raro mas possível), não há tratamento especial.

**Regra correta:** A próxima rodada vale pela anterior (rodada "amarrada").

**Impacto:** Baixo - situação muito rara.

### 6. **Primeira Mão e Dealer**
**Problema:** Não há rotação clara do dealer entre partidas.

**Regra correta:**
- Dealer roda a cada mão
- Quem está "a mão" (à direita do dealer) joga primeiro
- Já está parcialmente implementado mas precisa de ajustes

**Impacto:** Baixo - já funciona parcialmente.

### 7. **Validação de Cartas na Mão**
**Problema:** Não há validação se o jogador realmente possui a carta que está tentando jogar (além do índice).

**Impacto:** Baixo - mais uma questão de segurança.

---

## 🚫 Regras que NÃO Implementamos (por escolha de simplicidade)

### 1. Truco Paulista vs Mineiro
- Não implementamos variantes regionais
- Usando regras padrão/gerais

### 2. Sinais entre Parceiros
- Não aplicável em jogo online com interface visual

### 3. Flor/Envido
- Estas são mecânicas do truco argentino
- Não fazem parte do truco brasileiro padrão

---

## 📋 Testes Unitários - AUSENTES

**Status:** ❌ Nenhum teste implementado

**Necessário:**
1. Testes para `truco-logic.ts`:
   - Criação do baralho
   - Embaralhamento
   - Distribuição de cartas
   - Cálculo de manilha
   - Comparação de cartas
   - Determinação de vencedor de rodada

2. Testes para `game-manager.ts`:
   - Criação de sala
   - Entrada/saída de jogadores
   - Início de jogo
   - Jogada de carta
   - Pedido de truco
   - Resposta ao truco
   - Finalização de mão
   - Finalização de jogo

3. Testes de integração:
   - Fluxo completo de uma partida
   - Cenários de empate
   - Cenários de truco aceito/recusado

---

## 🎯 Prioridades de Implementação

### Prioridade 1 (CRÍTICO):
1. ✅ Corrigir ordem de jogada (quem ganha joga primeiro)
2. ✅ Adicionar testes unitários básicos

### Prioridade 2 (IMPORTANTE):
3. ⚠️ Restrição de quem pode pedir truco
4. ⚠️ Mão de 11 pontos
5. ⚠️ Mão de ferro (11x11)

### Prioridade 3 (DESEJÁVEL):
6. ⚠️ Tratamento de empate total em rodada
7. ⚠️ Melhorias na validação de cartas

---

## 📊 Resumo

**Total de regras analisadas:** 20
- ✅ Implementadas corretamente: 13 (65%)
- ❌ Faltantes/Incorretas: 7 (35%)
- 🚫 Não aplicáveis: 3

**Testes unitários:** 0% de cobertura

**Próximos passos:**
1. Corrigir ordem de jogada
2. Implementar testes unitários
3. Implementar mão de 11 e mão de ferro
4. Ajustar restrições de truco
