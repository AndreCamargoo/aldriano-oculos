# Óculos Assistivos — App (Grupo 5)

Aplicativo React Native (Expo + TypeScript) que captura/seleciona uma imagem, envia para o serviço
local (API Python no notebook), mostra a descrição e lê em voz alta (TTS).
Hoje tudo roda em **mock**; a API real é ligada só por configuração.

## Rodar

```bash
npm install
npx expo start          # escaneie o QR com o app Expo Go
```

## Mock x API real

Nada de URL ou formato fixo no código. Tudo fica na aba **Ajustes** (salvo no aparelho) e os
valores iniciais vêm de `.env` (veja `.env.example`) ou de `src/config/settings.ts`:

| Ajuste | Para quê |
|---|---|
| Usar dados simulados | liga/desliga o mock |
| URL base + endpoints (`/health`, `/describe`) | onde está a API (IP do notebook) |
| Token | `Authorization: Bearer …` opcional |
| Envio: multipart ou base64 JSON + nome do campo | formato que o Grupo 8 definir no contrato |
| Caminho do texto na resposta | ex.: `description` ou `data.descricao` |
| Timeout, qualidade da imagem | desempenho |
| Atraso/falha simulados | testar telas de carregamento e erro |
| Idioma/velocidade da voz | TTS |

Botão **Testar conexão** chama o endpoint de saúde.

### Testar o modo API sem o backend real

```bash
npm run mock-server      # sobe http://0.0.0.0:8000 (/health e /describe)
```
No app: desligue o mock, use `http://<IP-do-notebook>:8000` (celular e notebook na mesma rede/hotspot).

## Estrutura

```
src/config/     settings.ts (defaults + persistência), SettingsContext
src/services/   api.ts (escolhe mock/HTTP), mockApi.ts, httpApi.ts, tts.ts, metrics.ts
src/hooks/      useDescribeFlow.ts (escolher imagem → API → TTS → métricas)
src/screens/    HomeScreen, MetricsScreen, SettingsScreen
tools/          mock-server.js
```

Para trocar o contrato da API, mexa só em `src/services/httpApi.ts` (e nos Ajustes).

## Métricas do relatório (aba Métricas)

- **Tempo até o áudio**: do envio da imagem até o início da fala (não inclui o tempo do usuário tirando a foto).
- **Tempo da requisição**: rede + processamento no servidor — mostra qual etapa domina a latência.
- **Falhas de rede**: contagem e taxa, com tipo do erro.
- **Passos de interação**: toques até obter a resposta (câmera = 1, galeria = 2).
- Exportação em CSV pelo botão da aba.

## Próximos passos

- Fonte de imagem do XIAO ESP32-S3 Sense (Wi-Fi) no lugar da câmera do celular.
- Ajustar contrato JSON quando o Grupo 8 fechar (objetos, OCR, rostos).
- Comando único por voz/gesto para reduzir passos.
