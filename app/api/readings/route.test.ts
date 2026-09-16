import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();
const getSensorAuthMock = vi.fn();
const notifyMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/services/sensorService", () => ({ getSensorAuth: getSensorAuthMock }));
vi.mock("@/services/notificationService", () => ({
  notifyIfEnteredCritical: notifyMock,
}));

const { POST } = await import("./route");

function makeRequest(body: unknown, apiKey?: string) {
  return new Request("http://localhost/api/readings", {
    method: "POST",
    headers: apiKey ? { "x-api-key": apiKey } : {},
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  sqlMock.mockReset();
  getSensorAuthMock.mockReset();
  notifyMock.mockReset();
});

describe("POST /api/readings", () => {
  it("rejects when sensor_id is missing", async () => {
    const response = await POST(makeRequest({ water_level: 50 }, "any"));

    expect(response.status).toBe(400);
    expect(getSensorAuthMock).not.toHaveBeenCalled();
  });

  it("rejects (401) when the sensor does not exist", async () => {
    getSensorAuthMock.mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ sensor_id: "SN-X", water_level: 50 }, "wrong"));

    expect(response.status).toBe(401);
  });

  it("rejects (401) when the api key does not match the sensor's secret", async () => {
    getSensorAuthMock.mockResolvedValueOnce({ reservoirId: "res-1", secret: "correct-secret" });

    const response = await POST(
      makeRequest({ sensor_id: "SN-X", water_level: 50 }, "totally-wrong-key")
    );

    expect(response.status).toBe(401);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("rejects (422) when the sensor has no reservoir linked", async () => {
    getSensorAuthMock.mockResolvedValueOnce({ reservoirId: null, secret: "correct-secret" });

    const response = await POST(
      makeRequest({ sensor_id: "SN-X", water_level: 50 }, "correct-secret")
    );

    expect(response.status).toBe(422);
  });

  it("accepts a valid reading, stores it, and checks for a critical transition", async () => {
    getSensorAuthMock.mockResolvedValueOnce({ reservoirId: "res-1", secret: "correct-secret" });
    sqlMock.mockResolvedValueOnce([{ water_level: "80" }]); // previous reading lookup
    sqlMock.mockResolvedValueOnce([]); // insert

    const response = await POST(
      makeRequest({ sensor_id: "SN-X", water_level: 20, depth_cm: 30 }, "correct-secret")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(notifyMock).toHaveBeenCalledWith("res-1", 20, 80);
  });

  it("treats no previous reading as null when checking for a critical transition", async () => {
    getSensorAuthMock.mockResolvedValueOnce({ reservoirId: "res-1", secret: "correct-secret" });
    sqlMock.mockResolvedValueOnce([]); // no previous reading
    sqlMock.mockResolvedValueOnce([]); // insert

    await POST(makeRequest({ sensor_id: "SN-X", water_level: 90 }, "correct-secret"));

    expect(notifyMock).toHaveBeenCalledWith("res-1", 90, null);
  });
});
