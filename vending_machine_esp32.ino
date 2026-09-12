#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include <string.h>

// ---- WiFi credentials (ESP32 and laptop must be on the SAME network) ----
const char* ssid     = "Dathan";
const char* password = "00000000";

// ---- Two servo sections, with two products per section ----
Servo servo1, servo2;
const int servoPin1 = 13;
const int servoPin2 = 27;

// Positions tested with the single-servo test sketch.
const int neutralAngle = 60;
const int leftAngle    = 120;
const int rightAngle   = 0;
const int dispenseDelay = 700; // ms servo stays open before resetting

WebServer server(80);

void addCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void dispense(Servo &servo, const char* direction) {
  int targetAngle = strcmp(direction, "left") == 0 ? leftAngle : rightAngle;
  servo.write(targetAngle);
  delay(dispenseDelay);
  servo.write(neutralAngle);
}

void handleDispense() {
  addCorsHeaders();

  if (!server.hasArg("servo") || !server.hasArg("direction")) {
    server.send(400, "text/plain", "Missing servo or direction parameter");
    return;
  }

  int servoNumber = server.arg("servo").toInt();
  String direction = server.arg("direction");
  if (direction != "left" && direction != "right") {
    server.send(400, "text/plain", "Invalid direction");
    return;
  }

  switch (servoNumber) {
    case 1: dispense(servo1, direction.c_str()); break;
    case 2: dispense(servo2, direction.c_str()); break;
    default:
      server.send(400, "text/plain", "Invalid servo");
      return;
  }

  server.send(200, "text/plain", "Dispensed servo " + String(servoNumber) + " " + direction);
}

void handleOptions() {
  addCorsHeaders();
  server.send(204);
}

void handleRoot() {
  addCorsHeaders();
  server.send(200, "text/plain", "Vending machine online. Use /status to test or /dispense?servo=1&direction=left to dispense.");
}

void handleStatus() {
  addCorsHeaders();
  server.send(200, "text/plain", "Vending machine online");
}

void handleNotFound() {
  addCorsHeaders();
  server.send(404, "text/plain", "Not found");
}

void setup() {
  Serial.begin(115200);

  servo1.attach(servoPin1);
  servo2.attach(servoPin2);
  servo1.write(neutralAngle);
  servo2.write(neutralAngle);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected. ESP32 IP address: ");
  Serial.println(WiFi.localIP());  // <-- use this IP in your website's fetch() calls

  server.on("/", HTTP_GET, handleRoot);
  server.on("/dispense", HTTP_GET, handleDispense);
  server.on("/dispense", HTTP_OPTIONS, handleOptions);
  server.on("/status", HTTP_GET, handleStatus);
  server.onNotFound(handleNotFound);
  server.begin();
}

void loop() {
  server.handleClient();
}
