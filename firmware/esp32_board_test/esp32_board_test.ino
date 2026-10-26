/*
  Hydro Pulse — teste de bancada da placa ESP32 (antes de ligar o sensor)
  Placa: ESP32 DevKit V1 / DOIT ESP32-WROOM-32 (sem antena externa)

  Objetivo: confirmar que a placa funciona e conecta no Wi-Fi, SEM mexer
  com sensor nenhum ainda. Só precisa do cabo USB.

  O que o sketch faz:
    - Pisca o LED embutido da placa (GPIO2) pra provar que o firmware
      está rodando.
    - Conecta na sua rede Wi-Fi e imprime o IP recebido no Monitor Serial.
    - Fica piscando mais rápido assim que conecta, pra dar um feedback
      visual (sem precisar olhar o Monitor Serial o tempo todo).

  Preencha WIFI_SSID / WIFI_PASSWORD abaixo antes de gravar.
*/

#include <WiFi.h>

const char *WIFI_SSID = "NOME_DA_SUA_REDE";
const char *WIFI_PASSWORD = "SENHA_DA_SUA_REDE";

// LED embutido da maioria dos clones DOIT ESP32 DevKit V1. Se o seu não
// piscar, veja a seção "Se o LED não piscar" no README desta pasta.
const int LED_PIN = 2;

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(LED_PIN, OUTPUT);

  Serial.println();
  Serial.println("=== Hydro Pulse — teste de bancada do ESP32 ===");

  blinkSlow(3); // 3 piscadas lentas = "ligou, começando o teste"

  connectWiFi();
}

void loop() {
  // Depois de conectado, pisca rápido só pra indicar vida.
  digitalWrite(LED_PIN, HIGH);
  delay(150);
  digitalWrite(LED_PIN, LOW);
  delay(150);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi caiu, tentando reconectar...");
    connectWiFi();
  }
}

void connectWiFi() {
  Serial.printf("Conectando ao Wi-Fi \"%s\"...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startMs = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startMs < 20000UL) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Conectado! IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI (força do sinal): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    blinkSlow(5); // 5 piscadas lentas = "conectou no Wi-Fi"
  } else {
    Serial.println("Não conectou em 20s — confira SSID/senha e se a rede é 2,4GHz.");
  }
}

void blinkSlow(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(300);
    digitalWrite(LED_PIN, LOW);
    delay(300);
  }
}
