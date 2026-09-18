import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("bcryptjs", () => ({ hash: vi.fn(async () => "hashed") }));

const { listUsers, getUserById } = await import("./userService");

beforeEach(() => {
  sqlMock.mockReset();
});

describe("listUsers", () => {
  it("attaches each user only their own condominium access rows", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: "u1", name: "Admin", email: "admin@teste.com", role: "admin", created_at: "t1" },
      { id: "u2", name: "Operador", email: "op@teste.com", role: "operador", created_at: "t2" },
    ]);
    sqlMock.mockResolvedValueOnce([
      { user_id: "u2", condominium_id: "c1", condominium_name: "Condo A", role: "operador" },
      { user_id: "u2", condominium_id: "c2", condominium_name: "Condo B", role: "visualizador" },
    ]);

    const users = await listUsers();

    expect(users).toHaveLength(2);
    expect(users[0].condominiums).toEqual([]);
    expect(users[1].condominiums).toHaveLength(2);
    expect(users[1].condominiums.map((c) => c.condominiumName)).toEqual([
      "Condo A",
      "Condo B",
    ]);
  });

  it("returns an empty array without querying access rows when there are no users", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const users = await listUsers();

    expect(users).toEqual([]);
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });
});

describe("getUserById", () => {
  it("returns null for an unknown id", async () => {
    sqlMock.mockResolvedValueOnce([]);

    expect(await getUserById("missing")).toBeNull();
  });

  it("returns the user with their condominium access attached", async () => {
    sqlMock.mockResolvedValueOnce([
      { id: "u1", name: "Admin", email: "admin@teste.com", role: "admin", created_at: "t1" },
    ]);
    sqlMock.mockResolvedValueOnce([
      { user_id: "u1", condominium_id: "c1", condominium_name: "Condo A", role: "admin" },
    ]);

    const user = await getUserById("u1");

    expect(user?.email).toBe("admin@teste.com");
    expect(user?.condominiums).toHaveLength(1);
  });
});
