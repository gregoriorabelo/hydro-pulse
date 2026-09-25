/*
  Hydro Pulse — leitor de nível com sensor ultrassônico RCWL-1655
  Placa: ESP32 (qualquer variante com Wi-Fi)

  Ligação do sensor (interface tipo HC-SR04: VCC / Trig / Echo / GND):
    VCC  -> 5V do ESP32 (pino "5V" ou "VIN")
    GND  -> GND do ESP32
    Trig -> GPIO 5 (TRIG_PIN)
    Echo -> GPIO 18 (ECHO_PIN), passando por um DIVISOR DE TENSÃO antes:

      Echo (5V) ---[ resistor 1kΩ ]---+--- GPIO18 (ECHO_PIN)
                                       |
                                 [ resistor 1,5kΩ ]
                                       |
                                      GND

    Isso reduz o sinal de 5V para ~3,0V, seguro para o GPIO do ESP32.

    Alternativa (se só tiver resistores de 1,5kΩ em mãos): use dois de
    1,5kΩ em série no lugar do par 1kΩ+1,5kΩ. A tensão no GPIO18 fica em
    ~2,5V — ainda segura, só um pouco mais conservadora.

  Preencha as constantes abaixo com os dados da sua rede Wi-Fi, do seu
  projeto Hydro Pulse, e do reservatório cadastrado no sistema.
*/

#include <WiFi.h>
#include <HTTPClient.h>

// ---------- Configuração de rede ----------
const char *WIFI_SSID = "NOME_DA_SUA_REDE";
const char *WIFI_PASSWORD = "SENHA_DA_SUA_REDE";

// ---------- Configuração do Hydro Pulse ----------
// URL do seu app na Vercel + o endpoint de leituras.
const char *API_URL = "https://SEU-APP.vercel.app/api/readings";

// Chave própria deste sensor, mostrada uma única vez na tela "Sensores"
// do Hydro Pulse logo depois de cadastrar o sensor (ou ao gerar uma nova
// chave, se perder a anterior). Cada sensor tem a sua — não é compartilhada.
const char *SENSOR_API_KEY = "COLE_AQUI_A_CHAVE_DESTE_SENSOR";

// Número de série cadastrado na tela "Sensores" do Hydro Pulse
// (o mesmo valor que aparece no campo "Número de série" lá).
const char *SENSOR_ID = "SN-XXXXXXXX";

// ---------- Dimensões do reservatório ----------
// Use os MESMOS valores que você cadastrou na tela "Reservatórios".
// Profundidade total: distância do sensor (no topo) até o fundo do reservatório, em cm.
const float RESERVOIR_TOTAL_DEPTH_CM = 200.0;
// Altura útil: até onde o nível realmente varia (normalmente igual à profundidade total).
const float RESERVOIR_USEFUL_HEIGHT_CM = 200.0;

// ---------- Pinos do sensor ----------
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// Intervalo entre leituras (ms). Ajuste conforme o "Intervalo entre leituras"
// configurado no reservatório.
const unsigned long READING_INTERVAL_MS = 5UL * 60UL * 1000UL; // 5 minutos

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  connectWiFi();
}

void loop() {
  float distanceCm = measureDistanceCm();

  if (distanceCm < 0) {
    Serial.println("Falha na leitura do sensor (fora de alcance ou sem eco).");
  } else {
    float waterColumnCm = RESERVOIR_TOTAL_DEPTH_CM - distanceCm;
    if (waterColumnCm < 0) waterColumnCm = 0;

    float levelPercent = (waterColumnCm / RESERVOIR_USEFUL_HEIGHT_CM) * 100.0;
    if (levelPercent < 0) levelPercent = 0;
    if (levelPercent > 100) levelPercent = 100;

    Serial.printf(
      "Distância medida: %.1f cm | Coluna d'água: %.1f cm | Nível: %.1f%%\n",
      distanceCm, waterColumnCm, levelPercent
    );

    sendReading(levelPercent, waterColumnCm);
  }

  delay(READING_INTERVAL_MS);
}

void connectWiFi() {
  Serial.printf("Conectando ao Wi-Fi \"%s\"...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Conectado. IP: ");
  Serial.println(WiFi.localIP());
}

// Retorna a distância medida em centímetros, ou -1 se não houver eco.
float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Timeout de 30ms (~5m de alcance, com folga)
  unsigned long durationUs = pulseIn(ECHO_PIN, HIGH, 30000UL);

  if (durationUs == 0) {
    return -1;
  }

  // Velocidade do som ~343 m/s -> 0.0343 cm/us; dividido por 2 (ida e volta).
  return (durationUs * 0.0343) / 2.0;
}

void sendReading(float levelPercent, float depthCm) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi desconectado, tentando reconectar...");
    connectWiFi();
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", SENSOR_API_KEY);

  char payload[200];
  snprintf(
    payload, sizeof(payload),
    "{\"sensor_id\":\"%s\",\"water_level\":%.1f,\"depth_cm\":%.1f}",
    SENSOR_ID, levelPercent, depthCm
  );

  int statusCode = http.POST(payload);

  if (statusCode > 0) {
    Serial.printf("Envio OK. Status: %d | Resposta: %s\n", statusCode, http.getString().c_str());
  } else {
    Serial.printf("Falha no envio: %s\n", http.errorToString(statusCode).c_str());
  }

  http.end();
}
