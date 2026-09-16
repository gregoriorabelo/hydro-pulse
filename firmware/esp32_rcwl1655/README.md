# Firmware ESP32 + RCWL-1655 para o Hydro Pulse

## O que você precisa

- Um ESP32 (qualquer modelo com Wi-Fi).
- O sensor RCWL-1655 (ou qualquer sensor ultrassônico compatível com a
  interface Trig/Echo do HC-SR04).
- Dois resistores para o divisor de tensão do pino Echo (ex.: 1kΩ e 2kΩ) —
  veja o comentário no topo do arquivo `.ino` para o esquema de ligação.
- [Arduino IDE](https://www.arduino.cc/en/software) com o suporte a placas
  ESP32 instalado (Boards Manager → procure "esp32" → instale o pacote da
  Espressif).

## Passo a passo

1. Cadastre o **condomínio**, **bloco**, **reservatório** e **sensor** no
   Hydro Pulse normalmente (pela interface web).
2. Anote:
   - O **número de série** do sensor (tela Sensores).
   - A **Profundidade total** e a **Altura útil** que você cadastrou no
     reservatório (tela Reservatórios).
   - A sua `SENSOR_API_KEY` (a mesma configurada na Vercel).
3. Abra `esp32_rcwl1655.ino` no Arduino IDE.
4. Preencha as constantes no topo do arquivo:
   - `WIFI_SSID` / `WIFI_PASSWORD`
   - `API_URL` (a URL do seu app na Vercel + `/api/readings`)
   - `SENSOR_API_KEY`
   - `SENSOR_ID` (o número de série do sensor cadastrado)
   - `RESERVOIR_TOTAL_DEPTH_CM` / `RESERVOIR_USEFUL_HEIGHT_CM`
5. Selecione a placa correta em **Ferramentas → Placa** (ex.: "ESP32 Dev
   Module") e a porta USB correspondente.
6. Clique em **Carregar** (upload).
7. Abra o **Monitor Serial** (115200 baud) para ver as leituras e a
   confirmação de envio.

## Testando sem o sensor físico ainda

Se quiser testar o envio antes de montar o sensor, dá pra simular uma
leitura direto pelo terminal:

```bash
curl -X POST https://SEU-APP.vercel.app/api/readings \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_SENSOR_API_KEY" \
  -d '{"sensor_id":"SN-XXXXXXXX","water_level":75,"depth_cm":150}'
```

Se voltar `{"success":true}`, o cadastro do sensor e a chave estão corretos
— o problema seria só na parte física/Wi-Fi do ESP32.
