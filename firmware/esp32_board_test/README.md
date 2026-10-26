# Teste de bancada do ESP32 (sem sensor)

Sketch simples pra validar a placa ESP32 sozinha — Wi-Fi + LED — antes de
montar o sensor e partir pro firmware completo
(`firmware/esp32_rcwl1655`). Útil toda vez que chegar uma placa nova.

## O que você precisa

- O ESP32 (DevKit V1 / DOIT, como o seu — sem antena externa, já tem
  antena PCB embutida no módulo).
- Cabo USB (micro-USB neste modelo). Nada de sensor ainda.
- [Arduino IDE](https://www.arduino.cc/en/software) com suporte a placas
  ESP32 instalado (Boards Manager → procure "esp32" → instale o pacote da
  Espressif, se ainda não tiver dessa vez anterior).

## Passo a passo

1. Abra `esp32_board_test.ino` no Arduino IDE.
2. Preencha `WIFI_SSID` e `WIFI_PASSWORD` no topo do arquivo (sua rede
   precisa ser **2,4GHz** — o ESP32 não conecta em Wi-Fi 5GHz).
3. Conecte o ESP32 pelo cabo USB.
4. Em **Ferramentas → Placa**, selecione "ESP32 Dev Module" (ou "DOIT
   ESP32 DEVKIT V1", se aparecer na lista).
5. Em **Ferramentas → Porta**, selecione a porta USB que apareceu quando
   ligou a placa.
6. Clique em **Carregar** (upload). Se pedir, segure o botão **BOOT** na
   placa durante o início da gravação (alguns clones precisam disso —
   se der erro de "Failed to connect", tente de novo segurando o BOOT).
7. Abra o **Monitor Serial** (115200 baud).

## O que esperar

- 3 piscadas lentas do LED embutido assim que liga = firmware rodando.
- No Monitor Serial, a sequência de pontos enquanto conecta no Wi-Fi.
- Se conectar: mais 5 piscadas lentas + o IP e o RSSI (força do sinal)
  impressos no Monitor Serial. Depois disso o LED fica piscando rápido
  continuamente — é só o "sinal de vida", normal.
- Se não conectar em 20s: mensagem avisando pra conferir SSID/senha e se
  a rede é 2,4GHz.

Se chegou até aqui com o IP aparecendo, a placa está 100% — pode seguir
pro `firmware/esp32_rcwl1655` pra ligar o sensor de verdade.

## Se o LED não piscar

Alguns clones de ESP32 DevKit V1 usam um GPIO diferente pro LED embutido
(ou não têm LED embutido nenhum). Isso **não** significa que a placa está
com defeito — o teste de Wi-Fi no Monitor Serial continua valendo mesmo
sem o LED piscar. Se quiser confirmar visualmente mesmo assim, troque
`LED_PIN` no topo do `.ino` pra `GPIO 4` ou `GPIO 16`, que são outras
opções comuns nesses clones.
