# Firmware ESP32 + RCWL-1655 para o Hydro Pulse

## O que você precisa

- Um ESP32 (qualquer modelo com Wi-Fi).
- O sensor RCWL-1655 (ou qualquer sensor ultrassônico compatível com a
  interface Trig/Echo do HC-SR04).
- Dois resistores para o divisor de tensão do pino Echo (1kΩ e 1,5kΩ) —
  veja o comentário no topo do arquivo `.ino` para o esquema de ligação.
- [Arduino IDE](https://www.arduino.cc/en/software) com o suporte a placas
  ESP32 instalado (Boards Manager → procure "esp32" → instale o pacote da
  Espressif).

## Quando o material chegar

1. **Montar o divisor de tensão** no pino Echo, seguindo o esquema no topo
   do `.ino`:
   - Echo (5V) → resistor de 1kΩ → ponto médio (vai para o GPIO18) →
     resistor de 1,5kΩ → GND.
   - Esse divisor entrega ~3,0V no GPIO18, seguro para o ESP32.
2. **Ligar o RCWL-1655 ao ESP32**:
   - VCC → 5V (ou VIN)
   - GND → GND
   - Trig → GPIO5
   - Echo → ponto médio do divisor (não direto no GPIO18)
3. **Preencher as constantes** no topo do `.ino` (Wi-Fi, `API_URL`,
   `SENSOR_API_KEY`, `SENSOR_ID`, profundidade/altura do reservatório) —
   veja o passo a passo abaixo.
4. **Gravar o firmware** no ESP32 pelo Arduino IDE e abrir o Monitor Serial
   para conferir se as leituras e o envio estão OK.
5. **Conferir no Hydro Pulse** (tela Reservatórios/Painel) se as leituras
   estão chegando e se o nível calculado bate com a medição real do
   reservatório.
6. **Fixar o sensor** no local definitivo (topo do reservatório, apontado
   para baixo, sem obstruções) só depois de validar tudo em bancada.

## Passo a passo

1. Cadastre o **condomínio**, **bloco**, **reservatório** e **sensor** no
   Hydro Pulse normalmente (pela interface web).
2. Anote:
   - O **número de série** do sensor (tela Sensores).
   - A **chave do sensor**, mostrada uma única vez logo depois de cadastrar
     (ou em "Gerar nova chave", no menu do sensor, se precisar ver de novo —
     isso invalida a chave anterior). Cada sensor tem a sua própria chave,
     não existe mais uma chave única compartilhada pelo projeto.
   - A **Profundidade total** e a **Altura útil** que você cadastrou no
     reservatório (tela Reservatórios).
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
  -H "x-api-key: CHAVE_DESSE_SENSOR" \
  -d '{"sensor_id":"SN-XXXXXXXX","water_level":75,"depth_cm":150}'
```

Se voltar `{"success":true}`, o cadastro do sensor e a chave estão corretos
— o problema seria só na parte física/Wi-Fi do ESP32.
